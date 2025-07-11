import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  DollarSign,
  Globe,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { pricingCalculator, SUBSCRIPTION_TIERS } from '../services/pricingCalculator';
import { useSubscription } from '../context/SubscriptionContext';
import PricingCalculator from '../components/PricingCalculator';
import type { SubscriptionTier } from '../services/pricingCalculator';

const PricingManagementPage: React.FC = () => {
  const { userCurrency } = useSubscription();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [editingTier, setEditingTier] = useState<SubscriptionTier | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'tiers' | 'calculator' | 'preview'>('tiers');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    try {
      await pricingCalculator.loadCustomTiers();
      setTiers(pricingCalculator.getAllTiers());
    } catch (error) {
      console.error('Failed to load tiers:', error);
      setTiers(SUBSCRIPTION_TIERS);
    }
  };

  const createNewTier = (): SubscriptionTier => ({
    id: `tier_${Date.now()}`,
    name: 'New Tier',
    description: 'Description for the new tier',
    basePrice: {
      monthly: 19.99,
      yearly: 199.99
    },
    features: {
      job_applications: 100,
      cv_uploads: 3,
      email_accounts: 3,
      ai_requests: 200,
      priority_support: false,
      advanced_analytics: false,
      custom_templates: true
    },
    yearlyDiscount: 17
  });

  const handleEdit = (tier: SubscriptionTier) => {
    setEditingTier({ ...tier });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingTier(createNewTier());
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!editingTier) return;

    setSaving(true);
    try {
      const success = await pricingCalculator.saveCustomTier(editingTier);
      if (success) {
        await loadTiers();
        setEditingTier(null);
        setIsCreating(false);
        showMessage('success', 'Tier saved successfully!');
      } else {
        showMessage('error', 'Failed to save tier. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save tier:', error);
      showMessage('error', 'An error occurred while saving the tier.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingTier(null);
    setIsCreating(false);
  };

  const handleDelete = async (tierId: string) => {
    if (!confirm('Are you sure you want to delete this tier?')) return;

    try {
      // Implementation would depend on your backend API
      await fetch(`/api/subscriptions/tiers/${tierId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      await loadTiers();
      showMessage('success', 'Tier deleted successfully!');
    } catch (error) {
      console.error('Failed to delete tier:', error);
      showMessage('error', 'Failed to delete tier.');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const updateEditingTier = (updates: Partial<SubscriptionTier>) => {
    if (editingTier) {
      setEditingTier({ ...editingTier, ...updates });
    }
  };

  const updateFeature = (feature: string, value: any) => {
    if (editingTier) {
      setEditingTier({
        ...editingTier,
        features: { ...editingTier.features, [feature]: value }
      });
    }
  };

  const updatePrice = (cycle: 'monthly' | 'yearly', value: number) => {
    if (editingTier) {
      setEditingTier({
        ...editingTier,
        basePrice: { ...editingTier.basePrice, [cycle]: value }
      });
    }
  };

  const tabs = [
    { id: 'tiers', label: 'Manage Tiers', icon: Settings },
    { id: 'calculator', label: 'Pricing Calculator', icon: DollarSign },
    { id: 'preview', label: 'Preview', icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1>
              <p className="text-gray-600">Define subscription tiers once, automatically calculate pricing in all currencies</p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tier
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4`}>
          <div className={`flex items-center p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tier Management Tab */}
        {activeTab === 'tiers' && (
          <div className="space-y-6">
            {/* Tier List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <div key={tier.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                      <p className="text-sm text-gray-600">{tier.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(tier)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {tier.id !== 'free' && (
                        <button
                          onClick={() => handleDelete(tier.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly:</span>
                      <span className="font-medium">${tier.basePrice.monthly}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Yearly:</span>
                      <span className="font-medium">${tier.basePrice.yearly}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Jobs: {tier.features.job_applications}</div>
                        <div>CVs: {tier.features.cv_uploads}</div>
                        <div>Emails: {tier.features.email_accounts}</div>
                        <div>AI: {tier.features.ai_requests}</div>
                      </div>
                    </div>
                  </div>

                  {tier.isPopular && (
                    <div className="mt-3 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      <Zap className="w-3 h-3 mr-1" />
                      Popular
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Edit Modal */}
            {editingTier && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isCreating ? 'Create New Tier' : `Edit ${editingTier.name}`}
                      </h3>
                      <button
                        onClick={handleCancel}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tier Name
                          </label>
                          <input
                            type="text"
                            value={editingTier.name}
                            onChange={(e) => updateEditingTier({ name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tier ID
                          </label>
                          <input
                            type="text"
                            value={editingTier.id}
                            onChange={(e) => updateEditingTier({ id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={editingTier.description}
                          onChange={(e) => updateEditingTier({ description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Pricing */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">Base Pricing (USD)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Monthly Price
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingTier.basePrice.monthly}
                              onChange={(e) => updatePrice('monthly', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Yearly Price
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingTier.basePrice.yearly}
                              onChange={(e) => updatePrice('yearly', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Yearly Discount %
                            </label>
                            <input
                              type="number"
                              value={editingTier.yearlyDiscount || 0}
                              onChange={(e) => updateEditingTier({ yearlyDiscount: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">Feature Limits</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Job Applications
                            </label>
                            <input
                              type="number"
                              value={editingTier.features.job_applications}
                              onChange={(e) => updateFeature('job_applications', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CV Uploads
                            </label>
                            <input
                              type="number"
                              value={editingTier.features.cv_uploads}
                              onChange={(e) => updateFeature('cv_uploads', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Accounts
                            </label>
                            <input
                              type="number"
                              value={editingTier.features.email_accounts}
                              onChange={(e) => updateFeature('email_accounts', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              AI Requests
                            </label>
                            <input
                              type="number"
                              value={editingTier.features.ai_requests}
                              onChange={(e) => updateFeature('ai_requests', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Feature Toggles */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">Premium Features</h4>
                        <div className="space-y-3">
                          {[
                            { key: 'priority_support', label: 'Priority Support' },
                            { key: 'advanced_analytics', label: 'Advanced Analytics' },
                            { key: 'custom_templates', label: 'Custom Templates' },
                            { key: 'api_access', label: 'API Access' },
                            { key: 'white_label', label: 'White Label' }
                          ].map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">{label}</span>
                              <button
                                onClick={() => updateFeature(key, !(editingTier.features as any)[key])}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                  (editingTier.features as any)[key] ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    (editingTier.features as any)[key] ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tier Options */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">Tier Options</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Mark as Popular</span>
                            <button
                              onClick={() => updateEditingTier({ isPopular: !editingTier.isPopular })}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                editingTier.isPopular ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  editingTier.isPopular ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Enterprise Tier</span>
                            <button
                              onClick={() => updateEditingTier({ isEnterprise: !editingTier.isEnterprise })}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                editingTier.isEnterprise ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  editingTier.isEnterprise ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Tier
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <PricingCalculator className="w-full" />
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
            <p className="text-gray-600 mb-6">
              This shows how your pricing will appear to customers in different currencies.
            </p>
            
            {/* Preview would show actual plan cards here */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <div key={tier.id} className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-2">{tier.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                  <div className="text-2xl font-bold text-gray-900 mb-4">
                    ${tier.basePrice.monthly}/mo
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>{tier.features.job_applications} Job Applications</div>
                    <div>{tier.features.cv_uploads} CV Uploads</div>
                    <div>{tier.features.email_accounts} Email Accounts</div>
                    <div>{tier.features.ai_requests} AI Requests</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingManagementPage;