// Azure Icons data module
// - Azure service icons with SVG data URIs for drag-and-drop builder
// - Following Microsoft Azure branding colors and design patterns

export type AzureIcon = {
  id: string;
  name: string;
  category: string;
  svg: string;
  width: number;
  height: number;
};

// Azure service icons with Microsoft Azure color scheme
export const AZURE_ICONS: AzureIcon[] = [
  {
    id: "azure-vm",
    name: "Virtual Machines",
    category: "Compute",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="azureVmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0078D4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#005A9E;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#azureVmGradient)" stroke="#323130" stroke-width="1"/>
      <rect x="8" y="12" width="34" height="26" rx="2" fill="white" opacity="0.9"/>
      <rect x="12" y="16" width="26" height="2" fill="#0078D4"/>
      <rect x="12" y="20" width="20" height="2" fill="#0078D4" opacity="0.7"/>
      <rect x="12" y="24" width="24" height="2" fill="#0078D4" opacity="0.7"/>
      <rect x="12" y="28" width="18" height="2" fill="#0078D4" opacity="0.5"/>
      <circle cx="36" cy="32" r="3" fill="#0078D4"/>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "azure-functions",
    name: "Azure Functions",
    category: "Compute",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="azureFunctionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFB900;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FF8C00;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#azureFunctionGradient)" stroke="#323130" stroke-width="1"/>
      <path d="M15 12 L20 12 L28 30 L35 30 L35 35 L28 35 L20 17 L15 17 Z" fill="white"/>
      <path d="M15 30 L25 30 L25 35 L15 35 Z" fill="white"/>
      <text x="25" y="42" text-anchor="middle" fill="white" font-size="8" font-family="Segoe UI, sans-serif">ƒ</text>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "azure-storage",
    name: "Storage Account",
    category: "Storage",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="azureStorageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#00BCF2;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0078D4;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#azureStorageGradient)" stroke="#323130" stroke-width="1"/>
      <rect x="8" y="12" width="34" height="6" rx="3" fill="white" opacity="0.9"/>
      <rect x="8" y="22" width="34" height="6" rx="3" fill="white" opacity="0.7"/>
      <rect x="8" y="32" width="34" height="6" rx="3" fill="white" opacity="0.5"/>
      <circle cx="38" cy="15" r="2" fill="#00BCF2"/>
      <circle cx="38" cy="25" r="2" fill="#00BCF2"/>
      <circle cx="38" cy="35" r="2" fill="#00BCF2"/>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "azure-sql",
    name: "Azure SQL Database",
    category: "Databases",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="azureSqlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E74856;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#C5282F;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#azureSqlGradient)" stroke="#323130" stroke-width="1"/>
      <ellipse cx="25" cy="18" rx="18" ry="4" fill="white" opacity="0.9"/>
      <rect x="7" y="18" width="36" height="14" fill="white" opacity="0.7"/>
      <ellipse cx="25" cy="32" rx="18" ry="4" fill="white" opacity="0.9"/>
      <rect x="20" y="22" width="2" height="8" fill="#E74856"/>
      <rect x="28" y="22" width="2" height="8" fill="#E74856"/>
      <text x="25" y="42" text-anchor="middle" fill="white" font-size="8" font-family="Segoe UI, sans-serif">SQL</text>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "azure-ml",
    name: "Azure Machine Learning",
    category: "AI + Machine Learning",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="azureMlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8661C5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6B46C1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#azureMlGradient)" stroke="#323130" stroke-width="1"/>
      <circle cx="25" cy="25" r="12" fill="none" stroke="white" stroke-width="2" opacity="0.9"/>
      <circle cx="25" cy="25" r="6" fill="white" opacity="0.8"/>
      <circle cx="25" cy="25" r="2" fill="#8661C5"/>
      <path d="M15 15 L20 20" stroke="white" stroke-width="2" opacity="0.7"/>
      <path d="M35 15 L30 20" stroke="white" stroke-width="2" opacity="0.7"/>
      <path d="M15 35 L20 30" stroke="white" stroke-width="2" opacity="0.7"/>
      <path d="M35 35 L30 30" stroke="white" stroke-width="2" opacity="0.7"/>
      <text x="25" y="42" text-anchor="middle" fill="white" font-size="8" font-family="Segoe UI, sans-serif">ML</text>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "azure-vnet",
    name: "Virtual Network",
    category: "Networking",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="azureVnetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#00BCF2;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0078D4;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#azureVnetGradient)" stroke="#323130" stroke-width="1"/>
      <rect x="8" y="8" width="34" height="34" rx="4" fill="none" stroke="white" stroke-width="2" stroke-dasharray="4,2"/>
      <circle cx="15" cy="15" r="3" fill="white" opacity="0.9"/>
      <circle cx="35" cy="15" r="3" fill="white" opacity="0.9"/>
      <circle cx="15" cy="35" r="3" fill="white" opacity="0.9"/>
      <circle cx="35" cy="35" r="3" fill="white" opacity="0.9"/>
      <path d="M18 15 L32 15" stroke="white" stroke-width="2" opacity="0.7"/>
      <path d="M15 18 L15 32" stroke="white" stroke-width="2" opacity="0.7"/>
      <path d="M35 18 L35 32" stroke="white" stroke-width="2" opacity="0.7"/>
      <path d="M18 35 L32 35" stroke="white" stroke-width="2" opacity="0.7"/>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "azure-aks",
    name: "Azure Kubernetes Service",
    category: "Containers",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="azureAksGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#326CE5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1E4A72;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#azureAksGradient)" stroke="#323130" stroke-width="1"/>
      <path d="M25 8 L35 18 L30 28 L20 28 L15 18 Z" fill="white" opacity="0.9"/>
      <circle cx="25" cy="20" r="4" fill="#326CE5"/>
      <rect x="12" y="32" width="8" height="8" rx="2" fill="white" opacity="0.8"/>
      <rect x="21" y="32" width="8" height="8" rx="2" fill="white" opacity="0.8"/>
      <rect x="30" y="32" width="8" height="8" rx="2" fill="white" opacity="0.8"/>
      <text x="25" y="44" text-anchor="middle" fill="white" font-size="6" font-family="Segoe UI, sans-serif">K8s</text>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "azure-app-service",
    name: "App Service",
    category: "Web",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="azureAppGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0078D4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#005A9E;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#azureAppGradient)" stroke="#323130" stroke-width="1"/>
      <rect x="8" y="12" width="34" height="26" rx="2" fill="white" opacity="0.9"/>
      <rect x="8" y="12" width="34" height="6" rx="2" fill="#0078D4" opacity="0.8"/>
      <circle cx="12" cy="15" r="1.5" fill="white"/>
      <circle cx="16" cy="15" r="1.5" fill="white"/>
      <circle cx="20" cy="15" r="1.5" fill="white"/>
      <rect x="12" y="22" width="26" height="2" fill="#0078D4" opacity="0.6"/>
      <rect x="12" y="26" width="20" height="2" fill="#0078D4" opacity="0.4"/>
      <rect x="12" y="30" width="24" height="2" fill="#0078D4" opacity="0.4"/>
    </svg>`,
    width: 50,
    height: 50,
  }
];

// Helper function to group icons by category
export const AZURE_ICONS_BY_CATEGORY = AZURE_ICONS.reduce((acc, icon) => {
  if (!acc[icon.category]) {
    acc[icon.category] = [];
  }
  acc[icon.category].push(icon);
  return acc;
}, {} as Record<string, AzureIcon[]>);

// Get all available categories
export const AZURE_CATEGORIES = Object.keys(AZURE_ICONS_BY_CATEGORY);