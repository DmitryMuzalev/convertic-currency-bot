import { ExchangeRateProviderError } from '#application/errors/exchange-rate-provider-error.js';
import {
  createConversionMessage,
  createRateMessage,
} from '#application/messages/format-currency-message.js';
import { getMessages } from '#application/messages/get-messages.js';
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

  async execute({ chatId, text, languageCode } = {}) {
    const request = parseCurrencyRequest(text);
    const messages = getMessages(languageCode);

    if (!request) {
      await this.messageSender.sendMessage(chatId, messages.invalidCurrencyRequest);
      return { handled: false };
    }

    try {
      const result = await this.executeRequest(request);
      const responseText =
        request.type === 'conversion'
          ? createConversionMessage(result, messages)
          : createRateMessage(result, messages);

      await this.messageSender.sendMessage(chatId, responseText);

      return { handled: true, request, result };
    } catch (error) {
      if (
        error instanceof InvalidCurrencyCodeError ||
        error instanceof InvalidCurrencyAmountError
      ) {
        await this.messageSender.sendMessage(chatId, messages.invalidCurrencyRequest);
        return { handled: false };
      }

      if (error instanceof ExchangeRateProviderError) {
        const message =
          error.statusCode === 422
            ? messages.currencyPairNotFound
            : messages.exchangeRateUnavailable;

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
