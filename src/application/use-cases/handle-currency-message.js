import { ExchangeRateProviderError } from '#application/errors/exchange-rate-provider-error.js';
import {
  CURRENCY_PAIR_NOT_FOUND_MESSAGE,
  EXCHANGE_RATE_UNAVAILABLE_MESSAGE,
  INVALID_CURRENCY_REQUEST_MESSAGE,
  createConversionMessage,
  createRateMessage,
} from '#application/messages/convertic-messages.js';
import { InvalidCurrencyCodeError } from '#domain/errors/invalid-currency-code-error.js';
import { InvalidCurrencyAmountError } from '#domain/errors/invalid-currency-amount-error.js';

import { parseCurrencyRequest } from './parse-currency-request.js';

export class HandleCurrencyMessage {
  constructor({ getExchangeRate, convertCurrency, messageSender } = {}) {
    if (!getExchangeRate || typeof getExchangeRate.execute !== 'function') {
      throw new TypeError('getExchangeRate must implement execute()');
    }

    if (!convertCurrency || typeof convertCurrency.execute !== 'function') {
      throw new TypeError('convertCurrency must implement execute()');
    }

    if (!messageSender || typeof messageSender.sendMessage !== 'function') {
      throw new TypeError('messageSender must implement sendMessage()');
    }

    this.getExchangeRate = getExchangeRate;
    this.convertCurrency = convertCurrency;
    this.messageSender = messageSender;
  }

  async execute({ chatId, text } = {}) {
    const request = parseCurrencyRequest(text);

    if (!request) {
      await this.messageSender.sendMessage(chatId, INVALID_CURRENCY_REQUEST_MESSAGE);
      return { handled: false };
    }

    try {
      const result = await this.executeRequest(request);
      const responseText =
        request.type === 'conversion' ? createConversionMessage(result) : createRateMessage(result);

      await this.messageSender.sendMessage(chatId, responseText);

      return { handled: true, request, result };
    } catch (error) {
      if (
        error instanceof InvalidCurrencyCodeError ||
        error instanceof InvalidCurrencyAmountError
      ) {
        await this.messageSender.sendMessage(chatId, INVALID_CURRENCY_REQUEST_MESSAGE);
        return { handled: false };
      }

      if (error instanceof ExchangeRateProviderError) {
        const message =
          error.statusCode === 422
            ? CURRENCY_PAIR_NOT_FOUND_MESSAGE
            : EXCHANGE_RATE_UNAVAILABLE_MESSAGE;

        await this.messageSender.sendMessage(chatId, message);
        return { handled: false };
      }

      throw error;
    }
  }

  executeRequest(request) {
    if (request.type === 'conversion') {
      return this.convertCurrency.execute(request);
    }

    return this.getExchangeRate.execute(request);
  }
}
