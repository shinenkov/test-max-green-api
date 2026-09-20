import { describe, it, expect, beforeEach } from 'vitest';
import { clearSessionStorage } from 'utils/sessionCleanup';
import {
  STORAGE_KEYS,
  CHATS_STORAGE_KEY,
  NOT_EXIST_PHONES_KEY,
  READ_CHAT_KEY,
} from 'constants/storageKeys';

describe('clearSessionStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('удаляет все ключи приложения', () => {
    sessionStorage.setItem(STORAGE_KEYS.idInstance, '1101000000');
    sessionStorage.setItem(STORAGE_KEYS.apiTokenInstance, 'token');
    sessionStorage.setItem(CHATS_STORAGE_KEY, '[]');
    sessionStorage.setItem(NOT_EXIST_PHONES_KEY, '[]');
    sessionStorage.setItem(READ_CHAT_KEY, '[]');

    clearSessionStorage();

    expect(sessionStorage.getItem(STORAGE_KEYS.idInstance)).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEYS.apiTokenInstance)).toBeNull();
    expect(sessionStorage.getItem(CHATS_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(NOT_EXIST_PHONES_KEY)).toBeNull();
    expect(sessionStorage.getItem(READ_CHAT_KEY)).toBeNull();
  });

  it('не падает, если storage пуст', () => {
    expect(() => clearSessionStorage()).not.toThrow();
  });

  it('не трогает чужие ключи', () => {
    sessionStorage.setItem('unrelatedKey', 'value');
    sessionStorage.setItem(STORAGE_KEYS.idInstance, '1101000000');

    clearSessionStorage();

    expect(sessionStorage.getItem('unrelatedKey')).toBe('value');
    expect(sessionStorage.getItem(STORAGE_KEYS.idInstance)).toBeNull();
  });
});
