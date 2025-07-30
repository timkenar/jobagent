
import React, { useState, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import AIFeaturesSection from './AIFeaturesSection';
import TestimonialsSection from './testimonials-section';
import { Wifi, Battery, Signal, ChevronLeft, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  const [query, setQuery] = useState('');
  const [greeting, setGreeting] = useState('');

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  };

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollProgress = Math.min(scrollY / (windowHeight * 0.8), 1);
      
      // Get the light elements
      const primaryLight = document.querySelector('.scroll-light') as HTMLElement;
      const secondaryLight = document.querySelector('.scroll-light-secondary') as HTMLElement;
      const tertiaryLight = document.querySelector('.scroll-light-tertiary') as HTMLElement;
      
      if (primaryLight && secondaryLight && tertiaryLight) {
        // Primary light movement with scroll
        const primaryX = 50 + (scrollProgress * 20) - 10; // Move right and slightly back
        const primaryY = 50 + (Math.sin(scrollProgress * Math.PI) * 15); // Sine wave movement
        
        // Secondary light movement (opposite direction)
        const secondaryX = 60 - (scrollProgress * 15);
        const secondaryY = 40 + (scrollProgress * 25);
        
        // Tertiary light movement (slower, different pattern)
        const tertiaryX = 40 + (Math.cos(scrollProgress * Math.PI * 2) * 10);
        const tertiaryY = 60 - (scrollProgress * 10);
        
        // Apply transformations
        primaryLight.style.left = `${primaryX}%`;
        primaryLight.style.top = `${primaryY}%`;
        primaryLight.style.opacity = `${0.2 + (scrollProgress * 0.1)}`;
        
        secondaryLight.style.left = `${secondaryX}%`;
        secondaryLight.style.top = `${secondaryY}%`;
        secondaryLight.style.opacity = `${0.15 + (scrollProgress * 0.08)}`;
        
        tertiaryLight.style.left = `${tertiaryX}%`;
        tertiaryLight.style.top = `${tertiaryY}%`;
        tertiaryLight.style.opacity = `${0.1 + (scrollProgress * 0.05)}`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRunClick = () => {
    if (query) {
      onGetStarted();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 border border-gray-700 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 border border-gray-700 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] border border-gray-800 rounded-full"></div>
      </div>



      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6">
        <div className="text-center max-w-7xl mx-auto w-full">
          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-full px-3 py-1.5 mb-6 animate-fade-in">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Lifetime updates</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-slide-up">
            <span className="inline-block animate-fade-in-delay-1">Unleash</span>{' '}
            <span className="inline-block animate-fade-in-delay-2">the</span>{' '}
            <span className="inline-block animate-fade-in-delay-3">Power</span>{' '}
            <span className="inline-block animate-fade-in-delay-4">of</span>{' '}
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent inline-block animate-fade-in-delay-5">
              AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up-delay">
            AI Job Agent is an AI-powered career companion that allows users to have 
            intelligent conversations with a virtual assistant.
          </p>

          {/* Chat Input */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-4 border border-gray-700 mb-8 max-w-xl mx-auto animate-scale-in">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">{greeting}! How can I help you today?</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Find remote software engineering jobs in AI startups..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-600 rounded-3xl px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
              />
              <button
                onClick={handleRunClick}
                className="bg-green-400 hover:bg-green-500 text-gray-900 px-4 py-2 rounded-3xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-1 text-sm"
              >
                <span>Run</span>
                <PaperAirplaneIcon className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Interface Preview Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full mb-16 relative">
            {/* Glowing Light Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div 
                className="scroll-light absolute w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-1000 ease-out"
                style={{
                  background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(59, 130, 246, 0.3) 40%, rgba(168, 85, 247, 0.2) 70%, transparent 100%)',
                  transform: 'translate(-50%, -50%)',
                  left: '50%',
                  top: '50%',
                }}
              />
              <div 
                className="scroll-light-secondary absolute w-64 h-64 rounded-full opacity-15 blur-2xl transition-all duration-1500 ease-out"
                style={{
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 100%)',
                  transform: 'translate(-50%, -50%)',
                  left: '60%',
                  top: '40%',
                }}
              />
              <div 
                className="scroll-light-tertiary absolute w-48 h-48 rounded-full opacity-10 blur-xl transition-all duration-2000 ease-out"
                style={{
                  background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, rgba(168, 85, 247, 0.1) 70%, transparent 100%)',
                  transform: 'translate(-50%, -50%)',
                  left: '40%',
                  top: '60%',
                }}
              />
            </div>
            
            {/* Desktop Interface */}
            <div className="animate-slide-in-up">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-2xl max-w-4xl mx-auto" style={{aspectRatio: '16/10', minHeight: '600px'}}>
                <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl" style={{aspectRatio: '16/10', minHeight: '500px'}}>
                  {/* Browser Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700">
              <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700">
              <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="flex-1 max-w-md mx-4">
                      <div className="bg-gray-700 rounded-full px-4 py-2 text-center border border-gray-600">
                        <span className="text-sm text-gray-300">🔒 ai-job-agent.ai</span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Sidebar */}
                  <div className="flex" style={{minHeight: '450px'}}>
                    <div className="w-48 bg-gray-800 border-r border-gray-700 p-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                          </svg>
                        </div>
                        <span className="text-white text-sm font-medium">{greeting} </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-green-400 bg-gray-700 p-2 rounded-lg text-sm">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span>Ask the AI</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400 p-2 hover:bg-gray-700 rounded-lg cursor-pointer text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>History</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400 p-2 hover:bg-gray-700 rounded-lg cursor-pointer text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Recruiters</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400 p-2 hover:bg-gray-700 rounded-lg cursor-pointer text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Account</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Main Chat Area */}
                    <div className="flex-1 p-6">
                      <div className="mb-6">
                        <h2 className="text-white text-lg font-semibold mb-3">How can I help you today?</h2>
                        <div className="border-t border-gray-700 pt-4">
                          {/* <div className="text-sm text-gray-500 uppercase tracking-wide mb-3">LinkedIn</div> */}
                          <div className="space-y-2">
                            {/* <div className="text-gray-300 text-sm hover:text-white cursor-pointer p-2 hover:bg-gray-800 rounded">
                              Explain quantum computing
                            </div> */}
                            {/* <div className="text-gray-300 text-sm hover:text-white cursor-pointer p-2 hover:bg-gray-800 rounded">
                              How do I make HTTP request in Javascript?
                            </div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Interface */}
            <div className="flex justify-center animate-slide-in-right">
              <div className="w-80 bg-black rounded-[3rem] overflow-hidden border-4 border-gray-800 shadow-2xl animate-float" style={{aspectRatio: '9/19.5', minHeight: '650px'}}>
                {/* Phone Notch */}
                <div className="bg-black px-6 py-2 flex justify-center">
                  <div className="w-16 h-1.5 bg-gray-700 rounded-full"></div>
                </div>
                
                {/* Status Bar */}
                <div className="bg-gray-900 px-4 py-2 flex justify-between items-center text-white text-sm font-medium">
                    {/* Left side - Time */}
                    <div className="flex items-center">
                      <span className="font-semibold">9:41</span>
                    </div>
                    
                    {/* Right side - Status icons */}
                    <div className="flex items-center space-x-2">
                      {/* Signal strength */}
                      <div className="flex items-center space-x-1">
                        <Signal size={14} className="opacity-90" />
                        <span className="text-xs opacity-90">5G</span>
                      </div>
                      
                      {/* WiFi */}
                      <Wifi size={14} className="opacity-90" />
                      
                      {/* Battery percentage */}
                      <div className="flex items-center space-x-1">
                        <Battery size={14} className="opacity-90" />
                        <span className="text-xs font-medium">100%</span>
                      </div>
                    </div>
                  </div>
                
                {/* App Content */}
                <div className="bg-gray-900 flex-1 relative" style={{minHeight: '550px'}}>
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                      </div>
                      <span className="text-white text-sm font-medium">{greeting}, Job Seeker</span>
                    </div>
                    <button className="p-1">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Chat Content */}
                  <div className="p-4 space-y-4">
                    <div className="text-center">
                      <h2 className="text-white text-lg font-semibold mb-2">How can I help you today?</h2>
                    </div>
                    
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      {/* <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">Latest activity</div> */}
                      <div className="space-y-2">
                        {/* <div className="text-gray-300 text-sm">Explain quantum computing</div> */}
                        <div className="text-gray-300 text-sm">Help me customize my CV</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Input Area */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Is My CV ATS Compliant?"
                        className="w-3/4 flex-1 bg-gray-800 border border-gray-600 rounded-2xl px-4 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-green-400"
                      />
                      <button className ="bg-green-400 text-gray-900 px-4 py-2 rounded-2xl text-sm font-medium">
                        Run
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Home Indicator */}
                <div className="bg-black px-6 py-2 flex justify-center">
                  <div className="w-20 h-1 bg-gray-700 rounded-full"></div>
                </div>
              </div>
            </div>

          </div>

          <AIFeaturesSection />
         
          

          {/* Features Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Powerful Features to Accelerate Your Career
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Our AI-powered platform provides everything you need to find and land your dream job faster than ever before.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* AI-Powered Matching */}
              <div className="text-center bg-gray-800/40 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl group">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">AI-Powered Matching</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Get personalized job recommendations based on your skills, experience, and career aspirations using advanced AI algorithms.
                </p>
                <button
                  onClick={onGetStarted}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-3xl font-medium transition-all duration-300 hover:scale-105 text-sm w-full shadow-lg hover:shadow-xl"
                >
                  Try AI Matching
                </button>
              </div>

              {/* Automated Applications */}
              <div className="text-center bg-gray-800/40 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl group">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Automated Applications</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Save time with intelligent application automation and personalized cover letters tailored to each position.
                </p>
                <button
                  onClick={onGetStarted}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-3xl font-medium transition-all duration-300 hover:scale-105 text-sm w-full shadow-lg hover:shadow-xl"
                >
                  Automate Applications
                </button>
              </div>

              {/* Smart Analytics */}
              <div className="text-center bg-gray-800/40 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl group">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Smart Analytics</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Track your application progress and get insights to improve your success rate with detailed performance metrics.
                </p>
                <button
                  onClick={onGetStarted}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-3xl font-medium transition-all duration-300 hover:scale-105 text-sm w-full shadow-lg hover:shadow-xl"
                >
                  View Analytics
                </button>
              </div>

              {/* 24/7 Support */}
              <div className="text-center bg-gray-800/40 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl group">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">24/7 AI Support</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Get instant answers to your career questions with our AI assistant available around the clock for guidance.
                </p>
                <button
                  onClick={onGetStarted}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-3xl font-medium transition-all duration-300 hover:scale-105 text-sm w-full shadow-lg hover:shadow-xl"
                >
                  Get Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Testimonials Section */}
      
       <TestimonialsSection />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        .animate-fade-in-delay-1 { animation: fadeIn 0.8s ease-out 0.2s backwards; }
        .animate-fade-in-delay-2 { animation: fadeIn 0.8s ease-out 0.4s backwards; }
        .animate-fade-in-delay-3 { animation: fadeIn 0.8s ease-out 0.6s backwards; }
        .animate-fade-in-delay-4 { animation: fadeIn 0.8s ease-out 0.8s backwards; }
        .animate-fade-in-delay-5 { animation: fadeIn 0.8s ease-out 1s backwards; }
        .animate-slide-up { animation: slideInUp 0.8s ease-out; }
        .animate-slide-up-delay { animation: slideInUp 0.8s ease-out 0.3s backwards; }
        .animate-scale-in { animation: scaleIn 0.8s ease-out 0.6s backwards; }
        .animate-slide-in-left { animation: slideInLeft 0.8s ease-out 0.8s backwards; }
        .animate-slide-in-up { animation: slideInUp 0.8s ease-out 1s backwards; }
        .animate-slide-in-right { animation: slideInRight 0.8s ease-out 1.2s backwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        @keyframes scroll-right {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(300%) translateY(300%) rotate(45deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            transform: scale(1) translate(-50%, -50%);
            opacity: 0.2;
          }
          50% { 
            transform: scale(1.1) translate(-50%, -50%);
            opacity: 0.3;
          }
        }
        
        .animate-scroll-right { animation: scroll-right 30s linear infinite; }
        
        .scroll-light {
          animation: pulse-glow 4s ease-in-out infinite;
        }
        
        .scroll-light-secondary {
          animation: pulse-glow 5s ease-in-out infinite 1s;
        }
        
        .scroll-light-tertiary {
          animation: pulse-glow 6s ease-in-out infinite 2s;
        }
        
        .scroll-light::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
          animation: shine 3s ease-in-out infinite;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;