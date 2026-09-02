export class ExchangeRateProviderError extends Error {
  constructor(message, { cause, statusCode } = {}) {
    super(message, { cause });
    this.name = 'ExchangeRateProviderError';
    this.statusCode = statusCode;
  }
}
