import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChatHistory } from 'hooks/useChatHistory';
import * as greenApi from 'api/greenApi';

vi.mock('api/greenApi', async () => {
  const actual = await vi.importActual<typeof greenApi>('api/greenApi');
  return {
    ...actual,
    getChatHistory: vi.fn(),
    readChat: vi.fn(),
  };
});

const creds = {
  apiUrl: 'https://1234.api.green-api.com',
  idInstance: '1',
  apiTokenInstance: 't',
};

describe('useChatHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('загружает историю и разворачивает порядок', async () => {
    vi.mocked(greenApi.getChatHistory).mockResolvedValue([
      {
        idMessage: '2',
        timestamp: 200,
        type: 'outgoing',
        typeMessage: 'textMessage',
        chatId: 'c',
        textMessage: 'Второе',
      },
      {
        idMessage: '1',
        timestamp: 100,
        type: 'incoming',
        typeMessage: 'textMessage',
        chatId: 'c',
        textMessage: 'Первое',
      },
    ]);
    vi.mocked(greenApi.readChat).mockResolvedValue({ result: true });

    const { result } = renderHook(() => useChatHistory(creds));

    await act(async () => {
      await result.current.loadHistory('c', false);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });
    expect(result.current.messages[0]!.text).toBe('Первое');
    expect(result.current.messages[1]!.text).toBe('Второе');
  });

  it('НЕ вызывает readChat, если hasUnread = false', async () => {
    vi.mocked(greenApi.getChatHistory).mockResolvedValue([]);
    vi.mocked(greenApi.readChat).mockResolvedValue({ result: true });

    const { result } = renderHook(() => useChatHistory(creds));

    await act(async () => {
      await result.current.loadHistory('c', false);
    });

    expect(greenApi.readChat).not.toHaveBeenCalled();
  });

  it('вызывает readChat один раз для чата с непрочитанными', async () => {
    vi.mocked(greenApi.getChatHistory).mockResolvedValue([]);
    vi.mocked(greenApi.readChat).mockResolvedValue({ result: true });

    const { result } = renderHook(() => useChatHistory(creds));

    await act(async () => {
      await result.current.loadHistory('c', true);
      await result.current.loadHistory('c', true);
    });

    expect(greenApi.readChat).toHaveBeenCalledTimes(1);
  });

  it('устанавливает error при 429', async () => {
    const err = new greenApi.ApiError(429, 'getChatHistory');
    vi.mocked(greenApi.getChatHistory).mockRejectedValue(err);

    const { result } = renderHook(() => useChatHistory(creds));

    await act(async () => {
      await result.current.loadHistory('c', false);
    });

    expect(result.current.error).toContain('Слишком много запросов');
  });
});
