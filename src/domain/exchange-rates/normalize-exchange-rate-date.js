import { InvalidExchangeRateDateError } from '#domain/errors/invalid-exchange-rate-date-error.js';

const DATE_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

export function normalizeExchangeRateDate(date) {
  if (typeof date !== 'string') {
    throw new InvalidExchangeRateDateError(date);
  }

  const normalizedDate = date.trim();
  const parsedDate = new Date(`${normalizedDate}T00:00:00.000Z`);
  const isRealDate =
    DATE_PATTERN.test(normalizedDate) &&
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === normalizedDate;
  const today = new Date().toISOString().slice(0, 10);

  if (!isRealDate || normalizedDate > today) {
    throw new InvalidExchangeRateDateError(date);
  }

  return normalizedDate;
}
