import React, { useState, useRef } from 'react';
import { useAwsBuilder, type PlacedNode, type DetailedService } from '@/context/AwsBuilderContext';
import { DETAILED_AWS_SERVICES } from '../../data/aws-services-detailed';
import { DETAILED_AZURE_SERVICES } from '../../data/azure-services-detailed';
import { DETAILED_GCP_SERVICES } from '../../data/gcp-services-detailed';
import { useCloudProvider } from '@/context/CloudProviderContext';

// Summary: Draggable Node component - individual AWS service on canvas
// - Handles node dragging, selection, connection interactions, and service detail modal

type DraggableNodeProps = {
  node: PlacedNode;
  isSelected: boolean;
};

export function DraggableNode({ node, isSelected }: DraggableNodeProps) {
  const { currentProvider } = useCloudProvider();
  const { updateNodePosition, removeNode, setSelectedNode, setConnecting, addConnection, state, openServiceModal, openPropertiesPanel, getNodeDetails } = useAwsBuilder();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleConnectionStart = (position: 'top' | 'right' | 'bottom' | 'left') => {
    setConnecting(true, node.id);
  };

  // Dot interaction: start if idle, complete if already connecting from another node
  const handleDotMouseDown = (
    e: React.MouseEvent,
    position: 'top' | 'right' | 'bottom' | 'left'
  ) => {
    e.stopPropagation();
    if (state.isConnecting && state.connectingFromId && state.connectingFromId !== node.id) {
      addConnection(state.connectingFromId, node.id);
      setConnecting(false);
    } else {
      setConnecting(true, node.id);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Start dragging
    setSelectedNode(node.id);
    setIsDragging(true);
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      const scale = state.zoom || 1;
      setDragOffset({
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale
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
      const scale = state.zoom || 1;
      const newX = (e.clientX - canvasRect.left) / scale - dragOffset.x;
      const newY = (e.clientY - canvasRect.top) / scale - dragOffset.y;
      
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If we're in connecting mode and this isn't the source node
    if (state.isConnecting && state.connectingFromId && state.connectingFromId !== node.id) {
      // Create connection
      addConnection(state.connectingFromId, node.id);
      setConnecting(false);
    } else {
      // Select node then open configuration: sub-services go to PropertiesPanel, parent goes to modal
      setSelectedNode(node.id);
      const details = getNodeDetails(node.id);
      const service = details?.service as DetailedService | undefined;
      const sub = details?.subService as any;
      if (service && sub) {
        // Editing a sub-service opens the Properties Panel
        openPropertiesPanel(service as DetailedService, sub);
      } else if (service) {
        // Clicking a parent service opens Properties Panel for editing common properties
        openPropertiesPanel(service as DetailedService);
      } else {
        openServiceModal({ id: node.icon.id } as DetailedService);
      }
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`absolute cursor-pointer select-none transition-all ${
        isDragging ? 'z-50 scale-105' : 'z-10'
      } cursor-move`}
      style={{
        left: node.x,
        top: node.y,
        width: node.icon.width,
        height: node.icon.height,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon Container with improved styling */}
      <div 
        className={`relative w-full h-full flex flex-col items-center justify-center bg-white rounded-lg shadow-xl border border-slate-700 hover:shadow-2xl hover:border-slate-300 hover:bg-slate-100 transition-all duration-300 group ${
          isSelected ? 'ring-2 ring-blue-400' : ''
        } ${
          state.isConnecting && state.connectingFromId === node.id ? 'ring-2 ring-green-400' : ''
        }`}
        style={{
          minWidth: '80px',
          minHeight: '80px',
          maxWidth: '80px', 
          maxHeight: '80px',
          // boxShadow: '0 4px 20px rgba(2, 2, 2, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Icon Display: prefer image, fallback to inline SVG */}
        {node.icon.image ? (
          <img
            src={node.icon.image}
            alt={node.icon.name}
            className="w-8 h-8 mb-1 object-contain group-hover:scale-110 transition-transform duration-200"
            draggable={false}
          />
        ) : (
          <div 
            className="w-8 h-8 mb-1 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-white group-hover:scale-110 transition-transform duration-200"
            dangerouslySetInnerHTML={{ __html: node.icon.svg || '' }}
          />
        )}

        {/* Close / Remove Button - elegant and visible on hover */}
        <button
          type="button"
          aria-label="Remove"
          title="Remove"
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white shadow-lg bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border border-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
          onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ zIndex: 70 }}
        >
          <span className="leading-none">×</span>
        </button>
        
        {/* Service Name */}
        <div className="text-xs text-slate-700 font-medium text-center px-1 leading-tight group-hover:text-slate-900 transition-colors duration-200">
          {node.icon.name}
        </div>
        
        {/* Service Type/Category */}
        <div className="text-xs text-slate-400 text-center">
          {node.icon.category?.replace('-', ' ') || 'Service'}
        </div>

        {/* Connection Dots - visible on hover, positioned around the main box */}
        {isHovered && (
          <>
            {/* Top dot */}
            <div 
              className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors"
              style={{ 
                top: '-6px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                zIndex: 60
              }}
              onMouseDown={(e) => handleDotMouseDown(e, 'top')}
            />
            
            {/* Right dot */}
            <div 
              className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors"
              style={{ 
                top: '50%', 
                right: '-6px', 
                transform: 'translateY(-50%)',
                zIndex: 60
              }}
              onMouseDown={(e) => handleDotMouseDown(e, 'right')}
            />
            
            {/* Bottom dot */}
            <div 
              className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors"
              style={{ 
                bottom: '-6px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                zIndex: 60
              }}
              onMouseDown={(e) => handleDotMouseDown(e, 'bottom')}
            />
            
            {/* Left dot */}
            <div 
              className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors"
              style={{ 
                top: '50%', 
                left: '-6px', 
                transform: 'translateY(-50%)',
                zIndex: 60
              }}
              onMouseDown={(e) => handleDotMouseDown(e, 'left')}
            />
          </>
        )}
      </div>

      {/* Removed green connection indicators per UX request */}
    </div>
  );
}