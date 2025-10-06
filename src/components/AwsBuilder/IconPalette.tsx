import React, { useEffect, useMemo, useState } from 'react';
import { AWS_ICONS_BY_CATEGORY, AWS_CATEGORIES } from '@/data/aws-icons';
import { AZURE_ICONS_BY_CATEGORY, AZURE_CATEGORIES } from '@/data/azure-icons';
import { GCP_ICONS_BY_CATEGORY, GCP_CATEGORIES } from '@/data/gcp-icons';
import { useCloudProvider } from '@/context/CloudProviderContext';
import Image from 'next/image';

// Summary: Icon Palette component - left sidebar with cloud provider service icons
// - Displays icons grouped by categories (Compute, Storage, Database, etc.)
// - Supports drag and drop functionality
// - Includes search filtering
// - Dynamically switches between AWS, Azure, and GCP services based on selected provider

interface IconPaletteProps {
  sidebarExpanded?: boolean;
  setSidebarExpanded?: (expanded: boolean) => void;
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
    <div className="h-full flex flex-col bg-gray-50 text-gray-900 border-r border-gray-200">
      {/* Collapsed State - Show only icons */}
      {!sidebarExpanded && (
        <div className="relative h-full flex flex-col items-center py-4 space-y-3 overflow-y-auto bg-white border-r border-gray-200">
          {/* Provider vertical tabs (collapsed) */}
          
          <div className="flex flex-col items-center gap-3 mb-4">
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

                <span onClick={() => console.log(p)} className="text-lg font-medium"><Image src={providers[p].icon} width={90} height={45} alt={providers[p].name} /></span>
                <span className="sr-only">{providers[p].name}</span>
              </button>
            ))}
          </div>


          {/* Vertical provider label */}
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium select-none"
            style={{ writingMode: 'vertical-rl' }}
          >
            {providers[currentProvider].name}
          </div>

          {/* Accent bar on the inner edge */}
          <button
            className="absolute right-0 top-0 bottom-0 w-1 bg-orange-500/80 hover:bg-orange-500 transition-colors cursor-pointer"
            onClick={() => setSidebarExpanded?.(true)}
            title="Expand sidebar"
          />
        </div>
      )}

      {/* Expanded State - Show full interface */}
      {sidebarExpanded && (
        <>
          {/* Header with title and back arrow */}
          <div className="px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex w-full justify-between items-center gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{providers[currentProvider].name} Services</h2>
                  <p className="text-sm text-gray-500">Drag services to canvas</p>
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
          </div>

          <div className='flex w-full'>
            {/* Provider Tabs */}
            <div className="py-3 bg-white border-b border-gray-200">
              <div className="flex flex-col items-center gap-1">
                {(['aws', 'azure', 'gcp'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentProvider === p
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    title={providers[p].fullName}
                  >
                    <span className="text-base"><Image src={providers[p].icon} width={24} height={24} alt={providers[p].name} /></span>
                    <span className="sr-only">{providers[p].name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories - Accordion Style */}
            <div className="flex-1 overflow-y-auto bg-white">
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
                       
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
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
                              className="relative bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-200 group hover:shadow-md hover:border-gray-300"
                            >
                              <div className="flex flex-col items-center text-center">
                                <div
                                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                                  className="w-10 h-10 mb-3 group-hover:scale-105 transition-transform [&>svg]:w-full [&>svg]:h-full"
                                />
                                <span className="text-xs text-gray-700 font-medium leading-tight">
                                  {displayAlias[icon.id] || icon.name}
                                </span>
                              </div>
                              {/* Favorite toggle */}
                              <button
                                className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${favorites[icon.id]
                                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                                  }`}
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFavorite(icon.id); }}
                                title={favorites[icon.id] ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <svg className="w-3 h-3" fill={favorites[icon.id] ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              </button>
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
        </>
      )}
    </div>
  );
}

