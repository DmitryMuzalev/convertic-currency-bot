/**
 * Port for obtaining an exchange rate from an external source.
 *
 * Infrastructure adapters must extend this class and implement its methods.
 */
export class ExchangeRateProvider {
  /**
   * Returns the value of one unit of the base currency in the quote currency.
   *
   * @param {object} request
   * @param {string} request.baseCurrency ISO 4217 currency code, for example `EUR`.
   * @param {string} request.quoteCurrency ISO 4217 currency code, for example `USD`.
   * @returns {Promise<{
   *   baseCurrency: string,
   *   quoteCurrency: string,
   *   rate: number,
   *   date: string
   * }>}
   */
  async getRate(request) {
    void request;
    throw new Error('ExchangeRateProvider.getRate() must be implemented');
  }

  /**
   * Returns the currencies currently supported by the provider.
   *
   * @returns {Promise<Array<{
   *   code: string,
   *   name: string,
   *   symbol: string|null
   * }>>}
   */
  async listCurrencies() {
    throw new Error('ExchangeRateProvider.listCurrencies() must be implemented');
  }
}
