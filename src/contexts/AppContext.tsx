import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { 
  ContentType, 
  ViewMode, 
  ImageFile, 
  VideoFile, 
  PhotoReport, 
  VideoReport,
  StreamingSource,
  StreamingDetection,
  StreamingReport
} from '@/types/app';

interface AppState {
  contentType: ContentType;
  viewMode: ViewMode;
  
  // Photo state
  uploadedImages: ImageFile[];
  photoReports: PhotoReport[];
  
  // Video state
  uploadedVideos: VideoFile[];
  videoReports: VideoReport[];
  
  // Streaming state
  streamingSources: StreamingSource[];
  realtimeDetections: StreamingDetection[];
  streamingReports: StreamingReport[];
}

interface AppContextType extends AppState {
  setContentType: (type: ContentType) => void;
  setViewMode: (mode: ViewMode) => void;
  
  // Photo actions
  addImages: (images: ImageFile[]) => void;
  removeImage: (id: string) => void;
  updateImage: (id: string, updates: Partial<ImageFile>) => void;
  clearImages: () => void;
  addPhotoReport: (report: PhotoReport) => void;
  
  // Video actions
  addVideos: (videos: VideoFile[]) => void;
  removeVideo: (id: string) => void;
  clearVideos: () => void;
  addVideoReport: (report: VideoReport) => void;
  
  // Streaming actions
  addStreamingSource: (source: StreamingSource) => void;
  removeStreamingSource: (id: string) => void;
  addRealtimeDetection: (detection: StreamingDetection) => void;
  clearRealtimeDetections: (sourceId: string) => void;
  addStreamingReport: (report: StreamingReport) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    contentType: 'photo',
    viewMode: 'analyse',
    uploadedImages: [],
    photoReports: [],
    uploadedVideos: [],
    videoReports: [],
    streamingSources: [],
    realtimeDetections: [],
    streamingReports: [],
  });

  const setContentType = (type: ContentType) => {
    setState(prev => ({ ...prev, contentType: type }));
  };

  const setViewMode = (mode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  };

  // Photo actions
  const addImages = (images: ImageFile[]) => {
    setState(prev => ({ 
      ...prev, 
      uploadedImages: [...prev.uploadedImages, ...images] 
    }));
  };

  const removeImage = (id: string) => {
    setState(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter(img => img.id !== id)
    }));
  };

  const updateImage = (id: string, updates: Partial<ImageFile>) => {
    setState(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.map(img => 
        img.id === id ? { ...img, ...updates } : img
      )
    }));
  };

  const clearImages = () => {
    setState(prev => ({ ...prev, uploadedImages: [] }));
  };

  const addPhotoReport = (report: PhotoReport) => {
    setState(prev => ({
      ...prev,
      photoReports: [report, ...prev.photoReports]
    }));
  };

  // Video actions
  const addVideos = (videos: VideoFile[]) => {
    setState(prev => ({
      ...prev,
      uploadedVideos: [...prev.uploadedVideos, ...videos]
    }));
  };

  const removeVideo = (id: string) => {
    setState(prev => ({
      ...prev,
      uploadedVideos: prev.uploadedVideos.filter(v => v.id !== id)
    }));
  };

  const clearVideos = () => {
    setState(prev => ({ ...prev, uploadedVideos: [] }));
  };

  const addVideoReport = (report: VideoReport) => {
    setState(prev => ({
      ...prev,
      videoReports: [report, ...prev.videoReports]
    }));
  };

  // Streaming actions
  const addStreamingSource = (source: StreamingSource) => {
    setState(prev => ({
      ...prev,
      streamingSources: [...prev.streamingSources, source]
    }));
  };

  const removeStreamingSource = (id: string) => {
    setState(prev => ({
      ...prev,
      streamingSources: prev.streamingSources.filter(s => s.id !== id)
    }));
  };

  const addRealtimeDetection = (detection: StreamingDetection) => {
    setState(prev => ({
      ...prev,
      realtimeDetections: [detection, ...prev.realtimeDetections].slice(0, 100)
    }));
  };

  const clearRealtimeDetections = (sourceId: string) => {
    setState(prev => ({
      ...prev,
      realtimeDetections: prev.realtimeDetections.filter(d => d.sourceId !== sourceId)
    }));
  };

  const addStreamingReport = (report: StreamingReport) => {
    setState(prev => ({
      ...prev,
      streamingReports: [report, ...prev.streamingReports]
    }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setContentType,
      setViewMode,
      addImages,
      removeImage,
      updateImage,
      clearImages,
      addPhotoReport,
      addVideos,
      removeVideo,
      clearVideos,
      addVideoReport,
      addStreamingSource,
      removeStreamingSource,
      addRealtimeDetection,
      clearRealtimeDetections,
      addStreamingReport,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
