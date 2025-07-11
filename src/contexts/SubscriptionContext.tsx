import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { subscriptionService, SubscriptionPlan, UserSubscription, SubscriptionStats } from '../services/subscriptionService';

interface SubscriptionContextType {
  // State
  plans: SubscriptionPlan[];
  currentSubscription: UserSubscription | null;
  stats: SubscriptionStats | null;
  loading: boolean;
  error: string | null;

  // Actions
  refreshPlans: () => Promise<void>;
  refreshCurrentSubscription: () => Promise<void>;
  refreshStats: () => Promise<void>;
  subscribeToPlan: (planId: string) => Promise<string>; // Returns authorization URL
  cancelSubscription: (subscriptionId: string, reason?: string) => Promise<void>;
  reactivateSubscription: (subscriptionId: string) => Promise<void>;
  verifyPayment: (reference: string) => Promise<boolean>;
  canUseFeature: (feature: string, amount?: number) => boolean;
  getUsagePercentage: (feature: string) => number;
  clearError: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refresh subscription plans
  const refreshPlans = async () => {
    try {
      const plansData = await subscriptionService.getPlans();
      setPlans(plansData);
      setError(null);
    } catch (err) {
      console.error('Error refreshing plans:', err);
      setError('Failed to load subscription plans');
    }
  };

  // Refresh current subscription
  const refreshCurrentSubscription = async () => {
    try {
      const subscription = await subscriptionService.getCurrentSubscription();
      setCurrentSubscription(subscription);
      setError(null);
    } catch (err) {
      console.error('Error refreshing current subscription:', err);
      setError('Failed to load current subscription');
    }
  };

  // Refresh subscription stats
  const refreshStats = async () => {
    try {
      const statsData = await subscriptionService.getSubscriptionStats();
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Error refreshing subscription stats:', err);
      setError('Failed to load subscription statistics');
    }
  };

  // Subscribe to a plan
  const subscribeToPlan = async (planId: string): Promise<string> => {
    try {
      setLoading(true);
      const callbackUrl = `${window.location.origin}/subscription/callback`;
      const result = await subscriptionService.initializePayment(planId, callbackUrl);
      
      if (result.status && result.data) {
        setError(null);
        return result.data.authorization_url;
      } else {
        throw new Error(result.error || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Error subscribing to plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to subscribe to plan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async (subscriptionId: string, reason?: string) => {
    try {
      setLoading(true);
      await subscriptionService.cancelSubscription(subscriptionId, reason);
      await refreshCurrentSubscription();
      await refreshStats();
      setError(null);
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError('Failed to cancel subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reactivate subscription
  const reactivateSubscription = async (subscriptionId: string) => {
    try {
      setLoading(true);
      await subscriptionService.reactivateSubscription(subscriptionId);
      await refreshCurrentSubscription();
      await refreshStats();
      setError(null);
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      setError('Failed to reactivate subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify payment
  const verifyPayment = async (reference: string): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await subscriptionService.verifyPayment(reference);
      
      if (result.status) {
        // Refresh subscription data after successful payment
        await refreshCurrentSubscription();
        await refreshStats();
        setError(null);
        return true;
      } else {
        setError(result.error || 'Payment verification failed');
        return false;
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('Failed to verify payment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if user can use a feature
  const canUseFeature = (feature: string, amount: number = 1): boolean => {
    if (!stats) return false;

    const featureStats = stats.usage_stats[feature as keyof typeof stats.usage_stats];
    if (!featureStats) return false;

    return featureStats.remaining >= amount;
  };

  // Get usage percentage for a feature
  const getUsagePercentage = (feature: string): number => {
    if (!stats) return 0;

    const featureStats = stats.usage_stats[feature as keyof typeof stats.usage_stats];
    if (!featureStats) return 0;

    return Math.round((featureStats.used / featureStats.limit) * 100);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          refreshPlans(),
          refreshCurrentSubscription(),
          refreshStats()
        ]);
      } catch (err) {
        console.error('Error initializing subscription data:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Listen for payment completion messages
  useEffect(() => {
    const handlePaymentMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'paystack_payment_complete') {
        const reference = event.data.reference;
        if (reference) {
          await verifyPayment(reference);
        }
      }
    };

    window.addEventListener('message', handlePaymentMessage);
    return () => window.removeEventListener('message', handlePaymentMessage);
  }, []);

  const contextValue: SubscriptionContextType = {
    // State
    plans,
    currentSubscription,
    stats,
    loading,
    error,

    // Actions
    refreshPlans,
    refreshCurrentSubscription,
    refreshStats,
    subscribeToPlan,
    cancelSubscription,
    reactivateSubscription,
    verifyPayment,
    canUseFeature,
    getUsagePercentage,
    clearError,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionProvider;