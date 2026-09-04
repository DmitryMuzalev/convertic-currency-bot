import { UserPreferencesRepository } from '#application/ports/user-preferences-repository.js';

export class InMemoryUserPreferencesRepository extends UserPreferencesRepository {
  constructor() {
    super();
    this.exchangeRateSources = new Map();
  }

  async getExchangeRateSource(userId) {
    return this.exchangeRateSources.get(normalizeUserId(userId)) ?? null;
  }

  async setExchangeRateSource(userId, source) {
    this.exchangeRateSources.set(normalizeUserId(userId), source);
  }

  async clearExchangeRateSource(userId) {
    this.exchangeRateSources.delete(normalizeUserId(userId));
  }
}

function normalizeUserId(userId) {
  const isValidNumber = typeof userId === 'number' && Number.isSafeInteger(userId);
  const isValidString = typeof userId === 'string' && userId.trim() !== '';

  if (!isValidNumber && !isValidString) {
    throw new TypeError('userId must be an integer or a non-empty string');
  }

  return String(userId).trim();
}
