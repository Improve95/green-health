import { useApp } from '@/contexts/AppContext';
import { PhotoAnalysis } from '@/components/photo/PhotoAnalysis';
import { PhotoReports } from '@/components/photo/PhotoReports';
import { VideoAnalysis } from '@/components/video/VideoAnalysis';
import { VideoReports } from '@/components/video/VideoReports';
import { StreamingAnalysis } from '@/components/streaming/StreamingAnalysis';
import { StreamingReports } from '@/components/streaming/StreamingReports';

export function ContentRouter() {
  const { contentType, viewMode } = useApp();

  // Photo
  if (contentType === 'photo' && viewMode === 'analyse') {
    return <PhotoAnalysis />;
  }
  if (contentType === 'photo' && viewMode === 'report') {
    return <PhotoReports />;
  }

  // Video
  if (contentType === 'video' && viewMode === 'analyse') {
    return <VideoAnalysis />;
  }
  if (contentType === 'video' && viewMode === 'report') {
    return <VideoReports />;
  }

  // Streaming
  if (contentType === 'streaming' && viewMode === 'analyse') {
    return <StreamingAnalysis />;
  }
  if (contentType === 'streaming' && viewMode === 'report') {
    return <StreamingReports />;
  }

  return null;
}
