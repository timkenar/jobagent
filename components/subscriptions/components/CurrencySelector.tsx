import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

interface CurrencySelectorProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  className = '',
  showLabel = true,
  compact = false
}) => {
  const { 
    userCurrency, 
    supportedCurrencies, 
    setUserCurrency, 
    locationData 
  } = useSubscription();
  
  const [isOpen, setIsOpen] = useState(false);

  const currentCurrency = supportedCurrencies.find(c => c.code === userCurrency);

  const handleCurrencyChange = (currencyCode: string) => {
    setUserCurrency(currencyCode);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>{userCurrency}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
            <div className="p-2 max-h-60 overflow-y-auto">
              {supportedCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    currency.code === userCurrency
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{currency.symbol}</span>
                      <span>{currency.code}</span>
                    </div>
                    {currency.code === userCurrency && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="mb-2">
        {showLabel && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
        )}
        {locationData && (
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <Globe className="w-3 h-3 mr-1" />
            <span>Detected location: {locationData.country}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Globe className="w-5 h-5 text-gray-400" />
          <div className="text-left">
            <div className="font-medium text-gray-900">
              {currentCurrency?.symbol} {currentCurrency?.code}
            </div>
            <div className="text-sm text-gray-500">
              {currentCurrency?.name}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2 max-h-60 overflow-y-auto">
            {supportedCurrencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency.code)}
                className={`w-full text-left px-3 py-3 rounded-md transition-colors ${
                  currency.code === userCurrency
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium">{currency.symbol}</span>
                    <div>
                      <div className="font-medium">{currency.code}</div>
                      <div className="text-sm text-gray-500">{currency.name}</div>
                    </div>
                  </div>
                  {currency.code === userCurrency && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;