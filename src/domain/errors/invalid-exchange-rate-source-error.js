export class InvalidExchangeRateSourceError extends Error {
  constructor(source) {
    super(`Invalid exchange rate source: ${String(source)}`);
    this.name = 'InvalidExchangeRateSourceError';
  }
}
