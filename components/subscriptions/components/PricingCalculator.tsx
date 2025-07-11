import React, { useState, useEffect } from 'react';
import { Calculator, RefreshCw, TrendingUp, TrendingDown, DollarSign, Globe, Zap } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { pricingCalculator } from '../services/pricingCalculator';
import CurrencySelector from './CurrencySelector';
import type { SubscriptionTier } from '../services/pricingCalculator';

interface PricingCalculatorProps {
  className?: string;
  showComparison?: boolean;
  defaultTier?: string;
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  className = '',
  showComparison = true,
  defaultTier = 'professional'
}) => {
  const { userCurrency, formatCurrency, locationData } = useSubscription();
  const [selectedTier, setSelectedTier] = useState(defaultTier);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedCurrencies, setSelectedCurrencies] = useState(['USD', 'EUR', 'GBP', 'NGN']);
  const [loading, setLoading] = useState(false);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    setLoading(true);
    try {
      await pricingCalculator.loadCustomTiers();
      setTiers(pricingCalculator.getAllTiers());
    } catch (error) {
      console.error('Failed to load tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedTierData = tiers.find(t => t.id === selectedTier);
  const pricingComparison = selectedTierData 
    ? pricingCalculator.getPricingComparison(selectedTier, selectedCurrencies, billingCycle)
    : [];

  const annualSavings = selectedTierData 
    ? pricingCalculator.calculateAnnualSavings(selectedTier, userCurrency)
    : null;

  const featureComparison = pricingCalculator.getFeatureComparison();

  const handleCurrencyToggle = (currency: string) => {
    setSelectedCurrencies(prev => 
      prev.includes(currency) 
        ? prev.filter(c => c !== currency)
        : [...prev, currency]
    );
  };

  const getPopularCurrencies = () => [
    'USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD', 'INR', 'JPY'
  ];

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span>Loading pricing data...</span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calculator className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Pricing Calculator</h2>
          </div>
          <button
            onClick={loadTiers}
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
        <p className="text-gray-600 text-sm mt-1">
          Compare subscription pricing across different currencies and billing cycles
        </p>
      </div>

      <div className="p-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tier Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subscription Tier
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tiers.map(tier => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} {tier.isPopular ? '(Popular)' : ''} {tier.isEnterprise ? '(Enterprise)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Billing Cycle
            </label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                {selectedTierData?.yearlyDiscount && (
                  <span className="ml-1 text-xs text-green-600">
                    -{selectedTierData.yearlyDiscount}%
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Base Currency Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Currency
            </label>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <Globe className="w-4 h-4 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">{userCurrency}</span>
              {locationData && (
                <span className="text-blue-600 text-sm ml-1">({locationData.country})</span>
              )}
            </div>
          </div>
        </div>

        {/* Selected Tier Summary */}
        {selectedTierData && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedTierData.name} Plan
                  {selectedTierData.isPopular && (
                    <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 mb-4">{selectedTierData.description}</p>
                
                {/* Key Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedTierData.features.job_applications}
                    </div>
                    <div className="text-xs text-gray-600">Job Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedTierData.features.cv_uploads}
                    </div>
                    <div className="text-xs text-gray-600">CV Uploads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedTierData.features.email_accounts}
                    </div>
                    <div className="text-xs text-gray-600">Email Accounts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedTierData.features.ai_requests}
                    </div>
                    <div className="text-xs text-gray-600">AI Requests</div>
                  </div>
                </div>
              </div>

              {/* Current Price */}
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(
                    pricingCalculator.convertTierToCurrency(selectedTierData, userCurrency, billingCycle).price,
                    userCurrency
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  per {billingCycle === 'yearly' ? 'year' : 'month'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Annual Savings */}
        {billingCycle === 'yearly' && annualSavings && annualSavings.savings > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <TrendingDown className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <div className="font-medium text-green-900">
                  Save {annualSavings.formatted.savings} ({annualSavings.savingsPercentage}%) with yearly billing
                </div>
                <div className="text-sm text-green-700">
                  Monthly: {annualSavings.formatted.monthlyTotal} • Yearly: {annualSavings.formatted.yearlyPrice}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Currency Comparison */}
        {showComparison && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Multi-Currency Pricing</h3>
              <div className="text-sm text-gray-500">
                Select currencies to compare
              </div>
            </div>

            {/* Currency Selection */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {getPopularCurrencies().map(currency => (
                  <button
                    key={currency}
                    onClick={() => handleCurrencyToggle(currency)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      selectedCurrencies.includes(currency)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {currency}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pricingComparison.map(({ currency, price, formatted, savings }) => (
                <div
                  key={currency}
                  className={`p-4 rounded-lg border ${
                    currency === userCurrency
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{currency}</span>
                    {currency === userCurrency && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Your Currency
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatted}
                  </div>
                  <div className="text-xs text-gray-500">
                    per {billingCycle === 'yearly' ? 'year' : 'month'}
                  </div>
                  {savings && (
                    <div className="text-xs text-green-600 mt-1">
                      {savings}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Comparison Table */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Comparison</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Feature
                  </th>
                  {tiers.map(tier => (
                    <th
                      key={tier.id}
                      className={`px-4 py-3 text-center text-xs font-medium uppercase ${
                        tier.id === selectedTier
                          ? 'text-blue-700 bg-blue-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {featureComparison.map(({ feature, label, tiers: tierValues }) => (
                  <tr key={feature}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {label}
                    </td>
                    {tiers.map(tier => (
                      <td
                        key={tier.id}
                        className={`px-4 py-3 text-center text-sm ${
                          tier.id === selectedTier
                            ? 'bg-blue-50 text-blue-900'
                            : 'text-gray-900'
                        }`}
                      >
                        {tierValues[tier.id] === '✓' ? (
                          <span className="text-green-600">✓</span>
                        ) : tierValues[tier.id] === '✗' ? (
                          <span className="text-gray-300">✗</span>
                        ) : (
                          tierValues[tier.id]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;