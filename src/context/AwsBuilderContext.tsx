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
  // Support either inline SVG or static image path
  svg?: string;
  image?: string;
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
  parentNodeId?: string; // Track which specific parent instance this sub-service belongs to
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
  // Canvas zoom level (1 = 100%)
  zoom: number;
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
  addSubServiceNode: (subService: SubServiceType, service: DetailedService, x: number, y: number, properties?: Record<string, any>, parentNodeIdOverride?: string) => void;
  updateNodeProperties: (nodeId: string, properties: Record<string, any>) => void;
  getNodeDetails: (nodeId: string) => { service?: DetailedService; subService?: SubServiceType; properties?: Record<string, any> } | null;
  // Virtual anchor registration for aggregated boxes
  registerVirtualAnchors: (anchors: { id: string; x: number; y: number }[]) => void;
  unregisterVirtualAnchorsByPrefix: (prefix: string) => void;
  // Security Group helpers
  listSecurityGroupsForParent: (parentNodeId: string) => PlacedNode[];
  updateEc2SecurityGroups: (ec2NodeId: string, groupNames: string[]) => void;
  // Zoom controls
  setZoom: (z: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
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
    zoom: 1,
  });

  const { currentProvider } = useCloudProvider();
  const { addServiceCost, removeServiceCost, updateServiceCost, clearAllCosts } = usePricing();

  // Helper: resolve service by id for current provider
  const resolveServiceById = (id: string | undefined): DetailedService | undefined => {
    if (!id) return undefined;
    switch (currentProvider) {
      case 'aws':
        return getAwsServiceById(id) as DetailedService | undefined;
      case 'azure':
        return getAzureServiceById(id) as DetailedService | undefined;
      case 'gcp':
        return getGcpServiceById(id) as DetailedService | undefined;
      default:
        return undefined;
    }
  };

  // Helper: resolve sub-service by serviceId/subServiceId for current provider
  const resolveSubServiceById = (serviceId: string | undefined, subServiceId: string | undefined): SubServiceType | undefined => {
    if (!serviceId || !subServiceId) return undefined;
    switch (currentProvider) {
      case 'aws':
        return getAwsSubServiceById(serviceId, subServiceId) as SubServiceType | undefined;
      case 'azure':
        return getAzureSubServiceById(serviceId, subServiceId) as SubServiceType | undefined;
      case 'gcp':
        return getGcpSubServiceById(serviceId, subServiceId) as SubServiceType | undefined;
      default:
        return undefined;
    }
  };

  // Helper: determine the primary "name-like" property id from a service's common properties
  const resolvePrimaryNameId = (service: DetailedService | undefined): string | null => {
    if (!service || !Array.isArray((service as any).commonProperties)) return null;
    const commons: any[] = (service as any).commonProperties || [];
    // Prefer exact "name" id, otherwise pick first id/name containing "name" or "identifier"
    const exact = commons.find(p => p.id === 'name');
    if (exact) return exact.id;
    const nameLike = commons.find(p =>
      typeof p.id === 'string' && /name|identifier/i.test(p.id)
      || (typeof p.name === 'string' && /name|identifier/i.test(p.name))
    );
    return nameLike ? nameLike.id : null;
  };

  // Helper: get primary name value from a node using its service schema
  const getPrimaryNameValue = (node: PlacedNode | undefined): string | null => {
    if (!node) return null;
    const svc = resolveServiceById(node.serviceId || node.icon.id);
    const primaryId = resolvePrimaryNameId(svc);
    if (!primaryId) return null;
    const val = node.properties?.[primaryId];
    return typeof val === 'string' ? val : null;
  };

  const addNode = (icon: AwsIcon, x: number, y: number) => {
    // Initialize node with potential default properties from provider schema
    let defaultProperties: Record<string, any> = {};
    let serviceId: string | undefined = icon.id;

    const svc = resolveServiceById(icon.id);
    if (svc) {
      const commons: any[] = (svc as any).commonProperties || [];
      commons.forEach((prop: any) => {
        defaultProperties[prop.id] = prop.defaultValue ?? '';
      });
      serviceId = (svc as any).id;
    }

    const newNode: PlacedNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      icon,
      x,
      y,
      serviceId,
      properties: defaultProperties,
    };

    // Add pricing for the service with default properties if available
    addServiceCost(newNode.id, icon.id, icon.name, defaultProperties);

    setState(prev => ({
      ...prev,
      placedNodes: [...prev.placedNodes, newNode],
      selectedNodeId: newNode.id,
    }));

    // Auto-add default sub-services for EC2 (attach to this parent explicitly)
    if (currentProvider === 'aws' && icon.id === 'ec2') {
      autoAddDefaultEc2SubServices(newNode);
      // Open the properties panel immediately for quick rename
      const ec2Svc = getAwsServiceById('ec2');
      if (ec2Svc) {
        openPropertiesPanel(ec2Svc as DetailedService);
      }
    }

    if (currentProvider === 'aws' && icon.id === 's3') {
      autoAddDefaultS3SubServices(newNode);
      const s3Svc = getAwsServiceById('s3');
      if (s3Svc) {
        openPropertiesPanel(s3Svc as DetailedService);
      }
    }
  };

  // Helper: auto-add default EC2 sub-services for a newly added EC2 instance
  const autoAddDefaultEc2SubServices = (parentNode: PlacedNode) => {
    if (currentProvider !== 'aws') return;
    const service = getAwsServiceById('ec2');
    if (!service) return;

    // Collect default properties for each sub-service from schema
    const buildDefaultProps = (subId: string) => {
      const sub = getAwsSubServiceById('ec2', subId);
      const props: Record<string, any> = {};
      (sub?.properties || []).forEach((p) => {
        props[p.id] = p.defaultValue ?? '';
      });
      return { sub, props };
    };

    const { sub: ec2Sub, props: ec2Props } = buildDefaultProps('ec2-instance');
    const { sub: ebsSub, props: ebsProps } = buildDefaultProps('ebs-volume');
    const { sub: sgSub, props: sgProps } = buildDefaultProps('security-group');

    // Positioning: stack below parent with small offsets
    const baseX = parentNode.x;
    const baseY = parentNode.y + (parentNode.icon?.height || 80) + 30;

    if (ec2Sub) addSubServiceNode(ec2Sub, service, baseX, baseY, ec2Props, parentNode.id);
    if (ebsSub) addSubServiceNode(ebsSub, service, baseX + 120, baseY, ebsProps, parentNode.id);
    if (sgSub) addSubServiceNode(sgSub, service, baseX + 240, baseY, sgProps, parentNode.id);
  };

  const autoAddDefaultS3SubServices = (parentNode: PlacedNode) => {
    if (currentProvider !== 'aws') return;
    const service = getAwsServiceById('s3');
    if (!service) return;

    const buildDefaultProps = (subId: string) => {
      const sub = getAwsSubServiceById('s3', subId);
      const props: Record<string, any> = {};
      (sub?.properties || []).forEach((p) => {
        props[p.id] = p.defaultValue ?? '';
      });
      return { sub, props };
    };

    const { sub: bucketSub, props: bucketProps } = buildDefaultProps('s3-bucket');
    const { sub: lifecycleSub, props: lifecycleProps } = buildDefaultProps('s3-lifecycle');

    const baseX = parentNode.x;
    const baseY = parentNode.y + (parentNode.icon?.height || 80) + 30;

    if (bucketSub) addSubServiceNode(bucketSub, service, baseX, baseY, bucketProps, parentNode.id);
    if (lifecycleSub) addSubServiceNode(lifecycleSub, service, baseX + 120, baseY, lifecycleProps, parentNode.id);
  };

  // Helper: list SG sub-service nodes under a given parent EC2 aggregate
  const listSecurityGroupsForParent = (parentNodeId: string): PlacedNode[] => {
    return state.placedNodes.filter(
      (n) => (n.subServiceId === 'security-group' || n.icon.id === 'security-group') && n.parentNodeId === parentNodeId
    );
  };

  // Helper: update EC2 instance node with selected SG names
  const updateEc2SecurityGroups = (ec2NodeId: string, groupNames: string[]) => {
    setState((prev) => ({
      ...prev,
      placedNodes: prev.placedNodes.map((n) =>
        n.id === ec2NodeId
          ? { ...n, properties: { ...(n.properties || {}), securityGroups: groupNames } }
          : n
      ),
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
      zoom: 1,
    });

    // Also clear pricing state
    clearAllCosts();
  };

  // Zoom control helpers
  const setZoom = (z: number) => {
    const clamped = Math.max(0.75, Math.min(2, z));
    setState(prev => ({ ...prev, zoom: clamped }));
  };
  const zoomIn = () => {
    setState(prev => ({ ...prev, zoom: Math.min(2, +(prev.zoom + 0.1).toFixed(2)) }));
  };
  const zoomOut = () => {
    setState(prev => ({ ...prev, zoom: Math.max(0.75, +(prev.zoom - 0.1).toFixed(2)) }));
  };
  const resetZoom = () => setZoom(1);

  const exportData = () => ({
    nodes: state.placedNodes,
    connections: state.connections,
  });

  const exportToDrawIo = () => {
    // Generate Draw.io compatible XML
    const nodes = state.placedNodes.map((node, index) => {
      // Prefer inline SVG when available; otherwise fall back to image path
      let imageStyle = '';
      if (node.icon.svg) {
        imageStyle = `image=data:image/svg+xml,${encodeURIComponent(node.icon.svg)}`;
      } else if (node.icon.image) {
        // Draw.io prefers absolute URLs; use origin if available, else keep relative
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const url = node.icon.image.startsWith('http')
          ? node.icon.image
          : `${origin}${node.icon.image}`;
        imageStyle = `image=${url}`;
      }

      return `<mxCell id="${node.id}" value="${node.icon.name}" style="shape=image;html=1;verticalAlign=top;verticalLabelPosition=bottom;labelBackgroundColor=#ffffff;imageAspect=0;aspect=fixed;${imageStyle}" vertex="1" parent="1">
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
    properties?: Record<string, any>,
    parentNodeIdOverride?: string
  ) => {
    // Auto-increment naming for duplicate additions
    const baseName = subService.name;
    
    // Count existing instances of this specific sub-service type for this parent
    const parentIdToUse = parentNodeIdOverride || state.selectedNodeId || undefined;
    const existingCount = state.placedNodes.filter(n => 
      n.isSubService && 
      n.parentNodeId === parentIdToUse && 
      n.subServiceId === subService.id
    ).length;
    
    // Grouped instance naming: include parent instance label if available
    let parentInstanceLabel = '';
    if (parentIdToUse) {
      const parentNode = state.placedNodes.find(n => n.id === parentIdToUse);
      if (parentNode) {
        // Prefer a friendly instance name from common properties (primary id), fallback to icon/service name
        const primaryId = resolvePrimaryNameId(service);
        const primaryVal = primaryId ? parentNode.properties?.[primaryId] : undefined;
        const friendlyParent = (typeof primaryVal === 'string' && primaryVal)
          ? primaryVal
          : (parentNode.icon?.name || service.name || 'Instance');
        parentInstanceLabel = friendlyParent.replace(/Amazon |Microsoft |Google /g, '').trim();
      }
    }

    // Hide numbers if this is the first instance; otherwise append ordinal with parent label
    const ordinalSuffix = existingCount === 0 ? '' : ` ${existingCount + 1}`;
    const displayName = parentInstanceLabel 
      ? `${baseName} (${parentInstanceLabel}${ordinalSuffix})`
      : (existingCount === 0 ? baseName : `${baseName} (${existingCount + 1})`);

    // Inherit parent instance name into sub-service properties for read-only display
    let inheritedProps = properties || {};
    if (parentIdToUse) {
      const parentNode = state.placedNodes.find(n => n.id === parentIdToUse);
      if (parentNode) {
        const primaryId = resolvePrimaryNameId(service);
        const primaryVal = primaryId ? parentNode.properties?.[primaryId] : undefined;
        if (primaryId && typeof primaryVal === 'string') {
          inheritedProps = { ...inheritedProps, [primaryId]: primaryVal };
        }
      }
    }

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
      properties: inheritedProps,
      isSubService: true,
      parentNodeId: parentIdToUse, // Explicit parent association
    };
    
    // Add pricing for the service with configured properties
    addServiceCost(newNode.id, (service as any).id, (service as any).name, properties || {});
    
    setState(prev => ({
      ...prev,
      placedNodes: [...prev.placedNodes, newNode],
    }));
  };

  const updateNodeProperties = (nodeId: string, properties: Record<string, any>) => {
    // Update pricing when properties change
    updateServiceCost(nodeId, properties);
    
    setState(prev => {
      // Capture original target before mutation to access previous values
      const originalTarget = prev.placedNodes.find(n => n.id === nodeId);
      // Update target node properties
      const updatedNodes = prev.placedNodes.map(node =>
        node.id === nodeId
          ? { ...node, properties: { ...node.properties, ...properties } }
          : node
      );

      // If parent instance name changed, propagate to attached sub-services and update labels
      const targetNode = updatedNodes.find(n => n.id === nodeId);
      if (targetNode && !targetNode.isSubService) {
        const svc = resolveServiceById(targetNode.serviceId || targetNode.icon.id);
        const primaryId = resolvePrimaryNameId(svc);
        const changedPrimary = primaryId && typeof (properties as any)[primaryId] === 'string';
        if (changedPrimary) {
          const newName = String((properties as any)[primaryId!]).trim();
          const prevName = originalTarget && typeof (originalTarget.properties as any)?.[primaryId!] === 'string'
            ? String((originalTarget.properties as any)[primaryId!]).trim()
            : undefined;
          const targetServiceId = originalTarget?.serviceId || originalTarget?.icon.id;

          // Count parents with the same previous name to avoid cross-updating
          const sameNameParents = (prevName && targetServiceId)
            ? updatedNodes.filter(p => !p.isSubService && (p.serviceId || p.icon.id) === targetServiceId && typeof (p.properties as any)?.[primaryId!] === 'string' && String((p.properties as any)[primaryId!]).trim() === prevName).length
            : 0;

          for (let i = 0; i < updatedNodes.length; i++) {
            const n = updatedNodes[i];
            const isDirectChild = n.isSubService && n.parentNodeId === nodeId;
            const isFallbackChild = !!prevName && !!targetServiceId && n.isSubService && !n.parentNodeId && n.serviceId === targetServiceId && typeof (n.properties as any)?.[primaryId!] === 'string' && String((n.properties as any)[primaryId!]).trim() === prevName && sameNameParents === 1;
            if (isDirectChild || isFallbackChild) {
              // Resolve sub-service details to rebuild display label/svg
              let baseName = n.icon.name;
              let emoji = '';
              const sub = resolveSubServiceById(n.serviceId, n.subServiceId);
              if (sub) {
                baseName = (sub as any).name;
                emoji = (sub as any).icon || '';
              }

              // Preserve ordinal suffix if present e.g. " (Parent 2)"
              const match = n.icon.name.match(/\(([^)]*)\)/);
              const ordinalPart = match && match[1] && match[1].match(/ (\d+)$/) ? ` ${match[1].match(/ (\d+)$/)![1]}` : '';
              const displayName = `${baseName} (${newName}${ordinalPart})`;

              // Update node properties and icon
              updatedNodes[i] = {
                ...n,
                properties: { ...(n.properties || {}), [primaryId!]: newName },
                icon: {
                  id: n.icon.id,
                  name: displayName,
                  category: n.icon.category,
                  svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="40" height="40" rx="4" fill="#4F46E5" stroke="#232F3E" stroke-width="2"/>
          <text x="25" y="20" text-anchor="middle" fill="white" font-size="16" font-family="Inter, sans-serif">${emoji}</text>
<text x="25" y="35" text-anchor="middle" fill="white" font-size="8" font-family="Inter, sans-serif">${displayName}</text>
        </svg>`,
                  width: n.icon.width,
                  height: n.icon.height,
                },
              };
            }
          }
        }
      }

      return {
        ...prev,
        placedNodes: updatedNodes,
      };
    });
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
     // Security Group helpers
     listSecurityGroupsForParent,
     updateEc2SecurityGroups,
     // Zoom
     setZoom,
     zoomIn,
     zoomOut,
     resetZoom,
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