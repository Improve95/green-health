import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, RotateCcw, Scissors, Sun, Contrast,
  SkipBack, SkipForward, Crop, ZoomIn, ZoomOut, SlidersHorizontal, Droplets,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { VideoFile } from '@/types/app';

interface VideoEditModalProps {
  video: VideoFile | null;
  open: boolean;
  onClose: () => void;
  onApply: (updates: Partial<VideoFile>) => void;
}

interface SelectionRect {
  x: number; y: number; w: number; h: number;
}

export function VideoEditModal({ video, open, onClose, onApply }: VideoEditModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const isSeekingRef = useRef(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const FRAME_DURATION = 1 / 30;

  // Region selection
  const [selectionMode, setSelectionMode] = useState(false);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const isDrawingRef = useRef(false);
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);

  // Natural video dimensions (set after metadata loads)
  const [videoNaturalSize, setVideoNaturalSize] = useState<{ w: number; h: number } | null>(null);

  // Frame editor
  const [activeTab, setActiveTab] = useState('video');
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [capturedFrameSize, setCapturedFrameSize] = useState<{ w: number; h: number } | null>(null);
  const [frameZoom, setFrameZoom] = useState(100);
  const [frameBrightness, setFrameBrightness] = useState(100);
  const [frameContrast, setFrameContrast] = useState(100);
  const [frameSaturation, setFrameSaturation] = useState(100);
  const [frameHue, setFrameHue] = useState(0);

  useEffect(() => {
    if (video) {
      setBrightness(100);
      setContrast(100);
      setTrimStart(0);
      setTrimEnd(100);
      setSelectionMode(false);
      setSelection(null);
      setCapturedFrame(null);
      setCapturedFrameSize(null);
      setActiveTab('video');
      setVideoNaturalSize(null);
    }
  }, [video]);

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

    if (videoEl.readyState >= 1) setDuration(videoEl.duration);

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

  const seekTo = useCallback((time: number) => {
    if (!videoRef.current || !duration) return;
    const clamped = Math.max(0, Math.min(duration, time));
    videoRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  }, [duration]);

  const stepFrame = useCallback((direction: 1 | -1) => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    seekTo(videoRef.current.currentTime + direction * FRAME_DURATION);
  }, [seekTo]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ── Selection handlers ──────────────────────────────────────────────────────

  const getRelativeCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  };

  const handleSelectionMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const coords = getRelativeCoords(e);
    drawStartRef.current = coords;
    isDrawingRef.current = true;
    setSelection({ x: coords.x, y: coords.y, w: 0, h: 0 });
  };

  const handleSelectionMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current || !drawStartRef.current) return;
    const coords = getRelativeCoords(e);
    const start = drawStartRef.current;
    setSelection({
      x: Math.min(start.x, coords.x),
      y: Math.min(start.y, coords.y),
      w: Math.abs(coords.x - start.x),
      h: Math.abs(coords.y - start.y),
    });
  };

  const handleSelectionMouseUp = () => {
    isDrawingRef.current = false;
  };

  const enterSelectionMode = () => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setSelectionMode(true);
    setSelection(null);
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelection(null);
  };

  const captureFrameRegion = () => {
    const vid = videoRef.current;
    if (!vid || !selection || selection.w < 0.02 || selection.h < 0.02) return;

    const vw = vid.videoWidth || 640;
    const vh = vid.videoHeight || 360;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(selection.w * vw);
    canvas.height = Math.round(selection.h * vh);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      vid,
      selection.x * vw, selection.y * vh,
      selection.w * vw, selection.h * vh,
      0, 0, canvas.width, canvas.height,
    );

    setCapturedFrame(canvas.toDataURL('image/png'));
    setCapturedFrameSize({ w: canvas.width, h: canvas.height });
    setFrameZoom(100);
    setFrameBrightness(100);
    setFrameContrast(100);
    setFrameSaturation(100);
    setFrameHue(0);
    exitSelectionMode();
    setActiveTab('frame-editor');
  };

  // ── Video controls ──────────────────────────────────────────────────────────

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setTrimStart(0);
    setTrimEnd(100);
  };

  const resetFrameEditor = () => {
    setFrameZoom(100);
    setFrameBrightness(100);
    setFrameContrast(100);
    setFrameSaturation(100);
    setFrameHue(0);
  };

  const handleApply = () => {
    onApply({});
    onClose();
  };

  const hasValidSelection = selection && selection.w > 0.02 && selection.h > 0.02;

  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="w-[96vw] max-w-[96vw] h-[96vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            Edit Video
            <span className="text-sm font-normal text-muted-foreground">{video.name}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="video" className="flex-1">Video</TabsTrigger>
            <TabsTrigger value="frame-editor" className="flex-1 gap-2">
              <Crop className="w-4 h-4" />
              Frame Editor
              {capturedFrame && (
                <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── VIDEO TAB ──────────────────────────────────────────────────── */}
          <TabsContent value="video">
            <div className="grid lg:grid-cols-[1fr,280px] gap-6">
              {/* Left: video + controls */}
              <div className="space-y-4">
                {/* Video container */}
                <div
                  className="relative bg-muted rounded-lg overflow-hidden mx-auto"
                  style={{
                    aspectRatio: videoNaturalSize
                      ? `${videoNaturalSize.w} / ${videoNaturalSize.h}`
                      : '16 / 9',
                    width: videoNaturalSize
                      ? `min(100%, calc((96vh - 370px) * ${videoNaturalSize.w} / ${videoNaturalSize.h}))`
                      : '100%',
                  }}
                >
                  <video
                    ref={videoRef}
                    src={video.preview}
                    className="w-full h-full object-contain"
                    style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                    onLoadedMetadata={(e) => {
                      const vid = e.target as HTMLVideoElement;
                      setDuration(vid.duration);
                      setVideoNaturalSize({ w: vid.videoWidth, h: vid.videoHeight });
                    }}
                    onTimeUpdate={(e) => {
                      if (!isSeekingRef.current)
                        setCurrentTime((e.target as HTMLVideoElement).currentTime);
                    }}
                  />

                  {/* Play overlay (hidden in selection mode) */}
                  {!selectionMode && (
                    <button
                      onClick={togglePlay}
                      className="absolute inset-0 hover:bg-black/10 transition-colors duration-200"
                    >
                      <div
                        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full pointer-events-none transition-opacity duration-200"
                        style={{ opacity: isPlaying ? 0 : 0.35, background: 'rgb(0 0 0 / 0.3)' }}
                      >
                        {isPlaying
                          ? <Pause className="w-4 h-4 text-white" />
                          : <Play className="w-4 h-4 text-white ml-0.5" />}
                      </div>
                    </button>
                  )}

                  {/* Selection overlay */}
                  {selectionMode && (
                    <div
                      className="absolute inset-0 cursor-crosshair select-none"
                      onMouseDown={handleSelectionMouseDown}
                      onMouseMove={handleSelectionMouseMove}
                      onMouseUp={handleSelectionMouseUp}
                      onMouseLeave={handleSelectionMouseUp}
                    >
                      {hasValidSelection ? (
                        <>
                          {/* Dark mask: top */}
                          <div className="absolute bg-black/50 left-0 right-0 top-0"
                            style={{ height: `${selection!.y * 100}%` }} />
                          {/* Dark mask: left */}
                          <div className="absolute bg-black/50 top-0 left-0"
                            style={{
                              top: `${selection!.y * 100}%`,
                              width: `${selection!.x * 100}%`,
                              height: `${selection!.h * 100}%`,
                            }} />
                          {/* Dark mask: right */}
                          <div className="absolute bg-black/50 top-0 right-0"
                            style={{
                              top: `${selection!.y * 100}%`,
                              left: `${(selection!.x + selection!.w) * 100}%`,
                              height: `${selection!.h * 100}%`,
                            }} />
                          {/* Dark mask: bottom */}
                          <div className="absolute bg-black/50 left-0 right-0 bottom-0"
                            style={{ top: `${(selection!.y + selection!.h) * 100}%` }} />

                          {/* Selection frame */}
                          <div
                            className="absolute border-2 border-white"
                            style={{
                              left: `${selection!.x * 100}%`,
                              top: `${selection!.y * 100}%`,
                              width: `${selection!.w * 100}%`,
                              height: `${selection!.h * 100}%`,
                            }}
                          >
                            {/* Corner handles */}
                            {(['tl', 'tr', 'bl', 'br'] as const).map(c => (
                              <div
                                key={c}
                                className="absolute w-3 h-3 bg-white border border-gray-300 rounded-sm"
                                style={{
                                  top: c.startsWith('t') ? -5 : 'auto',
                                  bottom: c.startsWith('b') ? -5 : 'auto',
                                  left: c.endsWith('l') ? -5 : 'auto',
                                  right: c.endsWith('r') ? -5 : 'auto',
                                }}
                              />
                            ))}

                            {/* Dimensions label */}
                            <div className="absolute -top-6 left-0 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                              {Math.round(selection!.w * 100)}% × {Math.round(selection!.h * 100)}%
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Region selection toolbar */}
                <div className="flex items-center gap-2">
                  {!selectionMode ? (
                    <Button variant="outline" size="sm" onClick={enterSelectionMode}>
                      <Crop className="w-4 h-4 mr-1.5" />
                      Select Region
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={exitSelectionMode}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={!hasValidSelection}
                        onClick={captureFrameRegion}
                      >
                        <Crop className="w-4 h-4 mr-1.5" />
                        Capture &amp; Edit
                      </Button>
                      {!hasValidSelection && (
                        <span className="text-xs text-muted-foreground">
                          Drag on the frame to select a region
                        </span>
                      )}
                    </>
                  )}
                  {capturedFrame && !selectionMode && (
                    <span className="text-xs text-muted-foreground ml-1">
                      Region captured — see Frame Editor tab
                    </span>
                  )}
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
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => stepFrame(-1)}>
                      <SkipBack className="w-4 h-4 mr-1" />Frame
                    </Button>
                    <Button variant="outline" size="sm" onClick={togglePlay}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => stepFrame(1)}>
                      Frame<SkipForward className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right: adjustments */}
              <div className="space-y-6">
                {/* Trim */}
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
                      <Slider value={[trimStart]} onValueChange={([v]) => setTrimStart(v)} max={trimEnd - 1} step={1} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>End</span>
                        <span>{formatTime((trimEnd / 100) * duration)}</span>
                      </div>
                      <Slider value={[trimEnd]} onValueChange={([v]) => setTrimEnd(v)} min={trimStart + 1} max={100} step={1} />
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
                  <Slider value={[brightness]} onValueChange={([v]) => setBrightness(v)} min={50} max={150} step={1} />
                </div>

                {/* Contrast */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Contrast className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Contrast</Label>
                    <span className="ml-auto text-xs text-muted-foreground">{contrast}%</span>
                  </div>
                  <Slider value={[contrast]} onValueChange={([v]) => setContrast(v)} min={50} max={150} step={1} />
                </div>

                <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Adjustments
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── FRAME EDITOR TAB ───────────────────────────────────────────── */}
          <TabsContent value="frame-editor">
            {capturedFrame ? (
              <div className="grid lg:grid-cols-[1fr,260px] gap-6">
                {/* Image viewer */}
                <div className="space-y-3">
                  <div
                    className="bg-muted/60 rounded-lg overflow-auto border border-border mx-auto"
                    style={{
                      aspectRatio: capturedFrameSize
                        ? `${capturedFrameSize.w} / ${capturedFrameSize.h}`
                        : '16 / 9',
                      width: capturedFrameSize
                        ? `min(100%, calc((96vh - 200px) * ${capturedFrameSize.w} / ${capturedFrameSize.h}))`
                        : '100%',
                    }}
                  >
                    <img
                      src={capturedFrame}
                      alt="Captured frame region"
                      style={{
                        width: `${frameZoom}%`,
                        minWidth: frameZoom > 100 ? `${frameZoom}%` : '100%',
                        display: 'block',
                        filter: `brightness(${frameBrightness}%) contrast(${frameContrast}%) saturate(${frameSaturation}%) hue-rotate(${frameHue}deg)`,
                      }}
                    />
                  </div>

                  {/* Zoom bar */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setFrameZoom(v => Math.max(25, v - 25))}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Slider
                      value={[frameZoom]}
                      onValueChange={([v]) => setFrameZoom(v)}
                      min={25}
                      max={400}
                      step={5}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setFrameZoom(v => Math.min(400, v + 25))}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground w-10 text-right shrink-0">
                      {frameZoom}%
                    </span>
                  </div>
                </div>

                {/* Color controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      Color Levels
                    </Label>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={resetFrameEditor}>
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  </div>

                  {/* Brightness */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Sun className="w-3 h-3" /> Brightness
                      </span>
                      <span>{frameBrightness}%</span>
                    </div>
                    <Slider value={[frameBrightness]} onValueChange={([v]) => setFrameBrightness(v)} min={0} max={200} step={1} />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Contrast className="w-3 h-3" /> Contrast
                      </span>
                      <span>{frameContrast}%</span>
                    </div>
                    <Slider value={[frameContrast]} onValueChange={([v]) => setFrameContrast(v)} min={0} max={200} step={1} />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3 h-3" /> Saturation
                      </span>
                      <span>{frameSaturation}%</span>
                    </div>
                    <Slider value={[frameSaturation]} onValueChange={([v]) => setFrameSaturation(v)} min={0} max={200} step={1} />
                  </div>

                  {/* Hue rotation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Hue Rotation</span>
                      <span>{frameHue}°</span>
                    </div>
                    <Slider value={[frameHue]} onValueChange={([v]) => setFrameHue(v)} min={-180} max={180} step={1} />
                  </div>

                  <div className="pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setActiveTab('video');
                        enterSelectionMode();
                      }}
                    >
                      <Crop className="w-4 h-4 mr-2" />
                      New Selection
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
                <Crop className="w-14 h-14 opacity-25" />
                <div className="text-center">
                  <p className="font-medium text-foreground mb-1">No region captured yet</p>
                  <p className="text-sm">Select a region on a paused video frame to edit it here</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => { setActiveTab('video'); enterSelectionMode(); }}
                >
                  <Crop className="w-4 h-4 mr-2" />
                  Select Region
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApply}>Apply Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
