import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ children, className = '' }) => {
  return (
    <div className={`border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-md p-4 transition-colors ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {/* Icon space */}
        </div>
        <div className="ml-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export const AlertDescription: React.FC<AlertProps> = ({ children, className = '' }) => {
  return (
    <div className={`text-sm text-blue-800 dark:text-blue-200 transition-colors ${className}`}>
      {children}
    </div>
  );
};