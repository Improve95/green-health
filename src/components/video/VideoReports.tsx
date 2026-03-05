import { useState, useEffect } from 'react';
import { FileVideo } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { ReportFilterPanel } from '@/components/shared/ReportFilterPanel';
import { VideoReportCard } from './VideoReportCard';
import { VideoReportDetail } from './VideoReportDetail';
import { fetchReports } from '@/services/api';
import { REPORT_POLL_INTERVAL } from '@/config/api';
import type { VideoReport } from '@/types/app';
import type { ReportStatus } from '@/types/api';

export function VideoReports() {
  const { videoReports } = useApp();
  const [selectedReport, setSelectedReport] = useState<VideoReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [serverReports, setServerReports] = useState<VideoReport[]>([]);

  useEffect(() => {
    const poll = async () => {
      try {
        const status = statusFilter === 'all' ? undefined : statusFilter;
        const res = await fetchReports('video', status);
        setServerReports(
          res.reports.map(r => ({
            id: r.reportId,
            createdAt: new Date(r.createdAt),
            videoUrl: '',
            videoName: r.reportName,
            duration: 0,
            analyzedFrames: [],
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

  const allReports = [...serverReports, ...videoReports].reduce<VideoReport[]>((acc, r) => {
    if (!acc.find(e => e.id === r.id)) acc.push(r);
    return acc;
  }, []);

  const filteredReports = statusFilter === 'all'
    ? allReports
    : allReports.filter(r => r.status === statusFilter);

  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="font-heading font-semibold text-lg text-foreground">
        Video Reports
      </h2>

      <ReportFilterPanel
        activeFilter={statusFilter}
        onApply={setStatusFilter}
        totalCount={filteredReports.length}
      />

      {filteredReports.length === 0 ? (
        <EmptyState
          icon={FileVideo}
          title={statusFilter === 'all' ? 'No Video Reports Yet' : `No "${statusFilter}" reports`}
          description={statusFilter === 'all'
            ? 'Upload and analyze plant videos to see disease detection reports here.'
            : 'Try changing the filter to see other reports.'}
        />
      ) : (
        <div className="grid gap-4">
          {filteredReports.map(report => (
            <VideoReportCard
              key={report.id}
              report={report}
              onClick={() => setSelectedReport(report)}
            />
          ))}
        </div>
      )}

      <VideoReportDetail
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
