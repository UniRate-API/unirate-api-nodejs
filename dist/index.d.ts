export declare class UnirateError extends Error {
    constructor(message: string);
}
export declare class AuthenticationError extends UnirateError {
    constructor(message?: string);
}
export declare class RateLimitError extends UnirateError {
    constructor(message?: string);
}
export declare class InvalidCurrencyError extends UnirateError {
    constructor(message?: string);
}
export declare class InvalidDateError extends UnirateError {
    constructor(message?: string);
}
export declare class APIError extends UnirateError {
    statusCode?: number;
    response?: any;
    constructor(message: string, statusCode?: number, response?: any);
}
export type OutputFormat = 'json' | 'xml' | 'csv' | 'tsv';
export interface HistoricalLimitsResponse {
    total_currencies: number;
    data_source: string;
    currencies: Record<string, {
        earliest_date: string;
        latest_date: string;
        total_days: number;
        description: string;
    }>;
}
export interface VATRatesResponse {
    total_countries: number;
    date: string;
    vat_rates: Record<string, {
        country_code: string;
        country_name: string;
        vat_rate: number;
    }>;
}
export interface VATRateResponse {
    country: string;
    vat_data: {
        country_code: string;
        country_name: string;
        vat_rate: number;
    };
}
export interface TimeSeriesResponse {
    amount: number;
    base: string;
    start_date: string;
    end_date: string;
    total_days: number;
    currencies?: string[];
    data: Record<string, Record<string, number>>;
}
export declare class UnirateClient {
    private readonly baseUrl;
    private readonly apiKey;
    private readonly timeout;
    private readonly client;
    constructor(apiKey: string, timeout?: number);
    private makeRequest;
    /**
     * Get exchange rates between currencies
     * @param fromCurrency Source currency code. Defaults to "USD"
     * @param toCurrency Target currency code. If not specified, returns rates for all currencies
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns Exchange rate(s) or formatted response
     */
    getRate(fromCurrency?: string, toCurrency?: string, format?: OutputFormat, callback?: string): Promise<number | Record<string, number> | string>;
    /**
     * Convert an amount from one currency to another using current rates
     * @param toCurrency Target currency code
     * @param amount Amount to convert. Defaults to 1
     * @param fromCurrency Source currency code. Defaults to "USD"
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns Converted amount(s) or formatted response
     */
    convert(toCurrency: string, amount?: number, fromCurrency?: string, format?: OutputFormat, callback?: string): Promise<number | Record<string, number> | string>;
    /**
     * Get a list of all supported currency codes
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns List of currency codes or formatted response
     */
    getSupportedCurrencies(format?: OutputFormat, callback?: string): Promise<string[] | string>;
    /**
     * Get historical exchange rates for a specific date
     * @param date Date in YYYY-MM-DD format
     * @param amount Amount to convert. Defaults to 1
     * @param fromCurrency Source currency code. Defaults to "USD"
     * @param toCurrency Target currency code. If not specified, returns rates for all currencies
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns Historical exchange rate(s) or formatted response
     */
    getHistoricalRate(date: string, amount?: number, fromCurrency?: string, toCurrency?: string, format?: OutputFormat, callback?: string): Promise<number | Record<string, number> | string>;
    /**
     * Get historical exchange rates for a specific date (all rates for a base currency)
     * @param date Date in YYYY-MM-DD format
     * @param amount Amount to convert. Defaults to 1
     * @param baseCurrency Base currency code. Defaults to "USD"
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns Dictionary containing all exchange rates for the specified date or formatted response
     */
    getHistoricalRates(date: string, amount?: number, baseCurrency?: string, format?: OutputFormat, callback?: string): Promise<Record<string, number> | string>;
    /**
     * Convert amount using historical exchange rate for a specific date
     * @param amount Amount to convert
     * @param fromCurrency Source currency code
     * @param toCurrency Target currency code
     * @param date Date in YYYY-MM-DD format
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns Converted amount using historical rate or formatted response
     */
    convertHistorical(amount: number, fromCurrency: string, toCurrency: string, date: string, format?: OutputFormat, callback?: string): Promise<number | string>;
    /**
     * Get time series data for a date range with optional amount conversion (max 5 years)
     * @param startDate Start date in YYYY-MM-DD format
     * @param endDate End date in YYYY-MM-DD format
     * @param amount Amount to convert. Defaults to 1
     * @param baseCurrency Base currency code. Defaults to "USD"
     * @param currencies List of currency codes to retrieve. If not specified, returns all currencies
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns Dictionary containing time series data with dates as keys or formatted response
     */
    getTimeSeries(startDate: string, endDate: string, amount?: number, baseCurrency?: string, currencies?: string[], format?: OutputFormat, callback?: string): Promise<Record<string, Record<string, number>> | string>;
    /**
     * Get information about available historical data limits per currency
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns Dictionary containing historical data limits information or formatted response
     */
    getHistoricalLimits(format?: OutputFormat, callback?: string): Promise<HistoricalLimitsResponse | string>;
    /**
     * Get VAT rates for all countries or a specific country
     * @param country Two-letter country code (e.g., "DE", "FR") for specific country rates
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns Dictionary containing VAT rates information or formatted response
     */
    getVATRates(country?: string, format?: OutputFormat, callback?: string): Promise<VATRatesResponse | VATRateResponse | string>;
}
