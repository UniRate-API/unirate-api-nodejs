# Unirate API Node.js Client

Official Node.js client for the Unirate API, providing easy access to currency exchange rates and conversion functionality.

## Installation

```bash
npm install unirate-api
```

## Usage

```typescript
import { UnirateClient } from 'unirate-api';

// Initialize the client with your API key
const client = new UnirateClient('your-api-key');

// Get exchange rate between currencies
const rate = await client.getRate('USD', 'EUR');
console.log(`1 USD = ${rate} EUR`);

// Convert amount between currencies
const amount = await client.convert(100, 'USD', 'EUR');
console.log(`100 USD = ${amount} EUR`);

// Get list of supported currencies
const currencies = await client.getSupportedCurrencies();
console.log('Supported currencies:', currencies);
```

## API Reference

### Constructor

```typescript
new UnirateClient(apiKey: string, timeout?: number)
```

- `apiKey` (required): Your Unirate API key
- `timeout` (optional): Request timeout in milliseconds (default: 30000)

### Methods

#### getRate(fromCurrency: string, toCurrency: string): Promise<number>

Get the exchange rate between two currencies.

#### convert(amount: number, fromCurrency: string, toCurrency: string): Promise<number>

Convert an amount from one currency to another.

#### getSupportedCurrencies(): Promise<string[]>

Get a list of supported currency codes.

## Error Handling

The client throws `UnirateError` for API-related errors. You can catch and handle these errors as follows:

```typescript
try {
  const rate = await client.getRate('USD', 'EUR');
} catch (error) {
  if (error instanceof UnirateError) {
    console.error('API Error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## License

MIT 