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
            throw error;
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
}
exports.UnirateClient = UnirateClient;
