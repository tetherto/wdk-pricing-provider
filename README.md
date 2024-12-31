# Lib Wallet Pricing Provider

This library is a pricing provider for the WDK-UI. It includes two classes: `PricingClient` and `PricingProvider`. `PricingClient` is an abstract class that must be implemented by the client. `PricingProvider` is a wrapper around `PricingClient` that provides caching for the current price.

## Available clients

- [Bitfinex HTTP](https://github.com/tetherto/lib-wallet-pricing-bitfinex-http)

## Installation

1. Install the required dependencies:

```bash
npm install lib-wallet-pricing
```

## Usage

```js
// Initialise the client
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
