import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { FileUploadZone } from '@/components/shared/FileUploadZone';
import { VideoPreviewCard } from './VideoPreviewCard';
import { VideoEditModal } from './VideoEditModal';
import { AnalysisPanel } from '@/components/shared/AnalysisPanel';
import type { VideoFile, VideoReport, AnalyzedFrame, DiseaseDetection } from '@/types/app';

export function VideoAnalysis() {
  const { uploadedVideos, addVideos, removeVideo, addVideoReport, setViewMode } = useApp();
  const [editingVideo, setEditingVideo] = useState<VideoFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    
    // Get video duration for each file
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

    // Simulate analysis with mock data
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockDiseases = [
      'Leaf Blight',
      'Powdery Mildew',
      'Root Rot',
      'Bacterial Spot',
      'Mosaic Virus'
    ];

    const mockPlants = ['Tomato', 'Corn', 'Wheat', 'Rice', 'Soybean'];
    const mockParts = ['Leaf', 'Stem', 'Root', 'Fruit', 'Flower'];

    uploadedVideos.forEach(video => {
      // Create mock analyzed frames
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
          symptoms: [
            'Yellow spots on leaves',
            'Wilting edges',
            'Brown discoloration'
          ],
          recommendations: [
            'Apply fungicide treatment',
            'Improve drainage',
            'Remove affected leaves'
          ]
        };

        return {
          id: crypto.randomUUID(),
          timestamp: (i + 1) * ((video.duration || 30) / (numFrames + 1)),
          frameUrl: video.preview,
          plantSpecies: mockPlants[Math.floor(Math.random() * mockPlants.length)],
          affectedPart: mockParts[Math.floor(Math.random() * mockParts.length)],
          detections: [detection]
        };
      });

      const report: VideoReport = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        videoUrl: video.preview,
        videoName: video.name,
        duration: video.duration || 30,
        analyzedFrames,
        status: 'completed'
      };

      addVideoReport(report);
    });

    setIsAnalyzing(false);
    setViewMode('report');
  };

  const hasVideos = uploadedVideos.length > 0;

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
              label="Upload Videos"
              description="Drag and drop plant videos here, or click to browse. Supports MP4, WebM, and MOV formats."
            />
          ) : (
            <>
              {/* Video grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedVideos.map(video => (
                  <VideoPreviewCard
                    key={video.id}
                    video={video}
                    onRemove={() => removeVideo(video.id)}
                    onEdit={() => setEditingVideo(video)}
                  />
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
                  <span className="text-sm text-muted-foreground">Add More</span>
                </label>
              </div>
            </>
          )}
        </div>

        {/* Right panel */}
        <div className="lg:sticky lg:top-4 space-y-4">
          <AnalysisPanel
            itemCount={uploadedVideos.length}
            itemLabel="video"
            isAnalyzing={isAnalyzing}
            onSubmit={handleSubmitAnalysis}
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
