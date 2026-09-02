import { InvalidCurrencyCodeError } from '#domain/errors/invalid-currency-code-error.js';

const USD = 'USD';
const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

export class GetExchangeRateAgainstUsd {
  constructor(exchangeRateProvider) {
    if (!exchangeRateProvider || typeof exchangeRateProvider.getRate !== 'function') {
      throw new TypeError('exchangeRateProvider must implement getRate()');
    }

    this.exchangeRateProvider = exchangeRateProvider;
  }

  async execute(currencyCode) {
    const normalizedCurrencyCode = normalizeCurrencyCode(currencyCode);

    if (normalizedCurrencyCode === USD) {
      return 1;
    }

    return this.exchangeRateProvider.getRate(normalizedCurrencyCode, USD);
  }
}

function normalizeCurrencyCode(currencyCode) {
  if (typeof currencyCode !== 'string') {
    throw new InvalidCurrencyCodeError(currencyCode);
  }

  const normalizedCurrencyCode = currencyCode.trim().toUpperCase();

  if (!CURRENCY_CODE_PATTERN.test(normalizedCurrencyCode)) {
    throw new InvalidCurrencyCodeError(currencyCode);
  }

  return normalizedCurrencyCode;
}
