import React from 'react';
import { Home, Shield, FileText, Globe } from 'lucide-react';

const GoogleVerificationLinks: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Google Verification Links
            </h1>
            <p className="text-gray-600">
              Required links for Google OAuth application verification
            </p>
          </div>

          <div className="space-y-6">
            {/* Home Page */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Home className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Application Home Page
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                The main landing page of your AI Job Search Assistant application.
              </p>
              <div className="bg-white p-4 rounded border">
                <p className="text-sm text-gray-500 mb-2">URL:</p>
                <a 
                  href="/" 
                  className="text-blue-600 hover:text-blue-700 font-medium text-lg"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  https://aijobsearch.com
                </a>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Privacy Policy
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                Our comprehensive privacy policy explaining how we collect, use, and protect user data.
              </p>
              <div className="bg-white p-4 rounded border">
                <p className="text-sm text-gray-500 mb-2">URL:</p>
                <a 
                  href="/privacy" 
                  className="text-green-600 hover:text-green-700 font-medium text-lg"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  https://aijobsearch.com/privacy
                </a>
              </div>
            </div>

            {/* Terms of Service */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Terms of Service
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                Our terms of service outlining the rules and regulations for using our application.
              </p>
              <div className="bg-white p-4 rounded border">
                <p className="text-sm text-gray-500 mb-2">URL:</p>
                <a 
                  href="/terms" 
                  className="text-purple-600 hover:text-purple-700 font-medium text-lg"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  https://aijobsearch.com/terms
                </a>
              </div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Google OAuth Verification Checklist
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked 
                  readOnly 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"
                />
                <span className="text-gray-700">✓ Home page link provided</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked 
                  readOnly 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"
                />
                <span className="text-gray-700">✓ Privacy policy link provided</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked 
                  readOnly 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"
                />
                <span className="text-gray-700">✓ Terms of service link provided</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked 
                  readOnly 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"
                />
                <span className="text-gray-700">✓ Links are publicly accessible</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked 
                  readOnly 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"
                />
                <span className="text-gray-700">✓ Links are in the application footer</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              For Google OAuth Console
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Application Home Page:
                </p>
                <code className="block bg-white border border-gray-300 rounded px-3 py-2 text-sm">
                  https://aijobsearch.com
                </code>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Privacy Policy URL:
                </p>
                <code className="block bg-white border border-gray-300 rounded px-3 py-2 text-sm">
                  https://aijobsearch.com/privacy
                </code>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Terms of Service URL:
                </p>
                <code className="block bg-white border border-gray-300 rounded px-3 py-2 text-sm">
                  https://aijobsearch.com/terms
                </code>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Need help with Google OAuth verification?
            </p>
            <a 
              href="mailto:support@aijobsearch.com" 
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleVerificationLinks;