import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { calculateServiceCost, getPricingSummary } from '../data/aws-pricing';

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
    const monthlyCost = calculateServiceCost(serviceId, configuration, 730); // 730 hours = 1 month
    const hourlyCost = calculateServiceCost(serviceId, configuration, 1);

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
          const monthlyCost = calculateServiceCost(cost.serviceId, configuration, 730);
          const hourlyCost = calculateServiceCost(cost.serviceId, configuration, 1);
          
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
    return getPricingSummary(serviceId);
  }, []);

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