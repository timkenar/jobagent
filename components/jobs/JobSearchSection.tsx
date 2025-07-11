import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Search, User, Bot } from 'lucide-react';
import { JobSearchSection } from '.';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface JobSearchChatProps {
  hasUploadedCV?: boolean;
  cvInfo?: any;
  jobResults?: any[];
  onJobSearch?: (query: string) => void;
  onEmailGeneration?: (job: any) => void;
}

const JobSearchChat: React.FC<JobSearchChatProps> = ({
  hasUploadedCV,
  cvInfo,
  jobResults,
  onJobSearch,
  onEmailGeneration
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Simulate AI response with context from your job search engine
  const generateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let response = "";
    
    if (userMessage.toLowerCase().includes("find job") || userMessage.toLowerCase().includes("job opportunities")) {
      if (hasUploadedCV && cvInfo) {
        response = `Great! I can see you have a CV uploaded with ${cvInfo.skills?.length || 0} skills${cvInfo.job_category ? ` in ${cvInfo.job_category}` : ''}. 

Based on your profile, I can help you:
• Search for jobs matching your skills
• Generate personalized application emails
• Find roles in your preferred category

${jobResults && jobResults.length > 0 ? `I see you already have ${jobResults.length} job results. Would you like me to help you prioritize them or search for more specific roles?` : 'Would you like me to run a job search now?'}`;
      } else {
        response = "I'd love to help you find jobs! I notice you haven't uploaded a CV yet. To give you the best results, I recommend:\n\n• Upload your CV first for personalized matches\n• Or tell me about your skills and experience\n• Specify your preferred job type and location\n\nOnce I have this info, I can search for relevant positions and help craft application emails!";
      }
    } else if (userMessage.toLowerCase().includes("cv") || userMessage.toLowerCase().includes("resume")) {
      response = hasUploadedCV 
        ? `I can see your CV is uploaded! Here's how to optimize it further:\n\n• **Tailor keywords** - Match job descriptions you're interested in\n• **Highlight achievements** - Use metrics where possible\n• **Update skills** - Add any new technologies or certifications\n• **Customize per application** - Adjust focus based on role requirements\n\nWould you like me to analyze specific job postings against your current CV?`
        : "Great question! Here are key CV optimization tips:\n\n• **Upload your CV** - So I can give personalized advice\n• **Use keywords** - Match terms from job descriptions\n• **Quantify results** - Include numbers and achievements\n• **Keep it focused** - 1-2 pages, relevant content only\n• **Update regularly** - Add new skills and experience\n\nOnce you upload your CV, I can provide specific improvement suggestions!";
    } else if (userMessage.toLowerCase().includes("interview")) {
      response = "I'll help you prepare for interviews! Here's my approach:\n\n• **Practice common questions** - 'Tell me about yourself', strengths/weaknesses\n• **Use STAR method** - Situation, Task, Action, Result\n• **Research the company** - Know their values and recent news\n• **Prepare questions** - Show genuine interest\n• **Mock interviews** - Practice with real scenarios\n\nIf you have specific job applications in progress, I can help you prepare for those specific roles!";
    } else if (userMessage.toLowerCase().includes("career") || userMessage.toLowerCase().includes("path")) {
      const careerContext = hasUploadedCV && cvInfo?.job_category 
        ? `I see you're focused on ${cvInfo.job_category}. ` 
        : '';
      
      response = `${careerContext}Career planning is crucial! Let me help you:\n\n• **Assess your current skills** - What you're good at now\n• **Identify growth areas** - Skills to develop\n• **Explore opportunities** - Different career paths\n• **Set goals** - Short and long-term objectives\n• **Create action plans** - Steps to reach your goals\n\nWhat specific aspect of your career would you like to focus on?`;
    } else {
      const contextInfo = hasUploadedCV 
        ? `I can see your CV is uploaded with ${cvInfo?.skills?.length || 0} skills. `
        : '';
      
      response = `${contextInfo}I'm here to help with your entire job search journey! I can assist with:\n\n• **Job searching** - Find relevant opportunities\n• **CV optimization** - Improve your resume\n• **Email generation** - Craft compelling applications\n• **Interview prep** - Practice and tips\n• **Career planning** - Long-term strategy\n\nWhat would you like to work on today?`;
    }
    
    setIsTyping(false);
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      content: response,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section 
      ref={sectionRef} 
      className={`mb-8 p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700 backdrop-blur-md transition-all duration-500 ${
        isExpanded ? 'min-h-[600px]' : 'min-h-[200px]'
      }`}
    >
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
          {hasUploadedCV && cvInfo && (
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">CV Ready</span>
            </div>
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
                  {getGreeting()}, job seeker
                </h3>
                <p className="text-slate-400">
                  How can I help you with your career journey today?
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
                      {message.content}
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

      {/* Input Area */}
      <div className="relative">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => !isExpanded && setIsExpanded(true)}
          placeholder="Ask me anything about your job search..."
          className="w-full p-4 pr-12 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none"
          rows={1}
          style={{ minHeight: '50px' }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isTyping}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </section>
  );
};

export default JobSearchChat;