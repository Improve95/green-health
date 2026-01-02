import { Camera, Video, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import type { ContentType } from '@/types/app';

const tabs: { id: ContentType; label: string; icon: typeof Camera }[] = [
  { id: 'photo', label: 'Photo', icon: Camera },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'streaming', label: 'Streaming', icon: Radio },
];

export function TopTabs() {
  const { contentType, setContentType } = useApp();

  return (
    <nav 
      className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl"
      role="tablist"
      aria-label="Content type"
    >
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          role="tab"
          aria-selected={contentType === id}
          aria-controls={`${id}-panel`}
          onClick={() => setContentType(id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            contentType === id
              ? 'bg-card text-foreground shadow-soft'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          )}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </nav>
  );
}
