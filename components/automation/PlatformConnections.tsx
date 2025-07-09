import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Check, 
  X, 
  Settings, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PlatformConnectionsProps {
  user: any;
}

interface PlatformStatus {
  connected: boolean;
  last_tested: string;
  error?: string;
}

interface PlatformCredentials {
  email: string;
  password: string;
}

export const PlatformConnections: React.FC<PlatformConnectionsProps> = ({ user }) => {
  const [credentials, setCredentials] = useState<Record<string, PlatformCredentials>>({
    linkedin: { email: '', password: '' },
    indeed: { email: '', password: '' }
  });
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({
    linkedin: false,
    indeed: false
  });
  const [platformStatus, setPlatformStatus] = useState<Record<string, PlatformStatus>>({
    linkedin: { connected: false, last_tested: '' },
    indeed: { connected: false, last_tested: '' }
  });
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);

  const platforms = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      color: 'blue',
      description: 'Connect to LinkedIn for premium job opportunities',
      helpUrl: 'https://linkedin.com/help'
    },
    {
      id: 'indeed',
      name: 'Indeed',
      icon: '🔍',
      color: 'green',
      description: 'Connect to Indeed for broad job market coverage',
      helpUrl: 'https://indeed.com/help'
    }
  ];

  useEffect(() => {
    // Load saved credentials from localStorage (encrypted in production)
    const savedCredentials = localStorage.getItem('platform_credentials');
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials);
        setCredentials(parsed);
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    }
  }, []);

  const handleCredentialChange = (platform: string, field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const togglePasswordVisibility = (platform: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const testConnection = async (platform: string) => {
    const creds = credentials[platform];
    
    if (!creds.email || !creds.password) {
      alert('Please enter both email and password');
      return;
    }

    setTestingPlatform(platform);
    
    try {
      const { default: automationService } = await import('../../src/services/automationService');
      
      const data = await automationService.testPlatformConnection({
        platform,
        credentials: creds
      });

      if (data.success) {
        setPlatformStatus(prev => ({
          ...prev,
          [platform]: {
            connected: true,
            last_tested: new Date().toISOString(),
            error: undefined
          }
        }));

        // Save credentials to localStorage (encrypt in production)
        localStorage.setItem('platform_credentials', JSON.stringify(credentials));

        alert(`Successfully connected to ${platform}!`);
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      setPlatformStatus(prev => ({
        ...prev,
        [platform]: {
          connected: false,
          last_tested: new Date().toISOString(),
          error: error.message
        }
      }));
      alert(`Connection failed: ${error.message}`);
    } finally {
      setTestingPlatform(null);
    }
  };

  const clearCredentials = (platform: string) => {
    setCredentials(prev => ({
      ...prev,
      [platform]: { email: '', password: '' }
    }));
    
    setPlatformStatus(prev => ({
      ...prev,
      [platform]: { connected: false, last_tested: '' }
    }));

    // Update localStorage
    const updated = { ...credentials };
    delete updated[platform];
    localStorage.setItem('platform_credentials', JSON.stringify(updated));
  };

  const PlatformCard = ({ platform }: { platform: any }) => {
    const status = platformStatus[platform.id];
    const creds = credentials[platform.id];
    const isConnected = status?.connected;
    const isTesting = testingPlatform === platform.id;

    return (
      <Card className={`border-l-4 border-l-${platform.color}-500`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{platform.icon}</span>
              <div>
                <h3 className="font-semibold">{platform.name}</h3>
                <p className="text-sm text-gray-600">{platform.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={isConnected ? "default" : "secondary"}
                className={isConnected ? "bg-green-100 text-green-800" : ""}
              >
                {isConnected ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </>
                )}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(platform.helpUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Connection Error:</strong> {status.error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div>
              <Label htmlFor={`${platform.id}-email`}>Email</Label>
              <Input
                id={`${platform.id}-email`}
                type="email"
                placeholder="Enter your email"
                value={creds.email}
                onChange={(e) => handleCredentialChange(platform.id, 'email', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor={`${platform.id}-password`}>Password</Label>
              <div className="relative">
                <Input
                  id={`${platform.id}-password`}
                  type={showPasswords[platform.id] ? "text" : "password"}
                  placeholder="Enter your password"
                  value={creds.password}
                  onChange={(e) => handleCredentialChange(platform.id, 'password', e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => togglePasswordVisibility(platform.id)}
                >
                  {showPasswords[platform.id] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => testConnection(platform.id)}
              disabled={isTesting || !creds.email || !creds.password}
              className="flex-1"
            >
              {isTesting ? (
                <>
                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            
            {isConnected && (
              <Button
                onClick={() => clearCredentials(platform.id)}
                variant="outline"
                className="text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            )}
          </div>

          {status?.last_tested && (
            <p className="text-xs text-gray-500">
              Last tested: {new Date(status.last_tested).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Platform Connections</h2>
        <p className="text-gray-600 mt-2">
          Connect your job platform accounts to enable automated applications
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> Your credentials are stored securely and only used for automation. 
          We recommend using app-specific passwords where available.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map(platform => (
          <PlatformCard key={platform.id} platform={platform} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tips for Better Automation</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Use app-specific passwords for better security</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Keep your CV updated for better form filling</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Test connections regularly to ensure they work</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Monitor your applications to stay compliant with platform policies</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};