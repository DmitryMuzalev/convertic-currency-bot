import { InvalidExchangeRateSourceError } from '#domain/errors/invalid-exchange-rate-source-error.js';

export const AUTOMATIC_EXCHANGE_RATE_SOURCE = 'AUTO';

const SOURCE_PATTERN = /^[A-Z0-9_-]{2,32}$/;

export function normalizeExchangeRateSource(source) {
  if (typeof source !== 'string') {
    throw new InvalidExchangeRateSourceError(source);
  }

  const normalizedSource = source.trim().toUpperCase();

  if (!SOURCE_PATTERN.test(normalizedSource)) {
    throw new InvalidExchangeRateSourceError(source);
  }

  return normalizedSource === AUTOMATIC_EXCHANGE_RATE_SOURCE ? null : normalizedSource;
}
