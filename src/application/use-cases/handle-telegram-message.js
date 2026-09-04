import { ExchangeRateProviderError } from '#application/errors/exchange-rate-provider-error.js';
import { createCurrenciesMessage } from '#application/messages/format-currencies-message.js';
import { getMessages } from '#application/messages/get-messages.js';

const COMMAND_PATTERN = /^\/([a-z]+)(?:@[a-z0-9_]+)?(?:\s|$)/i;

export class HandleTelegramMessage {
  constructor({ handleCurrencyMessage, listCurrencies, messageSender } = {}) {
    if (!handleCurrencyMessage || typeof handleCurrencyMessage.execute !== 'function') {
      throw new TypeError('handleCurrencyMessage must implement execute()');
    }

    if (!messageSender || typeof messageSender.sendMessage !== 'function') {
      throw new TypeError('messageSender must implement sendMessage()');
    }

    if (!listCurrencies || typeof listCurrencies.execute !== 'function') {
      throw new TypeError('listCurrencies must implement execute()');
    }

    this.handleCurrencyMessage = handleCurrencyMessage;
    this.listCurrencies = listCurrencies;
    this.messageSender = messageSender;
  }

  async execute({ chatId, text, languageCode } = {}) {
    const command = extractCommand(text);
    const messages = getMessages(languageCode);

    if (command === null) {
      return this.handleCurrencyMessage.execute({ chatId, text, languageCode });
    }

    if (command === 'start') {
      await this.messageSender.sendMessage(chatId, messages.start);
      return { handled: true, command };
    }

    if (command === 'help') {
      await this.messageSender.sendMessage(chatId, messages.help);
      return { handled: true, command };
    }

    if (command === 'currencies') {
      return this.handleCurrenciesCommand(chatId, messages);
    }

    await this.messageSender.sendMessage(chatId, messages.unknownCommand);
    return { handled: false, command };
  }

  async handleCurrenciesCommand(chatId, messages) {
    try {
      const currencies = await this.listCurrencies.execute();
      const responseText = createCurrenciesMessage(currencies, messages);

      await this.messageSender.sendMessage(chatId, responseText);
      return { handled: true, command: 'currencies', currencies };
    } catch (error) {
      if (!(error instanceof ExchangeRateProviderError)) {
        throw error;
      }

      await this.messageSender.sendMessage(chatId, messages.exchangeRateUnavailable);
      return { handled: false, command: 'currencies' };
    }
  }
}

function extractCommand(text) {
  if (typeof text !== 'string') {
    return null;
  }

  const match = text.trim().match(COMMAND_PATTERN);

  return match ? match[1].toLowerCase() : null;
}
