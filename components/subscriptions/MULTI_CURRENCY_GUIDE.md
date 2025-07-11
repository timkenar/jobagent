# Multi-Currency Support Implementation Guide

## Overview

The subscription module now supports automatic currency detection based on user location, with USD as the base currency. This implementation provides a seamless experience for users worldwide while maintaining pricing consistency.

## Key Features

### 🌍 **Automatic Currency Detection**
- **IP-based detection**: Uses multiple IP geolocation services
- **Browser geolocation**: Leverages GPS/WiFi location data
- **Timezone analysis**: Infers location from browser timezone
- **Language/locale fallback**: Uses browser language preferences
- **Manual override**: Users can manually select their preferred currency

### 💱 **Multi-Currency Support**
- **12 supported currencies**: USD, EUR, GBP, NGN, CAD, AUD, ZAR, KES, GHS, INR, JPY, CNY
- **Real-time conversion**: Automatic conversion from USD base prices
- **Exchange rate updates**: Daily updates from external APIs
- **Localized formatting**: Proper currency symbols and formatting

### 🎯 **Smart Pricing**
- **USD base pricing**: All plans stored in USD for consistency
- **Dynamic conversion**: Real-time conversion to user's currency
- **Rate caching**: Exchange rates cached for 24 hours
- **Fallback handling**: Graceful fallback to USD if conversion fails

## Implementation Details

### Currency Detection Flow

```typescript
// 1. Check cached user preference
const cachedCurrency = localStorage.getItem('userCurrency');

// 2. Try IP-based detection
const ipCurrency = await detectCurrencyFromIP();

// 3. Try browser geolocation
const geoCurrency = await detectCurrencyFromGeolocation();

// 4. Try timezone analysis
const timezoneCurrency = detectCurrencyFromTimezone();

// 5. Try language/locale
const localeCurrency = detectCurrencyFromLocale();

// 6. Fallback to USD
const finalCurrency = cachedCurrency || ipCurrency || geoCurrency || timezoneCurrency || localeCurrency || 'USD';
```

### Currency Service Architecture

```typescript
class CurrencyService {
  // Detection methods
  async detectUserCurrency(): Promise<string>
  private async detectCurrencyFromIP(): Promise<string | null>
  private async detectCurrencyFromGeolocation(): Promise<string | null>
  private detectCurrencyFromTimezone(): string | null
  private detectCurrencyFromLocale(): string | null
  
  // Conversion methods
  convertFromUSD(usdAmount: number, targetCurrency: string): number
  convertToUSD(amount: number, fromCurrency: string): number
  formatCurrency(amount: number, currency: string): string
  
  // Exchange rate management
  async updateExchangeRates(): Promise<void>
  shouldUpdateRates(): boolean
  
  // Configuration
  getCurrencyInfo(currency: string): CurrencyInfo | null
  getSupportedCurrencies(): CurrencyInfo[]
}
```

## Supported Currencies

| Currency | Code | Symbol | Region | Rate (vs USD) |
|----------|------|--------|--------|---------------|
| US Dollar | USD | $ | United States | 1.00 |
| Euro | EUR | € | Europe | 0.85 |
| British Pound | GBP | £ | United Kingdom | 0.73 |
| Nigerian Naira | NGN | ₦ | Nigeria | 750.00 |
| Canadian Dollar | CAD | C$ | Canada | 1.25 |
| Australian Dollar | AUD | A$ | Australia | 1.35 |
| South African Rand | ZAR | R | South Africa | 18.50 |
| Kenyan Shilling | KES | KSh | Kenya | 130.00 |
| Ghana Cedi | GHS | ₵ | Ghana | 12.00 |
| Indian Rupee | INR | ₹ | India | 83.00 |
| Japanese Yen | JPY | ¥ | Japan | 110.00 |
| Chinese Yuan | CNY | ¥ | China | 7.20 |

## Usage Examples

### Basic Usage

```typescript
import { useSubscription } from './components/subscriptions/context/SubscriptionContext';

function PricingComponent() {
  const { formatCurrency, userCurrency, convertFromUSD } = useSubscription();
  
  const basePriceUSD = 29.99;
  const localizedPrice = convertFromUSD(basePriceUSD);
  
  return (
    <div>
      <span className="price">
        {formatCurrency(localizedPrice, userCurrency)}
      </span>
      <span className="base-price">
        (${basePriceUSD} USD)
      </span>
    </div>
  );
}
```

### Currency Selector

```typescript
import CurrencySelector from './components/subscriptions/components/CurrencySelector';

function SettingsPage() {
  return (
    <div>
      <h3>Currency Preferences</h3>
      <CurrencySelector />
    </div>
  );
}
```

### Manual Currency Detection

```typescript
import { useSubscription } from './components/subscriptions/context/SubscriptionContext';

function App() {
  const { detectUserCurrency } = useSubscription();
  
  useEffect(() => {
    const initializeCurrency = async () => {
      const detectedCurrency = await detectUserCurrency();
      console.log('Detected currency:', detectedCurrency);
    };
    
    initializeCurrency();
  }, []);
}
```

## Backend Integration

### Expected API Changes

The backend should support the following currency-related parameters:

#### Plan Endpoints
```typescript
// GET /api/subscriptions/plans/?currency=USD
// Response should include localized pricing
{
  "id": "plan-1",
  "name": "Basic Plan",
  "price": 29.99,
  "currency": "USD",
  "base_price_usd": 29.99,
  "localized_price": 29.99,
  "localized_currency": "USD"
}
```

#### Payment Initialization
```typescript
// POST /api/subscriptions/payments/initialize/
{
  "plan_id": "plan-1",
  "currency": "USD",
  "country": "US",
  "callback_url": "https://domain.com/callback"
}
```

#### Exchange Rates Endpoint
```typescript
// GET /api/subscriptions/exchange-rates/
{
  "base": "USD",
  "rates": {
    "EUR": 0.85,
    "GBP": 0.73,
    "NGN": 750.00,
    // ... other rates
  },
  "last_updated": "2024-01-01T00:00:00Z"
}
```

### Database Schema Updates

```sql
-- Add currency fields to subscription plans
ALTER TABLE subscription_plans ADD COLUMN base_price_usd DECIMAL(10,2);
ALTER TABLE subscription_plans ADD COLUMN supported_currencies TEXT[];

-- Add currency to payments
ALTER TABLE payments ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE payments ADD COLUMN exchange_rate DECIMAL(10,6);

-- Create exchange rates table
CREATE TABLE exchange_rates (
  currency VARCHAR(3) PRIMARY KEY,
  rate DECIMAL(10,6) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Configuration

### Environment Variables

```env
# Frontend (.env)
VITE_CURRENCY_API_URL=https://api.exchangerate-api.com/v4/latest/USD
VITE_IP_GEOLOCATION_API_URL=https://ipapi.co/json/
VITE_DEFAULT_CURRENCY=USD
VITE_ENABLE_CURRENCY_DETECTION=true

# Backend (.env)
CURRENCY_API_KEY=your_currency_api_key
DEFAULT_CURRENCY=USD
EXCHANGE_RATE_UPDATE_INTERVAL=86400  # 24 hours in seconds
```

### Paystack Configuration

For Paystack integration, ensure the following currencies are enabled:
- **USD**: Primary currency for international users
- **NGN**: Nigerian Naira for African users
- **GHS**: Ghana Cedi for West African users
- **ZAR**: South African Rand for Southern African users
- **KES**: Kenyan Shilling for East African users

## Testing

### Test Currency Detection

```typescript
// Test IP-based detection
const mockIPResponse = {
  country_code: 'US',
  currency: 'USD',
  country_name: 'United States'
};

// Test timezone detection
const mockTimezone = 'America/New_York'; // Should return USD
const mockTimezone2 = 'Africa/Lagos'; // Should return NGN

// Test locale detection
const mockLocale = 'en-US'; // Should return USD
const mockLocale2 = 'en-NG'; // Should return NGN
```

### Test Currency Conversion

```typescript
// Test conversion accuracy
const usdAmount = 100;
const expectedNGN = 75000; // Based on rate of 750
const convertedAmount = currencyService.convertFromUSD(usdAmount, 'NGN');
expect(convertedAmount).toBe(expectedNGN);

// Test formatting
const formatted = currencyService.formatCurrency(75000, 'NGN');
expect(formatted).toBe('₦75,000');
```

## Performance Considerations

### Caching Strategy
- **Exchange rates**: Cached for 24 hours
- **User location**: Cached in localStorage
- **User currency preference**: Persisted in localStorage
- **API responses**: Cached for 5 minutes

### Fallback Mechanisms
- **Network failures**: Use cached exchange rates
- **API failures**: Fallback to hardcoded rates
- **Detection failures**: Default to USD
- **Conversion errors**: Display original USD price

## Security Considerations

### Data Protection
- **No sensitive data**: Only currency and country codes stored
- **API key security**: Exchange rate API keys stored server-side
- **Rate limiting**: Prevent abuse of detection APIs
- **Input validation**: Validate all currency codes

### Privacy
- **Optional location**: Geolocation requires user consent
- **Local storage**: User preferences stored locally
- **No tracking**: No personal data sent to external APIs
- **Anonymous**: IP-based detection is anonymous

## Troubleshooting

### Common Issues

1. **Currency not detected**
   - Check network connectivity
   - Verify API endpoints are accessible
   - Check browser permissions for geolocation

2. **Incorrect exchange rates**
   - Verify API response format
   - Check rate update timestamp
   - Validate currency codes

3. **Payment failures**
   - Ensure currency is supported by payment provider
   - Check minimum/maximum payment amounts
   - Verify country restrictions

4. **Formatting issues**
   - Check browser locale support
   - Verify currency symbols are displayed correctly
   - Test with different number formats

### Debug Mode

Enable debug logging:

```typescript
// In currency service
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Currency detection results:', {
    ip: ipCurrency,
    geo: geoCurrency,
    timezone: timezoneCurrency,
    locale: localeCurrency,
    final: finalCurrency
  });
}
```

## Future Enhancements

### Planned Features
- **More currencies**: Add support for additional regional currencies
- **Smart pricing**: Dynamic pricing based on purchasing power parity
- **Currency trends**: Historical exchange rate tracking
- **Regional offers**: Location-based promotions and discounts
- **Tax calculation**: Automatic tax calculation based on location

### API Improvements
- **GraphQL support**: More flexible currency queries
- **Bulk operations**: Batch currency conversions
- **Real-time updates**: WebSocket-based rate updates
- **Analytics**: Currency preference analytics

## Support

For implementation support:
1. Check the troubleshooting guide above
2. Review the test cases in `/tests/currency/`
3. Verify API connectivity and responses
4. Test with different browsers and locations

---

**Implementation Status**: ✅ **COMPLETE**
**Currency Detection**: ✅ **ACTIVE**
**Real-time Conversion**: ✅ **WORKING**
**User Override**: ✅ **AVAILABLE**