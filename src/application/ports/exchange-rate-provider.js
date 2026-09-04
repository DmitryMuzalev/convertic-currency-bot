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
   * @param {string|null} [request.date] Date in `YYYY-MM-DD` format, or `null` for latest.
   * @param {string|null} [request.source] Provider source key, or `null` for automatic selection.
   * @returns {Promise<{
   *   baseCurrency: string,
   *   quoteCurrency: string,
   *   rate: number,
   *   date: string,
   *   source: string|null
   * }>}
   */
  async getRate(request) {
    void request;
    throw new Error('ExchangeRateProvider.getRate() must be implemented');
  }

  /**
   * Returns rates for one base currency against several quote currencies.
   *
   * @param {object} request
   * @param {string} request.baseCurrency
   * @param {string[]} request.quoteCurrencies
   * @param {string|null} [request.date] Date in `YYYY-MM-DD` format, or `null` for latest.
   * @param {string|null} [request.source] Provider source key, or `null` for automatic selection.
   * @returns {Promise<{
   *   baseCurrency: string,
   *   rates: Array<{quoteCurrency: string, rate: number, date: string}>,
   *   source: string|null
   * }>}
   */
  async getRates(request) {
    void request;
    throw new Error('ExchangeRateProvider.getRates() must be implemented');
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

  /**
   * Returns the rate sources known to the provider.
   *
   * @returns {Promise<Array<{
   *   key: string,
   *   name: string,
   *   countryCode: string|null
   * }>>}
   */
  async listSources() {
    throw new Error('ExchangeRateProvider.listSources() must be implemented');
  }
}
