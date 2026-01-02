import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { TopTabs } from './TopTabs';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        {/* Main content area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top tabs bar */}
          <div className="px-4 md:px-6 py-3 border-b border-border bg-card/30 flex items-center justify-between gap-4">
            <TopTabs />
            
            {/* Mobile mode selector */}
            <div className="md:hidden">
              <MobileModeToggle />
            </div>
          </div>
          
          {/* Content area with scroll */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}

// Mobile mode toggle component
import { Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

function MobileModeToggle() {
  const { viewMode, setViewMode } = useApp();

  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
      <Button
        variant={viewMode === 'analyse' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('analyse')}
        className="h-8 px-3"
      >
        <Search className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === 'report' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('report')}
        className="h-8 px-3"
      >
        <FileText className="w-4 h-4" />
      </Button>
    </div>
  );
}
