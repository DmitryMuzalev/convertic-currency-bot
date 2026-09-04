import {
  HELP_MESSAGE,
  START_MESSAGE,
  UNKNOWN_COMMAND_MESSAGE,
} from '#application/messages/convertic-messages.js';

const COMMAND_PATTERN = /^\/([a-z]+)(?:@[a-z0-9_]+)?(?:\s|$)/i;

export class HandleTelegramMessage {
  constructor({ handleCurrencyMessage, messageSender } = {}) {
    if (!handleCurrencyMessage || typeof handleCurrencyMessage.execute !== 'function') {
      throw new TypeError('handleCurrencyMessage must implement execute()');
    }

    if (!messageSender || typeof messageSender.sendMessage !== 'function') {
      throw new TypeError('messageSender must implement sendMessage()');
    }

    this.handleCurrencyMessage = handleCurrencyMessage;
    this.messageSender = messageSender;
  }

  async execute({ chatId, text } = {}) {
    const command = extractCommand(text);

    if (command === null) {
      return this.handleCurrencyMessage.execute({ chatId, text });
    }

    if (command === 'start') {
      await this.messageSender.sendMessage(chatId, START_MESSAGE);
      return { handled: true, command };
    }

    if (command === 'help') {
      await this.messageSender.sendMessage(chatId, HELP_MESSAGE);
      return { handled: true, command };
    }

    await this.messageSender.sendMessage(chatId, UNKNOWN_COMMAND_MESSAGE);
    return { handled: false, command };
  }
}

function extractCommand(text) {
  if (typeof text !== 'string') {
    return null;
  }

  const match = text.trim().match(COMMAND_PATTERN);

  return match ? match[1].toLowerCase() : null;
}
