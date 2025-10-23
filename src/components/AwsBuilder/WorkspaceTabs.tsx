import React, { useMemo, useState, useRef } from 'react';
import { AwsBuilderProvider } from '@/context/AwsBuilderContext';
import { SecurityGroupsProvider } from '@/context/SecurityGroupsContext';
import { CloudProviderProvider } from '@/context/CloudProviderContext';
import { DragDropBuilder } from '@/components/AwsBuilder/DragDropBuilder';

type WorkspaceTab = {
  id: string;
  title: string;
};

const createTab = (index: number): WorkspaceTab => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  title: `Project ${index}`,
});

const TabWorkspace: React.FC<{ title: string }> = ({ title }) => {
  const clearCanvasRef = useRef<(() => void) | null>(null);

  const handleProviderChange = () => {
    if (clearCanvasRef.current) {
      clearCanvasRef.current();
    }
  };

  return (
    <CloudProviderProvider onProviderChange={handleProviderChange}>
      <SecurityGroupsProvider>
        <AwsBuilderProvider>
          <DragDropBuilder clearCanvasRef={clearCanvasRef} canvasName={title} />
        </AwsBuilderProvider>
      </SecurityGroupsProvider>
    </CloudProviderProvider>
  );
};

export const WorkspaceTabs: React.FC = () => {
  const [tabs, setTabs] = useState<WorkspaceTab[]>([createTab(1)]);
  const [activeId, setActiveId] = useState<string>(tabs[0].id);

  const nextIndex = useMemo(() => tabs.length + 1, [tabs.length]);

  const addTab = () => {
    const newTab = createTab(nextIndex);
    setTabs(prev => [...prev, newTab]);
    setActiveId(newTab.id);
  };

  const closeTab = (id: string) => {
    setTabs(prev => {
      const filtered = prev.filter(t => t.id !== id);
      if (filtered.length === 0) {
        const fresh = createTab(1);
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) {
        setActiveId(filtered[filtered.length - 1].id);
      }
      return filtered;
    });
  };

  const renameTab = (id: string, title: string) => {
    setTabs(prev => prev.map(t => (t.id === id ? { ...t, title } : t)));
  };

  return (
    <div className="flex flex-col h-full w-full pb-8">
      {/* Tabs Header (moved visually to bottom) */}
      <div className="order-last flex items-center gap-1 bg-white border-t border-slate-200">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center p-2 text-sm cursor-pointer select-none ${
              tab.id === activeId ? 'text-slate-900 font-semibold bg-[#F3F4F6]' : 'text-slate-600  hover:text-slate-900'
            }`}
            onClick={() => setActiveId(tab.id)}
            title={tab.title}
          >
            <input
              value={tab.title}
              onChange={(e) => renameTab(tab.id, e.target.value)}
              className="bg-transparent outline-none mr-2 flex-1 min-w-0 border-none"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="ml-2 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              aria-label="Close tab"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addTab}
          className=" w-[30px] rounded border hover:bg-slate-50"
          title="Add new workspace tab"
          aria-label="Add new workspace tab"
        >
          <img src="/aws/Button.svg" alt="Add tab" className="h-full w-full" />
        </button>
      </div>

      {/* Tabs Content */}
      <div className="order-first flex-1 overflow-hidden">
        {tabs.map((tab) => (
          <div key={tab.id} className={tab.id === activeId ? 'h-full w-full' : 'hidden'}>
            <TabWorkspace title={tab.title} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceTabs;