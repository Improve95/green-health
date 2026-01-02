import { X, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ImageFile } from '@/types/app';

interface ImagePreviewCardProps {
  image: ImageFile;
  onRemove: () => void;
  onEdit: () => void;
}

export function ImagePreviewCard({ image, onRemove, onEdit }: ImagePreviewCardProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div 
      className={cn(
        'group relative bg-card rounded-xl border border-border overflow-hidden',
        'transition-all duration-200 hover:shadow-elevated hover:border-primary/30',
        'animate-scale-in'
      )}
    >
      {/* Image preview */}
      <div 
        className="aspect-square bg-muted cursor-pointer relative overflow-hidden"
        onClick={onEdit}
      >
        <img
          src={image.preview}
          alt={image.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{
            filter: `brightness(${image.brightness}%) contrast(${image.contrast}%) saturate(${image.saturation}%)`
          }}
        />
        
        {/* Edit overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-card/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit3 className="w-4 h-4 text-foreground" />
          </div>
        </div>
      </div>
      
      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-foreground truncate" title={image.name}>
          {image.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatSize(image.size)}
        </p>
      </div>
      
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={cn(
          'absolute top-2 right-2 w-7 h-7 rounded-full',
          'bg-destructive/90 text-destructive-foreground',
          'flex items-center justify-center',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:bg-destructive focus:outline-none focus:ring-2 focus:ring-ring'
        )}
        aria-label={`Remove ${image.name}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
