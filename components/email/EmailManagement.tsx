import React, { useState, useEffect } from 'react';
import { Mail, Search, Plus, RefreshCw, Filter, Reply, Forward, X, Paperclip, Calendar, Building, Briefcase, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useGmail } from '../../src/contexts/GmailContext';
import EmailIntegrationSection from './EmailIntegrationSection';

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  isRead: boolean;
  category: 'application' | 'interview' | 'rejection' | 'offer' | 'follow_up' | 'other';
  attachments?: string[];
  jobApplication?: {
    company: string;
    position: string;
  };
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'follow_up' | 'thank_you' | 'inquiry' | 'withdrawal';
}

const EmailManagement: React.FC = () => {
  const {
    emails: gmailEmails,
    isLoading: gmailLoading,
    error: gmailError,
    isGmailConnected,
    fetchEmails,
    refreshAccounts
  } = useGmail();
  
  const [emails, setEmails] = useState<Email[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'templates' | 'compose' | 'integration'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: '',
    template: ''
  });

  // Convert Gmail emails to local Email format
  const convertGmailToEmail = (gmailEmail: any): Email => {
    let category: Email['category'] = 'other';
    const subject = gmailEmail.subject?.toLowerCase() || '';
    const body = gmailEmail.body?.toLowerCase() || gmailEmail.snippet?.toLowerCase() || '';
    
    if (subject.includes('interview') || body.includes('interview')) {
      category = 'interview';
    } else if (subject.includes('offer') || body.includes('offer') || subject.includes('congratulations')) {
      category = 'offer';
    } else if (subject.includes('rejection') || body.includes('regret') || body.includes('decided to move forward with other candidates')) {
      category = 'rejection';
    } else if (subject.includes('application') || body.includes('application')) {
      category = 'application';
    } else if (subject.includes('follow') || body.includes('follow')) {
      category = 'follow_up';
    }
    
    return {
      id: gmailEmail.id,
      from: gmailEmail.sender,
      subject: gmailEmail.subject || 'No Subject',
      body: gmailEmail.body || gmailEmail.snippet || '',
      date: gmailEmail.date,
      isRead: gmailEmail.isRead ?? true,
      category
    };
  };

  useEffect(() => {
    if (gmailEmails && gmailEmails.length > 0) {
      const convertedEmails = gmailEmails.map(convertGmailToEmail);
      setEmails(convertedEmails);
    }
  }, [gmailEmails]);

  useEffect(() => {
    setTemplates([
      {
        id: '1',
        name: 'Follow-up After Application',
        subject: 'Following up on my application for {position}',
        body: `Dear Hiring Manager,

I hope this email finds you well. I wanted to follow up on my application for the {position} position that I submitted on {date}.

I remain very interested in this opportunity and would appreciate any updates you might have regarding the status of my application. I believe my skills in {skills} would be a great fit for your team.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
{name}`,
        category: 'follow_up'
      },
      {
        id: '2',
        name: 'Thank You After Interview',
        subject: 'Thank you for the interview - {position}',
        body: `Dear {interviewer_name},

Thank you for taking the time to interview me yesterday for the {position} position. I enjoyed our conversation about {specific_topic} and learning more about the team's goals.

Our discussion reinforced my enthusiasm for this role, particularly {specific_detail}. I believe my experience with {relevant_experience} would allow me to contribute effectively to your team.

Please let me know if you need any additional information from me. I look forward to hearing about the next steps.

Best regards,
{name}`,
        category: 'thank_you'
      },
      {
        id: '3',
        name: 'Salary Negotiation',
        subject: 'Re: Job Offer - {position}',
        body: `Dear {hiring_manager},

Thank you for extending the offer for the {position} position. I'm excited about the opportunity to join {company} and contribute to the team.

After reviewing the offer details, I would like to discuss the compensation package. Based on my research of market rates and my experience in {relevant_skills}, I was hoping we could consider a salary of $[INSERT_TARGET_SALARY].

I'm confident that my skills and enthusiasm will bring significant value to the role. I would appreciate the opportunity to discuss this further.

Thank you for your consideration.

Best regards,
{name}`,
        category: 'inquiry'
      }
    ]);
  }, []);

  useEffect(() => {
    setLoading(gmailLoading);
  }, [gmailLoading]);

  const getCategoryIcon = (category: Email['category']) => {
    switch (category) {
      case 'application':
        return <Briefcase className="w-4 h-4" />;
      case 'interview':
        return <Calendar className="w-4 h-4" />;
      case 'offer':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejection':
        return <XCircle className="w-4 h-4" />;
      case 'follow_up':
        return <Clock className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: Email['category']) => {
    switch (category) {
      case 'application':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      case 'interview':
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20';
      case 'offer':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'rejection':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      case 'follow_up':
        return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getCategoryLabel = (category: Email['category']) => {
    const labels = {
      application: 'Application',
      interview: 'Interview',
      offer: 'Offer',
      rejection: 'Rejection',
      follow_up: 'Follow-up',
      other: 'Other'
    };
    return labels[category] || 'Other';
  };

  const filteredEmails = emails.filter(email => {
    const matchesCategory = filterCategory === 'all' || email.category === filterCategory;
    const matchesSearch = email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (email.jobApplication?.company.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const markAsRead = (emailId: string) => {
    setEmails(prev => 
      prev.map(email => 
        email.id === emailId ? { ...email, isRead: true } : email
      )
    );
  };

  const useTemplate = (template: EmailTemplate) => {
    setComposeData({
      to: '',
      subject: template.subject,
      body: template.body,
      template: template.id
    });
    setActiveTab('compose');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
              <div className="md:col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isGmailConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Manager</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Connect your email account to manage and track job applications automatically.</p>
          </div>
          <EmailIntegrationSection />
        </div>
      </div>
    );
  }

  if (gmailError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Emails</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{gmailError}</p>
            <button
              onClick={() => fetchEmails()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Manager</h1>
              </div>
              
              {/* Stats */}
              <div className="hidden md:flex items-center space-x-6 ml-8">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {emails.filter(e => !e.isRead).length} unread
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {emails.filter(e => e.category === 'offer').length} offers
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {emails.filter(e => e.category === 'interview').length} interviews
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveTab('compose')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Compose</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mt-4 overflow-x-auto">
            {[
              { id: 'inbox', label: 'Inbox', count: emails.length },
              { id: 'templates', label: 'Templates', count: templates.length },
              { id: 'compose', label: 'Compose', count: null },
              { id: 'integration', label: 'Email Accounts', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="application">Applications</option>
                <option value="interview">Interviews</option>
                <option value="offer">Offers</option>
                <option value="rejection">Rejections</option>
                <option value="follow_up">Follow-ups</option>
              </select>
              <button 
                onClick={() => fetchEmails()}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'inbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email List */}
            <div className="lg:col-span-1 space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {filteredEmails.length} emails
              </div>
              
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => {
                    setSelectedEmail(email);
                    markAsRead(email.id);
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedEmail?.id === email.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : !email.isRead
                      ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800'
                      : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${getCategoryColor(email.category)}`}>
                        {getCategoryIcon(email.category)}
                      </div>
                      {!email.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(email.date)}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {email.from.split('@')[0]}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(email.category)}`}>
                        {getCategoryLabel(email.category)}
                      </span>
                    </div>
                    <h3 className={`text-sm truncate ${
                      !email.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'
                    }`}>
                      {email.subject}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {email.body}
                    </p>
                    {email.jobApplication && (
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Building className="w-3 h-3" />
                        <span className="truncate">{email.jobApplication.company}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Email Detail */}
            <div className="lg:col-span-2">
              {selectedEmail ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${getCategoryColor(selectedEmail.category)}`}>
                            {getCategoryIcon(selectedEmail.category)}
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {selectedEmail.subject}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              From: {selectedEmail.from}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{formatDate(selectedEmail.date)}</span>
                          {selectedEmail.attachments && (
                            <div className="flex items-center space-x-1">
                              <Paperclip className="w-4 h-4" />
                              <span>{selectedEmail.attachments.length} attachment{selectedEmail.attachments.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setComposeData({
                              to: selectedEmail.from,
                              subject: `Re: ${selectedEmail.subject}`,
                              body: '',
                              template: ''
                            });
                            setActiveTab('compose');
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setComposeData({
                              to: '',
                              subject: `Fwd: ${selectedEmail.subject}`,
                              body: `\n\n--- Forwarded Message ---\nFrom: ${selectedEmail.from}\nSubject: ${selectedEmail.subject}\nDate: ${new Date(selectedEmail.date).toLocaleString()}\n\n${selectedEmail.body}`,
                              template: ''
                            });
                            setActiveTab('compose');
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                        >
                          <Forward className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {selectedEmail.jobApplication && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-2 mb-2">
                          <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                            Job Application
                          </span>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {selectedEmail.jobApplication.company} - {selectedEmail.jobApplication.position}
                        </p>
                      </div>
                    )}
                    
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                        {selectedEmail.body}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex items-center justify-center">
                  <div className="text-center">
                    <Mail className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Select an email to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {template.category.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={() => useTemplate(template)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
                  >
                    Use
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-2">Subject: {template.subject}</p>
                  <p className="text-xs line-clamp-3">{template.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'compose' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New Email</h2>
                  <select
                    value={composeData.template}
                    onChange={(e) => {
                      const template = templates.find(t => t.id === e.target.value);
                      if (template) useTemplate(template);
                    }}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Use template...</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      To
                    </label>
                    <input
                      type="email"
                      value={composeData.to}
                      onChange={(e) => setComposeData({...composeData, to: e.target.value})}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="recipient@company.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={composeData.subject}
                      onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Email subject"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      value={composeData.body}
                      onChange={(e) => setComposeData({...composeData, body: e.target.value})}
                      rows={16}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Type your message here..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setActiveTab('inbox')}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Send Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integration' && (
          <EmailIntegrationSection />
        )}
      </div>
    </div>
  );
};

export default EmailManagement;