import axios, { AxiosInstance, AxiosError } from 'axios';

// Error classes
export class UnirateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnirateError';
  }
}

export class AuthenticationError extends UnirateError {
  constructor(message: string = 'Missing or invalid API key') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends UnirateError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class InvalidCurrencyError extends UnirateError {
  constructor(message: string = 'Currency not found or no data available') {
    super(message);
    this.name = 'InvalidCurrencyError';
  }
}

export class InvalidDateError extends UnirateError {
  constructor(message: string = 'Invalid request parameters') {
    super(message);
    this.name = 'InvalidDateError';
  }
}

export class APIError extends UnirateError {
  public statusCode?: number;
  public response?: any;
  
  constructor(message: string, statusCode?: number, response?: any) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

// Types
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
    params: Record<string, any> = {},
    format: OutputFormat = 'json',
    callback?: string
  ): Promise<T | string> {
    try {
      const requestParams: Record<string, any> = {
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
      } else if (response.status === 401) {
        throw new AuthenticationError('Missing or invalid API key');
      } else if (response.status === 404) {
        throw new InvalidCurrencyError('Currency not found or no data available');
      } else if (response.status === 429) {
        throw new RateLimitError('Rate limit exceeded');
      } else if (response.status === 503) {
        throw new APIError('Service unavailable', response.status);
      }

      // Return appropriate format
      if (format === 'json') {
        return response.data as T;
      } else {
        return response.data as string;
      }
    } catch (error) {
      if (error instanceof AuthenticationError || 
          error instanceof RateLimitError || 
          error instanceof InvalidCurrencyError || 
          error instanceof InvalidDateError || 
          error instanceof APIError) {
        throw error;
      }
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // Handle specific HTTP status codes
        if (axiosError.response?.status === 400) {
          throw new InvalidDateError('Invalid request parameters');
        } else if (axiosError.response?.status === 401) {
          throw new AuthenticationError('Missing or invalid API key');
        } else if (axiosError.response?.status === 404) {
          throw new InvalidCurrencyError('Currency not found or no data available');
        } else if (axiosError.response?.status === 429) {
          throw new RateLimitError('Rate limit exceeded');
        } else if (axiosError.response?.status === 503) {
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
  async getRate(
    fromCurrency: string = 'USD',
    toCurrency?: string,
    format: OutputFormat = 'json',
    callback?: string
  ): Promise<number | Record<string, number> | string> {
    const params: Record<string, any> = {
      from: fromCurrency.toUpperCase()
    };

    if (toCurrency) {
      params.to = toCurrency.toUpperCase();
    }

    const response = await this.makeRequest<any>(
      'GET', 
      '/api/rates', 
      params, 
      format, 
      callback
    );

    if (format !== 'json') {
      return response as string;
    }

    const jsonResponse = response as any;
    if (toCurrency) {
      return parseFloat(jsonResponse.rate);
    } else {
      const rates: Record<string, number> = {};
      for (const [currency, rate] of Object.entries(jsonResponse.rates)) {
        rates[currency] = parseFloat(rate as string);
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
  async convert(
    toCurrency: string,
    amount: number = 1,
    fromCurrency: string = 'USD',
    format: OutputFormat = 'json',
    callback?: string
  ): Promise<number | Record<string, number> | string> {
    const params = {
      amount,
      from: fromCurrency.toUpperCase(),
      to: toCurrency.toUpperCase()
    };

    const response = await this.makeRequest<any>(
      'GET', 
      '/api/convert', 
      params, 
      format, 
      callback
    );

    if (format !== 'json') {
      return response as string;
    }

    const jsonResponse = response as any;
    if ('result' in jsonResponse) {
      return parseFloat(jsonResponse.result);
    } else {
      const results: Record<string, number> = {};
      for (const [currency, result] of Object.entries(jsonResponse.results)) {
        results[currency] = parseFloat(result as string);
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
  async getSupportedCurrencies(
    format: OutputFormat = 'json',
    callback?: string
  ): Promise<string[] | string> {
    const response = await this.makeRequest<{ currencies: string[] }>(
      'GET', 
      '/api/currencies', 
      {}, 
      format, 
      callback
    );

    if (format !== 'json') {
      return response as string;
    }

    return (response as { currencies: string[] }).currencies;
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
  async getHistoricalRate(
    date: string,
    amount: number = 1,
    fromCurrency: string = 'USD',
    toCurrency?: string,
    format: OutputFormat = 'json',
    callback?: string
  ): Promise<number | Record<string, number> | string> {
    const params: Record<string, any> = {
      date,
      amount,
      from: fromCurrency.toUpperCase()
    };

    if (toCurrency) {
      params.to = toCurrency.toUpperCase();
    }

    const response = await this.makeRequest<any>(
      'GET', 
      '/api/historical/rates', 
      params, 
      format, 
      callback
    );

    if (format !== 'json') {
      return response as string;
    }

    const jsonResponse = response as any;
    if (toCurrency) {
      if (amount === 1) {
        return parseFloat(jsonResponse.rate);
      } else {
        return parseFloat(jsonResponse.result);
      }
    } else {
      if (amount === 1) {
        const rates: Record<string, number> = {};
        for (const [currency, rate] of Object.entries(jsonResponse.rates)) {
          rates[currency] = parseFloat(rate as string);
        }
        return rates;
      } else {
        const results: Record<string, number> = {};
        for (const [currency, result] of Object.entries(jsonResponse.results)) {
          results[currency] = parseFloat(result as string);
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
  async getHistoricalRates(
    date: string,
    amount: number = 1,
    baseCurrency: string = 'USD',
    format: OutputFormat = 'json',
    callback?: string
  ): Promise<Record<string, number> | string> {
    return this.getHistoricalRate(date, amount, baseCurrency, undefined, format, callback) as Promise<Record<string, number> | string>;
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
  async convertHistorical(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date: string,
    format: OutputFormat = 'json',
    callback?: string
  ): Promise<number | string> {
    return this.getHistoricalRate(
      date,
      amount,
      fromCurrency,
      toCurrency,
      format,
      callback
    ) as Promise<number | string>;
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
  async getTimeSeries(
    startDate: string,
    endDate: string,
    amount: number = 1,
    baseCurrency: string = 'USD',
    currencies?: string[],
    format: OutputFormat = 'json',
    callback?: string
  ): Promise<Record<string, Record<string, number>> | string> {
    const params: Record<string, any> = {
      start_date: startDate,
      end_date: endDate,
      amount,
      base: baseCurrency.toUpperCase()
    };

    if (currencies) {
      params.currencies = currencies.map(c => c.toUpperCase()).join(',');
    }

    const response = await this.makeRequest<TimeSeriesResponse>(
      'GET', 
      '/api/historical/timeseries', 
      params, 
      format, 
      callback
    );

    if (format !== 'json') {
      return response as string;
    }

    return (response as TimeSeriesResponse).data;
  }

  /**
   * Get information about available historical data limits per currency
   * @param format Response format (json, xml, csv, tsv). Defaults to "json"
   * @param callback JSONP callback function name
   * @returns Dictionary containing historical data limits information or formatted response
   */
  async getHistoricalLimits(
    format: OutputFormat = 'json',
    callback?: string
  ): Promise<HistoricalLimitsResponse | string> {
    const response = await this.makeRequest<HistoricalLimitsResponse>(
      'GET', 
      '/api/historical/limits', 
      {}, 
      format, 
      callback
    );

    if (format !== 'json') {
      return response as string;
    }

    return response as HistoricalLimitsResponse;
  }

  /**
   * Get VAT rates for all countries or a specific country
   * @param country Two-letter country code (e.g., "DE", "FR") for specific country rates
   * @param format Response format (json, xml, csv, tsv). Defaults to "json"
   * @param callback JSONP callback function name
   * @returns Dictionary containing VAT rates information or formatted response
   */
  async getVATRates(
    country?: string,
    format: OutputFormat = 'json',
    callback?: string
  ): Promise<VATRatesResponse | VATRateResponse | string> {
    const params: Record<string, any> = {};
    if (country) {
      params.country = country.toUpperCase();
    }

    const response = await this.makeRequest<VATRatesResponse | VATRateResponse>(
      'GET', 
      '/api/vat/rates', 
      params, 
      format, 
      callback
    );

    if (format !== 'json') {
      return response as string;
    }

    return response as VATRatesResponse | VATRateResponse;
  }
} 