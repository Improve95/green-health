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
      setError('Please enter a source name');
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
          ? 'Failed to access webcam. Please ensure you have granted camera permissions.'
          : 'Failed to start screen recording. Please try again.'
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
          <DialogTitle>Add Streaming Source</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Source type selection */}
          <div className="space-y-3">
            <Label>Source Type</Label>
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
                <p className="font-medium text-foreground">Webcam</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use your camera for live analysis
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
                <p className="font-medium text-foreground">Screen</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Record your screen or window
                </p>
              </button>
            </div>
          </div>

          {/* Source name */}
          <div className="space-y-2">
            <Label htmlFor="source-name">Source Name</Label>
            <Input
              id="source-name"
              placeholder={sourceType === 'webcam' ? 'e.g., Field Camera 1' : 'e.g., Drone Feed'}
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
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Add Source'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
