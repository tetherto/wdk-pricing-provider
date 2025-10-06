import test from 'brittle'

// Import the bare runtime entry to validate compatibility
import { PricingProvider, PricingClient } from '../bare.js'

class MockPricingClient extends PricingClient {
  async getCurrentPrice (_from, _to) {
    return 42000
  }

  async getHistoricalPrice (_opts) {
    return [
      { date: 1, price: 41000 },
      { date: 2, price: 42000 }
    ]
  }
}

test('bare runtime compatibility: can use provider and cache', async (t) => {
  const client = new MockPricingClient()
  const provider = new PricingProvider({ client, priceCacheDurationMs: 60_000 })

  const p1 = await provider.getLastPrice('BTC', 'USD')
  t.is(p1, 42000)

  // Ensure cached path returns same value without error
  const p2 = await provider.getLastPrice('BTC', 'USD')
  t.is(p2, 42000)

  const hist = await provider.getHistoricalPrice({ from: 'BTC', to: 'USD' })
  t.ok(Array.isArray(hist))
  t.is(hist.length, 2)
  t.is(hist[1].price, 42000)
})
