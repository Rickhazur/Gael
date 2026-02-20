import { ChevronLeft, Volume2, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Language, GradeLevel, Curriculum } from '../../../types/tutor';
import { gradeLabels, curriculumLabels } from '../../../data/mathHints';
import { VocabularyModal } from './VocabularyModal';
import { generateSpeech } from '../../../services/edgeTTS';

interface HeaderProps {
  grade: GradeLevel;
  language: Language;
  tutor: 'lina' | 'rachelle';
  curriculum: Curriculum;
  sessionLabel: string;
  tutorName: string;
  onLanguageChange: (lang: Language) => void;
  onTutorChange: (tutor: 'lina' | 'rachelle') => void;
  onGradeChange: (grade: GradeLevel) => void;
  onCurriculumChange: (curr: Curriculum) => void;
  onBack: () => void;
}

export function Header({
  grade,
  language,
  tutor,
  curriculum,
  sessionLabel,
  tutorName,
  onLanguageChange,
  onTutorChange,
  onGradeChange,
  onCurriculumChange,
  onBack
}: HeaderProps) {

  const handleBack = () => {
    onBack();
  };

  const playVoiceSample = async () => {
    const text = tutor === 'lina'
      ? "¡Hola! Soy la profesora Lina. Estoy lista para ayudarte con tus matemáticas."
      : "Hello! I am Ms. Rachelle. I'm excited to help you master English and Math today!";

    try {
      // Updated to match EdgeTTS signature: (text, tutor)
      await generateSpeech(text, tutor);
    } catch (error) {
      console.error("Error playing voice sample:", error);
    }
  };

  return (
    <header className="flex items-center justify-between px-3 py-2 lg:px-6 lg:py-4 bg-slate-900/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-lg shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-white/20">
            👾
          </div>
          <div>
            <h1 className="font-black text-white text-lg tracking-wide">{tutorName}</h1>
            <span className="text-[10px] font-bold bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 uppercase tracking-widest">
              {sessionLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <div className="flex bg-slate-800/80 rounded-full p-1 border border-slate-700">
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all ${language === 'en'
              ? 'bg-cyan-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            EN
          </button>
          <button
            onClick={() => onLanguageChange('es')}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all ${language === 'es'
              ? 'bg-cyan-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            ES
          </button>
        </div>

        <div className="w-px h-8 bg-slate-700 mx-2" />

        {/* Tutor Selector - Hidden for 1st grade as it is automatic */}
        {grade > 1 && (
          <div className="flex bg-slate-800/80 rounded-full p-1 border border-slate-700 gap-1">
            <button
              onClick={() => onTutorChange('lina')}
              className={`relative group p-0.5 rounded-full transition-all ${tutor === 'lina' ? 'ring-2 ring-cyan-400 bg-cyan-500/20' : 'opacity-50 hover:opacity-100'}`}
              title="Miss Lina"
            >
              <img src="/assets/avatars/lina_avatar.png" className="w-7 h-7 rounded-full object-cover" alt="Lina" />
            </button>
            <button
              onClick={() => onTutorChange('rachelle')}
              className={`relative group p-0.5 rounded-full transition-all ${tutor === 'rachelle' ? 'ring-2 ring-cyan-400 bg-cyan-500/20' : 'opacity-50 hover:opacity-100'}`}
              title="Ms. Rachelle"
            >
              <img src="/assets/avatars/rachelle_avatar.png" className="w-7 h-7 rounded-full object-cover" alt="Rachelle" />
            </button>
          </div>
        )}

        {/* Vocabulary Bank */}
        <div className="[&>button]:text-slate-400 [&>button:hover]:text-white">
          <VocabularyModal />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={playVoiceSample}
          className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
          title={language === 'es' ? "Escuchar voz" : "Hear voice"}
        >
          <Volume2 className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
