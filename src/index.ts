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
      if (error instanceof Error) {
        throw new UnirateError(`API request failed: ${error.message}`);
      }
      throw new UnirateError('API request failed: Unknown error');
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

  /**
   * Get historical exchange rate for a specific date
   * @param fromCurrency Source currency code (e.g., "USD")
   * @param toCurrency Target currency code (e.g., "EUR")
   * @param date Date in YYYY-MM-DD format
   * @returns Historical exchange rate
   */
  async getHistoricalRate(
    fromCurrency: string,
    toCurrency: string,
    date: string
  ): Promise<number> {
    const response = await this.makeRequest<{ rate: string }>('GET', '/api/historical/rates', {
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
  async getHistoricalRates(
    baseCurrency: string,
    date: string
  ): Promise<Record<string, number>> {
    const response = await this.makeRequest<{ base: string; rates: Record<string, string> }>('GET', '/api/historical/rates', {
      from: baseCurrency.toUpperCase(),
      date
    });
    
    const rates: Record<string, number> = {};
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
  async convertHistorical(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date: string
  ): Promise<number> {
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
  async getTimeSeries(
    fromCurrency: string,
    toCurrency: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, number>> {
    const response = await this.makeRequest<{ data: Record<string, Record<string, string>> }>('GET', '/api/historical/timeseries', {
      base: fromCurrency.toUpperCase(),
      currencies: toCurrency.toUpperCase(),
      start_date: startDate,
      end_date: endDate
    });
    
    const rates: Record<string, number> = {};
    for (const [date, currencyRates] of Object.entries(response.data)) {
      rates[date] = parseFloat(currencyRates[toCurrency.toUpperCase()]);
    }
    return rates;
  }
} 