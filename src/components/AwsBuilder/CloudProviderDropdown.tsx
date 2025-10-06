import React, { useState, useRef, useEffect } from 'react';
import { useCloudProvider, CloudProvider } from '@/context/CloudProviderContext';
import Image from 'next/image';

interface CloudProviderDropdownProps {
  className?: string;
}

export const CloudProviderDropdown: React.FC<CloudProviderDropdownProps> = ({ className }) => {
  const { currentProvider, setProvider, providers } = useCloudProvider();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProviderSelect = (provider: CloudProvider) => {
    setProvider(provider);
    setIsOpen(false);
  };

  const currentProviderInfo = providers[currentProvider];

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      {/* <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-xl font-bold text-white hover:text-slate-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-md px-2 py-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-2xl"><Image src={currentProviderInfo.icon} width={24} height={24} alt={currentProviderInfo.name} /></span>
        <span className="sr-only">{currentProviderInfo.fullName} Builder</span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button> */}

      {/* Dropdown Menu */}
      {/* {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-700 rounded-lg shadow-xl border border-slate-600 z-50">
          <div className="py-2">
            {Object.entries(providers).map(([key, provider]) => (
              <button
                key={key}
                onClick={() => handleProviderSelect(key as CloudProvider)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-600 transition-colors duration-150 flex items-center space-x-3 ${currentProvider === key ? 'bg-slate-600 text-blue-400' : 'text-slate-200'
                  }`}
              >
                <span className="text-2xl"><Image src={provider.icon} width={24} height={24} alt={provider.name} /></span>
                <span className="sr-only">{provider.fullName}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{provider.fullName}</span>
                  <span className="text-sm text-slate-400">
                    {key === 'aws' && 'Amazon Web Services'}
                    {key === 'azure' && 'Microsoft Cloud Platform'}
                    {key === 'gcp' && 'Google Cloud Platform'}
                  </span>
                </div>
                {currentProvider === key && (
                  <div className="ml-auto">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-600 px-4 py-2">
            <p className="text-xs text-slate-400">
              Switch between cloud providers to build architectures
            </p>
          </div>
        </div>
      )} */}
    </div>
  );
};