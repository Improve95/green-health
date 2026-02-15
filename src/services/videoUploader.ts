import { initVideoAnalysis, createVideoWebSocket } from './api';
import { USE_REAL_BACKEND } from '@/config/api';
import type { VideoInitRequest } from '@/types/api';

export interface VideoUploadProgress {
  analysisId: string;
  bytesSent: number;
  totalBytes: number;
  percent: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

type ProgressCallback = (progress: VideoUploadProgress) => void;

export async function uploadVideoForAnalysis(
  file: File,
  desiredFrameRate: number,
  onProgress: ProgressCallback
): Promise<string> {
  const initReq: VideoInitRequest = {
    videoDurationSeconds: undefined, // will be set if known
    desiredFrameRate,
    videoMimeType: file.type || 'video/mp4',
  };

  // Try to get duration from video element
  const duration = await getVideoDuration(file);
  if (duration) initReq.videoDurationSeconds = Math.round(duration);

  const initRes = await initVideoAnalysis(initReq);
  const { analysisId, maxChunkSizeBytes } = initRes;

  if (!USE_REAL_BACKEND) {
    // Simulate upload progress with stubs
    const totalBytes = file.size;
    let bytesSent = 0;
    const chunkSize = maxChunkSizeBytes;

    while (bytesSent < totalBytes) {
      await new Promise(r => setTimeout(r, 200));
      bytesSent = Math.min(bytesSent + chunkSize, totalBytes);
      onProgress({
        analysisId,
        bytesSent,
        totalBytes,
        percent: Math.round((bytesSent / totalBytes) * 100),
        status: bytesSent >= totalBytes ? 'completed' : 'uploading',
      });
    }
    return analysisId;
  }

  // Real WebSocket upload
  return new Promise((resolve, reject) => {
    const ws = createVideoWebSocket(analysisId);
    if (!ws) {
      reject(new Error('WebSocket not available'));
      return;
    }

    const totalBytes = file.size;
    let bytesSent = 0;

    ws.onopen = async () => {
      try {
        let offset = 0;
        while (offset < totalBytes) {
          const end = Math.min(offset + maxChunkSizeBytes, totalBytes);
          const chunk = file.slice(offset, end);
          const buffer = await chunk.arrayBuffer();

          // Wait for buffer to drain if needed
          while (ws.bufferedAmount > maxChunkSizeBytes * 2) {
            await new Promise(r => setTimeout(r, 50));
          }

          ws.send(buffer);
          offset = end;
          bytesSent = offset;
          onProgress({
            analysisId,
            bytesSent,
            totalBytes,
            percent: Math.round((bytesSent / totalBytes) * 100),
            status: 'uploading',
          });
        }
        // Signal end of upload
        ws.send(JSON.stringify({ type: 'upload_complete' }));
      } catch (err) {
        onProgress({
          analysisId,
          bytesSent,
          totalBytes,
          percent: Math.round((bytesSent / totalBytes) * 100),
          status: 'error',
          error: String(err),
        });
        ws.close();
        reject(err);
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'upload_acknowledged') {
          onProgress({
            analysisId,
            bytesSent: totalBytes,
            totalBytes,
            percent: 100,
            status: 'completed',
          });
          ws.close();
          resolve(analysisId);
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    ws.onerror = () => {
      onProgress({
        analysisId,
        bytesSent,
        totalBytes,
        percent: Math.round((bytesSent / totalBytes) * 100),
        status: 'error',
        error: 'WebSocket error',
      });
      reject(new Error('WebSocket error'));
    };
  });
}

function getVideoDuration(file: File): Promise<number | null> {
  return new Promise(resolve => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve(video.duration);
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => resolve(null);
    video.src = URL.createObjectURL(file);
  });
}
