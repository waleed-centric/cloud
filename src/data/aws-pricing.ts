// AWS Services Pricing Data (2024 Latest)
// All prices are in USD and based on US East (Ohio) region

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

// EC2 Instance Pricing (On-Demand)
export const EC2_PRICING: ServicePricing = {
  serviceId: "ec2",
  serviceName: "Amazon EC2",
  category: "Compute",
  pricingTiers: [
    // t2.micro (1 vCPU, 1 GB RAM)
    { min: 0, max: 1, price: 0.0116, unit: "per hour" },
    // t2.small (1 vCPU, 2 GB RAM)
    { min: 1, max: 2, price: 0.023, unit: "per hour" },
    // t2.medium (2 vCPU, 4 GB RAM)
    { min: 2, max: 4, price: 0.0464, unit: "per hour" },
    // t3.large (2 vCPU, 8 GB RAM)
    { min: 4, max: 8, price: 0.0832, unit: "per hour" },
    // m5.large (2 vCPU, 8 GB RAM)
    { min: 8, max: 16, price: 0.096, unit: "per hour" },
    // m5.xlarge (4 vCPU, 16 GB RAM)
    { min: 16, max: 32, price: 0.192, unit: "per hour" }
  ],
  freeUsage: {
    amount: 750,
    unit: "hours",
    period: "monthly"
  },
  additionalCharges: {
    "ebs-storage": 0.10, // per GB per month
    "data-transfer-out": 0.09 // per GB after 1GB free
  }
};

// Lambda Pricing
export const LAMBDA_PRICING: ServicePricing = {
  serviceId: "lambda",
  serviceName: "AWS Lambda",
  category: "Compute",
  pricingTiers: [
    // Requests
    { min: 0, max: 1000000, price: 0, unit: "per 1M requests" },
    { min: 1000000, price: 0.20, unit: "per 1M requests" }
  ],
  additionalCharges: {
    "duration-128mb": 0.0000002083, // per 100ms
    "duration-512mb": 0.0000008333, // per 100ms
    "duration-1024mb": 0.0000016667, // per 100ms
    "duration-3008mb": 0.0000050000 // per 100ms
  },
  freeUsage: {
    amount: 1000000,
    unit: "requests",
    period: "monthly"
  }
};

// S3 Storage Pricing
export const S3_PRICING: ServicePricing = {
  serviceId: "s3",
  serviceName: "Amazon S3",
  category: "Storage",
  pricingTiers: [
    // Standard Storage
    { min: 0, max: 50, price: 0.023, unit: "per GB per month" },
    { min: 50, max: 450, price: 0.022, unit: "per GB per month" },
    { min: 450, price: 0.021, unit: "per GB per month" }
  ],
  additionalCharges: {
    "put-requests": 0.0005, // per 1000 requests
    "get-requests": 0.0004, // per 1000 requests
    "data-transfer-out": 0.09 // per GB after 1GB free
  },
  freeUsage: {
    amount: 5,
    unit: "GB",
    period: "monthly"
  }
};

// RDS Database Pricing
export const RDS_PRICING: ServicePricing = {
  serviceId: "rds",
  serviceName: "Amazon RDS",
  category: "Database",
  pricingTiers: [
    // db.t3.micro (1 vCPU, 1 GB RAM)
    { min: 0, max: 1, price: 0.017, unit: "per hour" },
    // db.t3.small (1 vCPU, 2 GB RAM)
    { min: 1, max: 2, price: 0.034, unit: "per hour" },
    // db.t3.medium (2 vCPU, 4 GB RAM)
    { min: 2, max: 4, price: 0.068, unit: "per hour" },
    // db.m5.large (2 vCPU, 8 GB RAM)
    { min: 4, max: 8, price: 0.192, unit: "per hour" },
    // db.m5.xlarge (4 vCPU, 16 GB RAM)
    { min: 8, max: 16, price: 0.384, unit: "per hour" }
  ],
  additionalCharges: {
    "storage-gp2": 0.115, // per GB per month
    "backup-storage": 0.095, // per GB per month
    "data-transfer-out": 0.09 // per GB
  },
  freeUsage: {
    amount: 750,
    unit: "hours",
    period: "monthly"
  }
};

// VPC Networking Pricing
export const VPC_PRICING: ServicePricing = {
  serviceId: "vpc",
  serviceName: "Amazon VPC",
  category: "Networking",
  basePrice: 0, // VPC itself is free
  additionalCharges: {
    "nat-gateway-hour": 0.045, // per hour
    "nat-gateway-data": 0.045, // per GB processed
    "vpn-connection": 0.05, // per hour
    "elastic-ip-idle": 0.005, // per hour when not attached
    "data-transfer-az": 0.01 // per GB between AZs
  }
};

// CloudFront CDN Pricing
export const CLOUDFRONT_PRICING: ServicePricing = {
  serviceId: "cloudfront",
  serviceName: "Amazon CloudFront",
  category: "Networking",
  pricingTiers: [
    // Data Transfer Out
    { min: 0, max: 10, price: 0.085, unit: "per GB" },
    { min: 10, max: 50, price: 0.080, unit: "per GB" },
    { min: 50, max: 150, price: 0.060, unit: "per GB" },
    { min: 150, max: 500, price: 0.040, unit: "per GB" },
    { min: 500, price: 0.030, unit: "per GB" }
  ],
  additionalCharges: {
    "http-requests": 0.0075, // per 10,000 requests
    "https-requests": 0.0100, // per 10,000 requests
    "origin-requests": 0.0200 // per 10,000 requests
  },
  freeUsage: {
    amount: 50,
    unit: "GB",
    period: "monthly"
  }
};

// All Services Pricing
export const AWS_PRICING: ServicePricing[] = [
  EC2_PRICING,
  LAMBDA_PRICING,
  S3_PRICING,
  RDS_PRICING,
  VPC_PRICING,
  CLOUDFRONT_PRICING
];

// Pricing Calculator Functions
export const calculateServiceCost = (
  serviceId: string,
  configuration: any,
  usageHours: number = 730 // Default: 1 month
): number => {
  const pricing = AWS_PRICING.find(p => p.serviceId === serviceId);
  if (!pricing) return 0;

  let totalCost = 0;

  // Base pricing calculation
  if (pricing.basePrice) {
    totalCost += pricing.basePrice * usageHours;
  }

  // Tiered pricing calculation
  if (pricing.pricingTiers) {
    const tier = pricing.pricingTiers.find(t => {
      if (serviceId === 'ec2' || serviceId === 'rds') {
        // For compute services, use memory/CPU configuration
        const memory = parseInt(configuration.memory || '1');
        return memory >= t.min && (!t.max || memory <= t.max);
      }
      return true; // Default to first tier for other services
    });
    
    if (tier) {
      totalCost += tier.price * usageHours;
    }
  }

  // Additional charges
  if (pricing.additionalCharges && configuration) {
    Object.keys(pricing.additionalCharges).forEach(chargeType => {
      const rate = pricing.additionalCharges![chargeType];
      
      switch (chargeType) {
        case 'ebs-storage':
          if (configuration.storage) {
            totalCost += parseInt(configuration.storage) * rate;
          }
          break;
        case 'storage-gp2':
          if (configuration.allocatedStorage) {
            totalCost += parseInt(configuration.allocatedStorage) * rate;
          }
          break;
        case 'nat-gateway-hour':
          if (configuration.hasNatGateway) {
            totalCost += rate * usageHours;
          }
          break;
        // Add more charge types as needed
      }
    });
  }

  return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
};

// Get pricing summary for a service
export const getPricingSummary = (serviceId: string): string => {
  const pricing = AWS_PRICING.find(p => p.serviceId === serviceId);
  if (!pricing) return "Pricing not available";

  if (pricing.pricingTiers && pricing.pricingTiers.length > 0) {
    const firstTier = pricing.pricingTiers[0];
    return `Starting from $${firstTier.price} ${firstTier.unit}`;
  }

  if (pricing.basePrice) {
    return `$${pricing.basePrice} per hour`;
  }

  return "Custom pricing";
};