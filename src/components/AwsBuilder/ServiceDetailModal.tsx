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
      className="fixed top-0 right-0 h-full mt-[93px] w-96 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
      style={{
        backgroundColor: '#f8fafc',
        borderLeft: `1px solid #E5E7EB`
      }}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div 
          className="p-4 border-b"
          style={{
            backgroundColor: '#ffffff',
            borderColor: "#E5E7EB"
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-100 border"
                style={{
                  minWidth: '32px',
                  minHeight: '32px',
                  maxWidth: '32px',
                  maxHeight: '32px',
                  borderColor: "#E5E7EB"
                }}
                dangerouslySetInnerHTML={{ __html: service.icon || '' }}
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold truncate text-slate-800">{service.name || 'Service'}</h2>
                <span 
                  className="inline-block text-xs px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: '#f1f5f9',
                    borderColor: "#E5E7EB",
                    color: '#0f172a'
                  }}
                >
                  {service.category || 'Unknown'}
                </span>
                <div className="text-xs mt-1 text-slate-600">
                  {getPricingSummaryForService(service.id)}
                </div>
              </div>
            </div>
            <button
              onClick={closeServiceModal}
              className="text-slate-700 hover:text-slate-900 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-slate-600 text-sm">{service.description || ''}</p>
        </div>

        {/* Content */}
        <div 
          className="flex-1 p-4 overflow-y-auto"
          style={{
            backgroundColor: '#f8fafc'
          }}
        >
          {/* Common Properties Section */}
          {commonProperties.length > 0 && (
            <div className="mb-6">
              <h3 
                className="text-sm font-semibold mb-3 flex items-center text-slate-800"
              >
                <span className="w-2 h-2 bg-slate-400 rounded-full mr-2"></span>
                Common Properties
              </h3>
              <div className="space-y-3">
                {commonProperties.map((prop) => (
                  <div 
                    key={prop.id}
                    className="p-4 rounded-xl border bg-white"
                    style={{
                      borderColor: "#E5E7EB"
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                        <label 
                          className="font-medium text-xs text-slate-700"
                        >
                          {prop.name}
                        </label>
                        {prop.required && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded border bg-slate-100 text-slate-700"
                          >
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs mb-2 text-slate-600">{prop.description}</p>
                      <div className="text-xs text-slate-500">Type: {prop.type} | Default: {String(prop.defaultValue || 'None')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Services Section */}
          <div>
            <h3 
              className="text-sm font-semibold mb-3 text-slate-800"
            >
              Available Sub-Services ({subServices.length})
            </h3>
            <div className="space-y-3">
              {subServices.map((subService) => (
                <div
                    key={subService.id}
                    className="border rounded-xl p-4 bg-white hover:bg-slate-50 transition-all cursor-pointer group"
                    style={{
                      borderColor: "#E5E7EB",
                      color: '#0f172a'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.borderColor = theme.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = "#E5E7EB";
                    }}
                  >
                  <div className="flex items-start space-x-2 mb-2">
                    <span className="text-lg">{subService.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-slate-800">
                        {subService.name}
                      </h4>
                      <p className="text-xs mt-1 text-slate-600">{subService.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-500 mb-2">
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
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-600 mb-1">Key Properties:</div>
                    <div className="space-y-0.5">
                      {(subService.properties || []).slice(0, 2).map((prop) => (
                        <div key={prop.id} className="flex justify-between text-xs">
                          <span className="text-slate-700 truncate">{prop.name}</span>
                          <span className="text-slate-500 ml-1">{prop.type}</span>
                        </div>
                      ))}
                      {(subService.properties || []).length > 2 && (
                        <div className="text-xs text-slate-500 italic">
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
        <div className="bg-white px-6 py-4 border-t" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-600">
              Total Sub-Services: {subServices.length} | 
              Common Properties: {commonProperties.length}
            </div>
            <button
              onClick={closeServiceModal}
              className="bg-slate-200 text-slate-800 px-4 py-2 rounded hover:bg-slate-300 transition-colors"
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