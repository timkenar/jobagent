import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Search, User, Bot, History, Menu, X, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../../src/contexts/AuthContext';
import { API_ENDPOINTS, apiCall } from '../../src/config/api';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  session_id: string;
  created_at: string;
  last_message_at: string;
  is_active: boolean;
  message_count?: number;
  last_message?: string;
}

interface JobSearchSectionProps {
  jobSearchQuery?: string;
  setJobSearchQuery?: (query: string) => void;
  jobResults?: any[];
  isLoadingSearch?: boolean;
  cvText?: string;
  handleSearchJobs?: () => void;
  handleGenerateEmail?: (job: any) => void;
  isLoadingEmail?: boolean;
  selectedJobForEmail?: any;
  generatedEmail?: any;
  handleCloseModal?: () => void;
  handleCopyToClipboard?: () => void;
  emailCopied?: boolean;
  handleSendEmail?: (recipientEmail: string, subject: string, body: string) => void;
  isEmailSending?: boolean;
  emailSentMessage?: string | null;
}

const JobSearchSection: React.FC<JobSearchSectionProps> = (props) => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Hello, night owl";
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: isAuthenticated 
          ? `Welcome back${user?.full_name ? `, ${user.full_name}` : ''}! I'm your AI job search assistant with access to your profile. I can help you with personalized job searching, CV optimization, interview preparation, and career advice. What would you like to work on today?`
          : `Hello! I'm your AI job search assistant. To provide you with personalized advice based on your CV and experience, please log in to your account. I can help with job searching, CV optimization, interview prep, and career guidance!`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isAuthenticated, user?.full_name, messages.length]);

  // Load chat history
  const loadChatHistory = async () => {
    if (!isAuthenticated) return;

    setIsLoadingHistory(true);
    try {
      const response = await apiCall(API_ENDPOINTS.CHATBOT.HISTORY);
      setChatSessions(response.sessions || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load specific chat session
  const loadSpecificSession = async (sessionId: string) => {
    if (!isAuthenticated) return;

    setIsTyping(true);
    try {
      const response = await apiCall(`${API_ENDPOINTS.CHATBOT.HISTORY}?session_id=${sessionId}`);
      const sessionMessages = response.messages || [];
      
      // Convert backend messages to our Message format
      const convertedMessages: Message[] = sessionMessages.map((msg: any, index: number) => ({
        id: `${sessionId}-${index}`,
        content: msg.content,
        isUser: msg.role === 'user',
        timestamp: new Date(msg.timestamp)
      }));

      setMessages(convertedMessages);
      setCurrentSessionId(sessionId);
      setShowHistory(false);
    } catch (error) {
      console.error('Failed to load session:', error);
      setError('Failed to load chat session');
    } finally {
      setIsTyping(false);
    }
  };

  // Start new chat
  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowHistory(false);
    setError(null);
    
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: 'welcome-new',
      content: isAuthenticated 
        ? `Welcome back${user?.full_name ? `, ${user.full_name}` : ''}! Ready for a new conversation? I'm here to help with your job search, CV optimization, and career advice.`
        : `Hello! Starting a new conversation. Please log in for personalized assistance.`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  // Load history when component mounts
  useEffect(() => {
    if (isAuthenticated && !isLoadingHistory) {
      loadChatHistory();
    }
  }, [isAuthenticated]);

  // Quick action buttons
  const quickActions = [
    { 
      icon: <Search className="w-4 h-4" />, 
      label: "Find Jobs", 
      message: "Help me find job opportunities that match my skills and experience" 
    },
    { 
      icon: <Sparkles className="w-4 h-4" />, 
      label: "Optimize CV", 
      message: "How can I improve my CV to get more job interviews?" 
    },
    { 
      icon: <User className="w-4 h-4" />, 
      label: "Interview Prep", 
      message: "Help me prepare for job interviews with common questions and tips" 
    },
    { 
      icon: <Bot className="w-4 h-4" />, 
      label: "Career Advice", 
      message: "What career paths should I consider based on my background?" 
    }
  ];

  // Real AI response using our enhanced backend
  const generateAIResponse = async (userMessage: string) => {
    if (!isAuthenticated) {
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: "Please log in to access personalized AI assistance. Once logged in, I'll have access to your profile and can provide tailored job search advice!",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      return;
    }

    setIsTyping(true);
    setError(null);
    
    try {
      const requestBody: any = { question: userMessage };
      
      if (currentSessionId) {
        requestBody.session_id = currentSessionId;
      }

      const response = await apiCall(API_ENDPOINTS.CHATBOT.ASK, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update current session ID if provided
      if (response.session_id && !currentSessionId) {
        setCurrentSessionId(response.session_id);
      }
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: response.answer || 'Sorry, I couldn\'t generate a response.',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Refresh chat history to show updated session
      if (isAuthenticated) {
        loadChatHistory();
      }
      
    } catch (error) {
      console.error('AI Response Error:', error);
      setError('Failed to get AI response. Please try again.');
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again in a moment.',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Function to render message with clickable links
  const renderMessageContent = (content: string) => {
    // Regular expression to detect URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    await generateAIResponse(inputMessage);
  };

  const handleQuickAction = (message: string) => {
    setInputMessage(message);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };


  return (
    <section 
      ref={sectionRef} 
      className={`mb-8 p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700 backdrop-blur-md transition-all duration-500 ${
        isExpanded ? 'min-h-[600px]' : 'min-h-[200px]'
      }`}
    >
      {/* History Side Panel - Mobile/Desktop */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden" onClick={() => setShowHistory(false)}>
          <div 
            className="fixed top-0 right-0 h-full w-80 bg-slate-900 shadow-xl transform transition-transform duration-300 ease-in-out border-l border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <History className="w-5 h-5" />
                Chat History
              </h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-full">
              {/* New Chat Button */}
              <button
                onClick={startNewChat}
                className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg text-white font-medium flex items-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                New Chat
              </button>
              
              {/* Chat Sessions */}
              {isLoadingHistory ? (
                <div className="text-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-slate-400 text-sm mt-2">Loading history...</p>
                </div>
              ) : chatSessions.length > 0 ? (
                chatSessions.map((session) => (
                  <button
                    key={session.session_id}
                    onClick={() => loadSpecificSession(session.session_id)}
                    className={`w-full p-3 text-left rounded-lg transition-all hover:bg-slate-700 border ${
                      currentSessionId === session.session_id 
                        ? 'bg-slate-700 border-green-500' 
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {session.last_message || 'New conversation'}
                        </p>
                        <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(session.last_message_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
                        {session.message_count || 0}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chat history yet</p>
                  <p className="text-xs mt-1">Start a conversation to see it here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop History Panel */}
      {showHistory && (
        <div className="hidden lg:block fixed top-0 right-0 h-full w-80 bg-slate-900 shadow-xl z-40 border-l border-slate-700">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <History className="w-5 h-5" />
              Chat History
            </h3>
            <button 
              onClick={() => setShowHistory(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 h-full">
            {/* New Chat Button */}
            <button
              onClick={startNewChat}
              className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg text-white font-medium flex items-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              New Chat
            </button>
            
            {/* Chat Sessions */}
            {isLoadingHistory ? (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-slate-400 text-sm mt-2">Loading history...</p>
              </div>
            ) : chatSessions.length > 0 ? (
              chatSessions.map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => loadSpecificSession(session.session_id)}
                  className={`w-full p-3 text-left rounded-lg transition-all hover:bg-slate-700 border ${
                    currentSessionId === session.session_id 
                      ? 'bg-slate-700 border-green-500' 
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {session.last_message || 'New conversation'}
                      </p>
                      <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(session.last_message_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
                      {session.message_count || 0}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chat history yet</p>
                <p className="text-xs mt-1">Start a conversation to see it here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2 tracking-tight">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7L12 2z"/>
            </svg>
          </div>
          Job Search Assistant
        </h2>
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Logged in as {user?.full_name || 'User'}</span>
              </div>
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 font-medium">Profile Active</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-400 font-medium">Please log in</span>
            </div>
          )}
          
          {/* History Button */}
          {isAuthenticated && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700"
              title="Chat History"
            >
              <History className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg 
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className={`transition-all duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        <div className="h-96 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-light text-white mb-2">
                  {getGreeting()}, {isAuthenticated ? user?.full_name || 'there' : 'job seeker'}
                </h3>
                <p className="text-slate-400">
                  {isAuthenticated 
                    ? "I have access to your profile and can provide personalized advice!"
                    : "Please log in for personalized job search assistance."
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-3 rounded-2xl ${
                      message.isUser
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-700 text-slate-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {renderMessageContent(message.content)}
                    </div>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-md px-4 py-3 rounded-2xl bg-slate-700 text-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-slate-400">Assistant is typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions - Always visible */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleQuickAction(action.message)}
            className="flex flex-col items-center space-y-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all duration-200 border border-slate-700 hover:border-slate-600"
          >
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-slate-300">
              {action.icon}
            </div>
            <span className="text-xs font-medium text-slate-300 text-center">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="relative">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          onFocus={() => !isExpanded && setIsExpanded(true)}
          placeholder={isAuthenticated ? "Ask me anything about your job search..." : "Please log in to access AI assistance..."}
          className="w-full p-4 pr-12 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none"
          disabled={!isAuthenticated}
          rows={1}
          style={{ minHeight: '50px' }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isTyping || !isAuthenticated}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </section>
  );
};

export default JobSearchSection;