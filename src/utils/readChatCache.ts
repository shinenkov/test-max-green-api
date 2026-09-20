import { READ_CHAT_KEY } from 'constants/storageKeys';

function readAttemptedList(): string[] {
  const raw = sessionStorage.getItem(READ_CHAT_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export function hasAttemptedReadChat(chatId: string): boolean {
  return readAttemptedList().includes(chatId);
}

export function markReadChatAttempted(chatId: string): void {
  const raw = sessionStorage.getItem(READ_CHAT_KEY);
  let arr: string[] = [];

  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        arr = parsed.filter((item): item is string => typeof item === 'string');
      }
    } catch {
      arr = [];
    }
  }

  if (!arr.includes(chatId)) {
    arr.push(chatId);
    sessionStorage.setItem(READ_CHAT_KEY, JSON.stringify(arr));
  }
}
