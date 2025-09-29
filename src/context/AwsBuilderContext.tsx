import React, { createContext, useContext, useState, ReactNode } from "react";
import { DetailedAwsService, SubService, getServiceById as getAwsServiceById, getSubServiceById as getAwsSubServiceById } from "../data/aws-services-detailed";
import { DetailedAzureService, AzureSubService, getAzureServiceById, getAzureSubServiceById } from "../data/azure-services-detailed";
import { DetailedGcpService, GcpSubService, getGcpServiceById, getGcpSubServiceById } from "../data/gcp-services-detailed";
import { usePricing } from "./PricingContext";
import { useCloudProvider } from "./CloudProviderContext";

// Summary: AwsBuilderContext for AWS DnD Builder state management
// - Manages placed nodes, connections, drag state, and export functionality
// - Added detailed service management and properties

export type AwsIcon = {
  id: string;
  name: string;
  category: string;
  svg: string;
  width: number;
  height: number;
};

export type PlacedNode = {
  id: string;
  icon: AwsIcon;
  x: number;
  y: number;
  // Added detailed service information
  serviceId?: string;
  subServiceId?: string;
  properties?: Record<string, any>;
  isSubService?: boolean;
};

export type Connection = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  color?: string;
};

// Union types for multi-provider support
export type DetailedService = DetailedAwsService | DetailedAzureService | DetailedGcpService;
export type SubServiceType = SubService | AzureSubService | GcpSubService;

export type AwsBuilderState = {
  placedNodes: PlacedNode[];
  connections: Connection[];
  isConnecting: boolean;
  connectingFromId: string | null;
  selectedNodeId: string | null;
  // Updated detailed service state for multi-provider support
  selectedService: DetailedService | null;
  selectedSubService: SubServiceType | null;
  showServiceModal: boolean;
  showPropertiesPanel: boolean;
  // Virtual anchors to allow connecting from aggregated boxes
  virtualAnchors: { id: string; x: number; y: number }[];
};

export type AwsBuilderContextValue = {
  state: AwsBuilderState;
  addNode: (icon: AwsIcon, x: number, y: number) => void;
  removeNode: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  addConnection: (fromNodeId: string, toNodeId: string, label?: string) => void;
  removeConnection: (connectionId: string) => void;
  setConnecting: (isConnecting: boolean, fromNodeId?: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  clearAll: () => void;
  exportData: () => { nodes: PlacedNode[]; connections: Connection[] };
  exportToDrawIo: () => string;
  // Updated detailed service management functions for multi-provider support
  openServiceModal: (service: DetailedService) => void;
  closeServiceModal: () => void;
  openPropertiesPanel: (service: DetailedService, subService?: SubServiceType) => void;
  closePropertiesPanel: () => void;
  addSubServiceNode: (subService: SubServiceType, service: DetailedService, x: number, y: number, properties?: Record<string, any>) => void;
  updateNodeProperties: (nodeId: string, properties: Record<string, any>) => void;
  getNodeDetails: (nodeId: string) => { service?: DetailedService; subService?: SubServiceType; properties?: Record<string, any> } | null;
  // Virtual anchor registration for aggregated boxes
  registerVirtualAnchors: (anchors: { id: string; x: number; y: number }[]) => void;
  unregisterVirtualAnchorsByPrefix: (prefix: string) => void;
};

const AwsBuilderContext = createContext<AwsBuilderContextValue | undefined>(undefined);

export function AwsBuilderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AwsBuilderState>({
    placedNodes: [],
    connections: [],
    isConnecting: false,
    connectingFromId: null,
    selectedNodeId: null,
    // Added detailed service state initialization
    selectedService: null,
    selectedSubService: null,
    showServiceModal: false,
    showPropertiesPanel: false,
    virtualAnchors: [],
  });

  const { currentProvider } = useCloudProvider();
  const { addServiceCost, removeServiceCost, updateServiceCost, clearAllCosts } = usePricing();

  const addNode = (icon: AwsIcon, x: number, y: number) => {
    const newNode: PlacedNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      icon,
      x,
      y,
    };
    
    // Add pricing for the service
    addServiceCost(newNode.id, icon.id, icon.name, {});
    
    setState(prev => ({
      ...prev,
      placedNodes: [...prev.placedNodes, newNode],
    }));
  };

  const removeNode = (nodeId: string) => {
    // Remove pricing for the service
    removeServiceCost(nodeId);
    
    setState(prev => ({
      ...prev,
      placedNodes: prev.placedNodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(
        conn => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
      ),
      selectedNodeId: prev.selectedNodeId === nodeId ? null : prev.selectedNodeId,
    }));
  };

  const updateNodePosition = (nodeId: string, x: number, y: number) => {
    setState(prev => ({
      ...prev,
      placedNodes: prev.placedNodes.map(node =>
        node.id === nodeId ? { ...node, x, y } : node
      ),
    }));
  };

  const addConnection = (fromNodeId: string, toNodeId: string, label?: string) => {
    const newConnection: Connection = {
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromNodeId,
      toNodeId,
      label,
      color: "#3B82F6", // Default blue color
    };
    setState(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection],
      isConnecting: false,
      connectingFromId: null,
    }));
  };

  const removeConnection = (connectionId: string) => {
    setState(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId),
    }));
  };

  const setConnecting = (isConnecting: boolean, fromNodeId?: string) => {
    setState(prev => ({
      ...prev,
      isConnecting,
      connectingFromId: fromNodeId || null,
    }));
  };

  const setSelectedNode = (nodeId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedNodeId: nodeId,
    }));
  };

  const clearAll = () => {
    // Reset builder state
    setState({
      placedNodes: [],
      connections: [],
      isConnecting: false,
      connectingFromId: null,
      selectedNodeId: null,
      selectedService: null,
      selectedSubService: null,
      showServiceModal: false,
      showPropertiesPanel: false,
      virtualAnchors: [],
    });

    // Also clear pricing state
    clearAllCosts();
  };

  const exportData = () => ({
    nodes: state.placedNodes,
    connections: state.connections,
  });

  const exportToDrawIo = () => {
    // Generate Draw.io compatible XML
    const nodes = state.placedNodes.map((node, index) => {
      return `<mxCell id="${node.id}" value="${node.icon.name}" style="shape=image;html=1;verticalAlign=top;verticalLabelPosition=bottom;labelBackgroundColor=#ffffff;imageAspect=0;aspect=fixed;image=data:image/svg+xml,${encodeURIComponent(node.icon.svg)}" vertex="1" parent="1">
        <mxGeometry x="${node.x}" y="${node.y}" width="${node.icon.width}" height="${node.icon.height}" as="geometry" />
      </mxCell>`;
    }).join('\n');

    const connections = state.connections.map((conn, index) => {
      return `<mxCell id="${conn.id}" value="${conn.label || ''}" style="endArrow=classic;html=1;rounded=0;strokeColor=${conn.color || '#3B82F6'}" edge="1" parent="1" source="${conn.fromNodeId}" target="${conn.toNodeId}">
        <mxGeometry width="50" height="50" relative="1" as="geometry">
          <mxPoint x="400" y="300" as="sourcePoint" />
          <mxPoint x="450" y="250" as="targetPoint" />
        </mxGeometry>
      </mxCell>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2024-01-01T00:00:00.000Z" agent="AWS Builder" version="22.1.11" etag="generated" type="device">
  <diagram name="AWS Architecture" id="aws-arch">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        ${nodes}
        ${connections}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  };

  // Updated detailed service management functions for multi-provider support
  const openServiceModal = (service: DetailedService) => {
    setState(prev => ({
      ...prev,
      selectedService: service,
      showServiceModal: true,
    }));
  };

  const closeServiceModal = () => {
    setState(prev => ({
      ...prev,
      selectedService: null,
      showServiceModal: false,
    }));
  };

  const openPropertiesPanel = (service: DetailedService, subService?: SubServiceType) => {
    setState(prev => ({
      ...prev,
      selectedService: service,
      selectedSubService: subService || null,
      showPropertiesPanel: true,
      // Close service modal when opening properties panel
      showServiceModal: false,
    }));
  };

  const closePropertiesPanel = () => {
    setState(prev => ({
      ...prev,
      selectedService: null,
      selectedSubService: null,
      showPropertiesPanel: false,
    }));
  };

  // Virtual anchor helpers
  const registerVirtualAnchors = (anchors: { id: string; x: number; y: number }[]) => {
    setState(prev => ({
      ...prev,
      virtualAnchors: [
        // Remove duplicates by id then add
        ...prev.virtualAnchors.filter(a => !anchors.some(n => n.id === a.id)),
        ...anchors,
      ],
    }));
  };

  const unregisterVirtualAnchorsByPrefix = (prefix: string) => {
    setState(prev => ({
      ...prev,
      virtualAnchors: prev.virtualAnchors.filter(a => !a.id.startsWith(prefix)),
    }));
  };

  const addSubServiceNode = (
    subService: SubServiceType, 
    service: DetailedService, 
    x: number, 
    y: number, 
    properties?: Record<string, any>
  ) => {
    // Auto-increment naming for duplicate additions
    const baseName = subService.name;
    const existingCount = state.placedNodes.filter(n => n.icon.name.startsWith(baseName)).length;
    const displayName = `${baseName} (${existingCount + 1})`;

    const newNode: PlacedNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      icon: {
        id: subService.id,
        name: displayName,
        category: service.category,
        svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="40" height="40" rx="4" fill="#4F46E5" stroke="#232F3E" stroke-width="2"/>
          <text x="25" y="20" text-anchor="middle" fill="white" font-size="16" font-family="Inter, sans-serif">${subService.icon}</text>
<text x="25" y="35" text-anchor="middle" fill="white" font-size="8" font-family="Inter, sans-serif">${displayName}</text>
        </svg>`,
        width: 50,
        height: 50,
      },
      x,
      y,
      serviceId: service.id,
      subServiceId: subService.id,
      properties: properties || {},
      isSubService: true,
    };
    
    // Add pricing for the service with configured properties
    addServiceCost(newNode.id, service.id, service.name, properties || {});
    
    setState(prev => ({
      ...prev,
      placedNodes: [...prev.placedNodes, newNode],
    }));
  };

  const updateNodeProperties = (nodeId: string, properties: Record<string, any>) => {
    // Update pricing when properties change
    updateServiceCost(nodeId, properties);
    
    setState(prev => ({
      ...prev,
      placedNodes: prev.placedNodes.map(node =>
        node.id === nodeId
          ? { ...node, properties: { ...node.properties, ...properties } }
          : node
      ),
    }));
  };

  const getNodeDetails = (nodeId: string) => {
    const node = state.placedNodes.find(n => n.id === nodeId);
    if (!node) return null;

    // Resolve service by provider, preferring explicit serviceId, otherwise use icon.id
    const serviceId = node.serviceId || node.icon.id;
    let service: DetailedService | undefined;
    let subService: SubServiceType | undefined;

    switch (currentProvider) {
      case 'aws':
        service = getAwsServiceById(serviceId) as DetailedService | undefined;
        if (node.subServiceId && service) {
          subService = getAwsSubServiceById(service.id, node.subServiceId) as SubServiceType | undefined;
        }
        break;
      case 'azure':
        service = getAzureServiceById(serviceId) as DetailedService | undefined;
        if (node.subServiceId && service) {
          subService = getAzureSubServiceById(service.id, node.subServiceId) as SubServiceType | undefined;
        }
        break;
      case 'gcp':
        service = getGcpServiceById(serviceId) as DetailedService | undefined;
        if (node.subServiceId && service) {
          subService = getGcpSubServiceById(service.id, node.subServiceId) as SubServiceType | undefined;
        }
        break;
      default:
        break;
    }

    return {
      service,
      subService,
      properties: node.properties,
    };
  };

  const value: AwsBuilderContextValue = {
    state,
    addNode,
    removeNode,
    updateNodePosition,
    addConnection,
    removeConnection,
    setConnecting,
    setSelectedNode,
    clearAll,
    exportData,
    exportToDrawIo,
    // Added detailed service management functions
    openServiceModal,
    closeServiceModal,
    openPropertiesPanel,
    closePropertiesPanel,
    addSubServiceNode,
    updateNodeProperties,
    getNodeDetails,
     // Virtual anchor helpers
     registerVirtualAnchors,
     unregisterVirtualAnchorsByPrefix,
  };

  return (
    <AwsBuilderContext.Provider value={value}>
      {children}
    </AwsBuilderContext.Provider>
  );
}

export function useAwsBuilder(): AwsBuilderContextValue {
  const ctx = useContext(AwsBuilderContext);
  if (!ctx) {
    throw new Error("useAwsBuilder must be used within an AwsBuilderProvider");
  }
  return ctx;
}