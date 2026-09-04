import { extractCurrencyRequestFromText } from './extract-currency-request-from-text.js';
import { parseCurrencyRequest } from './parse-currency-request.js';

const CURRENCY_LIKE_TOKEN_PATTERN = /(?<![A-Za-z0-9_])[A-Za-z]{3}(?![A-Za-z0-9_])/;

export class RecognizeCurrencyRequest {
  constructor(listCurrencies) {
    if (!listCurrencies || typeof listCurrencies.execute !== 'function') {
      throw new TypeError('listCurrencies must implement execute()');
    }

    this.listCurrencies = listCurrencies;
  }

  async execute(text) {
    const parsedRequest = parseCurrencyRequest(text);

    if (parsedRequest || !containsCurrencyLikeToken(text)) {
      return parsedRequest;
    }

    const currencies = await this.listCurrencies.execute();

    return extractCurrencyRequestFromText(text, currencies);
  }
}

function containsCurrencyLikeToken(text) {
  return typeof text === 'string' && CURRENCY_LIKE_TOKEN_PATTERN.test(text);
}
