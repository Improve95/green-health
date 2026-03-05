import { useState, useEffect } from 'react';
import { Activity, Filter } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { StreamingReportCard } from './StreamingReportCard';
import { StreamingReportDetail } from './StreamingReportDetail';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchReports } from '@/services/api';
import { REPORT_POLL_INTERVAL } from '@/config/api';
import type { StreamingReport } from '@/types/app';
import type { ReportStatus } from '@/types/api';

export function StreamingReports() {
  const { streamingReports } = useApp();
  const [selectedReport, setSelectedReport] = useState<StreamingReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [serverReports, setServerReports] = useState<StreamingReport[]>([]);

  // Poll server for reports
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

  if (filteredReports.length === 0 && statusFilter === 'all') {
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ReportStatus | 'all')}
            >
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="analyzing">Analyzing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredReports.map(report => (
          <StreamingReportCard
            key={report.id}
            report={report}
            onClick={() => setSelectedReport(report)}
          />
        ))}
      </div>

      {filteredReports.length === 0 && statusFilter !== 'all' && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No reports with status "{statusFilter}"
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
