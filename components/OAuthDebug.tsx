import React, { useState } from 'react';
import axios from 'axios';

const OAuthDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchDebug = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/email-accounts/oauth-init/?provider=gmail', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDebugInfo(res.data);
    } catch (err: any) {
      setError('Failed to fetch debug info');
    }
  };

  return (
    <div className="p-6">
      <button onClick={fetchDebug} className="bg-blue-500 text-white px-4 py-2 rounded">Fetch OAuth Debug Info</button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {debugInfo && (
        <div className="mt-4">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          {debugInfo.oauth_url && (
            <a href={debugInfo.oauth_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Open OAuth URL</a>
          )}
        </div>
      )}
    </div>
  );
};

export default OAuthDebug;