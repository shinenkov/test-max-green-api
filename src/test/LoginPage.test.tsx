import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App as AntApp } from 'antd';
import { LoginPage } from 'components/LoginPage/LoginPage';
import * as greenApi from 'api/greenApi';

vi.mock('api/greenApi', async () => {
  const actual = await vi.importActual<typeof greenApi>('api/greenApi');
  return { ...actual, setSettings: vi.fn() };
});

const loginMock = vi.fn();
vi.mock('hooks/useAuth', () => ({
  useAuth: () => ({
    state: { idInstance: '', apiTokenInstance: '', isAuthenticated: false },
    login: loginMock,
    logout: vi.fn(),
    dispatch: vi.fn(),
  }),
}));

function renderPage() {
  return render(
    <AntApp>
      <LoginPage />
    </AntApp>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('рендерит форму логина', () => {
    renderPage();
    expect(screen.getByLabelText(/idInstance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apiTokenInstance/i)).toBeInTheDocument();
  });

  it('показывает ошибку при пустом idInstance', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(screen.getByText(/введите idInstance/i)).toBeInTheDocument();
    });
  });

  it('вызывает login при успешной авторизации', async () => {
    vi.mocked(greenApi.setSettings).mockResolvedValue({
      saveSettings: true,
    });

    renderPage();
    await userEvent.type(screen.getByLabelText(/idInstance/i), '1101000000');
    await userEvent.type(screen.getByLabelText(/apiTokenInstance/i), 'a'.repeat(30));
    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        idInstance: '1101000000',
        apiTokenInstance: 'a'.repeat(30),
      });
    });
  });

  it('показывает Alert при ошибке 401', async () => {
    vi.mocked(greenApi.setSettings).mockRejectedValue(
      new greenApi.ApiError(401, 'setSettings')
    );

    renderPage();
    await userEvent.type(screen.getByLabelText(/idInstance/i), '1101000000');
    await userEvent.type(screen.getByLabelText(/apiTokenInstance/i), 'a'.repeat(30));
    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/неверный idInstance или apiTokenInstance/i)
      ).toBeInTheDocument();
    });
    expect(loginMock).not.toHaveBeenCalled();
  });
});
