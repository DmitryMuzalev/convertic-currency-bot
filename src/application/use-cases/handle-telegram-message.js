import { ExchangeRateProviderError } from '#application/errors/exchange-rate-provider-error.js';
import { createCurrenciesMessage } from '#application/messages/format-currencies-message.js';
import {
  createCurrentSourceMessage,
  createSelectedSourceMessage,
  createSourcesMessage,
} from '#application/messages/format-exchange-rate-sources-message.js';
import { createSourceComparisonMessage } from '#application/messages/format-exchange-rate-source-comparison-message.js';
import { getMessages } from '#application/messages/get-messages.js';
import { InvalidCurrencyCodeError } from '#domain/errors/invalid-currency-code-error.js';
import { InvalidExchangeRateSourceError } from '#domain/errors/invalid-exchange-rate-source-error.js';

const COMMAND_PATTERN = /^\/([a-z]+)(?:@[a-z0-9_]+)?(?:\s+(.*))?$/i;

export class HandleTelegramMessage {
  constructor({
    handleCurrencyMessage,
    listCurrencies,
    listExchangeRateSources,
    compareExchangeRateSources,
    selectExchangeRateSource,
    userPreferencesRepository,
    messageSender,
  } = {}) {
    if (!handleCurrencyMessage || typeof handleCurrencyMessage.execute !== 'function') {
      throw new TypeError('handleCurrencyMessage must implement execute()');
    }

    if (!messageSender || typeof messageSender.sendMessage !== 'function') {
      throw new TypeError('messageSender must implement sendMessage()');
    }

    if (!listCurrencies || typeof listCurrencies.execute !== 'function') {
      throw new TypeError('listCurrencies must implement execute()');
    }

    if (!listExchangeRateSources || typeof listExchangeRateSources.execute !== 'function') {
      throw new TypeError('listExchangeRateSources must implement execute()');
    }

    if (!compareExchangeRateSources || typeof compareExchangeRateSources.execute !== 'function') {
      throw new TypeError('compareExchangeRateSources must implement execute()');
    }

    if (!selectExchangeRateSource || typeof selectExchangeRateSource.execute !== 'function') {
      throw new TypeError('selectExchangeRateSource must implement execute()');
    }

    if (
      !userPreferencesRepository ||
      typeof userPreferencesRepository.getExchangeRateSource !== 'function'
    ) {
      throw new TypeError('userPreferencesRepository must implement getExchangeRateSource()');
    }

    this.handleCurrencyMessage = handleCurrencyMessage;
    this.listCurrencies = listCurrencies;
    this.listExchangeRateSources = listExchangeRateSources;
    this.compareExchangeRateSources = compareExchangeRateSources;
    this.selectExchangeRateSource = selectExchangeRateSource;
    this.userPreferencesRepository = userPreferencesRepository;
    this.messageSender = messageSender;
  }

  async execute({ chatId, userId, text, languageCode } = {}) {
    const command = extractCommand(text);
    const messages = getMessages(languageCode);

    if (command === null) {
      return this.handleCurrencyMessage.execute({ chatId, userId, text, languageCode });
    }

    if (command.name === 'start') {
      await this.messageSender.sendMessage(chatId, messages.start);
      return { handled: true, command: command.name };
    }

    if (command.name === 'help') {
      await this.messageSender.sendMessage(chatId, messages.help);
      return { handled: true, command: command.name };
    }

    if (command.name === 'currencies') {
      return this.handleCurrenciesCommand(chatId, messages);
    }

    if (command.name === 'sources') {
      return this.handleSourcesCommand(chatId, messages);
    }

    if (command.name === 'source') {
      return this.handleSourceCommand({ chatId, userId, source: command.argument, messages });
    }

    if (command.name === 'compare') {
      return this.handleCompareCommand(chatId, command.argument, messages);
    }

    await this.messageSender.sendMessage(chatId, messages.unknownCommand);
    return { handled: false, command: command.name };
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

  async handleSourcesCommand(chatId, messages) {
    try {
      const sources = await this.listExchangeRateSources.execute();
      const responseText = createSourcesMessage(sources, messages);

      await this.messageSender.sendMessage(chatId, responseText);
      return { handled: true, command: 'sources', sources };
    } catch (error) {
      if (!(error instanceof ExchangeRateProviderError)) {
        throw error;
      }

      await this.messageSender.sendMessage(chatId, messages.exchangeRateUnavailable);
      return { handled: false, command: 'sources' };
    }
  }

  async handleSourceCommand({ chatId, userId, source, messages }) {
    try {
      if (source === '') {
        const currentSource = await this.userPreferencesRepository.getExchangeRateSource(userId);
        await this.messageSender.sendMessage(
          chatId,
          createCurrentSourceMessage(currentSource, messages),
        );

        return { handled: true, command: 'source', source: currentSource };
      }

      const selectedSource = await this.selectExchangeRateSource.execute({ userId, source });
      await this.messageSender.sendMessage(
        chatId,
        createSelectedSourceMessage(selectedSource, messages),
      );

      return { handled: true, command: 'source', source: selectedSource?.key ?? null };
    } catch (error) {
      if (error instanceof InvalidExchangeRateSourceError) {
        await this.messageSender.sendMessage(chatId, messages.invalidSource);
        return { handled: false, command: 'source' };
      }

      if (error instanceof ExchangeRateProviderError) {
        await this.messageSender.sendMessage(chatId, messages.exchangeRateUnavailable);
        return { handled: false, command: 'source' };
      }

      throw error;
    }
  }

  async handleCompareCommand(chatId, argument, messages) {
    const [baseCurrency, quoteCurrency, ...sources] = argument.split(/\s+/).filter(Boolean);

    try {
      const comparison = await this.compareExchangeRateSources.execute({
        baseCurrency,
        quoteCurrency,
        sources,
      });
      const responseText = createSourceComparisonMessage(comparison, messages);

      await this.messageSender.sendMessage(chatId, responseText);
      return { handled: true, command: 'compare', comparison };
    } catch (error) {
      if (
        error instanceof InvalidCurrencyCodeError ||
        error instanceof InvalidExchangeRateSourceError
      ) {
        await this.messageSender.sendMessage(chatId, messages.invalidComparisonRequest);
        return { handled: false, command: 'compare' };
      }

      if (error instanceof ExchangeRateProviderError) {
        await this.messageSender.sendMessage(chatId, messages.exchangeRateUnavailable);
        return { handled: false, command: 'compare' };
      }

      throw error;
    }
  }
}

function extractCommand(text) {
  if (typeof text !== 'string') {
    return null;
  }

  const match = text.trim().match(COMMAND_PATTERN);

  return match
    ? {
        name: match[1].toLowerCase(),
        argument: match[2]?.trim() ?? '',
      }
    : null;
}
