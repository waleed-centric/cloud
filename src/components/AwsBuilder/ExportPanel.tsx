import React, { useState } from 'react';
import { useAwsBuilder } from '@/context/AwsBuilderContext';

// Summary: Export Panel component - handles export to Draw.io format
// - Generates XML compatible with Draw.io/diagrams.net

export function ExportPanel() {
  const { state } = useAwsBuilder();
  const [isExporting, setIsExporting] = useState(false);

  const generateDrawioXML = () => {
    const { placedNodes, connections } = state;
    
    // Draw.io XML structure
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="AWS-Builder" version="24.7.17">
  <diagram name="AWS Architecture" id="aws-arch">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />`;

    // Add nodes
    placedNodes.forEach((node, index) => {
      const cellId = `node-${index + 2}`;
      xml += `
        <mxCell id="${cellId}" value="${node.icon.name}" style="shape=image;html=1;verticalAlign=top;verticalLabelPosition=bottom;labelBackgroundColor=#ffffff;imageAspect=0;aspect=fixed;image=data:image/svg+xml,${encodeURIComponent(node.icon.svg)}" vertex="1" parent="1">
          <mxGeometry x="${node.x}" y="${node.y}" width="${node.icon.width}" height="${node.icon.height}" as="geometry" />
        </mxCell>`;
    });

    // Add connections
    connections.forEach((connection, index) => {
      const fromIndex = placedNodes.findIndex(n => n.id === connection.fromNodeId);
      const toIndex = placedNodes.findIndex(n => n.id === connection.toNodeId);
      
      if (fromIndex !== -1 && toIndex !== -1) {
        const connectionId = `connection-${index + placedNodes.length + 2}`;
        const fromCellId = `node-${fromIndex + 2}`;
        const toCellId = `node-${toIndex + 2}`;
        
        xml += `
        <mxCell id="${connectionId}" value="" style="endArrow=classic;html=1;rounded=0;strokeColor=${connection.color || '#3B82F6'};strokeWidth=2;" edge="1" parent="1" source="${fromCellId}" target="${toCellId}">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="400" y="300" as="sourcePoint" />
            <mxPoint x="450" y="250" as="targetPoint" />
          </mxGeometry>
        </mxCell>`;
      }
    });

    xml += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    return xml;
  };

  const handleExportToDrawio = async () => {
    if (state.placedNodes.length === 0) {
      alert('Please add some AWS services to the canvas before exporting');
      return;
    }

    setIsExporting(true);
    
    try {
      const xmlContent = generateDrawioXML();
      
      // Create and download file
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aws-architecture-${Date.now()}.drawio`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenInDrawio = () => {
    if (state.placedNodes.length === 0) {
      alert('Please add some AWS services to the canvas before opening in Draw.io');
      return;
    }

    const xmlContent = generateDrawioXML();
    const encodedXml = encodeURIComponent(xmlContent);
    const drawioUrl = `https://app.diagrams.net/?xml=${encodedXml}`;
    
    window.open(drawioUrl, '_blank');
  };

  const handleExportJSON = () => {
    const exportData = {
      nodes: state.placedNodes,
      connections: state.connections,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aws-architecture-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Export</h3>
        <div className="text-xs text-gray-500">
          {state.placedNodes.length} services
        </div>
      </div>

      <div className="space-y-2">
        {/* Export to Draw.io File */}
        <button
          onClick={handleExportToDrawio}
          disabled={isExporting || state.placedNodes.length === 0}
          className="w-full flex items-center gap-2 p-2 text-sm border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">📁</span>
          <div className="text-left">
            <div className="font-medium text-gray-900">Download .drawio</div>
            <div className="text-xs text-gray-500">Save as Draw.io file</div>
          </div>
        </button>

        {/* Open in Draw.io */}
        <button
          onClick={handleOpenInDrawio}
          disabled={state.placedNodes.length === 0}
          className="w-full flex items-center gap-2 p-2 text-sm border border-gray-200 rounded hover:border-green-300 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">🌐</span>
          <div className="text-left">
            <div className="font-medium text-gray-900">Open in Draw.io</div>
            <div className="text-xs text-gray-500">Open directly in browser</div>
          </div>
        </button>

        {/* Export JSON */}
        <button
          onClick={handleExportJSON}
          disabled={state.placedNodes.length === 0}
          className="w-full flex items-center gap-2 p-2 text-sm border border-gray-200 rounded hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">📋</span>
          <div className="text-left">
            <div className="font-medium text-gray-900">Export JSON</div>
            <div className="text-xs text-gray-500">Save as JSON data</div>
          </div>
        </button>
      </div>
    </div>
  );
}