import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from 'hooks/useAuth';
import { useNotifications } from 'hooks/useNotifications';
import { useChatHistory } from 'hooks/useChatHistory';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { ChatList } from '../ChatList/ChatList';
import { ChatWindow } from '../ChatWindow/ChatWindow';
import { CreateChatForm } from '../CreateChat/CreateChat';
import type { Chat, Message } from 'types/chat';
import { MOBILE_MEDIA_QUERY } from 'constants/breakpoints';
import { CHATS_STORAGE_KEY } from 'constants/storageKeys';
import './styles.css';

export function ChatPage() {
  const { state } = useAuth();
  const { apiUrl, idInstance, apiTokenInstance } = state;

  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  function loadChatsFromStorage(): Chat[] {
    const raw = sessionStorage.getItem(CHATS_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is Chat => {
        if (typeof item !== 'object' || item === null) return false;
        const chat = item as Record<string, unknown>;
        return typeof chat.id === 'string' && typeof chat.phoneNumber === 'string';
      });
    } catch {
      return [];
    }
  }

  const [chats, setChats] = useState<Chat[]>(loadChatsFromStorage);

  useEffect(() => {
    sessionStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { messages, loading, error, loadHistory, appendMessage } = useChatHistory({
    apiUrl,
    idInstance,
    apiTokenInstance,
  });

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? null,
    [chats, activeChatId]
  );

  const handleNewMessage = useCallback(
    (chatId: string, message: Message) => {
      if (chatId === activeChatId) {
        appendMessage(message);
        // удаленно так как есть лимит на 100 прочтений в месяц,
        // сейчас readChat происходит только при получении истории
        //  и наличии непрочитанного
        // markChatAsRead(chatId);
      }

      setChats((prev) => {
        const exists = prev.some((chat) => chat.id === chatId);

        if (!exists) {
          const newChat: Chat = {
            id: chatId,
            phoneNumber: chatId,
            name: message.senderName,
            lastMessage: message.text,
            lastMessageTime: message.timestamp,
            unread: activeChatId === chatId ? 0 : 1,
          };
          return [...prev, newChat];
        }

        return prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                lastMessage: message.text,
                lastMessageTime: message.timestamp,
                unread: chatId === activeChatId ? 0 : (chat.unread ?? 0) + 1,
              }
            : chat
        );
      });
    },
    [activeChatId, appendMessage]
  );

  useNotifications({
    apiUrl,
    idInstance,
    apiTokenInstance,
    onNewMessage: handleNewMessage,
  });

  const openChat = useCallback(
    async (chatId: string) => {
      setActiveChatId(chatId);
      setShowCreateForm(false);

      const chat = chats.find((c) => c.id === chatId);
      const hasUnread = (chat?.unread ?? 0) > 0;

      const loadedMessages = await loadHistory(chatId, hasUnread);

      const lastMessage = loadedMessages[loadedMessages.length - 1];
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                unread: 0,
                ...(lastMessage
                  ? {
                      lastMessage: lastMessage.text,
                      lastMessageTime: lastMessage.timestamp,
                    }
                  : {}),
              }
            : c
        )
      );
    },
    [chats, loadHistory]
  );

  const handleChatCreated = useCallback(
    (newChat: Chat) => {
      let targetId = newChat.id;

      setChats((prev) => {
        const existing = prev.find(
          (chat) => chat.id === newChat.id || chat.phoneNumber === newChat.phoneNumber
        );
        if (existing) {
          targetId = existing.id;
          return prev;
        }
        return [...prev, newChat];
      });

      void openChat(targetId);
    },
    [openChat]
  );

  const handleMessageSent = useCallback(
    (message: Message) => {
      appendMessage(message);
      if (activeChatId) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  lastMessage: message.text,
                  lastMessageTime: message.timestamp,
                }
              : chat
          )
        );
      }
    },
    [activeChatId, appendMessage]
  );

  const handleCreateChat = useCallback(() => {
    setShowCreateForm(true);
    setActiveChatId(null);
  }, []);

  const handleCloseChat = useCallback(() => {
    setActiveChatId(null);
  }, []);

  const handleCancelCreate = useCallback(() => {
    setShowCreateForm(false);
  }, []);

  const list = (
    <ChatList
      chats={chats}
      activeChatId={activeChatId}
      onSelectChat={openChat}
      onCreateChat={handleCreateChat}
    />
  );

  const window = activeChat ? (
    <ChatWindow
      chat={activeChat}
      messages={messages}
      loading={loading}
      error={error}
      onSent={handleMessageSent}
      onCloseChat={handleCloseChat}
    />
  ) : null;

  const form = (
    <CreateChatForm
      existingChats={chats}
      onCreated={handleChatCreated}
      onSelectExisting={openChat}
      onCancel={handleCancelCreate}
    />
  );

  if (isMobile) {
    return <div className="chat-page">{showCreateForm ? form : (window ?? list)}</div>;
  }

  return (
    <div className="chat-page">
      <aside className="chat-sidebar">{list}</aside>
      <main className="chat-main">
        {showCreateForm ? (
          form
        ) : activeChat ? (
          window
        ) : (
          <div className="empty-state">Выберите чат или создайте новый</div>
        )}
      </main>
    </div>
  );
}
