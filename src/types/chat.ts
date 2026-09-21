export interface Message {
  id: string;
  text: string;
  isOutgoing: boolean;
  timestamp: number;
  senderName?: string;
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface Chat {
  id: string;
  phoneNumber: string;
  name?: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unread: number;
}
