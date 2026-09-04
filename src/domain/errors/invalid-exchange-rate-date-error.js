export class InvalidExchangeRateDateError extends Error {
  constructor(date) {
    super(`Invalid exchange rate date: ${String(date)}`);
    this.name = 'InvalidExchangeRateDateError';
  }
}
