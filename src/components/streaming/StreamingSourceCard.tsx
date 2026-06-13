import { useState, useRef, useEffect } from 'react';
import { Monitor, Camera, RotateCcw, FileText, X, Play, Camera as CameraIcon, Pause, Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { submitPhotoAnalysis } from '@/services/api';
import type { StreamingSource } from '@/types/app';
import type { PhotoAnalysisRequestImage } from '@/types/api';
import { FrameEditorModal } from '@/components/shared/FrameEditorModal';

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
  const { addPhotoReport, setViewMode } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullVideoRef = useRef<HTMLVideoElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showFrameEditor, setShowFrameEditor] = useState(false);
  const [pausedFrame, setPausedFrame] = useState<string | null>(null);
  const [pausedFrameSize, setPausedFrameSize] = useState<{ w: number; h: number } | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isSendingFrame, setIsSendingFrame] = useState(false);

  const takeScreenshot = () => {
    const video = fullVideoRef.current;
    if (!video) return;

    // Create a canvas to draw the video frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Draw the current video frame
    ctx.drawImage(video, 0, 0);

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `screenshot-${source.name}-${new Date().getTime()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const captureCurrentFrame = () => {
    const video = fullVideoRef.current;
    if (!video) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    return {
      src: canvas.toDataURL('image/png'),
      size: { w: canvas.width, h: canvas.height },
    };
  };

  const togglePausePreview = () => {
    const video = fullVideoRef.current;
    if (!video) return;

    if (isPaused) {
      video.play();
      setIsPaused(false);
      return;
    }

    video.pause();
    setIsPaused(true);
    const frame = captureCurrentFrame();
    if (frame) {
      setPausedFrame(frame.src);
      setPausedFrameSize(frame.size);
    }
  };

  const openFrameEditor = () => {
    const video = fullVideoRef.current;
    if (!video) return;
    video.pause();
    setIsPaused(true);
    const frame = captureCurrentFrame();
    if (frame) {
      setPausedFrame(frame.src);
      setPausedFrameSize(frame.size);
    }
    setShowFrameEditor(true);
  };

  const stripDataUrl = (dataUrl: string) => dataUrl.split(',')[1] || dataUrl;

  const handleSendFrameToAnalysis = async () => {
    if (!pausedFrame) return;

    setIsSendingFrame(true);
    try {
      const image: PhotoAnalysisRequestImage = {
        data: stripDataUrl(pausedFrame),
        fileName: `${source.name}-frame.png`,
        mimeType: 'image/png',
        settings: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
        },
      };

      const response = await submitPhotoAnalysis({
        reportName: `Кадр трансляции — ${source.name}`,
        images: [image],
      });

      const result = response.results[0];
      const detections = result
        ? result.diseases.map(d => ({
            id: crypto.randomUUID(),
            disease: d.disease,
            confidence: d.probability,
            boundingBox: undefined,
            symptoms: d.symptoms,
            recommendations: [
              'Примените соответствующее лечение',
              'Следите за состоянием растения',
              'Обратитесь к агроному, если симптомы сохраняются',
            ],
          }))
        : [];

      addPhotoReport({
        id: response.reportId,
        createdAt: new Date(),
        imageUrl: pausedFrame,
        imageName: source.name,
        plantSpecies: result?.diseases[0]?.plantPart || 'Неизвестно',
        affectedPart: result?.diseases[0]?.plantPart || 'Неизвестно',
        detections,
        status: response.status,
      });

      setViewMode('report');
      setShowFrameEditor(false);
    } catch (err) {
      console.error('Frame analysis failed:', err);
    } finally {
      setIsSendingFrame(false);
    }
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
                      fullVideoRef.current = el;
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
            <Button 
              onClick={takeScreenshot}
              className="w-full"
              variant="outline"
            >
              <CameraIcon className="w-4 h-4 mr-2" />
              Сделать снимок экрана
            </Button>
            <Button
              onClick={togglePausePreview}
              className="w-full"
              variant="outline"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Продолжить поток
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Пауза потока
                </>
              )}
            </Button>
            <Button
              onClick={openFrameEditor}
              className="w-full"
            >
              <Crop className="w-4 h-4 mr-2" />
              Открыть кадр в редакторе
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFrameEditor} onOpenChange={setShowFrameEditor}>
        <DialogContent className="w-[96vw] max-w-[96vw] h-[96vh] overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crop className="w-5 h-5" />
              Редактор кадра потока
            </DialogTitle>
          </DialogHeader>

          <FrameEditorModal
            title={source.name}
            imageSrc={pausedFrame}
            imageSize={pausedFrameSize}
            onClose={() => setShowFrameEditor(false)}
            onSendToAnalysis={handleSendFrameToAnalysis}
            isAnalyzing={isSendingFrame}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
