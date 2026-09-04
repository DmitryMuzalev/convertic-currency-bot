import { normalizeCurrencyCode } from '#domain/currency/normalize-currency-code.js';
import { normalizeExchangeRateDate } from '#domain/exchange-rates/normalize-exchange-rate-date.js';

const DEFAULT_QUOTE_CURRENCY = 'USD';

export class GetExchangeRate {
  constructor(exchangeRateProvider) {
    if (!exchangeRateProvider || typeof exchangeRateProvider.getRate !== 'function') {
      throw new TypeError('exchangeRateProvider must implement getRate()');
    }

    this.exchangeRateProvider = exchangeRateProvider;
  }

  async execute({ baseCurrency, quoteCurrency = DEFAULT_QUOTE_CURRENCY, date } = {}) {
    const normalizedBaseCurrency = normalizeCurrencyCode(baseCurrency);
    const normalizedQuoteCurrency = normalizeCurrencyCode(quoteCurrency);
    const normalizedDate = date === undefined ? null : normalizeExchangeRateDate(date);

    if (normalizedBaseCurrency === normalizedQuoteCurrency) {
      return {
        baseCurrency: normalizedBaseCurrency,
        quoteCurrency: normalizedQuoteCurrency,
        rate: 1,
        date: normalizedDate,
      };
    }

    return this.exchangeRateProvider.getRate({
      baseCurrency: normalizedBaseCurrency,
      quoteCurrency: normalizedQuoteCurrency,
      date: normalizedDate,
    });
  }
}
