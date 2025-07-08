import React, { useState, useEffect } from 'react';
import { useGmail } from '../../src/contexts/GmailContext';
import axios from 'axios';

interface EmailCategory {
  category: 'application' | 'interview' | 'offer' | 'rejection' | 'follow_up' | 'other';
  date: string;
  subject: string;
  from: string;
}

interface JobApplication {
  id: number;
  job_title: string;
  company: string;
  job_board: string;
  recruiter_email: string;
  date_applied: string;
  status: 'applied' | 'viewed' | 'interview' | 'offer' | 'rejected' | 'ghosted' | 'other';
  last_activity: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  // Computed fields from email analysis
  location?: string;
  salary?: string;
  nextAction?: string;
  interviewDate?: string;
  emailCount?: number;
  lastEmailDate?: string;
  emailCategories?: EmailCategory[];
  progressScore?: number;
}

const ApplicationTracker: React.FC = () => {
  const {
    emails: gmailEmails,
    isGmailConnected,
    isLoading: gmailLoading,
    error: gmailError
  } = useGmail();
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'status'>('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/job-applications/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const backendApps = response.data;
      
      // Enhanced email categorization logic
      const categorizeEmail = (email: any): EmailCategory['category'] => {
        const subject = email.subject?.toLowerCase() || '';
        const body = email.body?.toLowerCase() || email.snippet?.toLowerCase() || '';
        const content = subject + ' ' + body;
        
        if (content.includes('interview') || content.includes('schedule') || content.includes('meeting') || content.includes('call')) {
          return 'interview';
        } else if (content.includes('offer') || content.includes('congratulations') || content.includes('pleased to') || content.includes('excited to offer')) {
          return 'offer';
        } else if (content.includes('reject') || content.includes('unfortunately') || content.includes('not selected') || content.includes('moving forward with other')) {
          return 'rejection';
        } else if (content.includes('follow') || content.includes('update') || content.includes('checking in')) {
          return 'follow_up';
        } else if (content.includes('application') || content.includes('received') || content.includes('reviewing') || content.includes('thank you for applying')) {
          return 'application';
        }
        return 'other';
      };

      // Calculate progress score based on email categories
      const calculateProgressScore = (categories: EmailCategory[]): number => {
        const weights = {
          application: 20,
          follow_up: 40,
          interview: 70,
          offer: 95,
          rejection: 0,
          other: 10
        };
        
        if (categories.length === 0) return 15; // Just applied
        
        const maxScore = Math.max(...categories.map(cat => weights[cat.category]));
        return maxScore;
      };

      // Enhance applications with email data
      const enhancedApps = backendApps.map((app: any) => {
        const appEmails = gmailEmails.filter(email => 
          email.sender.toLowerCase().includes(app.company.toLowerCase()) ||
          email.subject.toLowerCase().includes(app.company.toLowerCase()) ||
          email.subject.toLowerCase().includes(app.job_title.toLowerCase()) ||
          (app.recruiter_email && email.sender.includes(app.recruiter_email))
        );
        
        // Create email categories with details
        const emailCategories: EmailCategory[] = appEmails.map(email => ({
          category: categorizeEmail(email),
          date: email.date,
          subject: email.subject,
          from: email.sender
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Determine status from latest email
        let emailStatus = app.status;
        let lastEmailDate = null;
        let nextAction = null;
        
        if (emailCategories.length > 0) {
          const latestCategory = emailCategories[0];
          lastEmailDate = latestCategory.date;
          
          switch (latestCategory.category) {
            case 'interview':
              emailStatus = 'interview';
              nextAction = 'Prepare for interview';
              break;
            case 'offer':
              emailStatus = 'offer';
              nextAction = 'Review offer details';
              break;
            case 'rejection':
              emailStatus = 'rejected';
              nextAction = 'Learn from feedback';
              break;
            case 'application':
              emailStatus = 'viewed';
              nextAction = 'Follow up in 1-2 weeks';
              break;
            case 'follow_up':
              nextAction = 'Continue dialogue';
              break;
          }
        }
        
        const progressScore = calculateProgressScore(emailCategories);
        
        return {
          ...app,
          status: emailStatus,
          emailCount: appEmails.length,
          lastEmailDate,
          nextAction: nextAction || app.notes,
          emailCategories,
          progressScore,
          // Map backend fields to frontend interface
          appliedDate: app.date_applied,
          lastUpdate: app.last_activity || app.updated_at,
          position: app.job_title,
          source: app.job_board || 'Manual Entry'
        };
      });
      
      setApplications(enhancedApps);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.error || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [gmailEmails]); // Re-fetch when emails change

  const getStatusColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'interview':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'offer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'ghosted':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'other':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: JobApplication['status']) => {
    switch (status) {
      case 'applied':
        return 'Applied';
      case 'viewed':
        return 'Viewed';
      case 'interview':
        return 'Interview';
      case 'offer':
        return 'Offer';
      case 'rejected':
        return 'Rejected';
      case 'ghosted':
        return 'Ghosted';
      case 'other':
        return 'Other';
      default:
        return status;
    }
  };

  const updateApplicationStatus = async (id: number, newStatus: JobApplication['status']) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      await axios.patch(`http://localhost:8000/api/job-applications/${id}/`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === id 
            ? { ...app, status: newStatus, lastUpdate: new Date().toISOString() }
            : app
        )
      );
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status');
    }
  };

  const getCategoryIcon = (category: EmailCategory['category']) => {
    switch (category) {
      case 'application':
        return '📄';
      case 'interview':
        return '🎯';
      case 'offer':
        return '🎉';
      case 'rejection':
        return '❌';
      case 'follow_up':
        return '🔄';
      default:
        return '📧';
    }
  };

  const getCategoryColor = (category: EmailCategory['category']) => {
    switch (category) {
      case 'application':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'interview':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'offer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejection':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'follow_up':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 30) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (app.job_board && app.job_board.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date_applied).getTime() - new Date(a.date_applied).getTime();
      case 'company':
        return a.company.localeCompare(b.company);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getStatusCounts = () => {
    return applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Applications</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchApplications}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your job applications
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchApplications}
            className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{applications.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{statusCounts.applied || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Applied</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.viewed || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Viewed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">{statusCounts.interview || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Interview</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">{statusCounts.offer || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Offers</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600">
            {applications.filter(app => app.progressScore && app.progressScore > 50).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Progress</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-red-600">{statusCounts.rejected || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="viewed">Viewed</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="ghosted">Ghosted</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'company' | 'status')}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Date Applied</option>
                <option value="company">Company</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search company or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Company & Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {app.company}
                        </div>
                        {app.progressScore && (
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(app.progressScore)}`}
                                style={{ width: `${app.progressScore}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {app.progressScore}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {app.job_title}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        {app.emailCount && app.emailCount > 0 ? (
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-blue-600 dark:text-blue-400">
                              {app.emailCount} emails
                            </span>
                          </div>
                        ) : (
                          <div></div>
                        )}
                        {app.emailCategories && app.emailCategories.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {app.emailCategories.slice(0, 3).map((category, idx) => (
                              <span 
                                key={idx}
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getCategoryColor(category.category)}`}
                                title={`${category.subject} (${new Date(category.date).toLocaleDateString()})`}
                              >
                                {getCategoryIcon(category.category)}
                              </span>
                            ))}
                            {app.emailCategories.length > 3 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                +{app.emailCategories.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {app.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div>{new Date(app.date_applied).toLocaleDateString()}</div>
                    {app.lastEmailDate && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last email: {new Date(app.lastEmailDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {app.job_board || 'Manual'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <select
                      value={app.status}
                      onChange={(e) => updateApplicationStatus(app.id, e.target.value as JobApplication['status'])}
                      className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="applied">Applied</option>
                      <option value="viewed">Viewed</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                      <option value="ghosted">Ghosted</option>
                      <option value="other">Other</option>
                    </select>
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedApp.job_title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedApp.company}</p>
                  {selectedApp.emailCount && selectedApp.emailCount > 0 && (
                    <div className="flex items-center space-x-4 mt-2">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {selectedApp.emailCount} related emails found
                      </p>
                      {selectedApp.progressScore && (
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(selectedApp.progressScore)}`}
                              style={{ width: `${selectedApp.progressScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedApp.progressScore}% progress
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                  <p className="text-gray-900 dark:text-white">{selectedApp.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Salary</label>
                  <p className="text-gray-900 dark:text-white">{selectedApp.salary || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Applied Date</label>
                  <p className="text-gray-900 dark:text-white">{new Date(selectedApp.date_applied).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source</label>
                  <p className="text-gray-900 dark:text-white">{selectedApp.job_board || 'Manual Entry'}</p>
                </div>
                {selectedApp.recruiter_email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recruiter Email</label>
                    <p className="text-gray-900 dark:text-white">{selectedApp.recruiter_email}</p>
                  </div>
                )}
                {selectedApp.lastEmailDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Email</label>
                    <p className="text-gray-900 dark:text-white">{new Date(selectedApp.lastEmailDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {selectedApp.notes && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedApp.notes}
                  </p>
                </div>
              )}

              {selectedApp.nextAction && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Action</label>
                  <p className="text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    {selectedApp.nextAction}
                  </p>
                </div>
              )}

              {selectedApp.interviewDate && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interview Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedApp.interviewDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {selectedApp.emailCategories && selectedApp.emailCategories.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Timeline</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedApp.emailCategories.map((category, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getCategoryColor(category.category)}`}>
                          {getCategoryIcon(category.category)} {category.category}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            {category.subject}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {category.from} • {new Date(category.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTracker;