import { NOT_EXIST_PHONES_KEY } from 'constants/storageKeys';

export function getNotExistPhones(): Set<string> {
  const raw = sessionStorage.getItem(NOT_EXIST_PHONES_KEY);
  if (!raw) return new Set();

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((item): item is string => typeof item === 'string'));
  } catch {
    return new Set();
  }
}

export function addNotExistPhone(phone: string): void {
  const set = getNotExistPhones();
  set.add(phone);
  sessionStorage.setItem(NOT_EXIST_PHONES_KEY, JSON.stringify([...set]));
}

export function isKnownNotExist(phone: string): boolean {
  return getNotExistPhones().has(phone);
}

export function clearNotExistPhones(): void {
  sessionStorage.removeItem(NOT_EXIST_PHONES_KEY);
}
