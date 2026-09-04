import { ExchangeRateProviderError } from '#application/errors/exchange-rate-provider-error.js';
import { ExchangeRateProvider } from '#application/ports/exchange-rate-provider.js';

const DEFAULT_BASE_URL = 'https://api.frankfurter.dev/v2';
const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

export class FrankfurterExchangeRateProvider extends ExchangeRateProvider {
  constructor({ baseUrl = DEFAULT_BASE_URL, fetchFunction = globalThis.fetch } = {}) {
    super();

    if (typeof fetchFunction !== 'function') {
      throw new TypeError('fetchFunction must be a function');
    }

    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetchFunction = fetchFunction;
  }

  async getRate({ baseCurrency, quoteCurrency, date = null }) {
    const path = [
      this.baseUrl,
      'rate',
      encodeURIComponent(baseCurrency),
      encodeURIComponent(quoteCurrency),
    ].join('/');
    const url = date ? `${path}?date=${encodeURIComponent(date)}` : path;

    const payload = await this.fetchJson(url);

    if (!isValidRate(payload, baseCurrency, quoteCurrency)) {
      throw new ExchangeRateProviderError('Exchange rate provider returned an invalid rate');
    }

    return {
      baseCurrency: payload.base,
      quoteCurrency: payload.quote,
      rate: payload.rate,
      date: payload.date,
    };
  }

  async getRates({ baseCurrency, quoteCurrencies, date = null }) {
    const quotes = quoteCurrencies.map(encodeURIComponent).join(',');
    const dateQuery = date ? `&date=${encodeURIComponent(date)}` : '';
    const url = `${this.baseUrl}/rates?base=${encodeURIComponent(baseCurrency)}&quotes=${quotes}${dateQuery}`;
    const payload = await this.fetchJson(url);

    if (!Array.isArray(payload) || payload.length !== quoteCurrencies.length) {
      throw new ExchangeRateProviderError('Exchange rate provider returned invalid rates');
    }

    const ratesByQuoteCurrency = new Map();

    for (const rate of payload) {
      if (
        !quoteCurrencies.includes(rate?.quote) ||
        !isValidRate(rate, baseCurrency, rate.quote) ||
        ratesByQuoteCurrency.has(rate.quote)
      ) {
        throw new ExchangeRateProviderError('Exchange rate provider returned invalid rates');
      }

      ratesByQuoteCurrency.set(rate.quote, {
        quoteCurrency: rate.quote,
        rate: rate.rate,
        date: rate.date,
      });
    }

    return {
      baseCurrency,
      rates: quoteCurrencies.map(quoteCurrency => ratesByQuoteCurrency.get(quoteCurrency)),
    };
  }

  async listCurrencies() {
    const payload = await this.fetchJson(`${this.baseUrl}/currencies`);

    if (!Array.isArray(payload) || !payload.every(isValidCurrency)) {
      throw new ExchangeRateProviderError(
        'Exchange rate provider returned an invalid currency catalog',
      );
    }

    return Object.freeze(
      payload.map(currency =>
        Object.freeze({
          code: currency.iso_code,
          name: currency.name,
          symbol: currency.symbol,
        }),
      ),
    );
  }

  async fetchJson(url) {
    let response;

    try {
      response = await this.fetchFunction(url, {
        headers: { accept: 'application/json' },
      });
    } catch (error) {
      throw new ExchangeRateProviderError('Failed to connect to the exchange rate provider', {
        cause: error,
      });
    }

    if (!response.ok) {
      const providerMessage = await readProviderErrorMessage(response);

      throw new ExchangeRateProviderError(
        providerMessage ?? `Exchange rate provider returned HTTP ${response.status}`,
        { statusCode: response.status },
      );
    }

    try {
      return await response.json();
    } catch (error) {
      throw new ExchangeRateProviderError('Exchange rate provider returned invalid JSON', {
        cause: error,
      });
    }
  }
}

function isValidRate(rate, baseCurrency, quoteCurrency) {
  return (
    rate !== null &&
    typeof rate === 'object' &&
    rate.base === baseCurrency &&
    rate.quote === quoteCurrency &&
    typeof rate.date === 'string' &&
    typeof rate.rate === 'number' &&
    Number.isFinite(rate.rate) &&
    rate.rate > 0
  );
}

function isValidCurrency(currency) {
  return (
    currency !== null &&
    typeof currency === 'object' &&
    typeof currency.iso_code === 'string' &&
    CURRENCY_CODE_PATTERN.test(currency.iso_code) &&
    typeof currency.name === 'string' &&
    currency.name.trim() !== '' &&
    (currency.symbol === null || typeof currency.symbol === 'string')
  );
}

async function readProviderErrorMessage(response) {
  try {
    const payload = await response.json();
    return typeof payload.message === 'string' ? payload.message : null;
  } catch {
    return null;
  }
}
