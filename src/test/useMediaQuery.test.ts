import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMediaQuery } from 'hooks/useMediaQuery';

interface MockMql {
  matches: boolean;
  media: string;
  onchange: null;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
  _trigger: (matches: boolean) => void;
}

function createMatchMedia(initialMatches: boolean): MockMql {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];

  const mql: MockMql = {
    matches: initialMatches,
    media: '',
    onchange: null,
    addEventListener: vi.fn((_event: string, cb: EventListenerOrEventListenerObject) => {
      listeners.push(cb as (e: MediaQueryListEvent) => void);
    }),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    _trigger: (newMatches: boolean) => {
      mql.matches = newMatches;
      listeners.forEach((cb) => cb({ matches: newMatches } as MediaQueryListEvent));
    },
  };

  return mql;
}

describe('useMediaQuery', () => {
  it('возвращает true, если медиазапрос совпадает', () => {
    vi.stubGlobal('matchMedia', () => createMatchMedia(true));
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(true);
  });

  it('возвращает false, если не совпадает', () => {
    vi.stubGlobal('matchMedia', () => createMatchMedia(false));
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(false);
  });

  it('обновляется при изменении media query', async () => {
    const mql = createMatchMedia(false);
    vi.stubGlobal('matchMedia', () => mql);

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(false);

    await act(async () => {
      mql._trigger(true);
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
