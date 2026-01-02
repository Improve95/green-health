import { useState } from 'react';
import { FileImage } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { PhotoReportCard } from './PhotoReportCard';
import { PhotoReportDetail } from './PhotoReportDetail';
import type { PhotoReport } from '@/types/app';

export function PhotoReports() {
  const { photoReports } = useApp();
  const [selectedReport, setSelectedReport] = useState<PhotoReport | null>(null);

  if (photoReports.length === 0) {
    return (
      <EmptyState
        icon={FileImage}
        title="No Photo Reports Yet"
        description="Upload and analyze plant images to see disease detection reports here."
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-lg text-foreground">
          Photo Reports
        </h2>
        <span className="text-sm text-muted-foreground">
          {photoReports.length} report{photoReports.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid gap-4">
        {photoReports.map(report => (
          <PhotoReportCard
            key={report.id}
            report={report}
            onClick={() => setSelectedReport(report)}
          />
        ))}
      </div>

      <PhotoReportDetail
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
