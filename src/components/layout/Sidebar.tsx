import { Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, CONTENT_TYPE_LABELS, VIEW_MODE_LABELS } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import type { ViewMode } from '@/types/app';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const modes: { id: ViewMode; label: string; icon: typeof Search; description: string }[] = [
  { 
    id: 'analyse', 
    label: 'Анализ', 
    icon: Search, 
    description: 'Загрузка и анализ' 
  },
  { 
    id: 'report', 
    label: 'Отчёты', 
    icon: FileText, 
    description: 'Просмотр результатов' 
  },
];

export function Sidebar() {
  const { viewMode, setViewMode, contentType } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const getContentLabel = () => CONTENT_TYPE_LABELS[contentType];

  return (
    <aside 
      className={cn(
        'bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Collapse toggle */}
      <div className="p-2 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 rounded-lg"
          aria-label={collapsed ? 'Развернуть боковую панель' : 'Свернуть боковую панель'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Mode tabs */}
      <nav 
        className="flex-1 p-2 space-y-1"
        role="tablist"
        aria-label="Режим просмотра"
        aria-orientation="vertical"
      >
        {modes.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            role="tab"
            aria-selected={viewMode === id}
            aria-controls={`${id}-panel`}
            onClick={() => setViewMode(id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
              viewMode === id
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <div className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
              viewMode === id 
                ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                : 'bg-sidebar-accent'
            )}>
              <Icon className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="text-left overflow-hidden">
                <div className="font-medium text-sm truncate">{label}</div>
                <div className="text-xs text-sidebar-foreground/60 truncate">
                  {description}
                </div>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Current context indicator */}
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 rounded-lg bg-sidebar-accent/50">
            <div className="text-xs text-sidebar-foreground/60">Текущий вид</div>
            <div className="text-sm font-medium text-sidebar-foreground">
              {VIEW_MODE_LABELS[viewMode]} · {getContentLabel()}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
