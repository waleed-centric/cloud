import React from 'react';
import WorkspaceTabs from '@/components/AwsBuilder/WorkspaceTabs';


// Summary: AWS DnD Builder page - main interface for drag and drop AWS architecture
// - Provides context wrapper and main builder component
// - Now includes CloudProviderProvider for multi-cloud support

export default function AwsBuilderPage() {
  return (
    <div className="h-screen w-full">
      <WorkspaceTabs />
    </div>
  );
}