import axios from 'axios';
import { API_CONFIG } from '../../../src/config/api';
import { currencyService } from './currencyService';
import type {
  SubscriptionPlan,
  UserSubscription,
  Payment,
  SubscriptionStats,
  PaymentInitializeResponse,
  PaymentVerifyResponse,
  FeatureType
} from '../types';

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
      const userCurrency = currencyService.getUserCurrency();
      
      // Try to fetch from backend first
      try {
        const response = await axios.get(`${this.baseURL}/plans/`, {
          headers: this.getAuthHeaders(),
          params: {
            currency: userCurrency
          }
        });
        
        // Localize pricing for each plan
        const plans = response.data.map((plan: SubscriptionPlan) => 
          this.localizePlan(plan, userCurrency)
        );
        
        return plans;
      } catch (backendError) {
        console.warn('Backend plans not available, using pricing calculator:', backendError);
        
        // Fallback to pricing calculator
        const { pricingCalculator } = await import('./pricingCalculator');
        await pricingCalculator.loadCustomTiers();
        return pricingCalculator.convertAllTiersToCurrency(userCurrency, 'monthly');
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  // Localize a plan to user's currency
  private localizePlan(plan: SubscriptionPlan, userCurrency: string): SubscriptionPlan {
    // If plan is already in user's currency, return as is
    if (plan.currency === userCurrency) {
      return plan;
    }

    // Convert from USD base price to user's currency
    const basePriceUSD = plan.base_price_usd || plan.price;
    const localizedPrice = currencyService.convertFromUSD(basePriceUSD, userCurrency);
    const localizedPriceDisplay = currencyService.formatCurrency(localizedPrice, userCurrency);

    return {
      ...plan,
      base_price_usd: basePriceUSD,
      localized_price: localizedPrice,
      localized_currency: userCurrency,
      localized_price_display: localizedPriceDisplay,
      // Update the main price fields for display
      price: localizedPrice,
      currency: userCurrency,
      price_display: localizedPriceDisplay
    };
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
      const userCurrency = currencyService.getUserCurrency();
      const locationData = currencyService.getLocationData();
      
      const response = await axios.post(`${this.baseURL}/payments/initialize/`, {
        plan_id: planId,
        callback_url: callbackUrl,
        currency: userCurrency,
        country: locationData?.countryCode || 'US'
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
  async canAccessFeature(feature: FeatureType, amount: number = 1): Promise<boolean> {
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
  formatPrice(amount: number, currency: string = 'USD'): string {
    return currencyService.formatCurrency(amount, currency);
  }

  // Convert and format price
  convertAndFormatPrice(usdAmount: number, targetCurrency?: string): string {
    const currency = targetCurrency || currencyService.getUserCurrency();
    const convertedAmount = currencyService.convertFromUSD(usdAmount, currency);
    return currencyService.formatCurrency(convertedAmount, currency);
  }

  getBillingCycleLabel(cycle: string): string {
    const labels = {
      'monthly': 'Monthly',
      'yearly': 'Yearly',
      'quarterly': 'Quarterly'
    };
    return labels[cycle as keyof typeof labels] || cycle;
  }

  getFeatureLabel(feature: FeatureType): string {
    const labels = {
      'job_applications': 'Job Applications',
      'cv_uploads': 'CV Uploads',
      'email_accounts': 'Email Accounts',
      'ai_requests': 'AI Requests'
    };
    return labels[feature];
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