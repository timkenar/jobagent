import React, { useState } from 'react';
import { X } from 'lucide-react';

interface EmailProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProviderSelect: (provider: 'gmail' | 'outlook') => void;
  connecting: boolean;
}

const EmailProviderModal: React.FC<EmailProviderModalProps> = ({
  isOpen,
  onClose,
  onProviderSelect,
  connecting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Connect Your Email
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={connecting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Choose your email provider to start tracking job applications automatically.
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              🔒 Secure OAuth 2.0 authentication - your credentials are never stored
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-3">
            <button
              onClick={() => onProviderSelect('gmail')}
              className="group w-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:text-red-600 font-semibold py-4 px-6 rounded-xl shadow-sm hover:shadow-lg transition-all flex items-center space-x-4"
              disabled={connecting}
            >
              <div className="w-12 h-12 bg-red-500 group-hover:bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-lg mb-1">
                  {connecting ? 'Connecting...' : 'Gmail'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Personal & Google Workspace accounts
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  ✓ Advanced spam filtering ✓ Large storage ✓ Smart categorization
                </div>
              </div>
            </button>

            <button
              onClick={() => onProviderSelect('outlook')}
              className="group w-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:text-blue-600 font-semibold py-4 px-6 rounded-xl shadow-sm hover:shadow-lg transition-all flex items-center space-x-4"
              disabled={connecting}
            >
              <div className="w-12 h-12 bg-blue-500 group-hover:bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.462 0H0v24h7.462V12.872H12V24h12V0H12v11.128H7.462V0z"/>
                </svg>
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-lg mb-1">
                  {connecting ? 'Connecting...' : 'Outlook'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Personal & Microsoft 365 accounts
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  ✓ Enterprise integration ✓ Calendar sync ✓ Office 365 compatible
                </div>
              </div>
            </button>
          </div>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
              What you'll get:
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Automatic job application email detection</li>
              <li>• Smart categorization (interviews, offers, rejections)</li>
              <li>• Email templates for follow-ups and responses</li>
              <li>• Application tracking dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailProviderModal;