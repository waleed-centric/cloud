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
    <div className="h-screen bg-slate-900 text-slate-200 flex flex-col">
      {/* Top Navigation Bar */}
      <TopNavbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Toggle Button - Top Left Corner */}
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg shadow-lg transition-colors border border-slate-600"
            title={sidebarExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${sidebarExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Mobile Overlay for Sidebar (only on very small screens) */}
        {isClient && sidebarExpanded && typeof window !== 'undefined' && window.innerWidth < 640 && (
          <div
            className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarExpanded(false)}
          />
        )}

        {/* Left Sidebar - Icon Palette */}
        <div 
          className={`${
            sidebarExpanded ? 'w-64' : 'w-16'
          } transition-all duration-300 ease-in-out bg-slate-800 border-r border-slate-700 flex-shrink-0 relative z-20`}
        >
          <IconPalette sidebarExpanded={sidebarExpanded} />
        </div>

        {/* Main Content Container */}
        <div className="flex-1 flex flex-col sm:flex-row gap-6 h-full overflow-hidden">
          {/* Export Button - Top Right Corner */}
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setShowExportPanel(!showExportPanel)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-colors"
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
            <div className="bg-slate-900 rounded-lg shadow-xl border border-slate-700 flex-1 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-slate-200">Canvas</h2>
                  
                  <div className="text-sm text-slate-400 hidden sm:block">
                    {state.placedNodes.length} nodes, {state.connections.length} connections
                  </div>
                </div>
                <button
                  onClick={clearAll}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              </div>
              <CanvasArea />
            </div>
          </div>

          {/* Right Sidebar - Pricing Display */}
          <div className="w-full sm:w-80 flex-shrink-0 order-first sm:order-last h-full">
            <PricingDisplay className="h-full max-h-screen overflow-hidden" />
          </div>
        </div>
      </div>

      {/* Service Detail Modal */}
      {state.showServiceModal && state.selectedService && (
        <ServiceDetailModal />
      )}

      {/* Properties Panel */}
      {state.showPropertiesPanel && state.selectedService && (
        <PropertiesPanel />
      )}
    </div>
  );
}