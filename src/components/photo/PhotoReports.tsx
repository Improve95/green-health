import { useState, useEffect, useCallback } from 'react';
import { FileImage, Filter } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { PhotoReportCard } from './PhotoReportCard';
import { PhotoReportDetail } from './PhotoReportDetail';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchReports } from '@/services/api';
import { REPORT_POLL_INTERVAL } from '@/config/api';
import { USE_REAL_BACKEND } from '@/config/api';
import type { PhotoReport } from '@/types/app';
import type { ReportStatus } from '@/types/api';

export function PhotoReports() {
  const { photoReports } = useApp();
  const [selectedReport, setSelectedReport] = useState<PhotoReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [serverReports, setServerReports] = useState<PhotoReport[]>([]);

  // Poll server for reports
  useEffect(() => {
    if (!USE_REAL_BACKEND) return;

    const poll = async () => {
      try {
        const status = statusFilter === 'all' ? undefined : statusFilter;
        const res = await fetchReports('photo', status);
        // Map server reports to local format
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

  // Combine local and server reports, deduplicate by id
  const allReports = USE_REAL_BACKEND
    ? [...serverReports, ...photoReports].reduce<PhotoReport[]>((acc, r) => {
        if (!acc.find(e => e.id === r.id)) acc.push(r);
        return acc;
      }, [])
    : photoReports;

  // Apply local status filter
  const filteredReports = statusFilter === 'all'
    ? allReports
    : allReports.filter(r => r.status === statusFilter);

  if (filteredReports.length === 0 && statusFilter === 'all') {
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
          <PhotoReportCard
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

      <PhotoReportDetail
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
