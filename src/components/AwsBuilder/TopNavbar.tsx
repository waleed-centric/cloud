import React, { useState } from 'react';
import { CloudProviderDropdown } from './CloudProviderDropdown';

interface TopNavbarProps {
  className?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('Canvas');

  const navItems = [
    { id: 'canvas', label: 'Canvas', icon: '🎨' },
    { id: 'cloud-connection', label: 'Cloud Connection', icon: '☁️' },
    { id: 'defaults', label: 'Defaults', icon: '⚙️' },
    { id: 'devops', label: 'DevOps', icon: '🚀' },
    { id: 'admin-access', label: 'Admin Access Control', icon: '🔐' }
  ];

  const handleTabClick = (tabLabel: string) => {
    setActiveTab(tabLabel);
    // Add functionality for each tab here
    console.log(`Switched to ${tabLabel} tab`);
  };

  return (
    <nav className={`bg-slate-800 border-b border-slate-700 shadow-lg ${className || ''}`}>
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CloudProviderDropdown />
            </div>
          </div>

          {/* <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.label)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    activeTab === item.label
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              className="bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>  */}

          {/* User Profile/Actions */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <button
                type="button"
                className="bg-slate-800 p-1 rounded-full text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
              >
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h10V9H4v2z" />
                </svg>
              </button>

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-slate-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">U</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className="md:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-700">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.label)}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200 flex items-center space-x-2 ${
                activeTab === item.label
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};