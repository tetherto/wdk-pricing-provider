export class PricingClient {
    /**
     * Returns the current price of an asset pair.
     *
     * @param {string} from - Source asset symbol.
     * @param {string} to - Target asset symbol.
     * @returns {Promise<number>}
     */
    getCurrentPrice(from: string, to: string): Promise<number>;
    /**
     * Returns the current prices for multiple asset pairs.
     *
     * @param {PricePair[]} list - Array of asset pairs.
     * @returns {Promise<number[]>}
     */
    getMultiCurrentPrices(list: PricePair[]): Promise<number[]>;
    /**
     * Returns the historical price of an asset pair.
     *
     * @param {string} from - Source asset symbol.
     * @param {string} to - Target asset symbol.
     * @returns {Promise<HistoricalPriceResult[]>}
     */
    getHistoricalPrice(from: string, to: string): Promise<HistoricalPriceResult[]>;
}
export class PricingProvider {
    /**
     * Creates a new PricingProvider instance.
     *
     * @param {PricingProviderConfig} [config] - The configuration object.
     */
    constructor(config?: PricingProviderConfig);
    client: PricingClient;
    priceCacheDurationMs: number;
    priceCacheStore: {
        [x: string]: {
            lastPriceValue: number;
            lastPriceTimestamp: number;
        };
    };
    /**
     * Returns the last fetched price of an asset pair, cached for the duration of priceCacheDurationMs.
     *
     * @param {string} from - Source asset symbol.
     * @param {string} to - Target asset symbol.
     * @param {GetLastPriceOptions} [options] - Options for the request.
     * @returns {Promise<number>}
     */
    getLastPrice(from: string, to: string, options?: GetLastPriceOptions): Promise<number>;
    /**
     * Returns the last fetched prices for multiple asset pairs, with caching.
     *
     * @param {PricePair[]} list - Array of asset pairs.
     * @param {GetLastPriceOptions} [options] - Options for the request.
     * @returns {Promise<number[]>}
     */
    getMultiLastPrices(list: PricePair[], options?: GetLastPriceOptions): Promise<number[]>;
    /**
     * Returns the historical price of an asset pair.
     *
     * @param {string} from - Source asset symbol.
     * @param {string} to - Target asset symbol.
     * @returns {Promise<HistoricalPriceResult[]>}
     */
    getHistoricalPrice(from: string, to: string): Promise<HistoricalPriceResult[]>;
}
export type HistoricalPriceResult = {
    /**
     * - Timestamp of the price point.
     */
    date: number;
    /**
     * - Price at the given timestamp.
     */
    price: number;
};
export type GetLastPriceOptions = {
    /**
     * - Bypass cache and fetch a fresh price.
     */
    forceRefresh?: boolean;
};
export type PricePair = {
    /**
     * - Source asset symbol.
     */
    from: string;
    /**
     * - Target asset symbol.
     */
    to: string;
};
export type PricingProviderConfig = {
    /**
     * - The pricing client instance.
     */
    client: PricingClient;
    /**
     * - Cache duration in milliseconds, defaults to 1 hour.
     */
    priceCacheDurationMs?: number;
};
