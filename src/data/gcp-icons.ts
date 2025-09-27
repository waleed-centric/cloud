// Google Cloud Platform (GCP) Icons data module
// - GCP service icons with SVG data URIs for drag-and-drop builder
// - Following Google Cloud branding colors and design patterns

export type GcpIcon = {
  id: string;
  name: string;
  category: string;
  svg: string;
  width: number;
  height: number;
};

// GCP service icons with Google Cloud color scheme
export const GCP_ICONS: GcpIcon[] = [
  {
    id: "compute-engine",
    name: "Compute Engine",
    category: "Compute",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gcpComputeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4285F4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1A73E8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#gcpComputeGradient)" stroke="#202124" stroke-width="1"/>
      <rect x="8" y="12" width="34" height="26" rx="2" fill="white" opacity="0.9"/>
      <rect x="12" y="16" width="26" height="2" fill="#4285F4"/>
      <rect x="12" y="20" width="20" height="2" fill="#4285F4" opacity="0.7"/>
      <rect x="12" y="24" width="24" height="2" fill="#4285F4" opacity="0.7"/>
      <rect x="12" y="28" width="18" height="2" fill="#4285F4" opacity="0.5"/>
      <circle cx="36" cy="32" r="3" fill="#4285F4"/>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "cloud-functions",
    name: "Cloud Functions",
    category: "Compute",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gcpFunctionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FBBC04;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#F9AB00;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#gcpFunctionGradient)" stroke="#202124" stroke-width="1"/>
      <path d="M15 12 L20 12 L28 30 L35 30 L35 35 L28 35 L20 17 L15 17 Z" fill="white"/>
      <path d="M15 30 L25 30 L25 35 L15 35 Z" fill="white"/>
      <text x="25" y="42" text-anchor="middle" fill="white" font-size="8" font-family="Google Sans, sans-serif">ƒ</text>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "cloud-storage",
    name: "Cloud Storage",
    category: "Storage",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gcpStorageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#34A853;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#137333;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#gcpStorageGradient)" stroke="#202124" stroke-width="1"/>
      <rect x="8" y="12" width="34" height="6" rx="3" fill="white" opacity="0.9"/>
      <rect x="8" y="22" width="34" height="6" rx="3" fill="white" opacity="0.7"/>
      <rect x="8" y="32" width="34" height="6" rx="3" fill="white" opacity="0.5"/>
      <circle cx="38" cy="15" r="2" fill="#34A853"/>
      <circle cx="38" cy="25" r="2" fill="#34A853"/>
      <circle cx="38" cy="35" r="2" fill="#34A853"/>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "persistent-disk",
    name: "Persistent Disk",
    category: "Storage",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gcpDiskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#34A853;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#137333;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#gcpDiskGradient)" stroke="#202124" stroke-width="1"/>
      <circle cx="25" cy="25" r="15" fill="white" opacity="0.9"/>
      <circle cx="25" cy="25" r="8" fill="#34A853" opacity="0.8"/>
      <circle cx="25" cy="25" r="3" fill="white"/>
      <rect x="22" y="12" width="6" height="4" fill="white" opacity="0.7"/>
      <rect x="12" y="22" width="4" height="6" fill="white" opacity="0.7"/>
      <rect x="34" y="22" width="4" height="6" fill="white" opacity="0.7"/>
      <rect x="22" y="34" width="6" height="4" fill="white" opacity="0.7"/>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "cloud-sql",
    name: "Cloud SQL",
    category: "Databases",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gcpSqlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#EA4335;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#D33B2C;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#gcpSqlGradient)" stroke="#202124" stroke-width="1"/>
      <ellipse cx="25" cy="18" rx="18" ry="4" fill="white" opacity="0.9"/>
      <rect x="7" y="18" width="36" height="14" fill="white" opacity="0.7"/>
      <ellipse cx="25" cy="32" rx="18" ry="4" fill="white" opacity="0.9"/>
      <rect x="20" y="22" width="2" height="8" fill="#EA4335"/>
      <rect x="28" y="22" width="2" height="8" fill="#EA4335"/>
      <text x="25" y="42" text-anchor="middle" fill="white" font-size="8" font-family="Google Sans, sans-serif">SQL</text>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "bigquery",
    name: "BigQuery",
    category: "Analytics & Big Data",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gcpBigQueryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4285F4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1A73E8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#gcpBigQueryGradient)" stroke="#202124" stroke-width="1"/>
      <rect x="8" y="12" width="34" height="26" rx="2" fill="white" opacity="0.9"/>
      <rect x="12" y="16" width="6" height="18" fill="#4285F4" opacity="0.8"/>
      <rect x="20" y="20" width="6" height="14" fill="#4285F4" opacity="0.6"/>
      <rect x="28" y="18" width="6" height="16" fill="#4285F4" opacity="0.7"/>
      <rect x="36" y="22" width="4" height="12" fill="#4285F4" opacity="0.5"/>
      <text x="25" y="42" text-anchor="middle" fill="white" font-size="6" font-family="Google Sans, sans-serif">BQ</text>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "vertex-ai",
    name: "Vertex AI",
    category: "AI & Machine Learning",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gcpVertexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9AA0A6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#5F6368;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#gcpVertexGradient)" stroke="#202124" stroke-width="1"/>
      <circle cx="25" cy="25" r="12" fill="none" stroke="white" stroke-width="2" opacity="0.9"/>
      <circle cx="25" cy="25" r="6" fill="white" opacity="0.8"/>
      <circle cx="25" cy="25" r="2" fill="#9AA0A6"/>
      <path d="M15 15 L20 20" stroke="white" stroke-width="2" opacity="0.7"/>
      <path d="M35 15 L30 20" stroke="white" stroke-width="2" opacity="0.7"/>
      <path d="M15 35 L20 30" stroke="white" stroke-width="2" opacity="0.7"/>
      <path d="M35 35 L30 30" stroke="white" stroke-width="2" opacity="0.7"/>
      <text x="25" y="42" text-anchor="middle" fill="white" font-size="8" font-family="Google Sans, sans-serif">AI</text>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "vpc",
    name: "Virtual Private Cloud",
    category: "Networking",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gcpVpcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4285F4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1A73E8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#gcpVpcGradient)" stroke="#202124" stroke-width="1"/>
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
    id: "gke",
    name: "Google Kubernetes Engine",
    category: "Containers",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gcpGkeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#326CE5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1E4A72;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#gcpGkeGradient)" stroke="#202124" stroke-width="1"/>
      <path d="M25 8 L35 18 L30 28 L20 28 L15 18 Z" fill="white" opacity="0.9"/>
      <circle cx="25" cy="20" r="4" fill="#326CE5"/>
      <rect x="12" y="32" width="8" height="8" rx="2" fill="white" opacity="0.8"/>
      <rect x="21" y="32" width="8" height="8" rx="2" fill="white" opacity="0.8"/>
      <rect x="30" y="32" width="8" height="8" rx="2" fill="white" opacity="0.8"/>
      <text x="25" y="44" text-anchor="middle" fill="white" font-size="6" font-family="Google Sans, sans-serif">GKE</text>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "cloud-run",
    name: "Cloud Run",
    category: "Containers",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gcpRunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4285F4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1A73E8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#gcpRunGradient)" stroke="#202124" stroke-width="1"/>
      <rect x="8" y="12" width="34" height="26" rx="2" fill="white" opacity="0.9"/>
      <path d="M15 20 L20 25 L15 30" stroke="#4285F4" stroke-width="3" fill="none"/>
      <rect x="22" y="22" width="16" height="6" rx="3" fill="#4285F4" opacity="0.8"/>
      <circle cx="35" cy="25" r="2" fill="#4285F4"/>
      <text x="25" y="42" text-anchor="middle" fill="white" font-size="6" font-family="Google Sans, sans-serif">RUN</text>
    </svg>`,
    width: 50,
    height: 50,
  }
];

// Helper function to group icons by category
export const GCP_ICONS_BY_CATEGORY = GCP_ICONS.reduce((acc, icon) => {
  if (!acc[icon.category]) {
    acc[icon.category] = [];
  }
  acc[icon.category].push(icon);
  return acc;
}, {} as Record<string, GcpIcon[]>);

// Get all available categories
export const GCP_CATEGORIES = Object.keys(GCP_ICONS_BY_CATEGORY);