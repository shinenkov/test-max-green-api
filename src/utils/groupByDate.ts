import type { Message } from 'types/chat';
import { formatDate } from './formatters';

interface GroupedMessages {
  dateKey: string;
  dateLabel: string;
  items: Message[];
}

export function groupByDate(messages: Message[]): GroupedMessages[] {
  const map = new Map<string, { timestamp: number; items: Message[] }>();

  for (const msg of messages) {
    const d = new Date(msg.timestamp * 1000);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const existing = map.get(key);
    if (existing) existing.items.push(msg);
    else map.set(key, { timestamp: msg.timestamp, items: [msg] });
  }

  return Array.from(map.entries()).map(([key, { timestamp, items }]) => ({
    dateKey: key,
    dateLabel: formatDate(timestamp),
    items,
  }));
}
