import { Activity } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export function StreamingReports() {
  return (
    <EmptyState
      icon={Activity}
      title="No Streaming Reports Yet"
      description="Generate reports from your streaming sessions to see aggregated disease detection data here."
    />
  );
}
