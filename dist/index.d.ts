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
}
