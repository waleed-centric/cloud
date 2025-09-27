import React from 'react';
import { type PlacedNode, type Connection } from '@/context/AwsBuilderContext';

type ConnectionLayerProps = {
  nodes: PlacedNode[];
  connections: Connection[];
  isConnecting: boolean;
  connectingFromId: string | null;
  mousePosition?: { x: number; y: number };
  onRemoveConnection?: (connectionId: string) => void;
};

export function ConnectionLayer({ 
  nodes, 
  connections, 
  isConnecting, 
  connectingFromId,
  mousePosition,
  onRemoveConnection
}: ConnectionLayerProps) {
  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    return {
      x: node.x + (node.icon.width / 2),
      y: node.y + (node.icon.height / 2),
    };
  };

  const createArrowPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 10) return '';
    
    // Create smooth curved path similar to screenshot
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    
    // Calculate control points for smooth curve
    const curvature = Math.min(distance * 0.3, 80);
    
    // Determine curve direction based on relative positions
    let controlX1, controlY1, controlX2, controlY2;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal connection - curve vertically
      controlX1 = from.x + dx * 0.3;
      controlY1 = from.y;
      controlX2 = to.x - dx * 0.3;
      controlY2 = to.y;
    } else {
      // Vertical connection - curve horizontally
      controlX1 = from.x;
      controlY1 = from.y + dy * 0.3;
      controlX2 = to.x;
      controlY2 = to.y - dy * 0.3;
    }
    
    return `M ${from.x} ${from.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${to.x} ${to.y}`;
  };

  const createArrowMarker = (color: string) => (
    <defs>
      <marker
        id={`arrowhead-${color.replace('#', '')}`}
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill={color}
        />
      </marker>
    </defs>
  );

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 10, pointerEvents: 'none' }}
    >
      {createArrowMarker('#60A5FA')}
      {createArrowMarker('#ef4444')}
      {createArrowMarker('#10b981')}
      
      {connections.map((connection) => {
        const fromCenter = getNodeCenter(connection.fromNodeId);
        const toCenter = getNodeCenter(connection.toNodeId);
        const path = createArrowPath(fromCenter, toCenter);
        
        if (!path) return null;
        
        const midX = (fromCenter.x + toCenter.x) / 2;
        const midY = (fromCenter.y + toCenter.y) / 2;
        
        return (
          <g key={connection.id}>
            <path
              d={path}
              stroke={connection.color || "#60A5FA"}
              strokeWidth="3"
              strokeDasharray="8 4"
              fill="none"
              markerEnd={`url(#arrowhead-${(connection.color || "#60A5FA").replace('#', '')})`}
              className="drop-shadow-lg animate-marquee"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                animation: 'marquee 2s linear infinite'
              }}
            />
            {/* Connection delete button - clickable cross */}
            <g 
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                if (onRemoveConnection) {
                  onRemoveConnection(connection.id);
                }
              }}
            >
              <circle
                cx={midX}
                cy={midY}
                r="12"
                fill="rgba(30, 41, 59, 0.9)"
                stroke="#60A5FA"
                strokeWidth="2"
                className="hover:fill-red-900 hover:stroke-red-400 transition-colors"
              />
              <text
                x={midX}
                y={midY + 1}
                textAnchor="middle"
                fontSize="14"
                fill="#60A5FA"
                className="select-none font-bold hover:fill-red-400 transition-colors"
                style={{ pointerEvents: 'none' }}
              >
                ×
              </text>
            </g>
          </g>
        );
      })}
      
      {/* Show connecting line when in connection mode */}
      {isConnecting && connectingFromId && mousePosition && (
        <g>
          {(() => {
            const fromCenter = getNodeCenter(connectingFromId);
            const path = createArrowPath(fromCenter, mousePosition);
            
            return (
              <path
                d={path}
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray="8 4"
                fill="none"
                markerEnd="url(#arrowhead-10b981)"
                className="drop-shadow-lg"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                  opacity: 0.7
                }}
              />
            );
          })()}
          
          <text
            x="20"
            y="30"
            fontSize="14"
            fill="#10b981"
            className="font-medium"
          >
            Drag to another node to connect, or click anywhere to cancel
          </text>
        </g>
      )}
    </svg>
  );
}