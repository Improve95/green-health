import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { FileUploadZone } from '@/components/shared/FileUploadZone';
import { VideoPreviewCard } from './VideoPreviewCard';
import { VideoEditModal } from './VideoEditModal';
import { AnalysisPanel } from '@/components/shared/AnalysisPanel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { uploadVideoForAnalysis, type VideoUploadProgress } from '@/services/videoUploader';
import type { VideoFile, VideoReport, AnalyzedFrame, DiseaseDetection } from '@/types/app';

export function VideoAnalysis() {
  const { uploadedVideos, addVideos, removeVideo, addVideoReport, setViewMode } = useApp();
  const [editingVideo, setEditingVideo] = useState<VideoFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frameRate, setFrameRate] = useState(1);
  const [reportName, setReportName] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, VideoUploadProgress>>({});

  const getDefaultReportName = () => {
    if (uploadedVideos.length === 1) {
      return `${uploadedVideos[0].name} - ${new Date().toLocaleString('ru-RU')}`;
    }
    return `Анализ видео — ${new Date().toLocaleString('ru-RU')}`;
  };

  const handleFilesSelected = useCallback((files: File[]) => {
    const videoFiles: VideoFile[] = files
      .filter(file => file.type.startsWith('video/'))
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        duration: undefined,
      }));
    
    videoFiles.forEach(video => {
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      videoEl.onloadedmetadata = () => {
        video.duration = videoEl.duration;
      };
      videoEl.src = video.preview;
    });

    addVideos(videoFiles);
  }, [addVideos]);

  const handleSubmitAnalysis = async () => {
    if (uploadedVideos.length === 0) return;

    setIsAnalyzing(true);

    try {
      const mockDiseases = ['Фитофтороз', 'Мучнистая роса', 'Корневая гниль', 'Бактериальная пятнистость', 'Мозаичный вирус'];
      const mockPlants = ['Огурец', 'Огурец', 'Огурец', 'Огурец', 'Огурец'];
      const mockParts = ['Лист', 'Стебель', 'Плод', 'Цветок'];

      for (const video of uploadedVideos) {
        const analysisId = await uploadVideoForAnalysis(
          video.file,
          frameRate,
          (progress) => {
            setUploadProgress(prev => ({ ...prev, [video.id]: progress }));
          }
        );

        // After upload, create local report (in real mode, this would come from polling)
        const numFrames = Math.floor(Math.random() * 5) + 3;
        const analyzedFrames: AnalyzedFrame[] = Array.from({ length: numFrames }, (_, i) => {
          const detection: DiseaseDetection = {
            id: crypto.randomUUID(),
            disease: mockDiseases[Math.floor(Math.random() * mockDiseases.length)],
            confidence: Math.floor(Math.random() * 30) + 70,
            boundingBox: {
              x: Math.random() * 0.3,
              y: Math.random() * 0.3,
              width: 0.3 + Math.random() * 0.3,
              height: 0.3 + Math.random() * 0.3,
            },
            symptoms: ['Жёлтые пятна на листьях', 'Увядшие края', 'Коричневое изменение цвета'],
            recommendations: ['Примените фунгицид', 'Улучшите дренаж', 'Удалите поражённые листья'],
          };

          return {
            id: crypto.randomUUID(),
            timestamp: (i + 1) * ((video.duration || 30) / (numFrames + 1)),
            frameNumber: i + 1,
            frameUrl: video.preview,
            plantSpecies: mockPlants[Math.floor(Math.random() * mockPlants.length)],
            affectedPart: mockParts[Math.floor(Math.random() * mockParts.length)],
            detections: [detection],
          };
        });

        const report: VideoReport = {
          id: analysisId,
          createdAt: new Date(),
          videoUrl: video.preview,
          videoName: video.name,
          duration: video.duration || 30,
          analyzedFrames,
          status: 'completed',
        };

        addVideoReport(report);
      }

      setReportName('');
      setUploadProgress({});
      setViewMode('report');
    } catch (err) {
      console.error('Video analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasVideos = uploadedVideos.length > 0;
  const activeUploads = Object.values(uploadProgress).filter(p => p.status === 'uploading');

  return (
    <div className="animate-fade-in">
      <div className="grid lg:grid-cols-[1fr,280px] gap-6">
        {/* Main content */}
        <div className="space-y-6">
          {!hasVideos ? (
            <FileUploadZone
              accept="video/*"
              multiple
              onFilesSelected={handleFilesSelected}
              label="Загрузить видео"
              description="Перетащите видео растений сюда или нажмите для выбора."
            />
          ) : (
            <>
              {/* Video grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedVideos.map(video => (
                  <div key={video.id} className="space-y-2">
                    <VideoPreviewCard
                      video={video}
                      onRemove={() => removeVideo(video.id)}
                      onEdit={() => setEditingVideo(video)}
                    />
                    {/* Upload progress */}
                    {uploadProgress[video.id] && uploadProgress[video.id].status === 'uploading' && (
                      <div className="px-2">
                        <Progress value={uploadProgress[video.id].percent} className="h-1.5" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Загрузка... {uploadProgress[video.id].percent}%
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add more button */}
                <label className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
                    className="sr-only"
                  />
                  <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Добавить ещё</span>
                </label>
              </div>
            </>
          )}
        </div>

        {/* Right panel */}
        <div className="lg:sticky lg:top-4 space-y-4">
          {hasVideos && (
            <>
              {/* Report name */}
              <div className="bg-card rounded-xl border border-border p-4 space-y-2">
                <Label htmlFor="video-report-name" className="text-sm font-medium text-foreground">
                  Название отчёта
                </Label>
                <Input
                  id="video-report-name"
                  placeholder={getDefaultReportName()}
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Frame rate setting */}
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">
                    Частота кадров анализа
                  </Label>
                  <span className="text-sm text-muted-foreground font-medium">
                    {frameRate} к/с
                  </span>
                </div>
                <Slider
                  value={[frameRate]}
                  onValueChange={([v]) => setFrameRate(v)}
                  min={0.5}
                  max={10}
                  step={0.5}
                />
                <p className="text-xs text-muted-foreground">
                  Более высокая частота даёт больше деталей, но увеличивает время обработки
                </p>
              </div>
            </>
          )}

          <AnalysisPanel
            itemCount={uploadedVideos.length}
            itemLabel="video"
            isAnalyzing={isAnalyzing}
            onSubmit={handleSubmitAnalysis}
            disabled={activeUploads.length > 0}
          />
        </div>
      </div>

      {/* Edit modal */}
      <VideoEditModal
        video={editingVideo}
        open={!!editingVideo}
        onClose={() => setEditingVideo(null)}
        onApply={() => {}}
      />
    </div>
  );
}
