// Google Cloud Platform (GCP) Services Pricing Data (2024 Latest)
// All prices are in USD and based on us-central1 region

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

// Google Compute Engine Pricing
export const GCP_COMPUTE_ENGINE_PRICING: ServicePricing = {
  serviceId: "compute-engine",
  serviceName: "Google Compute Engine",
  category: "Compute",
  pricingTiers: [
    // e2-micro (0.25-2 vCPU, 1 GB RAM)
    { min: 0, max: 1, price: 0.008467, unit: "per hour" },
    // e2-small (0.5-2 vCPU, 2 GB RAM)
    { min: 1, max: 2, price: 0.016934, unit: "per hour" },
    // e2-medium (1-2 vCPU, 4 GB RAM)
    { min: 2, max: 4, price: 0.033869, unit: "per hour" },
    // n1-standard-1 (1 vCPU, 3.75 GB RAM)
    { min: 3, max: 4, price: 0.0475, unit: "per hour" },
    // n1-standard-2 (2 vCPU, 7.5 GB RAM)
    { min: 7, max: 8, price: 0.095, unit: "per hour" },
    // n1-standard-4 (4 vCPU, 15 GB RAM)
    { min: 15, max: 16, price: 0.19, unit: "per hour" }
  ],
  freeUsage: {
    amount: 744,
    unit: "hours",
    period: "monthly"
  },
  additionalCharges: {
    "persistent-disk-standard": 0.040, // per GB per month
    "persistent-disk-ssd": 0.170, // per GB per month
    "network-egress": 0.12, // per GB after 1GB free
    "preemptible-discount": -0.80 // 80% discount for preemptible instances
  }
};

// Google Cloud Functions Pricing
export const GCP_CLOUD_FUNCTIONS_PRICING: ServicePricing = {
  serviceId: "cloud-functions",
  serviceName: "Google Cloud Functions",
  category: "Compute",
  pricingTiers: [
    // Invocations
    { min: 0, max: 2000000, price: 0, unit: "per 1M invocations" },
    { min: 2000000, price: 0.40, unit: "per 1M invocations" }
  ],
  additionalCharges: {
    "compute-time-128mb": 0.0000002500, // per 100ms
    "compute-time-256mb": 0.0000005000, // per 100ms
    "compute-time-512mb": 0.0000010000, // per 100ms
    "compute-time-1024mb": 0.0000020000, // per 100ms
    "network-egress": 0.12 // per GB
  },
  freeUsage: {
    amount: 2000000,
    unit: "invocations",
    period: "monthly"
  }
};

// Google Cloud Storage Pricing
export const GCP_CLOUD_STORAGE_PRICING: ServicePricing = {
  serviceId: "cloud-storage",
  serviceName: "Google Cloud Storage",
  category: "Storage",
  pricingTiers: [
    // Standard Storage
    { min: 0, max: 1024, price: 0.020, unit: "per GB per month" },
    // Nearline Storage (30-day minimum)
    { min: 0, max: 1024, price: 0.010, unit: "per GB per month" },
    // Coldline Storage (90-day minimum)
    { min: 0, max: 1024, price: 0.004, unit: "per GB per month" },
    // Archive Storage (365-day minimum)
    { min: 0, max: 1024, price: 0.0012, unit: "per GB per month" }
  ],
  additionalCharges: {
    "class-a-operations": 0.005, // per 1000 operations (insert, list)
    "class-b-operations": 0.0004, // per 1000 operations (get, head)
    "network-egress": 0.12, // per GB after 1GB free
    "nearline-retrieval": 0.01, // per GB
    "coldline-retrieval": 0.02, // per GB
    "archive-retrieval": 0.05 // per GB
  },
  freeUsage: {
    amount: 5,
    unit: "GB",
    period: "monthly"
  }
};

// Google Cloud SQL Pricing
export const GCP_CLOUD_SQL_PRICING: ServicePricing = {
  serviceId: "cloud-sql",
  serviceName: "Google Cloud SQL",
  category: "Databases",
  pricingTiers: [
    // db-f1-micro (0.6 GB RAM)
    { min: 0, max: 1, price: 0.0150, unit: "per hour" },
    // db-g1-small (1.7 GB RAM)
    { min: 1, max: 2, price: 0.0500, unit: "per hour" },
    // db-n1-standard-1 (3.75 GB RAM)
    { min: 3, max: 4, price: 0.0960, unit: "per hour" },
    // db-n1-standard-2 (7.5 GB RAM)
    { min: 7, max: 8, price: 0.1920, unit: "per hour" },
    // db-n1-standard-4 (15 GB RAM)
    { min: 15, max: 16, price: 0.3840, unit: "per hour" }
  ],
  additionalCharges: {
    "ssd-storage": 0.170, // per GB per month
    "hdd-storage": 0.090, // per GB per month
    "backup-storage": 0.080, // per GB per month
    "network-egress": 0.12, // per GB
    "ip-address": 7.30 // per month for reserved IP
  }
};

// Google BigQuery Pricing
export const GCP_BIGQUERY_PRICING: ServicePricing = {
  serviceId: "bigquery",
  serviceName: "Google BigQuery",
  category: "Analytics & Big Data",
  pricingTiers: [
    // On-demand queries
    { min: 0, max: 1024, price: 5.00, unit: "per TB processed" }
  ],
  additionalCharges: {
    "storage": 0.020, // per GB per month
    "long-term-storage": 0.010, // per GB per month (90+ days)
    "streaming-inserts": 0.010, // per 200MB
    "flat-rate-slots": 2000, // per month for 500 slots
    "data-transfer": 0.12 // per GB
  },
  freeUsage: {
    amount: 1,
    unit: "TB",
    period: "monthly"
  }
};

// Google Vertex AI Pricing
export const GCP_VERTEX_AI_PRICING: ServicePricing = {
  serviceId: "vertex-ai",
  serviceName: "Google Vertex AI",
  category: "AI & Machine Learning",
  pricingTiers: [
    // Training (n1-standard-4)
    { min: 0, max: 4, price: 0.19, unit: "per hour" },
    // Training (n1-standard-8)
    { min: 4, max: 8, price: 0.38, unit: "per hour" },
    // Training (n1-highmem-2)
    { min: 2, max: 13, price: 0.1184, unit: "per hour" }
  ],
  additionalCharges: {
    "prediction-n1-standard-2": 0.056, // per hour
    "prediction-n1-standard-4": 0.112, // per hour
    "automl-training": 3.15, // per hour
    "automl-prediction": 1.50, // per 1000 predictions
    "storage": 0.023, // per GB per month
    "network-egress": 0.12 // per GB
  }
};

// Google VPC Pricing
export const GCP_VPC_PRICING: ServicePricing = {
  serviceId: "vpc",
  serviceName: "Google Virtual Private Cloud",
  category: "Networking",
  basePrice: 0, // VPC itself is free
  additionalCharges: {
    "vpn-tunnel": 36.50, // per tunnel per month
    "cloud-nat": 45.00, // per gateway per month
    "load-balancer": 18.25, // per month
    "firewall-rules": 0, // free up to 200 rules
    "network-egress": 0.12, // per GB after 1GB free
    "premium-tier": 0.085 // per GB (premium network tier)
  }
};

// Google Kubernetes Engine Pricing
export const GCP_GKE_PRICING: ServicePricing = {
  serviceId: "gke",
  serviceName: "Google Kubernetes Engine",
  category: "Containers",
  basePrice: 0.10, // per cluster per hour for management fee
  pricingTiers: [
    // Node pricing (same as Compute Engine)
    // e2-medium (1-2 vCPU, 4 GB RAM)
    { min: 0, max: 4, price: 0.033869, unit: "per node per hour" },
    // n1-standard-1 (1 vCPU, 3.75 GB RAM)
    { min: 3, max: 4, price: 0.0475, unit: "per node per hour" },
    // n1-standard-2 (2 vCPU, 7.5 GB RAM)
    { min: 7, max: 8, price: 0.095, unit: "per node per hour" }
  ],
  additionalCharges: {
    "persistent-disk": 0.040, // per GB per month
    "load-balancer": 18.25, // per month
    "network-egress": 0.12, // per GB
    "autopilot-surcharge": 0.10 // additional per vCPU per hour for Autopilot
  },
  freeUsage: {
    amount: 1,
    unit: "zonal cluster",
    period: "monthly"
  }
};

// Google Cloud Run Pricing
export const GCP_CLOUD_RUN_PRICING: ServicePricing = {
  serviceId: "cloud-run",
  serviceName: "Google Cloud Run",
  category: "Containers",
  pricingTiers: [
    // CPU allocation
    { min: 0, max: 1, price: 0.00002400, unit: "per vCPU per second" },
    // Memory allocation
    { min: 0, max: 1, price: 0.00000250, unit: "per GB per second" }
  ],
  additionalCharges: {
    "requests": 0.40, // per 1M requests
    "network-egress": 0.12, // per GB
    "container-image-storage": 0.026 // per GB per month
  },
  freeUsage: {
    amount: 2000000,
    unit: "requests",
    period: "monthly"
  }
};

// Export all GCP pricing data
export const GCP_PRICING_DATA: ServicePricing[] = [
  GCP_COMPUTE_ENGINE_PRICING,
  GCP_CLOUD_FUNCTIONS_PRICING,
  GCP_CLOUD_STORAGE_PRICING,
  GCP_CLOUD_SQL_PRICING,
  GCP_BIGQUERY_PRICING,
  GCP_VERTEX_AI_PRICING,
  GCP_VPC_PRICING,
  GCP_GKE_PRICING,
  GCP_CLOUD_RUN_PRICING
];

// Helper function to get pricing by service ID
export const getGcpPricingByServiceId = (serviceId: string): ServicePricing | undefined => {
  return GCP_PRICING_DATA.find(pricing => pricing.serviceId === serviceId);
};

// Helper function to calculate estimated monthly cost
export const calculateGcpMonthlyCost = (serviceId: string, usage: number): number => {
  const pricing = getGcpPricingByServiceId(serviceId);
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
  } else if (tier.unit.includes('second')) {
    return tier.price * usage * 60 * 60 * 24 * 30; // Convert per second to monthly
  } else {
    return tier.price * usage;
  }
};