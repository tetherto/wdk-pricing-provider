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
      expect(mockClient.getHistoricalPrice).toHaveBeenCalledWith('BTC', 'USD')
    })
  })
})
