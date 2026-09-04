export class ListExchangeRateSources {
  constructor(exchangeRateProvider) {
    if (!exchangeRateProvider || typeof exchangeRateProvider.listSources !== 'function') {
      throw new TypeError('exchangeRateProvider must implement listSources()');
    }

    this.exchangeRateProvider = exchangeRateProvider;
  }

  async execute() {
    const sources = await this.exchangeRateProvider.listSources();

    return [...sources].sort((first, second) => first.key.localeCompare(second.key));
  }
}
