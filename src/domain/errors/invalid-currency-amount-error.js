export class InvalidCurrencyAmountError extends Error {
  constructor(amount) {
    super(`Invalid currency amount: ${String(amount)}`);
    this.name = 'InvalidCurrencyAmountError';
  }
}
