import { useState, useEffect } from 'react';
import { FileImage } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { ReportFilterPanel } from '@/components/shared/ReportFilterPanel';
import { PhotoReportCard } from './PhotoReportCard';
import { PhotoReportDetail } from './PhotoReportDetail';
import { fetchReports } from '@/services/api';
import { REPORT_POLL_INTERVAL } from '@/config/api';
import type { PhotoReport } from '@/types/app';
import type { ReportStatus } from '@/types/api';

export function PhotoReports() {
  const { photoReports } = useApp();
  const [selectedReport, setSelectedReport] = useState<PhotoReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [serverReports, setServerReports] = useState<PhotoReport[]>([]);

  useEffect(() => {
    const poll = async () => {
      try {
        const status = statusFilter === 'all' ? undefined : statusFilter;
        const res = await fetchReports('photo', status);
        setServerReports(
          res.reports.map(r => ({
            id: r.reportId,
            createdAt: new Date(r.createdAt),
            imageUrl: '',
            imageName: r.reportName,
            plantSpecies: '',
            affectedPart: '',
            detections: [],
            status: r.status,
          }))
        );
      } catch (err) {
        console.error('Failed to poll reports:', err);
      }
    };

    poll();
    const interval = setInterval(poll, REPORT_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const allReports = [...serverReports, ...photoReports].reduce<PhotoReport[]>((acc, r) => {
    if (!acc.find(e => e.id === r.id)) acc.push(r);
    return acc;
  }, []);

  const filteredReports = statusFilter === 'all'
    ? allReports
    : allReports.filter(r => r.status === statusFilter);

  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="font-heading font-semibold text-lg text-foreground">
        Photo Reports
      </h2>

      <ReportFilterPanel
        activeFilter={statusFilter}
        onApply={setStatusFilter}
        totalCount={filteredReports.length}
      />

      {filteredReports.length === 0 ? (
        <EmptyState
          icon={FileImage}
          title={statusFilter === 'all' ? 'No Photo Reports Yet' : `No "${statusFilter}" reports`}
          description={statusFilter === 'all'
            ? 'Upload and analyze plant images to see disease detection reports here.'
            : 'Try changing the filter to see other reports.'}
        />
      ) : (
        <div className="grid gap-4">
          {filteredReports.map(report => (
            <PhotoReportCard
              key={report.id}
              report={report}
              onClick={() => setSelectedReport(report)}
            />
          ))}
        </div>
      )}

      <PhotoReportDetail
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
