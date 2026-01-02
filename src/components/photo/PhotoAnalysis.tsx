import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { FileUploadZone } from '@/components/shared/FileUploadZone';
import { ImagePreviewCard } from './ImagePreviewCard';
import { ImageEditModal } from './ImageEditModal';
import { AnalysisPanel } from '@/components/shared/AnalysisPanel';
import { Button } from '@/components/ui/button';
import type { ImageFile, PhotoReport, DiseaseDetection } from '@/types/app';

export function PhotoAnalysis() {
  const { uploadedImages, addImages, removeImage, updateImage, addPhotoReport, setViewMode } = useApp();
  const [editingImage, setEditingImage] = useState<ImageFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFilesSelected = useCallback((files: File[]) => {
    const imageFiles: ImageFile[] = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        brightness: 100,
        contrast: 100,
        saturation: 100,
      }));
    
    addImages(imageFiles);
  }, [addImages]);

  const handleSubmitAnalysis = async () => {
    if (uploadedImages.length === 0) return;

    setIsAnalyzing(true);

    // Simulate analysis with mock data
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create mock reports for each image
    const mockDiseases = [
      'Leaf Blight',
      'Powdery Mildew',
      'Root Rot',
      'Bacterial Spot',
      'Mosaic Virus'
    ];

    const mockPlants = ['Tomato', 'Corn', 'Wheat', 'Rice', 'Soybean'];
    const mockParts = ['Leaf', 'Stem', 'Root', 'Fruit', 'Flower'];

    uploadedImages.forEach(image => {
      const detections: DiseaseDetection[] = [{
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
      }];

      const report: PhotoReport = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        imageUrl: image.preview,
        imageName: image.name,
        plantSpecies: mockPlants[Math.floor(Math.random() * mockPlants.length)],
        affectedPart: mockParts[Math.floor(Math.random() * mockParts.length)],
        detections,
        status: 'completed'
      };

      addPhotoReport(report);
    });

    setIsAnalyzing(false);
    setViewMode('report');
  };

  const hasImages = uploadedImages.length > 0;

  return (
    <div className="animate-fade-in">
      <div className="grid lg:grid-cols-[1fr,280px] gap-6">
        {/* Main content */}
        <div className="space-y-6">
          {!hasImages ? (
            <FileUploadZone
              accept="image/*"
              multiple
              onFilesSelected={handleFilesSelected}
              label="Upload Images"
              description="Drag and drop plant images here, or click to browse. Supports JPG, PNG, and WebP formats."
            />
          ) : (
            <>
              {/* Image grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {uploadedImages.map(image => (
                  <ImagePreviewCard
                    key={image.id}
                    image={image}
                    onRemove={() => removeImage(image.id)}
                    onEdit={() => setEditingImage(image)}
                  />
                ))}
                
                {/* Add more button */}
                <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
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
            itemCount={uploadedImages.length}
            itemLabel="image"
            isAnalyzing={isAnalyzing}
            onSubmit={handleSubmitAnalysis}
          />
        </div>
      </div>

      {/* Edit modal */}
      <ImageEditModal
        image={editingImage}
        open={!!editingImage}
        onClose={() => setEditingImage(null)}
        onApply={(updates) => {
          if (editingImage) {
            updateImage(editingImage.id, updates);
          }
        }}
      />
    </div>
  );
}
