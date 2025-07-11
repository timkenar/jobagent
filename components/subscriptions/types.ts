// Subscription types and interfaces
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly' | 'quarterly';
  features: Record<string, boolean>;
  max_job_applications: number;
  max_cv_uploads: number;
  max_email_accounts: number;
  ai_requests_limit: number;
  is_active: boolean;
  is_popular: boolean;
  price_display: string;
  created_at: string;
  updated_at: string;
  // Multi-currency support
  base_price_usd: number;
  localized_price?: number;
  localized_currency?: string;
  localized_price_display?: string;
}

export interface UserSubscription {
  id: string;
  plan: SubscriptionPlan;
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'suspended';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  job_applications_used: number;
  cv_uploads_used: number;
  email_accounts_used: number;
  ai_requests_used: number;
  is_active: boolean;
  days_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';
  paystack_reference: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}

export interface SubscriptionStats {
  has_active_subscription: boolean;
  current_plan?: SubscriptionPlan;
  usage_stats: {
    job_applications: UsageStats;
    cv_uploads: UsageStats;
    email_accounts: UsageStats;
    ai_requests: UsageStats;
  };
  limits: {
    job_applications: number;
    cv_uploads: number;
    email_accounts: number;
    ai_requests: number;
  };
  subscription_status: string;
  days_remaining?: number;
}

export interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
}

export interface PaymentInitializeResponse {
  status: boolean;
  data?: {
    payment_id: string;
    reference: string;
    authorization_url: string;
    access_code: string;
  };
  error?: string;
}

export interface PaymentVerifyResponse {
  status: boolean;
  message?: string;
  data?: {
    payment_id: string;
    status: string;
    amount: number;
    currency: string;
  };
  error?: string;
}

export type FeatureType = 'job_applications' | 'cv_uploads' | 'email_accounts' | 'ai_requests';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rate: number;
  locale: string;
}

export interface LocationData {
  country: string;
  countryCode: string;
  currency: string;
  timezone: string;
}

export interface CurrencyContextType {
  userCurrency: string;
  locationData: LocationData | null;
  supportedCurrencies: CurrencyInfo[];
  setUserCurrency: (currency: string) => void;
  formatCurrency: (amount: number, currency?: string) => string;
  convertFromUSD: (usdAmount: number, targetCurrency?: string) => number;
  convertToUSD: (amount: number, fromCurrency: string) => number;
  detectUserCurrency: () => Promise<string>;
  isLoading: boolean;
}

export interface SubscriptionContextType {
  // State
  plans: SubscriptionPlan[];
  currentSubscription: UserSubscription | null;
  stats: SubscriptionStats | null;
  loading: boolean;
  error: string | null;

  // Currency support
  userCurrency: string;
  locationData: LocationData | null;
  supportedCurrencies: CurrencyInfo[];
  
  // Actions
  refreshPlans: () => Promise<void>;
  refreshCurrentSubscription: () => Promise<void>;
  refreshStats: () => Promise<void>;
  subscribeToPlan: (planId: string) => Promise<string>;
  cancelSubscription: (subscriptionId: string, reason?: string) => Promise<void>;
  reactivateSubscription: (subscriptionId: string) => Promise<void>;
  verifyPayment: (reference: string) => Promise<boolean>;
  canUseFeature: (feature: FeatureType, amount?: number) => boolean;
  getUsagePercentage: (feature: FeatureType) => number;
  clearError: () => void;
  
  // Currency actions
  setUserCurrency: (currency: string) => void;
  formatCurrency: (amount: number, currency?: string) => string;
  convertFromUSD: (usdAmount: number, targetCurrency?: string) => number;
  convertToUSD: (amount: number, fromCurrency: string) => number;
  detectUserCurrency: () => Promise<string>;
  paymentHistory: Payment[];
  refreshPaymentHistory: () => Promise<void>;
}