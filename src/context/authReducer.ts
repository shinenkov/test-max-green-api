import { DEFAULT_API_URL } from 'constants/defaults';
import { STORAGE_KEYS } from 'constants/storageKeys';
import type { AuthState, AuthAction } from 'types/auth';

export const initialState: AuthState = {
  apiUrl: sessionStorage.getItem(STORAGE_KEYS.apiUrl) ?? DEFAULT_API_URL,
  idInstance: sessionStorage.getItem(STORAGE_KEYS.idInstance) ?? '',
  apiTokenInstance: sessionStorage.getItem(STORAGE_KEYS.apiTokenInstance) ?? '',
  isAuthenticated: !!sessionStorage.getItem(STORAGE_KEYS.idInstance),
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN': {
      const { apiUrl, idInstance, apiTokenInstance } = action.payload;
      sessionStorage.setItem(STORAGE_KEYS.apiUrl, apiUrl);
      sessionStorage.setItem(STORAGE_KEYS.idInstance, idInstance);
      sessionStorage.setItem(STORAGE_KEYS.apiTokenInstance, apiTokenInstance);
      return {
        apiUrl,
        idInstance,
        apiTokenInstance,
        isAuthenticated: true,
      };
    }
    case 'LOGOUT':
      return {
        apiUrl: state.apiUrl,
        idInstance: '',
        apiTokenInstance: '',
        isAuthenticated: false,
      };
    default:
      return state;
  }
}
