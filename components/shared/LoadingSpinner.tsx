
import React from 'react';

const LoadingSpinner: React.FC<{ size?: number, message?: string }> = ({ size = 8, message }) => {
  return (
    <div className="flex flex-col items-center justify-center my-4">
      <div className={`animate-spin rounded-full h-${size} w-${size} border-b-2 border-sky-600 dark:border-sky-400`}></div>
      {message && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
    