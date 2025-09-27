// Summary: AWS Icons data module
// - Sample AWS service icons with SVG data URIs for drag-and-drop builder

export type AwsIcon = {
  id: string;
  name: string;
  category: string;
  svg: string;
  width: number;
  height: number;
};

// Sample AWS icons (official AWS architecture icons)
export const AWS_ICONS: AwsIcon[] = [
  {
    id: "ec2",
    name: "EC2",
    category: "Compute",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ec2Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF9900;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FF6600;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#ec2Gradient)" stroke="#232F3E" stroke-width="1"/>
      <rect x="8" y="12" width="34" height="4" rx="2" fill="white" opacity="0.9"/>
      <rect x="8" y="20" width="34" height="4" rx="2" fill="white" opacity="0.9"/>
      <rect x="8" y="28" width="34" height="4" rx="2" fill="white" opacity="0.9"/>
      <rect x="8" y="36" width="20" height="4" rx="2" fill="white" opacity="0.9"/>
      <circle cx="38" cy="38" r="3" fill="white" opacity="0.9"/>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "s3",
    name: "S3",
    category: "Storage",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="s3Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#569A31;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3F7A1F;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#s3Gradient)" stroke="#232F3E" stroke-width="1"/>
      <path d="M12 15 L38 15 L35 20 L15 20 Z" fill="white" opacity="0.9"/>
      <path d="M15 20 L35 20 L32 25 L18 25 Z" fill="white" opacity="0.7"/>
      <path d="M18 25 L32 25 L29 30 L21 30 Z" fill="white" opacity="0.5"/>
      <path d="M21 30 L29 30 L26 35 L24 35 Z" fill="white" opacity="0.3"/>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "rds",
    name: "RDS",
    category: "Database",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rdsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3F48CC;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2A35AA;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#rdsGradient)" stroke="#232F3E" stroke-width="1"/>
      <ellipse cx="25" cy="18" rx="18" ry="4" fill="white" opacity="0.9"/>
      <rect x="7" y="18" width="36" height="14" fill="white" opacity="0.7"/>
      <ellipse cx="25" cy="32" rx="18" ry="4" fill="white" opacity="0.9"/>
      <rect x="20" y="22" width="2" height="8" fill="#3F48CC"/>
      <rect x="28" y="22" width="2" height="8" fill="#3F48CC"/>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "lambda",
    name: "Lambda",
    category: "Compute",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lambdaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF9900;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FF6600;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#lambdaGradient)" stroke="#232F3E" stroke-width="1"/>
      <path d="M15 12 L20 12 L28 30 L35 30 L35 35 L28 35 L20 17 L15 17 Z" fill="white"/>
      <path d="M15 30 L25 30 L25 35 L15 35 Z" fill="white"/>
    </svg>`,
    width: 50,
    height: 50,
  },
  {
    id: "vpc",
    name: "VPC",
    category: "Networking",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vpcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8C4FFF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6B3ACC;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#vpcGradient)" stroke="#232F3E" stroke-width="1"/>
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
    id: "cloudfront",
    name: "CloudFront",
    category: "Networking",
    svg: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8C4FFF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6B3ACC;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="46" height="46" rx="6" fill="url(#cfGradient)" stroke="#232F3E" stroke-width="1"/>
      <circle cx="25" cy="25" r="15" fill="none" stroke="white" stroke-width="2" opacity="0.9"/>
      <circle cx="25" cy="25" r="8" fill="white" opacity="0.9"/>
      <circle cx="25" cy="25" r="3" fill="#8C4FFF"/>
      <circle cx="25" cy="12" r="2" fill="white"/>
      <circle cx="25" cy="38" r="2" fill="white"/>
      <circle cx="12" cy="25" r="2" fill="white"/>
      <circle cx="38" cy="25" r="2" fill="white"/>
      <circle cx="18" cy="18" r="1.5" fill="white" opacity="0.7"/>
      <circle cx="32" cy="18" r="1.5" fill="white" opacity="0.7"/>
      <circle cx="18" cy="32" r="1.5" fill="white" opacity="0.7"/>
      <circle cx="32" cy="32" r="1.5" fill="white" opacity="0.7"/>
    </svg>`,
    width: 50,
    height: 50,
  },
];

// Group icons by category for easier palette organization
export const AWS_ICONS_BY_CATEGORY = AWS_ICONS.reduce((acc, icon) => {
  if (!acc[icon.category]) {
    acc[icon.category] = [];
  }
  acc[icon.category].push(icon);
  return acc;
}, {} as Record<string, AwsIcon[]>);

export const AWS_CATEGORIES = Object.keys(AWS_ICONS_BY_CATEGORY);