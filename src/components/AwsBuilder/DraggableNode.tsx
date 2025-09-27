import React, { useState, useRef } from 'react';
import { useAwsBuilder, type PlacedNode } from '@/context/AwsBuilderContext';
import { DETAILED_AWS_SERVICES } from '@/data/aws-services-detailed';

// Summary: Draggable Node component - individual AWS service on canvas
// - Handles node dragging, selection, connection interactions, and service detail modal

type DraggableNodeProps = {
  node: PlacedNode;
  selectedTool: 'select' | 'connect';
  isSelected: boolean;
};

export function DraggableNode({ node, selectedTool, isSelected }: DraggableNodeProps) {
  const { updateNodePosition, removeNode, setSelectedNode, setConnecting, addConnection, state, openServiceModal } = useAwsBuilder();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedTool === 'connect') {
      handleConnectionClick();
      return;
    }

    // Select mode - start dragging
    setSelectedNode(node.id);
    setIsDragging(true);
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }

    e.preventDefault();
  };

  const handleConnectionClick = () => {
    console.log('Connection click:', { isConnecting: state.isConnecting, connectingFromId: state.connectingFromId, nodeId: node.id });
    
    if (state.isConnecting && state.connectingFromId) {
      // Complete connection
      if (state.connectingFromId !== node.id) {
        console.log('Creating connection from', state.connectingFromId, 'to', node.id);
        addConnection(state.connectingFromId, node.id);
      } else {
        console.log('Cannot connect node to itself');
      }
      setConnecting(false);
    } else {
      // Start connection
      console.log('Starting connection from', node.id);
      setConnecting(true, node.id);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const canvas = nodeRef.current?.parentElement;
    if (canvas) {
      const canvasRect = canvas.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;
      
      // Keep within canvas bounds
      const maxX = canvas.clientWidth - node.icon.width;
      const maxY = canvas.clientHeight - node.icon.height;
      
      updateNodePosition(
        node.id,
        Math.max(0, Math.min(newX, maxX)),
        Math.max(0, Math.min(newY, maxY))
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners when dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleDoubleClick = () => {
    // Double click to delete
    removeNode(node.id);
  };

  // Handle single click to open service modal
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If in select mode and not dragging, open service modal
    if (selectedTool === 'select' && !isDragging) {
      // Find the detailed service data
      const detailedService = DETAILED_AWS_SERVICES.find((service: any) => 
        service.name.toLowerCase() === node.icon.name.toLowerCase() ||
        service.id === node.icon.id
      );
      
      if (detailedService) {
        openServiceModal(detailedService);
      }
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`absolute cursor-pointer select-none transition-all ${
        isDragging ? 'z-50 scale-105' : 'z-10'
      } ${
        isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''
      } ${
        selectedTool === 'connect' ? 'cursor-crosshair' : 'cursor-move'
      } ${
        state.isConnecting && state.connectingFromId === node.id 
          ? 'ring-2 ring-green-400 ring-offset-2' 
          : ''
      }`}
      style={{
        left: node.x,
        top: node.y,
        width: node.icon.width,
        height: node.icon.height,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
    >
      {/* Icon Container with improved styling */}
      <div 
        className="w-full h-full flex flex-col items-center justify-center bg-slate-900 rounded-lg shadow-xl border border-slate-700 hover:shadow-2xl hover:border-slate-600 hover:bg-slate-800 transition-all duration-300 group"
        style={{
          minWidth: '80px',
          minHeight: '80px',
          maxWidth: '80px', 
          maxHeight: '80px',
          boxShadow: '0 4px 20px rgba(2, 2, 2, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Icon SVG */}
        <div 
          className="w-8 h-8 mb-1 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-white group-hover:scale-110 transition-transform duration-200"
          dangerouslySetInnerHTML={{ __html: node.icon.svg }}
        />
        
        {/* Service Name */}
        <div className="text-xs text-slate-200 font-medium text-center px-1 leading-tight group-hover:text-white transition-colors duration-200">
          {node.icon.name}
        </div>
        
        {/* Service Type/Category */}
        <div className="text-xs text-slate-400 text-center">
          {node.icon.category?.replace('-', ' ') || 'Service'}
        </div>
      </div>

      {/* Connection indicator */}
      {selectedTool === 'connect' && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
          <span className="text-white text-xs font-bold">+</span>
        </div>
      )}
      
      {/* Connection state indicator */}
      {state.isConnecting && state.connectingFromId === node.id && (
        <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
          <span className="text-white text-sm font-bold">●</span>
        </div>
      )}
    </div>
  );
}