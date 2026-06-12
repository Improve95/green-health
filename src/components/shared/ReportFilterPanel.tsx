import { useState } from 'react';
import { Filter, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { pluralize, STATUS_LABELS } from '@/lib/utils';
import type { ReportStatus } from '@/types/api';

interface ReportFilterPanelProps {
  activeFilter: ReportStatus | 'all';
  onApply: (status: ReportStatus | 'all') => void;
  totalCount: number;
}

export function ReportFilterPanel({ activeFilter, onApply, totalCount }: ReportFilterPanelProps) {
  const [pendingFilter, setPendingFilter] = useState<ReportStatus | 'all'>(activeFilter);
  const isDirty = pendingFilter !== activeFilter;

  return (
    <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3 flex-wrap">
      <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm font-medium text-foreground">Статус:</span>
      <Select
        value={pendingFilter}
        onValueChange={(v) => setPendingFilter(v as ReportStatus | 'all')}
      >
        <SelectTrigger className="w-[150px] h-8 text-sm">
          <SelectValue placeholder="Все статусы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="analyzing">{STATUS_LABELS.analyzing}</SelectItem>
          <SelectItem value="completed">{STATUS_LABELS.completed}</SelectItem>
          <SelectItem value="error">{STATUS_LABELS.error}</SelectItem>
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant={isDirty ? 'default' : 'outline'}
        className="h-8 gap-1.5"
        onClick={() => onApply(pendingFilter)}
      >
        <Check className="w-3.5 h-3.5" />
        Применить
      </Button>
      <span className="ml-auto text-sm text-muted-foreground">
        {totalCount} {pluralize(totalCount, 'отчёт', 'отчёта', 'отчётов')}
      </span>
    </div>
  );
}
