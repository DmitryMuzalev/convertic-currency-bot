import { normalizeCurrencyCode } from '#domain/currency/normalize-currency-code.js';
import { normalizeExchangeRateDate } from '#domain/exchange-rates/normalize-exchange-rate-date.js';
import { normalizeExchangeRateSource } from '#domain/exchange-rates/normalize-exchange-rate-source.js';

const DEFAULT_QUOTE_CURRENCY = 'USD';

export class GetExchangeRate {
  constructor(exchangeRateProvider) {
    if (!exchangeRateProvider || typeof exchangeRateProvider.getRate !== 'function') {
      throw new TypeError('exchangeRateProvider must implement getRate()');
    }

    this.exchangeRateProvider = exchangeRateProvider;
  }

  async execute({ baseCurrency, quoteCurrency = DEFAULT_QUOTE_CURRENCY, date, source } = {}) {
    const normalizedBaseCurrency = normalizeCurrencyCode(baseCurrency);
    const normalizedQuoteCurrency = normalizeCurrencyCode(quoteCurrency);
    const normalizedDate = date === undefined ? null : normalizeExchangeRateDate(date);
    const normalizedSource =
      source === null || source === undefined ? null : normalizeExchangeRateSource(source);

    if (normalizedBaseCurrency === normalizedQuoteCurrency) {
      return {
        baseCurrency: normalizedBaseCurrency,
        quoteCurrency: normalizedQuoteCurrency,
        rate: 1,
        date: normalizedDate,
        source: normalizedSource,
      };
    }

    return this.exchangeRateProvider.getRate({
      baseCurrency: normalizedBaseCurrency,
      quoteCurrency: normalizedQuoteCurrency,
      date: normalizedDate,
      source: normalizedSource,
    });
  }
}
