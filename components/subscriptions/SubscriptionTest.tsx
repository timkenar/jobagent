import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, AlertTriangle, CreditCard, Settings } from 'lucide-react';
import { subscriptionService } from '../../src/services/subscriptionService';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'running';
  message: string;
  details?: any;
}

const SubscriptionTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'API Connection', status: 'pending', message: 'Waiting to start...' },
    { name: 'Get Plans', status: 'pending', message: 'Waiting to start...' },
    { name: 'Get Stats', status: 'pending', message: 'Waiting to start...' },
    { name: 'Feature Access', status: 'pending', message: 'Waiting to start...' },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    setCurrentTest(0);

    // Test 1: API Connection (check if backend is running)
    updateTest(0, { status: 'running', message: 'Testing API connection...' });
    try {
      const response = await fetch('/api/subscriptions/stats/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'test_token'}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        updateTest(0, { 
          status: 'success', 
          message: 'API connection successful',
          details: { status: response.status }
        });
      } else {
        updateTest(0, { 
          status: 'error', 
          message: `API error: ${response.status} ${response.statusText}`,
          details: { status: response.status }
        });
      }
    } catch (error) {
      updateTest(0, { 
        status: 'error', 
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: error instanceof Error ? error.message : error }
      });
    }

    setCurrentTest(1);

    // Test 2: Get Plans
    updateTest(1, { status: 'running', message: 'Fetching subscription plans...' });
    try {
      const plans = await subscriptionService.getPlans();
      updateTest(1, { 
        status: 'success', 
        message: `Found ${plans.length} subscription plans`,
        details: { count: plans.length, plans: plans.map(p => p.name) }
      });
    } catch (error) {
      updateTest(1, { 
        status: 'error', 
        message: `Failed to fetch plans: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: error instanceof Error ? error.message : error }
      });
    }

    setCurrentTest(2);

    // Test 3: Get Stats
    updateTest(2, { status: 'running', message: 'Fetching subscription stats...' });
    try {
      const stats = await subscriptionService.getSubscriptionStats();
      updateTest(2, { 
        status: 'success', 
        message: `Stats retrieved successfully`,
        details: { 
          hasSubscription: stats.has_active_subscription,
          status: stats.subscription_status,
          features: Object.keys(stats.usage_stats)
        }
      });
    } catch (error) {
      updateTest(2, { 
        status: 'error', 
        message: `Failed to fetch stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: error instanceof Error ? error.message : error }
      });
    }

    setCurrentTest(3);

    // Test 4: Feature Access
    updateTest(3, { status: 'running', message: 'Testing feature access...' });
    try {
      const canAccess = await subscriptionService.canAccessFeature('job_applications', 1);
      updateTest(3, { 
        status: 'success', 
        message: `Feature access check completed`,
        details: { canAccessJobApplications: canAccess }
      });
    } catch (error) {
      updateTest(3, { 
        status: 'error', 
        message: `Feature access test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: error instanceof Error ? error.message : error }
      });
    }

    setIsRunning(false);
    setCurrentTest(-1);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
      case 'running':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'running':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
    }
  };

  const allTestsPassed = tests.every(test => test.status === 'success');
  const hasErrors = tests.some(test => test.status === 'error');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Subscription System Test</h1>
                <p className="text-gray-600 text-sm">Test the subscription module functionality</p>
              </div>
            </div>
            <button
              onClick={runTests}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="p-6 space-y-4">
          {tests.map((test, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border transition-all ${
                currentTest === index 
                  ? 'border-blue-300 bg-blue-50' 
                  : test.status === 'success'
                  ? 'border-green-200 bg-green-50'
                  : test.status === 'error'
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{test.name}</h3>
                    <p className={`text-sm ${getStatusColor(test.status)}`}>
                      {test.message}
                    </p>
                  </div>
                </div>
                
                {test.details && (
                  <div className="text-xs text-gray-500">
                    <details className="cursor-pointer">
                      <summary>Details</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        {!isRunning && tests.some(t => t.status !== 'pending') && (
          <div className="border-t border-gray-200 p-6">
            <div className={`p-4 rounded-lg ${
              allTestsPassed 
                ? 'bg-green-50 border border-green-200' 
                : hasErrors 
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center space-x-2">
                {allTestsPassed ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-800">All tests passed!</span>
                  </>
                ) : hasErrors ? (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-800">Some tests failed</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-yellow-800">Tests completed with warnings</span>
                  </>
                )}
              </div>
              
              {allTestsPassed && (
                <div className="mt-3 space-y-2">
                  <p className="text-green-700 text-sm">
                    ✅ Your subscription system is working correctly!
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => window.location.href = '/subscription/plans'}
                      className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      View Plans
                    </button>
                    <button
                      onClick={() => window.location.href = '/subscription/dashboard'}
                      className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
              )}
              
              {hasErrors && (
                <div className="mt-3">
                  <p className="text-red-700 text-sm">
                    Please check your backend configuration and ensure:
                  </p>
                  <ul className="text-red-600 text-sm mt-2 space-y-1 list-disc list-inside">
                    <li>Django server is running</li>
                    <li>Subscriptions app is properly configured</li>
                    <li>Database migrations are applied</li>
                    <li>Paystack keys are set in environment</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Next Steps:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Set up Paystack currencies in your dashboard</span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configure webhook endpoints for real-time updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Test payment flows with test cards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTest;