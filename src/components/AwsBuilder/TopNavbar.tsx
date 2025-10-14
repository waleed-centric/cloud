import React, { useState } from 'react';
import Image from 'next/image';
import { useAwsBuilder } from '@/context/AwsBuilderContext';

interface TopNavbarProps {
  className?: string;
  onClearAll?: () => void;
  onImport?: () => void;
  onSave?: () => void;
  onExport?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ className, onClearAll, onImport, onSave, onExport }) => {
  const [activeTab, setActiveTab] = useState('Canvas');
  const { state, zoomIn, zoomOut, setZoom, resetZoom } = useAwsBuilder();
  const [showZoomMenu, setShowZoomMenu] = useState(false);

  const navItems = [
    { id: 'canvas', label: 'Canvas', icon: '🎨' },
    { id: 'cloud-connection', label: 'Cloud Connection', icon: '☁️' },
    { id: 'defaults', label: 'Defaults', icon: '⚙️' },
    { id: 'devops', label: 'DevOps', icon: '🚀' },
    { id: 'admin-access', label: 'IAM', icon: '🔐' },
    { id: 'fin-ops', label: 'Fin Ops', icon: '💰' },
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

            {/* Zoom controls cluster */}
            <div className="relative flex items-center gap-2">
              <button className="px-2 py-1 rounded hover:bg-gray-100" title="Zoom out" onClick={zoomOut}>−</button>
              <button
                className="px-2 py-1 rounded hover:bg-gray-100 text-sm"
                title="Zoom menu"
                onClick={() => setShowZoomMenu((v) => !v)}
              >
                {Math.round((state.zoom || 1) * 100)}%
              </button>
              <button className="px-2 py-1 rounded hover:bg-gray-100" title="Zoom in" onClick={zoomIn}>+</button>
              <button className="px-2 py-1 rounded hover:bg-gray-100" title="Fullscreen">⛶</button>

              {showZoomMenu && (
                <div
                  className="absolute top-8 left-0 bg-white border rounded shadow-lg p-3 z-50 min-w-[220px]"
                  onMouseLeave={() => setShowZoomMenu(false)}
                >
                  <div className="text-xs text-slate-600 mb-2">Zoom</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={75}
                      max={200}
                      step={5}
                      value={Math.round((state.zoom || 1) * 100)}
                      onChange={(e) => setZoom(Number(e.target.value) / 100)}
                      className="w-full"
                    />
                    <span className="text-xs w-10 text-right">{Math.round((state.zoom || 1) * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => setZoom(0.75)} className="px-2 py-1 rounded hover:bg-gray-100 text-xs">75%</button>
                    <button onClick={() => setZoom(1)} className="px-2 py-1 rounded hover:bg-gray-100 text-xs">100%</button>
                    <button onClick={() => setZoom(1.5)} className="px-2 py-1 rounded hover:bg-gray-100 text-xs">150%</button>
                    <button onClick={resetZoom} className="px-2 py-1 rounded hover:bg-gray-100 text-xs">Reset</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Team initials */}
            <div className="hidden sm:flex items-center gap-1">
              {['SC', 'AK', 'MG'].map((t) => (
                <div key={t} className="relative h-7 w-7 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center">
                  {t}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-white" />
                </div>
              ))}
            </div>
            <button className="py-1 rounded " title="Settings">
              <Image src={'/images/Group.png'} width={40} height={40} alt='group' />
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
                className={`px-3 py-1.5  text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${activeTab === item.label
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