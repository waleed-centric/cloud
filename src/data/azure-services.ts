// Azure Services Data Structure
// Based on Microsoft Azure service categories and offerings

export interface AzureService {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  subServices?: AzureSubService[];
}

export interface AzureSubService {
  id: string;
  name: string;
  description: string;
  properties?: AzureServiceProperty[];
}

export interface AzureServiceProperty {
  name: string;
  type: 'text' | 'select' | 'number' | 'boolean';
  required: boolean;
  options?: string[];
  defaultValue?: any;
  description?: string;
}

// Azure Service Categories based on Microsoft Azure structure
export const azureServiceCategories = [
  'Compute',
  'Storage', 
  'Networking',
  'Databases',
  'AI + Machine Learning',
  'Analytics',
  'Security',
  'Identity',
  'Web',
  'Mobile',
  'Containers',
  'DevOps',
  'Management',
  'Integration'
] as const;

// Main Azure Services
export const azureServices: AzureService[] = [
  // Compute Services
  {
    id: 'azure-vm',
    name: 'Virtual Machines',
    category: 'Compute',
    description: 'Scalable on-demand computing resources',
    icon: '🖥️',
    subServices: [
      {
        id: 'windows-vm',
        name: 'Windows VM',
        description: 'Windows-based virtual machine',
        properties: [
          { name: 'vmSize', type: 'select', required: true, options: ['Standard_B1s', 'Standard_B2s', 'Standard_D2s_v3'], description: 'VM Size' },
          { name: 'region', type: 'select', required: true, options: ['East US', 'West US', 'Central US'], description: 'Azure Region' }
        ]
      },
      {
        id: 'linux-vm',
        name: 'Linux VM', 
        description: 'Linux-based virtual machine',
        properties: [
          { name: 'vmSize', type: 'select', required: true, options: ['Standard_B1s', 'Standard_B2s', 'Standard_D2s_v3'], description: 'VM Size' },
          { name: 'distribution', type: 'select', required: true, options: ['Ubuntu', 'CentOS', 'RHEL'], description: 'Linux Distribution' }
        ]
      }
    ]
  },
  {
    id: 'azure-functions',
    name: 'Azure Functions',
    category: 'Compute',
    description: 'Serverless compute service',
    icon: '⚡',
    subServices: [
      {
        id: 'function-app',
        name: 'Function App',
        description: 'Serverless function application',
        properties: [
          { name: 'runtime', type: 'select', required: true, options: ['Node.js', 'Python', '.NET', 'Java'], description: 'Runtime Stack' },
          { name: 'plan', type: 'select', required: true, options: ['Consumption', 'Premium', 'Dedicated'], description: 'Hosting Plan' }
        ]
      }
    ]
  },

  // Storage Services
  {
    id: 'azure-storage',
    name: 'Storage Account',
    category: 'Storage',
    description: 'Scalable cloud storage solution',
    icon: '💾',
    subServices: [
      {
        id: 'blob-storage',
        name: 'Blob Storage',
        description: 'Object storage for unstructured data',
        properties: [
          { name: 'tier', type: 'select', required: true, options: ['Hot', 'Cool', 'Archive'], description: 'Access Tier' },
          { name: 'replication', type: 'select', required: true, options: ['LRS', 'GRS', 'ZRS'], description: 'Replication Type' }
        ]
      },
      {
        id: 'file-storage',
        name: 'File Storage',
        description: 'Managed file shares in the cloud',
        properties: [
          { name: 'protocol', type: 'select', required: true, options: ['SMB', 'NFS'], description: 'File Protocol' }
        ]
      }
    ]
  },

  // Database Services
  {
    id: 'azure-sql',
    name: 'Azure SQL Database',
    category: 'Databases',
    description: 'Managed relational database service',
    icon: '🗄️',
    subServices: [
      {
        id: 'sql-database',
        name: 'SQL Database',
        description: 'Single database instance',
        properties: [
          { name: 'tier', type: 'select', required: true, options: ['Basic', 'Standard', 'Premium'], description: 'Service Tier' },
          { name: 'computeSize', type: 'select', required: true, options: ['S0', 'S1', 'S2', 'P1'], description: 'Compute Size' }
        ]
      }
    ]
  },

  // AI + Machine Learning
  {
    id: 'azure-ml',
    name: 'Azure Machine Learning',
    category: 'AI + Machine Learning',
    description: 'End-to-end machine learning lifecycle management',
    icon: '🤖',
    subServices: [
      {
        id: 'ml-workspace',
        name: 'ML Workspace',
        description: 'Machine learning workspace',
        properties: [
          { name: 'sku', type: 'select', required: true, options: ['Basic', 'Enterprise'], description: 'Workspace SKU' }
        ]
      }
    ]
  },

  // Networking
  {
    id: 'azure-vnet',
    name: 'Virtual Network',
    category: 'Networking',
    description: 'Private network in Azure',
    icon: '🌐',
    subServices: [
      {
        id: 'vnet',
        name: 'VNet',
        description: 'Virtual network instance',
        properties: [
          { name: 'addressSpace', type: 'text', required: true, description: 'Address Space (CIDR)' },
          { name: 'region', type: 'select', required: true, options: ['East US', 'West US', 'Central US'], description: 'Region' }
        ]
      }
    ]
  },

  // Containers
  {
    id: 'azure-aks',
    name: 'Azure Kubernetes Service',
    category: 'Containers',
    description: 'Managed Kubernetes service',
    icon: '🚢',
    subServices: [
      {
        id: 'aks-cluster',
        name: 'AKS Cluster',
        description: 'Kubernetes cluster',
        properties: [
          { name: 'nodeCount', type: 'number', required: true, defaultValue: 3, description: 'Node Count' },
          { name: 'nodeSize', type: 'select', required: true, options: ['Standard_DS2_v2', 'Standard_DS3_v2'], description: 'Node Size' }
        ]
      }
    ]
  }
];

// Helper function to get services by category
export const getAzureServicesByCategory = (category: string): AzureService[] => {
  return azureServices.filter(service => service.category === category);
};

// Helper function to get all categories
export const getAzureCategories = (): string[] => {
  return [...azureServiceCategories];
};