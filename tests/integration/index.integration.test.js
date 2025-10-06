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

import https from 'node:https'
import { beforeAll, describe, expect, it, jest } from '@jest/globals'
import { PricingProvider } from '../../index.js'

class BitfinexHttpPricingClient {
  async getCurrentPrice (from, to) {
    const symbol = `t${from.toUpperCase()}${to.toUpperCase()}`
    const url = `https://api-pub.bitfinex.com/v2/ticker/${symbol}`
    const data = await fetchJson(url)
    // Bitfinex v2 ticker response:
    // [ BID, BID_SIZE, ASK, ASK_SIZE, DAILY_CHANGE, DAILY_CHANGE_RELATIVE, LAST_PRICE, VOLUME, HIGH, LOW ]
    const lastPrice = Array.isArray(data) ? data[6] : undefined
    if (typeof lastPrice !== 'number') throw new Error('Unexpected ticker response from Bitfinex')
    return lastPrice
  }

  async getHistoricalPrice (opts) {
    const { from, to, start, end } = opts
    const symbol = `t${from.toUpperCase()}${to.toUpperCase()}`
    // Use 1h candles for a compact sample. Sorted ascending for readability
    const params = new URLSearchParams()
    if (typeof start === 'number') params.set('start', String(start))
    if (typeof end === 'number') params.set('end', String(end))
    params.set('sort', '1')
    const url = `https://api-pub.bitfinex.com/v2/candles/trade:1h:${symbol}/hist?${params.toString()}`
    const data = await fetchJson(url)
    // Candle item format: [ MTS, OPEN, CLOSE, HIGH, LOW, VOLUME ]
    if (!Array.isArray(data) || data.length === 0) return []
    return data.map(item => ({ date: item[0], price: item[2] }))
  }
}

async function fetchJson (url) {
  if (typeof fetch === 'function') {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
    return await res.json()
  }

  return await new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode}`))
        res.resume()
        return
      }
      let raw = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => { raw += chunk })
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw))
        } catch (err) {
          reject(err)
        }
      })
    }).on('error', reject)
  })
}

describe('PricingProvider Live Integration (Bitfinex HTTP)', () => {
  // Network can be slow on CI; extend timeout
  beforeAll(() => {
    jest.setTimeout(20000)
  })

  it('should fetch live last price for BTC/USD', async () => {
    const provider = new PricingProvider({ client: new BitfinexHttpPricingClient(), priceCacheDurationMs: 0 })
    const price = await provider.getLastPrice('BTC', 'USD')
    // Output to help with manual inspection when running the test
    // eslint-disable-next-line no-console
    console.log('Live BTC/USD last price:', price)
    expect(typeof price).toBe('number')
    expect(price).toBeGreaterThan(0)
  })

  it('should fetch live historical prices for BTC/USD', async () => {
    const provider = new PricingProvider({ client: new BitfinexHttpPricingClient(), priceCacheDurationMs: 0 })
    const end = Date.now()
    const sixHours = 6 * 60 * 60 * 1000
    const start = end - sixHours
    const results = await provider.getHistoricalPrice({ from: 'BTC', to: 'USD', start, end })
    // eslint-disable-next-line no-console
    console.log('Live BTC/USD historical sample:', results.slice(0, 3))
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBeGreaterThan(0)
    expect(typeof results[0].date).toBe('number')
    expect(typeof results[0].price).toBe('number')
  })
})
