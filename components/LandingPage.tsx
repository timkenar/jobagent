import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import gsap from 'gsap';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import Image from 'next/image'; // Import Next.js Image component
interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

// If you have your own image in the assets folder, 
// make sure the path in the <Image src="/assets/icon.svg" ... /> matches your image file.
// For example, if your image is "my-logo.png", update as follows:
// <Image src="/assets/my-logo.png" alt="AI Job Agent Logo" ... />

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  const [currentExample, setCurrentExample] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [input, setInput] = useState('');

  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const examples = [
    "Find remote software engineering jobs",
    "Search for data science positions in tech",
    "Look for UX designer roles at startups",
    "Find marketing manager opportunities",
    "Search for product manager positions"
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 12 ? "Good morning" :
      hour < 18 ? "Good afternoon" : 
      "Good evening"
    );

    // Animate title words
    if (titleRef.current) {
      const words = titleRef.current.querySelectorAll('span');
      gsap.fromTo(words, 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.2, 
          ease: 'power3.out',
          delay: 0.2
        }
      );
    }

    // Animate sections
    gsap.set([heroRef.current, featuresRef.current, demoRef.current, ctaRef.current], {
      opacity: 0,
      y: 60
    });

    gsap.to(heroRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out'
    });

    gsap.to(featuresRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: 0.3,
      ease: 'power3.out'
    });

    gsap.to(demoRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: 0.6,
      ease: 'power3.out'
    });

    gsap.to(ctaRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: 0.9,
      ease: 'power3.out'
    });

    // Rotate example queries
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % examples.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [examples.length]);

  const handleRunClick = () => {
    setShowLoginPrompt(true);
    setTimeout(() => {
      const prompt = document.getElementById('login-prompt');
      if (prompt) {
        gsap.fromTo(prompt, 
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );
      }
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="min-h-screen bg-[#d4e2f4] dark:bg-black transition-colors duration-300 relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-30"
      >
        <source src="https://pixabay.com/videos/computers-office-desk-windows-rain-150883" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#d4e2f4]/80 dark:bg-black/80"></div>

      <header className="relative z-10 bg-white/20 dark:bg-white/5 backdrop-blur-md border-b border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center gap-0 sm:gap-0.5">
              <Image
              src="/assets/icon.svg"
              alt="AI Job Agent Logo"
              width={32}
              height={32}
              className="w-10 h-10 sm:w-10 sm:h-10"
              priority
              />
              <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">AI Job Agent
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={onSignIn}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                Sign In
              </button>
              <button
                onClick={onGetStarted}
                className="px-4 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      <section ref={heroRef} className="relative py-12 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 ref={titleRef} className="text-3xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
              <span>Your</span> <span>Smart</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {' '}Career
              </span> <span>Companion</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 leading-relaxed px-4 sm:px-0">
              Discover your next opportunity with AI-powered job search. Get personalized recommendations, 
              automated applications, and Email tracking with insights.
            </p>
            
            <div className="max-w-2xl mx-auto mb-8 sm:mb-12 px-4 sm:px-0">
              <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/20 dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">AI Job Agent</span>
                </div>
                
                <div className="text-left">
                  <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-4">
                    {greeting}, how can I help you today?
                  </p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 sm:p-4 mb-4 border border-blue-200 dark:border-blue-800">
                    <input
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      placeholder={examples[currentExample]}
                      className="w-full bg-transparent text-sm sm:text-base text-gray-700 dark:text-gray-300 outline-none"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleRunClick}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                    >
                      <span>Run</span>
                      <PaperAirplaneIcon className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 hover:rotate-45" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {showLoginPrompt && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div
                  id="login-prompt"
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PaperAirplaneIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 transition-transform duration-300 hover:scale-110" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Ready to get started?
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
                      Sign up or sign in to start your AI-powered job search journey
                    </p>
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={() => {
                          setShowLoginPrompt(false);
                          onGetStarted();
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-3 px-6 rounded-full font-medium transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                      >
                        Sign Up
                      </button>
                      <button
                        onClick={() => {
                          setShowLoginPrompt(false);
                          onSignIn();
                        }}
                        className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2.5 sm:py-3 px-6 rounded-full font-medium transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                      >
                        Sign In
                      </button>
                    </div>
                    <button
                      onClick={() => setShowLoginPrompt(false)}
                      className="mt-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs sm:text-sm rounded-full px-4 py-2 transition-colors"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section ref={featuresRef} className="py-12 sm:py-20 bg-white/20 dark:bg-white/5 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose AI Job Agent?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 px-4 sm:px-0">
              Powered by advanced AI to supercharge your job search
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 dark:border-white/10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                AI-Powered Matching
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Get personalized job recommendations based on your skills, experience, and career goals.
              </p>
            </div>
            
            <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 dark:border-white/10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Automated Applications
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Save time with intelligent application automation and personalized cover letters.
              </p>
            </div>
            
            <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 dark:border-white/10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Smart Analytics
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Track your application progress and get insights to improve your success rate.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section ref={demoRef} className="py-12 sm:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              See AI Job Agent in Action
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 px-4 sm:px-0">
              Experience the future of job searching
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 dark:border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div className="order-2 md:order-1">
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Conversational Job Search
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
                    Simply describe what you're looking for in natural language. Our AI understands context, 
                    preferences, and requirements to find the perfect matches.
                  </p>
                  <button
                    onClick={handleRunClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                  >
                    Try It Now
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 order-1 md:order-2">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">AI</span>
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-2 sm:p-3 flex-1">
                        <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                          I found 127 remote software engineering positions matching your criteria. 
                          Would you like me to filter by company size or salary range?
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 sm:space-x-3 justify-end">
                      <div className="bg-blue-600 text-white rounded-lg p-2 sm:p-3 max-w-xs">
                        <p className="text-xs sm:text-sm">Show me positions at startups with 100-500 employees</p>
                      </div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium">You</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
            {/* To change the color gradient in this section */}
      <section
        ref={ctaRef}
        className="py-12 sm:py-20 bg-gradient-to-r from-[#072144] via-[#072144] to-[#072144] relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Transform Your Job Search?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4 sm:px-0">
              Join thousands of professionals who've found their dream jobs with AI Job Agent
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Get Started Free
              </button>
              <button
                onClick={onSignIn}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white/20 dark:bg-white/5 backdrop-blur-md border-t border-white/20 dark:border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                <Image
                  src="/assets/icon.svg"
                  alt="AI Job Agent Logo"
                  width={32}
                  height={32}
                  className="w-6 h-6 sm:w-8 sm:h-8"
                  priority
                />
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  AI Job Agent
                </span>
                </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-4 max-w-md">
                Your Smart Career Companion - Revolutionizing job search with AI-powered automation, 
                personalized recommendations, and intelligent application tracking.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  🚀 Proudly developed by{' '}
                  <a 
                    href="https://ngazi.co.ke" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                  >
                    Ngazi Technologies
                  </a>
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/privacy" 
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a 
                    href="/terms" 
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a 
                    href="/subscriptions/plans" 
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                  >
                    Pricing Plans
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:support@ngazi.co.ke" 
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                  >
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media & Contact */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                Connect With Us
              </h3>
              
              {/* Social Media Icons */}
              <div className="flex space-x-4 mb-4">
                {/* Twitter/X */}
                <a
                  href="https://twitter.com/ngazi_official" // Placeholder - replace with actual URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/company/ngazi-technologies" // Placeholder - replace with actual URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                
                {/* Facebook */}
                <a
                  href="https://web.facebook.com/profile.php?id=61574621859875#" // Placeholder - replace with actual URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                
                {/* Instagram */}
                <a
                  href="https://instagram.com/ngazitechnologies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-pink-500 transition-colors"
                >
                  <FaInstagram className="w-5 h-5" />
                </a>
                {/* WhatsApp */}
                  <a
                    href="https://wa.me/254798387784" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-green-500 transition-colors"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                  </a>
                                                
                {/* YouTube */}
                {/* <a
                  href="https://youtube.com/@ngazitech" // Placeholder - replace with actual URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a> */}
              </div>
              
              {/* Contact Information */}
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Email:</strong> support@ngazi.co.ke
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Website:</strong>{' '}
                  <a 
                    href="https://ngazi.co.ke" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    ngazi.co.ke
                  </a>
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Location:</strong> Nairobi, Kenya
                </p>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-white/20 dark:border-white/10 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  © 2025 AI Job Agent. All rights reserved.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Developed by{' '}
                  <a 
                    href="https://ngazi.co.ke" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Ngazi Technologies
                  </a>
                </p>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Made in Kenya 🇰🇪</span>
                <span>•</span>
                <span>Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
