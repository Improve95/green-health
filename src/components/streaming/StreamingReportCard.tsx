import { Radio, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StreamingReport } from '@/types/app';

interface StreamingReportCardProps {
  report: StreamingReport;
  onClick: () => void;
}

export function StreamingReportCard({ report, onClick }: StreamingReportCardProps) {
  const topDisease = report.aggregatedStats.diseaseBreakdown.sort((a, b) => b.count - a.count)[0];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left bg-card rounded-xl border border-border p-4',
        'transition-all duration-200 hover:shadow-elevated hover:border-primary/30',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
      )}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Radio className="w-6 h-6 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-foreground">
                {report.sourceName}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {report.startTime.toLocaleDateString()} - {report.endTime.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">
                {report.aggregatedStats.totalDetections}
              </span>
              <span className="text-muted-foreground">detections</span>
            </div>

            {topDisease && (
              <div className="flex items-center gap-1.5 text-sm">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-foreground">
                  {topDisease.disease}
                </span>
                <span className="text-muted-foreground">
                  ({topDisease.count}x)
                </span>
              </div>
            )}

            <span className="text-sm text-muted-foreground">
              Avg. {report.aggregatedStats.avgConfidence}% confidence
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
