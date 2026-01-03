import { FileVideo, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VideoReport } from '@/types/app';

interface VideoReportCardProps {
  report: VideoReport;
  onClick: () => void;
}

export function VideoReportCard({ report, onClick }: VideoReportCardProps) {
  const primaryDetection = report.analyzedFrames[0]?.detections[0];
  const avgConfidence = report.analyzedFrames.length > 0
    ? Math.round(
        report.analyzedFrames.reduce((sum, frame) => 
          sum + (frame.detections[0]?.confidence || 0), 0
        ) / report.analyzedFrames.length
      )
    : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        {/* Thumbnail */}
        <div className="w-32 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
          <video
            src={report.videoUrl}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-foreground/80 text-background text-xs font-medium">
            {formatDuration(report.duration)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-foreground truncate">
                {report.videoName}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {report.createdAt.toLocaleDateString()} at {report.createdAt.toLocaleTimeString()}
              </p>
            </div>
            
            {/* Status badge */}
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium flex-shrink-0',
              report.status === 'completed' && 'bg-primary/10 text-primary',
              report.status === 'analyzing' && 'bg-warning/10 text-warning',
              report.status === 'error' && 'bg-destructive/10 text-destructive'
            )}>
              {report.status === 'completed' ? 'Completed' : 
               report.status === 'analyzing' ? 'Analyzing...' : 'Error'}
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <FileVideo className="w-4 h-4" />
              <span>{report.analyzedFrames.length} frames analyzed</span>
            </div>
            
            {primaryDetection && (
              <>
                <div className="flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-foreground font-medium">
                    {primaryDetection.disease}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Avg. {avgConfidence}% confidence
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
