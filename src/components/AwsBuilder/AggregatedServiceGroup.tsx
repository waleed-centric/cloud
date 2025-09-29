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
  const { state, registerVirtualAnchors, unregisterVirtualAnchorsByPrefix, setConnecting, addConnection, openServiceModal } = useAwsBuilder();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x, y });
  const [hovered, setHovered] = useState(false);

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

  // Register virtual anchors (corner dots) so arrows can originate from the aggregated box
  useEffect(() => {
    const prefix = `agg-${serviceId}-`;
    // Clear old anchors first
    unregisterVirtualAnchorsByPrefix(prefix);

    if (nodeIds.length >= 1 && containerRef.current) {
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
  }, [serviceId, pos.x, pos.y, nodeIds.length, registerVirtualAnchors, unregisterVirtualAnchorsByPrefix]);

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
          backgroundColor: theme.surface,
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
          const prefix = `agg-${serviceId}-`;
          // If connecting, complete to nearest corner dot of this box
          if (state.isConnecting && state.connectingFromId) {
            e.stopPropagation();
            // Avoid self-connection when starting from this same aggregated box
            if (state.connectingFromId.startsWith(prefix)) {
              // Require explicit dot click for intra-box connections
              setConnecting(false);
              return;
            }

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
        {hovered && nodeIds.length >= 1 && (
          <>
            <span
              className="absolute top-2 left-2 w-3 h-3 rounded-full ring-2"
              style={{ backgroundColor: theme.accent, cursor: 'crosshair', boxShadow: '0 0 0 2px rgba(255,255,255,0.18)', zIndex: 50 }}
              onMouseDown={(e) => { e.stopPropagation(); setConnecting(true, `agg-${serviceId}-tl`); }}
            />
            <span
              className="absolute top-2 right-2 w-3 h-3 rounded-full ring-2"
              style={{ backgroundColor: theme.accent, cursor: 'crosshair', boxShadow: '0 0 0 2px rgba(255,255,255,0.18)', zIndex: 50 }}
              onMouseDown={(e) => { e.stopPropagation(); setConnecting(true, `agg-${serviceId}-tr`); }}
            />
            <span
              className="absolute bottom-2 left-2 w-3 h-3 rounded-full ring-2"
              style={{ backgroundColor: theme.accent, cursor: 'crosshair', boxShadow: '0 0 0 2px rgba(255,255,255,0.18)', zIndex: 50 }}
              onMouseDown={(e) => { e.stopPropagation(); setConnecting(true, `agg-${serviceId}-bl`); }}
            />
            <span
              className="absolute bottom-2 right-2 w-3 h-3 rounded-full ring-2"
              style={{ backgroundColor: theme.accent, cursor: 'crosshair', boxShadow: '0 0 0 2px rgba(255,255,255,0.18)', zIndex: 50 }}
              onMouseDown={(e) => { e.stopPropagation(); setConnecting(true, `agg-${serviceId}-br`); }}
            />
          </>
        )}
        {/* Header */}
        <div className="px-3 pt-2">
          <div className="text-xs font-semibold" style={{ color: theme.text }}>
            {title || 'Resources'} ({nodeIds.length})
          </div>
          <div className="text-[10px] mb-2" style={{ color: theme.textSecondary }}>
            {category || 'Service'}
          </div>
        </div>

        {/* Totals / Gating */}
        <div className="px-3 pb-2">
          <div className="text-[11px]" style={{ color: theme.text }}>
            {allConfigured ? (
              <>
                <div className="font-medium">Total Monthly</div>
                <div className="text-sm">${totalMonthly.toFixed(2)}</div>
              </>
            ) : (
              <>
                <div className="font-medium">Cost pending</div>
                <div className="text-[10px]" style={{ color: theme.textSecondary }}>
                  Configure {nodeIds.length - configuredCount} resource(s)
                </div>
              </>
            )}
          </div>
        </div>

        {/* Resource tiles */}
        <div className="px-3 pb-3">
          <div className="grid grid-cols-2 gap-3">
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
                className="rounded-md border bg-slate-900/60"
                style={{ borderColor: theme.border }}
              >
                <div className="flex items-center gap-2 p-2">
                  <div className="w-5 h-5 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: node.icon.svg }} />
                  <div>
                    <div className="text-xs font-medium" style={{ color: theme.text }}>
                      {node.icon.name}
                    </div>
                    <div className="text-[10px]" style={{ color: theme.textSecondary }}>
                      {subtitleValue ? String(subtitleValue) : (sub?.name || node.icon.category || '')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
      {/* Dragging handled on container; overlay removed to allow dot clicks */}
    </div>
  );
}

export default AggregatedServiceGroup;