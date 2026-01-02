import { useCallback, useState } from 'react';
import { Upload, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept: string;
  multiple?: boolean;
  label: string;
  description: string;
}

export function FileUploadZone({ 
  onFilesSelected, 
  accept, 
  multiple = true,
  label,
  description
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    e.target.value = '';
  };

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-2xl p-8 md:p-12 transition-all duration-200',
        'flex flex-col items-center justify-center text-center min-h-[300px]',
        isDragging 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : 'border-border hover:border-primary/50 bg-card/50'
      )}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label={label}
      />
      
      <div className={cn(
        'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all',
        isDragging ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted'
      )}>
        {isDragging ? (
          <Upload className="w-8 h-8" />
        ) : (
          <ImagePlus className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      
      <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
        {isDragging ? 'Drop files here' : label}
      </h3>
      
      <p className="text-muted-foreground text-sm max-w-xs mb-4">
        {description}
      </p>
      
      <Button variant="secondary" size="sm" className="pointer-events-none">
        Choose from Device
      </Button>
    </div>
  );
}
