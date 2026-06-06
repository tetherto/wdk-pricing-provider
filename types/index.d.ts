/**
 * @typedef {Object} HistoricalPriceResult
 * @property {number} timestamp - Timestamp of the price point
 * @property {number} price - Price at the given timestamp
 */
/**
 * @typedef {Object} HistoricalPriceOptions
 * @property {number} start - Start of the time range as a Unix timestamp in milliseconds
 * @property {number} end - End of the time range as a Unix timestamp in milliseconds
 * @property {string} [timeframe='1D'] - Timeframe for the historical data (e.g. '1D', '1h', '1m')
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
 * @property {PricingClient | PricingClient[]} client - An instance of a class that implements {@link PricingClient}. It's also possible to provide an array of clients instead. In such case, connection errors will cause the wallet to automatically fallback on the next provider in the list.
 * @property {number} [retries] - If set and if 'client' is a list of clients, the number of additional retry attempts after the initial call fails. Total attempts = `1 + retries`. For example, `retries: 3` with 4 providers will try each provider once before throwing. If `retries` exceeds the number of providers, the failover will loop back and retry already-failed providers in round-robin order. Default: 3.
 * @property {number} [priceCacheDurationMs=3600000] - Cache duration in milliseconds, defaults to 1 hour
 */
export class PricingClient {
    /**
     * Returns the current price of an asset pair, or `null` if the pair cannot be resolved
     * @param {string} from - Source asset symbol
     * @param {string} to - Target asset symbol
     * @returns {Promise<number | null>}
     */
    getCurrentPrice(from: string, to: string): Promise<number | null>;
    /**
     * Returns the current prices for multiple asset pairs. Entries whose pair
     * cannot be resolved are `null`.
     * @param {PricePair[]} list - Array of asset pairs
     * @returns {Promise<Array<number | null>>}
     */
    getMultiCurrentPrices(list: PricePair[]): Promise<Array<number | null>>;
    /**
     * Returns full price data (last price, daily change) for multiple asset pairs.
     * Entries whose pair cannot be resolved are `null`.
     * @param {PricePair[]} list - Array of asset pairs
     * @returns {Promise<Array<PriceData | null>>}
     */
    getMultiPriceData(list: PricePair[]): Promise<Array<PriceData | null>>;
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
    /**
     * @type {PricingClient}
     */
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
     * - Start of the time range as a Unix timestamp in milliseconds
     */
    start: number;
    /**
     * - End of the time range as a Unix timestamp in milliseconds
     */
    end: number;
    /**
     * - Timeframe for the historical data (e.g. '1D', '1h', '1m')
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
     * - An instance of a class that implements {@link PricingClient}. It's also possible to provide an array of clients instead. In such case, connection errors will cause the wallet to automatically fallback on the next provider in the list.
     */
    client: PricingClient | PricingClient[];
    /**
     * - If set and if 'client' is a list of clients, the number of additional retry attempts after the initial call fails. Total attempts = `1 + retries`. For example, `retries: 3` with 4 providers will try each provider once before throwing. If `retries` exceeds the number of providers, the failover will loop back and retry already-failed providers in round-robin order. Default: 3.
     */
    retries?: number;
    /**
     * - Cache duration in milliseconds, defaults to 1 hour
     */
    priceCacheDurationMs?: number;
};
