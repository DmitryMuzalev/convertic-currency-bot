/**
 * Port for obtaining an exchange rate from an external source.
 *
 * Infrastructure adapters must extend this class and implement `getRate`.
 */
export class ExchangeRateProvider {
  /**
   * Returns the value of one unit of the base currency in the quote currency.
   *
   * @param {string} baseCurrency ISO 4217 currency code, for example `EUR`.
   * @param {string} quoteCurrency ISO 4217 currency code, for example `USD`.
   * @returns {Promise<number>}
   */
  async getRate(baseCurrency, quoteCurrency) {
    void baseCurrency;
    void quoteCurrency;
    throw new Error('ExchangeRateProvider.getRate() must be implemented');
  }
}
