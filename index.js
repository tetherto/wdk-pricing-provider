'use strict'
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

/**
 * @typedef {Object} HistoricalPriceResult
 * @property {number} date - Timestamp of the price point
 * @property {number} price - Price at the given timestamp
 */

/**
 * @typedef {Object} GetLastPriceOptions
 * @property {boolean} [forceRefresh=false] - Bypass cache and fetch a fresh price
 */

/**
 * @typedef {Object} PricePair
 * @property {string} from - Source asset symbol
 * @property {string} to - Target asset symbol
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
    return Promise.all(list.map((pair) => this.getCurrentPrice(pair.from, pair.to)))
  }

  /**
   * Returns the historical price of an asset pair
   * @param {string} from - Source asset symbol
   * @param {string} to - Target asset symbol
   * @returns {Promise<HistoricalPriceResult[]>}
   */
  async getHistoricalPrice (from, to) {
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
  }

  /**
   * Returns the last fetched price of an asset pair, cached for the duration of priceCacheDurationMs
   * @param {string} from - Source asset symbol
   * @param {string} to - Target asset symbol
   * @param {GetLastPriceOptions} [options={}]
   * @returns {Promise<number>}
   */
  async getLastPrice (from, to, options = {}) {
    const now = Date.now()

    const cacheKey = `${from.toUpperCase()}${to.toUpperCase()}`
    if (!options.forceRefresh && this.priceCacheStore[cacheKey]) {
      const lastPriceTimestamp = this.priceCacheStore[cacheKey].lastPriceTimestamp
      if (lastPriceTimestamp && now - lastPriceTimestamp < this.priceCacheDurationMs) {
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
   * @param {GetLastPriceOptions} [options={}]
   * @returns {Promise<number[]>}
   */
  async getMultiLastPrices (list, options = {}) {
    return Promise.all(list.map(({ from, to }) => this.getLastPrice(from, to, options)))
  }

  /**
   * Returns the historical price of an asset pair
   * @param {string} from - Source asset symbol
   * @param {string} to - Target asset symbol
   * @returns {Promise<HistoricalPriceResult[]>}
   */
  async getHistoricalPrice (from, to) {
    return this.client.getHistoricalPrice(from, to)
  }
}
