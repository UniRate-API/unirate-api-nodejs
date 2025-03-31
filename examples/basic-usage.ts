import { UnirateClient } from '../src';

async function main() {
  // Initialize the client with your API key
  const client = new UnirateClient('your-api-key');

  try {
    // Get exchange rate
    const rate = await client.getRate('USD', 'EUR');
    console.log(`1 USD = ${rate} EUR`);

    // Convert amount
    const amount = await client.convert(100, 'USD', 'EUR');
    console.log(`100 USD = ${amount} EUR`);

    // Get supported currencies
    const currencies = await client.getSupportedCurrencies();
    console.log('Supported currencies:', currencies);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

main(); 