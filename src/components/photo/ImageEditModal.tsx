import { useState } from 'react';
import { X, RotateCcw, Check, Sun, Contrast, Droplets, Focus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { ImageFile } from '@/types/app';

interface ImageEditModalProps {
  image: ImageFile | null;
  open: boolean;
  onClose: () => void;
  onApply: (updates: Partial<ImageFile>) => void;
}

export function ImageEditModal({ image, open, onClose, onApply }: ImageEditModalProps) {
  const [brightness, setBrightness] = useState(image?.brightness ?? 100);
  const [contrast, setContrast] = useState(image?.contrast ?? 100);
  const [saturation, setSaturation] = useState(image?.saturation ?? 100);
  const [sharpness, setSharpness] = useState(100);

  // Reset when image changes
  if (image && (brightness !== image.brightness || contrast !== image.contrast || saturation !== image.saturation)) {
    setBrightness(image.brightness);
    setContrast(image.contrast);
    setSaturation(image.saturation);
  }

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSharpness(100);
  };

  const handleApply = () => {
    onApply({
      brightness,
      contrast,
      saturation
    });
    onClose();
  };

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-heading">Edit Image</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto grid md:grid-cols-[1fr,280px] gap-6 py-4">
          {/* Image preview */}
          <div className="bg-muted rounded-xl overflow-hidden flex items-center justify-center min-h-[300px]">
            <img
              src={image.preview}
              alt={image.name}
              className="max-w-full max-h-[60vh] object-contain"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
              }}
            />
          </div>

          {/* Edit controls */}
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Brightness */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Sun className="w-4 h-4 text-muted-foreground" />
                  Brightness
                  <span className="ml-auto text-muted-foreground">{brightness}%</span>
                </Label>
                <Slider
                  value={[brightness]}
                  onValueChange={([v]) => setBrightness(v)}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Contrast className="w-4 h-4 text-muted-foreground" />
                  Contrast
                  <span className="ml-auto text-muted-foreground">{contrast}%</span>
                </Label>
                <Slider
                  value={[contrast]}
                  onValueChange={([v]) => setContrast(v)}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Droplets className="w-4 h-4 text-muted-foreground" />
                  Saturation
                  <span className="ml-auto text-muted-foreground">{saturation}%</span>
                </Label>
                <Slider
                  value={[saturation]}
                  onValueChange={([v]) => setSaturation(v)}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Sharpness (placeholder) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Focus className="w-4 h-4 text-muted-foreground" />
                  Sharpness
                  <span className="ml-auto text-muted-foreground">{sharpness}%</span>
                </Label>
                <Slider
                  value={[sharpness]}
                  onValueChange={([v]) => setSharpness(v)}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Crop placeholder */}
            <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30">
              <p className="text-sm text-muted-foreground text-center">
                Crop tool coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center justify-between gap-4 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              <Check className="w-4 h-4 mr-2" />
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
