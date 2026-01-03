import { useState } from 'react';
import { Activity } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { StreamingReportCard } from './StreamingReportCard';
import { StreamingReportDetail } from './StreamingReportDetail';
import type { StreamingReport } from '@/types/app';

export function StreamingReports() {
  const { streamingReports } = useApp();
  const [selectedReport, setSelectedReport] = useState<StreamingReport | null>(null);

  if (streamingReports.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No Streaming Reports Yet"
        description="Generate reports from your streaming sessions to see aggregated disease detection data here."
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-lg text-foreground">
          Streaming Reports
        </h2>
        <span className="text-sm text-muted-foreground">
          {streamingReports.length} report{streamingReports.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid gap-4">
        {streamingReports.map(report => (
          <StreamingReportCard
            key={report.id}
            report={report}
            onClick={() => setSelectedReport(report)}
          />
        ))}
      </div>

      <StreamingReportDetail
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
