export class HandleCurrencyMessage {
  constructor({ getExchangeRateAgainstUsd, messageSender } = {}) {
    if (!getExchangeRateAgainstUsd || typeof getExchangeRateAgainstUsd.execute !== 'function') {
      throw new TypeError('getExchangeRateAgainstUsd must implement execute()');
    }

    if (!messageSender || typeof messageSender.sendMessage !== 'function') {
      throw new TypeError('messageSender must implement sendMessage()');
    }

    this.getExchangeRateAgainstUsd = getExchangeRateAgainstUsd;
    this.messageSender = messageSender;
  }

  async execute({ chatId, currencyCode } = {}) {
    const rate = await this.getExchangeRateAgainstUsd.execute(currencyCode);
    const normalizedCurrencyCode = currencyCode.trim().toUpperCase();
    const text = `1 ${normalizedCurrencyCode} = ${rate} USD`;

    await this.messageSender.sendMessage(chatId, text);

    return {
      currencyCode: normalizedCurrencyCode,
      rate,
    };
  }
}
