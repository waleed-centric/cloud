import React from 'react';
import { useAwsBuilder } from '@/context/AwsBuilderContext';
import { useCloudProvider } from '@/context/CloudProviderContext';

interface BottomStatusBarProps {
  canvasName?: string;
  className?: string;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({ canvasName, className }) => {
  const { state } = useAwsBuilder();
  const { currentProvider, providers } = useCloudProvider();

  const servicesCount = state.placedNodes.length;
  const connectionsCount = state.connections.length;
  const providerLabel = providers[currentProvider].name;
  const zoomPct = Math.round((state.zoom || 1) * 100);

  return (
    <div className={`fixed bottom-0 left-0 right-0 h-8 bg-white border-t border-gray-200 text-xs text-gray-700 flex items-center justify-between px-3 z-40 ${className || ''}`}>
      <div className="flex items-center gap-4">
        <span>Services: {servicesCount}</span>
        <span>Connections: {connectionsCount}</span>
        <span>Provider: {providerLabel}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>Canvas: {canvasName || 'Infrastructure 1'}</span>
        <span>Zoom: {zoomPct}%</span>
        <span>Ready</span>
      </div>
    </div>
  );
};