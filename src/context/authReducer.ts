import { STORAGE_KEYS } from 'constants/storageKeys';
import type { AuthState, AuthAction } from 'types/auth';

export const initialState: AuthState = {
  idInstance: sessionStorage.getItem(STORAGE_KEYS.idInstance) ?? '',
  apiTokenInstance: sessionStorage.getItem(STORAGE_KEYS.apiTokenInstance) ?? '',
  isAuthenticated: !!sessionStorage.getItem(STORAGE_KEYS.idInstance),
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN': {
      const { idInstance, apiTokenInstance } = action.payload;
      sessionStorage.setItem(STORAGE_KEYS.idInstance, idInstance);
      sessionStorage.setItem(STORAGE_KEYS.apiTokenInstance, apiTokenInstance);
      return {
        idInstance,
        apiTokenInstance,
        isAuthenticated: true,
      };
    }
    case 'LOGOUT':
      return { idInstance: '', apiTokenInstance: '', isAuthenticated: false };
    default:
      return state;
  }
}
