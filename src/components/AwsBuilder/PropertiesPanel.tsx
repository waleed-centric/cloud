import React, { useState ,useEffect, useMemo } from 'react';
import { useAwsBuilder } from '@/context/AwsBuilderContext';
import { useCloudProvider } from '@/context/CloudProviderContext';
import { getProviderTheme } from '@/data/theme-colors';
import { ServiceProperty, SubService, DetailedAwsService } from '../../data/aws-services-detailed';

// Summary: Properties Panel component - shows configuration options for selected service/sub-service
// - Displays properties form and allows saving configuration

const PropertiesPanel: React.FC = () => {
  const { currentProvider } = useCloudProvider();
  const { state, closePropertiesPanel, updateNodeProperties, openServiceModal, addSubServiceNode } = useAwsBuilder();
  const [propertyValues, setPropertyValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [listeners, setListeners] = useState<{ protocol: string; port: number; target: string }[]>([]);

  if (!state.showPropertiesPanel || !state.selectedService) {
    return null;
  }

  const service = state.selectedService;
  const subService = state.selectedSubService;
  const editingNode = state.selectedNodeId
    ? state.placedNodes.find(n => n.id === state.selectedNodeId)
    : null;
  const theme = getProviderTheme(currentProvider);

  // Combine common properties and sub-service properties
  const allProperties = [
    ...(service?.commonProperties || []),
    ...(subService?.properties || [])
  ];

  // Determine primary name-like property id from service schema
  const primaryNameId = useMemo(() => {
    const commons = service?.commonProperties || [];
    const exact = commons.find((p: any) => p.id === 'name');
    if (exact) return 'name';
    const nameLike = commons.find((p: any) => {
      const idStr = typeof p.id === 'string' ? p.id : '';
      const nameStr = typeof p.name === 'string' ? p.name : '';
      return /name|identifier/i.test(idStr) || /name|identifier/i.test(nameStr);
    });
    return nameLike ? nameLike.id : null;
  }, [service]);

  useEffect(() => {
    // Initialize property values with either existing node values (edit mode) or defaults (create mode)
    const initialProps: Record<string, any> = {};
    allProperties.forEach(prop => {
      const existingVal = editingNode?.properties?.[prop.id];
      initialProps[prop.id] = existingVal !== undefined ? existingVal : (prop.defaultValue ?? '');
    });
    setPropertyValues(initialProps);
    setErrors({});
    // Seed listeners only for Load Balancer-like services for UI preview
    const name = (subService?.name || service?.name || '').toLowerCase();
    if (name.includes('load balancer') || name.includes('elb') || name.includes('alb')) {
      setListeners([{ protocol: 'HTTPS', port: 443, target: 'tg-web-servers' }]);
    } else {
      setListeners([]);
    }
  }, [service, subService, state.selectedNodeId]);

  const handlePropertyChange = (propertyId: string, value: any) => {
    setPropertyValues(prev => ({
      ...prev,
      [propertyId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[propertyId]) {
      setErrors(prev => ({
        ...prev,
        [propertyId]: ''
      }));
    }
  };

  const validateProperties = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    allProperties.forEach(prop => {
      if (prop.required && (!propertyValues[prop.id] || propertyValues[prop.id] === '')) {
        newErrors[prop.id] = `${prop.name} is required`;
      }
      
      if (prop.type === 'number' && propertyValues[prop.id] && isNaN(Number(propertyValues[prop.id]))) {
        newErrors[prop.id] = `${prop.name} must be a valid number`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateProperties()) {
      // Decide between editing existing node vs creating a new sub-service
      const commonPropIds = (service?.commonProperties || []).map(p => p.id);
      const subPropIds = (subService?.properties || []).map(p => p.id);

      // Parent node, if selected
      const parentNode = editingNode && !editingNode.isSubService ? editingNode : null;

      if (editingNode && !subService) {
        // Editing a parent service (e.g., EC2): update common properties; name change will propagate
        const toSave: Record<string, any> = {};
        commonPropIds.forEach(id => {
          toSave[id] = propertyValues[id];
        });
        updateNodeProperties(editingNode.id, toSave);
        closePropertiesPanel();
        return;
      }

      // Create mode: adding a new sub-service under currently selected parent
      if (service && subService) {
        // If editing an existing sub-service node, update it
        if (editingNode && editingNode.isSubService) {
          const toSave: Record<string, any> = {};
          subPropIds.forEach(id => {
            toSave[id] = propertyValues[id];
          });
          updateNodeProperties(editingNode.id, toSave);
          closePropertiesPanel();
          return;
        }

        // Otherwise, we are adding/updating a sub-service under the selected parent
        const hostParent = parentNode || (state.selectedNodeId ? state.placedNodes.find(n => n.id === state.selectedNodeId && !n.isSubService) || null : null);

        // Check if the same sub-service already exists under this parent
        const existing = hostParent
          ? state.placedNodes.find(n => n.isSubService && n.parentNodeId === hostParent.id && n.serviceId === (service as any).id && n.subServiceId === (subService as any).id)
          : null;

        if (existing) {
          // Update existing sub-service with provided config
          const toSave: Record<string, any> = {};
          subPropIds.forEach(id => {
            toSave[id] = propertyValues[id];
          });
          updateNodeProperties(existing.id, toSave);
        } else {
          // Add new sub-service under the parent with provided config
          // Position sub-service relative to parent
          let x = Math.random() * 400 + 100;
          let y = Math.random() * 300 + 100;
          if (hostParent) {
            x = hostParent.x + Math.random() * 100 - 50;
            y = hostParent.y + 100 + Math.random() * 50;
            x = Math.max(50, Math.min(x, 750));
            y = Math.max(50, Math.min(y, 550));
          }
          addSubServiceNode(subService, service, x, y, propertyValues, hostParent ? hostParent.id : undefined);
        }
      }

      closePropertiesPanel();
    }
  };

  const renderPropertyInput = (property: ServiceProperty) => {
    const value = propertyValues[property.id] ?? '';
    const hasError = !!errors[property.id];
    const isPrimaryName = !!primaryNameId && property.id === primaryNameId;
    const isReadOnlyInstanceName = isPrimaryName && !!subService;

    switch (property.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isPrimaryName && !subService) {
                // Allow quick save on Enter when renaming parent instance
                handleSave();
              }
            }}
            autoFocus={isPrimaryName && !subService}
            readOnly={isReadOnlyInstanceName}
            disabled={isReadOnlyInstanceName}
            className={`w-full mt-1 bg-slate-800 border rounded-md px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder={`Enter ${property.name.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
            className={`w-full mt-1 bg-slate-800 border rounded-md px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder={`Enter ${property.name.toLowerCase()}`}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
            className={`w-full mt-1 bg-slate-800 border rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-slate-600'
            }`}
          >
            <option className="bg-slate-800" value="">Select {property.name}</option>
            {property.options?.map((option) => (
              <option className="bg-slate-800" key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handlePropertyChange(property.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-600 rounded focus:ring-blue-500"
            />
            <span className="text-xs text-slate-400">
              {Boolean(value) ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
            rows={3}
            className={`w-full mt-1 bg-slate-800 border rounded-md px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
              hasError ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder={`Enter ${property.name.toLowerCase()}`}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
            className={`w-full mt-1 bg-slate-800 border rounded-md px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-slate-600'
            }`}
          />
        );
    }
  };

  if (!state.showPropertiesPanel) return null;

  return (
    <div 
      className="fixed top-0 right-0 h-full w-96 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l"
      style={{
        backgroundColor: theme.background,
        borderColor: theme.border
      }}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div 
          className="text-white p-4"
          style={{
            background: `linear-gradient(to right, ${theme.gradient.from}, ${theme.gradient.to})`
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    // Back to service list - close properties panel and open service modal
                    closePropertiesPanel();
                    if (service) {
                      openServiceModal(service);
                    }
                  }}
                  className="text-white hover:text-gray-200 text-lg font-bold w-6 h-6 flex items-center justify-center flex-shrink-0"
                  title="Back to service list"
                >
                  ←
                </button>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold truncate">{subService ? subService.name : service?.name || 'Service'}</h2>
                  <p className="text-white text-opacity-90 text-sm truncate">
                    {currentProvider.toUpperCase()}::{(service?.id || 'service').toUpperCase()}
                  </p>
                  <span 
                    className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                    style={{
                      backgroundColor: theme.accent,
                      color: 'white'
                    }}
                  >
                    Properties
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={closePropertiesPanel}
              className="text-white hover:text-gray-200 text-xl font-bold w-6 h-6 flex items-center justify-center flex-shrink-0 ml-2"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="flex-1 p-6 overflow-y-auto"
          style={{
            backgroundColor: theme.background
          }}
        >
          {allProperties.length === 0 ? (
            <div 
              className="text-center py-8"
              style={{ color: theme.textSecondary }}
            >
              <p>Select a service to configure its properties</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Common Properties */}
              {service?.commonProperties && service.commonProperties.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-300 mb-2">Common Properties</h3>
                  <div className="space-y-3">
                    {service.commonProperties.map((property) => (
                      <div key={property.id} className="p-3 rounded-lg border" style={{
                        backgroundColor: theme.surface,
                        borderColor: theme.border
                      }}>
                        <div className="flex items-center justify-between mb-1">
                          <label 
                            className="text-xs font-medium text-slate-300"
                            style={{ color: theme.text }}
                          >
                            {property.name}
                          </label>
                          {property.required && (
                            <span 
                              className="text-xs px-2 py-0.5 rounded text-white"
                              style={{ backgroundColor: theme.accent }}
                            >
                              Required
                            </span>
                          )}
                        </div>
                        {property.description && (
                          <p className="text-xs mb-2" style={{ color: theme.textSecondary }}>
                            {property.description}
                          </p>
                        )}
                        {renderPropertyInput(property)}
                        {errors[property.id] && (
                          <p className="text-red-500 text-xs mt-1">{errors[property.id]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Service Properties */}
              {subService?.properties && subService.properties.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-300 mb-2">{subService.name} Properties</h3>
                  <div className="space-y-3">
                    {subService.properties.map((property) => (
                      <div key={property.id} className="p-3 rounded-lg border" style={{
                        backgroundColor: theme.surface,
                        borderColor: theme.border
                      }}>
                        <div className="flex items-center justify-between mb-1">
                          <label 
                            className="text-xs font-medium text-slate-300"
                            style={{ color: theme.text }}
                          >
                            {property.name}
                          </label>
                          {property.required && (
                            <span 
                              className="text-xs px-2 py-0.5 rounded text-white"
                              style={{ backgroundColor: theme.accent }}
                            >
                              Required
                            </span>
                          )}
                        </div>
                        {property.description && (
                          <p className="text-xs mb-2" style={{ color: theme.textSecondary }}>{property.description}</p>
                        )}
                        {renderPropertyInput(property)}
                        {errors[property.id] && (
                          <p className="text-red-500 text-xs mt-1">{errors[property.id]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Listeners section for Load Balancer-style UI */}
              {listeners.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-300 mb-2">Listeners</h3>
                  <div className="space-y-2">
                    {listeners.map((l, idx) => (
                      <div key={idx} className="rounded-lg border bg-slate-700 text-slate-200 p-3" style={{ borderColor: theme.border }}>
                        <div className="font-medium text-sm">{l.protocol}: {l.port}</div>
                        <div className="text-xs text-slate-300">Forward to: {l.target}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setListeners(prev => [...prev, { protocol: 'HTTPS', port: 443, target: 'tg-web-servers' }])}
                    className="mt-2 text-blue-400 text-xs hover:text-blue-300"
                  >
                    Add listener
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <div className="flex justify-between items-center text-sm">
            <div className="text-slate-300">
              {allProperties.length} properties
            </div>
            <div className="flex space-x-2">
              <button
                onClick={closePropertiesPanel}
                className="bg-slate-600 text-white px-3 py-1.5 rounded text-xs hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-500 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PropertiesPanel };