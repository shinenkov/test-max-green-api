import { useRef, useMemo, useLayoutEffect, type ReactNode } from 'react';
import { Avatar, Spin, Empty, Button, Tooltip, Alert } from 'antd';
import { MessageInput } from '../MessageInput/MessageInput';
import { useAuth } from 'hooks/useAuth';
import type { Message, Chat } from 'types/chat';
import { formatTime } from 'utils/formatters';
import {
  LeftOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { groupByDate } from 'utils/groupByDate';
import './styles.css';

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  loading: boolean;
  error?: string | null;
  onSent: (message: Message) => void;
  onCloseChat: () => void;
}

export function ChatWindow({
  chat,
  messages,
  loading,
  error,
  onSent,
  onCloseChat,
}: ChatWindowProps) {
  const { state } = useAuth();
  const { apiUrl, idInstance, apiTokenInstance } = state;

  const scrollRef = useRef<HTMLDivElement>(null);
  const prevChatIdRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (loading) return;

    const isChatChanged = prevChatIdRef.current !== chat.id;
    prevChatIdRef.current = chat.id;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: isChatChanged ? 'auto' : 'smooth',
    });
  }, [chat.id, messages.length, loading]);

  const grouped = useMemo(() => groupByDate(messages), [messages]);
  const headerName = chat.name ?? chat.phoneNumber;

  return (
    <div className="chat-window">
      <header className="chat-window__header">
        <Tooltip title="Закрыть">
          <Button
            type="text"
            shape="default"
            icon={<LeftOutlined />}
            onClick={onCloseChat}
          />
        </Tooltip>
        <Avatar src={chat.avatarUrl} icon={<UserOutlined />} size={40} />
        <div className="chat-window__header-info">
          <div className="chat-window__header-name">{headerName}</div>
          <div className="chat-window__header-phone">{chat.phoneNumber}</div>
        </div>
      </header>

      <div className="chat-window__messages">
        <div className="chat-window__messages-cropped">
          <div className="chat-window__messages-scroll" ref={scrollRef}>
            <div className="chat-window__messages-content">
              {loading ? (
                <div className="chat-window__loader">
                  <Spin size="large" />
                </div>
              ) : messages.length === 0 ? (
                <Empty
                  description="Пока нет сообщений. Напишите первым!"
                  className="chat-window__empty"
                />
              ) : (
                grouped.map(({ dateKey, dateLabel, items }) => (
                  <div key={dateKey} className="chat-window__group">
                    <div className="chat-window__date-separator">{dateLabel}</div>
                    {items.map((msg) => (
                      <MessageBubble key={msg.id} message={msg} />
                    ))}
                  </div>
                ))
              )}
              {error && (
                <Alert
                  type="warning"
                  title={error}
                  showIcon
                  closable
                  style={{ marginBottom: 12 }}
                />
              )}
            </div>
          </div>
        </div>
        <footer className="chat-window__footer">
          <MessageInput
            apiUrl={apiUrl}
            idInstance={idInstance}
            apiTokenInstance={apiTokenInstance}
            chatId={chat.id}
            onSent={onSent}
          />
        </footer>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function statusToTitle(status: NonNullable<Message['status']>): string {
  switch (status) {
    case 'pending':
      return 'Отправляется';
    case 'sent':
      return 'Отправлено';
    case 'delivered':
      return 'Доставлено';
    case 'read':
      return 'Прочитано';
    case 'failed':
      return 'Не доставлено';
  }
}

function statusToIcon(status: NonNullable<Message['status']>): ReactNode {
  switch (status) {
    case 'pending':
      return <ClockCircleOutlined />;
    case 'sent':
      return <CheckOutlined />;
    case 'delivered':
      return <CheckCircleOutlined />;
    case 'read':
      return <CheckCircleFilled />;
    case 'failed':
      return <CloseCircleOutlined />;
  }
}

function MessageBubble({ message }: MessageBubbleProps) {
  const classNames = [
    'message-bubble',
    message.isOutgoing ? 'message-bubble--outgoing' : 'message-bubble--incoming',
  ].join(' ');

  return (
    <div className={classNames}>
      <div className="message-bubble__text">{message.text}</div>
      <div className="message-bubble__meta">
        <span className="message-bubble__time">{formatTime(message.timestamp)}</span>
        {message.isOutgoing && message.status && (
          <Tooltip title={statusToTitle(message.status)}>
            <span
              className={`message-bubble__status message-bubble__status--${message.status}`}
              aria-label={statusToTitle(message.status)}
            >
              {statusToIcon(message.status)}
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
