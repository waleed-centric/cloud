// GCP Services Detailed Data Structure
// - Complete GCP services with sub-services and properties
// - Used for detailed service configuration and sub-service selection

export interface GcpServiceProperty {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'textarea';
  defaultValue?: string | number | boolean;
  options?: string[]; // for select type
  required?: boolean;
  description?: string;
}

export interface GcpSubService {
  id: string;
  name: string;
  description: string;
  icon: string;
  properties: GcpServiceProperty[];
}

export interface DetailedGcpService {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  subServices: GcpSubService[];
  commonProperties: GcpServiceProperty[];
}

// Compute Engine Service with detailed sub-services
const COMPUTE_ENGINE_SERVICE: DetailedGcpService = {
  id: "compute-engine",
  name: "Compute Engine",
  category: "Compute",
  description: "Scalable virtual machines running in Google's data centers",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#4285F4" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="10" font-family="Inter, sans-serif">CE</text>
  </svg>`,
  commonProperties: [
    {
      id: "project",
      name: "Project ID",
      type: "text",
      defaultValue: "my-gcp-project",
      required: true,
      description: "Google Cloud project ID"
    },
    {
      id: "zone",
      name: "Zone",
      type: "select",
      options: ["us-central1-a", "us-west1-a", "europe-west1-a", "asia-east1-a"],
      defaultValue: "us-central1-a",
      required: true,
      description: "Google Cloud zone where instance will be created"
    }
  ],
  subServices: [
    {
      id: "vm-instance",
      name: "VM Instance",
      description: "Virtual machine instance",
      icon: "🖥️",
      properties: [
        {
          id: "machineType",
          name: "Machine Type",
          type: "select",
          options: ["e2-micro", "e2-small", "e2-medium", "n1-standard-1", "n1-standard-2"],
          defaultValue: "e2-micro",
          required: true,
          description: "Virtual machine type and specifications"
        },
        {
          id: "bootDisk",
          name: "Boot Disk Image",
          type: "select",
          options: ["Ubuntu 20.04 LTS", "Ubuntu 22.04 LTS", "CentOS 7", "Windows Server 2019"],
          defaultValue: "Ubuntu 22.04 LTS",
          required: true,
          description: "Operating system image for the VM"
        },
        {
          id: "diskSize",
          name: "Boot Disk Size (GB)",
          type: "number",
          defaultValue: 10,
          required: true,
          description: "Boot disk size in GB"
        }
      ]
    },
    {
      id: "instance-template",
      name: "Instance Template",
      description: "Template for creating VM instances",
      icon: "📋",
      properties: [
        {
          id: "templateName",
          name: "Template Name",
          type: "text",
          defaultValue: "my-instance-template",
          required: true,
          description: "Instance template name"
        },
        {
          id: "preemptible",
          name: "Preemptible",
          type: "boolean",
          defaultValue: false,
          description: "Use preemptible instances for cost savings"
        }
      ]
    }
  ]
};

// Cloud Functions Service
const CLOUD_FUNCTIONS_SERVICE: DetailedGcpService = {
  id: "cloud-functions",
  name: "Cloud Functions",
  category: "Compute",
  description: "Serverless execution environment for building and connecting cloud services",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#4285F4" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="12" font-family="Inter, sans-serif">ƒ</text>
  </svg>`,
  commonProperties: [
    {
      id: "functionName",
      name: "Function Name",
      type: "text",
      defaultValue: "my-cloud-function",
      required: true,
      description: "Cloud Function name"
    },
    {
      id: "runtime",
      name: "Runtime",
      type: "select",
      options: ["nodejs18", "python39", "go119", "java11", "dotnet6"],
      defaultValue: "nodejs18",
      required: true,
      description: "Runtime environment"
    }
  ],
  subServices: [
    {
      id: "http-function",
      name: "HTTP Function",
      description: "HTTP-triggered cloud function",
      icon: "🌐",
      properties: [
        {
          id: "memory",
          name: "Memory (MB)",
          type: "select",
          options: ["128", "256", "512", "1024", "2048"],
          defaultValue: "256",
          required: true,
          description: "Memory allocation for the function"
        },
        {
          id: "timeout",
          name: "Timeout (seconds)",
          type: "number",
          defaultValue: 60,
          description: "Function execution timeout"
        }
      ]
    },
    {
      id: "event-function",
      name: "Event Function",
      description: "Event-triggered cloud function",
      icon: "⚡",
      properties: [
        {
          id: "eventType",
          name: "Event Type",
          type: "select",
          options: ["Cloud Storage", "Pub/Sub", "Firestore", "Firebase Auth"],
          defaultValue: "Cloud Storage",
          required: true,
          description: "Event source type"
        },
        {
          id: "resource",
          name: "Resource",
          type: "text",
          description: "Resource that triggers the function"
        }
      ]
    }
  ]
};

// Cloud Storage Service
const CLOUD_STORAGE_SERVICE: DetailedGcpService = {
  id: "cloud-storage",
  name: "Cloud Storage",
  category: "Storage",
  description: "Object storage that's secure, durable, and scalable",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#4285F4" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="10" font-family="Inter, sans-serif">GCS</text>
  </svg>`,
  commonProperties: [
    {
      id: "bucketName",
      name: "Bucket Name",
      type: "text",
      defaultValue: "my-gcs-bucket",
      required: true,
      description: "Cloud Storage bucket name (globally unique)"
    },
    {
      id: "location",
      name: "Location",
      type: "select",
      options: ["us-central1", "us-west1", "europe-west1", "asia-east1", "multi-region"],
      defaultValue: "us-central1",
      required: true,
      description: "Bucket location"
    }
  ],
  subServices: [
    {
      id: "storage-bucket",
      name: "Storage Bucket",
      description: "Cloud storage bucket",
      icon: "🪣",
      properties: [
        {
          id: "storageClass",
          name: "Storage Class",
          type: "select",
          options: ["Standard", "Nearline", "Coldline", "Archive"],
          defaultValue: "Standard",
          required: true,
          description: "Storage class for cost optimization"
        },
        {
          id: "versioning",
          name: "Object Versioning",
          type: "boolean",
          defaultValue: false,
          description: "Enable object versioning"
        }
      ]
    },
    {
      id: "lifecycle-policy",
      name: "Lifecycle Policy",
      description: "Automatic object lifecycle management",
      icon: "🔄",
      properties: [
        {
          id: "policyName",
          name: "Policy Name",
          type: "text",
          defaultValue: "my-lifecycle-policy",
          description: "Lifecycle policy name"
        },
        {
          id: "rules",
          name: "Lifecycle Rules",
          type: "textarea",
          defaultValue: "Delete objects older than 365 days",
          description: "Lifecycle management rules"
        }
      ]
    }
  ]
};

// Cloud SQL Service
const CLOUD_SQL_SERVICE: DetailedGcpService = {
  id: "cloud-sql",
  name: "Cloud SQL",
  category: "Databases",
  description: "Fully managed relational database service",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#4285F4" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="10" font-family="Inter, sans-serif">SQL</text>
  </svg>`,
  commonProperties: [
    {
      id: "instanceId",
      name: "Instance ID",
      type: "text",
      defaultValue: "my-sql-instance",
      required: true,
      description: "Cloud SQL instance identifier"
    },
    {
      id: "region",
      name: "Region",
      type: "select",
      options: ["us-central1", "us-west1", "europe-west1", "asia-east1"],
      defaultValue: "us-central1",
      required: true,
      description: "Cloud SQL instance region"
    }
  ],
  subServices: [
    {
      id: "mysql-instance",
      name: "MySQL Instance",
      description: "MySQL database instance",
      icon: "🐬",
      properties: [
        {
          id: "version",
          name: "MySQL Version",
          type: "select",
          options: ["MYSQL_8_0", "MYSQL_5_7"],
          defaultValue: "MYSQL_8_0",
          required: true,
          description: "MySQL version"
        },
        {
          id: "tier",
          name: "Machine Type",
          type: "select",
          options: ["db-f1-micro", "db-g1-small", "db-n1-standard-1", "db-n1-standard-2"],
          defaultValue: "db-f1-micro",
          required: true,
          description: "Database instance machine type"
        }
      ]
    },
    {
      id: "postgresql-instance",
      name: "PostgreSQL Instance",
      description: "PostgreSQL database instance",
      icon: "🐘",
      properties: [
        {
          id: "version",
          name: "PostgreSQL Version",
          type: "select",
          options: ["POSTGRES_14", "POSTGRES_13", "POSTGRES_12"],
          defaultValue: "POSTGRES_14",
          required: true,
          description: "PostgreSQL version"
        },
        {
          id: "storageSize",
          name: "Storage Size (GB)",
          type: "number",
          defaultValue: 10,
          required: true,
          description: "Database storage size in GB"
        }
      ]
    }
  ]
};

// VPC Network Service
const VPC_SERVICE: DetailedGcpService = {
  id: "vpc",
  name: "VPC Network",
  category: "Networking",
  description: "Virtual Private Cloud networking",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#4285F4" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="10" font-family="Inter, sans-serif">VPC</text>
  </svg>`,
  commonProperties: [
    {
      id: "networkName",
      name: "Network Name",
      type: "text",
      defaultValue: "my-vpc-network",
      required: true,
      description: "VPC network name"
    },
    {
      id: "mode",
      name: "Subnet Creation Mode",
      type: "select",
      options: ["Regional", "Global"],
      defaultValue: "Regional",
      required: true,
      description: "Subnet creation mode"
    }
  ],
  subServices: [
    {
      id: "subnet",
      name: "Subnet",
      description: "VPC subnet",
      icon: "🌐",
      properties: [
        {
          id: "subnetName",
          name: "Subnet Name",
          type: "text",
          defaultValue: "my-subnet",
          required: true,
          description: "Subnet name"
        },
        {
          id: "ipRange",
          name: "IP Range",
          type: "text",
          defaultValue: "10.0.0.0/24",
          required: true,
          description: "IP address range for the subnet"
        },
        {
          id: "region",
          name: "Region",
          type: "select",
          options: ["us-central1", "us-west1", "europe-west1", "asia-east1"],
          defaultValue: "us-central1",
          required: true,
          description: "Subnet region"
        }
      ]
    },
    {
      id: "firewall-rule",
      name: "Firewall Rule",
      description: "VPC firewall rule",
      icon: "🛡️",
      properties: [
        {
          id: "ruleName",
          name: "Rule Name",
          type: "text",
          defaultValue: "my-firewall-rule",
          required: true,
          description: "Firewall rule name"
        },
        {
          id: "direction",
          name: "Direction",
          type: "select",
          options: ["Ingress", "Egress"],
          defaultValue: "Ingress",
          required: true,
          description: "Traffic direction"
        },
        {
          id: "ports",
          name: "Allowed Ports",
          type: "text",
          defaultValue: "80,443",
          description: "Comma-separated list of allowed ports"
        }
      ]
    }
  ]
};

// Google Kubernetes Engine Service
const GKE_SERVICE: DetailedGcpService = {
  id: "gke",
  name: "Google Kubernetes Engine",
  category: "Containers",
  description: "Managed Kubernetes service",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#4285F4" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="10" font-family="Inter, sans-serif">GKE</text>
  </svg>`,
  commonProperties: [
    {
      id: "clusterName",
      name: "Cluster Name",
      type: "text",
      defaultValue: "my-gke-cluster",
      required: true,
      description: "GKE cluster name"
    },
    {
      id: "location",
      name: "Location Type",
      type: "select",
      options: ["Zonal", "Regional"],
      defaultValue: "Zonal",
      required: true,
      description: "Cluster location type"
    }
  ],
  subServices: [
    {
      id: "node-pool",
      name: "Node Pool",
      description: "Group of nodes with the same configuration",
      icon: "🚢",
      properties: [
        {
          id: "nodeCount",
          name: "Node Count",
          type: "number",
          defaultValue: 3,
          required: true,
          description: "Number of nodes in the pool"
        },
        {
          id: "machineType",
          name: "Machine Type",
          type: "select",
          options: ["e2-medium", "n1-standard-1", "n1-standard-2", "n1-standard-4"],
          defaultValue: "e2-medium",
          required: true,
          description: "Node machine type"
        },
        {
          id: "diskSize",
          name: "Disk Size (GB)",
          type: "number",
          defaultValue: 100,
          description: "Node disk size in GB"
        }
      ]
    },
    {
      id: "workload",
      name: "Workload",
      description: "Kubernetes workload deployment",
      icon: "⚙️",
      properties: [
        {
          id: "workloadType",
          name: "Workload Type",
          type: "select",
          options: ["Deployment", "StatefulSet", "DaemonSet", "Job"],
          defaultValue: "Deployment",
          required: true,
          description: "Kubernetes workload type"
        },
        {
          id: "replicas",
          name: "Replicas",
          type: "number",
          defaultValue: 3,
          description: "Number of pod replicas"
        }
      ]
    }
  ]
};

// Export all detailed GCP services
export const DETAILED_GCP_SERVICES: DetailedGcpService[] = [
  COMPUTE_ENGINE_SERVICE,
  CLOUD_FUNCTIONS_SERVICE,
  CLOUD_STORAGE_SERVICE,
  CLOUD_SQL_SERVICE,
  VPC_SERVICE,
  GKE_SERVICE
];

// Helper functions
export const getGcpServiceById = (id: string): DetailedGcpService | undefined => {
  return DETAILED_GCP_SERVICES.find(service => service.id === id);
};

export const getGcpSubServiceById = (serviceId: string, subServiceId: string): GcpSubService | undefined => {
  const service = getGcpServiceById(serviceId);
  return service?.subServices.find(sub => sub.id === subServiceId);
};

export const getGcpServicesByCategory = (category: string): DetailedGcpService[] => {
  return DETAILED_GCP_SERVICES.filter(service => service.category === category);
};