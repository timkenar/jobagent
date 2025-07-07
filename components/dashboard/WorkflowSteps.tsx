import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types
type NodeTypes = 'email' | 'profile' | 'jobSearch' | 'customAction';
type NodeStatus = 'idle' | 'running' | 'completed' | 'error';
type WorkflowStatus = 'idle' | 'running' | 'completed' | 'error';

interface NodeData {
  id: string;
  type: NodeTypes;
  position: { x: number; y: number };
  data: any;
  status: NodeStatus;
}

interface Connection {
  id: string;
  source: string;
  target: string;
  status: 'idle' | 'active' | 'completed';
}

interface Workflow {
  id: string;
  name: string;
  nodes: NodeData[];
  connections: Connection[];
  status: WorkflowStatus;
}

const WorkflowSteps: React.FC = () => {
  // State for the workflow
  const [workflow, setWorkflow] = useState<Workflow>({
    id: uuidv4(),
    name: 'New Workflow',
    nodes: [],
    connections: [],
    status: 'idle'
  });

  // UI state
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Handle canvas drag
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setCanvasPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  // Add a new node to the workflow
  const addNode = (type: NodeTypes, position: { x: number; y: number }) => {
    const newNode: NodeData = {
      id: uuidv4(),
      type,
      position,
      data: {},
      status: 'idle'
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  };

  // Remove a node
  const removeNode = (nodeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(
        conn => conn.source !== nodeId && conn.target !== nodeId
      )
    }));
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  // Update node data
  const updateNodeData = (nodeId: string, data: any) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, data } : node
      )
    }));
  };

  // Add a connection between nodes
  const addConnection = (source: string, target: string) => {
    // Check if connection already exists
    const exists = workflow.connections.some(
      conn => conn.source === source && conn.target === target
    );
    if (exists) return;

    const newConnection: Connection = {
      id: uuidv4(),
      source,
      target,
      status: 'idle'
    };

    setWorkflow(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection]
    }));
  };

  // Remove a connection
  const removeConnection = (connectionId: string) => {
    setWorkflow(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId)
    }));
  };

  // Execute the workflow
  const executeWorkflow = async () => {
    setIsExecuting(true);
    setWorkflow(prev => ({ ...prev, status: 'running' }));
    
    // Reset all node statuses
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => ({ ...node, status: 'idle' })),
      connections: prev.connections.map(conn => ({ ...conn, status: 'idle' }))
    }));

    // Find start nodes (nodes with no incoming connections)
    const startNodes = workflow.nodes.filter(node => 
      !workflow.connections.some(conn => conn.target === node.id)
    );

    // Execute nodes in order (this is a simplified execution)
    for (const node of startNodes) {
      await executeNode(node);
    }

    setWorkflow(prev => ({ ...prev, status: 'completed' }));
    setIsExecuting(false);
  };

  // Execute a single node
  const executeNode = async (node: NodeData) => {
    // Update node status
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => 
        n.id === node.id ? { ...n, status: 'running' } : n
      )
    }));

    // Simulate node execution (replace with actual logic)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mark node as completed
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => 
        n.id === node.id ? { ...n, status: 'completed' } : n
      )
    }));

    // Find and execute connected nodes
    const outgoingConnections = workflow.connections.filter(
      conn => conn.source === node.id
    );
    
    for (const connection of outgoingConnections) {
      // Update connection status
      setWorkflow(prev => ({
        ...prev,
        connections: prev.connections.map(conn => 
          conn.id === connection.id ? { ...conn, status: 'active' } : conn
        )
      }));

      const targetNode = workflow.nodes.find(n => n.id === connection.target);
      if (targetNode) {
        await executeNode(targetNode);
      }
    }
  };

  // Simple Node Component
  const SimpleNode: React.FC<{
    node: NodeData;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
    theme: 'light' | 'dark';
  }> = ({ node, isSelected, onSelect, onDelete, theme }) => {
    const getNodeInfo = () => {
      switch (node.type) {
        case 'email':
          return { title: 'Email', color: 'bg-blue-500', icon: '📧' };
        case 'profile':
          return { title: 'Profile', color: 'bg-purple-500', icon: '👤' };
        case 'jobSearch':
          return { title: 'Job Search', color: 'bg-green-500', icon: '🔍' };
        case 'customAction':
          return { title: 'Custom', color: 'bg-yellow-500', icon: '⚙️' };
      }
    };

    const nodeInfo = getNodeInfo();

    return (
      <div
        onClick={onSelect}
        className={`absolute w-32 h-16 rounded-lg border-2 cursor-pointer transition-all ${
          isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-300'
        } ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
        style={{
          left: node.position.x,
          top: node.position.y
        }}
      >
        <div className="flex items-center justify-center h-full p-2">
          <div className={`${nodeInfo.color} text-white p-1 rounded mr-2 text-xs`}>
            {nodeInfo.icon}
          </div>
          <div className="text-xs font-medium">{nodeInfo.title}</div>
        </div>
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
          >
            ×
          </button>
        )}
      </div>
    );
  };

  // Calculate connection path between nodes
  const getConnectionPath = (sourceId: string, targetId: string) => {
    const sourceNode = workflow.nodes.find(node => node.id === sourceId);
    const targetNode = workflow.nodes.find(node => node.id === targetId);
    
    if (!sourceNode || !targetNode) return '';

    const startX = sourceNode.position.x + 150; // Node width is 150
    const startY = sourceNode.position.y + 25; // Middle of node height (50)
    const endX = targetNode.position.x;
    const endY = targetNode.position.y + 25;

    // Create a smooth bezier curve
    const cpx = (startX + endX) / 2;
    return `M${startX},${startY} C${cpx},${startY} ${cpx},${endY} ${endX},${endY}`;
  };

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`p-4 flex justify-between items-center border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <h1 className="text-xl font-bold">Visual Workflow Builder</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={executeWorkflow}
            disabled={isExecuting || workflow.nodes.length === 0}
            className={`px-4 py-2 rounded-lg font-medium ${isExecuting ? 'bg-yellow-600' : 'bg-green-600 hover:bg-green-700'} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isExecuting ? 'Executing...' : 'Run Workflow'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`w-64 p-4 border-r ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <h2 className="font-semibold mb-4">Node Library</h2>
          
          <div className="space-y-2">
            <DraggableNode type="email" theme={theme} onClick={() => addNode('email', { x: 100, y: 100 })} />
            <DraggableNode type="profile" theme={theme} onClick={() => addNode('profile', { x: 100, y: 200 })} />
            <DraggableNode type="jobSearch" theme={theme} onClick={() => addNode('jobSearch', { x: 100, y: 300 })} />
            <DraggableNode type="customAction" theme={theme} onClick={() => addNode('customAction', { x: 100, y: 400 })} />
          </div>

          <div className="mt-8">
            <h2 className="font-semibold mb-4">Templates</h2>
            <button
              className={`w-full p-3 mb-2 text-left rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => {
                // Load a simple template
                setWorkflow({
                  id: uuidv4(),
                  name: 'Job Application Template',
                  nodes: [
                    {
                      id: uuidv4(),
                      type: 'profile',
                      position: { x: 100, y: 100 },
                      data: {},
                      status: 'idle'
                    },
                    {
                      id: uuidv4(),
                      type: 'jobSearch',
                      position: { x: 400, y: 100 },
                      data: {},
                      status: 'idle'
                    },
                    {
                      id: uuidv4(),
                      type: 'email',
                      position: { x: 700, y: 100 },
                      data: {},
                      status: 'idle'
                    }
                  ],
                  connections: [],
                  status: 'idle'
                });
              }}
            >
              Job Application Flow
            </button>
          </div>
        </div>

        {/* Main Canvas */}
        <div 
          ref={canvasRef}
          className={`flex-1 relative overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          <div
            className="absolute origin-top-left"
            style={{
              transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${zoom})`,
              width: '100%',
              height: '100%'
            }}
          >

            {/* Render nodes */}
            {workflow.nodes.map(node => (
              <SimpleNode
                key={node.id}
                node={node}
                isSelected={selectedNode === node.id}
                onSelect={() => setSelectedNode(node.id)}
                onDelete={() => removeNode(node.id)}
                theme={theme}
              />
            ))}

            {/* Simple connection lines */}
            <div className="absolute inset-0 pointer-events-none">
              {workflow.connections.map(connection => {
                const path = getConnectionPath(connection.source, connection.target);
                return path ? (
                  <svg key={connection.id} className="absolute top-0 left-0 w-full h-full">
                    <path
                      d={path}
                      fill="none"
                      stroke={connection.status === 'active' ? '#3b82f6' : '#9ca3af'}
                      strokeWidth="2"
                      strokeDasharray={connection.status === 'active' ? '5,5' : 'none'}
                    />
                  </svg>
                ) : null;
              })}
            </div>
          </div>

          {/* Canvas controls */}
          <div className={`absolute bottom-4 right-4 flex space-x-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-2 rounded-lg shadow-lg`}>
            <button 
              onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
              className="p-2 rounded hover:bg-gray-200"
              disabled={zoom >= 2}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button 
              onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
              className="p-2 rounded hover:bg-gray-200"
              disabled={zoom <= 0.5}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button 
              onClick={() => {
                setZoom(1);
                setCanvasPosition({ x: 0, y: 0 });
              }}
              className="p-2 rounded hover:bg-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Properties Panel */}
        <div className={`w-80 p-4 border-l ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          {selectedNode ? (
            <NodeProperties 
              node={workflow.nodes.find(n => n.id === selectedNode)!}
              onUpdate={(data: any) => updateNodeData(selectedNode, data)}
              theme={theme}
            />
          ) : workflow.connections.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">Connections</h2>
              <div className="space-y-3">
                {workflow.connections.map(conn => (
                  <div 
                    key={conn.id} 
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-medium">Connection</span>
                      <div className="text-xs text-gray-500">ID: {conn.id}</div>
                    </div>
                    <button
                      onClick={() => removeConnection(conn.id)}
                      className={`p-1 rounded-full ${
                        theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium mb-1">No Selection</h3>
              <p className="text-sm text-gray-500">Select a node or connection to edit its properties</p>
            </div>
          )}
        </div>
      </div>

      {/* Execution Status */}
      {isExecuting && (
        <div className={`fixed bottom-4 left-4 p-4 rounded-lg shadow-lg ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Executing workflow...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Node Component for Sidebar
const DraggableNode: React.FC<{ 
  type: NodeTypes; 
  theme: 'light' | 'dark';
  onClick: () => void;
}> = ({ type, theme, onClick }) => {

  const getNodeInfo = () => {
    switch (type) {
      case 'email':
        return {
          title: 'Email Integration',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          color: 'bg-blue-500'
        };
      case 'profile':
        return {
          title: 'Profile Setup',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          color: 'bg-purple-500'
        };
      case 'jobSearch':
        return {
          title: 'Job Search',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          ),
          color: 'bg-green-500'
        };
      case 'customAction':
        return {
          title: 'Custom Action',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          color: 'bg-yellow-500'
        };
    }
  };

  const nodeInfo = getNodeInfo();

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer flex items-center space-x-3 transition-all hover:scale-105 ${
        theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      <div className={`${nodeInfo.color} text-white p-2 rounded-lg`}>
        {nodeInfo.icon}
      </div>
      <div>
        <h3 className="font-medium">{nodeInfo.title}</h3>
        <p className="text-xs text-gray-500">Click to add</p>
      </div>
    </div>
  );
};

// Node Properties Panel
const NodeProperties: React.FC<{ node: NodeData; onUpdate: (data: any) => void; theme: 'light' | 'dark' }> = ({ 
  node, 
  onUpdate,
  theme
}) => {
  const [data, setData] = useState(node.data);

  useEffect(() => {
    setData(node.data);
  }, [node.id]);

  const handleChange = (key: string, value: any) => {
    const newData = { ...data, [key]: value };
    setData(newData);
    onUpdate(newData);
  };

  const renderFields = () => {
    switch (node.type) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Service</label>
              <select
                value={data.service || ''}
                onChange={(e) => handleChange('service', e.target.value)}
                className={`w-full p-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Select service</option>
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Template</label>
              <textarea
                value={data.template || ''}
                onChange={(e) => handleChange('template', e.target.value)}
                rows={5}
                className={`w-full p-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
                placeholder="Enter your email template..."
              />
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">CV/Resume</label>
              <textarea
                value={data.cv || ''}
                onChange={(e) => handleChange('cv', e.target.value)}
                rows={5}
                className={`w-full p-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
                placeholder="Enter your CV content..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Skills</label>
              <input
                type="text"
                value={data.skills || ''}
                onChange={(e) => handleChange('skills', e.target.value)}
                className={`w-full p-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
                placeholder="Comma separated skills"
              />
            </div>
          </div>
        );
      case 'jobSearch':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Keywords</label>
              <input
                type="text"
                value={data.keywords || ''}
                onChange={(e) => handleChange('keywords', e.target.value)}
                className={`w-full p-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
                placeholder="e.g. React, Node.js"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={data.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                className={`w-full p-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
                placeholder="e.g. Remote, New York"
              />
            </div>
          </div>
        );
      case 'customAction':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Action Type</label>
              <select
                value={data.actionType || ''}
                onChange={(e) => handleChange('actionType', e.target.value)}
                className={`w-full p-2 rounded border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Select action type</option>
                <option value="api">API Call</option>
                <option value="delay">Delay</option>
                <option value="condition">Condition</option>
              </select>
            </div>
            {data.actionType === 'api' && (
              <div>
                <label className="block text-sm font-medium mb-1">API Endpoint</label>
                <input
                  type="text"
                  value={data.endpoint || ''}
                  onChange={(e) => handleChange('endpoint', e.target.value)}
                  className={`w-full p-2 rounded border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  placeholder="https://api.example.com/endpoint"
                />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {node.type === 'email' && 'Email Integration'}
          {node.type === 'profile' && 'Profile Setup'}
          {node.type === 'jobSearch' && 'Job Search'}
          {node.type === 'customAction' && 'Custom Action'}
        </h2>
        <div className={`w-3 h-3 rounded-full ${
          node.status === 'idle' ? 'bg-gray-400' :
          node.status === 'running' ? 'bg-yellow-500 animate-pulse' :
          node.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </div>
      
      {renderFields()}
    </div>
  );
};


export default WorkflowSteps;