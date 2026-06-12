import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: typeof Inbox;
  action?: React.ReactNode;
}

export function EmptyState({ 
  title = 'Выберите вкладку, чтобы начать анализ',
  description = 'Выберите тип контента и режим в навигации, чтобы начать.',
  icon: Icon = Inbox,
  action
}: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px] animate-fade-in">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <Icon className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          {description}
        </p>
        {action && (
          <div className="flex justify-center">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
