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

const TabWorkspace: React.FC = () => {
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
          <DragDropBuilder clearCanvasRef={clearCanvasRef} />
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
    <div className="flex flex-col h-full w-full">
      {/* Tabs Header */}
      <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 border-b">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center max-w-[220px] rounded-md border px-3 py-1.5 text-sm cursor-pointer select-none ${
              tab.id === activeId ? 'bg-white border-blue-500 text-blue-700' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setActiveId(tab.id)}
            title={tab.title}
          >
            <input
              value={tab.title}
              onChange={(e) => renameTab(tab.id, e.target.value)}
              className="bg-transparent outline-none mr-2 flex-1 min-w-0"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="ml-2 text-slate-500 hover:text-red-600"
              aria-label="Close tab"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addTab}
          className="ml-1 px-3 py-1.5 rounded-md border bg-slate-300 hover:bg-slate-50"
          title="Add new workspace tab"
        >
          +
        </button>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-hidden">
        {tabs.map((tab) => (
          <div key={tab.id} className={tab.id === activeId ? 'h-full w-full' : 'hidden'}>
            <TabWorkspace />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceTabs;