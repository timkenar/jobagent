import React, { useState } from 'react';
import { useGmail } from '../../src/contexts/GmailContext';
import { useAuth } from '../../src/contexts/AuthContext';
import EmailIntegrationSection from '../email/EmailIntegrationSection';
import { AIAgentFormProps, AIAgentConfig } from './types';
import LogoSpinner from '../ui/logospinner';

const AIAgentForm: React.FC<AIAgentFormProps> = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const gmail = useGmail();
  
  // Generate default instructions based on user profile
  const getDefaultInstructions = () => {
    if (!user) return '';
    
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const jobCategory = userProfile.job_category || 'professional';
    const experience = userProfile.experience_years || 'mid-level';
    
    return `I am ${user.full_name || 'a professional'} seeking ${jobCategory} opportunities with ${experience} experience. Please help me find relevant job opportunities and craft personalized application emails that highlight my skills and experience.`;
  };

  const [formData, setFormData] = useState<AIAgentConfig>({
    chatModel: 'gpt-4-turbo',
    enableMemory: true,
    memoryContext: user ? `User Profile: ${user.full_name}, Email: ${user.email}` : '',
    instructions: getDefaultInstructions()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const configWithEmail = {
        ...formData,
        emailConnected: gmail.emailAccounts.length > 0,
        connectedEmails: gmail.emailAccounts.map(account => ({
          id: account.id,
          email: account.email,
          provider: account.provider
        }))
      };

      localStorage.setItem('aiAgentConfig', JSON.stringify(configWithEmail));
      onComplete(configWithEmail);
    } catch (error) {
      console.error('Error saving AI agent configuration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 max-w-3xl mx-auto border border-gray-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Configure Your AI Agent</h3>
        <p className="text-gray-600">Set up your intelligent job search assistant</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Chat Model *
          </label>
          <select
            value={formData.chatModel}
            onChange={(e) => setFormData({ ...formData, chatModel: e.target.value })}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            required
          >
            <option value="">Select a chat model</option>
            <option value="anthropic">Anthropic Claude</option>
            <option value="openai">ChatGPT</option>
            <option value="grok">Grok</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Memory Configuration
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.enableMemory}
                onChange={(e) => setFormData({ ...formData, enableMemory: e.target.checked })}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Enable Memory</span>
            </label>
            {formData.enableMemory && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Memory Context</label>
                <textarea
                  value={formData.memoryContext}
                  onChange={(e) => setFormData({ ...formData, memoryContext: e.target.value })}
                  rows={3}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Previous conversation context..."
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Email Integration
          </label>
          <div className="border border-gray-200 rounded-lg p-4">
            <EmailIntegrationSection />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Agent Instructions
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            rows={4}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            placeholder="Enter specific instructions for your AI agent..."
          />
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-8">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 px-6 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.chatModel}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <LogoSpinner size={20} inline />
                <span className="ml-2">Saving...</span>
              </div>
            ) : (
              'Save Configuration'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIAgentForm;