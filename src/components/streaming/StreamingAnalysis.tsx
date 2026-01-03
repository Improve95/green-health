import { useState, useEffect } from 'react';
import { Plus, Radio } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { StreamingSourceCard } from './StreamingSourceCard';
import { RealtimeNotifications } from './RealtimeNotifications';
import { AddSourceModal } from './AddSourceModal';
import { GenerateReportModal } from './GenerateReportModal';
import type { StreamingSource, StreamingReport, StreamingDetection } from '@/types/app';

export function StreamingAnalysis() {
  const { 
    streamingSources, 
    realtimeDetections,
    addStreamingSource, 
    removeStreamingSource,
    addRealtimeDetection,
    clearRealtimeDetections,
    addStreamingReport,
    setViewMode
  } = useApp();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [reportSource, setReportSource] = useState<StreamingSource | null>(null);

  // Simulate real-time detections for demo
  useEffect(() => {
    if (streamingSources.length === 0) return;

    const mockDiseases = [
      'Leaf Blight',
      'Powdery Mildew',
      'Root Rot',
      'Bacterial Spot',
      'Mosaic Virus'
    ];

    const interval = setInterval(() => {
      const activeSource = streamingSources.find(s => s.isActive);
      if (!activeSource) return;

      // 30% chance of detection each interval
      if (Math.random() > 0.7) {
        const detection: StreamingDetection = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          disease: mockDiseases[Math.floor(Math.random() * mockDiseases.length)],
          confidence: Math.floor(Math.random() * 30) + 70,
          sourceId: activeSource.id
        };
        addRealtimeDetection(detection);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [streamingSources, addRealtimeDetection]);

  const handleAddSource = (name: string, type: 'screen' | 'webcam', stream: MediaStream) => {
    const source: StreamingSource = {
      id: crypto.randomUUID(),
      name,
      type,
      createdAt: new Date(),
      isActive: true,
      stream
    };
    addStreamingSource(source);
  };

  const handleRemoveSource = (sourceId: string) => {
    const source = streamingSources.find(s => s.id === sourceId);
    if (source?.stream) {
      source.stream.getTracks().forEach(track => track.stop());
    }
    removeStreamingSource(sourceId);
  };

  const handleResetReport = (sourceId: string) => {
    // Clear detections for this source
    clearRealtimeDetections(sourceId);
  };

  const handleGenerateReport = (sourceId: string, fromDate: Date, toDate: Date) => {
    const source = streamingSources.find(s => s.id === sourceId);
    if (!source) return;

    const sourceDetections = realtimeDetections.filter(d => d.sourceId === sourceId);
    
    // Aggregate statistics
    const diseaseBreakdown: { [key: string]: number } = {};
    sourceDetections.forEach(d => {
      diseaseBreakdown[d.disease] = (diseaseBreakdown[d.disease] || 0) + 1;
    });

    const report: StreamingReport = {
      id: crypto.randomUUID(),
      sourceId,
      sourceName: source.name,
      startTime: fromDate,
      endTime: toDate,
      detections: sourceDetections,
      aggregatedStats: {
        totalDetections: sourceDetections.length,
        diseaseBreakdown: Object.entries(diseaseBreakdown).map(([disease, count]) => ({
          disease,
          count
        })),
        avgConfidence: sourceDetections.length > 0
          ? Math.round(sourceDetections.reduce((sum, d) => sum + d.confidence, 0) / sourceDetections.length)
          : 0
      }
    };

    addStreamingReport(report);
    setViewMode('report');
  };

  const hasSources = streamingSources.length > 0;

  return (
    <div className="animate-fade-in">
      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        {/* Main content */}
        <div className="space-y-6">
          {!hasSources ? (
            <EmptyState
              icon={Radio}
              title="Streaming Analysis"
              description="Add a streaming source (Screen Recording or Webcam) to start real-time plant disease detection."
              action={
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Streaming Source
                </Button>
              }
            />
          ) : (
            <>
              {/* Add source button */}
              <div className="flex justify-end">
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </Button>
              </div>

              {/* Sources grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {streamingSources.map(source => (
                  <StreamingSourceCard
                    key={source.id}
                    source={source}
                    onRemove={() => handleRemoveSource(source.id)}
                    onResetReport={() => handleResetReport(source.id)}
                    onGenerateReport={() => setReportSource(source)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right panel - Notifications */}
        {hasSources && (
          <div className="lg:sticky lg:top-4">
            <RealtimeNotifications detections={realtimeDetections} />
          </div>
        )}
      </div>

      {/* Add source modal */}
      <AddSourceModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSource}
      />

      {/* Generate report modal */}
      <GenerateReportModal
        open={!!reportSource}
        source={reportSource}
        onClose={() => setReportSource(null)}
        onGenerate={handleGenerateReport}
      />
    </div>
  );
}
