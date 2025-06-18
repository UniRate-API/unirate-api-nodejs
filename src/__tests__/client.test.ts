import axios from 'axios';
import { UnirateClient, UnirateError } from '../index';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UnirateClient', () => {
  let client: UnirateClient;
  let mockRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock request function
    mockRequest = jest.fn();
    
    // Mock axios.create to return an object with the mock request function
    mockedAxios.create.mockReturnValue({
      request: mockRequest
    } as any);
    
    client = new UnirateClient('test-api-key');
  });

  it('should create client with correct configuration', () => {
    expect(client).toBeInstanceOf(UnirateClient);
  });

  describe('getRate', () => {
    it('should return exchange rate', async () => {
      const mockResponse = { data: { rate: '0.85' } };
      mockRequest.mockResolvedValue(mockResponse);

      const rate = await client.getRate('USD', 'EUR');
      expect(rate).toBe(0.85);
    });

    it('should throw UnirateError on API failure', async () => {
      mockRequest.mockRejectedValue(new Error('Network error'));

      await expect(client.getRate('USD', 'EUR')).rejects.toThrow(UnirateError);
    });
  });

  describe('convert', () => {
    it('should convert currency amount', async () => {
      const mockResponse = { data: { result: '85.0' } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await client.convert(100, 'USD', 'EUR');
      expect(result).toBe(85.0);
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return list of supported currencies', async () => {
      const mockResponse = { data: { currencies: ['USD', 'EUR', 'GBP'] } };
      mockRequest.mockResolvedValue(mockResponse);

      const currencies = await client.getSupportedCurrencies();
      expect(currencies).toEqual(['USD', 'EUR', 'GBP']);
    });
  });

  describe('getHistoricalRate', () => {
    it('should return historical exchange rate for specific date', async () => {
      const mockResponse = { data: { rate: '0.82' } };
      mockRequest.mockResolvedValue(mockResponse);

      const rate = await client.getHistoricalRate('USD', 'EUR', '2024-01-01');
      expect(rate).toBe(0.82);
    });

    it('should make request with correct parameters', async () => {
      const mockResponse = { data: { rate: '0.82' } };
      mockRequest.mockResolvedValue(mockResponse);

      await client.getHistoricalRate('USD', 'EUR', '2024-01-01');
      
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/historical/rates',
        params: {
          from: 'USD',
          to: 'EUR',
          date: '2024-01-01',
          api_key: 'test-api-key'
        }
      });
    });
  });

  describe('getHistoricalRates', () => {
    it('should return all historical rates for base currency', async () => {
      const mockResponse = { 
        data: { 
          base: 'USD',
          rates: { 
            'EUR': '0.82', 
            'GBP': '0.75',
            'JPY': '110.0'
          } 
        } 
      };
      mockRequest.mockResolvedValue(mockResponse);

      const rates = await client.getHistoricalRates('USD', '2024-01-01');
      expect(rates).toEqual({
        EUR: 0.82,
        GBP: 0.75,
        JPY: 110.0
      });
    });
  });

  describe('convertHistorical', () => {
    it('should convert amount using historical rate', async () => {
      const mockResponse = { data: { rate: '0.82' } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await client.convertHistorical(100, 'USD', 'EUR', '2024-01-01');
      expect(result).toBe(82.0);
    });

    it('should make request with correct parameters', async () => {
      const mockResponse = { data: { rate: '0.82' } };
      mockRequest.mockResolvedValue(mockResponse);

      await client.convertHistorical(100, 'USD', 'EUR', '2024-01-01');
      
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/historical/rates',
        params: {
          from: 'USD',
          to: 'EUR',
          date: '2024-01-01',
          api_key: 'test-api-key'
        }
      });
    });
  });

  describe('getTimeSeries', () => {
    it('should return time series data for currency pair', async () => {
      const mockResponse = { 
        data: { 
          data: { 
            '2024-01-01': { 'EUR': '0.82' }, 
            '2024-01-02': { 'EUR': '0.83' },
            '2024-01-03': { 'EUR': '0.81' }
          } 
        } 
      };
      mockRequest.mockResolvedValue(mockResponse);

      const timeSeries = await client.getTimeSeries('USD', 'EUR', '2024-01-01', '2024-01-03');
      expect(timeSeries).toEqual({
        '2024-01-01': 0.82,
        '2024-01-02': 0.83,
        '2024-01-03': 0.81
      });
    });

    it('should make request with correct parameters', async () => {
      const mockResponse = { 
        data: { data: { '2024-01-01': { 'EUR': '0.82' } } } 
      };
      mockRequest.mockResolvedValue(mockResponse);

      await client.getTimeSeries('USD', 'EUR', '2024-01-01', '2024-01-07');
      
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/historical/timeseries',
        params: {
          base: 'USD',
          currencies: 'EUR',
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          api_key: 'test-api-key'
        }
      });
    });
  });

  describe('error handling', () => {
    it('should throw UnirateError on API failure', async () => {
      mockRequest.mockRejectedValue(new Error('Network error'));

      await expect(client.getRate('USD', 'EUR')).rejects.toThrow(UnirateError);
    });

    it('should throw UnirateError on historical API failure', async () => {
      mockRequest.mockRejectedValue(new Error('Network error'));

      await expect(client.getHistoricalRate('USD', 'EUR', '2024-01-01')).rejects.toThrow(UnirateError);
    });
  });
}); 