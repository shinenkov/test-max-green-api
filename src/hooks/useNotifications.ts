import { useEffect, useRef, useCallback } from 'react';
import { receiveNotification, deleteNotification } from 'api/greenApi';
import type { Message } from 'types/chat';

interface UseNotificationsParams {
  idInstance: string;
  apiTokenInstance: string;
  onNewMessage: (chatId: string, message: Message) => void;
  pollIntervalMs?: number;
}

export function useNotifications({
  idInstance,
  apiTokenInstance,
  onNewMessage,
  pollIntervalMs = 10_000,
}: UseNotificationsParams): void {
  const isPolling = useRef(false);
  const onNewMessageRef = useRef(onNewMessage);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  const poll = useCallback(async () => {
    if (isPolling.current) return;
    isPolling.current = true;

    try {
      const notification = await receiveNotification(
        { idInstance, apiTokenInstance },
        10
      );

      if (!notification) return;

      const { receiptId, body } = notification;
      const { typeWebhook } = body;
      await deleteNotification({ idInstance, apiTokenInstance }, receiptId);

      if (
        typeWebhook === 'incomingMessageReceived' &&
        body.messageData.typeMessage === 'textMessage' &&
        body.messageData.textMessageData
      ) {
        const chatId = body.senderData.chatId;
        const message: Message = {
          id: body.idMessage,
          text: body.messageData.textMessageData.textMessage,
          senderName: body.senderData.senderName,
          timestamp: body.timestamp,
          isOutgoing: false,
        };

        onNewMessageRef.current(chatId, message);
      }
    } catch (err) {
      console.error('Polling error:', err);
    } finally {
      isPolling.current = false;
    }
  }, [idInstance, apiTokenInstance]);

  useEffect(() => {
    const intervalId = window.setInterval(poll, pollIntervalMs);
    void poll();
    return () => window.clearInterval(intervalId);
  }, [poll, pollIntervalMs]);
}
