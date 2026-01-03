import { useState, useRef } from 'react';
import { X, Play, Pause, Clock, AlertTriangle, Leaf, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { VideoReport, AnalyzedFrame } from '@/types/app';

interface VideoReportDetailProps {
  report: VideoReport | null;
  open: boolean;
  onClose: () => void;
}

export function VideoReportDetail({ report, open, onClose }: VideoReportDetailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<AnalyzedFrame | null>(null);

  if (!report) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const jumpToFrame = (frame: AnalyzedFrame) => {
    setSelectedFrame(frame);
    if (videoRef.current) {
      videoRef.current.currentTime = frame.timestamp;
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentFrameIndex = selectedFrame 
    ? report.analyzedFrames.findIndex(f => f.id === selectedFrame.id)
    : -1;

  const goToPrevFrame = () => {
    if (currentFrameIndex > 0) {
      jumpToFrame(report.analyzedFrames[currentFrameIndex - 1]);
    }
  };

  const goToNextFrame = () => {
    if (currentFrameIndex < report.analyzedFrames.length - 1) {
      jumpToFrame(report.analyzedFrames[currentFrameIndex + 1]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-heading flex items-center gap-2">
            Video Analysis Report
            <span className="text-sm font-normal text-muted-foreground">
              {report.videoName}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-[1fr,380px] divide-x divide-border">
          {/* Video player */}
          <div className="p-6 space-y-4">
            <div className="relative bg-muted rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={report.videoUrl}
                className="w-full aspect-video object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Play button overlay */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-foreground/10 hover:bg-foreground/20 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-card/90 flex items-center justify-center">
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-foreground" />
                  ) : (
                    <Play className="w-6 h-6 text-foreground ml-1" />
                  )}
                </div>
              </button>

              {/* Selected frame overlay */}
              {selectedFrame && selectedFrame.detections[0]?.boundingBox && (
                <div 
                  className="absolute border-2 border-destructive bg-destructive/10 rounded"
                  style={{
                    left: `${selectedFrame.detections[0].boundingBox.x * 100}%`,
                    top: `${selectedFrame.detections[0].boundingBox.y * 100}%`,
                    width: `${selectedFrame.detections[0].boundingBox.width * 100}%`,
                    height: `${selectedFrame.detections[0].boundingBox.height * 100}%`,
                  }}
                />
              )}
            </div>

            {/* Frame thumbnails */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Analyzed Frames ({report.analyzedFrames.length})
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {report.analyzedFrames.map((frame, index) => (
                  <button
                    key={frame.id}
                    onClick={() => jumpToFrame(frame)}
                    className={cn(
                      'flex-shrink-0 w-24 rounded-lg overflow-hidden border-2 transition-all',
                      selectedFrame?.id === frame.id
                        ? 'border-primary shadow-lg'
                        : 'border-transparent hover:border-border'
                    )}
                  >
                    <div className="aspect-video bg-muted relative">
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                        Frame {index + 1}
                      </div>
                      <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded bg-foreground/80 text-background text-[10px]">
                        {formatTime(frame.timestamp)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Frame details */}
          <ScrollArea className="h-[70vh]">
            <div className="p-6 space-y-6">
              {selectedFrame ? (
                <>
                  {/* Frame navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPrevFrame}
                      disabled={currentFrameIndex <= 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Prev
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Frame {currentFrameIndex + 1} of {report.analyzedFrames.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextFrame}
                      disabled={currentFrameIndex >= report.analyzedFrames.length - 1}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {/* Frame info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Timestamp: {formatTime(selectedFrame.timestamp)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Leaf className="w-4 h-4 text-primary" />
                          <span className="text-xs text-muted-foreground">Plant Species</span>
                        </div>
                        <p className="font-medium text-foreground">{selectedFrame.plantSpecies}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="text-xs text-muted-foreground">Affected Part</span>
                        </div>
                        <p className="font-medium text-foreground">{selectedFrame.affectedPart}</p>
                      </div>
                    </div>

                    {selectedFrame.detections.map(detection => (
                      <div key={detection.id} className="space-y-4">
                        {/* Disease detection */}
                        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            <span className="font-semibold text-foreground">{detection.disease}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-destructive rounded-full"
                                style={{ width: `${detection.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {detection.confidence}%
                            </span>
                          </div>
                        </div>

                        {/* Symptoms */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Symptoms</h4>
                          <ul className="space-y-1">
                            {detection.symptoms.map((symptom, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                                {symptom}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Recommendations */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {detection.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Select a frame to view detection details
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

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
