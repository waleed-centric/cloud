import React, { useState, useEffect } from 'react';
import { useAwsBuilder } from '@/context/AwsBuilderContext';

type AISuggestionTooltipProps = {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
};

export function AISuggestionTooltip({ x, y, visible, onClose }: AISuggestionTooltipProps) {
  const { state } = useAwsBuilder();
  const [suggestion, setSuggestion] = useState<string>('');

  useEffect(() => {
    if (visible && state.placedNodes.length > 0) {
      // Generate AI suggestion based on current architecture
      generateSuggestion();
    }
  }, [visible, state.placedNodes]);

  const generateSuggestion = () => {
    const nodeCount = state.placedNodes.length;
    const connectionCount = state.connections.length;
    
    // Simple AI suggestion logic based on current setup
    if (nodeCount === 1) {
      setSuggestion("Consider using Graviton instances for better price/performance.");
    } else if (nodeCount === 2 && connectionCount === 0) {
      setSuggestion("Add connections between your services to complete the architecture.");
    } else if (nodeCount >= 2 && connectionCount > 0) {
      setSuggestion("Great! Consider adding a Load Balancer for high availability.");
    } else {
      setSuggestion("Add more AWS services to build a complete architecture.");
    }
  };

  if (!visible) return null;

  return (
    <div
      className="absolute z-50 bg-emerald-800 text-white p-3 rounded-lg shadow-xl border border-emerald-600 max-w-xs"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-bold">AI</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-emerald-100 mb-1">
            AI Suggestion:
          </div>
          <div className="text-sm text-white">
            {suggestion}
          </div>
          <button
            onClick={onClose}
            className="text-xs text-emerald-300 hover:text-emerald-100 mt-2 underline"
          >
            Learn More
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-emerald-300 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>
      
      {/* Arrow pointing down */}
      <div 
        className="absolute top-full left-1/2 transform -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #065f46'
        }}
      />
    </div>
  );
}