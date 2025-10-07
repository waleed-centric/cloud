import React, { useEffect, useRef, useState } from 'react';
import { usePricing } from '@/context/PricingContext';
import { useCloudProvider } from '@/context/CloudProviderContext';
import { getProviderTheme } from '@/data/theme-colors';
import { getServiceById as getAwsServiceById, getSubServiceById as getAwsSubServiceById, type ServiceProperty } from '@/data/aws-services-detailed';
import { getAzureServiceById, getAzureSubServiceById } from '@/data/azure-services-detailed';
import { getGcpServiceById, getGcpSubServiceById } from '@/data/gcp-services-detailed';
import { useAwsBuilder } from '@/context/AwsBuilderContext';

type AggregatedServiceGroupProps = {
  serviceId: string; // e.g., 'ec2'
  nodeIds: string[]; // nodes included in aggregation (any sub-services under serviceId)
  title?: string; // e.g., 'EC2 Instances'
  category?: string; // e.g., 'Compute'

  x: number;
  y: number;
};

// Simple check if a node is fully configured based on required properties
const isNodeConfigured = (
  properties: Record<string, any> | undefined,
  requiredProps: ServiceProperty[]
) => {
  if (!properties) return false;
  for (const prop of requiredProps) {
    if (prop.required) {
      const val = properties[prop.id];
      if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
        return false;
      }
    }
  }
  return true;
};

export const AggregatedServiceGroup: React.FC<AggregatedServiceGroupProps> = ({
  serviceId,
  nodeIds,
  title,
  category,
  x,
  y,
}) => {
  const { currentProvider } = useCloudProvider();
  const theme = getProviderTheme(currentProvider);
  const { serviceCosts } = usePricing();
  const { state, registerVirtualAnchors, unregisterVirtualAnchorsByPrefix, setConnecting, addConnection, openServiceModal, setSelectedNode, openPropertiesPanel, removeNode } = useAwsBuilder();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x, y });
  const [hovered, setHovered] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Provider-aware service resolution for required props
  const resolveService = () => {
    switch (currentProvider) {
      case 'aws':
        return getAwsServiceById(serviceId);
      case 'azure':
        return getAzureServiceById(serviceId) as any;
      case 'gcp':
        return getGcpServiceById(serviceId) as any;
      default:
        return undefined;
    }
  };
  const resolveSub = (subId?: string) => {
    if (!subId) return undefined;
    switch (currentProvider) {
      case 'aws':
        return getAwsSubServiceById(serviceId, subId) as any;
      case 'azure':
        return getAzureSubServiceById(serviceId, subId) as any;
      case 'gcp':
        return getGcpSubServiceById(serviceId, subId) as any;
      default:
        return undefined;
    }
  };

  const service = resolveService();

  const groupedCosts = serviceCosts.filter(
    (c) => c.serviceId === serviceId && nodeIds.includes(c.nodeId)
  );
  const totalMonthly = groupedCosts.reduce((sum, c) => sum + (c.monthlyCost || 0), 0);

  // Determine configuration completeness per node using its exact sub-service props
  let configuredCount = 0;
  for (const nodeId of nodeIds) {
    const node = state.placedNodes.find((n) => n.id === nodeId);
    if (!node) continue;
    const sub = resolveSub(node.subServiceId);
    const requiredProps: ServiceProperty[] = [
      ...(service?.commonProperties || []),
      ...(sub?.properties || []),
    ];
    if (isNodeConfigured(node.properties, requiredProps)) {
      configuredCount += 1;
    }
  }

  const allConfigured = configuredCount === nodeIds.length && nodeIds.length > 0;

  // Handle deleting all nodes in this group
  const handleDeleteGroup = () => {
    // Confirm before deleting all nodes in this group
    if (window.confirm(`Are you sure you want to delete all ${nodeIds.length} resources in this group?`)) {
      // Remove all nodes in this group
      nodeIds.forEach(nodeId => {
        removeNode(nodeId);
      });
    }
  };

  // Register virtual anchors (corner dots) so arrows can originate from the aggregated box
  useEffect(() => {
    // Use a unique prefix that includes position to avoid conflicts between multiple instances
    const uniqueId = nodeIds.length > 0 ? nodeIds[0] : 'default';
    const prefix = `agg-${serviceId}-${uniqueId}-`;
    
    // Clear old anchors first
    unregisterVirtualAnchorsByPrefix(prefix);

    if (containerRef.current) {
      const w = containerRef.current.offsetWidth || 0;
      const h = containerRef.current.offsetHeight || 0;
      const pad = 8; // inset from edges, matching the dot placement
      const anchors = [
        { id: `${prefix}tl`, x: pos.x + pad, y: pos.y + pad },
        { id: `${prefix}tr`, x: pos.x + (w > 0 ? w - pad : pad), y: pos.y + pad },
        { id: `${prefix}bl`, x: pos.x + pad, y: pos.y + (h > 0 ? h - pad : pad) },
        { id: `${prefix}br`, x: pos.x + (w > 0 ? w - pad : pad), y: pos.y + (h > 0 ? h - pad : pad) },
      ];
      registerVirtualAnchors(anchors);
    }

    return () => {
      unregisterVirtualAnchorsByPrefix(prefix);
    };
  }, [serviceId, pos.x, pos.y, nodeIds, registerVirtualAnchors, unregisterVirtualAnchorsByPrefix]);

  return (
    <div
      style={{ left: pos.x, top: pos.y, position: 'absolute' }}
      className="select-none"
    >
      <div
        ref={containerRef}
        className="rounded-lg shadow-lg border border-dashed relative"
        style={{
          width: 'auto',
          height: 'auto',
          backgroundColor: '#f8fafc',
          borderColor: theme.border,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseDown={(e) => {
          // Drag the aggregated box (except when starting a connection via dots)
          const target = e.target as HTMLElement;
          if (target && target.tagName.toLowerCase() === 'span') return;
          e.stopPropagation();
          setConnecting(false);
          const canvasRect = containerRef.current?.parentElement?.getBoundingClientRect();
          const startX = e.clientX - (canvasRect?.left || 0);
          const startY = e.clientY - (canvasRect?.top || 0);
          const offsetX = startX - pos.x;
          const offsetY = startY - pos.y;
          const onMove = (ev: MouseEvent) => {
            const curX = ev.clientX - (canvasRect?.left || 0);
            const curY = ev.clientY - (canvasRect?.top || 0);
            setPos({ x: Math.max(0, curX - offsetX), y: Math.max(0, curY - offsetY) });
          };
          const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
        onClick={(e) => {
          // Use the same unique prefix as in useEffect
          const uniqueId = nodeIds.length > 0 ? nodeIds[0] : 'default';
          const prefix = `agg-${serviceId}-${uniqueId}-`;
          // If connecting, complete to nearest corner dot of this box
          if (state.isConnecting && state.connectingFromId) {
            e.stopPropagation();

            const rect = containerRef.current?.getBoundingClientRect();
            const canvasRect = containerRef.current?.parentElement?.getBoundingClientRect();
            const clickX = e.clientX - (canvasRect?.left || 0);
            const clickY = e.clientY - (canvasRect?.top || 0);
            const w = rect?.width || 0;
            const h = rect?.height || 0;
            const pad = 8;
            const points = [
              { id: `${prefix}tl`, x: pos.x + pad, y: pos.y + pad },
              { id: `${prefix}tr`, x: pos.x + (w > 0 ? w - pad : pad), y: pos.y + pad },
              { id: `${prefix}bl`, x: pos.x + pad, y: pos.y + (h > 0 ? h - pad : pad) },
              { id: `${prefix}br`, x: pos.x + (w > 0 ? w - pad : pad), y: pos.y + (h > 0 ? h - pad : pad) },
            ];
            const nearest = points.reduce((best, p) => {
              const dist = Math.hypot(p.x - clickX, p.y - clickY);
              return dist < best.dist ? { id: p.id, dist } : best;
            }, { id: points[0].id, dist: Infinity });

            // Allow intra-box completion: if starting from this box, complete to the nearest dot
            if (state.connectingFromId.startsWith(prefix) && state.connectingFromId === nearest.id) {
              // Clicking nearest dot identical to origin: no-op
              setConnecting(false);
              return;
            }
            addConnection(state.connectingFromId, nearest.id);
            setConnecting(false);
            return;
          }
          // Otherwise open service modal to add/edit resources
          if (service) {
            e.stopPropagation();
            openServiceModal(service);
          }
        }}
      >
        {hovered && (
          <>
            <span
              className="absolute top-2 left-2 w-3 h-3 rounded-full ring-2"
              style={{ backgroundColor: theme.accent, cursor: 'crosshair', boxShadow: '0 0 0 2px rgba(255,255,255,0.18)', zIndex: 50 }}
              onMouseDown={(e) => {
                e.stopPropagation();
                const uniqueId = nodeIds.length > 0 ? nodeIds[0] : 'default';
                const prefix = `agg-${serviceId}-${uniqueId}-`;
                const dotId = `${prefix}tl`;
                if (state.isConnecting && state.connectingFromId && state.connectingFromId !== dotId) {
                  addConnection(state.connectingFromId, dotId);
                  setConnecting(false);
                  return;
                }
                setConnecting(true, dotId);
              }}
            />
            <span
              className="absolute top-2 right-2 w-3 h-3 rounded-full ring-2"
              style={{ backgroundColor: theme.accent, cursor: 'crosshair', boxShadow: '0 0 0 2px rgba(255,255,255,0.18)', zIndex: 50 }}
              onMouseDown={(e) => {
                e.stopPropagation();
                const uniqueId = nodeIds.length > 0 ? nodeIds[0] : 'default';
                const prefix = `agg-${serviceId}-${uniqueId}-`;
                const dotId = `${prefix}tr`;
                if (state.isConnecting && state.connectingFromId && state.connectingFromId !== dotId) {
                  addConnection(state.connectingFromId, dotId);
                  setConnecting(false);
                  return;
                }
                setConnecting(true, dotId);
              }}
            />
            <span
              className="absolute bottom-2 left-2 w-3 h-3 rounded-full ring-2"
              style={{ backgroundColor: theme.accent, cursor: 'crosshair', boxShadow: '0 0 0 2px rgba(255,255,255,0.18)', zIndex: 50 }}
              onMouseDown={(e) => {
                e.stopPropagation();
                const uniqueId = nodeIds.length > 0 ? nodeIds[0] : 'default';
                const prefix = `agg-${serviceId}-${uniqueId}-`;
                const dotId = `${prefix}bl`;
                if (state.isConnecting && state.connectingFromId && state.connectingFromId !== dotId) {
                  addConnection(state.connectingFromId, dotId);
                  setConnecting(false);
                  return;
                }
                setConnecting(true, dotId);
              }}
            />
            <span
              className="absolute bottom-2 right-2 w-3 h-3 rounded-full ring-2"
              style={{ backgroundColor: theme.accent, cursor: 'crosshair', boxShadow: '0 0 0 2px rgba(255,255,255,0.18)', zIndex: 50 }}
              onMouseDown={(e) => {
                e.stopPropagation();
                const uniqueId = nodeIds.length > 0 ? nodeIds[0] : 'default';
                const prefix = `agg-${serviceId}-${uniqueId}-`;
                const dotId = `${prefix}br`;
                if (state.isConnecting && state.connectingFromId && state.connectingFromId !== dotId) {
                  addConnection(state.connectingFromId, dotId);
                  setConnecting(false);
                  return;
                }
                setConnecting(true, dotId);
              }}
            />
          </>
        )}
        {/* Header (merged icon + title) */}
        <div className="px-4 py-3 border-b border-slate-300/70">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-6 h-6 shrink-0 rounded-md ring-1 ring-slate-300/60 bg-slate-50 [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: service?.icon || '' }}
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate text-slate-800">
                  {title || 'Resources'}
                </div>
                <div className="text-xs opacity-75 truncate text-slate-600">
                  {category || 'Service'} • {nodeIds.length} instance{nodeIds.length !== 1 ? 's' : ''}
                </div>
              </div>
              </div>
              <div className="flex items-center gap-2">
              <div className="text-xs px-2 py-1 rounded-full bg-blue-100 border border-blue-300 shrink-0 text-blue-700 font-medium">
                {nodeIds.length}
              </div>
              {hovered && (
                <>
                  <button
                    className="h-7 w-7 rounded-full flex items-center justify-center bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-300 transition-colors shadow-sm"
                    title={collapsed ? 'Expand' : 'Collapse'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCollapsed(!collapsed);
                    }}
                  >
                    {collapsed ? '+' : '−'}
                  </button>
                  <button
                    className="h-7 w-7 rounded-full flex items-center justify-center bg-red-100 border border-red-300 text-red-700 hover:text-red-900 hover:bg-red-200 transition-colors shadow-sm"
                    title="Delete Group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup();
                    }}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Totals / Gating */}
        {!collapsed && (
        <>
        <div className="px-4 py-3 bg-slate-50/80">
          <div className="text-sm text-slate-800">
            {allConfigured ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-75 text-slate-600">Total Monthly</div>
                  <div className="text-lg font-bold text-blue-600">${totalMonthly.toFixed(2)}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-700">Configuration Required</div>
                  <div className="text-xs opacity-75 text-slate-600">
                    {nodeIds.length - configuredCount} resource{nodeIds.length - configuredCount !== 1 ? 's' : ''} pending
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              </div>
            )}
          </div>
        </div>

        {/* Resource tiles */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {nodeIds.map((id) => {
              const node = state.placedNodes.find((n) => n.id === id);
              if (!node) return null;
              const sub = resolveSub(node.subServiceId);
              const props = (sub?.properties || []) as ServiceProperty[];
              const subtitleProp = props.find((p: ServiceProperty) => p.required) || props[0];
              const subtitleValue = subtitleProp ? node.properties?.[subtitleProp.id] : undefined;

            return (
              <div
                key={id}
                className="rounded-lg border bg-white hover:bg-slate-100 transition-all duration-200 cursor-pointer group border-slate-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(id);
                  if (service) {
                    openPropertiesPanel(service as any, sub as any);
                  }
                }}
              >
                <div className="flex items-center gap-3 p-3">
                  <div className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full opacity-90 group-hover:opacity-100 transition-opacity" dangerouslySetInnerHTML={{ __html: (node.icon as any)?.svg || '' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate text-slate-800">
                      {node.icon.name}
                    </div>
                    <div className="text-[10px] opacity-75 truncate text-slate-600">
                      {subtitleValue ? String(subtitleValue) : (sub?.name || node.icon.category || '')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
        </>
        )}
      </div>
      {/* Dragging handled on container; overlay removed to allow dot clicks */}
    </div>
  );
}

export default AggregatedServiceGroup;