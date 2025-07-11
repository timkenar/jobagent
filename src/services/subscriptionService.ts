import axios from 'axios';
import { API_CONFIG } from '../config/api';

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
    job_applications: {
      used: number;
      limit: number;
      remaining: number;
    };
    cv_uploads: {
      used: number;
      limit: number;
      remaining: number;
    };
    email_accounts: {
      used: number;
      limit: number;
      remaining: number;
    };
    ai_requests: {
      used: number;
      limit: number;
      remaining: number;
    };
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

class SubscriptionService {
  private baseURL = `${API_CONFIG.BASE_URL}/api/subscriptions`;

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Subscription Plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await axios.get(`${this.baseURL}/plans/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  async getFeaturedPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await axios.get(`${this.baseURL}/plans/featured/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured plans:', error);
      throw error;
    }
  }

  // User Subscriptions
  async getUserSubscriptions(): Promise<UserSubscription[]> {
    try {
      const response = await axios.get(`${this.baseURL}/subscriptions/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      throw error;
    }
  }

  async getCurrentSubscription(): Promise<UserSubscription | null> {
    try {
      const response = await axios.get(`${this.baseURL}/subscriptions/current/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching current subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, reason?: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/subscriptions/${subscriptionId}/cancel/`, {
        reason
      }, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/subscriptions/${subscriptionId}/reactivate/`, {}, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    try {
      const response = await axios.get(`${this.baseURL}/payments/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  async initializePayment(planId: string, callbackUrl?: string): Promise<PaymentInitializeResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/payments/initialize/`, {
        plan_id: planId,
        callback_url: callbackUrl
      }, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/payments/verify/`, {
        reference
      }, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Subscription Statistics
  async getSubscriptionStats(): Promise<SubscriptionStats> {
    try {
      const response = await axios.get(`${this.baseURL}/stats/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      throw error;
    }
  }

  // Feature Access
  async canAccessFeature(feature: string, amount: number = 1): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/feature-access/`, {
        params: { feature, amount },
        headers: this.getAuthHeaders()
      });
      return response.data.can_access;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  // Utility methods
  formatPrice(amount: number, currency: string = 'NGN'): string {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  }

  getBillingCycleLabel(cycle: string): string {
    const labels = {
      'monthly': 'Monthly',
      'yearly': 'Yearly',
      'quarterly': 'Quarterly'
    };
    return labels[cycle as keyof typeof labels] || cycle;
  }

  getFeatureLabel(feature: string): string {
    const labels = {
      'job_applications': 'Job Applications',
      'cv_uploads': 'CV Uploads',
      'email_accounts': 'Email Accounts',
      'ai_requests': 'AI Requests'
    };
    return labels[feature as keyof typeof labels] || feature;
  }

  calculateSavings(monthlyPrice: number, yearlyPrice: number): number {
    const yearlyFromMonthly = monthlyPrice * 12;
    const savings = yearlyFromMonthly - yearlyPrice;
    return Math.round((savings / yearlyFromMonthly) * 100);
  }

  // Paystack Integration
  openPaystackPopup(authorizationUrl: string): void {
    window.open(authorizationUrl, '_blank', 'width=600,height=700');
  }

  // Listen for payment completion
  listenForPaymentCompletion(callback: (reference: string) => void): void {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'paystack_payment_complete') {
        callback(event.data.reference);
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;