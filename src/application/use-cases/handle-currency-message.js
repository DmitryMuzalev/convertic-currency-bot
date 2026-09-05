import { ExchangeRateProviderError } from '#application/errors/exchange-rate-provider-error.js';
import {
  createConversionMessage,
  createDuplicateCurrencyMessage,
  createHistoricalMultipleRatesMessage,
  createHistoricalRateMessage,
  createMultipleRatesMessage,
  createRateMessage,
  createSameCurrencyMessage,
} from '#application/messages/format-currency-message.js';
import { createErrorMessage } from '#application/messages/format-error-message.js';
import { getMessages } from '#application/messages/get-messages.js';
import { InvalidCurrencyCodeError } from '#domain/errors/invalid-currency-code-error.js';
import { InvalidCurrencyAmountError } from '#domain/errors/invalid-currency-amount-error.js';
import { InvalidCurrencyListError } from '#domain/errors/invalid-currency-list-error.js';
import { InvalidExchangeRateDateError } from '#domain/errors/invalid-exchange-rate-date-error.js';
import { normalizeExchangeRateDate } from '#domain/exchange-rates/normalize-exchange-rate-date.js';

export class HandleCurrencyMessage {
  constructor({
    recognizeCurrencyRequest,
    getExchangeRate,
    getMultipleExchangeRates,
    convertCurrency,
    userPreferencesRepository,
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

    if (
      !userPreferencesRepository ||
      typeof userPreferencesRepository.getExchangeRateSource !== 'function'
    ) {
      throw new TypeError('userPreferencesRepository must implement getExchangeRateSource()');
    }

    this.recognizeCurrencyRequest = recognizeCurrencyRequest;
    this.getExchangeRate = getExchangeRate;
    this.getMultipleExchangeRates = getMultipleExchangeRates;
    this.convertCurrency = convertCurrency;
    this.userPreferencesRepository = userPreferencesRepository;
    this.messageSender = messageSender;
  }

  async execute({ chatId, userId, text, languageCode } = {}) {
    const messages = getMessages(languageCode);
    let selectedSource = null;

    try {
      const request = await this.recognizeCurrencyRequest.execute(text);

      if (!request) {
        await this.messageSender.sendMessage(
          chatId,
          createErrorMessage(messages.invalidCurrencyRequest, messages),
        );
        return { handled: false };
      }

      const duplicateCurrency = findDuplicateCurrency(request);

      if (duplicateCurrency) {
        if (request.date !== undefined) {
          normalizeExchangeRateDate(request.date);
        }

        await this.messageSender.sendMessage(
          chatId,
          createDuplicateCurrencyMessage(duplicateCurrency, messages),
        );
        return { handled: false, request };
      }

      if (request.baseCurrency === request.quoteCurrency) {
        if (request.date !== undefined) {
          normalizeExchangeRateDate(request.date);
        }

        await this.messageSender.sendMessage(chatId, createSameCurrencyMessage(request, messages));
        return { handled: true, request };
      }

      selectedSource = await this.userPreferencesRepository.getExchangeRateSource(userId);
      const requestWithSource = { ...request, source: selectedSource };
      const result = await this.executeRequest(requestWithSource);
      const responseText = this.createResponseText(requestWithSource, result, messages);

      await this.messageSender.sendMessage(chatId, responseText);

      return { handled: true, request: requestWithSource, result };
    } catch (error) {
      if (error instanceof InvalidExchangeRateDateError) {
        await this.messageSender.sendMessage(
          chatId,
          createErrorMessage(messages.invalidExchangeRateDate, messages),
        );
        return { handled: false };
      }

      if (
        error instanceof InvalidCurrencyCodeError ||
        error instanceof InvalidCurrencyAmountError ||
        error instanceof InvalidCurrencyListError
      ) {
        await this.messageSender.sendMessage(
          chatId,
          createErrorMessage(messages.invalidCurrencyRequest, messages),
        );
        return { handled: false };
      }

      if (error instanceof ExchangeRateProviderError) {
        const message =
          selectedSource && error.statusCode === 422
            ? messages.sourceUnavailableForPair
            : error.statusCode === 422
              ? messages.currencyPairNotFound
              : messages.exchangeRateUnavailable;

        await this.messageSender.sendMessage(chatId, createErrorMessage(message, messages));
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

function findDuplicateCurrency({ baseCurrency, quoteCurrencies }) {
  if (!Array.isArray(quoteCurrencies)) {
    return null;
  }

  const seenCurrencies = new Set([baseCurrency]);

  for (const currency of quoteCurrencies) {
    if (seenCurrencies.has(currency)) {
      return currency;
    }

    seenCurrencies.add(currency);
  }

  return null;
}
