export class UserPreferencesRepository {
  async getExchangeRateSource(userId) {
    void userId;
    throw new Error('UserPreferencesRepository.getExchangeRateSource() must be implemented');
  }

  async setExchangeRateSource(userId, source) {
    void userId;
    void source;
    throw new Error('UserPreferencesRepository.setExchangeRateSource() must be implemented');
  }

  async clearExchangeRateSource(userId) {
    void userId;
    throw new Error('UserPreferencesRepository.clearExchangeRateSource() must be implemented');
  }
}
