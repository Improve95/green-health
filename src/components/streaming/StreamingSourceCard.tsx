import { useState, useRef, useEffect } from 'react';
import { Monitor, Camera, RotateCcw, FileText, X, Play, Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { StreamingSource } from '@/types/app';
import { VideoEditModal } from '@/components/video/VideoEditModal';

interface StreamingSourceCardProps {
  source: StreamingSource;
  onRemove: () => void;
  onResetReport: () => void;
  onGenerateReport: () => void;
}

export function StreamingSourceCard({ 
  source, 
  onRemove, 
  onResetReport, 
  onGenerateReport 
}: StreamingSourceCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editorFrame, setEditorFrame] = useState<string | null>(null);
  const [editorFrameSize, setEditorFrameSize] = useState<{ w: number; h: number } | null>(null);

  const captureFrame = (video: HTMLVideoElement | null) => {
    if (!video) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return { src: canvas.toDataURL('image/png'), size: { w: canvas.width, h: canvas.height } };
  };

  const openStoppedFrameEditor = () => {
    const frame = captureFrame(videoRef.current);
    if (!frame) return;
    setEditorFrame(frame.src);
    setEditorFrameSize(frame.size);
    setShowEditor(true);
  };

  useEffect(() => {
    if (videoRef.current && source.stream) {
      videoRef.current.srcObject = source.stream;
    }
  }, [source.stream]);

  return (
    <>
      <div 
        className={cn(
          'bg-card rounded-xl border border-border overflow-hidden',
          'transition-all duration-200 hover:shadow-elevated hover:border-primary/30'
        )}
      >
        {/* Preview thumbnail */}
        <div 
          className="aspect-video bg-muted relative cursor-pointer"
          onClick={() => setShowPreview(true)}
        >
          {source.stream ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {source.type === 'screen' ? (
                <Monitor className="w-12 h-12 text-muted-foreground" />
              ) : (
                <Camera className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
          )}

          {/* Live indicator */}
          {source.isActive && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              В ЭФИРЕ
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 bg-foreground/0 hover:bg-foreground/20 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-card/90 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Play className="w-5 h-5 text-foreground ml-0.5" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {source.type === 'screen' ? (
                  <Monitor className="w-4 h-4 text-primary" />
                ) : (
                  <Camera className="w-4 h-4 text-primary" />
                )}
                <h3 className="font-medium text-foreground">{source.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Запущено в {source.createdAt.toLocaleTimeString('ru-RU')}
              </p>
            </div>
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Удалить источник"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onResetReport}
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Сбросить
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={onGenerateReport}
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Отчёт
            </Button>
          </div>
        </div>
      </div>

      {/* Full preview modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {source.type === 'screen' ? (
                <Monitor className="w-5 h-5" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
              {source.name}
              {source.isActive && (
                <span className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  В ЭФИРЕ
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {source.stream ? (
                <video
                  autoPlay
                  muted
                  playsInline
                  ref={(el) => {
                    if (el && source.stream) {
                      el.srcObject = source.stream;
                    }
                  }}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Трансляция недоступна</p>
                </div>
              )}
            </div>
            
            {/* Screenshot button */}
            <Button onClick={openStoppedFrameEditor} className="w-full">
              <Crop className="w-4 h-4 mr-2" />
              Остановить кадр и открыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <VideoEditModal
        video={null}
        stream={null}
        titleOverride={source.name}
        open={showEditor}
        onClose={() => setShowEditor(false)}
        onSubmit={() => setShowEditor(false)}
        onApply={() => setShowEditor(false)}
        initialCapturedFrame={editorFrame}
        initialCapturedFrameSize={editorFrameSize}
      />
    </>
  );
}
