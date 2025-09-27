import React from 'react';
import { AwsBuilderProvider } from '@/context/AwsBuilderContext';
import { DragDropBuilder } from '@/components/AwsBuilder/DragDropBuilder';


// Summary: AWS DnD Builder page - main interface for drag and drop AWS architecture
// - Provides context wrapper and main builder component

export default function AwsBuilderPage() {
  return (
    <AwsBuilderProvider>     
          <DragDropBuilder />
    </AwsBuilderProvider>
  );
}