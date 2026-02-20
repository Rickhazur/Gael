import { Calculator, FlaskConical, BookOpen, Languages, Palette } from 'lucide-react';
import SubjectCard from './SubjectCard';

const subjects = [
  {
    title: 'Matemáticas',
    description: 'Domina conceptos numéricos, operaciones y resolución de problemas de forma divertida.',
    icon: Calculator,
    topics: ['Álgebra', 'Geometría', 'Estadística', 'Aritmética'],
    level: 'Todos los niveles' as const,
    type: 'math' as const,
  },
  {
    title: 'Ciencias Naturales',
    description: 'Explora el mundo que te rodea con experimentos y descubrimientos científicos.',
    icon: FlaskConical,
    topics: ['Biología', 'Física', 'Química', 'Medio Ambiente'],
    level: 'Intermedio' as const,
    type: 'science' as const,
  },
  {
    title: 'Humanidades',
    description: 'Viaja por la historia, conoce geografía y aprende sobre ciudadanía.',
    icon: BookOpen,
    topics: ['Historia', 'Geografía', 'Ciudadanía'],
    level: 'Todos los niveles' as const,
    type: 'humanities' as const,
  },
  {
    title: 'Idiomas',
    description: 'Desarrolla habilidades bilingües en español, inglés y más.',
    icon: Languages,
    topics: ['Español', 'Inglés', 'Lectura', 'Escritura'],
    level: 'Todos los niveles' as const,
    type: 'languages' as const,
  },
  {
    title: 'Arte y Educación Física',
    description: 'Expresa tu creatividad y mantente activo con música, arte y deportes.',
    icon: Palette,
    topics: ['Música', 'Artes Visuales', 'Deportes'],
    level: 'Todos los niveles' as const,
    type: 'arts' as const,
  },
];

const SubjectsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.map((subject, index) => (
        <SubjectCard
          key={subject.title}
          {...subject}
          delay={index * 100}
        />
      ))}
    </div>
  );
};

export default SubjectsGrid;
