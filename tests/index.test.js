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
      // Create a mock client
      mockClient = {
        getCurrentPrice: jest.fn()
      }

      // Create provider with 1000ms cache duration for easier testing
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

      // First call
      await provider.getLastPrice('BTC', 'USD')

      // Second call within cache duration
      const price = await provider.getLastPrice('BTC', 'USD')

      expect(price).toBe(50000)
      expect(mockClient.getCurrentPrice).toHaveBeenCalledTimes(1)
    })

    it('should fetch new price after cache expires', async () => {
      mockClient.getCurrentPrice
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(51000)

      // First call
      const price1 = await provider.getLastPrice('BTC', 'USD')

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100))

      // Second call after cache expiration
      const price2 = await provider.getLastPrice('BTC', 'USD')

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
})
