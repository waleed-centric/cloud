import React, { useState, useEffect } from 'react';
import { useAwsBuilder } from '@/context/AwsBuilderContext';
import { ServiceProperty, SubService, DetailedAwsService } from '../../data/aws-services-detailed';

// Summary: Properties Panel component - shows configuration options for selected service/sub-service
// - Displays properties form and allows saving configuration

const PropertiesPanel: React.FC = () => {
  const { state, closePropertiesPanel, updateNodeProperties, openServiceModal, addSubServiceNode } = useAwsBuilder();
  const [propertyValues, setPropertyValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!state.showPropertiesPanel || !state.selectedService) {
    return null;
  }

  const service = state.selectedService;
  const subService = state.selectedSubService;

  // Combine common properties and sub-service properties
  const allProperties = [
    ...(service?.commonProperties || []),
    ...(subService?.properties || [])
  ];

  useEffect(() => {
    // Initialize property values with defaults
    const initialProps: Record<string, any> = {};
    allProperties.forEach(prop => {
      initialProps[prop.id] = prop.defaultValue ?? '';
    });
    setPropertyValues(initialProps);
    setErrors({});
  }, [service, subService]);

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
      // Save properties to context (for future node updates)
      console.log('Saving properties:', propertyValues);
      
      // Add node directly to canvas with these properties
      if (service && subService) {
        const x = Math.random() * 400 + 100;
        const y = Math.random() * 300 + 100;
        addSubServiceNode(subService, service, x, y, propertyValues);
      }

      closePropertiesPanel();
    }
  };

  const renderPropertyInput = (property: ServiceProperty) => {
    const value = propertyValues[property.id] ?? '';
    const hasError = !!errors[property.id];

    switch (property.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
            className={`w-full text-black px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
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
            className={`w-full text-black px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={`Enter ${property.name.toLowerCase()}`}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
            className={`w-full text-black px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select {property.name}</option>
            {property.options?.map((option) => (
              <option key={option} value={option}>
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
              className="w-4 text-black h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
              hasError ? 'border-red-500' : 'border-gray-300'
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
            className={`w-full text-black px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );
    }
  };

  if (!state.showPropertiesPanel) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200">
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
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
                  <h2 className="text-lg font-bold truncate">Configure Properties</h2>
                  <p className="text-green-100 text-sm truncate">
                    {service?.name} {subService ? `- ${subService.name}` : ''}
                  </p>
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
        <div className="flex-1 p-4 overflow-y-auto">
          {allProperties.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No properties available for configuration</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Common Properties */}
              {service?.commonProperties && service.commonProperties.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Common Properties
                  </h3>
                  <div className="space-y-3">
                    {service.commonProperties.map((property) => (
                      <div key={property.id} className="bg-gray-50 p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-medium text-gray-700 text-sm">
                            {property.name}
                          </label>
                          {property.required && (
                            <span className="text-red-500 text-xs">Required</span>
                          )}
                        </div>
                        {property.description && (
                          <p className="text-xs text-gray-600 mb-2">{property.description}</p>
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
                  <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {subService.name} Properties
                  </h3>
                  <div className="space-y-3">
                    {subService.properties.map((property) => (
                      <div key={property.id} className="bg-gray-50 p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-medium text-gray-700 text-sm">
                            {property.name}
                          </label>
                          {property.required && (
                            <span className="text-red-500 text-xs">Required</span>
                          )}
                        </div>
                        {property.description && (
                          <p className="text-xs text-gray-600 mb-2">{property.description}</p>
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t">
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-600">
              {allProperties.length} properties
            </div>
            <div className="flex space-x-2">
              <button
                onClick={closePropertiesPanel}
                className="bg-gray-500 text-white px-3 py-1.5 rounded text-xs hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-3 py-1.5 rounded text-xs hover:bg-green-600 transition-colors"
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