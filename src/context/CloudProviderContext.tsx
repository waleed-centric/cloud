import React, { createContext, useContext, useState, ReactNode } from 'react';

// Cloud Provider Types
export type CloudProvider = 'aws' | 'azure' | 'gcp';

export interface CloudProviderState {
  currentProvider: CloudProvider;
  providers: {
    aws: { name: 'AWS', icon: '🟠', fullName: 'Amazon Web Services' };
    azure: { name: 'Azure', icon: '🔵', fullName: 'Microsoft Azure' };
    gcp: { name: 'GCP', icon: '🟡', fullName: 'Google Cloud Platform' };
  };
}

interface CloudProviderContextType {
  state: CloudProviderState;
  setProvider: (provider: CloudProvider) => void;
  clearCanvas: () => void;
}

const CloudProviderContext = createContext<CloudProviderContextType | undefined>(undefined);

interface CloudProviderProviderProps {
  children: ReactNode;
  onProviderChange?: (provider: CloudProvider) => void;
}

export const CloudProviderProvider: React.FC<CloudProviderProviderProps> = ({ 
  children, 
  onProviderChange 
}) => {
  const [state, setState] = useState<CloudProviderState>({
    currentProvider: 'aws',
    providers: {
      aws: { name: 'AWS', icon: '🟠', fullName: 'Amazon Web Services' },
      azure: { name: 'Azure', icon: '🔵', fullName: 'Microsoft Azure' },
      gcp: { name: 'GCP', icon: '🟡', fullName: 'Google Cloud Platform' }
    }
  });

  const setProvider = (provider: CloudProvider) => {
    setState(prev => ({
      ...prev,
      currentProvider: provider
    }));
    
    // Callback for clearing canvas when provider changes
    if (onProviderChange) {
      onProviderChange(provider);
    }
  };

  const clearCanvas = () => {
    // This will be called when provider changes to clear canvas
    console.log('Canvas cleared for provider change');
  };

  return (
    <CloudProviderContext.Provider value={{ state, setProvider, clearCanvas }}>
      {children}
    </CloudProviderContext.Provider>
  );
};

export const useCloudProvider = () => {
  const context = useContext(CloudProviderContext);
  if (context === undefined) {
    throw new Error('useCloudProvider must be used within a CloudProviderProvider');
  }
  
  return {
    currentProvider: context.state.currentProvider,
    setProvider: context.setProvider,
    clearCanvas: context.clearCanvas,
    providers: context.state.providers
  };
};