import React, { useRef } from 'react';
import { AwsBuilderProvider } from '@/context/AwsBuilderContext';
import { CloudProviderProvider } from '@/context/CloudProviderContext';
import { DragDropBuilder } from '@/components/AwsBuilder/DragDropBuilder';


// Summary: AWS DnD Builder page - main interface for drag and drop AWS architecture
// - Provides context wrapper and main builder component
// - Now includes CloudProviderProvider for multi-cloud support

export default function AwsBuilderPage() {
  const clearCanvasRef = useRef<(() => void) | null>(null);

  const handleProviderChange = () => {
    // Clear canvas when provider changes
    if (clearCanvasRef.current) {
      clearCanvasRef.current();
    }
  };

  return (
    <CloudProviderProvider onProviderChange={handleProviderChange}>
      <AwsBuilderProvider>     
            <DragDropBuilder clearCanvasRef={clearCanvasRef} />
      </AwsBuilderProvider>
    </CloudProviderProvider>
  );
}