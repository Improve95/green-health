import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { ReportFilterPanel } from '@/components/shared/ReportFilterPanel';
import { StreamingReportCard } from './StreamingReportCard';
import { StreamingReportDetail } from './StreamingReportDetail';
import { fetchReports } from '@/services/api';
import { REPORT_POLL_INTERVAL } from '@/config/api';
import type { StreamingReport } from '@/types/app';
import type { ReportStatus } from '@/types/api';

export function StreamingReports() {
  const { streamingReports } = useApp();
  const [selectedReport, setSelectedReport] = useState<StreamingReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [serverReports, setServerReports] = useState<StreamingReport[]>([]);

  useEffect(() => {
    const poll = async () => {
      try {
        const status = statusFilter === 'all' ? undefined : statusFilter;
        const res = await fetchReports('streaming', status);
        setServerReports(
          res.reports.map(r => ({
            id: r.reportId,
            sourceId: '',
            sourceName: r.reportName,
            startTime: new Date(r.createdAt),
            endTime: new Date(r.createdAt),
            detections: [],
            aggregatedStats: {
              totalDetections: 0,
              diseaseBreakdown: [],
              avgConfidence: 0,
            },
          }))
        );
      } catch (err) {
        console.error('Failed to poll streaming reports:', err);
      }
    };

    poll();
    const interval = setInterval(poll, REPORT_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const allReports = [...serverReports, ...streamingReports].reduce<StreamingReport[]>((acc, r) => {
    if (!acc.find(e => e.id === r.id)) acc.push(r);
    return acc;
  }, []);

  const filteredReports = statusFilter === 'all'
    ? allReports
    : allReports.filter(r => (r as any).status === statusFilter);

  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="font-heading font-semibold text-lg text-foreground">
        Streaming Reports
      </h2>

      <ReportFilterPanel
        activeFilter={statusFilter}
        onApply={setStatusFilter}
        totalCount={filteredReports.length}
      />

      {filteredReports.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={statusFilter === 'all' ? 'No Streaming Reports Yet' : `No "${statusFilter}" reports`}
          description={statusFilter === 'all'
            ? 'Generate reports from your streaming sessions to see aggregated disease detection data here.'
            : 'Try changing the filter to see other reports.'}
        />
      ) : (
        <div className="grid gap-4">
          {filteredReports.map(report => (
            <StreamingReportCard
              key={report.id}
              report={report}
              onClick={() => setSelectedReport(report)}
            />
          ))}
        </div>
      )}

      <StreamingReportDetail
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
