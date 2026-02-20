import { GraduationCap, Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header className="text-center mb-12 opacity-0 animate-fade-in">
      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
        <Sparkles size={16} />
        <span className="text-sm font-semibold">Currículo IB + Colombiano</span>
      </div>
      
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-soft">
          <GraduationCap className="text-primary-foreground" size={28} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
          Tutoría Inteligente
        </h1>
      </div>
      
      <p className="text-muted-foreground text-lg max-w-xl mx-auto">
        Selecciona una materia para comenzar tu sesión de tutoría con IA. 
        Diseñado para estudiantes de primaria (1° a 5° grado).
      </p>
    </header>
  );
};

export default Header;
