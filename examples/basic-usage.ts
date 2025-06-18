import { UnirateClient } from '../src/index';

async function main() {
  // Initialize the client with your API key
  const client = new UnirateClient('your-api-key-here');

  try {
    console.log('=== Basic Currency Operations ===');
    
    // Get current exchange rate
    const rate = await client.getRate('USD', 'EUR');
    console.log(`Current USD to EUR rate: ${rate}`);

    // Convert amount
    const converted = await client.convert(100, 'USD', 'EUR');
    console.log(`100 USD = ${converted} EUR`);

    // Get supported currencies
    const currencies = await client.getSupportedCurrencies();
    console.log(`Supported currencies: ${currencies.slice(0, 10).join(', ')}... (${currencies.length} total)`);

    console.log('\n=== Historical Data Operations ===');
    
    // Get historical rate for a specific date
    const historicalRate = await client.getHistoricalRate('USD', 'EUR', '2024-01-01');
    console.log(`USD to EUR rate on 2024-01-01: ${historicalRate}`);

    // Get all historical rates for a base currency on a specific date
    const historicalRates = await client.getHistoricalRates('USD', '2024-01-01');
    console.log(`USD rates on 2024-01-01:`);
    Object.entries(historicalRates).slice(0, 5).forEach(([currency, rate]) => {
      console.log(`  ${currency}: ${rate}`);
    });

    // Convert using historical rate
    const historicalConverted = await client.convertHistorical(100, 'USD', 'EUR', '2024-01-01');
    console.log(`100 USD = ${historicalConverted} EUR (on 2024-01-01)`);

    // Get time series data for a currency pair
    const timeSeries = await client.getTimeSeries('USD', 'EUR', '2024-01-01', '2024-01-07');
    console.log('USD to EUR time series (Jan 1-7, 2024):');
    Object.entries(timeSeries).forEach(([date, rate]) => {
      console.log(`  ${date}: ${rate}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 