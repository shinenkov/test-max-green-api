import type { Dispatch } from 'react';
import type { AuthCredentials } from 'types/chat';

export interface AuthState {
  idInstance: string;
  apiTokenInstance: string;
  isAuthenticated: boolean;
}

export type AuthAction = { type: 'LOGIN'; payload: AuthCredentials } | { type: 'LOGOUT' };

export interface AuthContextValue {
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
  login: (credentials: AuthCredentials) => void;
  logout: () => void;
}
