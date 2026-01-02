import { FileVideo } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export function VideoReports() {
  return (
    <EmptyState
      icon={FileVideo}
      title="No Video Reports Yet"
      description="Upload and analyze plant videos to see disease detection reports here."
    />
  );
}
