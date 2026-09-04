import { InvalidCurrencyCodeError } from '#domain/errors/invalid-currency-code-error.js';

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

export function normalizeCurrencyCode(currencyCode) {
  if (typeof currencyCode !== 'string') {
    throw new InvalidCurrencyCodeError(currencyCode);
  }

  const normalizedCurrencyCode = currencyCode.trim().toUpperCase();

  if (!CURRENCY_CODE_PATTERN.test(normalizedCurrencyCode)) {
    throw new InvalidCurrencyCodeError(currencyCode);
  }

  return normalizedCurrencyCode;
}
