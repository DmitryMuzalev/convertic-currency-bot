import { FrankfurterExchangeRateProvider } from '#adapters/exchange-rates/frankfurter-exchange-rate-provider.js';
import { InMemoryUserPreferencesRepository } from '#adapters/storage/in-memory-user-preferences-repository.js';
import { TelegramBotApi } from '#adapters/telegram/telegram-bot-api.js';
import { CompareExchangeRateSources } from '#application/use-cases/compare-exchange-rate-sources.js';
import { ConvertCurrency } from '#application/use-cases/convert-currency.js';
import { GetExchangeRate } from '#application/use-cases/get-exchange-rate.js';
import { GetMultipleExchangeRates } from '#application/use-cases/get-multiple-exchange-rates.js';
import { HandleCurrencyMessage } from '#application/use-cases/handle-currency-message.js';
import { HandleTelegramMessage } from '#application/use-cases/handle-telegram-message.js';
import { ListCurrencies } from '#application/use-cases/list-currencies.js';
import { ListExchangeRateSources } from '#application/use-cases/list-exchange-rate-sources.js';
import { RecognizeCurrencyRequest } from '#application/use-cases/recognize-currency-request.js';
import { SelectExchangeRateSource } from '#application/use-cases/select-exchange-rate-source.js';
import { buildApp } from '#infrastructure/http/build-app.js';

export function createApp({ telegramBotToken, logger = false } = {}) {
  const exchangeRateProvider = new FrankfurterExchangeRateProvider();
  const getExchangeRate = new GetExchangeRate(exchangeRateProvider);
  const getMultipleExchangeRates = new GetMultipleExchangeRates(exchangeRateProvider);
  const convertCurrency = new ConvertCurrency(getExchangeRate);
  const listCurrencies = new ListCurrencies(exchangeRateProvider);
  const listExchangeRateSources = new ListExchangeRateSources(exchangeRateProvider);
  const compareExchangeRateSources = new CompareExchangeRateSources({
    getExchangeRate,
    listExchangeRateSources,
  });
  const userPreferencesRepository = new InMemoryUserPreferencesRepository();
  const selectExchangeRateSource = new SelectExchangeRateSource({
    listExchangeRateSources,
    userPreferencesRepository,
  });
  const recognizeCurrencyRequest = new RecognizeCurrencyRequest(listCurrencies);
  const messageSender = new TelegramBotApi({ botToken: telegramBotToken });
  const handleCurrencyMessage = new HandleCurrencyMessage({
    recognizeCurrencyRequest,
    getExchangeRate,
    getMultipleExchangeRates,
    convertCurrency,
    userPreferencesRepository,
    messageSender,
  });
  const handleTelegramMessage = new HandleTelegramMessage({
    handleCurrencyMessage,
    listCurrencies,
    listExchangeRateSources,
    compareExchangeRateSources,
    selectExchangeRateSource,
    userPreferencesRepository,
    messageSender,
  });

  return buildApp({
    handleTelegramMessage,
    logger,
  });
}
