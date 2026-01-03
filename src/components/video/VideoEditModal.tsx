import { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Scissors, Sun, Contrast } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { VideoFile } from '@/types/app';

interface VideoEditModalProps {
  video: VideoFile | null;
  open: boolean;
  onClose: () => void;
  onApply: (updates: Partial<VideoFile>) => void;
}

export function VideoEditModal({ video, open, onClose, onApply }: VideoEditModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);

  useEffect(() => {
    if (video) {
      setBrightness(100);
      setContrast(100);
      setTrimStart(0);
      setTrimEnd(100);
    }
  }, [video]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleTimeUpdate = () => setCurrentTime(videoEl.currentTime);
    const handleLoadedMetadata = () => setDuration(videoEl.duration);
    const handleEnded = () => setIsPlaying(false);

    videoEl.addEventListener('timeupdate', handleTimeUpdate);
    videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoEl.addEventListener('ended', handleEnded);

    return () => {
      videoEl.removeEventListener('timeupdate', handleTimeUpdate);
      videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoEl.removeEventListener('ended', handleEnded);
    };
  }, [video]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setTrimStart(0);
    setTrimEnd(100);
  };

  const handleApply = () => {
    onApply({});
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            Edit Video
            <span className="text-sm font-normal text-muted-foreground">
              {video.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-[1fr,280px] gap-6">
          {/* Video preview */}
          <div className="space-y-4">
            <div className="relative bg-muted rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={video.preview}
                className="w-full aspect-video object-contain"
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`
                }}
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
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <Slider
                value={[duration ? (currentTime / duration) * 100 : 0]}
                onValueChange={([value]) => {
                  if (videoRef.current && duration) {
                    videoRef.current.currentTime = (value / 100) * duration;
                  }
                }}
                max={100}
                step={0.1}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Trim controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Trim Video</Label>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Start</span>
                    <span>{formatTime((trimStart / 100) * duration)}</span>
                  </div>
                  <Slider
                    value={[trimStart]}
                    onValueChange={([value]) => setTrimStart(value)}
                    max={trimEnd - 1}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>End</span>
                    <span>{formatTime((trimEnd / 100) * duration)}</span>
                  </div>
                  <Slider
                    value={[trimEnd]}
                    onValueChange={([value]) => setTrimEnd(value)}
                    min={trimStart + 1}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </div>

            {/* Brightness */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Brightness</Label>
                <span className="ml-auto text-xs text-muted-foreground">{brightness}%</span>
              </div>
              <Slider
                value={[brightness]}
                onValueChange={([value]) => setBrightness(value)}
                min={50}
                max={150}
                step={1}
              />
            </div>

            {/* Contrast */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Contrast className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Contrast</Label>
                <span className="ml-auto text-xs text-muted-foreground">{contrast}%</span>
              </div>
              <Slider
                value={[contrast]}
                onValueChange={([value]) => setContrast(value)}
                min={50}
                max={150}
                step={1}
              />
            </div>

            {/* Reset button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Adjustments
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
