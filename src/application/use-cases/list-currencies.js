export class ListCurrencies {
  constructor(exchangeRateProvider) {
    if (!exchangeRateProvider || typeof exchangeRateProvider.listCurrencies !== 'function') {
      throw new TypeError('exchangeRateProvider must implement listCurrencies()');
    }

    this.exchangeRateProvider = exchangeRateProvider;
  }

  async execute() {
    const currencies = await this.exchangeRateProvider.listCurrencies();

    return [...currencies].sort((first, second) => first.code.localeCompare(second.code));
  }
}
