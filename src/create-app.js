import { FrankfurterExchangeRateProvider } from '#adapters/exchange-rates/frankfurter-exchange-rate-provider.js';
import { TelegramBotApi } from '#adapters/telegram/telegram-bot-api.js';
import { GetExchangeRateAgainstUsd } from '#application/use-cases/get-exchange-rate-against-usd.js';
import { HandleCurrencyMessage } from '#application/use-cases/handle-currency-message.js';
import { buildApp } from '#infrastructure/http/build-app.js';

export function createApp({ telegramBotToken, logger = false } = {}) {
  const exchangeRateProvider = new FrankfurterExchangeRateProvider();
  const getExchangeRateAgainstUsd = new GetExchangeRateAgainstUsd(exchangeRateProvider);
  const messageSender = new TelegramBotApi({ botToken: telegramBotToken });
  const handleCurrencyMessage = new HandleCurrencyMessage({
    getExchangeRateAgainstUsd,
    messageSender,
  });

  return buildApp({
    handleCurrencyMessage,
    logger,
  });
}
