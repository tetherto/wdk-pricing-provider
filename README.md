# @tetherto/wdk-pricing-provider

Simple, cache-aware pricing provider for WDK-based apps. It defines two building blocks: `PricingClient`, an abstract price source that a client package implements, and `PricingProvider`, a wrapper that adds caching, batch helpers and optional failover across several clients.

The provider has no built-in price source. You install a client package and pass it in.

## 🔍 About WDK

This module is part of WDK (Wallet Development Kit) by Tether, which helps developers build secure, non-custodial wallets and related services.

See the [Price Rates documentation](https://docs.wdk.tether.io/tools/price-rates/). For the complete ecosystem, see the [general WDK documentation](https://docs.wdk.tether.io/).

## ✨ Features

- Minimal, composable pricing abstraction
- Pluggable client model (`PricingClient`)
- Built-in caching via `PricingProvider`
- Optional failover across an ordered list of clients
- Current price, 24h price data and historical price helpers

## 📦 Available Clients

| Package | Data source | API key |
| ------- | ----------- | ------- |
| [`@tetherto/wdk-pricing-coingecko-http`](https://github.com/tetherto/wdk-pricing-coingecko-http) | CoinGecko API | Optional (Demo or Pro) |
| [`@tetherto/wdk-pricing-bitfinex-http`](https://github.com/tetherto/wdk-pricing-bitfinex-http) | Bitfinex public API | None |

Each client fetches data from a third party. Use of that data is governed by the data provider's own terms, not by this package's license. Review them before you ship: [CoinGecko API terms](https://www.coingecko.com/en/api_terms), [Bitfinex market data terms](https://www.bitfinex.com/legal/general/market-data/).

## ⬇️ Installation

```bash
npm install @tetherto/wdk-pricing-provider @tetherto/wdk-pricing-coingecko-http
```

## 🚀 Quick Start

```javascript
import { PricingProvider } from '@tetherto/wdk-pricing-provider'
import { CoingeckoPricingClient } from '@tetherto/wdk-pricing-coingecko-http'

// A concrete PricingClient. The API key is optional and raises CoinGecko's rate limits.
const client = new CoingeckoPricingClient({
  apiKey: process.env.COINGECKO_API_KEY
})

// Wrap the client with a cache-enabled provider
const provider = new PricingProvider({
  client,
  priceCacheDurationMs: 5 * 60 * 1000 // optional, defaults to 1 hour
})

// Latest price, served from cache while it is fresh
const btc = await provider.getLastPrice('BTC', 'USD')

// Latest prices for several pairs, in input order
const prices = await provider.getMultiLastPrices([
  { from: 'BTC', to: 'USD' },
  { from: 'XAUT', to: 'USD' }
])

// Historical series over the last 7 days
const history = await provider.getHistoricalPrice('BTC', 'USD', {
  start: Date.now() - 7 * 24 * 60 * 60 * 1000,
  end: Date.now()
})
```

The CoinGecko client knows `BTC`, `ETH`, `USDT`, `XAUT` and `USAT` out of the box. Map any other asset your app shows with its `coinIds` option, for example `coinIds: { USDT0: 'tether' }`, and quote in a currency CoinGecko accepts as `vs_currency`, such as `USD` or `EUR`. See the [client README](https://github.com/tetherto/wdk-pricing-coingecko-http) for details.

## 📚 API Reference

### PricingProvider

```javascript
new PricingProvider(config)
```

| Option | Type | Description |
| ------ | ---- | ----------- |
| `client` | `PricingClient \| PricingClient[]` | Required. One client, or an ordered list of clients for failover. |
| `retries` | `number` | With a list of clients, the number of extra attempts after the first failure. Total attempts = `1 + retries`. Default: `3`. |
| `priceCacheDurationMs` | `number` | How long last prices and price data stay cached, in ms. Default: `3600000` (1 hour). |

| Method | Description | Returns |
| ------ | ----------- | ------- |
| `getLastPrice(from, to, options?)` | Current price of one pair, cached | `Promise<number \| null>` |
| `getMultiLastPrices(list, options?)` | Current prices of several pairs, cached per pair | `Promise<Array<number \| null>>` |
| `getLastPriceData(from, to, options?)` | Last price and 24h change of one pair, cached | `Promise<PriceData \| null>` |
| `getMultiLastPriceData(list, options?)` | Last price and 24h change of several pairs, uncached pairs fetched in one client call | `Promise<Array<PriceData \| null>>` |
| `getHistoricalPrice(from, to, opts)` | Historical series between `opts.start` and `opts.end` (Unix ms), not cached | `Promise<HistoricalPriceResult[]>` |

- `from` and `to` are common ticker symbols such as `BTC`, `USDT` or `USD`.
- `list` is an array of `{ from, to }` pairs. Results keep the input order.
- `options.forceRefresh` bypasses the cache for that call.
- `PriceData` is `{ lastPrice, dailyChange, dailyChangeRelative }`. Multiply `dailyChangeRelative` by 100 for a percentage.
- A pair the client cannot resolve is `null`. The provider caches that `null` like a price.
- The length and order of a historical series depend on the client. See its README.

#### Failover

Pass an ordered list of clients to fall back on the next one when a call fails:

```javascript
const provider = new PricingProvider({
  client: [primaryClient, fallbackClient], // any PricingClient implementations
  retries: 1
})
```

Failover reacts to thrown errors only. A client that returns `null` for a pair does not pass the call on. Once a client fails, the provider keeps using the next one for later calls.

### PricingClient (abstract)

Implement this class to add a price source: `getCurrentPrice`, `getMultiCurrentPrices`, `getMultiPriceData` and `getHistoricalPrice`.

Contract every implementation must honor:

- `from` and `to` are common ticker symbols (`BTC`, `USDT`, `USD`). Match them
  case-insensitively, since the provider passes them through unchanged.
  Translate them to your vendor's own codes or IDs inside the client, so callers
  never need vendor vocabulary. Bitfinex, for instance, publishes tether as
  `UST`, so its client maps `USDT` to `UST` internally and callers keep passing
  `USDT`.
- A pair the vendor cannot resolve is `null` in the returned position. Do not
  throw, so one unknown symbol cannot fail a whole batch.
- Batch results keep the input order.

## 🔍 Usage Examples

For detailed usage examples, please check the included test files `index.test.js` and `index.integration.test.js` in this repository.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Lint
npm run lint
npm run lint:fix

# Tests
npm test
```

## 📜 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🆘 Support

For support, please open an issue on the GitHub repository.

---
