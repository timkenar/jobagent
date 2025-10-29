import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Settings, Receipt, BarChart3, Star } from 'lucide-react';

const SubscriptionNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      id: 'plans',
      label: 'Plans',
      icon: Star,
      path: '/subscriptions/plans',
      description: 'View available subscription plans'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      path: '/subscriptions/dashboard',
      description: 'Manage your subscription'
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: Receipt,
      path: '/subscriptions/billing',
      description: 'View payment history'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/subscriptions/settings',
      description: 'Subscription preferences'
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-white dark:bg-gray-900/60 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Subscription Management</h3>
        <CreditCard className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                isActive
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-200'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-blue-500/60 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${isActive ? 'text-blue-600 dark:text-blue-200' : 'text-gray-400 dark:text-gray-500'}`} />
              <div className={`font-medium text-sm ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                {item.label}
              </div>
              <div className={`text-xs ${isActive ? 'text-blue-600 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                {item.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionNavigation;
