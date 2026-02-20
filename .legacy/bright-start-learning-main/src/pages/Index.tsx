import Header from '@/components/Header';
import GradeSelector from '@/components/GradeSelector';
import SubjectsGrid from '@/components/SubjectsGrid';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-10 px-4">
        <Header />
        <GradeSelector />
        <SubjectsGrid />
        
        <footer className="mt-16 text-center text-sm text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <p>📚 Alineado con estándares IB y currículo colombiano</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
