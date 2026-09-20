import { describe, it, expect, beforeEach } from 'vitest';
import {
  getNotExistPhones,
  addNotExistPhone,
  isKnownNotExist,
  clearNotExistPhones,
} from 'utils/checkAccountCache';
import { NOT_EXIST_PHONES_KEY } from 'constants/storageKeys';

describe('checkAccountCache', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('getNotExistPhones', () => {
    it('возвращает пустой Set, если кэш пуст', () => {
      const result = getNotExistPhones();
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });

    it('возвращает Set со сохранёнными номерами', () => {
      sessionStorage.setItem(
        NOT_EXIST_PHONES_KEY,
        JSON.stringify(['79991234567', '79990000000'])
      );
      const result = getNotExistPhones();
      expect(result.size).toBe(2);
      expect(result.has('79991234567')).toBe(true);
    });

    it('не падает на битом JSON', () => {
      sessionStorage.setItem(NOT_EXIST_PHONES_KEY, 'not-a-json');
      expect(() => getNotExistPhones()).not.toThrow();
      expect(getNotExistPhones().size).toBe(0);
    });

    it('не падает, если в storage не массив', () => {
      sessionStorage.setItem(NOT_EXIST_PHONES_KEY, JSON.stringify({ foo: 'bar' }));
      expect(getNotExistPhones().size).toBe(0);
    });

    it('фильтрует не-строки из массива', () => {
      sessionStorage.setItem(
        NOT_EXIST_PHONES_KEY,
        JSON.stringify(['79991234567', 123, null, '79990000000'])
      );
      const result = getNotExistPhones();
      expect(result.size).toBe(2);
      expect(result.has('79991234567')).toBe(true);
      expect(result.has('79990000000')).toBe(true);
    });
  });

  describe('addNotExistPhone', () => {
    it('добавляет номер в кэш', () => {
      addNotExistPhone('79991234567');
      expect(isKnownNotExist('79991234567')).toBe(true);
    });

    it('не дублирует номер', () => {
      addNotExistPhone('79991234567');
      addNotExistPhone('79991234567');
      const stored = JSON.parse(sessionStorage.getItem(NOT_EXIST_PHONES_KEY) ?? '[]');
      expect(stored).toHaveLength(1);
    });

    it('накапливает несколько номеров', () => {
      addNotExistPhone('79991234567');
      addNotExistPhone('79990000000');
      expect(getNotExistPhones().size).toBe(2);
    });
  });

  describe('isKnownNotExist', () => {
    it('возвращает false для неизвестного номера', () => {
      expect(isKnownNotExist('79991234567')).toBe(false);
    });

    it('возвращает true для известного номера', () => {
      addNotExistPhone('79991234567');
      expect(isKnownNotExist('79991234567')).toBe(true);
    });
  });

  describe('clearNotExistPhones', () => {
    it('очищает кэш', () => {
      addNotExistPhone('79991234567');
      clearNotExistPhones();
      expect(getNotExistPhones().size).toBe(0);
      expect(sessionStorage.getItem(NOT_EXIST_PHONES_KEY)).toBeNull();
    });
  });
});
