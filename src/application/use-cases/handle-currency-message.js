import { InvalidCurrencyCodeError } from '#domain/errors/invalid-currency-code-error.js';

import { extractCurrencyCodeFromText } from './extract-currency-code-from-text.js';

const INVALID_CURRENCY_MESSAGE = 'Send a three-letter currency code, for example EUR.';

export class HandleCurrencyMessage {
  constructor({ getExchangeRateAgainstUsd, messageSender } = {}) {
    if (!getExchangeRateAgainstUsd || typeof getExchangeRateAgainstUsd.execute !== 'function') {
      throw new TypeError('getExchangeRateAgainstUsd must implement execute()');
    }

    if (!messageSender || typeof messageSender.sendMessage !== 'function') {
      throw new TypeError('messageSender must implement sendMessage()');
    }

    this.getExchangeRateAgainstUsd = getExchangeRateAgainstUsd;
    this.messageSender = messageSender;
  }

  async execute({ chatId, text } = {}) {
    const currencyCode = extractCurrencyCodeFromText(text);
    let rate;

    try {
      rate = await this.getExchangeRateAgainstUsd.execute(currencyCode);
    } catch (error) {
      if (!(error instanceof InvalidCurrencyCodeError)) {
        throw error;
      }

      await this.messageSender.sendMessage(chatId, INVALID_CURRENCY_MESSAGE);
      return { handled: false };
    }

    const responseText = `1 ${currencyCode} = ${rate} USD`;

    await this.messageSender.sendMessage(chatId, responseText);

    return {
      handled: true,
      currencyCode,
      rate,
    };
  }
}
