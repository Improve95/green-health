import { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Clock, AlertTriangle, Leaf, Target, ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const isSeekingRef = useRef(false);
  const [selectedFrame, setSelectedFrame] = useState<AnalyzedFrame | null>(null);
  const FRAME_DURATION = 1 / 30;

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleTimeUpdate = () => {
      if (!isSeekingRef.current) setCurrentTime(videoEl.currentTime);
    };
    const handleLoadedMetadata = () => setDuration(videoEl.duration);
    const handleEnded = () => setIsPlaying(false);

    videoEl.addEventListener('timeupdate', handleTimeUpdate);
    videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoEl.addEventListener('ended', handleEnded);

    // Race condition fix: if metadata already loaded before listener was attached
    if (videoEl.readyState >= 1) {
      setDuration(videoEl.duration);
    }

    return () => {
      videoEl.removeEventListener('timeupdate', handleTimeUpdate);
      videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoEl.removeEventListener('ended', handleEnded);
    };
  }, [report]);

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

  const seekTo = (time: number) => {
    if (!videoRef.current || !duration) return;
    const clamped = Math.max(0, Math.min(duration, time));
    videoRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const stepFrame = (direction: 1 | -1) => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    seekTo(videoRef.current.currentTime + direction * FRAME_DURATION);
  };

  const jumpToFrame = (frame: AnalyzedFrame) => {
    setSelectedFrame(frame);
    if (videoRef.current) {
      videoRef.current.currentTime = frame.timestamp;
      videoRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(frame.timestamp);
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
                onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
                onTimeUpdate={(e) => {
                  if (!isSeekingRef.current)
                    setCurrentTime((e.target as HTMLVideoElement).currentTime);
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Play button overlay */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 hover:bg-black/10 transition-colors duration-200"
              >
                <div
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full pointer-events-none transition-opacity duration-200"
                  style={{ opacity: isPlaying ? 0 : 0.35, background: 'rgb(0 0 0 / 0.3)' }}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white ml-0.5" />
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

            {/* Timeline slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <Slider
                value={[duration ? (currentTime / duration) * 100 : 0]}
                onValueChange={([value]) => {
                  isSeekingRef.current = true;
                  if (videoRef.current && duration) {
                    const newTime = (value / 100) * duration;
                    videoRef.current.currentTime = newTime;
                    setCurrentTime(newTime);
                  }
                }}
                onValueCommit={() => { isSeekingRef.current = false; }}
                max={100}
                step={0.1}
              />
              {/* Frame-by-frame controls */}
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => stepFrame(-1)}>
                  <SkipBack className="w-4 h-4 mr-1" />
                  Frame
                </Button>
                <Button variant="outline" size="sm" onClick={togglePlay}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => stepFrame(1)}>
                  Frame
                  <SkipForward className="w-4 h-4 ml-1" />
                </Button>
              </div>
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
                        Frame {frame.frameNumber ?? index + 1}
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