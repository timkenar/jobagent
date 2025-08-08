import React, { useState, useRef, useEffect } from 'react';
import { Badge } from './badge';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  searchPlaceholder?: string;
  maxDisplay?: number;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  values,
  onChange,
  placeholder = "Select options...",
  className = "",
  searchPlaceholder = "Search...",
  maxDisplay = 3
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle option selection
  const toggleOption = (value: string) => {
    const newValues = values.includes(value)
      ? values.filter(v => v !== value)
      : [...values, value];
    onChange(newValues);
  };

  // Clear all selections
  const clearAll = () => {
    onChange([]);
  };

  // Get display text for selected items
  const getDisplayText = () => {
    if (values.length === 0) return placeholder;
    
    const selectedLabels = values
      .map(value => options.find(opt => opt.value === value)?.label)
      .filter(Boolean) as string[];
    
    if (selectedLabels.length <= maxDisplay) {
      return selectedLabels.join(', ');
    }
    
    return `${selectedLabels.slice(0, maxDisplay).join(', ')} +${selectedLabels.length - maxDisplay} more`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main dropdown button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-left text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
      >
        <span className={`block truncate ${values.length === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
          {getDisplayText()}
        </span>
        <div className="flex items-center space-x-2">
          {values.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {values.length}
            </Badge>
          )}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-300 dark:border-gray-600 max-h-80 overflow-hidden">
          {/* Search input */}
          <div className="sticky top-0 bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-2">
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <svg
                className="absolute left-2 top-2.5 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Header with select all/clear all */}
          <div className="sticky top-[60px] bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-3 py-2 flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {values.length} of {filteredOptions.length} selected
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => onChange(filteredOptions.map(opt => opt.value))}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Select All
              </button>
              {values.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={values.includes(option.value)}
                    onChange={() => toggleOption(option.value)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-900 dark:text-gray-100">
                    {option.label}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};