import { useState, type KeyboardEvent, type ChangeEvent, useRef } from 'react';
import { Input, Button, App, Tooltip } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { sendMessage } from 'api/greenApi';
import type { Message } from 'types/chat';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import './styles.css';

const MAX_LENGTH = 4000;

interface MessageInputProps {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
  chatId: string;
  onSent: (message: Message) => void;
}

export function MessageInput({
  apiUrl,
  idInstance,
  apiTokenInstance,
  chatId,
  onSent,
}: MessageInputProps) {
  const [text, setText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const { message } = App.useApp();
  const textareaRef = useRef<TextAreaRef>(null);

  const trimmed = text.trim();
  const canSend = trimmed.length > 0 && !sending;

  const handleSend = async (): Promise<void> => {
    if (!canSend) return;

    setSending(true);
    try {
      const response = await sendMessage(
        { apiUrl, idInstance, apiTokenInstance },
        chatId,
        trimmed
      );

      onSent({
        id: response.idMessage,
        text: trimmed,
        isOutgoing: true,
        timestamp: Date.now() / 1000,
        status: 'sent',
      });

      setText('');
      textareaRef.current?.focus();
    } catch (err) {
      console.error('Send message failed:', err);
      message.error('Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setText(e.target.value);
  };

  return (
    <div className="message-input">
      <Input.TextArea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Введите сообщение..."
        autoSize={{ minRows: 1, maxRows: 5 }}
        maxLength={MAX_LENGTH}
        showCount
        variant="borderless"
        className="message-input__textarea"
      />
      <Tooltip title={!trimmed ? 'Введите текст сообщения' : undefined}>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => void handleSend()}
          disabled={!canSend}
          loading={sending}
          className="message-input__button"
        />
      </Tooltip>
    </div>
  );
}
