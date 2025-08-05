import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, ZoomIn, ZoomOut, RotateCcw, User, FileText, Bot, Search, Settings } from 'lucide-react';
import ProfileForm from './ProfileForm';           // Step 1: User profile setup
import CVUploadForm from './CVUploadForm';         // Step 2: CV/Resume upload
import AIAgentForm from './AIAgentForm';           // Step 3: AI agent configuration
import JobSearchForm from './JobSearchForm';       // Step 4: Job search automation
import { useAuth } from '../../src/contexts/AuthContext';

const WorkflowUI = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeForm, setActiveForm] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [canvasPos, setCanvasPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState({});
  const [draggedNode, setDraggedNode] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const canvasRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update profile completion when user data changes
  useEffect(() => {
    if (user) {
      const isComplete = !!(user.full_name && user.email && user.is_email_verified);
      setProfileComplete(isComplete);
    }
  }, [user]);
  
  // Workflow state - check profile completion from user context
  const [profileComplete, setProfileComplete] = useState(() => {
    // Check if user has essential profile fields
    if (user) {
      return !!(user.full_name && user.email && user.is_email_verified);
    }
    // Fallback to localStorage for backward compatibility
    try {
      const stored = localStorage.getItem('userProfile');
      return stored && JSON.parse(stored).full_name ? true : false;
    } catch (error) {
      console.warn('Error loading profile data:', error);
      return false;
    }
  });
  const [cvUploaded, setCvUploaded] = useState(() => {
    try {
      const stored = localStorage.getItem('cvData');
      return stored ? JSON.parse(stored).uploaded || false : false;
    } catch (error) {
      console.warn('Error loading CV data:', error);
      return false;
    }
  });
  const [aiAgentComplete, setAiAgentComplete] = useState(() => {
    try {
      const stored = localStorage.getItem('aiAgentConfig');
      return stored && JSON.parse(stored).chatModel ? true : false;
    } catch (error) {
      console.warn('Error loading AI agent config:', error);
      return false;
    }
  });
  const [jobSearchComplete, setJobSearchComplete] = useState(() => {
    try {
      const stored = localStorage.getItem('jobSearchConfig');
      return stored && JSON.parse(stored).keywords ? true : false;
    } catch (error) {
      console.warn('Error loading job search config:', error);
      return false;
    }
  });

  const nodes = [
    { 
      id: 'profile-setup', 
      title: 'Profile Setup', 
      icon: User, 
      status: profileComplete ? 'completed' : 'current',
      color: 'emerald',
      description: 'Complete your user profile information',
      formType: 'profile'
    },
    { 
      id: 'cv-upload', 
      title: 'CV Upload', 
      icon: FileText, 
      status: cvUploaded ? 'completed' : profileComplete ? 'current' : 'pending',
      color: 'blue',
      description: 'Upload and parse your resume/CV',
      formType: 'cv'
    },
    { 
      id: 'ai-agent-setup', 
      title: 'AI Agent', 
      icon: Bot, 
      status: aiAgentComplete ? 'completed' : cvUploaded ? 'current' : 'pending',
      color: 'purple',
      description: 'Configure your AI assistant settings',
      formType: 'ai'
    },
    { 
      id: 'job-search', 
      title: 'Job Search', 
      icon: Search, 
      status: jobSearchComplete ? 'completed' : aiAgentComplete ? 'current' : 'pending',
      color: 'orange',
      description: 'Set up automated job search parameters',
      formType: 'search'
    }
  ];

  const connections = [
    { from: 'profile-setup', to: 'cv-upload' },
    { from: 'cv-upload', to: 'ai-agent-setup' },
    { from: 'ai-agent-setup', to: 'job-search' }
  ];

  // Initialize node positions
  useEffect(() => {
    const initialPositions = {};
    nodes.forEach((node, index) => {
      initialPositions[node.id] = {
        x: 200 + index * 250,
        y: 200
      };
    });
    setNodePositions(initialPositions);
  }, []);

  // Handle canvas wheel zoom
  const handleCanvasWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(zoom + delta, 0.5), 2);
    setZoom(newZoom);
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setCanvasPos(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
    
    if (draggedNode) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - canvasPos.x) / zoom - 60;
      const y = (e.clientY - rect.top - canvasPos.y) / zoom - 60;
      setNodePositions(prev => ({
        ...prev,
        [draggedNode]: { x, y }
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
    setSelectedNode(nodeId);
  };

  const handleNodeClick = (nodeId) => {
    setSelectedNode(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node && (node.status === 'current' || node.status === 'completed')) {
      setActiveForm(node.formType);
    }
  };

  // Form completion handlers with error handling
  const handleProfileComplete = (data?: any) => {
    try {
      if (data) {
        localStorage.setItem('userProfile', JSON.stringify(data));
        console.log('Profile data saved successfully');
      }
      // Update profile completion based on user context
      if (user) {
        const isComplete = !!(user.full_name && user.email && user.is_email_verified);
        setProfileComplete(isComplete);
      } else {
        setProfileComplete(true);
      }
      setActiveForm(null);
    } catch (error) {
      console.error('Error saving profile data:', error);
      alert('Failed to save profile data. Please try again.');
    }
  };

  const handleCVUploadComplete = (data?: any) => {
    try {
      if (data) {
        const cvData = { ...data, uploaded: true, uploadDate: new Date().toISOString() };
        localStorage.setItem('cvData', JSON.stringify(cvData));
        console.log('CV data saved successfully');
      }
      setCvUploaded(true);
      setActiveForm(null);
    } catch (error) {
      console.error('Error saving CV data:', error);
      alert('Failed to save CV data. Please try again.');
    }
  };

  const handleAIAgentComplete = (config: any) => {
    try {
      if (config) {
        localStorage.setItem('aiAgentConfig', JSON.stringify(config));
        console.log('AI agent configuration saved successfully');
      }
      setAiAgentComplete(true);
      setActiveForm(null);
    } catch (error) {
      console.error('Error saving AI agent configuration:', error);
      alert('Failed to save AI agent configuration. Please try again.');
    }
  };

  const handleJobSearchComplete = (config: any) => {
    try {
      if (config) {
        localStorage.setItem('jobSearchConfig', JSON.stringify(config));
        console.log('Job search configuration saved successfully');
      }
      setJobSearchComplete(true);
      setActiveForm(null);
    } catch (error) {
      console.error('Error saving job search configuration:', error);
      alert('Failed to save job search configuration. Please try again.');
    }
  };

  const closeForm = () => {
    setActiveForm(null);
  };

  const getConnectionPath = (fromId, toId) => {
    const from = nodePositions[fromId];
    const to = nodePositions[toId];
    if (!from || !to) return '';

    const startX = from.x + 60;
    const startY = from.y + 60;
    const endX = to.x + 60;
    const endY = to.y + 60;

    const controlX = (startX + endX) / 2;
    return `M ${startX} ${startY} Q ${controlX} ${startY} ${endX} ${endY}`;
  };

  const resetView = () => {
    setZoom(1);
    setCanvasPos({ x: 0, y: 0 });
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);
  const completedNodes = nodes.filter(n => n.status === 'completed').length;

  // Form components using actual imported components
  const renderForm = () => {
    if (!activeForm) return null;

    const formComponents = {
      profile: (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto ${
            isMobile ? 'max-w-full mx-2' : 'max-w-2xl'
          } ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Profile Setup</h3>
                <button
                  onClick={closeForm}
                  className={`text-gray-500 hover:text-gray-700 ${darkMode ? 'hover:text-gray-300' : ''}`}
                >
                  ✕
                </button>
              </div>
              <ProfileForm 
                userProfile={user || (() => {
                  try {
                    return JSON.parse(localStorage.getItem('userProfile') || '{}');
                  } catch (error) {
                    console.warn('Error parsing user profile:', error);
                    return {};
                  }
                })()}
                onComplete={handleProfileComplete}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      ),
      cv: (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto ${
            isMobile ? 'max-w-full mx-2' : 'max-w-2xl'
          } ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">CV Upload</h3>
                <button
                  onClick={closeForm}
                  className={`text-gray-500 hover:text-gray-700 ${darkMode ? 'hover:text-gray-300' : ''}`}
                >
                  ✕
                </button>
              </div>
              <CVUploadForm 
                onComplete={handleCVUploadComplete}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      ),
      ai: (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto ${
            isMobile ? 'max-w-full mx-2' : 'max-w-2xl'
          } ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">AI Agent Configuration</h3>
                <button
                  onClick={closeForm}
                  className={`text-gray-500 hover:text-gray-700 ${darkMode ? 'hover:text-gray-300' : ''}`}
                >
                  ✕
                </button>
              </div>
              <AIAgentForm 
                onComplete={handleAIAgentComplete}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      ),
      search: (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto ${
            isMobile ? 'max-w-full mx-2' : 'max-w-5xl'
          } ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Job Search Setup</h3>
                <button
                  onClick={closeForm}
                  className={`text-gray-500 hover:text-gray-700 ${darkMode ? 'hover:text-gray-300' : ''}`}
                >
                  ✕
                </button>
              </div>
              <JobSearchForm 
                onComplete={handleJobSearchComplete}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )
    };

    return formComponents[activeForm];
  };

  return (
    <div className={`h-screen flex ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} ${isMobile ? 'flex-col' : ''}`}>
      {/* Mobile Header */}
      {isMobile && (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center justify-between`}>
          <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            AI Job Search
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Side Panel */}
      <div className={`
        ${isMobile 
          ? `fixed top-0 left-0 h-full w-80 transform transition-transform duration-300 ease-in-out z-50 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'w-80 relative'
        } 
        border-r ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Workflow
            </h1>
            <div className="flex items-center space-x-2">
              {!isMobile && (
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Set up your AI job search workflow
          </p>
        </div>

        {/* Progress */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Progress
            </h2>
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {completedNodes}/{nodes.length} complete
            </span>
          </div>
          <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4`}>
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(completedNodes / nodes.length) * 100}%` }} 
            />
          </div>
          
          {/* Workflow Status */}
          {completedNodes === nodes.length ? (
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-emerald-900' : 'bg-emerald-50'} border border-emerald-200`}>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-emerald-200' : 'text-emerald-800'}`}>
                    Workflow Complete!
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
                    AI agent is ready to find and apply for jobs
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900' : 'bg-green-50'} border border-green-200`}>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 animate-pulse">
                  <span className="text-white text-xs">{completedNodes + 1}</span>
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-green-200' : 'text-green-800'}`}>
                    Setup in Progress
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                    Complete {nodes.length - completedNodes} more step{nodes.length - completedNodes > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {nodes.map(node => (
              <div
                key={node.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  selectedNode === node.id
                    ? darkMode 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-green-50 border border-green-200'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  node.status === 'completed' ? 'bg-emerald-500' :
                  node.status === 'current' ? 'bg-green-500' :
                  'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {node.status === 'completed' ? (
                    <div className="w-4 h-4 text-white">✓</div>
                  ) : (
                    <node.icon size={16} className="text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {node.title}
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} capitalize`}>
                    {node.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Node Details or Quick Actions */}
        {completedNodes === nodes.length ? (
          <div className="p-6 flex-1">
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button 
                onClick={() => setActiveForm('search')}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                🚀 Start Job Search
              </button>
              <button 
                onClick={() => setActiveForm('profile')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                📝 Edit Profile
              </button>
              <button 
                onClick={() => setActiveForm('ai')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                🤖 AI Settings
              </button>
              <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Applications Today
                </h3>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {(() => {
                    try {
                      const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
                      const today = new Date().toISOString().split('T')[0];
                      const todayApplications = applications.filter((app: any) => 
                        app.applicationDate?.startsWith(today)
                      );
                      return todayApplications.length;
                    } catch {
                      return 0;
                    }
                  })()} applications submitted
                </p>
              </div>
            </div>
          </div>
        ) : selectedNodeData && (
          <div className="p-6 flex-1">
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {selectedNodeData.title}
            </h2>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Status
                </h3>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  selectedNodeData.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                  selectedNodeData.status === 'current' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    selectedNodeData.status === 'completed' ? 'bg-emerald-500' :
                    selectedNodeData.status === 'current' ? 'bg-green-500' :
                    'bg-gray-400'
                  }`} />
                  {selectedNodeData.status}
                </div>
              </div>
              
              {selectedNodeData.status === 'current' && (
                <button 
                  onClick={() => setActiveForm(selectedNodeData.formType)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Configure {selectedNodeData.title}
                </button>
              )}
              
              {selectedNodeData.status === 'completed' && (
                <button 
                  onClick={() => setActiveForm(selectedNodeData.formType)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  View {selectedNodeData.title}
                </button>
              )}
              
              {selectedNodeData.status === 'pending' && (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Complete previous steps to unlock
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Controls */}
        <div className={`p-4 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {isMobile ? 'Workflow' : 'Workflow Canvas'}
            </h2>
            {!isMobile && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={zoom >= 2}
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={resetView}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <RotateCcw size={16} />
                </button>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden relative">
          {isMobile ? (
            /* Mobile View - Vertical Node List */
            <div className={`h-full overflow-y-auto p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="space-y-4">
                {nodes.map((node, index) => (
                  <div key={node.id} className="relative">
                    {/* Connection Line */}
                    {index < nodes.length - 1 && (
                      <div className={`absolute left-8 top-16 w-0.5 h-8 ${
                        node.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                    )}
                    
                    {/* Node Card */}
                    <div
                      className={`relative bg-white dark:bg-gray-800 rounded-xl p-4 border-2 transition-all duration-200 ${
                        selectedNode === node.id
                          ? 'border-green-500 shadow-lg'
                          : node.status === 'completed'
                          ? 'border-emerald-300 shadow-md'
                          : node.status === 'current'
                          ? 'border-green-300 shadow-md'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => handleNodeClick(node.id)}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Node Icon */}
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          node.status === 'completed' ? 'bg-emerald-500' :
                          node.status === 'current' ? 'bg-green-500' :
                          'bg-gray-400 dark:bg-gray-500'
                        }`}>
                          {node.status === 'completed' ? (
                            <div className="text-white text-2xl">✓</div>
                          ) : (
                            <node.icon size={32} className="text-white" />
                          )}
                        </div>
                        
                        {/* Node Content */}
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {node.title}
                          </h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                            {node.description}
                          </p>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            node.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                            node.status === 'current' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              node.status === 'completed' ? 'bg-emerald-500' :
                              node.status === 'current' ? 'bg-green-500' :
                              'bg-gray-400'
                            }`} />
                            {node.status === 'completed' ? 'Completed' :
                             node.status === 'current' ? 'In Progress' :
                             'Pending'}
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        {(node.status === 'current' || node.status === 'completed') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveForm(node.formType);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              node.status === 'completed'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            {node.status === 'completed' ? 'View' : 'Configure'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Desktop View - Canvas */
            <div
              ref={canvasRef}
              className={`w-full h-full cursor-grab active:cursor-grabbing ${
                darkMode ? 'bg-gray-900' : 'bg-gray-50'
              }`}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onWheel={handleCanvasWheel}
            >
              <div
                className="absolute origin-center"
                style={{
                  transform: `translate(${canvasPos.x}px, ${canvasPos.y}px) scale(${zoom})`,
                  width: '2000px',
                  height: '1000px'
                }}
              >
                {/* Connections */}
                <svg className="absolute inset-0 pointer-events-none" width="2000" height="1000">
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill={darkMode ? '#6b7280' : '#9ca3af'}
                      />
                    </marker>
                  </defs>
                  {connections.map((conn, index) => (
                    <path
                      key={index}
                      d={getConnectionPath(conn.from, conn.to)}
                      fill="none"
                      stroke={darkMode ? '#4b5563' : '#d1d5db'}
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      markerEnd="url(#arrowhead)"
                      className="animate-pulse"
                    />
                  ))}
                </svg>

                {/* Nodes */}
                {nodes.map(node => {
                  const position = nodePositions[node.id] || { x: 0, y: 0 };
                  return (
                    <div
                      key={node.id}
                      className={`absolute w-32 h-32 rounded-2xl cursor-move transition-all duration-200 transform hover:scale-105 ${
                        selectedNode === node.id
                          ? darkMode
                            ? 'ring-2 ring-green-400 shadow-2xl shadow-green-500/20'
                            : 'ring-2 ring-green-500 shadow-2xl shadow-green-500/20'
                          : 'hover:shadow-xl'
                      } ${
                        node.status === 'completed'
                          ? darkMode
                            ? 'bg-gradient-to-br from-emerald-800 to-emerald-900 border-2 border-emerald-600'
                            : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300'
                          : node.status === 'current'
                          ? darkMode
                            ? 'bg-gradient-to-br from-green-800 to-green-900 border-2 border-green-600'
                            : 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300'
                          : darkMode
                          ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600'
                          : 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300'
                      }`}
                      style={{
                        left: position.x,
                        top: position.y
                      }}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      onClick={() => handleNodeClick(node.id)}
                    >
                      <div className="h-full flex flex-col items-center justify-center p-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                          node.status === 'completed' ? 'bg-emerald-500' :
                          node.status === 'current' ? 'bg-green-500' :
                          'bg-gray-400 dark:bg-gray-500'
                        }`}>
                          {node.status === 'completed' ? (
                            <div className="text-white text-xl">✓</div>
                          ) : (
                            <node.icon size={24} className="text-white" />
                          )}
                        </div>
                        <div className={`text-center text-xs font-medium leading-tight ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {node.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forms Modal */}
      {renderForm()}
    </div>
  );
};

export default WorkflowUI;