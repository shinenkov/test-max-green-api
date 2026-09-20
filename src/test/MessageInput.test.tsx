import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageInput } from 'components/MessageInput/MessageInput';
import * as greenApi from 'api/greenApi';

vi.mock('api/greenApi', async () => {
  const actual = await vi.importActual<typeof greenApi>('api/greenApi');
  return {
    ...actual,
    sendMessage: vi.fn(),
  };
});

const props = {
  idInstance: '1',
  apiTokenInstance: 't',
  chatId: 'c',
  onSent: vi.fn(),
};

describe('MessageInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('кнопка disabled, если поле пустое', () => {
    render(<MessageInput {...props} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('кнопка активна, если есть текст', async () => {
    render(<MessageInput {...props} />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Привет');

    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('отправляет сообщение по кнопке', async () => {
    vi.mocked(greenApi.sendMessage).mockResolvedValue({ idMessage: 'msg-1' });

    render(<MessageInput {...props} />);
    await userEvent.type(screen.getByRole('textbox'), 'Привет');
    await userEvent.click(screen.getByRole('button'));

    expect(greenApi.sendMessage).toHaveBeenCalledWith(
      { idInstance: '1', apiTokenInstance: 't' },
      'c',
      'Привет'
    );
    expect(props.onSent).toHaveBeenCalled();
  });

  it('отправляет по Enter, но не по Shift+Enter', async () => {
    vi.mocked(greenApi.sendMessage).mockResolvedValue({ idMessage: 'msg-1' });

    render(<MessageInput {...props} />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Привет');

    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    expect(greenApi.sendMessage).not.toHaveBeenCalled();

    await userEvent.keyboard('{Enter}');
    expect(greenApi.sendMessage).toHaveBeenCalled();
  });

  it('не отправляет сообщение из одних пробелов', async () => {
    render(<MessageInput {...props} />);
    await userEvent.type(screen.getByRole('textbox'), '   ');

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
