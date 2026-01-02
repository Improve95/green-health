import { Video } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export function VideoAnalysis() {
  return (
    <EmptyState
      icon={Video}
      title="Video Analysis"
      description="Upload plant videos for disease detection. Drag and drop or click to browse video files."
    />
  );
}
