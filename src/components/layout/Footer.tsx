import { Leaf } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/50 py-4">
      <div className="px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1800px] mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Leaf className="w-4 h-4 text-primary" />
          <span>Plant Disease Analyzer</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>© {currentYear} All rights reserved</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Version 1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
