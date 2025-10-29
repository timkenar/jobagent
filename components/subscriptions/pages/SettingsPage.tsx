import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  CreditCard, 
  Shield, 
  Save, 
  Check, 
  X,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Palette
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import ThemeToggle from '../../shared/ThemeToggle';
import { useTheme } from '../../../src/contexts/ThemeContext';
import SubscriptionLayout from '../layout/SubscriptionLayout';

interface NotificationSettings {
  email_notifications: boolean;
  payment_reminders: boolean;
  usage_alerts: boolean;
  plan_changes: boolean;
}

interface PaymentMethod {
  id: string;
  type: string;
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
}

const SettingsPage: React.FC = () => {
  const { loading, error } = useSubscription();
  const { theme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'notifications' | 'payment' | 'privacy' | 'account' | 'appearance'>('notifications');
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Mock data - in real app, this would come from API
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    payment_reminders: true,
    usage_alerts: true,
    plan_changes: true
  });
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'visa',
      last_four: '4242',
      expiry_month: 12,
      expiry_year: 2025,
      is_default: true
    }
  ]);
  
  const [privacySettings, setPrivacySettings] = useState({
    share_usage_data: false,
    marketing_communications: false,
    third_party_integrations: true
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      // Handle deletion logic here
      console.log('Deleting item:', itemToDelete);
      setPaymentMethods(prev => prev.filter(pm => pm.id !== itemToDelete));
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {key === 'email_notifications' && 'Receive general email notifications'}
                  {key === 'payment_reminders' && 'Get notified about upcoming payments'}
                  {key === 'usage_alerts' && 'Alerts when approaching usage limits'}
                  {key === 'plan_changes' && 'Notifications about plan changes and updates'}
                </p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    value ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Payment Methods</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors text-sm">
          Add New Method
        </button>
      </div>
      
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-6 bg-blue-600 dark:bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {method.type.toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      •••• •••• •••• {method.last_four}
                    </span>
                    {method.is_default && (
                      <span className="bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Expires {method.expiry_month.toString().padStart(2, '0')}/{method.expiry_year}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setItemToDelete(method.id);
                    setShowDeleteModal(true);
                  }}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Privacy Preferences</h3>
        <div className="space-y-4">
          {Object.entries(privacySettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {key === 'share_usage_data' && 'Help improve our service by sharing anonymous usage data'}
                  {key === 'marketing_communications' && 'Receive promotional emails and product updates'}
                  {key === 'third_party_integrations' && 'Allow integration with third-party services'}
                </p>
              </div>
              <button
                onClick={() => setPrivacySettings(prev => ({ ...prev, [key]: !value }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    value ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Account Management</h3>
        <div className="space-y-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900/60">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Export Data</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Download all your subscription data, payment history, and usage statistics.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors text-sm">
              Export Data
            </button>
          </div>
          
          <div className="border border-red-200 dark:border-red-900/60 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
            <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">Delete Account</h4>
            <p className="text-sm text-red-600 dark:text-red-300 mb-3">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors text-sm">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Appearance Settings</h3>
        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900/60">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Theme</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose your preferred color theme. By default, the theme follows your system settings.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Theme Mode
                </label>
                <ThemeToggle variant="dropdown" showLabel={true} size="md" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Current theme: <span className="font-medium capitalize">{theme}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const headerActions = (
    <div className="flex items-center space-x-3">
      {showSuccess && (
        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
          <Check className="w-4 h-4 mr-1" />
          Saved successfully
        </div>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </>
        )}
      </button>
    </div>
  );

  if (loading) {
    return (
      <SubscriptionLayout
        title="Subscription Settings"
        subtitle="Manage your subscription preferences and account settings."
        headerActions={headerActions}
      >
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </SubscriptionLayout>
    );
  }

  if (error) {
    return (
      <SubscriptionLayout
        title="Subscription Settings"
        subtitle="Manage your subscription preferences and account settings."
        headerActions={headerActions}
      >
        <div className="flex items-center justify-center py-24">
          <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md text-center shadow">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Unable to load settings
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
          </div>
        </div>
      </SubscriptionLayout>
    );
  }

  return (
    <SubscriptionLayout
      title="Subscription Settings"
      subtitle="Manage your subscription preferences and account settings."
      headerActions={headerActions}
    >
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-shrink-0 lg:w-64">
          <div className="bg-white dark:bg-gray-900/60 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mr-3 ${
                        isActive ? 'text-blue-600 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white dark:bg-gray-900/60 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'payment' && renderPaymentMethods()}
            {activeTab === 'privacy' && renderPrivacySettings()}
            {activeTab === 'account' && renderAccountSettings()}
            {activeTab === 'appearance' && renderAppearanceSettings()}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this payment method? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </SubscriptionLayout>
  );
};

export default SettingsPage;
