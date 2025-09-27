// Azure Services Detailed Data Structure
// - Complete Azure services with sub-services and properties
// - Used for detailed service configuration and sub-service selection

export interface AzureServiceProperty {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'textarea';
  defaultValue?: string | number | boolean;
  options?: string[]; // for select type
  required?: boolean;
  description?: string;
}

export interface AzureSubService {
  id: string;
  name: string;
  description: string;
  icon: string;
  properties: AzureServiceProperty[];
}

export interface DetailedAzureService {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  subServices: AzureSubService[];
  commonProperties: AzureServiceProperty[];
}

// Virtual Machines Service with detailed sub-services
const VIRTUAL_MACHINES_SERVICE: DetailedAzureService = {
  id: "virtual-machines",
  name: "Virtual Machines",
  category: "Compute",
  description: "Scalable on-demand computing resources",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#0078D4" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="10" font-family="Inter, sans-serif">VM</text>
  </svg>`,
  commonProperties: [
    {
      id: "resourceGroup",
      name: "Resource Group",
      type: "text",
      defaultValue: "MyResourceGroup",
      required: true,
      description: "Azure resource group name"
    },
    {
      id: "region",
      name: "Region",
      type: "select",
      options: ["East US", "West US", "Central US", "North Europe", "West Europe"],
      defaultValue: "East US",
      required: true,
      description: "Azure region where VM will be deployed"
    }
  ],
  subServices: [
    {
      id: "windows-vm",
      name: "Windows VM",
      description: "Windows-based virtual machine",
      icon: "🖥️",
      properties: [
        {
          id: "vmSize",
          name: "VM Size",
          type: "select",
          options: ["Standard_B1s", "Standard_B2s", "Standard_D2s_v3", "Standard_D4s_v3"],
          defaultValue: "Standard_B1s",
          required: true,
          description: "Virtual machine size and specifications"
        },
        {
          id: "osVersion",
          name: "OS Version",
          type: "select",
          options: ["Windows Server 2019", "Windows Server 2022", "Windows 10", "Windows 11"],
          defaultValue: "Windows Server 2022",
          required: true,
          description: "Windows operating system version"
        },
        {
          id: "adminUsername",
          name: "Admin Username",
          type: "text",
          defaultValue: "azureuser",
          required: true,
          description: "Administrator username for the VM"
        }
      ]
    },
    {
      id: "linux-vm",
      name: "Linux VM",
      description: "Linux-based virtual machine",
      icon: "🐧",
      properties: [
        {
          id: "vmSize",
          name: "VM Size",
          type: "select",
          options: ["Standard_B1s", "Standard_B2s", "Standard_D2s_v3", "Standard_D4s_v3"],
          defaultValue: "Standard_B1s",
          required: true,
          description: "Virtual machine size and specifications"
        },
        {
          id: "distribution",
          name: "Linux Distribution",
          type: "select",
          options: ["Ubuntu 20.04", "Ubuntu 22.04", "CentOS 8", "RHEL 8"],
          defaultValue: "Ubuntu 22.04",
          required: true,
          description: "Linux distribution and version"
        },
        {
          id: "authenticationType",
          name: "Authentication",
          type: "select",
          options: ["SSH Key", "Password"],
          defaultValue: "SSH Key",
          required: true,
          description: "Authentication method for VM access"
        }
      ]
    }
  ]
};

// Azure Functions Service
const AZURE_FUNCTIONS_SERVICE: DetailedAzureService = {
  id: "azure-functions",
  name: "Azure Functions",
  category: "Compute",
  description: "Serverless compute service",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#0078D4" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="12" font-family="Inter, sans-serif">ƒ</text>
  </svg>`,
  commonProperties: [
    {
      id: "functionAppName",
      name: "Function App Name",
      type: "text",
      defaultValue: "MyFunctionApp",
      required: true,
      description: "Azure Function App name"
    },
    {
      id: "runtime",
      name: "Runtime Stack",
      type: "select",
      options: ["Node.js", "Python", ".NET", "Java", "PowerShell"],
      defaultValue: "Node.js",
      required: true,
      description: "Runtime environment"
    }
  ],
  subServices: [
    {
      id: "function-app",
      name: "Function App",
      description: "Serverless function application",
      icon: "⚡",
      properties: [
        {
          id: "hostingPlan",
          name: "Hosting Plan",
          type: "select",
          options: ["Consumption", "Premium", "Dedicated (App Service Plan)"],
          defaultValue: "Consumption",
          required: true,
          description: "Function hosting plan type"
        },
        {
          id: "storageAccount",
          name: "Storage Account",
          type: "text",
          defaultValue: "myfunctionappstorage",
          required: true,
          description: "Storage account for function app"
        }
      ]
    },
    {
      id: "function-trigger",
      name: "Function Trigger",
      description: "Function trigger configuration",
      icon: "🔔",
      properties: [
        {
          id: "triggerType",
          name: "Trigger Type",
          type: "select",
          options: ["HTTP", "Timer", "Blob Storage", "Queue Storage", "Event Hub"],
          defaultValue: "HTTP",
          required: true,
          description: "Function trigger type"
        },
        {
          id: "authLevel",
          name: "Authorization Level",
          type: "select",
          options: ["Anonymous", "Function", "Admin"],
          defaultValue: "Function",
          description: "HTTP trigger authorization level"
        }
      ]
    }
  ]
};

// Storage Account Service
const STORAGE_ACCOUNT_SERVICE: DetailedAzureService = {
  id: "azure-storage",
  name: "Storage Account",
  category: "Storage",
  description: "Scalable cloud storage solution",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#0078D4" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="10" font-family="Inter, sans-serif">💾</text>
  </svg>`,
  commonProperties: [
    {
      id: "storageAccountName",
      name: "Storage Account Name",
      type: "text",
      defaultValue: "mystorageaccount",
      required: true,
      description: "Storage account name (globally unique)"
    },
    {
      id: "performance",
      name: "Performance",
      type: "select",
      options: ["Standard", "Premium"],
      defaultValue: "Standard",
      required: true,
      description: "Storage performance tier"
    }
  ],
  subServices: [
    {
      id: "blob-storage",
      name: "Blob Storage",
      description: "Object storage for unstructured data",
      icon: "📦",
      properties: [
        {
          id: "accessTier",
          name: "Access Tier",
          type: "select",
          options: ["Hot", "Cool", "Archive"],
          defaultValue: "Hot",
          required: true,
          description: "Storage access tier for cost optimization"
        },
        {
          id: "replication",
          name: "Replication",
          type: "select",
          options: ["LRS", "GRS", "ZRS", "GZRS"],
          defaultValue: "LRS",
          required: true,
          description: "Data replication strategy"
        }
      ]
    },
    {
      id: "file-storage",
      name: "File Storage",
      description: "Managed file shares in the cloud",
      icon: "📁",
      properties: [
        {
          id: "protocol",
          name: "File Protocol",
          type: "select",
          options: ["SMB", "NFS"],
          defaultValue: "SMB",
          required: true,
          description: "File sharing protocol"
        },
        {
          id: "quota",
          name: "Quota (GB)",
          type: "number",
          defaultValue: 100,
          description: "File share quota in GB"
        }
      ]
    }
  ]
};

// Azure SQL Database Service
const AZURE_SQL_SERVICE: DetailedAzureService = {
  id: "azure-sql",
  name: "Azure SQL Database",
  category: "Databases",
  description: "Managed relational database service",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#0078D4" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="10" font-family="Inter, sans-serif">SQL</text>
  </svg>`,
  commonProperties: [
    {
      id: "serverName",
      name: "Server Name",
      type: "text",
      defaultValue: "myazuresqlserver",
      required: true,
      description: "Azure SQL server name"
    },
    {
      id: "adminLogin",
      name: "Admin Login",
      type: "text",
      defaultValue: "sqladmin",
      required: true,
      description: "Server administrator login"
    }
  ],
  subServices: [
    {
      id: "sql-database",
      name: "SQL Database",
      description: "Single database instance",
      icon: "🗄️",
      properties: [
        {
          id: "databaseName",
          name: "Database Name",
          type: "text",
          defaultValue: "MyDatabase",
          required: true,
          description: "SQL database name"
        },
        {
          id: "serviceTier",
          name: "Service Tier",
          type: "select",
          options: ["Basic", "Standard", "Premium", "General Purpose", "Business Critical"],
          defaultValue: "Standard",
          required: true,
          description: "Database service tier"
        },
        {
          id: "computeSize",
          name: "Compute Size",
          type: "select",
          options: ["S0", "S1", "S2", "P1", "P2", "GP_Gen5_2", "BC_Gen5_2"],
          defaultValue: "S0",
          required: true,
          description: "Database compute size"
        }
      ]
    },
    {
      id: "elastic-pool",
      name: "Elastic Pool",
      description: "Shared resource pool for multiple databases",
      icon: "🏊",
      properties: [
        {
          id: "poolName",
          name: "Pool Name",
          type: "text",
          defaultValue: "MyElasticPool",
          required: true,
          description: "Elastic pool name"
        },
        {
          id: "edition",
          name: "Edition",
          type: "select",
          options: ["Basic", "Standard", "Premium"],
          defaultValue: "Standard",
          required: true,
          description: "Elastic pool edition"
        }
      ]
    }
  ]
};

// Virtual Network Service
const VIRTUAL_NETWORK_SERVICE: DetailedAzureService = {
  id: "virtual-network",
  name: "Virtual Network",
  category: "Networking",
  description: "Private network in Azure",
  icon: `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#0078D4" stroke="#232F3E" stroke-width="2"/>
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="10" font-family="Inter, sans-serif">VNet</text>
  </svg>`,
  commonProperties: [
    {
      id: "vnetName",
      name: "VNet Name",
      type: "text",
      defaultValue: "MyVNet",
      required: true,
      description: "Virtual network name"
    },
    {
      id: "addressSpace",
      name: "Address Space",
      type: "text",
      defaultValue: "10.0.0.0/16",
      required: true,
      description: "IP address range for the VNet"
    }
  ],
  subServices: [
    {
      id: "subnet",
      name: "Subnet",
      description: "Network subnet within VNet",
      icon: "🌐",
      properties: [
        {
          id: "subnetName",
          name: "Subnet Name",
          type: "text",
          defaultValue: "MySubnet",
          required: true,
          description: "Subnet name"
        },
        {
          id: "subnetAddressRange",
          name: "Address Range",
          type: "text",
          defaultValue: "10.0.1.0/24",
          required: true,
          description: "IP address range for the subnet"
        }
      ]
    },
    {
      id: "network-security-group",
      name: "Network Security Group",
      description: "Network security rules",
      icon: "🛡️",
      properties: [
        {
          id: "nsgName",
          name: "NSG Name",
          type: "text",
          defaultValue: "MyNSG",
          required: true,
          description: "Network security group name"
        },
        {
          id: "rules",
          name: "Security Rules",
          type: "textarea",
          defaultValue: "Allow HTTP (80), Allow HTTPS (443)",
          description: "Network security rules"
        }
      ]
    }
  ]
};

// Export all detailed Azure services
export const DETAILED_AZURE_SERVICES: DetailedAzureService[] = [
  VIRTUAL_MACHINES_SERVICE,
  AZURE_FUNCTIONS_SERVICE,
  STORAGE_ACCOUNT_SERVICE,
  AZURE_SQL_SERVICE,
  VIRTUAL_NETWORK_SERVICE
];

// Helper functions
export const getAzureServiceById = (id: string): DetailedAzureService | undefined => {
  return DETAILED_AZURE_SERVICES.find(service => service.id === id);
};

export const getAzureSubServiceById = (serviceId: string, subServiceId: string): AzureSubService | undefined => {
  const service = getAzureServiceById(serviceId);
  return service?.subServices.find(sub => sub.id === subServiceId);
};

export const getAzureServicesByCategory = (category: string): DetailedAzureService[] => {
  return DETAILED_AZURE_SERVICES.filter(service => service.category === category);
};