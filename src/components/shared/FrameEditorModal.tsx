import { useState } from 'react';
import { Crop, Droplets, RotateCcw, SlidersHorizontal, Sun, Contrast, ZoomIn, ZoomOut, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface FrameEditorModalProps {
  title: string;
  imageSrc: string | null;
  imageSize?: { w: number; h: number } | null;
  onClose?: () => void;
  onSendToAnalysis?: () => void;
  onSelectArea?: () => void;
  onScreenshot?: () => void;
  isAnalyzing?: boolean;
}

export function FrameEditorModal({
  title,
  imageSrc,
  imageSize,
  onClose,
  onSendToAnalysis,
  onSelectArea,
  onScreenshot,
  isAnalyzing = false,
}: FrameEditorModalProps) {
  const [frameZoom, setFrameZoom] = useState(100);
  const [frameBrightness, setFrameBrightness] = useState(100);
  const [frameContrast, setFrameContrast] = useState(100);
  const [frameSaturation, setFrameSaturation] = useState(100);
  const [frameHue, setFrameHue] = useState(0);

  const resetFrameEditor = () => {
    setFrameZoom(100);
    setFrameBrightness(100);
    setFrameContrast(100);
    setFrameSaturation(100);
    setFrameHue(0);
  };

  if (!imageSrc) return null;

  return (
    <div className="grid lg:grid-cols-[1fr,280px] gap-6 h-full min-h-0">
      <div className="space-y-4 min-h-0">
        <div
          className="bg-muted/60 rounded-lg overflow-auto border border-border mx-auto"
          style={{
            aspectRatio: imageSize ? `${imageSize.w} / ${imageSize.h}` : '16 / 9',
            width: imageSize
              ? `min(100%, calc((100dvh - 320px) * ${imageSize.w} / ${imageSize.h}))`
              : '100%',
          }}
        >
          <img
            src={imageSrc}
            alt={title}
            style={{
              width: `${frameZoom}%`,
              minWidth: frameZoom > 100 ? `${frameZoom}%` : '100%',
              display: 'block',
              filter: `brightness(${frameBrightness}%) contrast(${frameContrast}%) saturate(${frameSaturation}%) hue-rotate(${frameHue}deg)`,
            }}
          />
        </div>

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

      <div className="space-y-6 min-h-0">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Уровни цвета
          </Label>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={resetFrameEditor}>
            <RotateCcw className="w-3 h-3 mr-1" />
            Сбросить
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sun className="w-3 h-3" /> Яркость
            </span>
            <span>{frameBrightness}%</span>
          </div>
          <Slider value={[frameBrightness]} onValueChange={([v]) => setFrameBrightness(v)} min={0} max={200} step={1} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Contrast className="w-3 h-3" /> Контраст
            </span>
            <span>{frameContrast}%</span>
          </div>
          <Slider value={[frameContrast]} onValueChange={([v]) => setFrameContrast(v)} min={0} max={200} step={1} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3" /> Насыщенность
            </span>
            <span>{frameSaturation}%</span>
          </div>
          <Slider value={[frameSaturation]} onValueChange={([v]) => setFrameSaturation(v)} min={0} max={200} step={1} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Поворот оттенка</span>
            <span>{frameHue}°</span>
          </div>
          <Slider value={[frameHue]} onValueChange={([v]) => setFrameHue(v)} min={-180} max={180} step={1} />
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          {onScreenshot && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onScreenshot}
            >
              <Crop className="w-4 h-4 mr-2" />
              Скриншот кадра
            </Button>
          )}
          {onSelectArea && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onSelectArea}
            >
              <Crop className="w-4 h-4 mr-2" />
              Выбрать область
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-2"
            onClick={onSendToAnalysis}
            disabled={!onSendToAnalysis || isAnalyzing}
          >
            <Activity className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Анализ...' : 'Отправить на анализ'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onClose}
            disabled={!onClose}
          >
            <Crop className="w-4 h-4 mr-2" />
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  );
}
