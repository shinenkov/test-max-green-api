import { useReducer, useMemo, type ReactNode } from 'react';
import { authReducer, initialState } from './authReducer';
import { AuthContext } from './authContext';
import type { AuthContextValue, AuthCredentials } from 'types/auth';
import { clearSessionStorage } from 'utils/sessionCleanup';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      dispatch,
      login: (credentials: AuthCredentials) =>
        dispatch({ type: 'LOGIN', payload: credentials }),
      logout: () => {
        clearSessionStorage();
        dispatch({ type: 'LOGOUT' });
      },
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
