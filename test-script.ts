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
    console.log('Supported currencies:', currencies);
    console.log('✓ Test 1 passed\n');

    // Test 2: Get exchange rate
    console.log('Test 2: Getting exchange rate...');
    const rate = await client.getRate('USD', 'EUR');
    console.log(`USD to EUR rate: ${rate}`);
    console.log('✓ Test 2 passed\n');

    // Test 3: Convert amount
    console.log('Test 3: Converting amount...');
    const amount = await client.convert(100, 'USD', 'EUR');
    console.log(`100 USD = ${amount} EUR`);
    console.log('✓ Test 3 passed\n');

    console.log('All tests passed successfully! 🎉');
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