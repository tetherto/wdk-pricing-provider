// Copyright 2024 Tether Operations Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

'use strict'

/**
 * @typedef {Object} HistoricalPriceResult
 * @property {number} timestamp - Timestamp of the price point
 * @property {number} price - Price at the given timestamp
 */

/**
 * @typedef {Object} HistoricalPriceOptions
 * @property {number} start - Start of the time range as a Unix timestamp in milliseconds
 * @property {number} end - End of the time range as a Unix timestamp in milliseconds
 * @property {string} [timeframe='1D'] - Timeframe for the historical data (e.g. '1D', '1h', '1m')
 */

/**
 * @typedef {Object} GetPriceOptions
 * @property {boolean} [forceRefresh=false] - Bypass cache and fetch a fresh price
 */

/**
 * @typedef {Object} PricePair
 * @property {string} from - Source asset symbol
 * @property {string} to - Target asset symbol
 */

/**
 * @typedef {Object} PriceData
 * @property {number} lastPrice - The last traded price
 * @property {number} dailyChange - Absolute price change over the last 24h
 * @property {number} dailyChangeRelative - Relative price change over the last 24h (multiply by 100 for percentage)
 */

/**
 * @typedef {Object} PricingProviderConfig
 * @property {PricingClient} client - The pricing client instance
 * @property {number} [priceCacheDurationMs=3600000] - Cache duration in milliseconds, defaults to 1 hour
 */

export class PricingClient {
  /**
   * Returns the current price of an asset pair
   * @param {string} from - Source asset symbol
   * @param {string} to - Target asset symbol
   * @returns {Promise<number>}
   */
  async getCurrentPrice (from, to) {
    throw new Error('Not implemented')
  }

  /**
   * Returns the current prices for multiple asset pairs
   * @param {PricePair[]} list - Array of asset pairs
   * @returns {Promise<number[]>}
   */
  async getMultiCurrentPrices (list) {
    throw new Error('Not implemented')
  }

  /**
   * Returns full price data (last price, daily change) for multiple asset pairs.
   * @param {PricePair[]} list - Array of asset pairs
   * @returns {Promise<PriceData[]>}
   */
  async getMultiPriceData (list) {
    throw new Error('Not implemented')
  }

  /**
   * Returns the historical price of an asset pair
   * @param {string} from - Source asset symbol
   * @param {string} to - Target asset symbol
   * @param {HistoricalPriceOptions} [opts={}]
   * @returns {Promise<HistoricalPriceResult[]>}
   */
  async getHistoricalPrice (from, to, opts = {}) {
    throw new Error('Not implemented')
  }
}

export class PricingProvider {
  /**
   * Creates a new PricingProvider instance
   * @param {PricingProviderConfig} config
   */
  constructor (config = {}) {
    this.client = config.client
    this.priceCacheDurationMs = config.priceCacheDurationMs || 60 * 60 * 1000

    /** @type {Object<string, { lastPriceValue: number, lastPriceTimestamp: number }>} */
    this.priceCacheStore = {}

    /** @type {Object<string, { priceData: PriceData, lastPriceTimestamp: number }>} */
    this.priceDataCacheStore = {}
  }

  /**
   * Returns the last fetched price of an asset pair, cached for the duration of priceCacheDurationMs
   * @param {string} from - Source asset symbol
   * @param {string} to - Target asset symbol
   * @param {GetPriceOptions} [options={}]
   * @returns {Promise<number>}
   */
  async getLastPrice (from, to, options = {}) {
    const now = Date.now()

    const cacheKey = `${from.toUpperCase()}${to.toUpperCase()}`
    if (!options.forceRefresh && this.priceCacheStore[cacheKey]) {
      const lastPriceTimestamp =
        this.priceCacheStore[cacheKey].lastPriceTimestamp
      if (
        lastPriceTimestamp &&
        now - lastPriceTimestamp < this.priceCacheDurationMs
      ) {
        return this.priceCacheStore[cacheKey].lastPriceValue
      }
    }

    const price = await this.client.getCurrentPrice(from, to)
    this.priceCacheStore[cacheKey] = {
      lastPriceValue: price,
      lastPriceTimestamp: now
    }

    return price
  }

  /**
   * Returns the last fetched prices for multiple asset pairs, with caching
   * @param {PricePair[]} list - Array of asset pairs
   * @param {GetPriceOptions} [options={}]
   * @returns {Promise<number[]>}
   */
  async getMultiLastPrices (list, options = {}) {
    return Promise.all(
      list.map(({ from, to }) => this.getLastPrice(from, to, options))
    )
  }

  /**
   * Returns full price data for an asset pair, cached for the duration of priceCacheDurationMs.
   * Includes last price, daily change, and relative daily change.
   * @param {string} from - Source asset symbol
   * @param {string} to - Target asset symbol
   * @param {GetPriceOptions} [options={}]
   * @returns {Promise<PriceData>}
   */
  async getLastPriceData (from, to, options = {}) {
    const now = Date.now()
    const cacheKey = `${from.toUpperCase()}${to.toUpperCase()}`
    const cached = this.priceDataCacheStore[cacheKey]

    if (!options.forceRefresh && cached) {
      if (now - cached.lastPriceTimestamp < this.priceCacheDurationMs) {
        return cached.priceData
      }
    }

    const [priceData] = await this.client.getMultiPriceData([{ from, to }])
    this.priceDataCacheStore[cacheKey] = { priceData, lastPriceTimestamp: now }

    return priceData
  }

  /**
   * Returns full price data for multiple asset pairs, with per-pair caching.
   * @param {PricePair[]} list - Array of asset pairs
   * @param {GetPriceOptions} [options={}]
   * @returns {Promise<PriceData[]>}
   */
  async getMultiLastPriceData (list, options = {}) {
    const now = Date.now()
    const toFetch = []
    const cacheKeys = list.map(
      ({ from, to }) => `${from.toUpperCase()}${to.toUpperCase()}`
    )

    for (let i = 0; i < list.length; i++) {
      const cached = this.priceDataCacheStore[cacheKeys[i]]
      if (
        options.forceRefresh ||
        !cached ||
        now - cached.lastPriceTimestamp >= this.priceCacheDurationMs
      ) {
        toFetch.push(list[i])
      }
    }

    if (toFetch.length > 0) {
      const fetchTs = Date.now()
      const fetched = await this.client.getMultiPriceData(toFetch)
      toFetch.forEach(({ from, to }, i) => {
        const key = `${from.toUpperCase()}${to.toUpperCase()}`
        this.priceDataCacheStore[key] = {
          priceData: fetched[i],
          lastPriceTimestamp: fetchTs
        }
      })
    }

    return cacheKeys.map((key) => this.priceDataCacheStore[key].priceData)
  }

  /**
   * Returns the historical price of an asset pair
   * @param {string} from - Source asset symbol
   * @param {string} to - Target asset symbol
   * @param {HistoricalPriceOptions} [opts={}]
   * @returns {Promise<HistoricalPriceResult[]>}
   */
  async getHistoricalPrice (from, to, opts = {}) {
    return this.client.getHistoricalPrice(from, to, opts)
  }
}
