import { useMemo, useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Typography,
  Empty,
  Tooltip,
  Popconfirm,
  Divider,
  Listy,
} from 'antd';
import { UserOutlined, PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from 'hooks/useAuth';
import type { Chat } from 'types/chat';
import { formatListTime } from 'utils/formatters';
import './styles.css';

const { Text, Title } = Typography;

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => void;
}

export function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
}: ChatListProps) {
  const { logout } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState<number>(0);

  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      const aTime = a.lastMessageTime ?? 0;
      const bTime = b.lastMessageTime ?? 0;
      return bTime - aTime;
    });
  }, [chats]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setListHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="chat-list">
      <header className="chat-list__header">
        <Title level={4} className="chat-list__title">
          Чаты
        </Title>
        <div className="chat-list__header-actions">
          <Tooltip title="Новый чат">
            <Button
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={onCreateChat}
            />
          </Tooltip>
          <Popconfirm
            title="Выйти из аккаунта?"
            description="Придётся заново ввести idInstance и apiTokenInstance."
            onConfirm={logout}
            okText="Выйти"
            cancelText="Отмена"
            placement="bottomRight"
          >
            <Tooltip title="Выйти">
              <Button type="text" shape="circle" icon={<LogoutOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </div>
      </header>

      <Divider style={{ margin: 0 }} />

      <div className="chat-list__scroll" ref={scrollRef}>
        {sortedChats.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Нет чатов"
            className="chat-list__empty"
          >
            <Button type="primary" onClick={onCreateChat}>
              Создать новый чат
            </Button>
          </Empty>
        ) : (
          listHeight > 0 && (
            <Listy<Chat>
              items={sortedChats}
              rowKey="id"
              height={listHeight}
              virtual
              itemRender={(chat) => (
                <ChatListItem
                  chat={chat}
                  isActive={chat.id === activeChatId}
                  onClick={() => onSelectChat(chat.id)}
                />
              )}
            />
          )
        )}
      </div>
    </div>
  );
}

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

function ChatListItem({ chat, isActive, onClick }: ChatListItemProps) {
  const displayName = chat.name ?? chat.phoneNumber;

  return (
    <div
      className={`chat-list-item ${isActive ? 'chat-list-item--active' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer', padding: '12px 16px' }}
    >
      <div className="chat-list-item__content">
        <Badge count={chat.unread} size="small" offset={[-4, 4]}>
          <Avatar src={chat.avatarUrl} icon={<UserOutlined />} size={48} />
        </Badge>

        <div className="chat-list-item__info">
          <div className="chat-list-item__top">
            <Text strong ellipsis className="chat-list-item__name">
              {displayName}
            </Text>
            {chat.lastMessageTime && (
              <Text type="secondary" className="chat-list-item__time">
                {formatListTime(chat.lastMessageTime)}
              </Text>
            )}
          </div>

          <Text type="secondary" ellipsis className="chat-list-item__preview">
            {chat.lastMessage ?? 'Нет сообщений'}
          </Text>
        </div>
      </div>
    </div>
  );
}
