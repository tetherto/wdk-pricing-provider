/**
 * @typedef {Object} HistoricalPriceResult
 * @property {number} timestamp - Timestamp of the price point
 * @property {number} price - Price at the given timestamp
 */
/**
 * @typedef {Object} HistoricalPriceOptions
 * @property {string} [timeframe='1D'] - Candle timeframe. e.g. '1m', '5m', '15m', '1h', '6h', '1D'
 */
/**
 * @typedef {Object} GetPriceOptions
 * @property {boolean} [forceRefresh=false] - Bypass cache and fetch a fresh price
 */
/**
 * @typedef {Object} PricePair
 * @property {string} from - Source asset symbol
 * @property {string} to - Target asset symbol
 */
/**
 * @typedef {Object} PriceData
 * @property {number} lastPrice - The last traded price
 * @property {number} dailyChange - Absolute price change over the last 24h
 * @property {number} dailyChangeRelative - Relative price change over the last 24h (multiply by 100 for percentage)
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
    getCurrentPrice(from: string, to: string): Promise<number>;
    /**
     * Returns the current prices for multiple asset pairs
     * @param {PricePair[]} list - Array of asset pairs
     * @returns {Promise<number[]>}
     */
    getMultiCurrentPrices(list: PricePair[]): Promise<number[]>;
    /**
     * Returns full price data (last price, daily change) for multiple asset pairs.
     * Defaults to calling getCurrentPrice per pair with zeroed change fields.
     * Override in subclasses for efficient batch fetching with full data.
     * @param {PricePair[]} list - Array of asset pairs
     * @returns {Promise<PriceData[]>}
     */
    getMultiPriceData(list: PricePair[]): Promise<PriceData[]>;
    /**
     * Returns the historical price of an asset pair
     * @param {string} from - Source asset symbol
     * @param {string} to - Target asset symbol
     * @param {HistoricalPriceOptions} [opts={}]
     * @returns {Promise<HistoricalPriceResult[]>}
     */
    getHistoricalPrice(from: string, to: string, opts?: HistoricalPriceOptions): Promise<HistoricalPriceResult[]>;
}
export class PricingProvider {
    /**
     * Creates a new PricingProvider instance
     * @param {PricingProviderConfig} config
     */
    constructor(config?: PricingProviderConfig);
    client: PricingClient;
    priceCacheDurationMs: number;
    /** @type {Object<string, { lastPriceValue: number, lastPriceTimestamp: number }>} */
    priceCacheStore: {
        [x: string]: {
            lastPriceValue: number;
            lastPriceTimestamp: number;
        };
    };
    /** @type {Object<string, { priceData: PriceData, lastPriceTimestamp: number }>} */
    priceDataCacheStore: {
        [x: string]: {
            priceData: PriceData;
            lastPriceTimestamp: number;
        };
    };
    /**
     * Returns the last fetched price of an asset pair, cached for the duration of priceCacheDurationMs
     * @param {string} from - Source asset symbol
     * @param {string} to - Target asset symbol
     * @param {GetPriceOptions} [options={}]
     * @returns {Promise<number>}
     */
    getLastPrice(from: string, to: string, options?: GetPriceOptions): Promise<number>;
    /**
     * Returns the last fetched prices for multiple asset pairs, with caching
     * @param {PricePair[]} list - Array of asset pairs
     * @param {GetPriceOptions} [options={}]
     * @returns {Promise<number[]>}
     */
    getMultiLastPrices(list: PricePair[], options?: GetPriceOptions): Promise<number[]>;
    /**
     * Returns full price data for an asset pair, cached for the duration of priceCacheDurationMs.
     * Includes last price, daily change, and relative daily change.
     * @param {string} from - Source asset symbol
     * @param {string} to - Target asset symbol
     * @param {GetPriceOptions} [options={}]
     * @returns {Promise<PriceData>}
     */
    getLastPriceData(from: string, to: string, options?: GetPriceOptions): Promise<PriceData>;
    /**
     * Returns full price data for multiple asset pairs, with per-pair caching.
     * @param {PricePair[]} list - Array of asset pairs
     * @param {GetPriceOptions} [options={}]
     * @returns {Promise<PriceData[]>}
     */
    getMultiLastPriceData(list: PricePair[], options?: GetPriceOptions): Promise<PriceData[]>;
    /**
     * Returns the historical price of an asset pair
     * @param {string} from - Source asset symbol
     * @param {string} to - Target asset symbol
     * @param {HistoricalPriceOptions} [opts={}]
     * @returns {Promise<HistoricalPriceResult[]>}
     */
    getHistoricalPrice(from: string, to: string, opts?: HistoricalPriceOptions): Promise<HistoricalPriceResult[]>;
}
export type HistoricalPriceResult = {
    /**
     * - Timestamp of the price point
     */
    timestamp: number;
    /**
     * - Price at the given timestamp
     */
    price: number;
};
export type HistoricalPriceOptions = {
    /**
     * - Candle timeframe. e.g. '1m', '5m', '15m', '1h', '6h', '1D'
     */
    timeframe?: string;
};
export type GetPriceOptions = {
    /**
     * - Bypass cache and fetch a fresh price
     */
    forceRefresh?: boolean;
};
export type PricePair = {
    /**
     * - Source asset symbol
     */
    from: string;
    /**
     * - Target asset symbol
     */
    to: string;
};
export type PriceData = {
    /**
     * - The last traded price
     */
    lastPrice: number;
    /**
     * - Absolute price change over the last 24h
     */
    dailyChange: number;
    /**
     * - Relative price change over the last 24h (multiply by 100 for percentage)
     */
    dailyChangeRelative: number;
};
export type PricingProviderConfig = {
    /**
     * - The pricing client instance
     */
    client: PricingClient;
    /**
     * - Cache duration in milliseconds, defaults to 1 hour
     */
    priceCacheDurationMs?: number;
};
