import { ArrowRight, LucideIcon } from 'lucide-react';
import LevelBadge from './LevelBadge';
import TopicTag from './TopicTag';

export type SubjectType = 'math' | 'science' | 'humanities' | 'languages' | 'arts';

interface SubjectCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  topics: string[];
  level: 'Avanzado' | 'Intermedio' | 'Todos los niveles';
  type: SubjectType;
  delay?: number;
}

const cardStyles: Record<SubjectType, string> = {
  math: 'card-math',
  science: 'card-science',
  humanities: 'card-humanities',
  languages: 'card-languages',
  arts: 'card-arts',
};

const iconStyles: Record<SubjectType, string> = {
  math: 'icon-math',
  science: 'icon-science',
  humanities: 'icon-humanities',
  languages: 'icon-languages',
  arts: 'icon-arts',
};

const SubjectCard = ({ 
  title, 
  description, 
  icon: Icon, 
  topics, 
  level, 
  type,
  delay = 0 
}: SubjectCardProps) => {
  return (
    <div 
      className={`${cardStyles[type]} rounded-3xl p-6 shadow-soft animate-hover-lift opacity-0 animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`icon-container ${iconStyles[type]}`}>
          <Icon size={28} strokeWidth={2} />
        </div>
        <LevelBadge level={level} />
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {topics.map((topic) => (
          <TopicTag key={topic} topic={topic} />
        ))}
      </div>

      <button className="w-full btn-gradient text-primary-foreground font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-soft">
        Comenzar
        <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default SubjectCard;
