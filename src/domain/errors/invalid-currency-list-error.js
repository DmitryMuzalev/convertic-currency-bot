export class InvalidCurrencyListError extends Error {
  constructor(currencyCodes) {
    super(`Invalid currency list: ${String(currencyCodes)}`);
    this.name = 'InvalidCurrencyListError';
  }
}
