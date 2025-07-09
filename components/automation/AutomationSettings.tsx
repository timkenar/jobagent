import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Shield, 
  Clock, 
  Bot,
  AlertTriangle,
  CheckCircle,
  Globe,
  Smartphone
} from 'lucide-react';

interface AutomationSettingsProps {
  user: any;
}

interface AutomationConfig {
  // General Settings
  max_applications_per_day: number;
  max_applications_per_session: number;
  enable_automation: boolean;
  
  // Timing Settings
  delay_between_applications: number;
  delay_between_actions: number;
  working_hours_start: string;
  working_hours_end: string;
  
  // Safety Settings
  enable_captcha_detection: boolean;
  enable_rate_limiting: boolean;
  max_retries: number;
  
  // Browser Settings
  headless_mode: boolean;
  user_agent: string;
  window_size: string;
  
  // Form Filling Settings
  auto_fill_forms: boolean;
  custom_cover_letter: string;
  skip_manual_applications: boolean;
  
  // Platform Settings
  preferred_platforms: string[];
  
  // Notification Settings
  email_notifications: boolean;
  sms_notifications: boolean;
  notification_frequency: string;
}

export const AutomationSettings: React.FC<AutomationSettingsProps> = ({ user }) => {
  const [config, setConfig] = useState<AutomationConfig>({
    max_applications_per_day: 10,
    max_applications_per_session: 5,
    enable_automation: true,
    delay_between_applications: 60,
    delay_between_actions: 2,
    working_hours_start: '09:00',
    working_hours_end: '17:00',
    enable_captcha_detection: true,
    enable_rate_limiting: true,
    max_retries: 3,
    headless_mode: true,
    user_agent: '',
    window_size: '1920x1080',
    auto_fill_forms: true,
    custom_cover_letter: '',
    skip_manual_applications: false,
    preferred_platforms: ['linkedin', 'indeed'],
    email_notifications: true,
    sms_notifications: false,
    notification_frequency: 'daily'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from localStorage or API
      const savedSettings = localStorage.getItem('automation_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setConfig(parsed);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage or API
      localStorage.setItem('automation_settings', JSON.stringify(config));
      setHasChanges(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    setConfig({
      max_applications_per_day: 10,
      max_applications_per_session: 5,
      enable_automation: true,
      delay_between_applications: 60,
      delay_between_actions: 2,
      working_hours_start: '09:00',
      working_hours_end: '17:00',
      enable_captcha_detection: true,
      enable_rate_limiting: true,
      max_retries: 3,
      headless_mode: true,
      user_agent: '',
      window_size: '1920x1080',
      auto_fill_forms: true,
      custom_cover_letter: '',
      skip_manual_applications: false,
      preferred_platforms: ['linkedin', 'indeed'],
      email_notifications: true,
      sms_notifications: false,
      notification_frequency: 'daily'
    });
    setHasChanges(true);
  };

  const updateConfig = (key: keyof AutomationConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const SettingsSection = ({ title, icon: Icon, children }: any) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icon className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );

  const SettingRow = ({ label, description, children }: any) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Automation Settings</h2>
          <p className="text-gray-600">Configure your job application automation preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          <Button
            onClick={resetSettings}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={saveSettings}
            disabled={isSaving || !hasChanges}
            size="sm"
          >
            {isSaving ? (
              <>
                <Settings className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          These settings control how the automation system behaves. Adjust them carefully to ensure 
          compliance with platform policies and to optimize your job search experience.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <SettingsSection title="General Settings" icon={Settings}>
          <SettingRow
            label="Enable Automation"
            description="Turn automation on/off globally"
          >
            <Switch
              checked={config.enable_automation}
              onCheckedChange={(checked) => updateConfig('enable_automation', checked)}
            />
          </SettingRow>

          <SettingRow
            label="Max Applications per Day"
            description="Daily limit for job applications"
          >
            <Input
              type="number"
              min="1"
              max="50"
              value={config.max_applications_per_day}
              onChange={(e) => updateConfig('max_applications_per_day', parseInt(e.target.value))}
              className="w-20"
            />
          </SettingRow>

          <SettingRow
            label="Max Applications per Session"
            description="Limit per automation session"
          >
            <Input
              type="number"
              min="1"
              max="20"
              value={config.max_applications_per_session}
              onChange={(e) => updateConfig('max_applications_per_session', parseInt(e.target.value))}
              className="w-20"
            />
          </SettingRow>

          <SettingRow
            label="Preferred Platforms"
            description="Select your preferred job platforms"
          >
            <div className="space-y-2">
              {['linkedin', 'indeed'].map(platform => (
                <div key={platform} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={platform}
                    checked={config.preferred_platforms.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateConfig('preferred_platforms', [...config.preferred_platforms, platform]);
                      } else {
                        updateConfig('preferred_platforms', config.preferred_platforms.filter(p => p !== platform));
                      }
                    }}
                  />
                  <Label htmlFor={platform} className="capitalize">{platform}</Label>
                </div>
              ))}
            </div>
          </SettingRow>
        </SettingsSection>

        {/* Timing Settings */}
        <SettingsSection title="Timing Settings" icon={Clock}>
          <SettingRow
            label="Delay Between Applications"
            description="Seconds to wait between job applications"
          >
            <Input
              type="number"
              min="30"
              max="300"
              value={config.delay_between_applications}
              onChange={(e) => updateConfig('delay_between_applications', parseInt(e.target.value))}
              className="w-20"
            />
          </SettingRow>

          <SettingRow
            label="Delay Between Actions"
            description="Seconds to wait between form actions"
          >
            <Input
              type="number"
              min="1"
              max="10"
              value={config.delay_between_actions}
              onChange={(e) => updateConfig('delay_between_actions', parseInt(e.target.value))}
              className="w-20"
            />
          </SettingRow>

          <SettingRow
            label="Working Hours Start"
            description="Start time for automation"
          >
            <Input
              type="time"
              value={config.working_hours_start}
              onChange={(e) => updateConfig('working_hours_start', e.target.value)}
              className="w-32"
            />
          </SettingRow>

          <SettingRow
            label="Working Hours End"
            description="End time for automation"
          >
            <Input
              type="time"
              value={config.working_hours_end}
              onChange={(e) => updateConfig('working_hours_end', e.target.value)}
              className="w-32"
            />
          </SettingRow>
        </SettingsSection>

        {/* Safety Settings */}
        <SettingsSection title="Safety Settings" icon={Shield}>
          <SettingRow
            label="Enable CAPTCHA Detection"
            description="Pause automation when CAPTCHA is detected"
          >
            <Switch
              checked={config.enable_captcha_detection}
              onCheckedChange={(checked) => updateConfig('enable_captcha_detection', checked)}
            />
          </SettingRow>

          <SettingRow
            label="Enable Rate Limiting"
            description="Automatically slow down when rate limits are detected"
          >
            <Switch
              checked={config.enable_rate_limiting}
              onCheckedChange={(checked) => updateConfig('enable_rate_limiting', checked)}
            />
          </SettingRow>

          <SettingRow
            label="Max Retries"
            description="Maximum retry attempts for failed applications"
          >
            <Input
              type="number"
              min="1"
              max="5"
              value={config.max_retries}
              onChange={(e) => updateConfig('max_retries', parseInt(e.target.value))}
              className="w-20"
            />
          </SettingRow>
        </SettingsSection>

        {/* Browser Settings */}
        <SettingsSection title="Browser Settings" icon={Globe}>
          <SettingRow
            label="Headless Mode"
            description="Run browser in background (recommended)"
          >
            <Switch
              checked={config.headless_mode}
              onCheckedChange={(checked) => updateConfig('headless_mode', checked)}
            />
          </SettingRow>

          <SettingRow
            label="Window Size"
            description="Browser window dimensions"
          >
            <Select
              value={config.window_size}
              onValueChange={(value) => updateConfig('window_size', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1920x1080">1920x1080</SelectItem>
                <SelectItem value="1366x768">1366x768</SelectItem>
                <SelectItem value="1280x720">1280x720</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            label="Custom User Agent"
            description="Override default browser user agent"
          >
            <Input
              placeholder="Leave empty for default"
              value={config.user_agent}
              onChange={(e) => updateConfig('user_agent', e.target.value)}
              className="w-full"
            />
          </SettingRow>
        </SettingsSection>

        {/* Form Filling Settings */}
        <SettingsSection title="Form Filling Settings" icon={Bot}>
          <SettingRow
            label="Auto-fill Forms"
            description="Automatically fill application forms using CV data"
          >
            <Switch
              checked={config.auto_fill_forms}
              onCheckedChange={(checked) => updateConfig('auto_fill_forms', checked)}
            />
          </SettingRow>

          <SettingRow
            label="Skip Manual Applications"
            description="Only apply to jobs with automated application forms"
          >
            <Switch
              checked={config.skip_manual_applications}
              onCheckedChange={(checked) => updateConfig('skip_manual_applications', checked)}
            />
          </SettingRow>

          <div>
            <Label htmlFor="cover-letter" className="text-sm font-medium">
              Custom Cover Letter Template
            </Label>
            <p className="text-xs text-gray-500 mt-1 mb-2">
              Optional custom cover letter. Leave empty to use AI-generated letters.
            </p>
            <Textarea
              id="cover-letter"
              placeholder="Enter your cover letter template..."
              value={config.custom_cover_letter}
              onChange={(e) => updateConfig('custom_cover_letter', e.target.value)}
              rows={4}
            />
          </div>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection title="Notification Settings" icon={Smartphone}>
          <SettingRow
            label="Email Notifications"
            description="Receive email updates about automation progress"
          >
            <Switch
              checked={config.email_notifications}
              onCheckedChange={(checked) => updateConfig('email_notifications', checked)}
            />
          </SettingRow>

          <SettingRow
            label="SMS Notifications"
            description="Receive SMS updates (requires phone number)"
          >
            <Switch
              checked={config.sms_notifications}
              onCheckedChange={(checked) => updateConfig('sms_notifications', checked)}
            />
          </SettingRow>

          <SettingRow
            label="Notification Frequency"
            description="How often to receive notifications"
          >
            <Select
              value={config.notification_frequency}
              onValueChange={(value) => updateConfig('notification_frequency', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </SettingsSection>
      </div>

      {/* Advanced Settings Warning */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Advanced Settings:</strong> Modifying these settings may affect automation performance. 
          Make sure to test your configuration before running large automation sessions.
        </AlertDescription>
      </Alert>
    </div>
  );
};