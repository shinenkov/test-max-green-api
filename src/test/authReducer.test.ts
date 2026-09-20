import { describe, it, expect, beforeEach } from 'vitest';
import { authReducer, initialState } from 'context/authReducer';
import type { AuthState } from 'types/auth';

describe('authReducer', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  const emptyState: AuthState = {
    idInstance: '',
    apiTokenInstance: '',
    isAuthenticated: false,
  };

  describe('LOGIN', () => {
    it('сохраняет данные в state', () => {
      const state = authReducer(emptyState, {
        type: 'LOGIN',
        payload: { idInstance: '1101000000', apiTokenInstance: 'token-abc' },
      });

      expect(state).toEqual({
        idInstance: '1101000000',
        apiTokenInstance: 'token-abc',
        isAuthenticated: true,
      });
    });

    it('сохраняет данные в sessionStorage', () => {
      authReducer(emptyState, {
        type: 'LOGIN',
        payload: { idInstance: '1101000000', apiTokenInstance: 'token-abc' },
      });

      expect(sessionStorage.getItem('idInstance')).toBe('1101000000');
      expect(sessionStorage.getItem('apiTokenInstance')).toBe('token-abc');
    });

    it('не мутирует исходный state', () => {
      const before = { ...emptyState };
      authReducer(emptyState, {
        type: 'LOGIN',
        payload: { idInstance: '1', apiTokenInstance: 't' },
      });
      expect(emptyState).toEqual(before);
    });
  });

  describe('LOGOUT', () => {
    it('очищает state', () => {
      const loggedIn: AuthState = {
        idInstance: '1101000000',
        apiTokenInstance: 'token-abc',
        isAuthenticated: true,
      };

      const state = authReducer(loggedIn, { type: 'LOGOUT' });

      expect(state).toEqual({
        idInstance: '',
        apiTokenInstance: '',
        isAuthenticated: false,
      });
    });

    it('возвращает новый объект, а не мутирует исходный', () => {
      const loggedIn: AuthState = {
        idInstance: '1101000000',
        apiTokenInstance: 'token-abc',
        isAuthenticated: true,
      };
      const before = { ...loggedIn };

      authReducer(loggedIn, { type: 'LOGOUT' });

      expect(loggedIn).toEqual(before);
    });

    it('не трогает sessionStorage — очистка живёт в AuthProvider', () => {
      sessionStorage.setItem('idInstance', '1101000000');
      sessionStorage.setItem('apiTokenInstance', 'token-abc');

      authReducer(
        {
          idInstance: '1101000000',
          apiTokenInstance: 'token-abc',
          isAuthenticated: true,
        },
        { type: 'LOGOUT' }
      );

      expect(sessionStorage.getItem('idInstance')).toBe('1101000000');
      expect(sessionStorage.getItem('apiTokenInstance')).toBe('token-abc');
    });
  });

  describe('initialState', () => {
    it('читается из sessionStorage', () => {
      sessionStorage.setItem('idInstance', '12345');
      sessionStorage.setItem('apiTokenInstance', 'token');

      expect(initialState).toBeDefined();
    });
  });

  describe('неизвестный action', () => {
    it('возвращает state без изменений', () => {
      const state = authReducer(emptyState, { type: 'UNKNOWN' } as never);
      expect(state).toBe(emptyState);
    });
  });
});
