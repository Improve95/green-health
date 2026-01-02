import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnalysisPanelProps {
  itemCount: number;
  itemLabel: string;
  isAnalyzing: boolean;
  onSubmit: () => void;
  disabled?: boolean;
}

export function AnalysisPanel({ 
  itemCount, 
  itemLabel, 
  isAnalyzing, 
  onSubmit,
  disabled = false 
}: AnalysisPanelProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div>
        <h3 className="font-heading font-semibold text-foreground">Ready to Analyze</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {itemCount} {itemLabel}{itemCount !== 1 ? 's' : ''} selected
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Items</span>
          <span className="font-medium">{itemCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Processing</span>
          <span className="font-medium text-primary">AI Analysis</span>
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={disabled || itemCount === 0 || isAnalyzing}
        className={cn(
          'w-full',
          isAnalyzing && 'animate-pulse-soft'
        )}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send for Analysis
          </>
        )}
      </Button>

      {itemCount === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Upload files to enable analysis
        </p>
      )}
    </div>
  );
}
