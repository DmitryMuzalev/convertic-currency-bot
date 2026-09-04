import { normalizeExchangeRateSource } from '#domain/exchange-rates/normalize-exchange-rate-source.js';
import { InvalidExchangeRateSourceError } from '#domain/errors/invalid-exchange-rate-source-error.js';

export class SelectExchangeRateSource {
  constructor({ listExchangeRateSources, userPreferencesRepository } = {}) {
    if (!listExchangeRateSources || typeof listExchangeRateSources.execute !== 'function') {
      throw new TypeError('listExchangeRateSources must implement execute()');
    }

    if (
      !userPreferencesRepository ||
      typeof userPreferencesRepository.setExchangeRateSource !== 'function' ||
      typeof userPreferencesRepository.clearExchangeRateSource !== 'function'
    ) {
      throw new TypeError('userPreferencesRepository must implement source preference methods');
    }

    this.listExchangeRateSources = listExchangeRateSources;
    this.userPreferencesRepository = userPreferencesRepository;
  }

  async execute({ userId, source } = {}) {
    const normalizedSource = normalizeExchangeRateSource(source);

    if (normalizedSource === null) {
      await this.userPreferencesRepository.clearExchangeRateSource(userId);
      return null;
    }

    const sources = await this.listExchangeRateSources.execute();
    const selectedSource = sources.find(candidate => candidate.key === normalizedSource);

    if (!selectedSource) {
      throw new InvalidExchangeRateSourceError(source);
    }

    await this.userPreferencesRepository.setExchangeRateSource(userId, selectedSource.key);

    return selectedSource;
  }
}
