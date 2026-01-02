import { Radio } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export function StreamingAnalysis() {
  return (
    <EmptyState
      icon={Radio}
      title="Streaming Analysis"
      description="Add a streaming source (Screen Recording or Webcam) to start real-time plant disease detection."
    />
  );
}
