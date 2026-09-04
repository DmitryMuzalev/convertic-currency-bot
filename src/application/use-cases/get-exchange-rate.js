import { normalizeCurrencyCode } from '#domain/currency/normalize-currency-code.js';

const DEFAULT_QUOTE_CURRENCY = 'USD';

export class GetExchangeRate {
  constructor(exchangeRateProvider) {
    if (!exchangeRateProvider || typeof exchangeRateProvider.getRate !== 'function') {
      throw new TypeError('exchangeRateProvider must implement getRate()');
    }

    this.exchangeRateProvider = exchangeRateProvider;
  }

  async execute({ baseCurrency, quoteCurrency = DEFAULT_QUOTE_CURRENCY } = {}) {
    const normalizedBaseCurrency = normalizeCurrencyCode(baseCurrency);
    const normalizedQuoteCurrency = normalizeCurrencyCode(quoteCurrency);

    if (normalizedBaseCurrency === normalizedQuoteCurrency) {
      return {
        baseCurrency: normalizedBaseCurrency,
        quoteCurrency: normalizedQuoteCurrency,
        rate: 1,
        date: null,
      };
    }

    return this.exchangeRateProvider.getRate({
      baseCurrency: normalizedBaseCurrency,
      quoteCurrency: normalizedQuoteCurrency,
    });
  }
}
