import React, { useState } from 'react';
import type { Grade, Language } from '../../types/research';
import { cn } from '../../lib/utils';
import { Search, ExternalLink, BookOpen, Sparkles, Brain, ArrowRight, Copy, Loader2, Bot } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AvatarDisplay } from '../../../../Gamification/AvatarDisplay';
import { useGamification } from '../../../../../context/GamificationContext';
import { callChatApi } from '../../../../../services/ai_service';
import { toast } from '../../hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ResearchBrowserProps {
  language: Language;
  currentGrade: Grade;
  onGradeChange: (grade: Grade) => void;
  onSearchChange?: (query: string) => void;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  onDataReady?: () => void;
  initialQuery?: string;
}

const gradeLabels: Record<Grade, { es: string; en: string }> = {
  1: { es: '1° Grado', en: '1st Grade' },
  2: { es: '2° Grado', en: '2nd Grade' },
  3: { es: '3° Grado', en: '3rd Grade' },
  4: { es: '4° Grado', en: '4th Grade' },
  5: { es: '5° Grado', en: '5th Grade' },
};

// Topic suggestions by subject
const topicSuggestions: Record<string, string[]> = {
  es: [
    'Sistema solar', 'Dinosaurios', 'Volcanes', 'Océanos',
    'Civilización Maya', 'Antiguo Egipto', 'Animales en peligro',
    'El cuerpo humano', 'Plantas y fotosíntesis', 'Ríos del mundo'
  ],
  en: [
    'Solar system', 'Dinosaurs', 'Volcanoes', 'Oceans',
    'Mayan civilization', 'Ancient Egypt', 'Endangered animals',
    'Human body', 'Plants and photosynthesis', 'World rivers'
  ]
};

export function ResearchBrowser({ language, currentGrade, onGradeChange, onSearchChange, notes, onNotesChange, onDataReady, initialQuery }: ResearchBrowserProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [isSearching, setIsSearching] = useState(false);
  const [librarianResponse, setLibrarianResponse] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { addXP } = useGamification();

  React.useEffect(() => {
    if (initialQuery) {
      const clean = initialQuery.replace(/[¿?]/g, '');
      setSearchQuery(clean);
      // Auto-start librarian for initial query if it's a mission
      if (clean.length > 3 && !librarianResponse) {
        handleConsultLibrarian(clean);
      }
    }
  }, [initialQuery]);

  const handleConsultLibrarian = async (queryOverride?: string) => {
    const q = queryOverride || searchQuery;
    if (!q.trim()) return;

    setIsSearching(true);
    setLibrarianResponse('');
    addXP(5); // Reward for consulting the expert

    try {
      const prompt = language === 'es'
        ? `Actúa como un Bibliotecólogo Inteligente para niños de ${currentGrade}º grado. 
           Tu misión es proporcionar información emocionante, clara y estructurada sobre el tema "${q}".
           REGLAS:
           1. Usa un lenguaje apto para primaria.
           2. Estructura la información con títulos emocionantes.
           3. Usa fuentes equivalentes a NatGeo Kids, Britannica Kids y libros escolares.
           4. Si el tema es científico, explica el concepto de forma visual (con palabras).
           5. Mantén un tono de descubrimiento.
           6. La respuesta debe tener unos 3 párrafos bien estructurados.
           
           Responde en ESPAÑOL.`
        : `Act as a Smart Librarian for ${currentGrade}th grade children. 
           Your mission is to provide exciting, clear, and structured information about the topic "${q}".
           RULES:
           1. Use primary school appropriate language.
           2. Structure the information with exciting titles.
           3. Use sources equivalent to NatGeo Kids, Britannica Kids, and school textbooks.
           4. If the topic is scientific, explain the concept visually (with words).
           5. Maintain a discovery tone.
           6. The response should have about 3 well-structured paragraphs.
           
           Respond in ENGLISH.`;

      const response = await callChatApi([{ role: 'user', content: prompt }], 'gpt-4o-mini', false);
      setLibrarianResponse(response.choices[0].message.content);

      if (onSearchChange) {
        onSearchChange(q);
      }
    } catch (error) {
      console.error("Librarian Error:", error);
      toast({
        title: language === 'es' ? 'Error de conexión' : 'Connection Error',
        description: language === 'es' ? 'El Bibliotecólogo está ocupado, intenta de nuevo.' : 'The Librarian is busy, try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleConsultLibrarian(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleConsultLibrarian();
    }
  };

  const filteredSuggestions = topicSuggestions[language].filter(s =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyToNotes = () => {
    if (!librarianResponse) return;
    const currentNotes = notes || '';
    const newNotes = currentNotes ? `${currentNotes}\n\n--- INFO DEL BIBLIOTECÓLOGO ---\n${librarianResponse}` : librarianResponse;
    if (onNotesChange) onNotesChange(newNotes);

    toast({
      title: language === 'es' ? '¡Información Copiada!' : 'Information Copied!',
      description: language === 'es' ? 'Se ha añadido a tus notas abajo.' : 'Added to your notes below.',
    });
  };

  return (
    <div className={cn(
      "rounded-[2.5rem] transition-all duration-500 overflow-hidden relative",
      isExpanded
        ? "bg-[#0a0f29] border-4 border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.15)] p-8"
        : "bg-gradient-to-r from-indigo-950 to-slate-900 border-2 border-cyan-500/50 hover:border-cyan-400 p-4 shadow-[0_0_20px_rgba(34,211,238,0.2)] group"
    )}>
      {/* Background Decor */}
      {isExpanded && (
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />
      )}

      {/* Header Area */}
      <div
        className="flex items-center justify-between cursor-pointer group relative z-10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-5">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl",
            isExpanded
              ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white rotate-3"
              : "bg-slate-800 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 group-hover:rotate-0"
          )}>
            <BookOpen className={cn("w-7 h-7", isExpanded && "animate-pulse")} />
          </div>
          <div>
            <h4 className={cn(
              "font-fredoka font-black text-2xl tracking-wide transition-all duration-300",
              isExpanded ? "text-white drop-shadow-[0_2px_10px_rgba(34,211,238,0.3)]" : "text-white/80 group-hover:text-cyan-300"
            )}>
              {language === 'es' ? 'BIBLIOTECÓLOGO INTELIGENTE' : 'SMART LIBRARIAN'}
            </h4>
            {isExpanded && (
              <p className="text-xs text-cyan-400/80 font-bold uppercase tracking-[0.2em] mt-1">
                {language === 'es' ? 'Experto en Fuentes Escolares' : 'School Sources Expert'}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          className="rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 px-6 font-black"
        >
          {isExpanded ? (language === 'es' ? 'CERRAR' : 'CLOSE') : (language === 'es' ? 'ABRIR' : 'OPEN')}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-top-6 duration-700 relative z-10">

          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Grade Access */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 rounded-3xl p-3 flex items-center gap-4 min-w-fit pr-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg border-b-4 border-indigo-800">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  {language === 'es' ? 'NIVEL ACADÉMICO' : 'ACADEMIC LEVEL'}
                </span>
                <Select value={String(currentGrade)} onValueChange={(v) => onGradeChange(Number(v) as Grade)}>
                  <SelectTrigger className="border-0 bg-transparent h-7 p-0 focus:ring-0 text-white font-bold h-8 text-lg w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-indigo-500/30 text-white rounded-2xl">
                    {([1, 2, 3, 4, 5] as Grade[]).map((g) => (
                      <SelectItem key={g} value={String(g)} className="cursor-pointer focus:bg-indigo-500/20">
                        {gradeLabels[g][language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Smart Search */}
            <div className="flex-1 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-[1.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
              <div className="relative bg-slate-950 border-2 border-cyan-500/20 rounded-[1.2rem] flex items-center p-1 px-4 pr-1 h-16 shadow-2xl">
                <Search className="w-6 h-6 text-cyan-500/50 mr-3" />
                <Input
                  className="bg-transparent border-0 focus-visible:ring-0 text-white font-bold md:text-xl placeholder:text-slate-600 font-nunito flex-1"
                  placeholder={language === 'es' ? '¿Sobre qué quieres que investigue?' : 'What should I research about?'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.replace(/[¿?]/g, ''))}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  onClick={() => handleConsultLibrarian()}
                  disabled={isSearching || !searchQuery.trim()}
                  className="h-12 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black shadow-lg shadow-cyan-900/20 transition-all active:scale-95"
                >
                  {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : (language === 'es' ? 'CONSULTAR' : 'CONSULT')}
                </Button>

                {/* Suggestions */}
                {showSuggestions && (
                  <div className="absolute left-0 right-0 top-full mt-3 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-2xl p-2 z-50 animate-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-2">
                      {language === 'es' ? 'TEMAS RECOMENDADOS' : 'RECOMMENDED TOPICS'}
                    </div>
                    {topicSuggestions[language].slice(0, 5).map((s, i) => (
                      <button
                        key={i}
                        onMouseDown={() => handleSuggestionClick(s)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-400 font-bold transition-all"
                      >
                        <Sparkles className="w-4 h-4" /> {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Librarian Interface Area */}
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">

            {/* Librarian Avatar Card */}
            <div className="flex flex-col gap-6">
              <div className="bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-cyan-500/30 rounded-[2.5rem] p-6 text-center relative overflow-hidden group shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/20 transition-colors" />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)] flex items-center justify-center overflow-hidden mb-4 p-2 relative">
                    <div className="absolute inset-0 bg-cyan-400/5 animate-pulse" />
                    <Bot className="w-20 h-20 text-cyan-400" />
                  </div>
                  <h5 className="text-xl font-black text-white font-fredoka tracking-wide">
                    {language === 'es' ? 'Sr. Libro' : 'Mr. Book'}
                  </h5>
                  <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-black mt-2 inline-block border border-cyan-500/30">
                    {language === 'es' ? 'BIBLIOTECÓLOGO NIVEL 5' : 'LEVEL 5 LIBRARIAN'}
                  </div>

                  <p className="text-xs text-slate-400 font-medium mt-6 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800 italic">
                    {language === 'es'
                      ? "\"¡Hola! Investigo en las mejores fuentes del mundo para que tu reporte sea el más increíble.\""
                      : "\"Hello! I research the best sources in the world to make your report the most incredible.\""
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Reading/Result Area */}
            <div className="flex flex-col gap-4 min-h-[400px]">
              <div className={cn(
                "flex-1 bg-slate-950/80 border-2 border-slate-800 rounded-[2.5rem] p-8 shadow-inner relative overflow-hidden transition-all duration-500",
                isSearching && "animate-pulse border-cyan-500/30"
              )}>

                {!librarianResponse && !isSearching ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40">
                    <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-700 flex items-center justify-center mb-6">
                      <ArrowRight className="w-10 h-10 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400 italic">
                      {language === 'es' ? 'Esperando una consulta energética...' : 'Waiting for a curious query...'}
                    </h3>
                  </div>
                ) : isSearching ? (
                  <div className="h-full flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-cyan-500/20 rounded-full" />
                      <div className="absolute inset-0 border-t-4 border-cyan-500 rounded-full animate-spin" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-cyan-400 font-black text-lg animate-pulse tracking-widest">
                        {language === 'es' ? 'ESCANEANDO ARCHIVOS' : 'SCANNING ARCHIVES'}
                      </h4>
                      <p className="text-slate-500 text-xs font-bold mt-2 font-mono">
                        {language === 'es' ? 'PROCESANDO FUENTES PEDAGÓGICAS...' : 'PROCESSING PEDAGOGICAL SOURCES...'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 prose prose-invert prose-cyan max-w-none animate-in fade-in duration-1000">
                    <div className="font-nunito text-slate-300 leading-relaxed text-lg whitespace-pre-wrap selection:bg-cyan-500/30">
                      {librarianResponse}
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent my-8" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-[10px] font-black uppercase">
                          {language === 'es' ? 'Fuentes Verificadas' : 'Verified Sources'}
                        </div>
                        <div className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase">
                          {language === 'es' ? 'Contenido Seguro' : 'Safe Content'}
                        </div>
                      </div>

                      <Button
                        onClick={handleCopyToNotes}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-8 h-12 rounded-2xl shadow-lg transform transition-transform active:scale-95 flex items-center gap-3"
                      >
                        <Copy className="w-5 h-5" />
                        {language === 'es' ? 'Añadir esta Info a mi Borrador' : 'Add this Info to my Draft'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Evidence Collection Area Integrated */}
          {(onNotesChange) && (
            <div className="animate-in fade-in duration-500 pt-6">
              <div className="bg-gradient-to-r from-emerald-900/40 via-slate-900 to-slate-950 border-2 border-emerald-500/30 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-emerald-500 -mr-10 -mt-10">
                  <Copy className="w-32 h-32" />
                </div>

                <div className="flex items-center gap-5 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 shadow-[0_4px_0_rgb(5,150,105)] flex items-center justify-center text-white">
                    <span className="text-3xl">📋</span>
                  </div>
                  <div>
                    <h4 className="text-white font-black font-fredoka text-2xl tracking-wide">
                      {language === 'es' ? 'TU BORRADOR DE INVESTIGACIÓN' : 'YOUR RESEARCH DRAFT'}
                    </h4>
                    <p className="text-emerald-400/80 text-sm font-bold tracking-wide">
                      {language === 'es'
                        ? 'Pega aquí la información clave que el bibliotecólogo encontró para ti.'
                        : 'Paste here the key information the librarian found for you.'}
                    </p>
                  </div>
                </div>

                <textarea
                  value={notes || ''}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder={language === 'es'
                    ? "Aquí se guardará tu investigación. El Bibliotecólogo te ayudará a llenarla..."
                    : "Your research will be saved here. The Librarian will help you fill it..."}
                  className="w-full h-48 bg-slate-950/80 border-2 border-emerald-500/20 rounded-[1.8rem] p-6 text-emerald-100 placeholder:text-emerald-800/40 focus:ring-4 focus:ring-emerald-500/20 outline-none resize-none transition-all font-nunito text-lg leading-relaxed shadow-inner"
                />

                {/* Progress bar and Finish Button */}
                <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-emerald-500/10">
                  <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                        style={{ width: `${Math.min(((notes || '').length / 500) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-emerald-400 font-black text-sm whitespace-nowrap">
                      {(notes || '').length} CHARS
                    </span>
                  </div>

                  <Button
                    onClick={() => onDataReady && onDataReady()}
                    disabled={!notes || notes.length < 15}
                    className="w-full md:w-auto px-10 h-14 bg-green-500 hover:bg-green-400 text-slate-900 font-black text-xl rounded-2xl shadow-[0_6px_0_rgb(5,150,105)] active:translate-y-1.5 active:shadow-none transition-all disabled:grayscale disabled:opacity-50"
                  >
                    {language === 'es' ? '¡HE TERMINADO DE INVESTIGAR!' : 'I FINISHED RESEARCHING!'}
                    <span className="ml-3">🚀</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mission Status Decals */}
          <div className="flex flex-wrap gap-4 opacity-50">
            <div className="bg-slate-800/40 px-4 py-2 rounded-xl border border-slate-700 text-[10px] text-slate-500 font-mono tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              FEDERATED SOURCES SYNC: OK
            </div>
            <div className="bg-slate-800/40 px-4 py-2 rounded-xl border border-slate-700 text-[10px] text-slate-500 font-mono tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              KIDS_PROTECT_PROTOCOL: v4.2
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
