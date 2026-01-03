import { X, Edit3, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VideoFile } from '@/types/app';

interface VideoPreviewCardProps {
  video: VideoFile;
  onRemove: () => void;
  onEdit: () => void;
}

export function VideoPreviewCard({ video, onRemove, onEdit }: VideoPreviewCardProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={cn(
        'group relative bg-card rounded-xl border border-border overflow-hidden',
        'transition-all duration-200 hover:shadow-elevated hover:border-primary/30',
        'animate-scale-in'
      )}
    >
      {/* Video preview */}
      <div 
        className="aspect-video bg-muted cursor-pointer relative overflow-hidden"
        onClick={onEdit}
      >
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <video
            src={video.preview}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-card/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-5 h-5 text-foreground ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-foreground/80 text-background text-xs font-medium">
          {formatDuration(video.duration)}
        </div>
      </div>
      
      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-foreground truncate" title={video.name}>
          {video.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatSize(video.size)}
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
        aria-label={`Remove ${video.name}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
