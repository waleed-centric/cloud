import React, { useRef, useState } from 'react';
import { useAwsBuilder, type AwsIcon } from '@/context/AwsBuilderContext';
import { ConnectionLayer } from './ConnectionLayer';
import { DraggableNode } from '@/components/AwsBuilder/DraggableNode';
import { AISuggestionTooltip } from './AISuggestionTooltip';

// Summary: Canvas Area component - main drop zone for AWS icons
// - Handles drop events, node positioning, and hover-based connection mode

export function CanvasArea() {
  const { state, addNode, setConnecting, removeConnection } = useAwsBuilder();
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

        {/* Placed Nodes */}
        {state.placedNodes.map((node) => (
          <DraggableNode
            key={node.id}
            node={node}
            isSelected={state.selectedNodeId === node.id}
          />
        ))}

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