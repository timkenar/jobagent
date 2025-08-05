import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Briefcase,
  MapPin,
  Eye
} from 'lucide-react';

interface AutomationHistoryProps {
  user: any;
}

interface JobApplication {
  id: string;
  job_title: string;
  company_name: string;
  platform: string;
  location: string;
  application_date: string;
  status: 'applied' | 'failed' | 'pending';
  job_url: string;
  automated: boolean;
  error_message?: string;
}

interface AutomationSession {
  id: string;
  date: string;
  query: string;
  platforms: string[];
  total_found: number;
  applications_sent: number;
  success_rate: number;
  duration: string;
  applications: JobApplication[];
}

export const AutomationHistory: React.FC<AutomationHistoryProps> = ({ user }) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [sessions, setSessions] = useState<AutomationSession[]>([]);
  const [activeTab, setActiveTab] = useState<'applications' | 'sessions'>('applications');
  const [filterStatus, setFilterStatus] = useState<'all' | 'applied' | 'failed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  useEffect(() => {
    fetchApplicationHistory();
  }, []);

  const fetchApplicationHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        setApplications([]);
        setSessions([]);
        return;
      }

      // Fetch real application history from API
      const applicationsResponse = await fetch('/api/automation/applications/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const sessionsResponse = await fetch('/api/automation/sessions/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData || []);
      } else {
        setApplications([]);
      }

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData || []);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setApplications([]);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <CheckCircle className="h-3 w-3" />;
      case 'failed': return <XCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return '💼';
      case 'indeed': return '🔍';
      default: return '📄';
    }
  };

  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' || app.status === filterStatus
  );

  const ApplicationCard = ({ application }: { application: JobApplication }) => (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg">{application.job_title}</h3>
              <span className="text-lg">{getPlatformIcon(application.platform)}</span>
              <Badge className={getStatusColor(application.status)}>
                {getStatusIcon(application.status)}
                <span className="ml-1 capitalize">{application.status}</span>
              </Badge>
              {application.automated && (
                <Badge variant="outline">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Automated
                </Badge>
              )}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>{application.company_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{application.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(application.application_date).toLocaleString()}</span>
              </div>
            </div>

            {application.error_message && (
              <Alert className="mt-3">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {application.error_message}
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedApplication(application)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(application.job_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SessionCard = ({ session }: { session: AutomationSession }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>Automation Session</span>
          </div>
          <Badge variant="outline">
            {new Date(session.date).toLocaleDateString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Query</p>
            <p className="font-medium">{session.query}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Platforms</p>
            <div className="flex space-x-1">
              {session.platforms.map(platform => (
                <span key={platform} className="text-lg">
                  {getPlatformIcon(platform)}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Jobs Found</p>
            <p className="font-medium">{session.total_found}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Applications Sent</p>
            <p className="font-medium">{session.applications_sent}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge className="bg-blue-100 text-blue-800">
              {session.success_rate}% Success Rate
            </Badge>
            <span className="text-sm text-gray-600">
              Duration: {session.duration}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setActiveTab('applications');
              // Filter applications to show only this session's applications
            }}
          >
            View Applications
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Automation History</h2>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={fetchApplicationHistory}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-2 px-4 border-b-2 font-medium ${
            activeTab === 'applications' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-2 px-4 border-b-2 font-medium ${
            activeTab === 'sessions' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Sessions ({sessions.length})
        </button>
      </div>

      {/* Filters */}
      {activeTab === 'applications' && (
        <div className="flex items-center space-x-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">All Status</option>
            <option value="applied">Applied</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'applications' ? (
          <>
            {filteredApplications.length > 0 ? (
              filteredApplications.map(application => (
                <ApplicationCard key={application.id} application={application} />
              ))
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No applications found</p>
              </div>
            )}
          </>
        ) : (
          <>
            {sessions.length > 0 ? (
              sessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))
            ) : (
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No automation sessions found</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Application Details</h3>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Job Title</p>
                <p className="font-medium">{selectedApplication.job_title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-medium">{selectedApplication.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Platform</p>
                <p className="font-medium capitalize">{selectedApplication.platform}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={getStatusColor(selectedApplication.status)}>
                  {getStatusIcon(selectedApplication.status)}
                  <span className="ml-1 capitalize">{selectedApplication.status}</span>
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Applied Date</p>
                <p className="font-medium">
                  {new Date(selectedApplication.application_date).toLocaleString()}
                </p>
              </div>
              {selectedApplication.error_message && (
                <div>
                  <p className="text-sm text-gray-600">Error</p>
                  <p className="text-red-600">{selectedApplication.error_message}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex space-x-3">
              <Button
                onClick={() => window.open(selectedApplication.job_url, '_blank')}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Job
              </Button>
              <Button
                onClick={() => setSelectedApplication(null)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};