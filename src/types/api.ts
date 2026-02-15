// ── Photo Analysis ──

export interface PhotoAnalysisRequestImage {
  /** base64-encoded image data */
  data: string;
  fileName: string;
  mimeType: string;
  settings: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
}

export interface PhotoAnalysisRequest {
  reportName: string;
  images: PhotoAnalysisRequestImage[];
}

export interface PhotoDiseaseResult {
  disease: string;
  probability: number;
  symptoms: string[];
  plantPart: string;
}

export interface PhotoImageResult {
  fileName: string;
  diseases: PhotoDiseaseResult[];
}

export interface PhotoAnalysisResponse {
  reportId: string;
  status: 'analyzing' | 'completed' | 'error';
  results: PhotoImageResult[];
}

// ── Video Analysis ──

export interface VideoInitRequest {
  videoDurationSeconds?: number;
  desiredFrameRate: number;
  videoMimeType: string;
}

export interface VideoInitResponse {
  analysisId: string;
  status: 'initialized';
  maxChunkSizeBytes: number;
}

export interface VideoFrameDiseaseResult {
  disease: string;
  probability: number;
  symptoms: string[];
  plantPart: string;
}

export interface VideoFrameResult {
  frameNumber: number;
  timestamp: number;
  diseases: VideoFrameDiseaseResult[];
}

export interface VideoAnalysisResponse {
  reportId: string;
  status: 'analyzing' | 'completed' | 'error';
  progress?: number;
  results: VideoFrameResult[];
}

// ── Reports ──

export type ReportStatus = 'analyzing' | 'completed' | 'error';
export type ReportType = 'photo' | 'video';

export interface ReportListItem {
  reportId: string;
  reportName: string;
  type: ReportType;
  status: ReportStatus;
  createdAt: string;
}

export interface ReportListResponse {
  reports: ReportListItem[];
}

export interface ReportDetailResponse {
  reportId: string;
  reportName: string;
  type: ReportType;
  status: ReportStatus;
  createdAt: string;
  // Photo-specific
  photoResults?: PhotoImageResult[];
  // Video-specific
  videoResults?: VideoFrameResult[];
}
