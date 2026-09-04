import { FrankfurterExchangeRateProvider } from '#adapters/exchange-rates/frankfurter-exchange-rate-provider.js';
import { TelegramBotApi } from '#adapters/telegram/telegram-bot-api.js';
import { ConvertCurrency } from '#application/use-cases/convert-currency.js';
import { GetExchangeRate } from '#application/use-cases/get-exchange-rate.js';
import { HandleCurrencyMessage } from '#application/use-cases/handle-currency-message.js';
import { HandleTelegramMessage } from '#application/use-cases/handle-telegram-message.js';
import { buildApp } from '#infrastructure/http/build-app.js';

export function createApp({ telegramBotToken, logger = false } = {}) {
  const exchangeRateProvider = new FrankfurterExchangeRateProvider();
  const getExchangeRate = new GetExchangeRate(exchangeRateProvider);
  const convertCurrency = new ConvertCurrency(getExchangeRate);
  const messageSender = new TelegramBotApi({ botToken: telegramBotToken });
  const handleCurrencyMessage = new HandleCurrencyMessage({
    getExchangeRate,
    convertCurrency,
    messageSender,
  });
  const handleTelegramMessage = new HandleTelegramMessage({
    handleCurrencyMessage,
    messageSender,
  });

  return buildApp({
    handleTelegramMessage,
    logger,
  });
}
