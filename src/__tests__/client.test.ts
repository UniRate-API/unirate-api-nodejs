import { UnirateClient, UnirateError } from '../index';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UnirateClient', () => {
  let client: UnirateClient;

  beforeEach(() => {
    client = new UnirateClient('test-api-key');
    jest.clearAllMocks();
  });

  describe('getRate', () => {
    it('should return exchange rate', async () => {
      const mockResponse = { data: { rate: '0.85' } };
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const rate = await client.getRate('USD', 'EUR');
      expect(rate).toBe(0.85);
    });

    it('should throw UnirateError on API failure', async () => {
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue(new Error('API Error')),
      } as any);

      await expect(client.getRate('USD', 'EUR')).rejects.toThrow(UnirateError);
    });
  });

  describe('convert', () => {
    it('should convert amount between currencies', async () => {
      const mockResponse = { data: { result: '85.00' } };
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const amount = await client.convert(100, 'USD', 'EUR');
      expect(amount).toBe(85.00);
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return list of supported currencies', async () => {
      const mockResponse = { data: { currencies: ['USD', 'EUR', 'GBP'] } };
      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const currencies = await client.getSupportedCurrencies();
      expect(currencies).toEqual(['USD', 'EUR', 'GBP']);
    });
  });
}); 