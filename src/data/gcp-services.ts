// Google Cloud Platform (GCP) Services Data Structure
// Based on Google Cloud service categories and offerings

export interface GcpService {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  subServices?: GcpSubService[];
}

export interface GcpSubService {
  id: string;
  name: string;
  description: string;
  properties?: GcpServiceProperty[];
}

export interface GcpServiceProperty {
  name: string;
  type: 'text' | 'select' | 'number' | 'boolean';
  required: boolean;
  options?: string[];
  defaultValue?: any;
  description?: string;
}

// GCP Service Categories based on Google Cloud structure
export const gcpServiceCategories = [
  'Compute',
  'Storage',
  'Networking',
  'Databases',
  'AI & Machine Learning',
  'Analytics & Big Data',
  'Security & Identity',
  'Web & Mobile',
  'Containers',
  'DevOps & Tools',
  'Management',
  'API Management'
] as const;

// Main GCP Services
export const gcpServices: GcpService[] = [
  // Compute Services
  {
    id: 'compute-engine',
    name: 'Compute Engine',
    category: 'Compute',
    description: 'Virtual machines running in Google\'s data center',
    icon: '🖥️',
    subServices: [
      {
        id: 'vm-instance',
        name: 'VM Instance',
        description: 'Virtual machine instance',
        properties: [
          { name: 'machineType', type: 'select', required: true, options: ['e2-micro', 'e2-small', 'e2-medium', 'n1-standard-1'], description: 'Machine Type' },
          { name: 'zone', type: 'select', required: true, options: ['us-central1-a', 'us-west1-a', 'europe-west1-a'], description: 'Zone' },
          { name: 'bootDisk', type: 'select', required: true, options: ['Ubuntu', 'CentOS', 'Windows Server'], description: 'Boot Disk Image' }
        ]
      }
    ]
  },
  {
    id: 'cloud-functions',
    name: 'Cloud Functions',
    category: 'Compute',
    description: 'Serverless execution environment',
    icon: '⚡',
    subServices: [
      {
        id: 'function',
        name: 'Cloud Function',
        description: 'Serverless function',
        properties: [
          { name: 'runtime', type: 'select', required: true, options: ['Node.js', 'Python', 'Go', 'Java'], description: 'Runtime' },
          { name: 'trigger', type: 'select', required: true, options: ['HTTP', 'Cloud Storage', 'Pub/Sub'], description: 'Trigger Type' }
        ]
      }
    ]
  },

  // Storage Services
  {
    id: 'cloud-storage',
    name: 'Cloud Storage',
    category: 'Storage',
    description: 'Object storage that\'s secure, durable, and scalable',
    icon: '💾',
    subServices: [
      {
        id: 'storage-bucket',
        name: 'Storage Bucket',
        description: 'Cloud storage bucket',
        properties: [
          { name: 'storageClass', type: 'select', required: true, options: ['Standard', 'Nearline', 'Coldline', 'Archive'], description: 'Storage Class' },
          { name: 'location', type: 'select', required: true, options: ['us-central1', 'europe-west1', 'asia-east1'], description: 'Location' }
        ]
      }
    ]
  },
  {
    id: 'persistent-disk',
    name: 'Persistent Disk',
    category: 'Storage',
    description: 'Block storage for virtual machine instances',
    icon: '💿',
    subServices: [
      {
        id: 'disk',
        name: 'Persistent Disk',
        description: 'Block storage disk',
        properties: [
          { name: 'diskType', type: 'select', required: true, options: ['pd-standard', 'pd-ssd', 'pd-extreme'], description: 'Disk Type' },
          { name: 'size', type: 'number', required: true, defaultValue: 100, description: 'Size (GB)' }
        ]
      }
    ]
  },

  // Database Services
  {
    id: 'cloud-sql',
    name: 'Cloud SQL',
    category: 'Databases',
    description: 'Fully managed relational database service',
    icon: '🗄️',
    subServices: [
      {
        id: 'mysql-instance',
        name: 'MySQL Instance',
        description: 'Cloud SQL MySQL database',
        properties: [
          { name: 'tier', type: 'select', required: true, options: ['db-f1-micro', 'db-g1-small', 'db-n1-standard-1'], description: 'Machine Tier' },
          { name: 'version', type: 'select', required: true, options: ['MySQL 8.0', 'MySQL 5.7'], description: 'MySQL Version' }
        ]
      },
      {
        id: 'postgresql-instance',
        name: 'PostgreSQL Instance',
        description: 'Cloud SQL PostgreSQL database',
        properties: [
          { name: 'tier', type: 'select', required: true, options: ['db-f1-micro', 'db-g1-small', 'db-n1-standard-1'], description: 'Machine Tier' },
          { name: 'version', type: 'select', required: true, options: ['PostgreSQL 14', 'PostgreSQL 13'], description: 'PostgreSQL Version' }
        ]
      }
    ]
  },

  // Analytics & Big Data
  {
    id: 'bigquery',
    name: 'BigQuery',
    category: 'Analytics & Big Data',
    description: 'Fully managed, serverless data warehouse',
    icon: '📊',
    subServices: [
      {
        id: 'dataset',
        name: 'BigQuery Dataset',
        description: 'Data warehouse dataset',
        properties: [
          { name: 'location', type: 'select', required: true, options: ['US', 'EU', 'asia-northeast1'], description: 'Dataset Location' },
          { name: 'defaultTableExpiration', type: 'number', required: false, description: 'Default Table Expiration (days)' }
        ]
      }
    ]
  },

  // AI & Machine Learning
  {
    id: 'vertex-ai',
    name: 'Vertex AI',
    category: 'AI & Machine Learning',
    description: 'Unified ML platform for building and deploying AI models',
    icon: '🤖',
    subServices: [
      {
        id: 'training-job',
        name: 'Training Job',
        description: 'ML model training job',
        properties: [
          { name: 'framework', type: 'select', required: true, options: ['TensorFlow', 'PyTorch', 'Scikit-learn'], description: 'ML Framework' },
          { name: 'machineType', type: 'select', required: true, options: ['n1-standard-4', 'n1-highmem-2'], description: 'Machine Type' }
        ]
      }
    ]
  },

  // Networking
  {
    id: 'vpc',
    name: 'Virtual Private Cloud',
    category: 'Networking',
    description: 'Global virtual network for your cloud resources',
    icon: '🌐',
    subServices: [
      {
        id: 'vpc-network',
        name: 'VPC Network',
        description: 'Virtual private cloud network',
        properties: [
          { name: 'subnet', type: 'text', required: true, description: 'Subnet Range (CIDR)' },
          { name: 'region', type: 'select', required: true, options: ['us-central1', 'europe-west1', 'asia-east1'], description: 'Region' }
        ]
      }
    ]
  },

  // Containers
  {
    id: 'gke',
    name: 'Google Kubernetes Engine',
    category: 'Containers',
    description: 'Managed Kubernetes service',
    icon: '🚢',
    subServices: [
      {
        id: 'gke-cluster',
        name: 'GKE Cluster',
        description: 'Kubernetes cluster',
        properties: [
          { name: 'nodeCount', type: 'number', required: true, defaultValue: 3, description: 'Node Count' },
          { name: 'machineType', type: 'select', required: true, options: ['e2-medium', 'n1-standard-1', 'n1-standard-2'], description: 'Node Machine Type' },
          { name: 'zone', type: 'select', required: true, options: ['us-central1-a', 'europe-west1-a'], description: 'Zone' }
        ]
      }
    ]
  },
  {
    id: 'cloud-run',
    name: 'Cloud Run',
    category: 'Containers',
    description: 'Fully managed serverless platform for containerized applications',
    icon: '🏃',
    subServices: [
      {
        id: 'cloud-run-service',
        name: 'Cloud Run Service',
        description: 'Containerized application service',
        properties: [
          { name: 'cpu', type: 'select', required: true, options: ['1', '2', '4'], description: 'CPU Allocation' },
          { name: 'memory', type: 'select', required: true, options: ['512Mi', '1Gi', '2Gi'], description: 'Memory Allocation' }
        ]
      }
    ]
  }
];

// Helper function to get services by category
export const getGcpServicesByCategory = (category: string): GcpService[] => {
  return gcpServices.filter(service => service.category === category);
};

// Helper function to get all categories
export const getGcpCategories = (): string[] => {
  return [...gcpServiceCategories];
};