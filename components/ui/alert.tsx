import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ children, className = '' }) => {
  return (
    <div className={`border border-blue-200 bg-blue-50 rounded-md p-4 ${className}`}>
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
    <div className={`text-sm text-blue-800 ${className}`}>
      {children}
    </div>
  );
};