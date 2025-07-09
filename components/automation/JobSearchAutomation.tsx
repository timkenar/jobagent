import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Search, 
  Bot, 
  Play, 
  Pause, 
  Stop, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  Briefcase,
  ExternalLink
} from 'lucide-react';

interface JobSearchAutomationProps {
  user: any;
  onStatusChange: (status: 'idle' | 'running' | 'paused') => void;
}

interface JobResult {
  title: string;
  company: string;
  location: string;
  url: string;
  platform: string;
  applied?: boolean;
  match_score?: number;
}

interface AutomationResults {
  jobs: JobResult[];
  total_found: number;
  applications_sent: number;
  errors: string[];
}

export const JobSearchAutomation: React.FC<JobSearchAutomationProps> = ({ user, onStatusChange }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin']);
  const [maxApplications, setMaxApplications] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [results, setResults] = useState<AutomationResults | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('');
  const [credentials, setCredentials] = useState<Record<string, any>>({});

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'indeed', name: 'Indeed', icon: '🔍' },
  ];

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    } else {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    }
  };

  const handleSearchJobs = async () => {
    if (!query.trim()) {
      alert('Please enter a job search query');
      return;
    }

    setIsSearching(true);
    setResults(null);
    setProgress(0);
    setCurrentAction('Searching for jobs...');
    onStatusChange('running');

    try {
      const { default: automationService } = await import('../../src/services/automationService');
      
      const data = await automationService.searchJobs({
        query,
        location,
        platforms: selectedPlatforms,
        credentials
      });

      setResults(data);
      setProgress(100);
      setCurrentAction('Search completed');
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching for jobs. Please try again.');
    } finally {
      setIsSearching(false);
      onStatusChange('idle');
    }
  };

  const handleAutomatedApply = async () => {
    if (!query.trim()) {
      alert('Please enter a job search query');
      return;
    }

    setIsApplying(true);
    setResults(null);
    setProgress(0);
    setCurrentAction('Starting automated job search and application...');
    onStatusChange('running');

    try {
      const { default: automationService } = await import('../../src/services/automationService');
      
      const data = await automationService.automatedSearchAndApply({
        query,
        location,
        platforms: selectedPlatforms,
        credentials,
        max_applications: maxApplications
      });

      setResults(data.results);
      setProgress(100);
      setCurrentAction('Automation completed');
    } catch (error) {
      console.error('Automation error:', error);
      alert('Error running automation. Please try again.');
    } finally {
      setIsApplying(false);
      onStatusChange('idle');
    }
  };

  const handleApplyToJob = async (job: JobResult) => {
    try {
      const { default: automationService } = await import('../../src/services/automationService');
      
      const data = await automationService.applyToJob({
        job_data: job,
        credentials: credentials[job.platform] || {}
      });

      if (data.success) {
        // Update the job as applied
        setResults(prev => {
          if (!prev) return null;
          return {
            ...prev,
            jobs: prev.jobs.map(j => 
              j.url === job.url ? { ...j, applied: true } : j
            )
          };
        });
        alert('Application submitted successfully!');
      } else {
        throw new Error(data.error || 'Application failed');
      }
    } catch (error) {
      console.error('Application error:', error);
      alert('Error applying to job. Please try again.');
    }
  };

  const JobCard = ({ job }: { job: JobResult }) => (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <Badge variant="outline">{job.platform}</Badge>
              {job.applied && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Applied
                </Badge>
              )}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              {job.match_score && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Match Score:</span>
                  <Badge variant="secondary">{job.match_score}/10</Badge>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(job.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            {!job.applied && (
              <Button
                size="sm"
                onClick={() => handleApplyToJob(job)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Apply
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Job Search Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="query">Job Title / Keywords</Label>
              <Input
                id="query"
                placeholder="e.g., Software Engineer, Frontend Developer"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., New York, Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Platforms</Label>
            <div className="flex space-x-4 mt-2">
              {platforms.map(platform => (
                <div key={platform.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.id}
                    checked={selectedPlatforms.includes(platform.id)}
                    onCheckedChange={(checked) => 
                      handlePlatformChange(platform.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={platform.id} className="flex items-center space-x-1">
                    <span>{platform.icon}</span>
                    <span>{platform.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="maxApplications">Maximum Applications</Label>
            <Select value={maxApplications.toString()} onValueChange={(value) => setMaxApplications(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 applications</SelectItem>
                <SelectItem value="5">5 applications</SelectItem>
                <SelectItem value="10">10 applications</SelectItem>
                <SelectItem value="15">15 applications</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={handleSearchJobs}
              disabled={isSearching || isApplying}
              variant="outline"
              className="flex-1"
            >
              {isSearching ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Only
                </>
              )}
            </Button>
            
            <Button
              onClick={handleAutomatedApply}
              disabled={isSearching || isApplying}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isApplying ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Search & Apply
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {(isSearching || isApplying) && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{currentAction}</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Results</span>
              <div className="flex items-center space-x-4">
                <Badge variant="outline">
                  {results.total_found} jobs found
                </Badge>
                {results.applications_sent > 0 && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {results.applications_sent} applications sent
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.errors.length > 0 && (
              <Alert className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">Errors occurred:</div>
                  <ul className="list-disc list-inside">
                    {results.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {results.jobs.map((job, index) => (
                <JobCard key={index} job={job} />
              ))}
            </div>

            {results.jobs.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No jobs found. Try different search criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};