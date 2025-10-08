import React, { useState } from 'react';
import { useAwsBuilder } from '@/context/AwsBuilderContext';
import { IconPalette } from '@/components/AwsBuilder/IconPalette';
import { CanvasArea } from '@/components/AwsBuilder/CanvasArea';
import { ExportPanel } from '@/components/AwsBuilder/ExportPanel';
import { ServiceDetailModal } from '@/components/AwsBuilder/ServiceDetailModal';
import { PropertiesPanel } from '@/components/AwsBuilder/PropertiesPanel';
import { PricingDisplay } from '@/components/PricingDisplay';
import { TopNavbar } from '@/components/AwsBuilder/TopNavbar';

// Summary: Main DnD Builder component - combines palette, canvas, export, and service modals
// - Layout management for drag and drop interface with detailed service functionality

interface DragDropBuilderProps {
  clearCanvasRef?: React.MutableRefObject<(() => void) | null>;
}

export function DragDropBuilder({ clearCanvasRef }: DragDropBuilderProps) {
  const { state, clearAll } = useAwsBuilder();
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [activeCanvasTab, setActiveCanvasTab] = useState('Canvas');

  const canvasNavItems = [
    { id: 'canvas', label: 'Canvas', icon: '🎨' },
    { id: 'cloud-connection', label: 'Cloud Connection', icon: '☁️' },
    { id: 'defaults', label: 'Defaults', icon: '⚙️' },
    { id: 'devops', label: 'DevOps', icon: '🚀' },
    { id: 'admin-access', label: 'IAM', icon: '🔐' },
    { id: 'fin-ops', label: 'Fin Ops', icon: '💰' },
  ];

  const handleCanvasTabClick = (tabLabel: string) => {
    setActiveCanvasTab(tabLabel);
    console.log(`Switched to ${tabLabel} tab (Canvas header)`);
  };

  // Auto-collapse sidebar on mobile devices
  React.useEffect(() => {
    setIsClient(true);

    // Assign clearAll function to ref for external access
    if (clearCanvasRef) {
      clearCanvasRef.current = clearAll;
    }

    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setSidebarExpanded(false);
    }

    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 640) {
        setSidebarExpanded(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [clearCanvasRef, clearAll]);

  return (
    <div className="h-screen bg-white text-slate-200 flex flex-col">
      {/* Top Navigation Bar */}
      <TopNavbar 
        onClearAll={clearAll}
        onExport={() => setShowExportPanel(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
       

        {/* Mobile Overlay for Sidebar (only on very small screens) */}
        {isClient && sidebarExpanded && typeof window !== 'undefined' && window.innerWidth < 640 && (
          <div
            className="sm:hidden fixed inset-0  bg-opacity-50 z-30"
            onClick={() => setSidebarExpanded(false)}
          />
        )}

        {/* Left Sidebar - Icon Palette */}
        <div
          className={`${sidebarExpanded ? 'w-96' : 'w-20'
            } transition-all duration-300 ease-in-out bg-slate-800 border-r  flex-shrink-0 relative z-20`}
        >
          <IconPalette sidebarExpanded={sidebarExpanded} setSidebarExpanded={setSidebarExpanded} />
        </div>

        {/* Main Content Container */}
        <div className="flex-1 flex flex-col sm:flex-row gap-6 h-full overflow-hidden">
          {/* Export Button - Top Right Corner */}
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setShowExportPanel(!showExportPanel)}
              className="bg-blue-600 hidden hover:bg-blue-700 text-white px-2 sm:px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <span>📤</span>
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Export Panel Dropdown */}
            {showExportPanel && (
              <div className="absolute top-12 right-0 z-50">
                <div className="bg-white rounded-lg shadow-xl border p-1 min-w-[250px] sm:min-w-[300px]">
                  <ExportPanel />
                </div>
              </div>
            )}
          </div>

          {/* Main Canvas Area */}
          <div className={`flex-1 flex flex-col transition-all duration-300`}>
            <div className=" rounded-lg shadow-xl border  flex-1 overflow-hidden">
             
              <CanvasArea />
            </div>
          </div>

          {/* Right Sidebar - Pricing Display */}
          <div className="w-full sm:w-1 flex-shrink-0 order-first sm:order-last h-full">
            <PricingDisplay className="h-full max-h-screen overflow-hidden" />
          </div>
        </div>
      </div>

      {/* Service Detail Modal */}
      {state.showServiceModal && state.selectedService && (
        <ServiceDetailModal />
      )}

      {/* Properties/AI Tabs - persistent right sidebar */}
      <PropertiesPanel />
    </div>
  );
}