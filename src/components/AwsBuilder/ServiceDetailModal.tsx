import React from 'react';
import { useAwsBuilder } from '@/context/AwsBuilderContext';
import { DetailedAwsService, SubService } from '../../data/aws-services-detailed';
import { DetailedAzureService, AzureSubService } from '../../data/azure-services-detailed';
import { DetailedGcpService, GcpSubService } from '../../data/gcp-services-detailed';
import type { DetailedService, SubServiceType } from '@/context/AwsBuilderContext';
import { useCloudProvider } from '@/context/CloudProviderContext';
import { getProviderTheme } from '@/data/theme-colors';
import { usePricing } from '@/context/PricingContext';

// Summary: Service Detail Modal component - shows AWS service details and sub-services
// - Displays service information, sub-services, and allows adding to canvas

const ServiceDetailModal: React.FC = () => {
  const { currentProvider } = useCloudProvider();
  const { state, closeServiceModal, openPropertiesPanel, addSubServiceNode } = useAwsBuilder();
  const { getPricingSummaryForService } = usePricing();
  
  if (!state.showServiceModal || !state.selectedService) {
    return null;
  }

  const service = state.selectedService;
  // Defensive defaults in case a partial service object is present
  const commonProperties = Array.isArray(service?.commonProperties) ? service.commonProperties : [];
  const subServices = Array.isArray(service?.subServices) ? service.subServices : [];
  const theme = getProviderTheme(currentProvider);

  const handleSubServiceSelect = (subService: SubServiceType) => {
    openPropertiesPanel(service, subService);
  };

  // Removed Add to Canvas button: flow shifted to Configure -> Properties -> Save

  return (
    <div 
      className="fixed top-0 right-0 h-full w-96 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
      style={{
        backgroundColor: theme.background,
        borderLeft: `1px solid ${theme.border}`
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
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded"
                style={{
                  minWidth: '32px',
                  minHeight: '32px',
                  maxWidth: '32px',
                  maxHeight: '32px'
                }}
                dangerouslySetInnerHTML={{ __html: service.icon || '' }}
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold truncate">{service.name || 'Service'}</h2>
                <span 
                  className="inline-block text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: theme.accent,
                    color: 'white'
                  }}
                >
                  {service.category || 'Unknown'}
                </span>
                <div className="text-xs mt-1" style={{ color: 'white' }}>
                  {getPricingSummaryForService(service.id)}
                </div>
              </div>
            </div>
            <button
              onClick={closeServiceModal}
              className="text-white hover:text-opacity-80 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-white text-opacity-90 text-sm">{service.description || ''}</p>
        </div>

        {/* Content */}
        <div 
          className="flex-1 p-4 overflow-y-auto"
          style={{
            backgroundColor: theme.background
          }}
        >
          {/* Common Properties Section */}
          {commonProperties.length > 0 && (
            <div className="mb-6">
              <h3 
                className="text-md font-semibold mb-3 flex items-center"
                style={{ color: theme.text }}
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Common Properties
              </h3>
              <div className="space-y-3">
                {commonProperties.map((prop) => (
                  <div 
                    key={prop.id}
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      color: theme.text
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                        <label 
                          className="font-medium text-sm"
                          style={{ color: theme.text }}
                        >
                          {prop.name}
                        </label>
                        {prop.required && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: theme.accent,
                              color: 'white'
                            }}
                          >
                            Required
                          </span>
                        )}
                      </div>
                      <p 
                        className="text-xs mb-2"
                        style={{ color: theme.textSecondary }}
                      >
                        {prop.description}
                      </p>
                      <div className="text-xs" style={{ color: theme.textSecondary }}>
                        Type: {prop.type} | Default: {String(prop.defaultValue || 'None')}
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Services Section */}
          <div>
            <h3 
              className="text-lg font-semibold mb-3"
              style={{ color: theme.text }}
            >
              Available Sub-Services ({subServices.length})
            </h3>
            <div className="space-y-3">
              {subServices.map((subService) => (
                <div
                    key={subService.id}
                    className="border rounded-lg p-3 hover:shadow-sm transition-all cursor-pointer group"
                    style={{
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      color: theme.text
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.hover;
                      e.currentTarget.style.borderColor = theme.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.surface;
                      e.currentTarget.style.borderColor = theme.border;
                    }}
                  >
                  <div className="flex items-start space-x-2 mb-2">
                    <span className="text-lg">{subService.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="font-medium text-sm truncate"
                        style={{ color: theme.text }}
                      >
                        {subService.name}
                      </h4>
                      <p 
                        className="text-xs mt-1"
                        style={{ color: theme.textSecondary }}
                      >
                        {subService.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    {(subService.properties || []).length} properties
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => handleSubServiceSelect(subService)}
                      className="w-full text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: theme.primary
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.primaryDark;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.primary;
                      }}
                    >
                      Configure
                    </button>
                  </div>

                  {/* Properties Preview */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-600 mb-1">Key Properties:</div>
                    <div className="space-y-0.5">
                      {(subService.properties || []).slice(0, 2).map((prop) => (
                        <div key={prop.id} className="flex justify-between text-xs">
                          <span className="text-gray-600 truncate">{prop.name}</span>
                          <span className="text-gray-500 ml-1">{prop.type}</span>
                        </div>
                      ))}
                      {(subService.properties || []).length > 2 && (
                        <div className="text-xs text-gray-500 italic">
                          +{(subService.properties || []).length - 2} more...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total Sub-Services: {subServices.length} | 
              Common Properties: {commonProperties.length}
            </div>
            <button
              onClick={closeServiceModal}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ServiceDetailModal };