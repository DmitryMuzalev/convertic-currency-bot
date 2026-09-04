import { InvalidCurrencyAmountError } from '#domain/errors/invalid-currency-amount-error.js';

export class ConvertCurrency {
  constructor(getExchangeRate) {
    if (!getExchangeRate || typeof getExchangeRate.execute !== 'function') {
      throw new TypeError('getExchangeRate must implement execute()');
    }

    this.getExchangeRate = getExchangeRate;
  }

  async execute({ amount, baseCurrency, quoteCurrency, source } = {}) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new InvalidCurrencyAmountError(amount);
    }

    const exchangeRate = await this.getExchangeRate.execute({
      baseCurrency,
      quoteCurrency,
      source,
    });

    return {
      ...exchangeRate,
      amount,
      convertedAmount: amount * exchangeRate.rate,
    };
  }
}
