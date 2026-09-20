import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { groupByDate } from 'utils/groupByDate';
import type { Message } from 'types/chat';

function msg(id: string, timestamp: number): Message {
  return {
    id,
    text: `Message ${id}`,
    isOutgoing: false,
    timestamp,
  };
}

describe('groupByDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('возвращает пустой массив для пустого входа', () => {
    expect(groupByDate([])).toEqual([]);
  });

  it('группирует сообщения одного дня в одну группу', () => {
    const messages: Message[] = [
      msg('1', new Date('2024-06-15T08:00:00Z').getTime() / 1000),
      msg('2', new Date('2024-06-15T09:00:00Z').getTime() / 1000),
      msg('3', new Date('2024-06-15T10:00:00Z').getTime() / 1000),
    ];

    const result = groupByDate(messages);
    expect(result).toHaveLength(1);
    expect(result[0]!.items).toHaveLength(3);
  });

  it('разделяет сообщения разных дней', () => {
    const messages: Message[] = [
      msg('1', new Date('2024-06-15T08:00:00Z').getTime() / 1000),
      msg('2', new Date('2024-06-14T09:00:00Z').getTime() / 1000),
      msg('3', new Date('2024-06-13T10:00:00Z').getTime() / 1000),
    ];

    const result = groupByDate(messages);
    expect(result).toHaveLength(3);
    result.forEach((group) => expect(group.items).toHaveLength(1));
  });

  it('сохраняет порядок сообщений внутри группы', () => {
    const messages: Message[] = [
      msg('1', new Date('2024-06-15T08:00:00Z').getTime() / 1000),
      msg('2', new Date('2024-06-15T09:00:00Z').getTime() / 1000),
      msg('3', new Date('2024-06-15T10:00:00Z').getTime() / 1000),
    ];

    const result = groupByDate(messages);
    expect(result[0]!.items.map((m) => m.id)).toEqual(['1', '2', '3']);
  });

  it('обрабатывает сообщения вперемешку по дням', () => {
    const messages: Message[] = [
      msg('1', new Date('2024-06-15T08:00:00Z').getTime() / 1000),
      msg('2', new Date('2024-06-14T09:00:00Z').getTime() / 1000),
      msg('3', new Date('2024-06-15T10:00:00Z').getTime() / 1000),
    ];

    const result = groupByDate(messages);
    expect(result).toHaveLength(2);
    expect(result[0]!.items.map((m) => m.id)).toEqual(['1', '3']);
    expect(result[1]!.items.map((m) => m.id)).toEqual(['2']);
  });
});
