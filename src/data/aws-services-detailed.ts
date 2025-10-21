// AWS Services Detailed Data Structure
// - Complete AWS services with sub-services and properties
// - Used for detailed service configuration and sub-service selection

export interface ServiceProperty {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'textarea';
  defaultValue?: string | number | boolean;
  options?: string[]; // for select type
  required?: boolean;
  description?: string;
}

export interface SubService {
  id: string;
  name: string;
  description: string;
  icon: string;
  properties: ServiceProperty[];
}

export interface DetailedAwsService {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  subServices: SubService[];
  commonProperties: ServiceProperty[];
}

// EC2 Service with detailed sub-services
const EC2_SERVICE: DetailedAwsService = {
  id: "ec2",
  name: "Amazon EC2",
  category: "Compute",
  description: "Scalable virtual servers in the cloud",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#FF9900" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="12" font-family="Inter, sans-serif">EC2</text>
  </svg>`,
  commonProperties: [
    {
      id: "region",
      name: "Region",
      type: "select",
      options: ["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"],
      defaultValue: "us-east-1",
      required: true,
      description: "AWS region where instance will be launched"
    },
    {
      id: "name",
      name: "Instance Name",
      type: "text",
      defaultValue: "MyEC2Instance",
      required: true,
      description: "Name tag for the EC2 instance"
    }
  ],
  subServices: [
    {
      id: "ec2-instance",
      name: "EC2 Instance",
      description: "Virtual server instance",
      icon: "🖥️",
      properties: [
        {
          id: "instanceType",
          name: "Instance Type",
          type: "select",
          options: ["t2.micro", "t2.small", "t2.medium", "t3.micro", "t3.small", "m5.large"],
          defaultValue: "t2.micro",
          required: true,
          description: "EC2 instance size and specifications"
        },
        {
          id: "ami",
          name: "AMI ID",
          type: "text",
          defaultValue: "ami-0abcdef1234567890",
          required: true,
          description: "Amazon Machine Image ID"
        },
        {
          id: "keyPair",
          name: "Key Pair",
          type: "text",
          description: "SSH key pair for instance access"
        }
      ]
    },
    {
      id: "ebs-volume",
      name: "EBS Volume",
      description: "Block storage for EC2",
      icon: "💾",
      properties: [
        {
          id: "volumeType",
          name: "Volume Type",
          type: "select",
          options: ["gp3", "gp2", "io1", "io2", "st1", "sc1"],
          defaultValue: "gp3",
          required: true,
          description: "EBS volume type"
        },
        {
          id: "size",
          name: "Size (GB)",
          type: "number",
          defaultValue: 20,
          required: true,
          description: "Volume size in gigabytes"
        },
        {
          id: "encrypted",
          name: "Encrypted",
          type: "boolean",
          defaultValue: false,
          description: "Enable EBS encryption"
        }
      ]
    },
    {
      id: "security-group",
      name: "Security Group",
      description: "Virtual firewall rules",
      icon: "🛡️",
      properties: [
        {
          id: "groupName",
          name: "Group Name",
          type: "text",
          defaultValue: "default-sg",
          required: true,
          description: "Security group name"
        },
        {
          id: "inboundRules",
          name: "Inbound Rules",
          type: "textarea",
          // defaultValue: "SSH: 22, HTTP: 80, HTTPS: 443",
          defaultValue: "",
          description: "Inbound traffic rules"
        }
      ]
    },
    {
      id: "elastic-ip",
      name: "Elastic IP",
      description: "Static public IP address",
      icon: "🌐",
      properties: [
        {
          id: "domain",
          name: "Domain",
          type: "select",
          options: ["vpc", "standard"],
          defaultValue: "vpc",
          required: true,
          description: "IP address domain"
        }
      ]
    }
  ]
};

// Lambda Service
const LAMBDA_SERVICE: DetailedAwsService = {
  id: "lambda",
  name: "AWS Lambda",
  category: "Compute",
  description: "Serverless compute service",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#FF9900" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="8" font-family="Inter, sans-serif">λ</text>
  </svg>`,
  commonProperties: [
    {
      id: "functionName",
      name: "Function Name",
      type: "text",
      defaultValue: "MyLambdaFunction",
      required: true,
      description: "Lambda function name"
    },
    {
      id: "runtime",
      name: "Runtime",
      type: "select",
      options: ["nodejs18.x", "python3.9", "java11", "dotnet6", "go1.x"],
      defaultValue: "nodejs18.x",
      required: true,
      description: "Runtime environment"
    }
  ],
  subServices: [
    {
      id: "lambda-function",
      name: "Lambda Function",
      description: "Serverless function",
      icon: "⚡",
      properties: [
        {
          id: "memory",
          name: "Memory (MB)",
          type: "number",
          defaultValue: 128,
          required: true,
          description: "Memory allocation in MB"
        },
        {
          id: "timeout",
          name: "Timeout (seconds)",
          type: "number",
          defaultValue: 30,
          required: true,
          description: "Function timeout in seconds"
        },
        {
          id: "handler",
          name: "Handler",
          type: "text",
          defaultValue: "index.handler",
          required: true,
          description: "Function entry point"
        }
      ]
    },
    {
      id: "lambda-layer",
      name: "Lambda Layer",
      description: "Shared code and dependencies",
      icon: "📚",
      properties: [
        {
          id: "layerName",
          name: "Layer Name",
          type: "text",
          required: true,
          description: "Layer name"
        },
        {
          id: "compatibleRuntimes",
          name: "Compatible Runtimes",
          type: "textarea",
          defaultValue: "nodejs18.x, python3.9",
          description: "Compatible runtime environments"
        }
      ]
    },
    {
      id: "lambda-trigger",
      name: "Event Trigger",
      description: "Function trigger source",
      icon: "🎯",
      properties: [
        {
          id: "triggerType",
          name: "Trigger Type",
          type: "select",
          options: ["API Gateway", "S3", "DynamoDB", "CloudWatch", "SQS", "SNS"],
          required: true,
          description: "Event source type"
        },
        {
          id: "triggerConfig",
          name: "Trigger Configuration",
          type: "textarea",
          description: "Trigger-specific configuration"
        }
      ]
    }
  ]
};

// S3 Service
const S3_SERVICE: DetailedAwsService = {
  id: "s3",
  name: "Amazon S3",
  category: "Storage",
  description: "Object storage service",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#569A31" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="12" font-family="Inter, sans-serif">S3</text>
  </svg>`,
  commonProperties: [
    {
      id: "bucketName",
      name: "Bucket Name",
      type: "text",
      defaultValue: "my-s3-bucket",
      required: true,
      description: "S3 bucket name (globally unique)"
    }
  ],
  subServices: [
    {
      id: "s3-bucket",
      name: "S3 Bucket",
      description: "Storage container",
      icon: "🪣",
      properties: [
        {
          id: "storageClass",
          name: "Storage Class",
          type: "select",
          options: ["STANDARD", "STANDARD_IA", "GLACIER", "DEEP_ARCHIVE"],
          defaultValue: "STANDARD",
          required: true,
          description: "Storage class for cost optimization"
        },
        {
          id: "versioning",
          name: "Versioning",
          type: "boolean",
          defaultValue: false,
          description: "Enable object versioning"
        },
        {
          id: "objectLockEnabled",
          name: "Object Lock Enabled",
          type: "boolean",
          defaultValue: false,
          description: "Enable object lock (requires versioning)"
        },
        {
          id: "publicAccess",
          name: "Block Public Access",
          type: "boolean",
          defaultValue: true,
          description: "Block all public access"
        },
        {
          id: "forceDestroy",
          name: "Force Destroy",
          type: "boolean",
          defaultValue: false,
          description: "Delete bucket even if not empty"
        },
        {
          id: "acl",
          name: "ACL",
          type: "select",
          options: ["private", "public-read", "public-read-write", "authenticated-read", "log-delivery-write"],
          description: "Access control list (requires ownership controls)"
        },
        {
          id: "acceleration",
          name: "Transfer Acceleration",
          type: "boolean",
          defaultValue: false,
          description: "Enable S3 transfer acceleration"
        },
        {
          id: "sseAlgorithm",
          name: "SSE Algorithm",
          type: "select",
          options: ["", "AES256", "aws:kms"],
          defaultValue: "",
          description: "Default server-side encryption"
        },
        {
          id: "kmsKeyId",
          name: "KMS Key ID",
          type: "text",
          description: "KMS key ARN/ID when using aws:kms"
        },
        {
          id: "bucketKeyEnabled",
          name: "Bucket Key Enabled",
          type: "boolean",
          defaultValue: false,
          description: "Use S3 Bucket Keys for SSE-KMS"
        },
        {
          id: "loggingBucket",
          name: "Logging Target Bucket",
          type: "text",
          description: "Target bucket for server access logs"
        },
        {
          id: "loggingPrefix",
          name: "Logging Prefix",
          type: "text",
          defaultValue: "",
          description: "Prefix for log object keys"
        },
        {
          id: "corsAllowedOrigins",
          name: "CORS Allowed Origins",
          type: "textarea",
          defaultValue: "*",
          description: "Comma-separated list of origins"
        },
        {
          id: "corsAllowedMethods",
          name: "CORS Allowed Methods",
          type: "textarea",
          defaultValue: "GET,HEAD",
          description: "Comma-separated HTTP methods"
        },
        {
          id: "corsAllowedHeaders",
          name: "CORS Allowed Headers",
          type: "textarea",
          defaultValue: "*",
          description: "Comma-separated allowed headers"
        },
        {
          id: "corsExposeHeaders",
          name: "CORS Expose Headers",
          type: "textarea",
          defaultValue: "",
          description: "Comma-separated response headers to expose"
        },
        {
          id: "corsMaxAgeSeconds",
          name: "CORS Max Age (s)",
          type: "number",
          defaultValue: 0,
          description: "How long browsers can cache CORS responses"
        },
        {
          id: "websiteIndexDocument",
          name: "Website Index Document",
          type: "text",
          defaultValue: "",
          description: "Index document for static hosting"
        },
        {
          id: "websiteErrorDocument",
          name: "Website Error Document",
          type: "text",
          defaultValue: "",
          description: "Error document for static hosting"
        }
      ]
    },
    {
      id: "s3-lifecycle",
      name: "Lifecycle Policy",
      description: "Automated object management",
      icon: "🔄",
      properties: [
        {
          id: "transitionDays",
          name: "Transition Days",
          type: "number",
          defaultValue: 30,
          description: "Days before transitioning to IA"
        },
        {
          id: "expirationDays",
          name: "Expiration Days",
          type: "number",
          defaultValue: 365,
          description: "Days before object deletion"
        }
      ]
    }
  ]
};

// RDS Service
const RDS_SERVICE: DetailedAwsService = {
  id: "rds",
  name: "Amazon RDS",
  category: "Database",
  description: "Managed relational database service",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#3F48CC" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="12" font-family="Inter, sans-serif">RDS</text>
  </svg>`,
  commonProperties: [
    {
      id: "dbInstanceIdentifier",
      name: "DB Instance Identifier",
      type: "text",
      defaultValue: "my-database",
      required: true,
      description: "Database instance identifier"
    }
  ],
  subServices: [
    {
      id: "rds-instance",
      name: "RDS Instance",
      description: "Database instance",
      icon: "🗄️",
      properties: [
        {
          id: "engine",
          name: "Database Engine",
          type: "select",
          options: ["mysql", "postgres", "mariadb", "oracle-ee", "sqlserver-ex"],
          defaultValue: "mysql",
          required: true,
          description: "Database engine type"
        },
        {
          id: "instanceClass",
          name: "Instance Class",
          type: "select",
          options: ["db.t3.micro", "db.t3.small", "db.t3.medium", "db.m5.large"],
          defaultValue: "db.t3.micro",
          required: true,
          description: "Database instance size"
        },
        {
          id: "allocatedStorage",
          name: "Storage (GB)",
          type: "number",
          defaultValue: 20,
          required: true,
          description: "Allocated storage in GB"
        }
      ]
    },
    {
      id: "rds-subnet-group",
      name: "DB Subnet Group",
      description: "Database subnet configuration",
      icon: "🌐",
      properties: [
        {
          id: "subnetGroupName",
          name: "Subnet Group Name",
          type: "text",
          required: true,
          description: "DB subnet group name"
        }
      ]
    }
  ]
};

// VPC Service
const VPC_SERVICE: DetailedAwsService = {
  id: "vpc",
  name: "Amazon VPC",
  category: "Networking",
  description: "Virtual Private Cloud - isolated network environment",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
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
  commonProperties: [
    {
      id: "vpcName",
      name: "VPC Name",
      type: "text",
      defaultValue: "MyVPC",
      required: true,
      description: "Name for the VPC"
    },
    {
      id: "cidrBlock",
      name: "CIDR Block",
      type: "text",
      defaultValue: "10.0.0.0/16",
      required: true,
      description: "IP address range for the VPC"
    }
  ],
  subServices: [
    {
      id: "vpc-subnet",
      name: "Subnet",
      description: "Network subnet within VPC",
      icon: "🌐",
      properties: [
        {
          id: "subnetName",
          name: "Subnet Name",
          type: "text",
          defaultValue: "MySubnet",
          required: true,
          description: "Name for the subnet"
        },
        {
          id: "subnetCidr",
          name: "Subnet CIDR",
          type: "text",
          defaultValue: "10.0.1.0/24",
          required: true,
          description: "IP address range for the subnet"
        },
        {
          id: "availabilityZone",
          name: "Availability Zone",
          type: "select",
          options: ["us-east-1a", "us-east-1b", "us-east-1c"],
          defaultValue: "us-east-1a",
          required: true,
          description: "Availability zone for the subnet"
        },
        {
          id: "subnetType",
          name: "Subnet Type",
          type: "select",
          options: ["Public", "Private"],
          defaultValue: "Public",
          required: true,
          description: "Public or private subnet"
        }
      ]
    },
    {
      id: "internet-gateway",
      name: "Internet Gateway",
      description: "Gateway for internet access",
      icon: "🌍",
      properties: [
        {
          id: "igwName",
          name: "Gateway Name",
          type: "text",
          defaultValue: "MyInternetGateway",
          required: true,
          description: "Name for the internet gateway"
        }
      ]
    },
    {
      id: "route-table",
      name: "Route Table",
      description: "Network routing configuration",
      icon: "🗺️",
      properties: [
        {
          id: "routeTableName",
          name: "Route Table Name",
          type: "text",
          defaultValue: "MyRouteTable",
          required: true,
          description: "Name for the route table"
        },
        {
          id: "routes",
          name: "Routes",
          type: "textarea",
          defaultValue: "0.0.0.0/0 -> Internet Gateway",
          description: "Routing rules"
        }
      ]
    }
  ]
};

// CloudFront Service
const CLOUDFRONT_SERVICE: DetailedAwsService = {
  id: "cloudfront",
  name: "Amazon CloudFront",
  category: "Networking",
  description: "Content Delivery Network (CDN) service",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
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
  </svg>`,
  commonProperties: [
    {
      id: "distributionName",
      name: "Distribution Name",
      type: "text",
      defaultValue: "MyCloudFrontDistribution",
      required: true,
      description: "Name for the CloudFront distribution"
    }
  ],
  subServices: [
    {
      id: "cf-distribution",
      name: "Distribution",
      description: "CDN distribution configuration",
      icon: "🌐",
      properties: [
        {
          id: "originDomain",
          name: "Origin Domain",
          type: "text",
          defaultValue: "example.com",
          required: true,
          description: "Origin domain name"
        },
        {
          id: "priceClass",
          name: "Price Class",
          type: "select",
          options: ["PriceClass_All", "PriceClass_100", "PriceClass_200"],
          defaultValue: "PriceClass_All",
          required: true,
          description: "Geographic distribution price class"
        },
        {
          id: "cacheBehavior",
          name: "Cache Behavior",
          type: "select",
          options: ["CachingOptimized", "CachingDisabled", "CachingOptimizedForUncompressedObjects"],
          defaultValue: "CachingOptimized",
          required: true,
          description: "Caching behavior policy"
        }
      ]
    },
    {
      id: "cf-origin",
      name: "Origin",
      description: "Content origin configuration",
      icon: "📡",
      properties: [
        {
          id: "originType",
          name: "Origin Type",
          type: "select",
          options: ["S3", "Custom HTTP", "MediaStore"],
          defaultValue: "S3",
          required: true,
          description: "Type of origin server"
        },
        {
          id: "originPath",
          name: "Origin Path",
          type: "text",
          defaultValue: "/",
          description: "Path to content on origin"
        }
      ]
    },
    {
      id: "cf-cache-policy",
      name: "Cache Policy",
      description: "Caching policy configuration",
      icon: "⚡",
      properties: [
        {
          id: "ttl",
          name: "Default TTL (seconds)",
          type: "number",
          defaultValue: 86400,
          required: true,
          description: "Default time to live for cached objects"
        },
        {
          id: "maxTtl",
          name: "Maximum TTL (seconds)",
          type: "number",
          defaultValue: 31536000,
          description: "Maximum time to live for cached objects"
        }
      ]
    }
  ]
};

// Export all detailed services
export const DETAILED_AWS_SERVICES: DetailedAwsService[] = [
  EC2_SERVICE,
  LAMBDA_SERVICE,
  S3_SERVICE,
  RDS_SERVICE,
  VPC_SERVICE,
  CLOUDFRONT_SERVICE
];

// Helper functions
export const getServiceById = (id: string): DetailedAwsService | undefined => {
  return DETAILED_AWS_SERVICES.find(service => service.id === id);
};

export const getSubServiceById = (serviceId: string, subServiceId: string): SubService | undefined => {
  const service = getServiceById(serviceId);
  return service?.subServices.find(sub => sub.id === subServiceId);
};

export const getServicesByCategory = (category: string): DetailedAwsService[] => {
  return DETAILED_AWS_SERVICES.filter(service => service.category === category);
};