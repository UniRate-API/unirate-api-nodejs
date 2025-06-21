import { UnirateClient } from '../src/index';

async function main() {
  // Initialize the client with your API key
  const client = new UnirateClient('your-api-key-here');

  try {
    console.log('=== Basic Currency Operations ===');
    
    // Get current exchange rate
    const rate = await client.getRate('USD', 'EUR');
    console.log(`Current USD to EUR rate: ${rate}`);
    
    // Get all rates for a base currency
    const allRates = await client.getRate('USD') as Record<string, number>;
    const sampleRates = Object.entries(allRates).slice(0, 5);
    console.log('USD rates for all currencies (showing first 5):');
    sampleRates.forEach(([currency, rate]) => {
      console.log(`  ${currency}: ${rate}`);
    });

    // Convert amount (note: toCurrency is now first parameter)
    const converted = await client.convert('EUR', 100, 'USD');
    console.log(`100 USD = ${converted} EUR`);

    // Get supported currencies
    const currencies = await client.getSupportedCurrencies() as string[];
    console.log(`Supported currencies: ${currencies.slice(0, 10).join(', ')}... (${currencies.length} total)`);

    console.log('\n=== Historical Data Operations ===');
    
    // Get historical rate for a specific date
    const historicalRate = await client.getHistoricalRate('2024-01-01', 1, 'USD', 'EUR');
    console.log(`USD to EUR rate on 2024-01-01: ${historicalRate}`);

    // Get all historical rates for a base currency on a specific date
    const historicalRates = await client.getHistoricalRates('2024-01-01', 1, 'USD') as Record<string, number>;
    console.log('USD rates on 2024-01-01 (showing first 5):');
    Object.entries(historicalRates).slice(0, 5).forEach(([currency, rate]) => {
      console.log(`  ${currency}: ${rate}`);
    });

    // Convert using historical rate
    const historicalConverted = await client.convertHistorical(100, 'USD', 'EUR', '2024-01-01');
    console.log(`100 USD = ${historicalConverted} EUR (on 2024-01-01)`);

    // Get time series data for multiple currencies
    const timeSeries = await client.getTimeSeries(
      '2024-01-01', '2024-01-07',
      1,
      'USD',
      ['EUR', 'GBP']
    ) as Record<string, Record<string, number>>;
    console.log('USD time series (Jan 1-7, 2024):');
    Object.entries(timeSeries).slice(0, 3).forEach(([date, rates]) => {
      console.log(`  ${date}: EUR=${rates.EUR || 'N/A'}, GBP=${rates.GBP || 'N/A'}`);
    });

    console.log('\n=== New Features ===');
    
    // Get historical data limits
    const limits = await client.getHistoricalLimits();
    if (typeof limits === 'object') {
      console.log('Historical data limits:');
      console.log(`  Total currencies: ${limits.total_currencies || 'N/A'}`);
      if (limits.currencies) {
        const sampleCurrencies = Object.entries(limits.currencies).slice(0, 3);
        sampleCurrencies.forEach(([currency, info]) => {
          console.log(`  ${currency}: ${info.earliest_date || 'N/A'} to ${info.latest_date || 'N/A'}`);
        });
      }
    }

    // Get VAT rates for all countries
    const vatRates = await client.getVATRates();
    if (typeof vatRates === 'object' && 'total_countries' in vatRates) {
      console.log(`VAT rates for all countries (total: ${vatRates.total_countries || 'N/A'}):`);
      if (vatRates.vat_rates) {
        const sampleCountries = Object.entries(vatRates.vat_rates).slice(0, 5);
        sampleCountries.forEach(([country, info]) => {
          console.log(`  ${info.country_name || country}: ${info.vat_rate || 'N/A'}%`);
        });
      }
    }

    // Get VAT rate for a specific country
    const germanyVAT = await client.getVATRates('DE');
    if (typeof germanyVAT === 'object' && 'vat_data' in germanyVAT) {
      const vatInfo = germanyVAT.vat_data;
      console.log(`Germany VAT rate: ${vatInfo.vat_rate || 'N/A'}%`);
    }

    console.log('\n=== Format Examples ===');
    
    // Get rates in CSV format
    const csvRates = await client.getRate('USD', 'EUR', 'csv') as string;
    console.log('CSV format example:');
    console.log(csvRates.length > 100 ? csvRates.substring(0, 100) + '...' : csvRates);
    
    // Get currencies in XML format
    const xmlCurrencies = await client.getSupportedCurrencies('xml') as string;
    console.log('XML format example:');
    console.log(xmlCurrencies.length > 100 ? xmlCurrencies.substring(0, 100) + '...' : xmlCurrencies);

  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 