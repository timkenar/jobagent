import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, Info } from 'lucide-react';

interface CookieConsentProps {
  onAccept?: () => void;
  onReject?: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onReject }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consentChoice = localStorage.getItem('cookieConsent');
    if (!consentChoice) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
    onAccept?.();
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
    onReject?.();
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Cookie Consent Banner */}
      <div className={`fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 transition-all duration-300 transform ${
        isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-95'
      }`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cookie className="w-6 h-6" />
                <h3 className="font-semibold text-lg">Cookie Notice</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close cookie notice"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start space-x-3 mb-4">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  We use cookies to enhance your experience on our website. Cookies help us analyze 
                  website traffic, personalize content, and provide better services.
                </p>
              </div>
            </div>

            {/* Privacy Info */}
            <div className="flex items-start space-x-3 mb-6">
              <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Your privacy is important to us. You can manage your cookie preferences at any time.
                  <a 
                    href="/privacy" 
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ml-1 underline"
                  >
                    Learn more
                  </a>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Cookie className="w-4 h-4" />
                <span>Accept All Cookies</span>
              </button>
              
              <button
                onClick={handleReject}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Reject All
              </button>
            </div>

            {/* Additional Options */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex flex-wrap gap-2 text-xs">
                <a 
                  href="/privacy" 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Privacy Policy
                </a>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <a 
                  href="/terms" 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Terms of Service
                </a>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <button 
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Manage Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;