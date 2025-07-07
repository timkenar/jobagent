import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AddApplicationForm } from '../jobs';

interface JobApplication {
  id: number;
  company_name: string;
  job_title: string;
  application_date: string;
  status: 'applied' | 'reviewing' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  job_url?: string;
  notes?: string;
  salary_range?: string;
  location?: string;
  next_action?: string;
  next_action_date?: string;
}

interface ApplicationStats {
  total: number;
  applied: number;
  reviewing: number;
  interviewing: number;
  offer: number;
  rejected: number;
  withdrawn: number;
}

const JobApplicationDashboard: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    applied: 0,
    reviewing: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please sign in to view your applications');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/job-applications/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setApplications(response.data);
      calculateStats(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError('Failed to load job applications');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps: JobApplication[]) => {
    const stats = {
      total: apps.length,
      applied: apps.filter(app => app.status === 'applied').length,
      reviewing: apps.filter(app => app.status === 'reviewing').length,
      interviewing: apps.filter(app => app.status === 'interviewing').length,
      offer: apps.filter(app => app.status === 'offer').length,
      rejected: apps.filter(app => app.status === 'rejected').length,
      withdrawn: apps.filter(app => app.status === 'withdrawn').length,
    };
    setStats(stats);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      interviewing: 'bg-purple-100 text-purple-800',
      offer: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      applied: '📤',
      reviewing: '👀',
      interviewing: '💬',
      offer: '🎉',
      rejected: '❌',
      withdrawn: '↩️'
    };
    return icons[status as keyof typeof icons] || '📋';
  };

  const filteredApplications = selectedStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === selectedStatus);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading your job applications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Job Application Tracker</h3>
            <p className="text-gray-600 text-sm">Track your job applications and their progress</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Application</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.applied}</div>
          <div className="text-sm text-blue-600">Applied</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.reviewing}</div>
          <div className="text-sm text-yellow-600">Reviewing</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.interviewing}</div>
          <div className="text-sm text-purple-600">Interviewing</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{stats.offer}</div>
          <div className="text-sm text-green-600">Offers</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-red-600">Rejected</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.withdrawn}</div>
          <div className="text-sm text-gray-600">Withdrawn</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Applications</option>
          <option value="applied">Applied</option>
          <option value="reviewing">Under Review</option>
          <option value="interviewing">Interviewing</option>
          <option value="offer">Offers</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h4>
          <p className="text-gray-600 mb-4">Start tracking your job applications to see your progress</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Add Your First Application
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{app.job_title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)} {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-gray-600 mb-2">
                    <span className="font-medium">{app.company_name}</span>
                    {app.location && <span className="ml-2">• {app.location}</span>}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Applied: {formatDate(app.application_date)}</span>
                    {app.salary_range && <span>• Salary: {app.salary_range}</span>}
                  </div>
                  {app.notes && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Notes:</strong> {app.notes}
                    </div>
                  )}
                  {app.next_action && (
                    <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      <strong>Next Action:</strong> {app.next_action}
                      {app.next_action_date && <span className="ml-2">by {formatDate(app.next_action_date)}</span>}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {app.job_url && (
                    <a
                      href={app.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View job posting"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit application"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Application Modal */}
      {showAddForm && (
        <AddApplicationForm 
          onClose={() => setShowAddForm(false)}
          onSuccess={fetchApplications}
        />
      )}
    </div>
  );
};

export default JobApplicationDashboard;