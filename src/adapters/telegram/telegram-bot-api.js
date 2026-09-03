import { MessageSender } from '#application/ports/message-sender.js';

import { TelegramApiError } from './telegram-api-error.js';

const DEFAULT_BASE_URL = 'https://api.telegram.org';

export class TelegramBotApi extends MessageSender {
  constructor({ botToken, baseUrl = DEFAULT_BASE_URL, fetchFunction = globalThis.fetch } = {}) {
    super();

    if (typeof botToken !== 'string' || botToken.trim() === '') {
      throw new TypeError('botToken must be a non-empty string');
    }

    if (typeof fetchFunction !== 'function') {
      throw new TypeError('fetchFunction must be a function');
    }

    this.botToken = botToken.trim();
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetchFunction = fetchFunction;
  }

  async sendMessage(chatId, text) {
    validateChatId(chatId);

    if (typeof text !== 'string' || text.length === 0) {
      throw new TypeError('text must be a non-empty string');
    }

    let response;

    try {
      response = await this.fetchFunction(`${this.baseUrl}/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
    } catch (error) {
      throw new TelegramApiError('Failed to connect to Telegram Bot API', {
        cause: error,
      });
    }

    let payload;

    try {
      payload = await response.json();
    } catch (error) {
      throw new TelegramApiError('Telegram Bot API returned invalid JSON', {
        cause: error,
        statusCode: response.status,
      });
    }

    if (!response.ok || payload?.ok !== true) {
      throw new TelegramApiError(
        typeof payload?.description === 'string'
          ? payload.description
          : `Telegram Bot API returned HTTP ${response.status}`,
        {
          statusCode: response.status,
          errorCode: payload?.error_code,
          parameters: payload?.parameters,
        },
      );
    }

    if (!payload.result || typeof payload.result !== 'object') {
      throw new TelegramApiError('Telegram Bot API returned an invalid result', {
        statusCode: response.status,
      });
    }

    return payload.result;
  }
}

function validateChatId(chatId) {
  const isValidNumber = typeof chatId === 'number' && Number.isSafeInteger(chatId);
  const isValidString = typeof chatId === 'string' && chatId.trim() !== '';

  if (!isValidNumber && !isValidString) {
    throw new TypeError('chatId must be an integer or a non-empty string');
  }
}
