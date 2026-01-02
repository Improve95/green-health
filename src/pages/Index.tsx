import { AppProvider } from '@/contexts/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { ContentRouter } from '@/components/ContentRouter';

const Index = () => {
  return (
    <AppProvider>
      <MainLayout>
        <ContentRouter />
      </MainLayout>
    </AppProvider>
  );
};

export default Index;
