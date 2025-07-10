import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AppSetting {
  id: number;
  key: string;
  display_name: string;
  description: string;
  value: string;
  default_value: string;
  category: string;
  setting_type: string;
  is_sensitive: boolean;
  is_required: boolean;
  is_active: boolean;
  display_value: string;
}

interface CategoryGroup {
  category: string;
  display_name: string;
  settings: AppSetting[];
}

const SettingsManagement: React.FC = () => {
  const [settingsByCategory, setSettingsByCategory] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSettings, setEditingSettings] = useState<{[key: number]: string}>({});
  const [saving, setSaving] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8000/api/settings/by_category/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettingsByCategory(response.data);
    } catch (err: any) {
      setError('Failed to load settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (settingId: number, newValue: string) => {
    setSaving(prev => ({ ...prev, [settingId]: true }));
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(`http://localhost:8000/api/settings/${settingId}/`, {
        value: newValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setSettingsByCategory(prev => 
        prev.map(category => ({
          ...category,
          settings: category.settings.map(setting =>
            setting.id === settingId ? { ...setting, value: newValue } : setting
          )
        }))
      );

      // Clear editing state
      setEditingSettings(prev => {
        const newState = { ...prev };
        delete newState[settingId];
        return newState;
      });

    } catch (err: any) {
      console.error('Error updating setting:', err);
      setError('Failed to update setting');
    } finally {
      setSaving(prev => ({ ...prev, [settingId]: false }));
    }
  };

  const handleEditClick = (settingId: number, currentValue: string) => {
    setEditingSettings(prev => ({ ...prev, [settingId]: currentValue }));
  };

  const handleCancelEdit = (settingId: number) => {
    setEditingSettings(prev => {
      const newState = { ...prev };
      delete newState[settingId];
      return newState;
    });
  };

  const handleSave = (settingId: number) => {
    const newValue = editingSettings[settingId];
    if (newValue !== undefined) {
      updateSetting(settingId, newValue);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai_services':
        return '🤖';
      case 'search_services':
        return '🔍';
      case 'oauth_services':
        return '🔐';
      case 'email_services':
        return '📧';
      case 'features':
        return '⚡';
      default:
        return '⚙️';
    }
  };

  const getSettingTypeColor = (type: string) => {
    switch (type) {
      case 'api_key':
        return 'bg-red-100 text-red-800';
      case 'boolean':
        return 'bg-green-100 text-green-800';
      case 'number':
        return 'bg-blue-100 text-blue-800';
      case 'json':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8 transition-colors duration-200">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings Management</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              Manage API keys and application configuration
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Settings by Category */}
        <div className="space-y-6">
          {settingsByCategory.map((category) => (
            <div key={category.category} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-200">
              {/* Category Header */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <span className="mr-2 text-xl">{getCategoryIcon(category.category)}</span>
                  {category.display_name}
                  <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                    {category.settings.length} settings
                  </span>
                </h2>
              </div>

              {/* Settings List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {category.settings.map((setting) => (
                  <div key={setting.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900">
                            {setting.display_name}
                          </h3>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSettingTypeColor(setting.setting_type)}`}>
                            {setting.setting_type}
                          </span>
                          {setting.is_required && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Required
                            </span>
                          )}
                          {setting.is_sensitive && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Sensitive
                            </span>
                          )}
                        </div>
                        
                        {setting.description && (
                          <p className="mt-1 text-sm text-gray-600">{setting.description}</p>
                        )}
                        
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 font-medium">Key: </span>
                          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                            {setting.key}
                          </code>
                        </div>

                        {/* Value Display/Edit */}
                        <div className="mt-3">
                          {editingSettings[setting.id] !== undefined ? (
                            <div className="flex items-center space-x-2">
                              {setting.setting_type === 'boolean' ? (
                                <select
                                  value={editingSettings[setting.id]}
                                  onChange={(e) => setEditingSettings(prev => ({
                                    ...prev,
                                    [setting.id]: e.target.value
                                  }))}
                                  className="block w-32 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                  <option value="true">True</option>
                                  <option value="false">False</option>
                                </select>
                              ) : setting.setting_type === 'json' ? (
                                <textarea
                                  value={editingSettings[setting.id]}
                                  onChange={(e) => setEditingSettings(prev => ({
                                    ...prev,
                                    [setting.id]: e.target.value
                                  }))}
                                  rows={3}
                                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                              ) : (
                                <input
                                  type={setting.is_sensitive ? 'password' : 'text'}
                                  value={editingSettings[setting.id]}
                                  onChange={(e) => setEditingSettings(prev => ({
                                    ...prev,
                                    [setting.id]: e.target.value
                                  }))}
                                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                              )}
                              
                              <button
                                onClick={() => handleSave(setting.id)}
                                disabled={saving[setting.id]}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                              >
                                {saving[setting.id] ? 'Saving...' : 'Save'}
                              </button>
                              
                              <button
                                onClick={() => handleCancelEdit(setting.id)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Current Value: </span>
                                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded">
                                  {setting.is_sensitive ? setting.display_value : setting.value || setting.default_value || 'Not set'}
                                </span>
                              </div>
                              
                              <button
                                onClick={() => handleEditClick(setting.id, setting.value || setting.default_value || '')}
                                className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Changes take effect immediately. Settings are cached for 5 minutes.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;