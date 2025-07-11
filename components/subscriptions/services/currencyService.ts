// Currency detection and conversion service
interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Rate relative to USD
  locale: string;
}

interface LocationData {
  country: string;
  countryCode: string;
  currency: string;
  timezone: string;
}

export class CurrencyService {
  private static instance: CurrencyService;
  private locationData: LocationData | null = null;
  private exchangeRates: Record<string, number> = {};
  private supportedCurrencies: Record<string, CurrencyInfo> = {
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1, locale: 'en-US' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.85, locale: 'en-GB' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.73, locale: 'en-GB' },
    NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 750, locale: 'en-NG' },
    CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.25, locale: 'en-CA' },
    AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.35, locale: 'en-AU' },
    ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 18.5, locale: 'en-ZA' },
    KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rate: 130, locale: 'en-KE' },
    GHS: { code: 'GHS', symbol: '₵', name: 'Ghana Cedi', rate: 12, locale: 'en-GH' },
    INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83, locale: 'en-IN' },
    JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 110, locale: 'ja-JP' },
    CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.2, locale: 'zh-CN' },
  };

  private countryToCurrency: Record<string, string> = {
    'US': 'USD', 'USA': 'USD', 'UNITED STATES': 'USD',
    'GB': 'GBP', 'UK': 'GBP', 'UNITED KINGDOM': 'GBP',
    'NG': 'NGN', 'NIGERIA': 'NGN',
    'CA': 'CAD', 'CANADA': 'CAD',
    'AU': 'AUD', 'AUSTRALIA': 'AUD',
    'ZA': 'ZAR', 'SOUTH AFRICA': 'ZAR',
    'KE': 'KES', 'KENYA': 'KES',
    'GH': 'GHS', 'GHANA': 'GHS',
    'IN': 'INR', 'INDIA': 'INR',
    'JP': 'JPY', 'JAPAN': 'JPY',
    'CN': 'CNY', 'CHINA': 'CNY',
    'DE': 'EUR', 'GERMANY': 'EUR',
    'FR': 'EUR', 'FRANCE': 'EUR',
    'IT': 'EUR', 'ITALY': 'EUR',
    'ES': 'EUR', 'SPAIN': 'EUR',
    'NL': 'EUR', 'NETHERLANDS': 'EUR',
    'AT': 'EUR', 'AUSTRIA': 'EUR',
    'BE': 'EUR', 'BELGIUM': 'EUR',
    'FI': 'EUR', 'FINLAND': 'EUR',
    'IE': 'EUR', 'IRELAND': 'EUR',
    'PT': 'EUR', 'PORTUGAL': 'EUR',
    'GR': 'EUR', 'GREECE': 'EUR',
  };

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  // Get user's location and detect currency
  async detectUserCurrency(): Promise<string> {
    try {
      // Try to get cached location first
      const cachedLocation = localStorage.getItem('userLocation');
      if (cachedLocation) {
        this.locationData = JSON.parse(cachedLocation);
        return this.getCurrencyFromLocation(this.locationData);
      }

      // Try multiple location detection methods
      const currency = await this.detectCurrencyFromMultipleSources();
      
      // Cache the result
      if (this.locationData) {
        localStorage.setItem('userLocation', JSON.stringify(this.locationData));
      }
      
      return currency;
    } catch (error) {
      console.warn('Currency detection failed, using USD as fallback:', error);
      return 'USD';
    }
  }

  private async detectCurrencyFromMultipleSources(): Promise<string> {
    // Method 1: Try IP-based location detection
    try {
      const ipCurrency = await this.detectCurrencyFromIP();
      if (ipCurrency) return ipCurrency;
    } catch (error) {
      console.warn('IP-based detection failed:', error);
    }

    // Method 2: Try browser geolocation
    try {
      const geoCurrency = await this.detectCurrencyFromGeolocation();
      if (geoCurrency) return geoCurrency;
    } catch (error) {
      console.warn('Geolocation detection failed:', error);
    }

    // Method 3: Try timezone-based detection
    try {
      const timezoneCurrency = this.detectCurrencyFromTimezone();
      if (timezoneCurrency) return timezoneCurrency;
    } catch (error) {
      console.warn('Timezone detection failed:', error);
    }

    // Method 4: Try browser language/locale
    try {
      const localeCurrency = this.detectCurrencyFromLocale();
      if (localeCurrency) return localeCurrency;
    } catch (error) {
      console.warn('Locale detection failed:', error);
    }

    // Fallback to USD
    return 'USD';
  }

  private async detectCurrencyFromIP(): Promise<string | null> {
    try {
      // Try multiple IP geolocation services
      const services = [
        'https://ipapi.co/json/',
        'https://freegeoip.app/json/',
        'https://ipwhois.app/json/',
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          const data = await response.json();
          
          let countryCode = '';
          let country = '';
          
          // Different services have different response formats
          if (data.country_code) {
            countryCode = data.country_code.toUpperCase();
            country = data.country || data.country_name || '';
          } else if (data.country) {
            countryCode = data.country.toUpperCase();
            country = data.country_name || data.country || '';
          }

          if (countryCode) {
            this.locationData = {
              country: country,
              countryCode: countryCode,
              currency: this.countryToCurrency[countryCode] || 'USD',
              timezone: data.timezone || ''
            };
            
            return this.locationData.currency;
          }
        } catch (serviceError) {
          console.warn(`Service ${service} failed:`, serviceError);
          continue;
        }
      }
    } catch (error) {
      console.warn('IP detection failed:', error);
    }
    
    return null;
  }

  private async detectCurrencyFromGeolocation(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Use reverse geocoding to get country
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            if (data.countryCode) {
              const countryCode = data.countryCode.toUpperCase();
              const currency = this.countryToCurrency[countryCode] || 'USD';
              
              this.locationData = {
                country: data.countryName || '',
                countryCode: countryCode,
                currency: currency,
                timezone: ''
              };
              
              resolve(currency);
            } else {
              resolve(null);
            }
          } catch (error) {
            console.warn('Reverse geocoding failed:', error);
            resolve(null);
          }
        },
        (error) => {
          console.warn('Geolocation failed:', error);
          resolve(null);
        },
        { timeout: 10000 }
      );
    });
  }

  private detectCurrencyFromTimezone(): string | null {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Map common timezones to countries/currencies
      const timezoneMap: Record<string, string> = {
        'America/New_York': 'USD',
        'America/Los_Angeles': 'USD',
        'America/Chicago': 'USD',
        'America/Denver': 'USD',
        'America/Toronto': 'CAD',
        'America/Vancouver': 'CAD',
        'Europe/London': 'GBP',
        'Europe/Paris': 'EUR',
        'Europe/Berlin': 'EUR',
        'Europe/Rome': 'EUR',
        'Europe/Madrid': 'EUR',
        'Europe/Amsterdam': 'EUR',
        'Africa/Lagos': 'NGN',
        'Africa/Johannesburg': 'ZAR',
        'Africa/Nairobi': 'KES',
        'Africa/Accra': 'GHS',
        'Asia/Tokyo': 'JPY',
        'Asia/Shanghai': 'CNY',
        'Asia/Hong_Kong': 'USD',
        'Asia/Singapore': 'USD',
        'Asia/Kolkata': 'INR',
        'Australia/Sydney': 'AUD',
        'Australia/Melbourne': 'AUD',
      };

      return timezoneMap[timezone] || null;
    } catch (error) {
      console.warn('Timezone detection failed:', error);
      return null;
    }
  }

  private detectCurrencyFromLocale(): string | null {
    try {
      const locale = navigator.language || navigator.languages?.[0];
      if (!locale) return null;

      // Map common locales to currencies
      const localeMap: Record<string, string> = {
        'en-US': 'USD',
        'en-CA': 'CAD',
        'en-GB': 'GBP',
        'en-AU': 'AUD',
        'en-ZA': 'ZAR',
        'en-NG': 'NGN',
        'en-KE': 'KES',
        'en-GH': 'GHS',
        'en-IN': 'INR',
        'fr-CA': 'CAD',
        'fr-FR': 'EUR',
        'de-DE': 'EUR',
        'es-ES': 'EUR',
        'it-IT': 'EUR',
        'ja-JP': 'JPY',
        'zh-CN': 'CNY',
        'hi-IN': 'INR',
      };

      return localeMap[locale] || localeMap[locale.split('-')[0]] || null;
    } catch (error) {
      console.warn('Locale detection failed:', error);
      return null;
    }
  }

  private getCurrencyFromLocation(location: LocationData): string {
    return this.countryToCurrency[location.countryCode] || 'USD';
  }

  // Convert amount from USD to target currency
  convertFromUSD(usdAmount: number, targetCurrency: string): number {
    const currencyInfo = this.supportedCurrencies[targetCurrency];
    if (!currencyInfo) return usdAmount;
    
    return Math.round(usdAmount * currencyInfo.rate);
  }

  // Convert amount from any currency to USD
  convertToUSD(amount: number, fromCurrency: string): number {
    const currencyInfo = this.supportedCurrencies[fromCurrency];
    if (!currencyInfo) return amount;
    
    return Math.round(amount / currencyInfo.rate);
  }

  // Format currency amount
  formatCurrency(amount: number, currency: string = 'USD'): string {
    const currencyInfo = this.supportedCurrencies[currency];
    if (!currencyInfo) return `$${amount.toLocaleString()}`;

    try {
      return new Intl.NumberFormat(currencyInfo.locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      return `${currencyInfo.symbol}${amount.toLocaleString()}`;
    }
  }

  // Get currency info
  getCurrencyInfo(currency: string): CurrencyInfo | null {
    return this.supportedCurrencies[currency] || null;
  }

  // Get all supported currencies
  getSupportedCurrencies(): CurrencyInfo[] {
    return Object.values(this.supportedCurrencies);
  }

  // Get user's detected location
  getLocationData(): LocationData | null {
    return this.locationData;
  }

  // Manually set currency (for user preference)
  setUserCurrency(currency: string): void {
    if (this.supportedCurrencies[currency]) {
      localStorage.setItem('userCurrency', currency);
    }
  }

  // Get user's preferred currency
  getUserCurrency(): string {
    return localStorage.getItem('userCurrency') || 'USD';
  }

  // Update exchange rates from API
  async updateExchangeRates(): Promise<void> {
    try {
      // Use a free exchange rate API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      if (data.rates) {
        Object.keys(this.supportedCurrencies).forEach(currency => {
          if (data.rates[currency]) {
            this.supportedCurrencies[currency].rate = data.rates[currency];
          }
        });
        
        // Cache the rates
        localStorage.setItem('exchangeRates', JSON.stringify(data.rates));
        localStorage.setItem('exchangeRatesUpdated', Date.now().toString());
      }
    } catch (error) {
      console.warn('Failed to update exchange rates:', error);
      // Try to use cached rates
      const cachedRates = localStorage.getItem('exchangeRates');
      if (cachedRates) {
        const rates = JSON.parse(cachedRates);
        Object.keys(this.supportedCurrencies).forEach(currency => {
          if (rates[currency]) {
            this.supportedCurrencies[currency].rate = rates[currency];
          }
        });
      }
    }
  }

  // Check if exchange rates need updating
  shouldUpdateRates(): boolean {
    const lastUpdate = localStorage.getItem('exchangeRatesUpdated');
    if (!lastUpdate) return true;
    
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return parseInt(lastUpdate) < oneDayAgo;
  }

  // Initialize the service
  async initialize(): Promise<void> {
    try {
      // Update exchange rates if needed
      if (this.shouldUpdateRates()) {
        await this.updateExchangeRates();
      }

      // Detect user currency
      await this.detectUserCurrency();
    } catch (error) {
      console.warn('Currency service initialization failed:', error);
    }
  }
}

export const currencyService = CurrencyService.getInstance();
export default currencyService;