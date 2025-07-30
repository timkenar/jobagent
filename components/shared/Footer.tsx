import React from 'react';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 mt-20 border-t border-gray-800 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">AI Job Agent</span>
            </div>
            <p className="text-gray-400 text-sm mb-4 max-w-md">
              Your Smart Career Companion - Revolutionizing job search with AI-powered automation.
            </p>
            <div className="bg-gray-800 p-3 rounded-2xl border border-gray-700">
              <p className="text-sm text-gray-300">
                🚀 Proudly developed by{' '}
                <a 
                  href="https://ngazi.co.ke" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-400 hover:underline font-semibold"
                >
                  Ngazi Technologies
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="mailto:support@ngazi.co.ke" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Connect
            </h3>
            <div className="flex space-x-4 mb-4">
              <a
                href="https://twitter.com/ngazi_official"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/ngazi-technologies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com/ngazitechnologies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/254798387784"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-5 h-5" />
              </a>
            </div>
            <div className="text-sm text-gray-400">
              <p>support@ngazi.co.ke</p>
              <p>Nairobi, Kenya</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} AI Job Agent. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-4 md:mt-0">
              <span>Made in Kenya 🇰🇪</span>
              <span>•</span>
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;