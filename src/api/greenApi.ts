import { defaultSettings } from 'constants/defaultSettings';
import type {
  CheckAccountRequest,
  CheckAccountResponse,
  SendMessageRequest,
  SendMessageResponse,
  ReceiveNotificationResponse,
  DeleteNotificationResponse,
  GetChatHistoryResponse,
  ReadChatResponse,
  SetSettingsRequest,
  SetSettingsResponse,
} from 'types/api';

export class ApiError extends Error {
  status: number;
  method: string;

  constructor(status: number, method: string, message?: string) {
    super(message ?? `API error ${status} in ${method}`);
    this.name = 'ApiError';
    this.status = status;
    this.method = method;
  }
}

interface ApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

export async function setSettings(creds: ApiCredentials): Promise<SetSettingsResponse> {
  return postJson<SetSettingsRequest, SetSettingsResponse>(
    buildUrl(creds, 'setSettings'),
    defaultSettings,
    'setSettings'
  );
}

function buildUrl(
  { idInstance, apiTokenInstance }: ApiCredentials,
  method: string,
  receiptId?: number
): string {
  return `${process.env.VITE_GREEN_API}/waInstance${idInstance}/${method}/${apiTokenInstance}${receiptId ? `/${receiptId}` : ''}`;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const MAX_RETRIES = 3;

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  method: string
): Promise<Response> {
  let attempt = 0;
  while (true) {
    const res = await fetch(url, init);

    if (res.status === 429 && attempt < MAX_RETRIES) {
      const delay = 1000 * 2 ** attempt;
      if (import.meta.env.DEV) {
        console.warn(
          `[GREEN-API] ${method} returned 429, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
        );
      }
      await sleep(delay);
      attempt++;
      continue;
    }

    if (!res.ok) {
      throw new ApiError(res.status, method);
    }

    return res;
  }
}

async function postJson<TReq, TRes>(
  url: string,
  body: TReq,
  method: string
): Promise<TRes> {
  const res = await fetchWithRetry(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    method
  );
  return res.json() as Promise<TRes>;
}

export async function checkAccount(
  creds: ApiCredentials,
  phoneNumber: string
): Promise<CheckAccountResponse> {
  return postJson<CheckAccountRequest, CheckAccountResponse>(
    buildUrl(creds, 'checkAccount'),
    { phoneNumber: Number(phoneNumber) },
    'checkAccount'
  );
}

export async function sendMessage(
  creds: ApiCredentials,
  chatId: string,
  message: string
): Promise<SendMessageResponse> {
  return postJson<SendMessageRequest, SendMessageResponse>(
    buildUrl(creds, 'sendMessage'),
    { chatId, message },
    'sendMessage'
  );
}

export async function receiveNotification(
  creds: ApiCredentials,
  receiveTimeout = 10
): Promise<ReceiveNotificationResponse> {
  const res = await fetch(
    `${buildUrl(creds, 'receiveNotification')}?receiveTimeout=${receiveTimeout}`
  );

  if (!res.ok) return null;

  const text = await res.text();

  if (!text || text.trim() === '' || text.trim() === 'null') {
    return null;
  }

  try {
    return JSON.parse(text) as ReceiveNotificationResponse;
  } catch {
    return null;
  }
}

export async function deleteNotification(
  creds: ApiCredentials,
  receiptId: number
): Promise<DeleteNotificationResponse> {
  const res = await fetch(buildUrl(creds, `deleteNotification`, receiptId), {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<DeleteNotificationResponse>;
}

export async function getChatHistory(
  creds: ApiCredentials,
  chatId: string,
  count = 100,
  signal?: AbortSignal
): Promise<GetChatHistoryResponse> {
  const res = await fetch(buildUrl(creds, 'getChatHistory'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, count }),
    signal,
  });
  if (!res.ok) throw new ApiError(res.status, 'getChatHistory');
  return res.json() as Promise<GetChatHistoryResponse>;
}

export async function readChat(
  creds: ApiCredentials,
  chatId: string,
  signal?: AbortSignal
): Promise<ReadChatResponse> {
  const res = await fetch(buildUrl(creds, 'readChat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId }),
    signal,
  });

  if (res.status === 466) {
    const body = (await res.json()) as {
      invokeStatus?: ReadChatResponse['invokeStatus'];
    };
    if (import.meta.env.DEV) {
      console.warn(
        '[GREEN-API] readChat quota exceeded:',
        body.invokeStatus?.description
      );
    }
    return { result: false, invokeStatus: body.invokeStatus };
  }

  if (!res.ok) {
    throw new ApiError(res.status, 'readChat');
  }

  return res.json() as Promise<ReadChatResponse>;
}
