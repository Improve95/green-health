import { useState, useEffect } from 'react';
import { FileVideo, Filter } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { VideoReportCard } from './VideoReportCard';
import { VideoReportDetail } from './VideoReportDetail';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchReports } from '@/services/api';
import { REPORT_POLL_INTERVAL, USE_REAL_BACKEND } from '@/config/api';
import type { VideoReport } from '@/types/app';
import type { ReportStatus } from '@/types/api';

export function VideoReports() {
  const { videoReports } = useApp();
  const [selectedReport, setSelectedReport] = useState<VideoReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [serverReports, setServerReports] = useState<VideoReport[]>([]);

  // Poll server for reports
  useEffect(() => {
    if (!USE_REAL_BACKEND) return;

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

  const allReports = USE_REAL_BACKEND
    ? [...serverReports, ...videoReports].reduce<VideoReport[]>((acc, r) => {
        if (!acc.find(e => e.id === r.id)) acc.push(r);
        return acc;
      }, [])
    : videoReports;

  const filteredReports = statusFilter === 'all'
    ? allReports
    : allReports.filter(r => r.status === statusFilter);

  if (filteredReports.length === 0 && statusFilter === 'all') {
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
          <VideoReportCard
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

      <VideoReportDetail
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
