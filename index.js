export class PricingClient {
  /**
   * Returns the current price of the asset pair, cached for the duration of the priceCacheDurationMs
   * @async
   * @param {string} from
   * @param {string} to
   * @returns {Promise<number>}
   */
  async getCurrentPrice (from, to) {
    throw new Error('Not implemented')
  }

  /**
   * Returns the historical price of the asset pair
   * @async
   * @param {HistoricalPriceOptions} opts
   * @returns {Promise<HistoricalPriceResult[]>}
   */
  async getHistoricalPrice (opts) {
    throw new Error('Not implemented')
  }
}

export class PricingProvider {
  /**
   * Creates a new PricingProvider instance.
   * @param {Config} config - The configuration object.
   * @param {config.client} config.client - The client instance.
   * @param {config.priceCacheDurationMs} config.priceCacheDurationMs - The duration of the price cache in milliseconds, defaults to 1 hour
   */
  constructor (config = {}) {
    this.client = config.client
    this.priceCacheDurationMs = config.priceCacheDurationMs || 60 * 60 * 1000

    this.lastPriceValue = null
    this.lastPriceTimestamp = null
  }

  /**
   * Returns the last fetched price of the asset pair, cached for the duration of the priceCacheDurationMs
   * @async
   * @param {string} from
   * @param {string} to
   * @returns {Promise<number>}
   */
  async getLastPrice (from, to) {
    const now = Date.now()
    if (this.lastPriceTimestamp && now - this.lastPriceTimestamp < this.priceCacheDurationMs) {
      return this.lastPriceValue
    }

    const price = await this.client.getCurrentPrice(from, to)
    this.lastPriceValue = price
    this.lastPriceTimestamp = now

    return price
  }

  /**
   * Returns the historical price of the asset pair
   * @async
   * @param {HistoricalPriceOptions} opts
   * @returns {Promise<HistoricalPriceResult[]>}
   */
  async getHistoricalPrice (opts) {
    return this.client.getHistoricalPrice(opts)
  }
}
