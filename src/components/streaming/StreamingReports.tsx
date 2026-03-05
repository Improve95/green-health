import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { StreamingReportCard } from './StreamingReportCard';
import { StreamingReportDetail } from './StreamingReportDetail';
import { fetchReports } from '@/services/api';
import { REPORT_POLL_INTERVAL } from '@/config/api';
import type { StreamingReport } from '@/types/app';

export function StreamingReports() {
  const { streamingReports } = useApp();
  const [selectedReport, setSelectedReport] = useState<StreamingReport | null>(null);
  const [serverReports, setServerReports] = useState<StreamingReport[]>([]);

  // Poll server for reports
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetchReports('streaming');
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
  }, []);

  // Combine local and server reports, deduplicate by id
  const allReports = [...serverReports, ...streamingReports].reduce<StreamingReport[]>((acc, r) => {
    if (!acc.find(e => e.id === r.id)) acc.push(r);
    return acc;
  }, []);

  if (allReports.length === 0) {
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
          {allReports.length} report{allReports.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid gap-4">
        {allReports.map(report => (
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
