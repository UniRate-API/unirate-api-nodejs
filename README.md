# Unirate Node.js API Client

A simple Node.js/TypeScript client for the [Unirate API](https://unirateapi.com) - providing free, real-time and historical currency exchange rates.

## Features

- 🔄 **Real-time exchange rates** - Get current currency conversion rates
- 📈 **Historical data** - Access historical exchange rates for any date
- ⏰ **Time series data** - Retrieve exchange rate data over date ranges
- 💰 **Currency conversion** - Convert amounts between currencies (current and historical)
- 🌍 **590+ currencies supported** - Including cryptocurrencies
- 🆓 **Completely free** - No credit card required
- 🚀 **Easy to use** - Simple, intuitive API
- ⚡ **TypeScript support** - Full type definitions included

## Installation

```bash
npm install unirate-node-api
```

## Quick Start

```typescript
import { UnirateClient } from 'unirate-node-api';

// Initialize the client
const client = new UnirateClient('your-api-key-here');

async function main() {
  // Get current exchange rate
  const rate = await client.getRate('USD', 'EUR');
  console.log(`USD to EUR rate: ${rate}`);

  // Convert currency
  const amount = await client.convert(100, 'USD', 'EUR');
  console.log(`100 USD = ${amount} EUR`);

  // Get supported currencies
  const currencies = await client.getSupportedCurrencies();
  console.log(`Supported currencies: ${currencies.length}`);
}

main();
```

## API Methods

### Current Rates & Conversion

#### `getRate(fromCurrency, toCurrency)`
Get the current exchange rate between two currencies.

```typescript
const rate = await client.getRate('USD', 'EUR');
```

#### `convert(amount, fromCurrency, toCurrency)`
Convert an amount from one currency to another using current rates.

```typescript
const converted = await client.convert(100, 'USD', 'EUR');
```

#### `getSupportedCurrencies()`
Get a list of all supported currency codes.

```typescript
const currencies = await client.getSupportedCurrencies();
```

### Historical Data

#### `getHistoricalRate(fromCurrency, toCurrency, date)`
Get the exchange rate between two currencies for a specific historical date.

```typescript
// Get USD to EUR rate for January 1st, 2024
const historicalRate = await client.getHistoricalRate('USD', 'EUR', '2024-01-01');
console.log(`USD to EUR on 2024-01-01: ${historicalRate}`);
```

#### `getHistoricalRates(baseCurrency, date)`
Get all exchange rates for a base currency on a specific historical date.

```typescript
// Get all USD rates for January 1st, 2024
const rates = await client.getHistoricalRates('USD', '2024-01-01');
console.log(`USD to EUR: ${rates.EUR}`);
console.log(`USD to GBP: ${rates.GBP}`);
```

#### `convertHistorical(amount, fromCurrency, toCurrency, date)`
Convert an amount using historical exchange rates for a specific date.

```typescript
// Convert 100 USD to EUR using rates from January 1st, 2024
const converted = await client.convertHistorical(100, 'USD', 'EUR', '2024-01-01');
console.log(`100 USD = ${converted} EUR (on 2024-01-01)`);
```

#### `getTimeSeries(fromCurrency, toCurrency, startDate, endDate)`
Get time series exchange rate data for a currency pair over a date range.

```typescript
// Get USD to EUR rates for the first week of January 2024
const timeSeries = await client.getTimeSeries('USD', 'EUR', '2024-01-01', '2024-01-07');
Object.entries(timeSeries).forEach(([date, rate]) => {
  console.log(`${date}: ${rate}`);
});
```

## Complete Example

```typescript
import { UnirateClient, UnirateError } from 'unirate-node-api';

async function main() {
  // Initialize client
  const client = new UnirateClient('your-api-key-here');
  
  try {
    console.log('=== Current Rates ===');
    
    // Current exchange rate
    const currentRate = await client.getRate('USD', 'EUR');
    console.log(`Current USD to EUR: ${currentRate}`);
    
    // Currency conversion
    const converted = await client.convert(1000, 'USD', 'EUR');
    console.log(`1000 USD = ${converted} EUR`);
    
    console.log('\n=== Historical Data ===');
    
    // Historical rate for specific date
    const historicalRate = await client.getHistoricalRate('USD', 'EUR', '2024-01-01');
    console.log(`USD to EUR on 2024-01-01: ${historicalRate}`);
    
    // Historical conversion
    const historicalConverted = await client.convertHistorical(1000, 'USD', 'EUR', '2024-01-01');
    console.log(`1000 USD = ${historicalConverted} EUR (on 2024-01-01)`);
    
    // Time series data
    const timeSeries = await client.getTimeSeries('USD', 'EUR', '2024-01-01', '2024-01-05');
    console.log('USD to EUR time series:');
    Object.entries(timeSeries).forEach(([date, rate]) => {
      console.log(`  ${date}: ${rate}`);
    });
    
  } catch (error) {
    if (error instanceof UnirateError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

main();
```

## Error Handling

The client throws `UnirateError` for API-related errors:

```typescript
import { UnirateClient, UnirateError } from 'unirate-node-api';

const client = new UnirateClient('your-api-key');

try {
  const rate = await client.getRate('USD', 'INVALID');
} catch (error) {
  if (error instanceof UnirateError) {
    console.error('API Error:', error.message);
  }
}
```

## Configuration

### Constructor Options

```typescript
const client = new UnirateClient(
  'your-api-key',     // API key (required)
  30000               // Timeout in milliseconds (optional, default: 30000)
);
```

### Environment Variables

You can also use environment variables:

```typescript
const client = new UnirateClient(process.env.UNIRATE_API_KEY!);
```

## API Key

Get your free API key from [https://unirateapi.com](https://unirateapi.com). No credit card required!

## Supported Currencies

The API supports 590+ currencies including:
- **Traditional currencies**: USD, EUR, GBP, JPY, CAD, AUD, etc.
- **Cryptocurrencies**: BTC, ETH, LTC, and many more

Use `getSupportedCurrencies()` to get the complete list.

## Requirements

- Node.js 14+
- TypeScript 4+ (for TypeScript projects)

## Dependencies

- axios - for HTTP requests

## License

MIT License 