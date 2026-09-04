import { normalizeCurrencyCode } from '#domain/currency/normalize-currency-code.js';
import { InvalidCurrencyListError } from '#domain/errors/invalid-currency-list-error.js';

import { MAX_QUOTE_CURRENCIES } from '#application/rules/currency-request-limits.js';

const MIN_QUOTE_CURRENCIES = 2;

export class GetMultipleExchangeRates {
  constructor(exchangeRateProvider) {
    if (!exchangeRateProvider || typeof exchangeRateProvider.getRates !== 'function') {
      throw new TypeError('exchangeRateProvider must implement getRates()');
    }

    this.exchangeRateProvider = exchangeRateProvider;
  }

  async execute({ baseCurrency, quoteCurrencies } = {}) {
    const normalizedBaseCurrency = normalizeCurrencyCode(baseCurrency);

    if (!Array.isArray(quoteCurrencies)) {
      throw new InvalidCurrencyListError(quoteCurrencies);
    }

    const normalizedQuoteCurrencies = quoteCurrencies.map(normalizeCurrencyCode);
    const uniqueQuoteCurrencies = new Set(normalizedQuoteCurrencies);

    if (
      normalizedQuoteCurrencies.length < MIN_QUOTE_CURRENCIES ||
      normalizedQuoteCurrencies.length > MAX_QUOTE_CURRENCIES ||
      uniqueQuoteCurrencies.size !== normalizedQuoteCurrencies.length ||
      uniqueQuoteCurrencies.has(normalizedBaseCurrency)
    ) {
      throw new InvalidCurrencyListError(quoteCurrencies);
    }

    return this.exchangeRateProvider.getRates({
      baseCurrency: normalizedBaseCurrency,
      quoteCurrencies: normalizedQuoteCurrencies,
    });
  }
}
