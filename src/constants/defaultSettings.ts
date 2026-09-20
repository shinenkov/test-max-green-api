import type { SetSettingsRequest } from 'types/api';

export const defaultSettings: SetSettingsRequest = {
  webhookUrl: '',
  webhookUrlToken: '',
  delaySendMessagesMilliseconds: 0,
  markIncomingMessagesReaded: 'no',
  markIncomingMessagesReadedOnReply: 'no',
  outgoingWebhook: 'yes',
  outgoingMessageWebhook: 'yes',
  outgoingAPIMessageWebhook: 'yes',
  incomingWebhook: 'yes',
  stateWebhook: 'no',
  pollMessageWebhook: 'no',
  editedMessageWebhook: 'yes',
  deletedMessageWebhook: 'yes',
};

export const DEFAULT_API_URL = import.meta.env.VITE_GREEN_API ?? '';
