"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnirateClient = exports.APIError = exports.InvalidDateError = exports.InvalidCurrencyError = exports.RateLimitError = exports.AuthenticationError = exports.UnirateError = void 0;
const axios_1 = __importDefault(require("axios"));
// Error classes
class UnirateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnirateError';
    }
}
exports.UnirateError = UnirateError;
class AuthenticationError extends UnirateError {
    constructor(message = 'Missing or invalid API key') {
        super(message);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class RateLimitError extends UnirateError {
    constructor(message = 'Rate limit exceeded') {
        super(message);
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
class InvalidCurrencyError extends UnirateError {
    constructor(message = 'Currency not found or no data available') {
        super(message);
        this.name = 'InvalidCurrencyError';
    }
}
exports.InvalidCurrencyError = InvalidCurrencyError;
class InvalidDateError extends UnirateError {
    constructor(message = 'Invalid request parameters') {
        super(message);
        this.name = 'InvalidDateError';
    }
}
exports.InvalidDateError = InvalidDateError;
class APIError extends UnirateError {
    constructor(message, statusCode, response) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.response = response;
    }
}
exports.APIError = APIError;
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
    async makeRequest(method, endpoint, params = {}, format = 'json', callback) {
        var _a, _b, _c, _d, _e;
        try {
            const requestParams = {
                ...params,
                api_key: this.apiKey
            };
            // Add format parameter if not JSON
            if (format !== 'json') {
                requestParams.format = format;
            }
            // Add callback parameter for JSONP
            if (callback && format === 'json') {
                requestParams.callback = callback;
            }
            const response = await this.client.request({
                method,
                url: endpoint,
                params: requestParams
            });
            // Handle different response status codes
            if (response.status === 400) {
                throw new InvalidDateError('Invalid request parameters');
            }
            else if (response.status === 401) {
                throw new AuthenticationError('Missing or invalid API key');
            }
            else if (response.status === 404) {
                throw new InvalidCurrencyError('Currency not found or no data available');
            }
            else if (response.status === 429) {
                throw new RateLimitError('Rate limit exceeded');
            }
            else if (response.status === 503) {
                throw new APIError('Service unavailable', response.status);
            }
            // Return appropriate format
            if (format === 'json') {
                return response.data;
            }
            else {
                return response.data;
            }
        }
        catch (error) {
            if (error instanceof AuthenticationError ||
                error instanceof RateLimitError ||
                error instanceof InvalidCurrencyError ||
                error instanceof InvalidDateError ||
                error instanceof APIError) {
                throw error;
            }
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                // Handle specific HTTP status codes
                if (((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) === 400) {
                    throw new InvalidDateError('Invalid request parameters');
                }
                else if (((_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.status) === 401) {
                    throw new AuthenticationError('Missing or invalid API key');
                }
                else if (((_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.status) === 404) {
                    throw new InvalidCurrencyError('Currency not found or no data available');
                }
                else if (((_d = axiosError.response) === null || _d === void 0 ? void 0 : _d.status) === 429) {
                    throw new RateLimitError('Rate limit exceeded');
                }
                else if (((_e = axiosError.response) === null || _e === void 0 ? void 0 : _e.status) === 503) {
                    throw new APIError('Service unavailable', axiosError.response.status);
                }
                throw new UnirateError(`API request failed: ${axiosError.message}`);
            }
            if (error instanceof Error) {
                throw new UnirateError(`API request failed: ${error.message}`);
            }
            throw new UnirateError('API request failed: Unknown error');
        }
    }
    /**
     * Get exchange rates between currencies
     * @param fromCurrency Source currency code. Defaults to "USD"
     * @param toCurrency Target currency code. If not specified, returns rates for all currencies
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns Exchange rate(s) or formatted response
     */
    async getRate(fromCurrency = 'USD', toCurrency, format = 'json', callback) {
        const params = {
            from: fromCurrency.toUpperCase()
        };
        if (toCurrency) {
            params.to = toCurrency.toUpperCase();
        }
        const response = await this.makeRequest('GET', '/api/rates', params, format, callback);
        if (format !== 'json') {
            return response;
        }
        const jsonResponse = response;
        if (toCurrency) {
            return parseFloat(jsonResponse.rate);
        }
        else {
            const rates = {};
            for (const [currency, rate] of Object.entries(jsonResponse.rates)) {
                rates[currency] = parseFloat(rate);
            }
            return rates;
        }
    }
    /**
     * Convert an amount from one currency to another using current rates
     * @param toCurrency Target currency code
     * @param amount Amount to convert. Defaults to 1
     * @param fromCurrency Source currency code. Defaults to "USD"
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns Converted amount(s) or formatted response
     */
    async convert(toCurrency, amount = 1, fromCurrency = 'USD', format = 'json', callback) {
        const params = {
            amount,
            from: fromCurrency.toUpperCase(),
            to: toCurrency.toUpperCase()
        };
        const response = await this.makeRequest('GET', '/api/convert', params, format, callback);
        if (format !== 'json') {
            return response;
        }
        const jsonResponse = response;
        if ('result' in jsonResponse) {
            return parseFloat(jsonResponse.result);
        }
        else {
            const results = {};
            for (const [currency, result] of Object.entries(jsonResponse.results)) {
                results[currency] = parseFloat(result);
            }
            return results;
        }
    }
    /**
     * Get a list of all supported currency codes
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns List of currency codes or formatted response
     */
    async getSupportedCurrencies(format = 'json', callback) {
        const response = await this.makeRequest('GET', '/api/currencies', {}, format, callback);
        if (format !== 'json') {
            return response;
        }
        return response.currencies;
    }
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
    async getHistoricalRate(date, amount = 1, fromCurrency = 'USD', toCurrency, format = 'json', callback) {
        const params = {
            date,
            amount,
            from: fromCurrency.toUpperCase()
        };
        if (toCurrency) {
            params.to = toCurrency.toUpperCase();
        }
        const response = await this.makeRequest('GET', '/api/historical/rates', params, format, callback);
        if (format !== 'json') {
            return response;
        }
        const jsonResponse = response;
        if (toCurrency) {
            if (amount === 1) {
                return parseFloat(jsonResponse.rate);
            }
            else {
                return parseFloat(jsonResponse.result);
            }
        }
        else {
            if (amount === 1) {
                const rates = {};
                for (const [currency, rate] of Object.entries(jsonResponse.rates)) {
                    rates[currency] = parseFloat(rate);
                }
                return rates;
            }
            else {
                const results = {};
                for (const [currency, result] of Object.entries(jsonResponse.results)) {
                    results[currency] = parseFloat(result);
                }
                return results;
            }
        }
    }
    /**
     * Get historical exchange rates for a specific date (all rates for a base currency)
     * @param date Date in YYYY-MM-DD format
     * @param amount Amount to convert. Defaults to 1
     * @param baseCurrency Base currency code. Defaults to "USD"
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns Dictionary containing all exchange rates for the specified date or formatted response
     */
    async getHistoricalRates(date, amount = 1, baseCurrency = 'USD', format = 'json', callback) {
        return this.getHistoricalRate(date, amount, baseCurrency, undefined, format, callback);
    }
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
    async convertHistorical(amount, fromCurrency, toCurrency, date, format = 'json', callback) {
        return this.getHistoricalRate(date, amount, fromCurrency, toCurrency, format, callback);
    }
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
    async getTimeSeries(startDate, endDate, amount = 1, baseCurrency = 'USD', currencies, format = 'json', callback) {
        const params = {
            start_date: startDate,
            end_date: endDate,
            amount,
            base: baseCurrency.toUpperCase()
        };
        if (currencies) {
            params.currencies = currencies.map(c => c.toUpperCase()).join(',');
        }
        const response = await this.makeRequest('GET', '/api/historical/timeseries', params, format, callback);
        if (format !== 'json') {
            return response;
        }
        return response.data;
    }
    /**
     * Get information about available historical data limits per currency
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns Dictionary containing historical data limits information or formatted response
     */
    async getHistoricalLimits(format = 'json', callback) {
        const response = await this.makeRequest('GET', '/api/historical/limits', {}, format, callback);
        if (format !== 'json') {
            return response;
        }
        return response;
    }
    /**
     * Get VAT rates for all countries or a specific country
     * @param country Two-letter country code (e.g., "DE", "FR") for specific country rates
     * @param format Response format (json, xml, csv, tsv). Defaults to "json"
     * @param callback JSONP callback function name
     * @returns Dictionary containing VAT rates information or formatted response
     */
    async getVATRates(country, format = 'json', callback) {
        const params = {};
        if (country) {
            params.country = country.toUpperCase();
        }
        const response = await this.makeRequest('GET', '/api/vat/rates', params, format, callback);
        if (format !== 'json') {
            return response;
        }
        return response;
    }
}
exports.UnirateClient = UnirateClient;
