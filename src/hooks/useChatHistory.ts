import { useState, useCallback, useRef } from 'react';
import { getChatHistory, readChat, ApiError } from 'api/greenApi';
import type { Message } from 'types/chat';
import type { ChatHistoryItem } from 'types/api';
import { hasAttemptedReadChat, markReadChatAttempted } from 'utils/readChatCache';

interface UseChatHistoryResult {
  messages: Message[];
  loading: boolean;
  error: string | null;
  loadHistory: (chatId: string, hasUnread?: boolean) => Promise<Message[]>;
  appendMessage: (message: Message) => void;
}
interface UseChatHistoryParams {
  idInstance: string;
  apiTokenInstance: string;
}

function mapHistoryItem(item: ChatHistoryItem): Message {
  return {
    id: item.idMessage,
    text: item.textMessage ?? '',
    isOutgoing: item.type === 'outgoing',
    timestamp: item.timestamp,
    senderName: item.senderName,
    status: item.statusMessage as Message['status'],
  };
}

export function useChatHistory({
  idInstance,
  apiTokenInstance,
}: UseChatHistoryParams): UseChatHistoryResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadHistory = useCallback(
    async (chatId: string, hasUnread = false): Promise<Message[]> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      setMessages([]);

      try {
        const history = await getChatHistory(
          { idInstance, apiTokenInstance },
          chatId,
          100,
          controller.signal
        );

        if (controller.signal.aborted) return [];

        const sorted = (history ?? []).slice().reverse().map(mapHistoryItem);
        setMessages(sorted);

        if (hasUnread && !hasAttemptedReadChat(chatId)) {
          markReadChatAttempted(chatId);
          const result = await readChat(
            { idInstance, apiTokenInstance },
            chatId,
            controller.signal
          );

          if (!result.result && result.invokeStatus) {
            setError(
              'Лимит на отметку прочитанных исчерпан. Обновите тариф в личном кабинете GREEN-API.'
            );
          }
        }

        return sorted;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return [];
        }
        if (err instanceof ApiError && err.status === 429) {
          setError('Слишком много запросов. Подождите немного.');
        } else {
          setError('Не удалось загрузить историю.');
        }
        console.error('Failed to load history:', err);
        return [];
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [idInstance, apiTokenInstance]
  );

  const appendMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return { messages, loading, loadHistory, appendMessage, error };
}
