import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Send,
  BarChart3
} from 'lucide-react';
import { JobSearchAutomation } from './JobSearchAutomation';
import { AutomationSettings } from './AutomationSettings';
import { AutomationHistory } from './AutomationHistory';
import { PlatformConnections } from './PlatformConnections';

interface AutomationStats {
  today_applications: number;
  total_applications: number;
  success_rate: number;
  last_run: string;
  active_sessions: number;
}

interface AutomationDashboardProps {
  user: any;
}

export const AutomationDashboard: React.FC<AutomationDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'search' | 'settings' | 'history' | 'connections'>('dashboard');
  const [stats, setStats] = useState<AutomationStats>({
    today_applications: 0,
    total_applications: 0,
    success_rate: 0,
    last_run: '',
    active_sessions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [automationStatus, setAutomationStatus] = useState<'idle' | 'running' | 'paused'>('idle');

  useEffect(() => {
    fetchAutomationStats();
  }, []);

  const fetchAutomationStats = async () => {
    try {
      const { default: automationService } = await import('../../src/services/automationService');
      
      const data = await automationService.getAutomationStatus();
      
      if (data.success) {
        setStats(data.status);
      }
    } catch (error) {
      console.error('Error fetching automation stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStart = async () => {
    setAutomationStatus('running');
    // This would trigger the automation search component
    setActiveTab('search');
  };

  const StatsCard = ({ title, value, icon: Icon, color = 'blue' }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TabButton = ({ id, label, icon: Icon, active }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        active 
          ? 'bg-blue-100 text-blue-700 border-blue-200' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Application Automation</h1>
          <p className="text-gray-600">Automate your job search and applications with AI</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={automationStatus === 'running' ? 'default' : 'secondary'}>
            {automationStatus === 'running' ? (
              <>
                <Activity className="h-3 w-3 mr-1" />
                Running
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Idle
              </>
            )}
          </Badge>
          <Button onClick={handleQuickStart} className="bg-blue-600 hover:bg-blue-700">
            <Bot className="h-4 w-4 mr-2" />
            Quick Start
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard 
          title="Today's Applications" 
          value={stats.today_applications} 
          icon={Send}
          color="blue"
        />
        <StatsCard 
          title="Total Applications" 
          value={stats.total_applications} 
          icon={BarChart3}
          color="green"
        />
        <StatsCard 
          title="Success Rate" 
          value={`${stats.success_rate}%`} 
          icon={CheckCircle}
          color="purple"
        />
        <StatsCard 
          title="Active Sessions" 
          value={stats.active_sessions} 
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => setActiveTab('search')}
              variant="outline" 
              className="flex items-center space-x-2 p-4 h-auto"
            >
              <Search className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">Search & Apply</div>
                <div className="text-sm text-gray-500">Find and apply to jobs automatically</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => setActiveTab('connections')}
              variant="outline" 
              className="flex items-center space-x-2 p-4 h-auto"
            >
              <Settings className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">Platform Setup</div>
                <div className="text-sm text-gray-500">Connect your job platform accounts</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => setActiveTab('history')}
              variant="outline" 
              className="flex items-center space-x-2 p-4 h-auto"
            >
              <BarChart3 className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">View History</div>
                <div className="text-sm text-gray-500">Track your automation results</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <TabButton 
          id="dashboard" 
          label="Dashboard" 
          icon={BarChart3} 
          active={activeTab === 'dashboard'} 
        />
        <TabButton 
          id="search" 
          label="Job Search" 
          icon={Search} 
          active={activeTab === 'search'} 
        />
        <TabButton 
          id="connections" 
          label="Connections" 
          icon={Settings} 
          active={activeTab === 'connections'} 
        />
        <TabButton 
          id="history" 
          label="History" 
          icon={Clock} 
          active={activeTab === 'history'} 
        />
        <TabButton 
          id="settings" 
          label="Settings" 
          icon={Settings} 
          active={activeTab === 'settings'} 
        />
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <Alert>
              <Bot className="h-4 w-4" />
              <AlertDescription>
                Welcome to job application automation! Connect your platforms and start automating your job search.
              </AlertDescription>
            </Alert>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Applied to Software Engineer at TechCorp</p>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Applied to Frontend Developer at StartupXYZ</p>
                      <p className="text-sm text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">Failed to apply to Senior Developer at BigCorp</p>
                      <p className="text-sm text-gray-500">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'search' && (
          <JobSearchAutomation user={user} onStatusChange={setAutomationStatus} />
        )}

        {activeTab === 'connections' && (
          <PlatformConnections user={user} />
        )}

        {activeTab === 'history' && (
          <AutomationHistory user={user} />
        )}

        {activeTab === 'settings' && (
          <AutomationSettings user={user} />
        )}
      </div>
    </div>
  );
};