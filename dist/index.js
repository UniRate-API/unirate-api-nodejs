"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnirateClient = exports.UnirateError = void 0;
const axios_1 = __importDefault(require("axios"));
class UnirateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnirateError';
    }
}
exports.UnirateError = UnirateError;
class UnirateClient {
    constructor(apiKey, timeout = 30000) {
        this.baseUrl = 'https://api.unirateapi.com';
        this.apiKey = apiKey;
        this.timeout = timeout;
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: this.timeout,
            headers: {
                'User-Agent': `unirate-node/${require('../package.json').version}`
            }
        });
    }
    async makeRequest(method, endpoint, params = {}) {
        try {
            const response = await this.client.request({
                method,
                url: endpoint,
                params: {
                    ...params,
                    api_key: this.apiKey
                }
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new UnirateError(`API request failed: ${error.message}`);
            }
            if (error instanceof Error) {
                throw new UnirateError(`API request failed: ${error.message}`);
            }
            throw new UnirateError('API request failed: Unknown error');
        }
    }
    async getRate(fromCurrency, toCurrency) {
        const response = await this.makeRequest('GET', '/api/rates', {
            from: fromCurrency.toUpperCase(),
            to: toCurrency.toUpperCase()
        });
        return parseFloat(response.rate);
    }
    async convert(amount, fromCurrency, toCurrency) {
        const response = await this.makeRequest('GET', '/api/convert', {
            amount,
            from: fromCurrency.toUpperCase(),
            to: toCurrency.toUpperCase()
        });
        return parseFloat(response.result);
    }
    async getSupportedCurrencies() {
        const response = await this.makeRequest('GET', '/api/currencies');
        return response.currencies;
    }
    /**
     * Get historical exchange rate for a specific date
     * @param fromCurrency Source currency code (e.g., "USD")
     * @param toCurrency Target currency code (e.g., "EUR")
     * @param date Date in YYYY-MM-DD format
     * @returns Historical exchange rate
     */
    async getHistoricalRate(fromCurrency, toCurrency, date) {
        const response = await this.makeRequest('GET', '/api/historical/rates', {
            from: fromCurrency.toUpperCase(),
            to: toCurrency.toUpperCase(),
            date
        });
        return parseFloat(response.rate);
    }
    /**
     * Get historical exchange rates for a specific date (all rates for a base currency)
     * @param baseCurrency Base currency code (e.g., "USD")
     * @param date Date in YYYY-MM-DD format
     * @returns Object containing all exchange rates for the specified date
     */
    async getHistoricalRates(baseCurrency, date) {
        const response = await this.makeRequest('GET', '/api/historical/rates', {
            from: baseCurrency.toUpperCase(),
            date
        });
        const rates = {};
        for (const [currency, rate] of Object.entries(response.rates)) {
            rates[currency] = parseFloat(rate);
        }
        return rates;
    }
    /**
     * Convert amount using historical exchange rate for a specific date
     * @param amount Amount to convert
     * @param fromCurrency Source currency code (e.g., "USD")
     * @param toCurrency Target currency code (e.g., "EUR")
     * @param date Date in YYYY-MM-DD format
     * @returns Converted amount using historical rate
     */
    async convertHistorical(amount, fromCurrency, toCurrency, date) {
        // Get historical rate and multiply by amount since there's no direct convert endpoint
        const rate = await this.getHistoricalRate(fromCurrency, toCurrency, date);
        return amount * rate;
    }
    /**
     * Get time series data for a currency pair over a date range
     * @param fromCurrency Source currency code (e.g., "USD")
     * @param toCurrency Target currency code (e.g., "EUR")
     * @param startDate Start date in YYYY-MM-DD format
     * @param endDate End date in YYYY-MM-DD format
     * @returns Object containing time series data
     */
    async getTimeSeries(fromCurrency, toCurrency, startDate, endDate) {
        const response = await this.makeRequest('GET', '/api/historical/timeseries', {
            base: fromCurrency.toUpperCase(),
            currencies: toCurrency.toUpperCase(),
            start_date: startDate,
            end_date: endDate
        });
        const rates = {};
        for (const [date, currencyRates] of Object.entries(response.data)) {
            rates[date] = parseFloat(currencyRates[toCurrency.toUpperCase()]);
        }
        return rates;
    }
}
exports.UnirateClient = UnirateClient;
