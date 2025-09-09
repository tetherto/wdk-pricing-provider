export interface Config {
  client: any;
  priceCacheDurationMs: number;
}

export interface HistoricalPriceOptions {
  from: string;
  to: string;
  start: number;
  end: number;
}

export interface HistoricalPriceResult {
  date: number;
  price: number;
}

export class PricingClient {
    /**
     * Returns the current price of the asset pair, cached for the duration of the priceCacheDurationMs
     * @async
     * @param {string} from
     * @param {string} to
     * @returns {Promise<number>}
     */
    getCurrentPrice(from: string, to: string): Promise<number>;
    /**
     * Returns the historical price of the asset pair
     * @async
     * @param {HistoricalPriceOptions} opts
     * @returns {Promise<HistoricalPriceResult[]>}
     */
    getHistoricalPrice(opts: HistoricalPriceOptions): Promise<HistoricalPriceResult[]>;
}
export class PricingProvider {
    /**
     * Creates a new PricingProvider instance.
     * @param {Config} config - The configuration object.
     * @param {config.client} config.client - The client instance.
     * @param {config.priceCacheDurationMs} config.priceCacheDurationMs - The duration of the price cache in milliseconds, defaults to 1 hour
     */
    constructor(config?: Config);
    client: any;
    priceCacheDurationMs: any;
    priceCacheStore: {};
    /**
     * Returns the last fetched price of the asset pair, cached for the duration of the priceCacheDurationMs
     * @async
     * @param {string} from
     * @param {string} to
     * @returns {Promise<number>}
     */
    getLastPrice(from: string, to: string): Promise<number>;
    /**
     * Returns the historical price of the asset pair
     * @async
     * @param {HistoricalPriceOptions} opts
     * @returns {Promise<HistoricalPriceResult[]>}
     */
    getHistoricalPrice(opts: HistoricalPriceOptions): Promise<HistoricalPriceResult[]>;
}
