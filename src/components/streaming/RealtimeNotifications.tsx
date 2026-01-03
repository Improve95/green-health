import { AlertTriangle, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { StreamingDetection } from '@/types/app';

interface RealtimeNotificationsProps {
  detections: StreamingDetection[];
}

export function RealtimeNotifications({ detections }: RealtimeNotificationsProps) {
  if (detections.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Real-time Detections
        </h3>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No detections yet. Start a streaming source to begin monitoring.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-warning" />
        Real-time Detections
        <span className="ml-auto text-xs text-muted-foreground">
          {detections.length} alert{detections.length !== 1 ? 's' : ''}
        </span>
      </h3>
      
      <ScrollArea className="h-[300px]">
        <div className="space-y-2 pr-4">
          {detections.map((detection) => (
            <div
              key={detection.id}
              className={cn(
                'p-3 rounded-lg border animate-fade-in',
                detection.confidence >= 90 
                  ? 'bg-destructive/5 border-destructive/30'
                  : detection.confidence >= 70
                  ? 'bg-warning/5 border-warning/30'
                  : 'bg-muted/50 border-border'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    {detection.disease}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {detection.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
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
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
