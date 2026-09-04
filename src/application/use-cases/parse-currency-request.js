import { MAX_QUOTE_CURRENCIES } from '#application/rules/currency-request-limits.js';

const DEFAULT_QUOTE_CURRENCY = 'USD';
const CURRENCY_CODE = '[A-Za-z]{3}';
const AMOUNT = '[0-9]+(?:[.,][0-9]+)?';
const DATE = '[0-9]{4}-[0-9]{2}-[0-9]{2}';
const END_PUNCTUATION = '[.!?]?';

const CONVERSION_PATTERN = new RegExp(
  `^(${AMOUNT})\\s+(${CURRENCY_CODE})(?:\\s+(${CURRENCY_CODE}))?${END_PUNCTUATION}$`,
);
const RATE_PATTERN = new RegExp(
  `^(${CURRENCY_CODE})(?:\\s+(${CURRENCY_CODE}))?${END_PUNCTUATION}$`,
);
const HISTORICAL_RATES_PATTERN = new RegExp(
  `^${CURRENCY_CODE}(?:\\s+${CURRENCY_CODE}){0,${MAX_QUOTE_CURRENCIES}}\\s+${DATE}${END_PUNCTUATION}$`,
);
const MULTIPLE_RATES_PATTERN = new RegExp(
  `^${CURRENCY_CODE}(?:\\s+${CURRENCY_CODE}){2,${MAX_QUOTE_CURRENCIES}}${END_PUNCTUATION}$`,
);

export function parseCurrencyRequest(text) {
  if (typeof text !== 'string') {
    return null;
  }

  const normalizedText = text.trim();
  const conversionMatch = normalizedText.match(CONVERSION_PATTERN);

  if (conversionMatch) {
    const amount = Number(conversionMatch[1].replace(',', '.'));

    if (!Number.isFinite(amount) || amount <= 0) {
      return null;
    }

    return {
      type: 'conversion',
      amount,
      baseCurrency: conversionMatch[2].toUpperCase(),
      quoteCurrency: (conversionMatch[3] ?? DEFAULT_QUOTE_CURRENCY).toUpperCase(),
    };
  }

  if (HISTORICAL_RATES_PATTERN.test(normalizedText)) {
    const parts = normalizedText.replace(/[.!?]$/, '').split(/\s+/);
    const date = parts.pop();
    const [baseCurrency, ...quoteCurrencies] = parts.map(currencyCode =>
      currencyCode.toUpperCase(),
    );

    if (quoteCurrencies.length < 2) {
      return {
        type: 'historical-rate',
        baseCurrency,
        quoteCurrency: quoteCurrencies[0] ?? DEFAULT_QUOTE_CURRENCY,
        date,
      };
    }

    return {
      type: 'historical-multiple-rates',
      baseCurrency,
      quoteCurrencies,
      date,
    };
  }

  if (MULTIPLE_RATES_PATTERN.test(normalizedText)) {
    const [baseCurrency, ...quoteCurrencies] = normalizedText
      .replace(/[.!?]$/, '')
      .split(/\s+/)
      .map(currencyCode => currencyCode.toUpperCase());

    return {
      type: 'multiple-rates',
      baseCurrency,
      quoteCurrencies,
    };
  }

  const rateMatch = normalizedText.match(RATE_PATTERN);

  if (!rateMatch) {
    return null;
  }

  return {
    type: 'rate',
    baseCurrency: rateMatch[1].toUpperCase(),
    quoteCurrency: (rateMatch[2] ?? DEFAULT_QUOTE_CURRENCY).toUpperCase(),
  };
}
