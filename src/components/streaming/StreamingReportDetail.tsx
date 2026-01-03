import { X, Radio, Clock, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { StreamingReport } from '@/types/app';

interface StreamingReportDetailProps {
  report: StreamingReport | null;
  open: boolean;
  onClose: () => void;
}

export function StreamingReportDetail({ report, open, onClose }: StreamingReportDetailProps) {
  if (!report) return null;

  const sortedDiseases = [...report.aggregatedStats.diseaseBreakdown].sort((a, b) => b.count - a.count);
  const maxCount = sortedDiseases[0]?.count || 1;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-heading flex items-center gap-2">
            <Radio className="w-5 h-5" />
            Streaming Report
            <span className="text-sm font-normal text-muted-foreground">
              {report.sourceName}
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <BarChart3 className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {report.aggregatedStats.totalDetections}
                </p>
                <p className="text-sm text-muted-foreground">Total Detections</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {report.aggregatedStats.avgConfidence}%
                </p>
                <p className="text-sm text-muted-foreground">Avg. Confidence</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <AlertTriangle className="w-6 h-6 text-warning mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {sortedDiseases.length}
                </p>
                <p className="text-sm text-muted-foreground">Disease Types</p>
              </div>
            </div>

            {/* Time range */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {report.startTime.toLocaleDateString()} {report.startTime.toLocaleTimeString()} 
                {' — '}
                {report.endTime.toLocaleDateString()} {report.endTime.toLocaleTimeString()}
              </span>
            </div>

            {/* Disease breakdown */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Disease Breakdown</h3>
              <div className="space-y-3">
                {sortedDiseases.map(({ disease, count }) => (
                  <div key={disease} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{disease}</span>
                      <span className="text-muted-foreground">{count} detection{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detection timeline */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Detection Timeline</h3>
              <div className="space-y-2">
                {report.detections.slice(0, 20).map((detection) => (
                  <div
                    key={detection.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border',
                      detection.confidence >= 90 
                        ? 'bg-destructive/5 border-destructive/20'
                        : detection.confidence >= 70
                        ? 'bg-warning/5 border-warning/20'
                        : 'bg-muted/50 border-border'
                    )}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        {detection.disease}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {detection.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      detection.confidence >= 90 
                        ? 'bg-destructive/10 text-destructive'
                        : detection.confidence >= 70
                        ? 'bg-warning/10 text-warning'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {detection.confidence}%
                    </div>
                  </div>
                ))}
                {report.detections.length > 20 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    + {report.detections.length - 20} more detections
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
