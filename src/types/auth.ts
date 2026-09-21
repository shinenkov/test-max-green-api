import type { Dispatch } from 'react';

export interface AuthCredentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export interface AuthState {
  apiUrl: string;
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
