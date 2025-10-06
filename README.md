# @tetherto/wdk-pricing-provider

Simple, cache-aware pricing provider utilities for WDK-based apps and the [WDK UI Kit](https://github.com/tetherto/wdk-uikit-react-native). It defines two core building blocks: `PricingClient` (an abstract fetcher that you implement) and `PricingProvider` (a wrapper that adds caching and a unified API).

## 🔍 About WDK

This module is part of the WDK (Wallet Development Kit) ecosystem, which helps developers build secure, non-custodial wallets and related services.

For more on the WDK project, visit [docs.wallet.tether.io](https://docs.wallet.tether.io).

## ✨ Features

- Minimal, composable pricing abstraction
- Pluggable client model (`PricingClient`)
- Built-in caching via `PricingProvider`
- Last price and historical price helpers

## ⬇️ Installation

```bash
npm install wdk-pricing-provider
```

## 🚀 Quick Start

```javascript
import { PricingProvider } from "@tetherto/wdk-pricing-provider";
import { BitfinexPricingClient } from "@tetherto/wdk-pricing-bitfinex-http";

// Create a concrete PricingClient implementation
const client = new BitfinexPricingClient();

// Wrap the client with a cache-enabled provider
const provider = new PricingProvider({
  client,
  cacheTTL: 60 * 60 * 1000, // 1 hour cache in ms
});

// Get latest price
const currentPrice = await provider.getLastPrice("BTC", "USD");

// Get historical price
const historicalPrice = await provider.getHistoricalPrice({
  from: "BTC",
  to: "USD",
  start: 1709906400000, // Optional, Start date for historical interval
  end: 1709913600000, // Optional, End date for historical interval
});
```

## 📚 API Reference

### PricingProvider

```javascript
new PricingProvider(options);
```

Parameters:

- `options.client`: Instance of your `PricingClient` implementation
- `options.cacheTTL` (number, optional): Cache time for last price lookups in ms

Methods:

- `getLastPrice(base: string, quote: string): Promise<number>`
- `getHistoricalPrice({ from, to, start?, end? }): Promise<number>`

### PricingClient (abstract)

You implement this interface for your data source (e.g., Bitfinex, Coinbase, etc.). At a minimum, provide methods that `PricingProvider` uses to fetch spot and historical prices.

## 🔍 Usage Examples

For detailed usage examples, please check the included test files `index.test.js` and `index.integration.test.js` in this repository.

## 🔗 Related Projects

- Bitfinex HTTP client: [wdk-pricing-bitfinex-http](https://github.com/tetherto/wdk-pricing-bitfinex-http)

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
