import { useState } from 'react';
import { FileVideo } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { VideoReportCard } from './VideoReportCard';
import { VideoReportDetail } from './VideoReportDetail';
import type { VideoReport } from '@/types/app';

export function VideoReports() {
  const { videoReports } = useApp();
  const [selectedReport, setSelectedReport] = useState<VideoReport | null>(null);

  if (videoReports.length === 0) {
    return (
      <EmptyState
        icon={FileVideo}
        title="No Video Reports Yet"
        description="Upload and analyze plant videos to see disease detection reports here."
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-lg text-foreground">
          Video Reports
        </h2>
        <span className="text-sm text-muted-foreground">
          {videoReports.length} report{videoReports.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid gap-4">
        {videoReports.map(report => (
          <VideoReportCard
            key={report.id}
            report={report}
            onClick={() => setSelectedReport(report)}
          />
        ))}
      </div>

      <VideoReportDetail
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
