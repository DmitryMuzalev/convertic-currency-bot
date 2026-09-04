import { ExchangeRateProviderError } from '#application/errors/exchange-rate-provider-error.js';
import { normalizeCurrencyCode } from '#domain/currency/normalize-currency-code.js';
import { normalizeExchangeRateSource } from '#domain/exchange-rates/normalize-exchange-rate-source.js';
import { InvalidExchangeRateSourceError } from '#domain/errors/invalid-exchange-rate-source-error.js';

const MIN_SOURCES = 2;
const MAX_SOURCES = 5;

export class CompareExchangeRateSources {
  constructor({ getExchangeRate, listExchangeRateSources } = {}) {
    if (!getExchangeRate || typeof getExchangeRate.execute !== 'function') {
      throw new TypeError('getExchangeRate must implement execute()');
    }

    if (!listExchangeRateSources || typeof listExchangeRateSources.execute !== 'function') {
      throw new TypeError('listExchangeRateSources must implement execute()');
    }

    this.getExchangeRate = getExchangeRate;
    this.listExchangeRateSources = listExchangeRateSources;
  }

  async execute({ baseCurrency, quoteCurrency, sources } = {}) {
    const normalizedBaseCurrency = normalizeCurrencyCode(baseCurrency);
    const normalizedQuoteCurrency = normalizeCurrencyCode(quoteCurrency);
    const normalizedSources = normalizeSources(sources);
    const availableSources = await this.listExchangeRateSources.execute();
    const sourcesByKey = new Map(availableSources.map(source => [source.key, source]));

    if (normalizedSources.some(source => !sourcesByKey.has(source))) {
      throw new InvalidExchangeRateSourceError(sources);
    }

    const comparisons = await Promise.all(
      normalizedSources.map(source =>
        this.getComparison({
          baseCurrency: normalizedBaseCurrency,
          quoteCurrency: normalizedQuoteCurrency,
          source: sourcesByKey.get(source),
        }),
      ),
    );

    return {
      baseCurrency: normalizedBaseCurrency,
      quoteCurrency: normalizedQuoteCurrency,
      comparisons,
    };
  }

  async getComparison({ baseCurrency, quoteCurrency, source }) {
    try {
      const result = await this.getExchangeRate.execute({
        baseCurrency,
        quoteCurrency,
        source: source.key,
      });

      return {
        source,
        available: true,
        rate: result.rate,
        date: result.date,
      };
    } catch (error) {
      if (error instanceof ExchangeRateProviderError && error.statusCode === 422) {
        return {
          source,
          available: false,
          rate: null,
          date: null,
        };
      }

      throw error;
    }
  }
}

function normalizeSources(sources) {
  if (!Array.isArray(sources) || sources.length < MIN_SOURCES || sources.length > MAX_SOURCES) {
    throw new InvalidExchangeRateSourceError(sources);
  }

  const normalizedSources = sources.map(source => normalizeExchangeRateSource(source));

  if (normalizedSources.includes(null) || new Set(normalizedSources).size !== sources.length) {
    throw new InvalidExchangeRateSourceError(sources);
  }

  return normalizedSources;
}
