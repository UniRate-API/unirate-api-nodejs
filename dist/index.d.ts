export declare class UnirateError extends Error {
    constructor(message: string);
}
export declare class UnirateClient {
    private readonly baseUrl;
    private readonly apiKey;
    private readonly timeout;
    private readonly client;
    constructor(apiKey: string, timeout?: number);
    private makeRequest;
    getRate(fromCurrency: string, toCurrency: string): Promise<number>;
    convert(amount: number, fromCurrency: string, toCurrency: string): Promise<number>;
    getSupportedCurrencies(): Promise<string[]>;
    /**
     * Get historical exchange rate for a specific date
     * @param fromCurrency Source currency code (e.g., "USD")
     * @param toCurrency Target currency code (e.g., "EUR")
     * @param date Date in YYYY-MM-DD format
     * @returns Historical exchange rate
     */
    getHistoricalRate(fromCurrency: string, toCurrency: string, date: string): Promise<number>;
    /**
     * Get historical exchange rates for a specific date (all rates for a base currency)
     * @param baseCurrency Base currency code (e.g., "USD")
     * @param date Date in YYYY-MM-DD format
     * @returns Object containing all exchange rates for the specified date
     */
    getHistoricalRates(baseCurrency: string, date: string): Promise<Record<string, number>>;
    /**
     * Convert amount using historical exchange rate for a specific date
     * @param amount Amount to convert
     * @param fromCurrency Source currency code (e.g., "USD")
     * @param toCurrency Target currency code (e.g., "EUR")
     * @param date Date in YYYY-MM-DD format
     * @returns Converted amount using historical rate
     */
    convertHistorical(amount: number, fromCurrency: string, toCurrency: string, date: string): Promise<number>;
    /**
     * Get time series data for a currency pair over a date range
     * @param fromCurrency Source currency code (e.g., "USD")
     * @param toCurrency Target currency code (e.g., "EUR")
     * @param startDate Start date in YYYY-MM-DD format
     * @param endDate End date in YYYY-MM-DD format
     * @returns Object containing time series data
     */
    getTimeSeries(fromCurrency: string, toCurrency: string, startDate: string, endDate: string): Promise<Record<string, number>>;
}
