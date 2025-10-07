import React, { useEffect, useMemo, useState } from 'react';
import { AWS_ICONS_BY_CATEGORY, AWS_CATEGORIES } from '@/data/aws-icons-helper';
import { AZURE_ICONS_BY_CATEGORY, AZURE_CATEGORIES } from '@/data/azure-icons';
import { GCP_ICONS_BY_CATEGORY, GCP_CATEGORIES } from '@/data/gcp-icons';
import { useCloudProvider } from '@/context/CloudProviderContext';
// Removed Next.js Image for provider and service tiles in favor of SVGs

// Summary: Icon Palette component - left sidebar with cloud provider service icons
// - Displays icons grouped by categories (Compute, Storage, Database, etc.)
// - Supports drag and drop functionality
// - Includes search filtering
// - Dynamically switches between AWS, Azure, and GCP services based on selected provider

interface IconPaletteProps {
  sidebarExpanded?: boolean;
  setSidebarExpanded?: (expanded: boolean) => void;
}

// SVG paths for cloud provider logos (from public/images/Svg)
const PROVIDER_SVG = {
  aws: '/aws/aws.svg',
  azure: '/aws/azure.svg',
  gcp: '/aws/gcp.svg',
} as const;

// AWS Service SVG mapping (from public/images/AWS Services Icon)
const AWS_SERVICE_SVG: Record<string, string> = {
  // Compute
  'ec2': '/images/AWS Services Icon/EC2 Icon.svg',
  'lambda': '/images/AWS Services Icon/Lambda Icon.svg',
  'batch': '/images/AWS Services Icon/Batch Icon.svg',
  'fargate': '/images/AWS Services Icon/Fargate Icon.svg',
  'ecs': '/images/AWS Services Icon/ECS Icon.svg',
  'eks': '/images/AWS Services Icon/EKS Icon.svg',
  // Storage
  's3': '/images/AWS Services Icon/S3 Icon.svg',
  'efs': '/images/AWS Services Icon/EFS Icon.svg',
  'ebs': '/images/AWS Services Icon/EBS Icon.svg',
  'fsx': '/images/AWS Services Icon/FSx Icon.svg',
  'glacier': '/images/AWS Services Icon/Glacier Icon.svg',
  // Database
  'rds': '/images/AWS Services Icon/RDS Icon.svg',
  'dynamodb': '/images/AWS Services Icon/DynamoDB Icon.svg',
  'aurora': '/images/AWS Services Icon/Aurora Icon.svg',
  'documentdb': '/images/AWS Services Icon/DocumentDB Icon.svg',
  'elasticsearch': '/images/AWS Services Icon/Elasticsearch Icon.svg',
  'redshift': '/images/AWS Services Icon/Redshift Icon.svg',
  // Networking & Delivery
  'vpc': '/images/AWS Services Icon/VPC Icon.svg',
  'cloudfront': '/images/AWS Services Icon/CloudFront Icon.svg',
  'elb': '/images/AWS Services Icon/Load Balancer Icon.svg',
  'api-gateway': '/images/AWS Services Icon/API Gateway Icon.svg',
  'direct-connect': '/images/AWS Services Icon/Direct Connect Icon.svg',
  'route-53': '/images/AWS Services Icon/Route 53 Icon.svg',
  // Security & IAM
  'iam': '/images/AWS Services Icon/IAM Icon.svg',
  'kms': '/images/AWS Services Icon/KMS Icon.svg',
  'secrets-manager': '/images/AWS Services Icon/Secrets Manager Icon.svg',
  'waf': '/images/AWS Services Icon/WAF Icon.svg',
  // Monitoring & Logging
  'cloudtrail': '/images/AWS Services Icon/CloudTrail Icon.svg',
  'cloudwatch': '/images/AWS Services Icon/CloudWatch Icon.svg',
  'x-ray': '/images/AWS Services Icon/X-Ray Icon.svg',
  // Identity
  'cognito': '/images/AWS Services Icon/Cognito Icon.svg',
};

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

export function IconPalette({ sidebarExpanded = true, setSidebarExpanded }: IconPaletteProps) {
  const { currentProvider, setProvider, providers } = useCloudProvider();
  const [searchTerm, setSearchTerm] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
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

  // Favorites persistence by provider
  const storageKey = useMemo(() => `sidebar:favorites:${currentProvider}`, [currentProvider]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setFavorites(raw ? JSON.parse(raw) : {});
    } catch {
      setFavorites({});
    }
  }, [storageKey]);

  const persistFavorites = (next: Record<string, boolean>) => {
    setFavorites(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch { }
  };

  const toggleFavorite = (id: string) => {
    const next = { ...favorites, [id]: !favorites[id] };
    persistFavorites(next);
  };

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

  const clearSearch = () => setSearchTerm('');

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    categories.forEach(cat => { next[cat] = true; });
    setExpandedCategories(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    categories.forEach(cat => { next[cat] = false; });
    // Keep Networking open by default
    next['Networking'] = true;
    setExpandedCategories(next);
  };

  // Helper to get count for a category (considering search and favorites filter)
  const getCategoryCount = (category: string) => {
    const icons = getFilteredIcons(category);
    const filtered = favoritesOnly ? icons.filter(i => favorites[i.id]) : icons;
    return filtered.length;
  };

  return (
    <div className={`h-screen flex flex-col bg-gray-50 text-gray-900 border-r border-gray-200 w-full`}>
      {/* Collapsed State - Show only icons */}
      {!sidebarExpanded && (
        <div className="relative h-full flex  bg-white border-r border-gray-200">
          {/* Provider vertical tabs (collapsed) */}
          <div className="flex flex-col items-center gap-3 px-2">
            {(['aws', 'azure', 'gcp'] as const).map(p => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-200 hover:scale-105 ${currentProvider === p
                  ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-md'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                title={providers[p].fullName}
              >
                <span className="text-lg font-medium">
                  <img src={PROVIDER_SVG[p]} alt={providers[p].name} className="w-10 h-10" />
                </span>
              </button>
            ))}
          </div>


          <button
            onClick={() => setSidebarExpanded?.(true)}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="relative h-full bg-orange-50 border-l-2 border-r-1 border-orange-500 flex items-center justify-center group px-1"
          >
            
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-gray-500 group-hover:text-orange-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            
            <span
              className="text-xs text-gray-500 font-medium select-none"
              style={{ writingMode: 'vertical-rl' }}
            >
              {providers[currentProvider].name}
            </span>
          </button>
        </div>
      )}

      {/* Expanded State - Show full interface */}
      {sidebarExpanded && (
          <div className='flex w-full h-screen overflow-y-auto'>
            {/* Provider Tabs */}
            <div className="py-3 px-1 bg-white  border-orange-200 border-r">
              <div className="flex flex-col items-center gap-1">
                {(['aws', 'azure', 'gcp'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`flex items-center  px-1 rounded-lg text-sm font-medium transition-colors 
                     m-1
                    `}
                    title={providers[p].fullName}
                  >
                    <img src={PROVIDER_SVG[p]} alt={providers[p].name} className={`rounded-lg ${currentProvider === p
                      ? 'shadow-xl '
                      : ''
                      }`} />
                    <span className="sr-only">{providers[p].name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories - Accordion Style */}
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="px-4 py-3 border-b border-gray-200 bg-white">
                  <div className="flex w-full justify-between items-center gap-3">
                    <div className='p-1'>
                      <h2 className="text-sm font-normal text-[#101828]">{providers[currentProvider].name} Services</h2>
                      <p className="text-xs text-gray-500">Drag services to canvas</p>
                    </div>
                    <button
                      onClick={() => setSidebarExpanded?.(false)}
                      className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                      title="Collapse sidebar"
                      aria-label="Collapse sidebar"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  </div>
              </div>
              <div className='bg-orange-500 w-full h-[1px] rounded-2xl'></div>
              {filteredCategories.map((category) => {
                const categoryIcons = (favoritesOnly ? getFilteredIcons(category).filter(i => favorites[i.id]) : getFilteredIcons(category));
                const isExpanded = expandedCategories[category];

                if (categoryIcons.length === 0) return null;

                return (
                  <div key={category} className="border-b border-gray-100 last:border-b-0">
                    {/* Category Header - Clickable */} 
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 w-full justify-between">

                        <h3 className="text-xs font-normal text-gray-900 capitalize tracking-wide">
                          {category}
                        </h3>
                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                          <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </div>
                    </button>

                    {/* Category Content - Collapsible */}
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-2 gap-3">
                          {categoryIcons.map((icon) => (
                            <div
                              key={icon.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, icon)}
                              className="relative bg-white  border border-gray-200 rounded-xl  cursor-grab active:cursor-grabbing transition-all duration-200 group hover:shadow-sm "
                            >
                              <div className="flex flex-col items-center text-center py-3">
                                <div className="  group-hover:scale-105 transition-transform flex items-center justify-center">
                                  {(() => {
                                    const awsSvg = currentProvider === 'aws' ? AWS_SERVICE_SVG[icon.id] : undefined;
                                    const src = awsSvg || (icon as any).image || (icon as any).icon || '';
                                    return (
                                      <img
                                        src={src}
                                        alt={icon.name}
                                        className="w-8 h-10 object-contain"
                                      />
                                    );
                                  })()}
                                </div>
                                <span className="text-xs text-gray-700 font-medium leading-tight">
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
          </div>
      )}
    </div>
  );
}

