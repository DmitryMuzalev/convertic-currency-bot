export class InvalidCurrencyCodeError extends Error {
  constructor(currencyCode) {
    super(`Invalid currency code: ${String(currencyCode)}`);
    this.name = 'InvalidCurrencyCodeError';
  }
}
