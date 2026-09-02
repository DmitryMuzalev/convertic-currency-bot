export class TelegramApiError extends Error {
  constructor(message, { cause, statusCode, errorCode, parameters } = {}) {
    super(message, { cause });
    this.name = 'TelegramApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.parameters = parameters;
  }
}
