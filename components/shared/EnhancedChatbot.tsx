import React, { useState, useEffect, useRef } from 'react';
import { useGmail } from '../../src/contexts/GmailContext';
import { useAuth } from '../../src/contexts/AuthContext';
import gmailService from '../../src/services/gmailService';
import { API_ENDPOINTS, apiCall } from '../../src/config/api';

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  type?: 'text' | 'gmail_search' | 'email_list' | 'email_stats' | 'email_analysis';
  emails?: any[];
  stats?: any;
  analysis?: any;
}

interface ChatSession {
  session_id: string;
  created_at: string;
  last_message_at: string;
  is_active: boolean;
  message_count?: number;
  last_message?: string;
}

const EnhancedChatbot: React.FC = () => {
  const gmail = useGmail();
  const { user, isAuthenticated } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1,
      role: 'bot', 
      text: `Hi! I'm your AI assistant with Gmail access! I can help you with:\n\n📧 Search Gmail emails\n📊 Analyze email patterns\n📈 Get email statistics\n🔍 Find specific types of emails\n\nTry: "show me recent recruiter emails" or "analyze my job emails"`,
      timestamp: new Date()
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [messageIdCounter, setMessageIdCounter] = useState(2);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const detectEmailIntent = (message: string): { 
    type: 'search' | 'stats' | 'analysis' | 'recruiters' | 'interviews' | 'offers' | 'rejections' | 'none';
    query?: string;
    timeframe?: number;
  } => {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific email types
    if (lowerMessage.includes('recruiter')) {
      return { type: 'recruiters', timeframe: 30 };
    }
    if (lowerMessage.includes('interview')) {
      return { type: 'interviews' };
    }
    if (lowerMessage.includes('offer') && lowerMessage.includes('email')) {
      return { type: 'offers' };
    }
    if (lowerMessage.includes('rejection') || lowerMessage.includes('rejected')) {
      return { type: 'rejections' };
    }
    
    // Check for stats requests
    const statsKeywords = ['stats', 'statistics', 'summary', 'overview', 'how many'];
    if (statsKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { type: 'stats' };
    }
    
    // Check for analysis requests
    const analysisKeywords = ['analyze', 'analysis', 'insights', 'patterns'];
    if (analysisKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { type: 'analysis' };
    }
    
    // Check for general search
    const searchKeywords = ['search', 'find', 'show', 'get', 'fetch'];
    const emailKeywords = ['email', 'gmail', 'message'];
    
    if (searchKeywords.some(s => lowerMessage.includes(s)) && 
        emailKeywords.some(e => lowerMessage.includes(e))) {
      
      // Extract search query
      let query = message;
      searchKeywords.forEach(keyword => {
        const keywordIndex = lowerMessage.indexOf(keyword);
        if (keywordIndex !== -1) {
          query = message.substring(keywordIndex + keyword.length).trim();
        }
      });
      
      // Clean up query
      query = query.replace(/\b(gmail|emails?|messages?|for|in|from|about)\b/gi, '').trim();
      
      return { 
        type: 'search', 
        query: query || 'job OR application OR interview OR recruiter' 
      };
    }
    
    return { type: 'none' };
  };

  const sendChatbotMessage = async (question: string) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to use the AI assistant');
    }

    try {
      const requestBody: any = { question };
      
      if (currentSessionId) {
        requestBody.session_id = currentSessionId;
      }

      const response = await apiCall(API_ENDPOINTS.CHATBOT.ASK, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update current session ID if provided
      if (response.session_id && !currentSessionId) {
        setCurrentSessionId(response.session_id);
      }
      
      return response.answer || 'Sorry, I couldn\'t generate a response.';
    } catch (error) {
      console.error('Chatbot Error:', error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { 
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
      // Check if this is an email-related request
      const emailIntent = detectEmailIntent(currentInput);
      
      if (emailIntent.type !== 'none') {
        // Check if Gmail is connected
        if (!gmail.isGmailConnected) {
          const botMsg: Message = {
            id: messageIdCounter + 1,
            role: 'bot',
            text: 'I\'d love to help you with your emails, but I don\'t see any connected Gmail accounts. Please connect your Gmail account first through the Email Integration section.',
            timestamp: new Date(),
            type: 'text'
          };
          setMessages(prev => [...prev, botMsg]);
          setMessageIdCounter(prev => prev + 2);
          return;
        }

        try {
          let botMsg: Message;

          switch (emailIntent.type) {
            case 'search':
              const emails = await gmail.searchEmails(emailIntent.query || 'job', 10);
              botMsg = {
                id: messageIdCounter + 1,
                role: 'bot',
                text: `I found ${emails.length} emails matching "${emailIntent.query}". Here are the results:`,
                timestamp: new Date(),
                type: 'email_list',
                emails: emails
              };
              break;

            case 'recruiters':
              const recruiterEmails = await gmailService.getRecruiterEmails(gmail.gmailAccount!.id, emailIntent.timeframe);
              botMsg = {
                id: messageIdCounter + 1,
                role: 'bot',
                text: `I found ${recruiterEmails.length} emails from recruiters in the last ${emailIntent.timeframe || 30} days:`,
                timestamp: new Date(),
                type: 'email_list',
                emails: recruiterEmails
              };
              break;

            case 'interviews':
              const interviewEmails = await gmailService.getInterviewEmails(gmail.gmailAccount!.id);
              botMsg = {
                id: messageIdCounter + 1,
                role: 'bot',
                text: `I found ${interviewEmails.length} interview-related emails:`,
                timestamp: new Date(),
                type: 'email_list',
                emails: interviewEmails
              };
              break;

            case 'offers':
              const offerEmails = await gmailService.getOfferEmails(gmail.gmailAccount!.id);
              botMsg = {
                id: messageIdCounter + 1,
                role: 'bot',
                text: `I found ${offerEmails.length} job offer emails:`,
                timestamp: new Date(),
                type: 'email_list',
                emails: offerEmails
              };
              break;

            case 'rejections':
              const rejectionEmails = await gmailService.getRejectionEmails(gmail.gmailAccount!.id);
              botMsg = {
                id: messageIdCounter + 1,
                role: 'bot',
                text: `I found ${rejectionEmails.length} rejection emails:`,
                timestamp: new Date(),
                type: 'email_list',
                emails: rejectionEmails
              };
              break;

            case 'stats':
              const stats = await gmailService.getEmailStats(gmail.gmailAccount!.id);
              botMsg = {
                id: messageIdCounter + 1,
                role: 'bot',
                text: 'Here\'s a summary of your job-related emails:',
                timestamp: new Date(),
                type: 'email_stats',
                stats: stats
              };
              break;

            case 'analysis':
              const analysisEmails = await gmailService.getJobRelatedEmails(gmail.gmailAccount!.id, 50);
              // Simple analysis based on email data
              const analysis = {
                totalEmails: analysisEmails.length,
                companiesContacted: new Set(analysisEmails.map(e => e.sender.split('@')[1])).size,
                mostActiveCompany: analysisEmails.reduce((acc: Record<string, number>, email: any) => {
                  const domain = email.sender.split('@')[1];
                  acc[domain] = (acc[domain] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              };
              
              botMsg = {
                id: messageIdCounter + 1,
                role: 'bot',
                text: 'Here\'s an analysis of your job search emails:',
                timestamp: new Date(),
                type: 'email_analysis',
                analysis: analysis
              };
              break;

            default:
              // Fallback to general search
              const defaultEmails = await gmail.fetchEmails();
              botMsg = {
                id: messageIdCounter + 1,
                role: 'bot',
                text: `Here are your recent emails:`,
                timestamp: new Date(),
                type: 'email_list',
                emails: defaultEmails.slice(0, 5)
              };
          }
          
          setMessages(prev => [...prev, botMsg]);
          setMessageIdCounter(prev => prev + 2);
        } catch (error) {
          console.error('Email operation error:', error);
          const botMsg: Message = {
            id: messageIdCounter + 1,
            role: 'bot',
            text: 'Sorry, I encountered an error while accessing your emails. Please make sure your Gmail account is properly connected and try again.',
            timestamp: new Date(),
            type: 'text'
          };
          setMessages(prev => [...prev, botMsg]);
          setMessageIdCounter(prev => prev + 2);
        }
      } else {
        // Check if user is authenticated for AI assistant
        if (!isAuthenticated) {
          const botMsg: Message = {
            id: messageIdCounter + 1,
            role: 'bot',
            text: 'Please log in to use the AI assistant. The AI can provide personalized job search advice based on your profile!',
            timestamp: new Date(),
            type: 'text'
          };
          setMessages(prev => [...prev, botMsg]);
          setMessageIdCounter(prev => prev + 2);
          return;
        }

        // Regular chatbot response with user context
        const answer = await sendChatbotMessage(currentInput);
        const botMsg: Message = {
          id: messageIdCounter + 1,
          role: 'bot',
          text: answer,
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, botMsg]);
        setMessageIdCounter(prev => prev + 2);
      }
    } catch (error) {
      const errorMsg: Message = {
        id: messageIdCounter + 1,
        role: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMsg]);
      setMessageIdCounter(prev => prev + 2);
    } finally {
      setIsLoading(false);
    }
  };


  const loadChatHistory = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await apiCall(API_ENDPOINTS.CHATBOT.HISTORY);
      setChatSessions(response.sessions || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const loadSpecificSession = async (sessionId: string) => {
    if (!isAuthenticated) return;

    try {
      const response = await apiCall(`${API_ENDPOINTS.CHATBOT.HISTORY}?session_id=${sessionId}`);
      const sessionMessages = response.messages || [];
      
      // Convert backend messages to our Message format
      const convertedMessages: Message[] = sessionMessages.map((msg: any, index: number) => ({
        id: index + 1,
        role: msg.role === 'assistant' ? 'bot' : 'user',
        text: msg.content,
        timestamp: new Date(msg.timestamp),
        type: 'text'
      }));

      setMessages(convertedMessages);
      setCurrentSessionId(sessionId);
      setMessageIdCounter(convertedMessages.length + 1);
      setShowHistory(false);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const startNewChat = () => {
    const welcomeMessage = isAuthenticated 
      ? `Hi ${user?.full_name || 'there'}! I'm your AI assistant with access to your profile. I can help you with job searching, career advice, email management, and more! I can see you have uploaded your CV and can provide personalized advice.`
      : 'Hi! I\'m your AI assistant. Please log in to get personalized job search advice based on your profile!';
      
    setMessages([{
      id: 1,
      role: 'bot',
      text: welcomeMessage,
      timestamp: new Date()
    }]);
    setMessageIdCounter(2);
    setCurrentSessionId(null);
    setShowHistory(false);
  };

  const clearChat = () => {
    startNewChat();
  };

  // Load chat history when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated) {
      loadChatHistory();
    }
  }, [isAuthenticated]);

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = (message: Message) => {
    if (message.type === 'email_list' && message.emails) {
      return (
        <div className="space-y-2">
          <p>{message.text}</p>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
            {message.emails.map((email, index) => (
              <div key={index} className="bg-white p-3 rounded border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="font-medium text-sm text-gray-900 mb-1">
                  {email.subject || '(No Subject)'}
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  From: {email.sender}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(email.date).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-700">
                  {email.snippet}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (message.type === 'email_stats' && message.stats) {
      return (
        <div className="space-y-2">
          <p>{message.text}</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-semibold text-blue-800">{message.stats.totalJobEmails}</div>
                <div className="text-blue-600 text-xs">Total Job Emails</div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="font-semibold text-purple-800">{message.stats.recruiterEmails}</div>
                <div className="text-purple-600 text-xs">Recruiter Emails</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="font-semibold text-green-800">{message.stats.interviewEmails}</div>
                <div className="text-green-600 text-xs">Interview Emails</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <div className="font-semibold text-yellow-800">{message.stats.offerEmails}</div>
                <div className="text-yellow-600 text-xs">Offer Emails</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Data from the last {message.stats.period}
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'email_analysis' && message.analysis) {
      return (
        <div className="space-y-2">
          <p>{message.text}</p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="text-sm">
              <div className="font-medium text-gray-900 mb-2">Analysis Summary:</div>
              <div className="space-y-1 text-xs text-gray-700">
                <div>📧 Total emails analyzed: <span className="font-medium">{message.analysis.totalEmails}</span></div>
                <div>🏢 Companies contacted: <span className="font-medium">{message.analysis.companiesContacted}</span></div>
              </div>
            </div>
            
            {Object.keys(message.analysis.mostActiveCompany).length > 0 && (
              <div className="text-sm">
                <div className="font-medium text-gray-900 mb-2">Most Active Companies:</div>
                <div className="space-y-1">
                  {Object.entries(message.analysis.mostActiveCompany)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 3)
                    .map(([company, count]: [string, unknown]) => (
                      <div key={company} className="flex justify-between text-xs">
                        <span className="text-gray-700">{company}</span>
                        <span className="font-medium text-blue-600">{count} emails</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br>') }} />;
  };

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setHasNewMessage(false);
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {hasNewMessage && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-40">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-xs opacity-80">Gmail & Job Search Helper</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isAuthenticated && (
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Chat history"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
              <button 
                onClick={clearChat}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="New chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat History Panel */}
          {showHistory && isAuthenticated && (
            <div className="border-b border-gray-200 p-4 bg-gray-50 max-h-32 overflow-y-auto">
              <div className="text-sm font-medium text-gray-700 mb-2">Recent Chats</div>
              <div className="space-y-1">
                <button
                  onClick={startNewChat}
                  className="w-full text-left p-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                >
                  + Start New Chat
                </button>
                {chatSessions.map((session) => (
                  <button
                    key={session.session_id}
                    onClick={() => loadSpecificSession(session.session_id)}
                    className={`w-full text-left p-2 text-xs rounded hover:bg-gray-100 transition-colors ${
                      currentSessionId === session.session_id ? 'bg-gray-200' : 'bg-white'
                    }`}
                  >
                    <div className="font-medium text-gray-800 truncate">
                      {session.last_message || 'New conversation'}
                    </div>
                    <div className="text-gray-500">
                      {new Date(session.last_message_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm">
                    <div>{renderMessage(message)}</div>
                  </div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {formatDate(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-end space-x-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about jobs, search Gmail emails..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {isAuthenticated 
                ? "Try: \"help me optimize my CV\" or \"what jobs match my skills?\""
                : "Try: \"search Gmail for job emails\" or \"find emails from recruiters\""
              }
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedChatbot;