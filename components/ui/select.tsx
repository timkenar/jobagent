import React, { useState } from 'react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
            value,
            onValueChange
          } as any);
        }
        return child;
      })}
    </div>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps & any> = ({ 
  children, 
  className = '', 
  isOpen, 
  setIsOpen 
}) => {
  return (
    <button
      type="button"
      className={`relative w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </span>
    </button>
  );
};

export const SelectContent: React.FC<SelectContentProps & any> = ({ 
  children, 
  isOpen, 
  setIsOpen, 
  value, 
  onValueChange 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isSelected: child.props.value === value,
            onClick: () => {
              onValueChange(child.props.value);
              setIsOpen(false);
            }
          } as any);
        }
        return child;
      })}
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps & any> = ({ 
  value, 
  children, 
  isSelected, 
  onClick 
}) => {
  return (
    <div
      className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${
        isSelected ? 'text-blue-600 bg-blue-50' : 'text-gray-900'
      }`}
      onClick={onClick}
    >
      <span className="block truncate">{children}</span>
      {isSelected && (
        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      )}
    </div>
  );
};

export const SelectValue: React.FC<SelectValueProps & any> = ({ 
  placeholder = 'Select...', 
  value 
}) => {
  return (
    <span className="block truncate">
      {value || placeholder}
    </span>
  );
};