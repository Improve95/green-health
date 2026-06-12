import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, pluralize } from '@/lib/utils';

const ITEM_LABELS: Record<string, { one: string; few: string; many: string }> = {
  image: { one: 'изображение', few: 'изображения', many: 'изображений' },
  video: { one: 'видео', few: 'видео', many: 'видео' },
};

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
  const labels = ITEM_LABELS[itemLabel] ?? { one: itemLabel, few: itemLabel, many: itemLabel };
  const itemWord = pluralize(itemCount, labels.one, labels.few, labels.many);

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div>
        <h3 className="font-heading font-semibold text-foreground">Готово к анализу</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {itemCount} {itemWord} выбрано
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Элементы</span>
          <span className="font-medium">{itemCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Обработка</span>
          <span className="font-medium text-primary">ИИ-анализ</span>
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
            Анализ...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Отправить на анализ
          </>
        )}
      </Button>

      {itemCount === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Загрузите файлы для запуска анализа
        </p>
      )}
    </div>
  );
}
