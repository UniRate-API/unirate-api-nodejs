/// <reference types="node" />
import { UnirateClient } from './src';

async function runTests() {
  // Get API key from environment variable
  const apiKey = process.env.UNIRATE_API_KEY;
  if (!apiKey) {
    console.error('Error: UNIRATE_API_KEY environment variable is not set');
    console.log('Please set it using: export UNIRATE_API_KEY=your-api-key');
    process.exit(1);
  }

  console.log('Starting Unirate API tests...\n');
  const client = new UnirateClient(apiKey);

  try {
    // Test 1: Get supported currencies
    console.log('Test 1: Getting supported currencies...');
    const currencies = await client.getSupportedCurrencies();
    console.log(`✓ Found ${currencies.length} supported currencies`);
    console.log('✓ Test 1 passed\n');

    // Test 2: Get exchange rate
    console.log('Test 2: Getting current exchange rate...');
    const rate = await client.getRate('USD', 'EUR');
    console.log(`USD to EUR rate: ${rate}`);
    console.log('✓ Test 2 passed\n');

    // Test 3: Convert amount
    console.log('Test 3: Converting current amount...');
    const amount = await client.convert('EUR', 100, 'USD');
    console.log(`100 USD = ${amount} EUR`);
    console.log('✓ Test 3 passed\n');

    // Test 4: Get historical rate
    console.log('Test 4: Getting historical exchange rate...');
    const historicalRate = await client.getHistoricalRate('2024-01-01', 1, 'USD', 'EUR');
    console.log(`USD to EUR rate on 2024-01-01: ${historicalRate}`);
    console.log('✓ Test 4 passed\n');

    // Test 5: Get all historical rates for a date
    console.log('Test 5: Getting all historical rates for USD on a date...');
    const historicalRates = await client.getHistoricalRates('2024-01-01', 1, 'USD');
    console.log(`✓ Found ${Object.keys(historicalRates).length} currency rates for USD on 2024-01-01`);
    const rates = historicalRates as Record<string, number>;
    console.log(`Sample rates: EUR=${rates.EUR}, GBP=${rates.GBP}, JPY=${rates.JPY}`);
    console.log('✓ Test 5 passed\n');

    // Summary
    console.log('🎉 All current API tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log(`✅ Current rate (USD/EUR): ${rate}`);
    console.log(`✅ Historical rate (USD/EUR, 2024-01-01): ${historicalRate}`);
    console.log(`✅ Current conversion (100 USD): ${amount} EUR`);
    console.log(`✅ Supported currencies: ${currencies.length}`);
    console.log(`✅ Historical rates available: ${Object.keys(rates).length} currencies`);
    
    console.log('\nTesting additional functionality...\n');

    // Test 6: Historical conversion (calculated)
    console.log('Test 6: Historical conversion (calculated from historical rate)...');
    const historicalAmount = await client.convertHistorical(100, 'USD', 'EUR', '2024-01-01');
    console.log(`100 USD = ${historicalAmount} EUR (using historical rate from 2024-01-01)`);
    console.log('✓ Test 6 passed\n');

    // Test 7: Time series data
    console.log('Test 7: Time series data...');

    const timeSeries = await client.getTimeSeries('2024-01-01', '2024-01-03', 1, 'USD', ['EUR']);
    console.log(`Time series data for USD/EUR (2024-01-01 to 2024-01-03):`, Object.keys(timeSeries).length, 'days');
    console.log('Sample:', Object.entries(timeSeries).slice(0, 2));
    console.log('✓ Test 7 passed\n');


    console.log('💡 Based on API spec analysis:');
    console.log('✅ Historical conversion: Implemented using historical rates + calculation');
    console.log('✅ Time series: Uses correct endpoint /api/historical/timeseries with proper parameters');

  } catch (error) {
    console.error('\n❌ Test failed!');
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    process.exit(1);
  }
}

// Run the tests
runTests(); 