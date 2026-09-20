import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from 'context/AuthProvider';
import { useAuth } from 'hooks/useAuth';

function TestComponent() {
  const { state, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth">{state.isAuthenticated ? 'yes' : 'no'}</span>
      <button onClick={() => login({ idInstance: '1', apiTokenInstance: 't' })}>
        login
      </button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('logout очищает state и sessionStorage', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText('login'));
    expect(screen.getByTestId('auth')).toHaveTextContent('yes');
    expect(sessionStorage.getItem('idInstance')).toBe('1');

    await userEvent.click(screen.getByText('logout'));
    expect(screen.getByTestId('auth')).toHaveTextContent('no');
    expect(sessionStorage.getItem('idInstance')).toBeNull();
  });
});
