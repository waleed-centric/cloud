import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { calculateServiceCost as calculateAwsCost, getPricingSummary as getAwsPricingSummary } from '../data/aws-pricing';
import { calculateAzureMonthlyCost, getAzurePricingByServiceId } from '../data/azure-pricing';
import { calculateGcpMonthlyCost, getGcpPricingByServiceId } from '../data/gcp-pricing';
import { useCloudProvider } from './CloudProviderContext';

interface ServiceCost {
  nodeId: string;
  serviceId: string;
  serviceName: string;
  configuration: any;
  monthlyCost: number;
  hourlyCost: number;
}

interface PricingContextType {
  serviceCosts: ServiceCost[];
  totalMonthlyCost: number;
  totalHourlyCost: number;
  addServiceCost: (nodeId: string, serviceId: string, serviceName: string, configuration: any) => void;
  updateServiceCost: (nodeId: string, configuration: any) => void;
  removeServiceCost: (nodeId: string) => void;
  clearAllCosts: () => void;
  getPricingSummaryForService: (serviceId: string) => string;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export const PricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serviceCosts, setServiceCosts] = useState<ServiceCost[]>([]);
  const [totalMonthlyCost, setTotalMonthlyCost] = useState<number>(0);
  const [totalHourlyCost, setTotalHourlyCost] = useState<number>(0);
  const { currentProvider } = useCloudProvider();

  // Calculate total costs whenever serviceCosts change
  useEffect(() => {
    const monthlyTotal = serviceCosts.reduce((sum, service) => sum + service.monthlyCost, 0);
    const hourlyTotal = serviceCosts.reduce((sum, service) => sum + service.hourlyCost, 0);
    
    setTotalMonthlyCost(Math.round(monthlyTotal * 100) / 100);
    setTotalHourlyCost(Math.round(hourlyTotal * 100) / 100);
  }, [serviceCosts]);

  const addServiceCost = useCallback((
    nodeId: string, 
    serviceId: string, 
    serviceName: string, 
    configuration: any
  ) => {
    // Provider-aware pricing calculation
    let monthlyCost = 0;
    let hourlyCost = 0;

    if (currentProvider === 'aws') {
      monthlyCost = calculateAwsCost(serviceId, configuration, 730);
      hourlyCost = calculateAwsCost(serviceId, configuration, 1);
    } else if (currentProvider === 'azure') {
      monthlyCost = calculateAzureMonthlyCost(serviceId, configuration?.usage || 1);
      hourlyCost = monthlyCost / 730;
    } else if (currentProvider === 'gcp') {
      monthlyCost = calculateGcpMonthlyCost(serviceId, configuration?.usage || 1);
      hourlyCost = monthlyCost / 730;
    }

    const newServiceCost: ServiceCost = {
      nodeId,
      serviceId,
      serviceName,
      configuration,
      monthlyCost,
      hourlyCost
    };

    setServiceCosts(prev => {
      // Remove existing cost for this node if it exists
      const filtered = prev.filter(cost => cost.nodeId !== nodeId);
      return [...filtered, newServiceCost];
    });
  }, []);

  const updateServiceCost = useCallback((nodeId: string, configuration: any) => {
    setServiceCosts(prev => 
      prev.map(cost => {
        if (cost.nodeId === nodeId) {
          let monthlyCost = 0;
          let hourlyCost = 0;

          if (currentProvider === 'aws') {
            monthlyCost = calculateAwsCost(cost.serviceId, configuration, 730);
            hourlyCost = calculateAwsCost(cost.serviceId, configuration, 1);
          } else if (currentProvider === 'azure') {
            monthlyCost = calculateAzureMonthlyCost(cost.serviceId, configuration?.usage || 1);
            hourlyCost = monthlyCost / 730;
          } else if (currentProvider === 'gcp') {
            monthlyCost = calculateGcpMonthlyCost(cost.serviceId, configuration?.usage || 1);
            hourlyCost = monthlyCost / 730;
          }
          
          return {
            ...cost,
            configuration,
            monthlyCost,
            hourlyCost
          };
        }
        return cost;
      })
    );
  }, []);

  const removeServiceCost = useCallback((nodeId: string) => {
    setServiceCosts(prev => prev.filter(cost => cost.nodeId !== nodeId));
  }, []);

  const clearAllCosts = useCallback(() => {
    setServiceCosts([]);
  }, []);

  const getPricingSummaryForService = useCallback((serviceId: string) => {
    if (currentProvider === 'aws') {
      return getAwsPricingSummary(serviceId);
    } else if (currentProvider === 'azure') {
      const pricing = getAzurePricingByServiceId(serviceId);
      if (!pricing) return 'Pricing not available';
      if (pricing.pricingTiers && pricing.pricingTiers.length > 0) {
        const firstTier = pricing.pricingTiers[0];
        return `Starting from $${firstTier.price} ${firstTier.unit}`;
      }
      if (pricing.basePrice) return `$${pricing.basePrice} per hour`;
      return 'Custom pricing';
    } else if (currentProvider === 'gcp') {
      const pricing = getGcpPricingByServiceId(serviceId);
      if (!pricing) return 'Pricing not available';
      if (pricing.pricingTiers && pricing.pricingTiers.length > 0) {
        const firstTier = pricing.pricingTiers[0];
        return `Starting from $${firstTier.price} ${firstTier.unit}`;
      }
      if (pricing.basePrice) return `$${pricing.basePrice} per hour`;
      return 'Custom pricing';
    }
    return 'Pricing not available';
  }, [currentProvider]);

  const value: PricingContextType = {
    serviceCosts,
    totalMonthlyCost,
    totalHourlyCost,
    addServiceCost,
    updateServiceCost,
    removeServiceCost,
    clearAllCosts,
    getPricingSummaryForService
  };

  return (
    <PricingContext.Provider value={value}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = (): PricingContextType => {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
};