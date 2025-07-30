import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  isSignedIn?: boolean;
  onSignOut?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSignedIn = false, onSignOut }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  return (
    <header className="relative z-20 px-4 sm:px-6 py-4 bg-gray-900 border-b border-gray-800">
      <nav className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={handleLogoClick}
        >
          <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          </div>
          <span className="text-xl font-medium text-white">AI Job Agent</span>
        </div>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          {/* <a 
            href="/" 
            className={`transition-colors text-sm ${
              isActive('/') ? 'text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Home
          </a> */}
          {/* <a 
            href="/features" 
            className={`transition-colors text-sm ${
              isActive('/features') ? 'text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Features
          </a> */}
          {/* <a 
            href="/pricing" 
            className={`transition-colors text-sm ${
              isActive('/pricing') ? 'text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Pricing
          </a> */}
          {/* <a 
            href="#" 
            className="text-gray-300 hover:text-white transition-colors text-sm"
          >
            Blog
          </a> */}
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Dashboard
              </button>
              <button
                onClick={onSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleGetStarted}
                className="bg-gray-800 hover:bg-gray-700 px-4 sm:px-6 py-2 rounded-lg transition-colors border border-gray-700 text-sm text-white"
              >
                Get Started
              </button>
              <button
                onClick={handleSignIn}
                className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-3xl transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-base font-medium"
              >
                Sign In
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-300 hover:text-white"
          aria-label="Open mobile menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>
    </header>
  );
};

export default Header;