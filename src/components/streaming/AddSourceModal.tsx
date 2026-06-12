import { useState } from 'react';
import { Monitor, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AddSourceModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, type: 'screen' | 'webcam', stream: MediaStream) => void;
}

export function AddSourceModal({ open, onClose, onAdd }: AddSourceModalProps) {
  const [sourceType, setSourceType] = useState<'screen' | 'webcam'>('webcam');
  const [sourceName, setSourceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!sourceName.trim()) {
      setError('Введите название источника');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let stream: MediaStream;

      if (sourceType === 'webcam') {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
      }

      onAdd(sourceName.trim(), sourceType, stream);
      setSourceName('');
      onClose();
    } catch (err) {
      console.error('Failed to get media stream:', err);
      setError(
        sourceType === 'webcam'
          ? 'Не удалось получить доступ к веб-камере. Убедитесь, что разрешён доступ к камере.'
          : 'Не удалось начать запись экрана. Попробуйте снова.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSourceName('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить источник трансляции</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Source type selection */}
          <div className="space-y-3">
            <Label>Тип источника</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSourceType('webcam')}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  sourceType === 'webcam'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Camera className={cn(
                  'w-8 h-8 mb-2',
                  sourceType === 'webcam' ? 'text-primary' : 'text-muted-foreground'
                )} />
                <p className="font-medium text-foreground">Веб-камера</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Используйте камеру для анализа в реальном времени
                </p>
              </button>

              <button
                onClick={() => setSourceType('screen')}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  sourceType === 'screen'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Monitor className={cn(
                  'w-8 h-8 mb-2',
                  sourceType === 'screen' ? 'text-primary' : 'text-muted-foreground'
                )} />
                <p className="font-medium text-foreground">Экран</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Записывайте экран или окно
                </p>
              </button>
            </div>
          </div>

          {/* Source name */}
          <div className="space-y-2">
            <Label htmlFor="source-name">Название источника</Label>
            <Input
              id="source-name"
              placeholder={sourceType === 'webcam' ? 'напр., Полевая камера 1' : 'напр., Поток с дрона'}
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button onClick={handleAdd} disabled={isLoading}>
              {isLoading ? 'Подключение...' : 'Добавить источник'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
