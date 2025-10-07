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
      const svgData = node.icon.svg || '';
      xml += `
        <mxCell id="${cellId}" value="${node.icon.name}" style="shape=image;html=1;verticalAlign=top;verticalLabelPosition=bottom;labelBackgroundColor=#ffffff;imageAspect=0;aspect=fixed;image=data:image/svg+xml,${encodeURIComponent(svgData)}" vertex="1" parent="1">
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
      // Only include nodes that have non-empty properties
      nodes: (state?.placedNodes || [])
        .map(n => n?.properties)
        .filter(p => p && Object.keys(p).length > 0),
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

  // --- Terraform (HCL) Export ---
  const sanitizeResourceName = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_{2,}/g, '_').replace(/^_+|_+$/g, '');

  const getAwsRegionFromNodes = (): string => {
    // Try to read a configured region from any node properties, default to us-east-1
    for (const n of state.placedNodes) {
      const region = (n as any)?.properties?.region;
      if (typeof region === 'string' && region.trim()) return region;
    }
    return 'us-east-1';
  };

  const generateTerraformHCL = (): string => {
    const providerBlock = `provider "aws" {\n  region = "${getAwsRegionFromNodes()}"\n}`;

    const resources: string[] = [];

    state.placedNodes.forEach((node) => {
      const isEc2Instance = node.subServiceId === 'ec2-instance' || node.icon.id === 'ec2-instance';
      if (!isEc2Instance) return;

      const ami = (node as any)?.properties?.ami || 'ami-0c55b159cbfafe1f0';
      const instanceType = (node as any)?.properties?.instanceType || 't2.micro';
      const nameTag = (node as any)?.properties?.name || node.icon.name || 'web_server';
      const resourceName = sanitizeResourceName(nameTag);

      resources.push(`resource "aws_instance" "${resourceName}" {\n  ami           = "${ami}"\n  instance_type = "${instanceType}"\n\n  tags = {\n    Name = "${nameTag}"\n  }\n}`);
    });

    return [providerBlock, ...resources].join('\n\n');
  };

  const handleExportTerraform = () => {
    // For now, support AWS EC2 Instance export
    const hcl = generateTerraformHCL();

    if (!hcl || !hcl.includes('resource "aws_instance"')) {
      alert('No EC2 Instance found to export. Add an EC2 Instance sub-service.');
      return;
    }

    const blob = new Blob([hcl], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'main.tf';
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

        {/* Export Terraform (HCL) */}
        <button
          onClick={handleExportTerraform}
          disabled={state.placedNodes.length === 0}
          className="w-full flex items-center gap-2 p-2 text-sm border border-gray-200 rounded hover:border-orange-300 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">🧱</span>
          <div className="text-left">
            <div className="font-medium text-gray-900">Export Terraform</div>
            <div className="text-xs text-gray-500">Provider + aws_instance (AWS)</div>
          </div>
        </button>
      </div>
    </div>
  );
}