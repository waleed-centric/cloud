// Azure Services Pricing Data (2024 Latest)
// All prices are in USD and based on East US region

export interface PricingTier {
  min: number;
  max?: number;
  price: number;
  unit: string;
}

export interface ServicePricing {
  serviceId: string;
  serviceName: string;
  category: string;
  basePrice?: number;
  pricingTiers?: PricingTier[];
  additionalCharges?: {
    [key: string]: number;
  };
  freeUsage?: {
    amount: number;
    unit: string;
    period: string;
  };
}

// Azure Virtual Machines Pricing (Pay-as-you-go)
export const AZURE_VM_PRICING: ServicePricing = {
  serviceId: "azure-vm",
  serviceName: "Azure Virtual Machines",
  category: "Compute",
  pricingTiers: [
    // B1s (1 vCPU, 1 GB RAM)
    { min: 0, max: 1, price: 0.0104, unit: "per hour" },
    // B2s (2 vCPU, 4 GB RAM)
    { min: 1, max: 4, price: 0.0416, unit: "per hour" },
    // D2s v3 (2 vCPU, 8 GB RAM)
    { min: 4, max: 8, price: 0.096, unit: "per hour" },
    // D4s v3 (4 vCPU, 16 GB RAM)
    { min: 8, max: 16, price: 0.192, unit: "per hour" },
    // D8s v3 (8 vCPU, 32 GB RAM)
    { min: 16, max: 32, price: 0.384, unit: "per hour" }
  ],
  freeUsage: {
    amount: 750,
    unit: "hours",
    period: "monthly"
  },
  additionalCharges: {
    "managed-disk": 0.048, // per GB per month (Standard SSD)
    "data-transfer-out": 0.087 // per GB after 5GB free
  }
};

// Azure Functions Pricing
export const AZURE_FUNCTIONS_PRICING: ServicePricing = {
  serviceId: "azure-functions",
  serviceName: "Azure Functions",
  category: "Compute",
  pricingTiers: [
    // Consumption Plan
    { min: 0, max: 1000000, price: 0, unit: "per 1M executions" },
    { min: 1000000, price: 0.20, unit: "per 1M executions" }
  ],
  additionalCharges: {
    "execution-time": 0.000016, // per GB-second
    "memory-128mb": 0.000001536, // per 100ms
    "memory-512mb": 0.000006144, // per 100ms
    "memory-1024mb": 0.000012288 // per 100ms
  },
  freeUsage: {
    amount: 1000000,
    unit: "executions",
    period: "monthly"
  }
};

// Azure Storage Account Pricing
export const AZURE_STORAGE_PRICING: ServicePricing = {
  serviceId: "azure-storage",
  serviceName: "Azure Storage Account",
  category: "Storage",
  pricingTiers: [
    // Hot Tier
    { min: 0, max: 50, price: 0.0184, unit: "per GB per month" },
    { min: 50, max: 450, price: 0.0177, unit: "per GB per month" },
    { min: 450, price: 0.0170, unit: "per GB per month" }
  ],
  additionalCharges: {
    "write-operations": 0.0055, // per 10,000 operations
    "read-operations": 0.0044, // per 10,000 operations
    "data-transfer-out": 0.087, // per GB after 5GB free
    "cool-tier": 0.0152, // per GB per month
    "archive-tier": 0.00099 // per GB per month
  },
  freeUsage: {
    amount: 5,
    unit: "GB",
    period: "monthly"
  }
};

// Azure SQL Database Pricing
export const AZURE_SQL_PRICING: ServicePricing = {
  serviceId: "azure-sql",
  serviceName: "Azure SQL Database",
  category: "Databases",
  pricingTiers: [
    // Basic Tier
    { min: 0, max: 2, price: 4.90, unit: "per month" },
    // Standard S0
    { min: 2, max: 10, price: 14.70, unit: "per month" },
    // Standard S1
    { min: 10, max: 20, price: 29.40, unit: "per month" },
    // Standard S2
    { min: 20, max: 50, price: 73.50, unit: "per month" },
    // Premium P1
    { min: 50, max: 125, price: 463.05, unit: "per month" }
  ],
  additionalCharges: {
    "backup-storage": 0.095, // per GB per month
    "data-transfer-out": 0.087, // per GB
    "point-in-time-restore": 0.12 // per GB restored
  }
};

// Azure Machine Learning Pricing
export const AZURE_ML_PRICING: ServicePricing = {
  serviceId: "azure-ml",
  serviceName: "Azure Machine Learning",
  category: "AI + Machine Learning",
  pricingTiers: [
    // Basic Workspace
    { min: 0, max: 1, price: 0, unit: "per workspace per month" },
    // Compute Instances (Standard_DS3_v2)
    { min: 1, max: 4, price: 0.192, unit: "per hour" },
    // Compute Instances (Standard_DS4_v2)
    { min: 4, max: 8, price: 0.384, unit: "per hour" }
  ],
  additionalCharges: {
    "training-compute": 0.096, // per hour (Standard_DS2_v2)
    "inference-compute": 0.144, // per hour (Standard_DS3_v2)
    "storage": 0.023, // per GB per month
    "data-transfer": 0.087 // per GB
  }
};

// Azure Virtual Network Pricing
export const AZURE_VNET_PRICING: ServicePricing = {
  serviceId: "azure-vnet",
  serviceName: "Azure Virtual Network",
  category: "Networking",
  basePrice: 0, // VNet itself is free
  additionalCharges: {
    "vpn-gateway-basic": 27.375, // per month
    "vpn-gateway-standard": 109.50, // per month
    "application-gateway": 21.90, // per month
    "load-balancer-basic": 0, // free
    "load-balancer-standard": 21.90, // per month
    "data-transfer-out": 0.087 // per GB after 5GB free
  }
};

// Azure Kubernetes Service Pricing
export const AZURE_AKS_PRICING: ServicePricing = {
  serviceId: "azure-aks",
  serviceName: "Azure Kubernetes Service",
  category: "Containers",
  basePrice: 0, // AKS cluster management is free
  pricingTiers: [
    // Node pricing (same as VM pricing)
    // Standard_DS2_v2 (2 vCPU, 7 GB RAM)
    { min: 0, max: 7, price: 0.096, unit: "per node per hour" },
    // Standard_DS3_v2 (4 vCPU, 14 GB RAM)
    { min: 7, max: 14, price: 0.192, unit: "per node per hour" },
    // Standard_DS4_v2 (8 vCPU, 28 GB RAM)
    { min: 14, max: 28, price: 0.384, unit: "per node per hour" }
  ],
  additionalCharges: {
    "managed-disk": 0.048, // per GB per month
    "load-balancer": 21.90, // per month
    "data-transfer-out": 0.087 // per GB
  }
};

// Azure App Service Pricing
export const AZURE_APP_SERVICE_PRICING: ServicePricing = {
  serviceId: "azure-app-service",
  serviceName: "Azure App Service",
  category: "Web",
  pricingTiers: [
    // Free Tier
    { min: 0, max: 1, price: 0, unit: "per month" },
    // Basic B1
    { min: 1, max: 2, price: 13.14, unit: "per month" },
    // Standard S1
    { min: 2, max: 4, price: 65.70, unit: "per month" },
    // Premium P1v2
    { min: 4, max: 8, price: 131.40, unit: "per month" },
    // Premium P2v2
    { min: 8, max: 16, price: 262.80, unit: "per month" }
  ],
  freeUsage: {
    amount: 10,
    unit: "apps",
    period: "monthly"
  },
  additionalCharges: {
    "ssl-certificate": 69.35, // per certificate per month
    "custom-domain": 0, // free
    "backup-storage": 0.10, // per GB per month
    "data-transfer-out": 0.087 // per GB
  }
};

// Export all Azure pricing data
export const AZURE_PRICING_DATA: ServicePricing[] = [
  AZURE_VM_PRICING,
  AZURE_FUNCTIONS_PRICING,
  AZURE_STORAGE_PRICING,
  AZURE_SQL_PRICING,
  AZURE_ML_PRICING,
  AZURE_VNET_PRICING,
  AZURE_AKS_PRICING,
  AZURE_APP_SERVICE_PRICING
];

// Helper function to get pricing by service ID
export const getAzurePricingByServiceId = (serviceId: string): ServicePricing | undefined => {
  return AZURE_PRICING_DATA.find(pricing => pricing.serviceId === serviceId);
};

// Helper function to calculate estimated monthly cost
export const calculateAzureMonthlyCost = (serviceId: string, usage: number): number => {
  const pricing = getAzurePricingByServiceId(serviceId);
  if (!pricing || !pricing.pricingTiers) return 0;

  // Find appropriate pricing tier
  const tier = pricing.pricingTiers.find(tier => 
    usage >= tier.min && (tier.max === undefined || usage <= tier.max)
  );

  if (!tier) return 0;

  // Calculate based on unit type
  if (tier.unit.includes('hour')) {
    return tier.price * usage * 24 * 30; // Convert hourly to monthly
  } else if (tier.unit.includes('month')) {
    return tier.price;
  } else {
    return tier.price * usage;
  }
};