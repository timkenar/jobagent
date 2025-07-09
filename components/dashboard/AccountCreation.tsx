import React from 'react';

interface AccountCreationProps {
  logs: string[];
}

export const AccountCreation: React.FC<AccountCreationProps> = ({ logs }) => {
  if (logs.length === 0) return null;

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
      <h6 className="text-xs font-medium text-gray-700 mb-2">Account Creation Progress:</h6>
      <div className="space-y-1">
        {logs.map((log, index) => (
          <p key={index} className="text-xs text-gray-600 font-mono">
            {log}
          </p>
        ))}
      </div>
    </div>
  );
};