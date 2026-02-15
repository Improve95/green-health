import { API_BASE_URL, WS_BASE_URL, USE_REAL_BACKEND } from '@/config/api';
import type {
  PhotoAnalysisRequest,
  PhotoAnalysisResponse,
  VideoInitRequest,
  VideoInitResponse,
  ReportListResponse,
  ReportDetailResponse,
  ReportStatus,
  ReportType,
} from '@/types/api';

// ── Helpers ──

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Stubs ──

function stubPhotoAnalysis(req: PhotoAnalysisRequest): PhotoAnalysisResponse {
  const diseases = ['Leaf Blight', 'Powdery Mildew', 'Root Rot', 'Bacterial Spot', 'Mosaic Virus'];
  const parts = ['Leaf', 'Stem', 'Root', 'Fruit', 'Flower'];
  const symptoms = [
    ['Yellow spots on leaves', 'Wilting edges', 'Brown discoloration'],
    ['White powdery coating', 'Curled leaves', 'Stunted growth'],
    ['Soft brown roots', 'Yellowing foliage', 'Wilting'],
    ['Dark spots with halos', 'Leaf drop', 'Fruit lesions'],
    ['Mosaic pattern on leaves', 'Leaf distortion', 'Reduced yield'],
  ];

  return {
    reportId: crypto.randomUUID(),
    status: 'completed',
    results: req.images.map(img => {
      const diseaseIdx = Math.floor(Math.random() * diseases.length);
      return {
        fileName: img.fileName,
        diseases: [{
          disease: diseases[diseaseIdx],
          probability: Math.floor(Math.random() * 30) + 70,
          symptoms: symptoms[diseaseIdx],
          plantPart: parts[Math.floor(Math.random() * parts.length)],
        }],
      };
    }),
  };
}

function stubVideoInit(): VideoInitResponse {
  return {
    analysisId: crypto.randomUUID(),
    status: 'initialized',
    maxChunkSizeBytes: 1048576,
  };
}

function stubReportList(type?: ReportType, status?: ReportStatus): ReportListResponse {
  // Return empty — reports are managed locally when using stubs
  return { reports: [] };
}

function stubReportDetail(reportId: string): ReportDetailResponse {
  return {
    reportId,
    reportName: 'Stub Report',
    type: 'photo',
    status: 'completed',
    createdAt: new Date().toISOString(),
    photoResults: [],
  };
}

// ── Public API ──

export async function submitPhotoAnalysis(req: PhotoAnalysisRequest): Promise<PhotoAnalysisResponse> {
  if (!USE_REAL_BACKEND) {
    await new Promise(r => setTimeout(r, 2000));
    return stubPhotoAnalysis(req);
  }
  return post<PhotoAnalysisResponse>('/analysis/photo', req);
}

export async function initVideoAnalysis(req: VideoInitRequest): Promise<VideoInitResponse> {
  if (!USE_REAL_BACKEND) {
    await new Promise(r => setTimeout(r, 500));
    return stubVideoInit();
  }
  return post<VideoInitResponse>('/analysis/video/init', req);
}

export function createVideoWebSocket(analysisId: string): WebSocket | null {
  if (!USE_REAL_BACKEND) return null;
  return new WebSocket(`${WS_BASE_URL}/video-analysis/${analysisId}`);
}

export async function fetchReports(
  type?: ReportType,
  status?: ReportStatus
): Promise<ReportListResponse> {
  if (!USE_REAL_BACKEND) {
    return stubReportList(type, status);
  }
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (status) params.set('status', status);
  return get<ReportListResponse>(`/reports?${params.toString()}`);
}

export async function fetchReportDetail(reportId: string): Promise<ReportDetailResponse> {
  if (!USE_REAL_BACKEND) {
    return stubReportDetail(reportId);
  }
  return get<ReportDetailResponse>(`/reports/${reportId}`);
}
