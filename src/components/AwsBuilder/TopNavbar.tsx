import React, { useState } from 'react';
import Image from 'next/image';

interface TopNavbarProps {
  className?: string;
  onClearAll?: () => void;
  onImport?: () => void;
  onSave?: () => void;
  onExport?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ className, onClearAll, onImport, onSave, onExport }) => {
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

  const handleImport = () => (onImport ? onImport() : console.log('Import clicked'));
  const handleSave = () => (onSave ? onSave() : console.log('Save clicked'));
  const handleExport = () => (onExport ? onExport() : console.log('Export clicked'));
  const handleClearAll = () => (onClearAll ? onClearAll() : console.log('Clear All clicked'));

  return (
    <nav className={`bg-white border-b border-gray-200 shadow-sm ${className || ''}`}>
      {/* Top toolbar */}
      <div className="w-full px-3 sm:px-4">
        <div className="flex items-center  h-12">
          {/* Brand */}
          <div className="flex items-center gap-2 mr-5">
            <div className="h-[50px] w-[150px] relative">
              <Image src="/aws/Logo.png" alt="ClickLogic" fill className="object-contain" />
            </div>
          </div>

          {/* Actions center cluster */}
          <div className="flex items-center gap-2 sm:gap-3 text-slate-700 mr-auto">
            <button onClick={handleImport} className=" px-2 py-1 rounded hover:bg-gray-100 flex items-center">
              <Image src="/images/Import.png" alt="Import" className="w-4 h-4 mr-1" width={15} height={15} />
              Import
            </button>
            <button onClick={handleSave} className="px-2 py-1 rounded hover:bg-gray-100 flex items-center">
              <Image src="/images/Save.png" alt="Save" className="w-4 h-4 mr-1" width={15} height={15} />
              Save
            </button>
            <button onClick={handleExport} className="px-2 py-1 rounded hover:bg-gray-100 flex items-center">
              <Image src="/images/Export.png" alt="Export" className="w-4 h-4 mr-1" width={15} height={15} />
              Export
            </button>
            <span className="h-5 w-px bg-gray-200 mx-1" />
            <button className="px-2 py-1 rounded hover:bg-gray-100" title="Undo">↶</button>
            <button className="px-2 py-1 rounded hover:bg-gray-100" title="Redo">↷</button>
            <span className="h-5 w-px bg-gray-200 mx-1" />
            <button className="px-2 py-1 rounded hover:bg-gray-100" title="Zoom out">−</button>
            <span className="text-sm">100%</span>
            <button className="px-2 py-1 rounded hover:bg-gray-100" title="Zoom in">+</button>
            <button className="px-2 py-1 rounded hover:bg-gray-100" title="Fullscreen">⛶</button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Team initials */}
            <div className="hidden sm:flex items-center gap-1">
              {['SC','AK','MG'].map((t) => (
                <div key={t} className="relative h-7 w-7 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center">
                  {t}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-white" />
                </div>
              ))}
            </div>
            <button className="py-1 rounded " title="Settings">
              <Image src={'/images/Group.png'} width={40} height={40} alt='group'/>
            </button>
            <button className="px-2 py-1 rounded  text-black flex items-center ">
              <Image src="/images/Deploy.png" alt="Deploy" className="w-4 h-4 mr-1" width={15} height={15} />
              Deploy
              </button>
            <button className="px-2 py-1 rounded-md bg-blue-600 text-white flex items-center hover:bg-blue-700">
              <Image src="/images/Share.png" alt="Share" className="w-4 h-4 mr-1" width={15} height={15} />
              Share
            </button>
            <div className="h-8 w-8 rounded-full bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center">JD</div>
          </div>
        </div>
      </div>

      {/* Secondary tabs row */}
      <div className="w-full border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between px-3 sm:px-4 h-10">
          <div className='text-black font-semibold pl-[50px]'>John Project Infrastructure Design</div>
          <div className="flex items-center gap-2 sm:gap-3 -ml-[50px]">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.label)}
                className={`px-3 py-1.5  text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  activeTab === item.label
                    ? 'bg-[#EFF6FF] text-[#155DFC] border-b-2 border-[#155DFC]'
                    : 'text-[#4A5565] hover:bg-gray-100'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <button onClick={handleClearAll} className="text-sm font-medium text-red-600 hover:text-red-700">Clear All</button>
        </div>
      </div>
    </nav>
  );
};