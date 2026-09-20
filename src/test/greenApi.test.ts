import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkAccount,
  sendMessage,
  receiveNotification,
  deleteNotification,
  readChat,
  getChatHistory,
  ApiError,
} from 'api/greenApi';

const creds = { idInstance: '1101000000', apiTokenInstance: 'token-abc' };

function mockFetchOnce(response: Partial<Response>) {
  return vi.fn().mockResolvedValueOnce(response);
}

function jsonResponse(data: unknown, status = 200): Partial<Response> {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

function textResponse(body: string, status = 200): Partial<Response> {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body),
    json: () => Promise.resolve(JSON.parse(body)),
  };
}

describe('greenApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('checkAccount', () => {
    it('возвращает chatId при успешной проверке', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce(
          jsonResponse({ exist: true, chatId: '79991234567', fromCache: false })
        )
      );

      const result = await checkAccount(creds, '79991234567');
      expect(result.exist).toBe(true);
      expect(result.chatId).toBe('79991234567');
    });

    it('возвращает exist: false для незарегистрированного номера', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce(jsonResponse({ exist: false, chatId: '', fromCache: false }))
      );

      const result = await checkAccount(creds, '79990000000');
      expect(result.exist).toBe(false);
    });

    it('бросает ApiError при 401', async () => {
      vi.stubGlobal('fetch', mockFetchOnce(jsonResponse({}, 401)));

      await expect(checkAccount(creds, '79991234567')).rejects.toThrow(ApiError);
    });
  });

  describe('sendMessage', () => {
    it('возвращает idMessage при успехе', async () => {
      vi.stubGlobal('fetch', mockFetchOnce(jsonResponse({ idMessage: '1763115112345' })));

      const result = await sendMessage(creds, 'chat123', 'Привет');
      expect(result.idMessage).toBe('1763115112345');
    });

    it('делает повторный запрос при 429 и succeeds', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({}, 429))
        .mockResolvedValueOnce(jsonResponse({ idMessage: 'retry-ok' }));
      vi.stubGlobal('fetch', fetchMock);

      const result = await sendMessage(creds, 'chat123', 'Привет');
      expect(result.idMessage).toBe('retry-ok');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    }, 10000);

    it('бросает ApiError после 4 неудачных попыток при 429', async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, 429));
      vi.stubGlobal('fetch', fetchMock);

      await expect(sendMessage(creds, 'chat123', 'Привет')).rejects.toThrow(ApiError);

      expect(fetchMock).toHaveBeenCalledTimes(4);
    }, 20000);
  });

  describe('receiveNotification', () => {
    it('возвращает null при пустом теле (таймаут long polling)', async () => {
      vi.stubGlobal('fetch', mockFetchOnce(textResponse('', 200)));

      const result = await receiveNotification(creds, 10);
      expect(result).toBeNull();
    });

    it('возвращает null при теле "null"', async () => {
      vi.stubGlobal('fetch', mockFetchOnce(textResponse('null', 200)));

      const result = await receiveNotification(creds, 10);
      expect(result).toBeNull();
    });

    it('парсит и возвращает уведомление', async () => {
      const notification = {
        receiptId: 123,
        body: {
          typeWebhook: 'incomingMessageReceived',
          idMessage: 'msg-1',
          timestamp: 1704119400,
          senderData: {
            chatId: '79991234567',
            chatName: 'Иван',
            sender: '79991234567',
            senderName: 'Иван',
          },
          messageData: {
            typeMessage: 'textMessage',
            textMessageData: { textMessage: 'Привет!' },
          },
          instanceData: {
            idInstance: 1101000000,
            wid: '79991234567',
            typeInstance: 'max',
          },
        },
      };

      vi.stubGlobal('fetch', mockFetchOnce(jsonResponse(notification)));

      const result = await receiveNotification(creds, 10);
      expect(result?.receiptId).toBe(123);
      expect(result?.body.typeWebhook).toBe('incomingMessageReceived');
    });

    it('возвращает null при невалидном JSON', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          text: () => Promise.resolve('not-valid-json{{'),
        })
      );

      const result = await receiveNotification(creds, 10);
      expect(result).toBeNull();
    });

    it('возвращает null при 500 (не роняет polling)', async () => {
      vi.stubGlobal('fetch', mockFetchOnce(jsonResponse({}, 500)));

      const result = await receiveNotification(creds, 10);
      expect(result).toBeNull();
    });
  });

  describe('deleteNotification', () => {
    it('возвращает result: true при успехе', async () => {
      vi.stubGlobal('fetch', mockFetchOnce(jsonResponse({ result: true })));

      const result = await deleteNotification(creds, 123);
      expect(result.result).toBe(true);
    });
  });

  describe('getChatHistory', () => {
    it('возвращает массив сообщений', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce(
          jsonResponse([
            {
              type: 'incoming',
              idMessage: 'msg-1',
              timestamp: 1704119400,
              typeMessage: 'textMessage',
              chatId: '79991234567',
              textMessage: 'Привет',
            },
          ])
        )
      );

      const result = await getChatHistory(creds, '79991234567', 100);
      expect(result).toHaveLength(1);
      expect(result?.[0]!.textMessage).toBe('Привет');
    });

    it('возвращает null при пустом ответе', async () => {
      vi.stubGlobal('fetch', mockFetchOnce(jsonResponse(null)));

      const result = await getChatHistory(creds, '79991234567', 100);
      expect(result).toBeNull();
    });
  });

  describe('readChat', () => {
    it('возвращает result: true при успехе', async () => {
      vi.stubGlobal('fetch', mockFetchOnce(jsonResponse({ result: true })));

      const result = await readChat(creds, '79991234567');
      expect(result.result).toBe(true);
    });

    it('не бросает при 466 QUOTE_EXCEEDED, возвращает result: false', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 466,
          json: () =>
            Promise.resolve({
              invokeStatus: {
                method: 'readchat',
                status: 'QUOTE_EXCEEDED',
                used: 100,
                total: 100,
                description: 'Ежемесячная квота превышена',
              },
            }),
        })
      );

      const result = await readChat(creds, '79991234567');
      expect(result.result).toBe(false);
      expect(result.invokeStatus?.status).toBe('QUOTE_EXCEEDED');
    });
  });
});
