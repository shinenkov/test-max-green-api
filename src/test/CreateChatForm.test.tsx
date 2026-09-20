import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App as AntApp } from 'antd';
import { CreateChatForm } from 'components/CreateChat/CreateChat';
import * as greenApi from 'api/greenApi';
import * as cache from 'utils/checkAccountCache';

vi.mock('api/greenApi', async () => {
  const actual = await vi.importActual<typeof greenApi>('api/greenApi');
  return { ...actual, checkAccount: vi.fn() };
});

vi.mock('hooks/useAuth', () => ({
  useAuth: () => ({
    state: { idInstance: '1', apiTokenInstance: 't', isAuthenticated: true },
  }),
}));

function renderForm(overrides = {}) {
  const props = {
    existingChats: [],
    onCreated: vi.fn(),
    onSelectExisting: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
  return {
    ...render(
      <AntApp>
        <CreateChatForm {...props} />
      </AntApp>
    ),
    props,
  };
}

describe('CreateChatForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('открывает существующий чат без вызова CheckAccount', async () => {
    const existingChat = {
      id: 'c-1',
      phoneNumber: '79991234567',
      unread: 0,
    };
    const { props } = renderForm({ existingChats: [existingChat] });

    await userEvent.type(screen.getByRole('textbox'), '79991234567');
    await userEvent.click(screen.getByRole('button', { name: /создать/i }));

    await waitFor(() => {
      expect(props.onSelectExisting).toHaveBeenCalledWith('c-1');
    });
    expect(greenApi.checkAccount).not.toHaveBeenCalled();
  });

  it('не вызывает CheckAccount для номера из негативного кэша', async () => {
    cache.addNotExistPhone('79990000000');
    renderForm();

    await userEvent.type(screen.getByRole('textbox'), '79990000000');
    await userEvent.click(screen.getByRole('button', { name: /создать/i }));

    expect(greenApi.checkAccount).not.toHaveBeenCalled();
  });

  it('создаёт чат при exist: true', async () => {
    vi.mocked(greenApi.checkAccount).mockResolvedValue({
      exist: true,
      chatId: 'c-1',
      fromCache: false,
    });

    const { props } = renderForm();
    await userEvent.type(screen.getByRole('textbox'), '79991234567');
    await userEvent.click(screen.getByRole('button', { name: /создать/i }));

    await waitFor(() => {
      expect(props.onCreated).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'c-1', phoneNumber: '79991234567' })
      );
    });
  });

  it('записывает в кэш при exist: false', async () => {
    vi.mocked(greenApi.checkAccount).mockResolvedValue({
      exist: false,
      chatId: '',
      fromCache: false,
    });

    renderForm();
    await userEvent.type(screen.getByRole('textbox'), '79990000000');
    await userEvent.click(screen.getByRole('button', { name: /создать/i }));

    await waitFor(() => {
      expect(cache.isKnownNotExist('79990000000')).toBe(true);
    });
  });
});
