import axios, { AxiosInstance } from 'axios';

export class UnirateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnirateError';
  }
}

export class UnirateClient {
  private readonly baseUrl: string = 'https://api.unirateapi.com';
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly client: AxiosInstance;

  constructor(apiKey: string, timeout: number = 30000) {
    this.apiKey = apiKey;
    this.timeout = timeout;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'User-Agent': `unirate-node/${require('../package.json').version}`
      }
    });
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T> {
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new UnirateError(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  async getRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const response = await this.makeRequest<{ rate: string }>('GET', '/api/rates', {
      from: fromCurrency.toUpperCase(),
      to: toCurrency.toUpperCase()
    });
    return parseFloat(response.rate);
  }

  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    const response = await this.makeRequest<{ result: string }>('GET', '/api/convert', {
      amount,
      from: fromCurrency.toUpperCase(),
      to: toCurrency.toUpperCase()
    });
    return parseFloat(response.result);
  }

  async getSupportedCurrencies(): Promise<string[]> {
    const response = await this.makeRequest<{ currencies: string[] }>('GET', '/api/currencies');
    return response.currencies;
  }
} 