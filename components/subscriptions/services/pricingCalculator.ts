// Centralized Pricing Calculator
// Define subscription tiers once, calculate pricing in any currency

import { currencyService } from './currencyService';
import type { SubscriptionPlan, CurrencyInfo } from '../types';

// Base subscription tier definitions (prices in USD)
export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  basePrice: {
    monthly: number;
    yearly: number;
    quarterly?: number;
  };
  features: {
    job_applications: number;
    cv_uploads: number;
    email_accounts: number;
    ai_requests: number;
    priority_support: boolean;
    advanced_analytics: boolean;
    custom_templates: boolean;
    api_access?: boolean;
    white_label?: boolean;
  };
  isPopular?: boolean;
  isEnterprise?: boolean;
  yearlyDiscount?: number; // Percentage discount for yearly billing
}

// Define all subscription tiers once in USD
export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started with job searching',
    basePrice: {
      monthly: 0,
      yearly: 0
    },
    features: {
      job_applications: 10,
      cv_uploads: 1,
      email_accounts: 1,
      ai_requests: 20,
      priority_support: false,
      advanced_analytics: false,
      custom_templates: false
    }
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Ideal for active job seekers',
    basePrice: {
      monthly: 9.99,
      yearly: 99.99
    },
    features: {
      job_applications: 50,
      cv_uploads: 3,
      email_accounts: 2,
      ai_requests: 100,
      priority_support: false,
      advanced_analytics: false,
      custom_templates: true
    },
    yearlyDiscount: 17 // ~17% discount for yearly
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For serious professionals and career changers',
    basePrice: {
      monthly: 29.99,
      yearly: 299.99
    },
    features: {
      job_applications: 150,
      cv_uploads: 5,
      email_accounts: 5,
      ai_requests: 300,
      priority_support: true,
      advanced_analytics: true,
      custom_templates: true,
      api_access: true
    },
    isPopular: true,
    yearlyDiscount: 17 // ~17% discount for yearly
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For teams, recruiters, and high-volume users',
    basePrice: {
      monthly: 99.99,
      yearly: 999.99
    },
    features: {
      job_applications: 500,
      cv_uploads: 20,
      email_accounts: 20,
      ai_requests: 1000,
      priority_support: true,
      advanced_analytics: true,
      custom_templates: true,
      api_access: true,
      white_label: true
    },
    isEnterprise: true,
    yearlyDiscount: 17 // ~17% discount for yearly
  }
];

export class PricingCalculator {
  private static instance: PricingCalculator;
  private customTiers: SubscriptionTier[] = [];

  public static getInstance(): PricingCalculator {
    if (!PricingCalculator.instance) {
      PricingCalculator.instance = new PricingCalculator();
    }
    return PricingCalculator.instance;
  }

  // Load custom tiers from backend (if available)
  async loadCustomTiers(): Promise<void> {
    try {
      // This would fetch from your backend API
      const response = await fetch('/api/subscriptions/tiers/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const customTiers = await response.json();
        this.customTiers = customTiers;
      }
    } catch (error) {
      console.warn('Failed to load custom tiers from backend:', error);
      // Fallback to default tiers
    }
  }

  // Get all available tiers (custom + default)
  getAllTiers(): SubscriptionTier[] {
    return this.customTiers.length > 0 ? this.customTiers : SUBSCRIPTION_TIERS;
  }

  // Convert a single tier to a specific currency
  convertTierToCurrency(
    tier: SubscriptionTier, 
    targetCurrency: string = 'USD',
    billingCycle: 'monthly' | 'yearly' | 'quarterly' = 'monthly'
  ): SubscriptionPlan {
    const basePrice = tier.basePrice[billingCycle] || tier.basePrice.monthly;
    const convertedPrice = currencyService.convertFromUSD(basePrice, targetCurrency);
    
    // Calculate yearly discount if applicable
    const yearlyPrice = tier.basePrice.yearly || (tier.basePrice.monthly * 12);
    const monthlyPrice = tier.basePrice.monthly;
    const actualYearlyDiscount = tier.yearlyDiscount || 
      Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

    return {
      id: tier.id,
      name: tier.name,
      description: tier.description,
      price: convertedPrice,
      currency: targetCurrency,
      billing_cycle: billingCycle,
      features: {
        job_applications: tier.features.job_applications > 0,
        cv_uploads: tier.features.cv_uploads > 0,
        email_accounts: tier.features.email_accounts > 0,
        ai_requests: tier.features.ai_requests > 0,
        priority_support: tier.features.priority_support,
        advanced_analytics: tier.features.advanced_analytics,
        custom_templates: tier.features.custom_templates,
        api_access: tier.features.api_access || false,
        white_label: tier.features.white_label || false
      },
      max_job_applications: tier.features.job_applications,
      max_cv_uploads: tier.features.cv_uploads,
      max_email_accounts: tier.features.email_accounts,
      ai_requests_limit: tier.features.ai_requests,
      is_active: true,
      is_popular: tier.isPopular || false,
      price_display: currencyService.formatCurrency(convertedPrice, targetCurrency),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      base_price_usd: basePrice,
      localized_price: convertedPrice,
      localized_currency: targetCurrency,
      localized_price_display: currencyService.formatCurrency(convertedPrice, targetCurrency)
    };
  }

  // Convert all tiers to a specific currency
  convertAllTiersToCurrency(
    targetCurrency: string = 'USD',
    billingCycle: 'monthly' | 'yearly' | 'quarterly' = 'monthly'
  ): SubscriptionPlan[] {
    const tiers = this.getAllTiers();
    return tiers.map(tier => this.convertTierToCurrency(tier, targetCurrency, billingCycle));
  }

  // Get pricing for a specific tier and billing cycle
  getTierPricing(
    tierId: string,
    targetCurrency: string = 'USD',
    billingCycle: 'monthly' | 'yearly' | 'quarterly' = 'monthly'
  ): SubscriptionPlan | null {
    const tier = this.getAllTiers().find(t => t.id === tierId);
    if (!tier) return null;
    
    return this.convertTierToCurrency(tier, targetCurrency, billingCycle);
  }

  // Calculate pricing comparison between currencies
  getPricingComparison(
    tierId: string,
    currencies: string[] = ['USD', 'EUR', 'GBP', 'NGN'],
    billingCycle: 'monthly' | 'yearly' | 'quarterly' = 'monthly'
  ): Array<{ currency: string; price: number; formatted: string; savings?: string }> {
    const tier = this.getAllTiers().find(t => t.id === tierId);
    if (!tier) return [];

    const basePrice = tier.basePrice[billingCycle] || tier.basePrice.monthly;
    
    return currencies.map(currency => {
      const convertedPrice = currencyService.convertFromUSD(basePrice, currency);
      const formatted = currencyService.formatCurrency(convertedPrice, currency);
      
      // Calculate savings for yearly billing
      let savings;
      if (billingCycle === 'yearly' && tier.yearlyDiscount) {
        savings = `Save ${tier.yearlyDiscount}%`;
      }
      
      return {
        currency,
        price: convertedPrice,
        formatted,
        savings
      };
    });
  }

  // Calculate total cost with taxes (if applicable)
  calculateTotalCost(
    tierId: string,
    targetCurrency: string = 'USD',
    billingCycle: 'monthly' | 'yearly' | 'quarterly' = 'monthly',
    taxRate: number = 0, // Tax rate as decimal (e.g., 0.1 for 10%)
    countryCode?: string
  ): {
    basePrice: number;
    taxAmount: number;
    totalPrice: number;
    formatted: {
      basePrice: string;
      taxAmount: string;
      totalPrice: string;
    };
  } {
    const plan = this.getTierPricing(tierId, targetCurrency, billingCycle);
    if (!plan) {
      throw new Error(`Tier ${tierId} not found`);
    }

    const basePrice = plan.price;
    const taxAmount = basePrice * taxRate;
    const totalPrice = basePrice + taxAmount;

    return {
      basePrice,
      taxAmount,
      totalPrice,
      formatted: {
        basePrice: currencyService.formatCurrency(basePrice, targetCurrency),
        taxAmount: currencyService.formatCurrency(taxAmount, targetCurrency),
        totalPrice: currencyService.formatCurrency(totalPrice, targetCurrency)
      }
    };
  }

  // Get feature comparison across tiers
  getFeatureComparison(): Array<{
    feature: string;
    label: string;
    tiers: Record<string, string | number | boolean>;
  }> {
    const tiers = this.getAllTiers();
    const features = [
      { key: 'job_applications', label: 'Job Applications' },
      { key: 'cv_uploads', label: 'CV Uploads' },
      { key: 'email_accounts', label: 'Email Accounts' },
      { key: 'ai_requests', label: 'AI Requests' },
      { key: 'priority_support', label: 'Priority Support' },
      { key: 'advanced_analytics', label: 'Advanced Analytics' },
      { key: 'custom_templates', label: 'Custom Templates' },
      { key: 'api_access', label: 'API Access' },
      { key: 'white_label', label: 'White Label' }
    ];

    return features.map(feature => {
      const tierValues: Record<string, string | number | boolean> = {};
      
      tiers.forEach(tier => {
        const value = (tier.features as any)[feature.key];
        if (typeof value === 'boolean') {
          tierValues[tier.id] = value ? '✓' : '✗';
        } else {
          tierValues[tier.id] = value || 0;
        }
      });

      return {
        feature: feature.key,
        label: feature.label,
        tiers: tierValues
      };
    });
  }

  // Get upgrade/downgrade recommendations
  getUpgradeRecommendations(
    currentTierId: string,
    usage: {
      job_applications: number;
      cv_uploads: number;
      email_accounts: number;
      ai_requests: number;
    }
  ): {
    shouldUpgrade: boolean;
    shouldDowngrade: boolean;
    recommendedTier?: SubscriptionTier;
    reasons: string[];
  } {
    const currentTier = this.getAllTiers().find(t => t.id === currentTierId);
    if (!currentTier) {
      return { shouldUpgrade: false, shouldDowngrade: false, reasons: ['Current tier not found'] };
    }

    const reasons: string[] = [];
    let shouldUpgrade = false;
    let shouldDowngrade = false;
    let recommendedTier: SubscriptionTier | undefined;

    // Check if user is exceeding limits
    Object.entries(usage).forEach(([feature, used]) => {
      const limit = (currentTier.features as any)[feature];
      if (used >= limit * 0.8) { // 80% threshold
        shouldUpgrade = true;
        reasons.push(`Approaching limit for ${feature.replace('_', ' ')}`);
      }
      if (used >= limit) {
        shouldUpgrade = true;
        reasons.push(`Exceeded limit for ${feature.replace('_', ' ')}`);
      }
    });

    // Check if user is underutilizing
    const totalUsagePercent = Object.entries(usage).reduce((acc, [feature, used]) => {
      const limit = (currentTier.features as any)[feature];
      return acc + (used / limit);
    }, 0) / Object.keys(usage).length;

    if (totalUsagePercent < 0.3 && currentTier.id !== 'free') { // Less than 30% usage
      shouldDowngrade = true;
      reasons.push('Low usage across features - consider downgrading');
    }

    // Find recommended tier
    if (shouldUpgrade) {
      const tiers = this.getAllTiers().sort((a, b) => a.basePrice.monthly - b.basePrice.monthly);
      const currentIndex = tiers.findIndex(t => t.id === currentTierId);
      recommendedTier = tiers[currentIndex + 1];
    } else if (shouldDowngrade) {
      const tiers = this.getAllTiers().sort((a, b) => b.basePrice.monthly - a.basePrice.monthly);
      const currentIndex = tiers.findIndex(t => t.id === currentTierId);
      recommendedTier = tiers[currentIndex + 1];
    }

    return {
      shouldUpgrade,
      shouldDowngrade,
      recommendedTier,
      reasons
    };
  }

  // Save custom tier (for backend integration)
  async saveCustomTier(tier: SubscriptionTier): Promise<boolean> {
    try {
      const response = await fetch('/api/subscriptions/tiers/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tier)
      });

      if (response.ok) {
        await this.loadCustomTiers(); // Reload tiers
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save custom tier:', error);
      return false;
    }
  }

  // Get tier by ID
  getTierById(tierId: string): SubscriptionTier | null {
    return this.getAllTiers().find(tier => tier.id === tierId) || null;
  }

  // Calculate annual savings
  calculateAnnualSavings(tierId: string, targetCurrency: string = 'USD'): {
    monthlyTotal: number;
    yearlyPrice: number;
    savings: number;
    savingsPercentage: number;
    formatted: {
      monthlyTotal: string;
      yearlyPrice: string;
      savings: string;
    };
  } {
    const tier = this.getTierById(tierId);
    if (!tier) throw new Error(`Tier ${tierId} not found`);

    const monthlyPrice = currencyService.convertFromUSD(tier.basePrice.monthly, targetCurrency);
    const yearlyPrice = currencyService.convertFromUSD(tier.basePrice.yearly, targetCurrency);
    const monthlyTotal = monthlyPrice * 12;
    const savings = monthlyTotal - yearlyPrice;
    const savingsPercentage = Math.round((savings / monthlyTotal) * 100);

    return {
      monthlyTotal,
      yearlyPrice,
      savings,
      savingsPercentage,
      formatted: {
        monthlyTotal: currencyService.formatCurrency(monthlyTotal, targetCurrency),
        yearlyPrice: currencyService.formatCurrency(yearlyPrice, targetCurrency),
        savings: currencyService.formatCurrency(savings, targetCurrency)
      }
    };
  }
}

export const pricingCalculator = PricingCalculator.getInstance();
export default pricingCalculator;