import React, { useRef, useState } from 'react';
import { useAwsBuilder, type AwsIcon } from '@/context/AwsBuilderContext';
import { useCloudProvider } from '@/context/CloudProviderContext';
import { ConnectionLayer } from './ConnectionLayer';
import { DraggableNode } from '@/components/AwsBuilder/DraggableNode';
import AggregatedServiceGroup from '@/components/AwsBuilder/AggregatedServiceGroup';
import { AISuggestionTooltip } from './AISuggestionTooltip';

// Summary: Canvas Area component - main drop zone for AWS icons
// - Handles drop events, node positioning, and hover-based connection mode

export function CanvasArea() {
  const { state, addNode, setConnecting, removeConnection } = useAwsBuilder();
  const { currentProvider } = useCloudProvider();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    try {
      const iconData = e.dataTransfer.getData('application/json');
      const icon: AwsIcon = JSON.parse(iconData);
      
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - 40; // Center the icon (80px width / 2)
        const y = e.clientY - rect.top - 40;  // Center the icon (80px height / 2)
        
        addNode(icon, Math.max(0, x), Math.max(0, y));
        
        // Show AI suggestion after adding a node
        setTimeout(() => {
          setSuggestionPosition({ 
            x: Math.max(0, x) + 40, 
            y: Math.max(0, y) - 10 
          });
          setShowAISuggestion(true);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to parse dropped icon data:', error);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If in connect mode and clicking on empty canvas, cancel connection
    if (state.isConnecting) {
      setConnecting(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <div className="relative h-full">
      <div
        ref={canvasRef}
        className={`w-full h-full relative overflow-hidden transition-colors ${
          dragOver 
            ? 'border-2 border-dashed border-blue-400' 
            : ''
        }`}
        style={{
          background: dragOver 
            ? 'rgba(59, 130, 246, 0.1)' 
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          backgroundImage: dragOver 
            ? `
              linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `
            : `
              linear-gradient(to right, rgba(71, 85, 105, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(71, 85, 105, 0.15) 1px, transparent 1px)
            `,
          backgroundSize: '20px 20px'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
      >

        {/* Connection Layer (SVG overlay) */}
        <ConnectionLayer
          nodes={state.placedNodes}
          connections={state.connections}
          isConnecting={state.isConnecting}
          connectingFromId={state.connectingFromId}
          mousePosition={mousePosition}
          onRemoveConnection={removeConnection}
        />

        {/* Placed Nodes (with aggregation per service) */}
        {(() => {
          // Generic aggregation: group all sub-services under their parent service for current provider
          const subServiceNodes = state.placedNodes.filter((n) => n.isSubService);
          const serviceIds = Array.from(new Set(subServiceNodes.map((n) => n.serviceId).filter(Boolean)));

          const rendered: React.ReactNode[] = [];

          // Determine services that have one or more sub-service nodes (hide parent when any exist)
          const servicesWithAny = new Set<string>();
          for (const svcId of serviceIds) {
            const count = subServiceNodes.filter((n) => n.serviceId === svcId).length;
            if (count >= 1) servicesWithAny.add(String(svcId));
          }

          // Render non-subservice nodes normally, but hide parent tile if this service has exactly two items
          const nonSubNodesAll = state.placedNodes.filter((n) => !n.isSubService);
          const nonSubNodes = nonSubNodesAll.filter((n) => {
            const sid = n.icon?.id || n.serviceId || '';
            return !servicesWithAny.has(sid);
          });
          for (const node of nonSubNodes) {
            rendered.push(
              <DraggableNode
                key={node.id}
                node={node}
                isSelected={state.selectedNodeId === node.id}
              />
            );
          }

          // Render aggregated boxes per service
          for (const svcId of serviceIds) {
            const svcSubNodes = subServiceNodes.filter((n) => n.serviceId === svcId);
            if (svcSubNodes.length === 0) continue;

            // Try to anchor under the parent tile of this service
            const parent = nonSubNodesAll.find((n) => n.icon.id === svcId || n.serviceId === svcId);
            const defaultX = Math.min(...svcSubNodes.map((n) => n.x));
            const defaultY = Math.min(...svcSubNodes.map((n) => n.y)) - 20;
            const groupX = parent ? parent.x : defaultX;
            const groupY = parent ? parent.y + (parent.icon?.height || 50) + 16 : defaultY;

            rendered.push(
              <AggregatedServiceGroup
                key={`agg-${svcId}`}
                serviceId={svcId!}
                nodeIds={svcSubNodes.map((n) => n.id)}
                title={`${(parent?.icon?.name || svcId || '').replace(/Amazon |Microsoft |Google /g, '')} Resources`}
                category={parent?.icon?.category || 'Service'}
                x={Math.max(0, groupX)}
                y={Math.max(0, groupY)}
              />
            );
          }

          return rendered;
        })()}

        {/* Empty State */}
        {state.placedNodes.length === 0 && !dragOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-slate-300">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-lg font-medium mb-2">Start Building</h3>
              <p className="text-sm">
                Drag AWS service icons from the palette to create your architecture
              </p>
            </div>
          </div>
        )}

        {/* Drop Indicator */}
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-blue-100 border-2 border-dashed border-blue-400 rounded-lg p-8">
              <div className="text-blue-600 text-center">
                <div className="text-2xl mb-2">📦</div>
                <p className="font-medium">Drop here to add service</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* AI Suggestion Tooltip */}
      {/* <AISuggestionTooltip
        x={suggestionPosition.x}
        y={suggestionPosition.y}
        visible={showAISuggestion}
        onClose={() => setShowAISuggestion(false)}
      /> */}
    </div>
  );
}