import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { FileUploadZone } from '@/components/shared/FileUploadZone';
import { ImagePreviewCard } from './ImagePreviewCard';
import { ImageEditModal } from './ImageEditModal';
import { AnalysisPanel } from '@/components/shared/AnalysisPanel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitPhotoAnalysis } from '@/services/api';
import type { ImageFile, PhotoReport, DiseaseDetection } from '@/types/app';
import type { PhotoAnalysisRequestImage } from '@/types/api';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix
      resolve(result.split(',')[1] || result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoAnalysis() {
  const { uploadedImages, addImages, removeImage, updateImage, addPhotoReport, setViewMode } = useApp();
  const [editingImage, setEditingImage] = useState<ImageFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportName, setReportName] = useState('');

  const getDefaultReportName = () => {
    if (uploadedImages.length === 1) {
      return `${uploadedImages[0].name} - ${new Date().toLocaleString()}`;
    }
    return `Photo Analysis - ${new Date().toLocaleString()}`;
  };

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

    try {
      // Build request body with image data and settings
      const images: PhotoAnalysisRequestImage[] = await Promise.all(
        uploadedImages.map(async (img) => ({
          data: await fileToBase64(img.file),
          fileName: img.name,
          mimeType: img.type,
          settings: {
            brightness: img.brightness,
            contrast: img.contrast,
            saturation: img.saturation,
          },
        }))
      );

      const name = reportName.trim() || getDefaultReportName();

      const response = await submitPhotoAnalysis({
        reportName: name,
        images,
      });

      // Map API response to local PhotoReport model
      uploadedImages.forEach((image, index) => {
        const imageResult = response.results[index];
        const detections: DiseaseDetection[] = imageResult
          ? imageResult.diseases.map(d => ({
              id: crypto.randomUUID(),
              disease: d.disease,
              confidence: d.probability,
              boundingBox: undefined,
              symptoms: d.symptoms,
              recommendations: [
                'Apply appropriate treatment',
                'Monitor plant health',
                'Consult agronomist if symptoms persist',
              ],
            }))
          : [];

        const report: PhotoReport = {
          id: response.reportId + (uploadedImages.length > 1 ? `-${index}` : ''),
          createdAt: new Date(),
          imageUrl: image.preview,
          imageName: image.name,
          plantSpecies: imageResult?.diseases[0]?.plantPart || 'Unknown',
          affectedPart: imageResult?.diseases[0]?.plantPart || 'Unknown',
          detections,
          status: response.status,
        };

        addPhotoReport(report);
      });

      setReportName('');
      setViewMode('report');
    } catch (err) {
      console.error('Photo analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
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
          {/* Report name input */}
          {hasImages && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-2">
              <Label htmlFor="report-name" className="text-sm font-medium text-foreground">
                Report Name
              </Label>
              <Input
                id="report-name"
                placeholder={getDefaultReportName()}
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="text-sm"
              />
            </div>
          )}

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
