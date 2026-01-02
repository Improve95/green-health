import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PhotoReport } from '@/types/app';
import { Badge } from '@/components/ui/badge';

interface PhotoReportCardProps {
  report: PhotoReport;
  onClick: () => void;
}

export function PhotoReportCard({ report, onClick }: PhotoReportCardProps) {
  const mainDetection = report.detections[0];
  const confidenceColor = mainDetection?.confidence >= 80 
    ? 'text-destructive' 
    : mainDetection?.confidence >= 50 
      ? 'text-warning' 
      : 'text-success';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left bg-card rounded-xl border border-border overflow-hidden',
        'transition-all duration-200 hover:shadow-elevated hover:border-primary/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'animate-fade-in'
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="sm:w-40 h-32 sm:h-auto bg-muted flex-shrink-0 relative">
          <img
            src={report.imageUrl}
            alt={report.imageName}
            className="w-full h-full object-cover"
          />
          {/* Disease indicator overlay */}
          {report.detections.length > 0 && (
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-medium text-foreground truncate max-w-[200px]">
                {report.imageName}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                {report.createdAt.toLocaleDateString()} at {report.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <Badge variant={report.status === 'completed' ? 'default' : 'secondary'} className="flex-shrink-0">
              {report.status === 'completed' ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              {report.status}
            </Badge>
          </div>

          {mainDetection && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {mainDetection.disease}
                </span>
                <span className={cn('text-sm font-semibold', confidenceColor)}>
                  {mainDetection.confidence}%
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-muted">
                  {report.plantSpecies}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-muted">
                  {report.affectedPart}
                </span>
              </div>
            </div>
          )}

          {report.detections.length === 0 && (
            <p className="text-sm text-success flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              No disease detected
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
