export interface ApiCredentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export interface CheckAccountRequest {
  phoneNumber: number;
}

export interface CheckAccountResponse {
  exist: boolean;
  chatId: string;
  fromCache: boolean;
}

export interface SendMessageRequest {
  chatId: string;
  message: string;
  typingTime?: number;
  quotedMessageId?: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

export type ReceiveNotificationResponse = NotificationBody | null;

export interface NotificationBody {
  receiptId: number;
  body: WebhookBody;
}

export interface WebhookBody {
  typeWebhook: WebhookType;
  instanceData: InstanceData;
  timestamp: number;
  idMessage: string;
  senderData: SenderData;
  messageData: MessageData;
}

export type WebhookType =
  | 'incomingMessageReceived'
  | 'outgoingMessageReceived'
  | 'outgoingAPIMessageReceived'
  | 'outgoingMessageStatus'
  | 'stateInstanceChanged'
  | 'incomingCall'
  | 'deviceInfo';

export interface InstanceData {
  idInstance: number;
  wid: string;
  typeInstance: string;
}

export interface SenderData {
  chatId: string;
  chatName: string;
  sender: string;
  senderName: string;
}

export type MessageType =
  | 'textMessage'
  | 'imageMessage'
  | 'videoMessage'
  | 'documentMessage'
  | 'audioMessage'
  | 'locationMessage'
  | 'contactMessage'
  | 'extendedTextMessage';

export interface MessageData {
  typeMessage: MessageType;
  textMessageData?: TextMessageData;
}

export interface TextMessageData {
  textMessage: string;
}

export interface DeleteNotificationResponse {
  result: boolean;
}

export interface GetChatHistoryRequest {
  chatId: string;
  count?: number;
}

export type ChatHistoryItem = {
  type: 'incoming' | 'outgoing';
  idMessage: string;
  timestamp: number;
  typeMessage: MessageType;
  chatId: string;
  textMessage?: string;
  statusMessage?: string;
  senderId?: string;
  senderName?: string;
};

export type GetChatHistoryResponse = ChatHistoryItem[] | null;

export interface ReadChatResponse {
  result: boolean;
  invokeStatus?: {
    method: string;
    used: number;
    total: number;
    status: string;
    description: string;
  };
}

export type SetSettingsRequest = {
  webhookUrl?: string;
  webhookUrlToken?: string;
  delaySendMessagesMilliseconds?: number;
  markIncomingMessagesReaded?: 'yes' | 'no';
  markIncomingMessagesReadedOnReply?: 'yes' | 'no';
  outgoingWebhook?: 'yes' | 'no';
  outgoingMessageWebhook?: 'yes' | 'no';
  outgoingAPIMessageWebhook?: 'yes' | 'no';
  stateWebhook?: 'yes' | 'no';
  incomingWebhook?: 'yes' | 'no';
  editedMessageWebhook?: 'yes' | 'no';
  deletedMessageWebhook?: 'yes' | 'no';
  pollMessageWebhook?: 'yes' | 'no';
  downloadUrlJpeg?: 'yes' | 'no';
};

export type SetSettingsResponse = {
  saveSettings: boolean;
};
