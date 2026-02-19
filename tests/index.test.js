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

import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { PricingProvider } from '../index.js'

describe('PricingProvider', () => {
  describe('getLastPrice', () => {
    let mockClient
    let provider

    beforeEach(() => {
      mockClient = {
        getCurrentPrice: jest.fn()
      }

      provider = new PricingProvider({
        client: mockClient,
        priceCacheDurationMs: 1000
      })
    })

    it('should fetch price from client on first call', async () => {
      mockClient.getCurrentPrice.mockResolvedValue(50000)

      const price = await provider.getLastPrice('BTC', 'USD')

      expect(price).toBe(50000)
      expect(mockClient.getCurrentPrice).toHaveBeenCalledWith('BTC', 'USD')
      expect(mockClient.getCurrentPrice).toHaveBeenCalledTimes(1)
    })

    it('should return cached price within cache duration', async () => {
      mockClient.getCurrentPrice.mockResolvedValue(50000)

      await provider.getLastPrice('BTC', 'USD')
      const price = await provider.getLastPrice('BTC', 'USD')

      expect(price).toBe(50000)
      expect(mockClient.getCurrentPrice).toHaveBeenCalledTimes(1)
    })

    it('should fetch new price after cache expires', async () => {
      mockClient.getCurrentPrice
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(51000)

      const price1 = await provider.getLastPrice('BTC', 'USD')

      await new Promise(resolve => setTimeout(resolve, 1100))

      const price2 = await provider.getLastPrice('BTC', 'USD')

      expect(price1).toBe(50000)
      expect(price2).toBe(51000)
      expect(mockClient.getCurrentPrice).toHaveBeenCalledTimes(2)
    })

    it('should bypass cache when forceRefresh is true', async () => {
      mockClient.getCurrentPrice
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(51000)

      const price1 = await provider.getLastPrice('BTC', 'USD')
      const price2 = await provider.getLastPrice('BTC', 'USD', { forceRefresh: true })

      expect(price1).toBe(50000)
      expect(price2).toBe(51000)
      expect(mockClient.getCurrentPrice).toHaveBeenCalledTimes(2)
    })

    it('should propagate errors from client', async () => {
      const error = new Error('API Error')
      mockClient.getCurrentPrice.mockRejectedValue(error)

      await expect(provider.getLastPrice('BTC', 'USD'))
        .rejects
        .toThrow('API Error')
    })
  })

  describe('getMultiLastPrices', () => {
    let mockClient
    let provider

    beforeEach(() => {
      mockClient = {
        getCurrentPrice: jest.fn()
      }

      provider = new PricingProvider({
        client: mockClient,
        priceCacheDurationMs: 1000
      })
    })

    it('should fetch prices for multiple pairs', async () => {
      mockClient.getCurrentPrice
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(3000)

      const prices = await provider.getMultiLastPrices([
        { from: 'BTC', to: 'USD' },
        { from: 'ETH', to: 'USD' }
      ])

      expect(prices).toEqual([50000, 3000])
      expect(mockClient.getCurrentPrice).toHaveBeenCalledTimes(2)
    })

    it('should return cached prices within cache duration', async () => {
      mockClient.getCurrentPrice
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(3000)

      await provider.getMultiLastPrices([
        { from: 'BTC', to: 'USD' },
        { from: 'ETH', to: 'USD' }
      ])

      const prices = await provider.getMultiLastPrices([
        { from: 'BTC', to: 'USD' },
        { from: 'ETH', to: 'USD' }
      ])

      expect(prices).toEqual([50000, 3000])
      expect(mockClient.getCurrentPrice).toHaveBeenCalledTimes(2)
    })

    it('should only fetch uncached pairs', async () => {
      mockClient.getCurrentPrice
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(3000)

      // Prime cache with BTC/USD
      await provider.getMultiLastPrices([{ from: 'BTC', to: 'USD' }])

      const prices = await provider.getMultiLastPrices([
        { from: 'BTC', to: 'USD' },
        { from: 'ETH', to: 'USD' }
      ])

      expect(prices).toEqual([50000, 3000])
      // Only ETH/USD should trigger a new fetch
      expect(mockClient.getCurrentPrice).toHaveBeenCalledTimes(2)
    })

    it('should bypass cache when forceRefresh is true', async () => {
      mockClient.getCurrentPrice
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(51000)

      await provider.getMultiLastPrices([{ from: 'BTC', to: 'USD' }])
      const prices = await provider.getMultiLastPrices(
        [{ from: 'BTC', to: 'USD' }],
        { forceRefresh: true }
      )

      expect(prices).toEqual([51000])
      expect(mockClient.getCurrentPrice).toHaveBeenCalledTimes(2)
    })
  })

  describe('getHistoricalPrice', () => {
    it('should delegate to client with from and to', async () => {
      const mockResults = [{ date: 1000, price: 50000 }]
      const mockClient = {
        getHistoricalPrice: jest.fn().mockResolvedValue(mockResults)
      }
      const provider = new PricingProvider({ client: mockClient })

      const results = await provider.getHistoricalPrice('BTC', 'USD')

      expect(results).toEqual(mockResults)
      expect(mockClient.getHistoricalPrice).toHaveBeenCalledWith('BTC', 'USD', {})
    })

    it('should forward timeframe option to client', async () => {
      const mockResults = [{ date: 1000, price: 50000 }]
      const mockClient = { getHistoricalPrice: jest.fn().mockResolvedValue(mockResults) }
      const provider = new PricingProvider({ client: mockClient })

      await provider.getHistoricalPrice('BTC', 'USD', { timeframe: '1h' })

      expect(mockClient.getHistoricalPrice).toHaveBeenCalledWith('BTC', 'USD', { timeframe: '1h' })
    })
  })

  describe('getLastPriceData', () => {
    const btcPriceData = { lastPrice: 50000, dailyChange: 500, dailyChangeRelative: 0.01 }
    const btcPriceDataUpdated = { lastPrice: 51000, dailyChange: 1000, dailyChangeRelative: 0.02 }
    let mockClient
    let provider

    beforeEach(() => {
      mockClient = { getMultiPriceData: jest.fn() }
      provider = new PricingProvider({ client: mockClient, priceCacheDurationMs: 1000 })
    })

    it('should fetch price data from client on first call', async () => {
      mockClient.getMultiPriceData.mockResolvedValue([btcPriceData])

      const result = await provider.getLastPriceData('BTC', 'USD')

      expect(result).toEqual(btcPriceData)
      expect(mockClient.getMultiPriceData).toHaveBeenCalledWith([{ from: 'BTC', to: 'USD' }])
      expect(mockClient.getMultiPriceData).toHaveBeenCalledTimes(1)
    })

    it('should return cached price data within cache duration', async () => {
      mockClient.getMultiPriceData.mockResolvedValue([btcPriceData])

      await provider.getLastPriceData('BTC', 'USD')
      const result = await provider.getLastPriceData('BTC', 'USD')

      expect(result).toEqual(btcPriceData)
      expect(mockClient.getMultiPriceData).toHaveBeenCalledTimes(1)
    })

    it('should fetch new price data after cache expires', async () => {
      mockClient.getMultiPriceData
        .mockResolvedValueOnce([btcPriceData])
        .mockResolvedValueOnce([btcPriceDataUpdated])

      const result1 = await provider.getLastPriceData('BTC', 'USD')
      await new Promise(resolve => setTimeout(resolve, 1100))
      const result2 = await provider.getLastPriceData('BTC', 'USD')

      expect(result1).toEqual(btcPriceData)
      expect(result2).toEqual(btcPriceDataUpdated)
      expect(mockClient.getMultiPriceData).toHaveBeenCalledTimes(2)
    })

    it('should bypass cache when forceRefresh is true', async () => {
      mockClient.getMultiPriceData
        .mockResolvedValueOnce([btcPriceData])
        .mockResolvedValueOnce([btcPriceDataUpdated])

      await provider.getLastPriceData('BTC', 'USD')
      const result = await provider.getLastPriceData('BTC', 'USD', { forceRefresh: true })

      expect(result).toEqual(btcPriceDataUpdated)
      expect(mockClient.getMultiPriceData).toHaveBeenCalledTimes(2)
    })
  })

  describe('getMultiLastPriceData', () => {
    const btcData = { lastPrice: 50000, dailyChange: 500, dailyChangeRelative: 0.01 }
    const ethData = { lastPrice: 3000, dailyChange: -50, dailyChangeRelative: -0.016 }
    let mockClient
    let provider

    beforeEach(() => {
      mockClient = { getMultiPriceData: jest.fn() }
      provider = new PricingProvider({ client: mockClient, priceCacheDurationMs: 1000 })
    })

    it('should fetch price data for multiple pairs', async () => {
      mockClient.getMultiPriceData.mockResolvedValue([btcData, ethData])

      const results = await provider.getMultiLastPriceData([
        { from: 'BTC', to: 'USD' },
        { from: 'ETH', to: 'USD' }
      ])

      expect(results).toEqual([btcData, ethData])
      expect(mockClient.getMultiPriceData).toHaveBeenCalledTimes(1)
    })

    it('should return cached data within cache duration', async () => {
      mockClient.getMultiPriceData.mockResolvedValue([btcData, ethData])

      await provider.getMultiLastPriceData([
        { from: 'BTC', to: 'USD' },
        { from: 'ETH', to: 'USD' }
      ])
      const results = await provider.getMultiLastPriceData([
        { from: 'BTC', to: 'USD' },
        { from: 'ETH', to: 'USD' }
      ])

      expect(results).toEqual([btcData, ethData])
      expect(mockClient.getMultiPriceData).toHaveBeenCalledTimes(1)
    })

    it('should only fetch uncached pairs', async () => {
      mockClient.getMultiPriceData
        .mockResolvedValueOnce([btcData])
        .mockResolvedValueOnce([ethData])

      await provider.getMultiLastPriceData([{ from: 'BTC', to: 'USD' }])

      const results = await provider.getMultiLastPriceData([
        { from: 'BTC', to: 'USD' },
        { from: 'ETH', to: 'USD' }
      ])

      expect(results).toEqual([btcData, ethData])
      // First call fetched BTC, second call fetched only ETH
      expect(mockClient.getMultiPriceData).toHaveBeenCalledTimes(2)
      expect(mockClient.getMultiPriceData).toHaveBeenLastCalledWith([{ from: 'ETH', to: 'USD' }])
    })

    it('should bypass cache when forceRefresh is true', async () => {
      const btcDataUpdated = { lastPrice: 51000, dailyChange: 1000, dailyChangeRelative: 0.02 }
      mockClient.getMultiPriceData
        .mockResolvedValueOnce([btcData])
        .mockResolvedValueOnce([btcDataUpdated])

      await provider.getMultiLastPriceData([{ from: 'BTC', to: 'USD' }])
      const results = await provider.getMultiLastPriceData(
        [{ from: 'BTC', to: 'USD' }],
        { forceRefresh: true }
      )

      expect(results).toEqual([btcDataUpdated])
      expect(mockClient.getMultiPriceData).toHaveBeenCalledTimes(2)
    })
  })
})
