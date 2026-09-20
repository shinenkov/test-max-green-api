import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNotifications } from 'hooks/useNotifications';
import * as greenApi from 'api/greenApi';
import type { NotificationBody } from 'types/api';

vi.mock('api/greenApi', async () => {
  const actual = await vi.importActual<typeof greenApi>('api/greenApi');
  return {
    ...actual,
    receiveNotification: vi.fn(),
    deleteNotification: vi.fn(),
  };
});

const creds = { idInstance: '1', apiTokenInstance: 't' };

function textNotification(
  receiptId: number,
  chatId: string,
  text: string
): NotificationBody {
  return {
    receiptId,
    body: {
      typeWebhook: 'incomingMessageReceived',
      idMessage: `msg-${receiptId}`,
      timestamp: 1704119400,
      instanceData: { idInstance: 1, wid: '1', typeInstance: 'max' },
      senderData: {
        chatId,
        chatName: 'User',
        sender: chatId,
        senderName: 'User',
      },
      messageData: {
        typeMessage: 'textMessage',
        textMessageData: { textMessage: text },
      },
    },
  };
}

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('вызывает onNewMessage для входящего текстового сообщения', async () => {
    const onNewMessage = vi.fn();
    vi.mocked(greenApi.receiveNotification)
      .mockResolvedValueOnce(textNotification(1, 'chat-a', 'Привет'))
      .mockResolvedValue(null);
    vi.mocked(greenApi.deleteNotification).mockResolvedValue({ result: true });

    renderHook(() =>
      useNotifications({
        ...creds,
        onNewMessage,
        pollIntervalMs: 60_000,
      })
    );

    await waitFor(() => {
      expect(onNewMessage).toHaveBeenCalledWith(
        'chat-a',
        expect.objectContaining({ text: 'Привет' })
      );
    });
  });

  it('удаляет уведомление ДО вызова onNewMessage', async () => {
    const onNewMessage = vi.fn();
    vi.mocked(greenApi.receiveNotification)
      .mockResolvedValueOnce(textNotification(1, 'chat-a', 'Привет'))
      .mockResolvedValue(null);
    vi.mocked(greenApi.deleteNotification).mockResolvedValue({ result: true });

    renderHook(() =>
      useNotifications({
        ...creds,
        onNewMessage,
        pollIntervalMs: 60_000,
      })
    );

    await waitFor(() => {
      expect(greenApi.deleteNotification).toHaveBeenCalledWith(creds, 1);
      expect(onNewMessage).toHaveBeenCalled();
    });
  });

  it('игнорирует не-текстовые уведомления, но всё равно удаляет их', async () => {
    vi.mocked(greenApi.receiveNotification)
      .mockResolvedValueOnce({
        receiptId: 1,
        body: {
          typeWebhook: 'outgoingMessageStatus',
          idMessage: 'msg-1',
          timestamp: 1704119400,
          instanceData: { idInstance: 1, wid: '1', typeInstance: 'max' },
          senderData: {
            chatId: 'chat-a',
            chatName: '',
            sender: '',
            senderName: '',
          },
          messageData: { typeMessage: 'textMessage' },
        },
      })
      .mockResolvedValue(null);
    vi.mocked(greenApi.deleteNotification).mockResolvedValue({ result: true });

    const onNewMessage = vi.fn();
    renderHook(() =>
      useNotifications({
        ...creds,
        onNewMessage,
        pollIntervalMs: 60_000,
      })
    );

    await waitFor(() => {
      expect(greenApi.deleteNotification).toHaveBeenCalledWith(creds, 1);
    });

    expect(onNewMessage).not.toHaveBeenCalled();
  });

  it('игнорирует изображения (не textMessage), но удаляет из очереди', async () => {
    vi.mocked(greenApi.receiveNotification)
      .mockResolvedValueOnce({
        receiptId: 1,
        body: {
          typeWebhook: 'incomingMessageReceived',
          idMessage: 'msg-1',
          timestamp: 1704119400,
          instanceData: { idInstance: 1, wid: '1', typeInstance: 'max' },
          senderData: {
            chatId: 'chat-a',
            chatName: 'User',
            sender: 'chat-a',
            senderName: 'User',
          },
          messageData: { typeMessage: 'imageMessage' },
        },
      })
      .mockResolvedValue(null);
    vi.mocked(greenApi.deleteNotification).mockResolvedValue({ result: true });

    const onNewMessage = vi.fn();
    renderHook(() =>
      useNotifications({
        ...creds,
        onNewMessage,
        pollIntervalMs: 60_000,
      })
    );

    await waitFor(() => {
      expect(greenApi.deleteNotification).toHaveBeenCalledWith(creds, 1);
    });

    expect(onNewMessage).not.toHaveBeenCalled();
  });

  it('продолжает работать при ошибке receiveNotification', async () => {
    vi.mocked(greenApi.receiveNotification)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(textNotification(2, 'chat-a', 'После ошибки'))
      .mockResolvedValue(null);
    vi.mocked(greenApi.deleteNotification).mockResolvedValue({ result: true });

    const onNewMessage = vi.fn();
    renderHook(() =>
      useNotifications({
        ...creds,
        onNewMessage,
        pollIntervalMs: 100,
      })
    );

    await waitFor(
      () => {
        expect(onNewMessage).toHaveBeenCalledWith(
          'chat-a',
          expect.objectContaining({ text: 'После ошибки' })
        );
      },
      { timeout: 2000 }
    );
  });
});
