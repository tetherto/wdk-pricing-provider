<p align="center" width="100">
<a href="https://github.com/tetherto/lib-wallet">
<img src="https://github.com/tetherto/lib-wallet/blob/main/docs/logo.svg" width="200"/>
</a>
</p>

# ⚛️ lib-wallet-pricing-provider

This library is a pricing provider for the lib-wallet UI. It includes two classes: `PricingClient` and `PricingProvider`. `PricingClient` is an abstract class that must be implemented by the client. `PricingProvider` is a wrapper around `PricingClient` that provides caching for the current price.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
- [Related Projects](#related-projects)

## ✨ Features

- Generic pricing provider which can be extended by different pricing clients
- Get the current price of an asset pair
- Get the historical price of an asset pair
- Caching of the last price and the historical price

## 🚀 Installation

```bash
npm install lib-wallet-pricing-provider
```

## 💡 Quick Start

```javascript
// Initialise the client, in this case a Bitfinex client
const client = new BitfinexPricingClient();

// Initialise the provider
const provider = new PricingProvider({
  client,
  priceCacheDurationMs: 1000 * 60 * 60, // 1 hour
});

// Get latest price for BTCUSD. The price will be cached for 1 hour.
const currentPrice = await provider.getLastPrice('BTC', 'USD');

// Get Hitorical price for given ticker and interval
const historicalPrice = await provider.getHistoricalPrice({
  from: 'BTC',
  to: 'USD',
  start: 1709906400000, // Optional, Start date for historical interval
  end: 1709913600000, // Optional, End date for historical interval
});
```

## 🔍 Usage Examples

For detailed usage examples, please check the included test file `index.test.js` of this repository.

This project is ued in lib-wallet UI to provide client agnostic pricing functionality.

The following clients are available:

- [Bitfinex HTTP](https://github.com/tetherto/lib-wallet-pricing-bitfinex-http)

## 🔗 Related Projects

This project is part of the [lib-wallet](https://github.com/tetherto/lib-wallet) ecosystem. See the following projects for more information:

- [Lib Wallet Pricing Bitfinex HTTP](https://github.com/tetherto/lib-wallet-pricing-bitfinex-http)
