export class PricingClient {
    getCurrentPrice(from: string, to: string): Promise<number>;
    getMultiCurrentPrices(list: PricePair[]): Promise<number[]>;
    getMultiPriceData(list: PricePair[]): Promise<PriceData[]>;
    getHistoricalPrice(from: string, to: string): Promise<HistoricalPriceResult[]>;
}
export class PricingProvider {
    constructor(config?: PricingProviderConfig);
    client: PricingClient;
    priceCacheDurationMs: number;
    priceCacheStore: { [key: string]: { lastPriceValue: number; lastPriceTimestamp: number } };
    priceDataCacheStore: { [key: string]: { priceData: PriceData; lastPriceTimestamp: number } };
    getLastPrice(from: string, to: string, options?: GetLastPriceOptions): Promise<number>;
    getMultiLastPrices(list: PricePair[], options?: GetLastPriceOptions): Promise<number[]>;
    getLastPriceData(from: string, to: string, options?: GetLastPriceOptions): Promise<PriceData>;
    getMultiLastPriceData(list: PricePair[], options?: GetLastPriceOptions): Promise<PriceData[]>;
    getHistoricalPrice(from: string, to: string): Promise<HistoricalPriceResult[]>;
}
export type PriceData = {
    /** The last traded price */
    lastPrice: number;
    /** Absolute price change over the last 24h */
    dailyChange: number;
    /** Relative price change over the last 24h (multiply by 100 for percentage) */
    dailyChangeRelative: number;
};
export type HistoricalPriceResult = {
    date: number;
    price: number;
};
export type GetLastPriceOptions = {
    forceRefresh?: boolean;
};
export type PricePair = {
    from: string;
    to: string;
};
export type PricingProviderConfig = {
    client: PricingClient;
    priceCacheDurationMs?: number;
};
