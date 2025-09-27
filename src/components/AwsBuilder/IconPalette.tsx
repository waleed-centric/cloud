import React, { useState } from 'react';
import { AWS_ICONS_BY_CATEGORY, AWS_CATEGORIES } from '@/data/aws-icons';
import { AZURE_ICONS_BY_CATEGORY, AZURE_CATEGORIES } from '@/data/azure-icons';
import { GCP_ICONS_BY_CATEGORY, GCP_CATEGORIES } from '@/data/gcp-icons';
import { useCloudProvider } from '@/context/CloudProviderContext';

// Summary: Icon Palette component - left sidebar with cloud provider service icons
// - Displays icons grouped by categories (Compute, Storage, Database, etc.)
// - Supports drag and drop functionality
// - Includes search filtering
// - Dynamically switches between AWS, Azure, and GCP services based on selected provider

interface IconPaletteProps {
  sidebarExpanded?: boolean;
}

const DISPLAY_ALIAS: Record<string, Record<string, string>> = {
  aws: {
    'ec2': 'EC2 Instance',
    's3': 'S3 Bucket',
    'rds': 'RDS Database',
    'lambda': 'Lambda Function',
    'vpc': 'VPC Network',
    'cloudfront': 'CloudFront CDN',
    'elb': 'Load Balancer',
    'api-gateway': 'API Gateway',
    'dynamodb': 'DynamoDB',
    'subnet': 'Subnet'
  },
  azure: {
    'virtual-machines': 'Virtual Machine',
    'azure-functions': 'Azure Functions',
    'azure-storage': 'Storage Account',
    'azure-sql': 'SQL Database',
    'azure-ml': 'Machine Learning',
    'virtual-network': 'Virtual Network',
    'aks': 'Kubernetes Service',
    'app-service': 'App Service'
  },
  gcp: {
    'compute-engine': 'Compute Engine',
    'cloud-functions': 'Cloud Functions',
    'cloud-storage': 'Cloud Storage',
    'persistent-disk': 'Persistent Disk',
    'cloud-sql': 'Cloud SQL',
    'bigquery': 'BigQuery',
    'vertex-ai': 'Vertex AI',
    'vpc': 'Virtual Private Cloud',
    'gke': 'Kubernetes Engine',
    'cloud-run': 'Cloud Run'
  }
};

// Props interface for SVG components
interface ChevronIconProps {
  className?: string;
}

// Simple SVG icons for chevron
const ChevronDownIcon: React.FC<ChevronIconProps> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRightIcon: React.FC<ChevronIconProps> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export function IconPalette({ sidebarExpanded = true }: IconPaletteProps) {
  const { currentProvider } = useCloudProvider();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Networking': true, // Default expanded
    'Compute': false,
    'Database': false,
    'Storage': false,
    'Security': false,
    'Analytics': false,
    'AI & Machine Learning': false,
    'Containers': false,
    'Web': false,
    'Analytics & Big Data': false
  });

  // Get current provider's data
  const getCurrentProviderData = () => {
    switch (currentProvider) {
      case 'azure':
        return {
          iconsByCategory: AZURE_ICONS_BY_CATEGORY,
          categories: AZURE_CATEGORIES,
          displayAlias: DISPLAY_ALIAS.azure
        };
      case 'gcp':
        return {
          iconsByCategory: GCP_ICONS_BY_CATEGORY,
          categories: GCP_CATEGORIES,
          displayAlias: DISPLAY_ALIAS.gcp
        };
      default: // aws
        return {
          iconsByCategory: AWS_ICONS_BY_CATEGORY,
          categories: AWS_CATEGORIES,
          displayAlias: DISPLAY_ALIAS.aws
        };
    }
  };

  const { iconsByCategory, categories, displayAlias } = getCurrentProviderData();

  const handleDragStart = (e: React.DragEvent, icon: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(icon));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const filteredCategories = categories.filter(category => {
    if (!searchTerm) return true;
    
    const categoryIcons = iconsByCategory[category] || [];
    return categoryIcons.some(icon => 
      icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      icon.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (displayAlias[icon.id] && displayAlias[icon.id].toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getFilteredIcons = (category: string) => {
    const categoryIcons = iconsByCategory[category] || [];
    if (!searchTerm) return categoryIcons;
    
    return categoryIcons.filter(icon => 
      icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      icon.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (displayAlias[icon.id] && displayAlias[icon.id].toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      {/* Collapsed State - Show only icons */}
      {!sidebarExpanded && (
        <div className="flex flex-col items-center py-4 space-y-3 overflow-y-auto">
          {/* Most used services when collapsed - provider specific */}
          {currentProvider === 'aws' && ['ec2', 's3', 'rds', 'lambda', 'vpc'].map((serviceId) => {
            const category = categories.find(cat => 
              iconsByCategory[cat]?.some(icon => icon.id === serviceId)
            );
            const icon = category ? iconsByCategory[category]?.find(i => i.id === serviceId) : null;
            
            if (!icon) return null;
            
            return (
              <div
                key={icon.id}
                draggable
                onDragStart={(e) => handleDragStart(e, icon)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-2 cursor-grab active:cursor-grabbing transition-colors group"
                title={displayAlias[icon.id] || icon.name}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                  className="w-6 h-6 group-hover:scale-110 transition-transform [&>svg]:w-full [&>svg]:h-full"
                />
              </div>
            );
          })}
          
          {currentProvider === 'azure' && ['virtual-machines', 'azure-functions', 'azure-storage', 'azure-sql', 'virtual-network'].map((serviceId) => {
            const category = categories.find(cat => 
              iconsByCategory[cat]?.some(icon => icon.id === serviceId)
            );
            const icon = category ? iconsByCategory[category]?.find(i => i.id === serviceId) : null;
            
            if (!icon) return null;
            
            return (
              <div
                key={icon.id}
                draggable
                onDragStart={(e) => handleDragStart(e, icon)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-2 cursor-grab active:cursor-grabbing transition-colors group"
                title={displayAlias[icon.id] || icon.name}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                  className="w-6 h-6 group-hover:scale-110 transition-transform [&>svg]:w-full [&>svg]:h-full"
                />
              </div>
            );
          })}
          
          {currentProvider === 'gcp' && ['compute-engine', 'cloud-functions', 'cloud-storage', 'cloud-sql', 'vpc'].map((serviceId) => {
            const category = categories.find(cat => 
              iconsByCategory[cat]?.some(icon => icon.id === serviceId)
            );
            const icon = category ? iconsByCategory[category]?.find(i => i.id === serviceId) : null;
            
            if (!icon) return null;
            
            return (
              <div
                key={icon.id}
                draggable
                onDragStart={(e) => handleDragStart(e, icon)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-2 cursor-grab active:cursor-grabbing transition-colors group"
                title={displayAlias[icon.id] || icon.name}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                  className="w-6 h-6 group-hover:scale-110 transition-transform [&>svg]:w-full [&>svg]:h-full"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded State - Show full interface */}
      {sidebarExpanded && (
        <>
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-800">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Categories - Accordion Style */}
          <div className="flex-1 overflow-y-auto">
            {filteredCategories.map((category) => {
              const categoryIcons = getFilteredIcons(category);
              const isExpanded = expandedCategories[category];
              
              if (categoryIcons.length === 0) return null;

              return (
                <div key={category} className="border-b border-slate-800">
                  {/* Category Header - Clickable */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800 transition-colors"
                  >
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                      {category}
                    </h3>
                    {isExpanded ? (
                      <ChevronDownIcon className="w-4 h-2 text-slate-400" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-2 text-slate-400" />
                    )}
                  </button>

                  {/* Category Content - Collapsible */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-2 gap-2">
                        {categoryIcons.map((icon) => (
                          <div
                            key={icon.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, icon)}
                            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-colors group"
                          >
                            <div className="flex flex-col items-center text-center">
                              <div
                                dangerouslySetInnerHTML={{ __html: icon.svg }}
                                className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform [&>svg]:w-full [&>svg]:h-full"
                              />
                              <span className="text-xs text-slate-300 leading-tight">
                                {displayAlias[icon.id] || icon.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}