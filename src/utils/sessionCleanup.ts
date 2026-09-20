import {
  STORAGE_KEYS,
  CHATS_STORAGE_KEY,
  NOT_EXIST_PHONES_KEY,
  READ_CHAT_KEY,
} from 'constants/storageKeys';

export function clearSessionStorage(): void {
  sessionStorage.removeItem(STORAGE_KEYS.idInstance);
  sessionStorage.removeItem(STORAGE_KEYS.apiTokenInstance);
  sessionStorage.removeItem(CHATS_STORAGE_KEY);
  sessionStorage.removeItem(NOT_EXIST_PHONES_KEY);
  sessionStorage.removeItem(READ_CHAT_KEY);
}
