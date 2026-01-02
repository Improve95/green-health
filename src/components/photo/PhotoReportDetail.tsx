import { X, AlertTriangle, Leaf, Target, Activity, Lightbulb } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { PhotoReport } from '@/types/app';

interface PhotoReportDetailProps {
  report: PhotoReport | null;
  open: boolean;
  onClose: () => void;
}

export function PhotoReportDetail({ report, open, onClose }: PhotoReportDetailProps) {
  if (!report) return null;

  const mainDetection = report.detections[0];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-heading">Analysis Report</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image with overlay */}
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-muted">
                <img
                  src={report.imageUrl}
                  alt={report.imageName}
                  className="w-full aspect-square object-cover"
                />
                
                {/* Bounding box overlay */}
                {mainDetection?.boundingBox && (
                  <div 
                    className="absolute border-2 border-destructive rounded"
                    style={{
                      left: `${mainDetection.boundingBox.x * 100}%`,
                      top: `${mainDetection.boundingBox.y * 100}%`,
                      width: `${mainDetection.boundingBox.width * 100}%`,
                      height: `${mainDetection.boundingBox.height * 100}%`,
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded">
                      {mainDetection.disease}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="truncate">{report.imageName}</p>
                <p>{report.createdAt.toLocaleString()}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Detection summary */}
              {mainDetection && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <h3 className="font-heading font-semibold text-foreground">
                      Disease Detected
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-foreground">
                      {mainDetection.disease}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-lg font-bold',
                        mainDetection.confidence >= 80 ? 'border-destructive text-destructive' :
                        mainDetection.confidence >= 50 ? 'border-warning text-warning' :
                        'border-success text-success'
                      )}
                    >
                      {mainDetection.confidence}%
                    </Badge>
                  </div>
                </div>
              )}

              {/* Plant info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Leaf className="w-4 h-4" />
                    <span className="text-xs">Plant Species</span>
                  </div>
                  <p className="font-medium text-foreground">{report.plantSpecies}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs">Affected Part</span>
                  </div>
                  <p className="font-medium text-foreground">{report.affectedPart}</p>
                </div>
              </div>

              <Separator />

              {/* Symptoms */}
              {mainDetection && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-medium text-foreground">Symptoms</h4>
                  </div>
                  <ul className="space-y-2">
                    {mainDetection.symptoms.map((symptom, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {mainDetection && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-medium text-foreground">Recommendations</h4>
                  </div>
                  <ul className="space-y-2">
                    {mainDetection.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 p-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
