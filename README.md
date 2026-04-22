# Unirate Node.js API Client

A comprehensive Node.js/TypeScript client for the [Unirate API](https://unirateapi.com) - providing free, real-time and historical currency exchange rates, plus VAT rates.

## Features

- 🔄 **Real-time exchange rates** - Get current currency conversion rates
- 📈 **Historical data** - Access historical exchange rates for any date (1999-2025)
- ⏰ **Time series data** - Retrieve exchange rate data over date ranges (max 5 years)
- 💰 **Currency conversion** - Convert amounts between currencies (current and historical)
- 🏛️ **VAT rates** - Get VAT rates for countries worldwide
- 📊 **Multiple output formats** - JSON, XML, CSV, TSV support
- 🌍 **170+ currencies supported** - Including cryptocurrencies
- 🆓 **Completely free** - No credit card required
- 🚀 **Easy to use** - Simple, intuitive API
- ⚡ **TypeScript support** - Full type definitions included

## Installation

```bash
npm install unirate-api
```

## Quick Start

```typescript
import { UnirateClient } from 'unirate-api';

// Initialize the client
const client = new UnirateClient('your-api-key-here');

async function main() {
  // Get current exchange rate
  const rate = await client.getRate('USD', 'EUR');
  console.log(`USD to EUR rate: ${rate}`);

  // Convert currency (note: toCurrency is now first parameter)
  const amount = await client.convert('EUR', 100, 'USD');
  console.log(`100 USD = ${amount} EUR`);

  // Get supported currencies
  const currencies = await client.getSupportedCurrencies() as string[];
  console.log(`Supported currencies: ${currencies.length}`);
}

main();
```

## API Methods

### Current Rates & Conversion

#### `getRate(fromCurrency?, toCurrency?, format?, callback?)`
Get current exchange rates. If `toCurrency` is omitted, returns rates for all currencies.

```typescript
// Single currency rate
const rate = await client.getRate('USD', 'EUR');

// All rates for base currency
const allRates = await client.getRate('USD') as Record<string, number>;

// Get rates in CSV format
const csvData = await client.getRate('USD', 'EUR', 'csv') as string;
```

#### `convert(toCurrency, amount?, fromCurrency?, format?, callback?)`
Convert an amount from one currency to another using current rates.

```typescript
// Convert with default amount (1)
const converted = await client.convert('EUR', 1, 'USD');

// Convert specific amount
const converted = await client.convert('EUR', 100, 'USD');

// Get conversion result in XML format
const xmlResult = await client.convert('EUR', 100, 'USD', 'xml') as string;
```

#### `getSupportedCurrencies(format?, callback?)`
Get a list of all supported currency codes.

```typescript
const currencies = await client.getSupportedCurrencies() as string[];

// Get currencies in CSV format
const csvCurrencies = await client.getSupportedCurrencies('csv') as string;
```

### Historical Data

#### `getHistoricalRate(date, amount?, fromCurrency?, toCurrency?, format?, callback?)`
Get historical exchange rates for a specific date. If `toCurrency` is omitted, returns rates for all currencies.

```typescript
// Single currency historical rate
const rate = await client.getHistoricalRate('2024-01-01', 1, 'USD', 'EUR');

// All historical rates for base currency
const allRates = await client.getHistoricalRate('2024-01-01', 1, 'USD') as Record<string, number>;

// Historical conversion with amount
const converted = await client.getHistoricalRate('2024-01-01', 100, 'USD', 'EUR');
```

#### `getHistoricalRates(date, amount?, baseCurrency?, format?, callback?)`
Alias for `getHistoricalRate` to get all exchange rates for a base currency on a specific date.

```typescript
const rates = await client.getHistoricalRates('2024-01-01', 1, 'USD') as Record<string, number>;
```

#### `convertHistorical(amount, fromCurrency, toCurrency, date, format?, callback?)`
Convert an amount using historical exchange rates for a specific date.

```typescript
const converted = await client.convertHistorical(100, 'USD', 'EUR', '2024-01-01');
```

#### `getTimeSeries(startDate, endDate, amount?, baseCurrency?, currencies?, format?, callback?)`
Get time series exchange rate data over a date range (max 5 years).

```typescript
// Time series for specific currencies
const timeSeries = await client.getTimeSeries(
  '2024-01-01', 
  '2024-01-07',
  1,
  'USD',
  ['EUR', 'GBP']
) as Record<string, Record<string, number>>;

// Time series for all currencies
const allSeries = await client.getTimeSeries('2024-01-01', '2024-01-07', 1, 'USD');

// Time series with amount conversion
const convertedSeries = await client.getTimeSeries(
  '2024-01-01', 
  '2024-01-07',
  100,
  'USD',
  ['EUR']
);
```

### New Features

#### `getHistoricalLimits(format?, callback?)`
Get information about available historical data limits per currency.

```typescript
import { HistoricalLimitsResponse } from 'unirate-api';

const limits = await client.getHistoricalLimits() as HistoricalLimitsResponse;
console.log(`Total currencies with historical data: ${limits.total_currencies}`);

Object.entries(limits.currencies).forEach(([currency, info]) => {
  console.log(`${currency}: ${info.earliest_date} to ${info.latest_date}`);
});
```

#### `getVATRates(country?, format?, callback?)`
Get VAT rates for all countries or a specific country.

```typescript
import { VATRatesResponse, VATRateResponse } from 'unirate-api';

// Get all VAT rates
const allVAT = await client.getVATRates() as VATRatesResponse;
console.log(`Total countries: ${allVAT.total_countries}`);

// Get VAT rate for specific country
const germanyVAT = await client.getVATRates('DE') as VATRateResponse;
console.log(`Germany VAT rate: ${germanyVAT.vat_data.vat_rate}%`);

// Get VAT rates in CSV format
const csvVAT = await client.getVATRates(undefined, 'csv') as string;
```

## Output Formats

All methods support multiple output formats:

- `json` (default) - Returns TypeScript objects
- `xml` - Returns XML string
- `csv` - Returns CSV string
- `tsv` - Returns TSV string

```typescript
// JSON (default)
const jsonData = await client.getRate('USD', 'EUR');

// XML format
const xmlData = await client.getRate('USD', 'EUR', 'xml') as string;

// CSV format
const csvData = await client.getRate('USD', 'EUR', 'csv') as string;

// TSV format
const tsvData = await client.getRate('USD', 'EUR', 'tsv') as string;
```

## JSONP Support

For JSON responses, you can specify a JSONP callback function:

```typescript
const jsonpData = await client.getRate('USD', 'EUR', 'json', 'myCallback');
```

## Complete Example

```typescript
import { 
  UnirateClient, 
  UnirateError, 
  AuthenticationError, 
  RateLimitError,
  HistoricalLimitsResponse,
  VATRatesResponse 
} from 'unirate-api';

async function main() {
  const client = new UnirateClient('your-api-key-here');
  
  try {
    console.log('=== Current Rates ===');
    
    // Current exchange rate
    const rate = await client.getRate('USD', 'EUR');
    console.log(`Current USD to EUR: ${rate}`);
    
    // All rates for USD
    const allRates = await client.getRate('USD') as Record<string, number>;
    console.log(`EUR: ${allRates.EUR}, GBP: ${allRates.GBP}`);
    
    // Currency conversion
    const converted = await client.convert('EUR', 1000, 'USD');
    console.log(`1000 USD = ${converted} EUR`);
    
    console.log('\n=== Historical Data ===');
    
    // Historical rate
    const historicalRate = await client.getHistoricalRate('2024-01-01', 1, 'USD', 'EUR');
    console.log(`USD to EUR on 2024-01-01: ${historicalRate}`);
    
    // Historical conversion
    const historicalConverted = await client.convertHistorical(1000, 'USD', 'EUR', '2024-01-01');
    console.log(`1000 USD = ${historicalConverted} EUR (on 2024-01-01)`);
    
    // Time series data
    const timeSeries = await client.getTimeSeries(
      '2024-01-01', '2024-01-05',
      1,
      'USD',
      ['EUR', 'GBP']
    ) as Record<string, Record<string, number>>;
    console.log('USD time series:');
    Object.entries(timeSeries).forEach(([date, rates]) => {
      console.log(`  ${date}: EUR=${rates.EUR}, GBP=${rates.GBP}`);
    });
    
    console.log('\n=== New Features ===');
    
    // Historical limits
    const limits = await client.getHistoricalLimits() as HistoricalLimitsResponse;
    console.log(`Total currencies: ${limits.total_currencies}`);
    
    // VAT rates
    const vatRates = await client.getVATRates() as VATRatesResponse;
    console.log(`Total countries with VAT: ${vatRates.total_countries}`);
    
    // Germany VAT
    const germanyVAT = await client.getVATRates('DE');
    console.log(`Germany VAT: ${(germanyVAT as any).vat_data.vat_rate}%`);
    
    console.log('\n=== Format Examples ===');
    
    // CSV format
    const csvData = await client.getRate('USD', 'EUR', 'csv') as string;
    console.log('CSV format:', csvData.substring(0, 50) + '...');
    
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.error('Invalid API key');
    } else if (error instanceof RateLimitError) {
      console.error('Rate limit exceeded');
    } else if (error instanceof UnirateError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

main();
```

## Error Handling

The client provides specific exception types for different error scenarios:

```typescript
import { 
  UnirateClient,
  UnirateError, 
  AuthenticationError, 
  RateLimitError, 
  InvalidCurrencyError, 
  InvalidDateError, 
  APIError
} from 'unirate-api';

const client = new UnirateClient('your-api-key');

try {
  const rate = await client.getRate('USD', 'INVALID');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof InvalidCurrencyError) {
    console.error('Invalid currency code');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
  } else if (error instanceof InvalidDateError) {
    console.error('Invalid date format');
  } else if (error instanceof APIError) {
    console.error(`API Error: ${error.message} (Status: ${error.statusCode})`);
  } else if (error instanceof UnirateError) {
    console.error(`General API Error: ${error.message}`);
  }
}
```

## Rate Limits

- **Currency endpoints**: Standard rate limits apply
- **Historical endpoints**: 50 requests per hour
- **VAT endpoints**: 1800 requests per hour

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

The API supports 170+ currencies including:
- **Traditional currencies**: USD, EUR, GBP, JPY, CAD, AUD, etc.
- **Cryptocurrencies**: BTC, ETH, LTC, and many more

Use `getSupportedCurrencies()` to get the complete list.

## Historical Data Coverage

Historical data is available from 1999 to 2025, with coverage varying by currency:
- **Major currencies**: Full coverage from 1999-01-01
- **Some currencies**: Limited historical data (use `getHistoricalLimits()` to check)

## Requirements

- Node.js 14+
- TypeScript 4+ (for TypeScript projects)

## Dependencies

- axios - for HTTP requests

## Changelog

### Version 1.0.0
- **NEW**: VAT rates endpoint (`getVATRates()`)
- **NEW**: Historical limits endpoint (`getHistoricalLimits()`)
- **NEW**: Multiple output formats (JSON, XML, CSV, TSV)
- **NEW**: JSONP callback support
- **BREAKING**: Updated method signatures with optional parameters and defaults
- **BREAKING**: `convert()` method parameter order changed (`toCurrency` first)
- **BREAKING**: Historical methods now require `date` as first parameter
- **IMPROVED**: Better error handling with specific exception types
- **IMPROVED**: Enhanced response parsing for new API structure
- **IMPROVED**: Full TypeScript interface definitions for all new features

## Related clients

- [unirate-api-python](https://github.com/UniRate-API/unirate-api-python) — Python (PyPI: `unirate-api`)
- [unirate-api-swift](https://github.com/UniRate-API/unirate-api-swift) — Swift (SPM)
- [unirate-api-java](https://github.com/UniRate-API/unirate-api-java) — Java (Maven)
- [unirate-api-go](https://github.com/UniRate-API/unirate-api-go) — Go
- [unirate-api-rust](https://github.com/UniRate-API/unirate-api-rust) — Rust (crates.io: `unirate-api`)
- [unirate-api-ruby](https://github.com/UniRate-API/unirate-api-ruby) — Ruby (gem: `unirate-api`)
- [unirate-api-php](https://github.com/UniRate-API/unirate-api-php) — PHP (Composer: `unirate-api/unirate-api`)
- [unirate-api-dotnet](https://github.com/UniRate-API/unirate-api-dotnet) — .NET / C# (NuGet: `UniRateApi`)

## License

MIT License 