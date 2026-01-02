// Navigation types
export type ContentType = 'photo' | 'video' | 'streaming';
export type ViewMode = 'analyse' | 'report';

// Image/Video file types
export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
}

export interface ImageFile extends UploadedFile {
  brightness: number;
  contrast: number;
  saturation: number;
  cropData?: CropData;
}

export interface VideoFile extends UploadedFile {
  duration?: number;
  thumbnail?: string;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Report types
export interface DiseaseDetection {
  id: string;
  disease: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  symptoms: string[];
  recommendations: string[];
}

export interface PhotoReport {
  id: string;
  createdAt: Date;
  imageUrl: string;
  imageName: string;
  plantSpecies: string;
  affectedPart: string;
  detections: DiseaseDetection[];
  status: 'analyzing' | 'completed' | 'error';
}

export interface VideoReport {
  id: string;
  createdAt: Date;
  videoUrl: string;
  videoName: string;
  duration: number;
  analyzedFrames: AnalyzedFrame[];
  status: 'analyzing' | 'completed' | 'error';
}

export interface AnalyzedFrame {
  id: string;
  timestamp: number;
  frameUrl: string;
  plantSpecies: string;
  affectedPart: string;
  detections: DiseaseDetection[];
}

// Streaming types
export interface StreamingSource {
  id: string;
  name: string;
  type: 'screen' | 'webcam';
  createdAt: Date;
  isActive: boolean;
  stream?: MediaStream;
}

export interface StreamingDetection {
  id: string;
  timestamp: Date;
  disease: string;
  confidence: number;
  sourceId: string;
}

export interface StreamingReport {
  id: string;
  sourceId: string;
  sourceName: string;
  startTime: Date;
  endTime: Date;
  detections: StreamingDetection[];
  aggregatedStats: {
    totalDetections: number;
    diseaseBreakdown: { disease: string; count: number }[];
    avgConfidence: number;
  };
}
