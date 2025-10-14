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
  const { state, addNode, setConnecting, removeConnection, setSelectedNode, closePropertiesPanel } = useAwsBuilder();
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
        let x = e.clientX - rect.left - 40; // Center the icon (80px width / 2)
        let y = e.clientY - rect.top - 40;  // Center the icon (80px height / 2)
        
        // Smart positioning: Check if there's already a node at this position
        // If yes, offset the new node to prevent overlapping
        const nodeSize = 80; // Standard node size
        const offset = 20; // Offset distance
        
        const isPositionOccupied = (checkX: number, checkY: number) => {
          return state.placedNodes.some(node => {
            const distance = Math.sqrt(
              Math.pow(node.x - checkX, 2) + Math.pow(node.y - checkY, 2)
            );
            return distance < nodeSize; // If nodes are too close, consider position occupied
          });
        };
        
        // Find a free position by spiraling outward
        let attempts = 0;
        const maxAttempts = 20;
        const originalX = x;
        const originalY = y;
        
        while (isPositionOccupied(x, y) && attempts < maxAttempts) {
          attempts++;
          // Spiral pattern: right, down, left, up, then expand
          const spiralRadius = Math.ceil(attempts / 4) * (nodeSize + offset);
          const direction = attempts % 4;
          
          switch (direction) {
            case 0: // Right
              x = originalX + spiralRadius;
              y = originalY;
              break;
            case 1: // Down
              x = originalX;
              y = originalY + spiralRadius;
              break;
            case 2: // Left
              x = originalX - spiralRadius;
              y = originalY;
              break;
            case 3: // Up
              x = originalX;
              y = originalY - spiralRadius;
              break;
          }
        }
        
        // Ensure the node stays within canvas bounds
        x = Math.max(0, Math.min(x, (canvasRef.current.clientWidth || 800) - nodeSize));
        y = Math.max(0, Math.min(y, (canvasRef.current.clientHeight || 600) - nodeSize));
        
        addNode(icon, x, y);
        
        // Show AI suggestion after adding a node
        setTimeout(() => {
          setSuggestionPosition({ 
            x: x + 40, 
            y: y - 10 
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
    // Deselect any selected node and close properties panel when clicking empty canvas
    setSelectedNode(null);
    closePropertiesPanel();
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
        className="w-full h-full relative overflow-hidden transition-colors"
          style={{
            backgroundColor: 'white',
            backgroundImage: 'url(/aws/DesignCanvas.png)',
            // backgroundSize: '60px 60px',
          }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
      >
      <ConnectionLayer
          nodes={state.placedNodes}
          connections={state.connections}
          isConnecting={state.isConnecting}
          connectingFromId={state.connectingFromId}
          mousePosition={mousePosition}
          onRemoveConnection={removeConnection}
        />

          {(() => {
          // Updated aggregation: group sub-services under their specific parent node
          const subServiceNodes = state.placedNodes.filter((n) => n.isSubService);
          
          // Group by parent node ID instead of just service ID
          const parentNodeGroups = new Map<string, typeof subServiceNodes>();
          
          for (const subNode of subServiceNodes) {
            // Use the parentNodeId if available, otherwise fall back to proximity check
            let parentId: string | undefined;
            
            if (subNode.parentNodeId) {
              // Direct parent-child relationship
              parentId = subNode.parentNodeId;
            } else {
              // Fallback: Find the parent node that this sub-service belongs to (legacy support)
              const parentNode = state.placedNodes.find(n => 
                !n.isSubService && 
                (n.icon.id === subNode.serviceId || n.serviceId === subNode.serviceId) &&
                // Additional check: sub-service should be created from this specific parent
                Math.abs(n.x - subNode.x) < 200 && Math.abs(n.y - subNode.y) < 200
              );
              parentId = parentNode?.id;
            }
            
            if (parentId) {
              if (!parentNodeGroups.has(parentId)) {
                parentNodeGroups.set(parentId, []);
              }
              parentNodeGroups.get(parentId)!.push(subNode);
            }
          }

          const rendered: React.ReactNode[] = [];

          // Parent nodes that have aggregated sub-services should not render separately
          const parentsWithGroups = new Set<string>(Array.from(parentNodeGroups.keys()));
          const nonSubNodes = state.placedNodes.filter((n) => !n.isSubService && !parentsWithGroups.has(n.id));

          for (const node of nonSubNodes) {
            rendered.push(
              <DraggableNode
                key={node.id}
                node={node}
                isSelected={state.selectedNodeId === node.id}
              />
            );
          }

          // Render aggregated boxes per parent node (only if they have sub-services)
          for (const [parentId, subNodes] of parentNodeGroups) {
            if (subNodes.length === 0) continue;

            const parent = state.placedNodes.find((n) => n.id === parentId);
            if (!parent) continue;

            // Position aggregated box below the parent node
            const groupX = parent.x;
            const groupY = parent.y + (parent.icon?.height || 50) + 20;

            rendered.push(
              <AggregatedServiceGroup
                key={`agg-${parentId}`}
                serviceId={parent.serviceId || parent.icon.id}
                nodeIds={subNodes.map((n) => n.id)}
                title={`${(parent.icon?.name || parent.serviceId || '').replace(/Amazon |Microsoft |Google /g, '')} Resources`}
                category={parent.icon?.category || 'Service'}
                x={Math.max(0, groupX)}
                y={Math.max(0, groupY)}
              />
            );
          }

          return rendered;
        })()}


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
    </div>
  );
}