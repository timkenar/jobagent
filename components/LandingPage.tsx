import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import gsap from 'gsap';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

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
            <div className="flex items-center space-x-2 sm:space-x-3">
              <PaperAirplaneIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 transition-transform duration-300 hover:scale-110" />
              <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                AI Job Agent
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
      <section ref={ctaRef} className="py-12 sm:py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative z-10">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <PaperAirplaneIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 transition-transform duration-300 hover:scale-110" />
              <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                AI Job Agent
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
              Your Smart Career Companion - Powered by NGAZI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
