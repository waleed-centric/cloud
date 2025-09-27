import React from 'react';
import { useAwsBuilder } from '@/context/AwsBuilderContext';
import { DetailedAwsService, SubService } from '../../data/aws-services-detailed';

// Summary: Service Detail Modal component - shows AWS service details and sub-services
// - Displays service information, sub-services, and allows adding to canvas

const ServiceDetailModal: React.FC = () => {
  const { state, closeServiceModal, openPropertiesPanel, addSubServiceNode } = useAwsBuilder();
  
  if (!state.showServiceModal || !state.selectedService) {
    return null;
  }

  const service = state.selectedService;

  const handleSubServiceSelect = (subService: SubService) => {
    openPropertiesPanel(service, subService);
  };

  // Removed Add to Canvas button: flow shifted to Configure -> Properties -> Save

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200">
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
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
                dangerouslySetInnerHTML={{ __html: service.icon }}
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold truncate">{service.name}</h2>
                <span className="inline-block bg-blue-500 text-xs px-2 py-0.5 rounded-full">
                  {service.category}
                </span>
              </div>
            </div>
            <button
              onClick={closeServiceModal}
              className="text-white hover:text-gray-200 text-xl font-bold w-6 h-6 flex items-center justify-center flex-shrink-0"
            >
              ×
            </button>
          </div>
          <p className="text-blue-100 text-sm">{service.description}</p>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Common Properties Section */}
          {service.commonProperties.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Common Properties
              </h3>
              <div className="space-y-3">
                {service.commonProperties.map((prop) => (
                  <div key={prop.id} className="bg-gray-50 p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-medium text-gray-700 text-sm">{prop.name}</label>
                      {prop.required && (
                        <span className="text-red-500 text-xs">Required</span>
                      )}
                    </div>
                    {prop.description && (
                      <p className="text-xs text-gray-600 mb-2">{prop.description}</p>
                    )}
                    <div className="text-xs text-gray-500">
                      Type: {prop.type} | Default: {String(prop.defaultValue || 'None')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Services Section */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Sub-Services ({service.subServices.length})
            </h3>
            <div className="space-y-3">
              {service.subServices.map((subService) => (
                <div
                  key={subService.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-start space-x-2 mb-2">
                    <span className="text-lg">{subService.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 group-hover:text-blue-600 text-sm truncate">
                        {subService.name}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{subService.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    {subService.properties.length} properties
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => handleSubServiceSelect(subService)}
                      className="w-full bg-blue-500 text-white px-2 py-1.5 rounded text-xs hover:bg-blue-600 transition-colors"
                    >
                      Configure
                    </button>
                  </div>

                  {/* Properties Preview */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-600 mb-1">Key Properties:</div>
                    <div className="space-y-0.5">
                      {subService.properties.slice(0, 2).map((prop) => (
                        <div key={prop.id} className="flex justify-between text-xs">
                          <span className="text-gray-600 truncate">{prop.name}</span>
                          <span className="text-gray-500 ml-1">{prop.type}</span>
                        </div>
                      ))}
                      {subService.properties.length > 2 && (
                        <div className="text-xs text-gray-500 italic">
                          +{subService.properties.length - 2} more...
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
              Total Sub-Services: {service.subServices.length} | 
              Common Properties: {service.commonProperties.length}
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