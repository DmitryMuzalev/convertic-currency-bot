import { ExchangeRateProviderError } from '#application/errors/exchange-rate-provider-error.js';
import {
  createConversionMessage,
  createHistoricalMultipleRatesMessage,
  createHistoricalRateMessage,
  createMultipleRatesMessage,
  createRateMessage,
} from '#application/messages/format-currency-message.js';
import { getMessages } from '#application/messages/get-messages.js';
import { InvalidCurrencyCodeError } from '#domain/errors/invalid-currency-code-error.js';
import { InvalidCurrencyAmountError } from '#domain/errors/invalid-currency-amount-error.js';
import { InvalidCurrencyListError } from '#domain/errors/invalid-currency-list-error.js';
import { InvalidExchangeRateDateError } from '#domain/errors/invalid-exchange-rate-date-error.js';

export class HandleCurrencyMessage {
  constructor({
    recognizeCurrencyRequest,
    getExchangeRate,
    getMultipleExchangeRates,
    convertCurrency,
    messageSender,
  } = {}) {
    if (!recognizeCurrencyRequest || typeof recognizeCurrencyRequest.execute !== 'function') {
      throw new TypeError('recognizeCurrencyRequest must implement execute()');
    }

    if (!getExchangeRate || typeof getExchangeRate.execute !== 'function') {
      throw new TypeError('getExchangeRate must implement execute()');
    }

    if (!convertCurrency || typeof convertCurrency.execute !== 'function') {
      throw new TypeError('convertCurrency must implement execute()');
    }

    if (!getMultipleExchangeRates || typeof getMultipleExchangeRates.execute !== 'function') {
      throw new TypeError('getMultipleExchangeRates must implement execute()');
    }

    if (!messageSender || typeof messageSender.sendMessage !== 'function') {
      throw new TypeError('messageSender must implement sendMessage()');
    }

    this.recognizeCurrencyRequest = recognizeCurrencyRequest;
    this.getExchangeRate = getExchangeRate;
    this.getMultipleExchangeRates = getMultipleExchangeRates;
    this.convertCurrency = convertCurrency;
    this.messageSender = messageSender;
  }

  async execute({ chatId, text, languageCode } = {}) {
    const messages = getMessages(languageCode);

    try {
      const request = await this.recognizeCurrencyRequest.execute(text);

      if (!request) {
        await this.messageSender.sendMessage(chatId, messages.invalidCurrencyRequest);
        return { handled: false };
      }

      const result = await this.executeRequest(request);
      const responseText = this.createResponseText(request, result, messages);

      await this.messageSender.sendMessage(chatId, responseText);

      return { handled: true, request, result };
    } catch (error) {
      if (error instanceof InvalidExchangeRateDateError) {
        await this.messageSender.sendMessage(chatId, messages.invalidExchangeRateDate);
        return { handled: false };
      }

      if (
        error instanceof InvalidCurrencyCodeError ||
        error instanceof InvalidCurrencyAmountError ||
        error instanceof InvalidCurrencyListError
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

    if (request.type === 'multiple-rates' || request.type === 'historical-multiple-rates') {
      return this.getMultipleExchangeRates.execute(request);
    }

    return this.getExchangeRate.execute(request);
  }

  createResponseText(request, result, messages) {
    if (request.type === 'conversion') {
      return createConversionMessage(result, messages);
    }

    if (request.type === 'multiple-rates') {
      return createMultipleRatesMessage(result, messages);
    }

    if (request.type === 'historical-rate') {
      return createHistoricalRateMessage(result, messages);
    }

    if (request.type === 'historical-multiple-rates') {
      return createHistoricalMultipleRatesMessage(result, messages);
    }

    return createRateMessage(result, messages);
  }
}
