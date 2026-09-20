import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatTime, formatDate } from 'utils/formatters';

describe('formatTime', () => {
  it('форматирует timestamp в HH:MM', () => {
    const timestamp = new Date('2024-01-15T14:30:00Z').getTime() / 1000;
    const result = formatTime(timestamp);
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it('возвращает двузначные часы и минуты', () => {
    const timestamp = new Date('2024-01-15T09:05:00Z').getTime() / 1000;
    const result = formatTime(timestamp);
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe('formatDate (UTC)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-19T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('возвращает "Сегодня" для текущей даты', () => {
    const timestamp = new Date('2026-09-19T08:30:00Z').getTime() / 1000;
    expect(formatDate(timestamp)).toBe('Сегодня');
  });

  it('возвращает "Вчера" для предыдущего дня', () => {
    const timestamp = new Date('2026-09-18T15:00:00Z').getTime() / 1000;
    expect(formatDate(timestamp)).toBe('Вчера');
  });

  it('возвращает форматированную дату для старых дат', () => {
    const timestamp = new Date('2024-06-10T15:00:00Z').getTime() / 1000;
    const result = formatDate(timestamp);
    expect(result).not.toBe('Сегодня');
    expect(result).not.toBe('Вчера');
    expect(result).toMatch(/\d+/);
  });
});

describe('formatDate (local time)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('возвращает "Сегодня" для текущей даты', () => {
    const timestamp = new Date(2024, 5, 15, 8, 30).getTime() / 1000;
    expect(formatDate(timestamp)).toBe('Сегодня');
  });

  it('возвращает "Сегодня" для позднего времени того же дня', () => {
    const timestamp = new Date(2024, 5, 15, 23, 59).getTime() / 1000;
    expect(formatDate(timestamp)).toBe('Сегодня');
  });

  it('возвращает "Вчера" для предыдущего дня', () => {
    const timestamp = new Date(2024, 5, 14, 22, 0).getTime() / 1000;
    expect(formatDate(timestamp)).toBe('Вчера');
  });

  it('возвращает "Вчера" для начала вчерашнего дня', () => {
    const timestamp = new Date(2024, 5, 14, 0, 1).getTime() / 1000;
    expect(formatDate(timestamp)).toBe('Вчера');
  });

  it('возвращает дату с днём и месяцем для старых дат', () => {
    const timestamp = new Date(2024, 5, 10, 15, 0).getTime() / 1000;
    const result = formatDate(timestamp);
    expect(result).toContain('10');
    expect(result).toMatch(/июн/i);
  });

  it('корректно обрабатывает дату год назад', () => {
    const timestamp = new Date(2023, 5, 15, 12, 0).getTime() / 1000;
    const result = formatDate(timestamp);
    expect(result).not.toBe('Сегодня');
    expect(result).not.toBe('Вчера');
    expect(result).toMatch(/\d+/);
  });
});
