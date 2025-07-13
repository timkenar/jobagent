import React from 'react';

// Use the correct path for the SVG icon in public/assets
const iconSrc = '/assets/icon.svg';

interface LogoSpinnerProps {
  size?: number;
  message?: string;
  inline?: boolean;
}

const LogoSpinner: React.FC<LogoSpinnerProps> = ({ size = 40, message, inline = false }) => {
  // For inline usage (like in buttons), use smaller size and no message
  if (inline) {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {/* Spinning circle */}
        <span
          className="absolute inset-0 rounded-full border-2 border-t-current border-b-current border-l-transparent border-r-transparent animate-spin"
          style={{
            borderColor: 'currentColor transparent currentColor transparent',
            animationDuration: '1s',
          }}
        />
        <img
          src={iconSrc}
          alt="Loading"
          className="relative z-10"
          style={{
            width: '50%',
            height: '50%',
            objectFit: 'contain',
          }}
        />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center my-4">
      <div
        className="flex items-center justify-center"
        style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
      >
        <div
          className="relative flex items-center justify-center"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Spinning circle */}
          <span
            className="absolute inset-0 rounded-full border-4 border-t-primary border-b-primary border-l-transparent border-r-transparent animate-spin"
            style={{
              borderColor: ' #0a63b3 transparent #072144 transparent',
              animationDuration: '1s',
            }}
          />
          <img
            src={iconSrc}
            alt="Logo"
            className="relative z-10"
            style={{
              width: '60%',
              height: '60%',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>
      {message && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>}
    </div>
  );
};

export default LogoSpinner;