import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, RotateCcw, Send, Bot, User } from 'lucide-react';
import { API_CONFIG } from '../../src/config/api';

const ChatBotWidget = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1,
      role: 'bot', 
      text: 'Hi! I\'m here to help you understand this job application assistant. Ask me about features, how to use the site, or any questions about the code and functionality!',
      timestamp: new Date()
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [messageIdCounter, setMessageIdCounter] = useState(2);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show welcome message after delay (using state instead of localStorage)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length === 1) {
        setMessages(prev => [...prev, {
          id: messageIdCounter,
          role: 'bot',
          text: 'Welcome! 👋 This is a job application assistant that helps you search for jobs and generate tailored cover letters. Feel free to ask me how anything works!',
          timestamp: new Date()
        }]);
        setMessageIdCounter(prev => prev + 1);
        setHasNewMessage(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendChatbotMessage = async (question) => {
    const API_BASE_URL = `${API_CONFIG.BASE_URL}/api`;
    
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/ask/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.answer || 'Sorry, I couldn\'t generate a response.';
    } catch (error) {
      console.error('Chatbot Error:', error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { 
      id: messageIdCounter,
      role: 'user', 
      text: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setMessageIdCounter(prev => prev + 1);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const answer = await sendChatbotMessage(currentInput);
      const botMsg = { 
        id: messageIdCounter + 1,
        role: 'bot', 
        text: answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setMessageIdCounter(prev => prev + 2);
    } catch (err) {
      console.error('Chatbot Error:', err);
      setMessages(prev => [
        ...prev,
        { 
          id: messageIdCounter + 1,
          role: 'bot', 
          text: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment. You can ask me about features like job searching, email generation, or how to use the authentication system!',
          timestamp: new Date()
        },
      ]);
      setMessageIdCounter(prev => prev + 2);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      { 
        id: 1,
        role: 'bot', 
        text: 'Hi! I\'m here to help you understand this job application assistant. Ask me about features, how to use the site, or any questions about the code and functionality!',
        timestamp: new Date()
      },
    ]);
    setMessageIdCounter(2);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Floating button when chat is closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className={`relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 ${
            hasNewMessage ? 'animate-pulse' : ''
          }`}
        >
          <MessageCircle size={24} />
          {hasNewMessage && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              !
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div 
        ref={chatContainerRef}
        className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl w-96 h-[32rem] flex flex-col overflow-hidden border border-white/20 animate-in slide-in-from-bottom-4 fade-in duration-300"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Assistant</h3>
              <p className="text-xs text-white/80">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearChat}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              title="Clear chat"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={toggleChat}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              title="Close chat"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                }`}
              >
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              {/* Message Bubble */}
              <div className="flex-1 max-w-[80%]">
                <div
                  className={`p-3 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                placeholder="Type your message here..."
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                rows={1}
                style={{ minHeight: '44px' }}
              />
            </div>
            <button
              onClick={handleSend}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              disabled={isLoading || !input.trim()}
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift + Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotWidget;