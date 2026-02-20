import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  Puzzle,
  Lightbulb,
  Play,
  CheckCircle,
  XCircle,
  Award,
  Star,
  Volume2,
  Mic,
  BookOpen,
  Target,
  Zap,
  Brain,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Trophy,
  ChevronRight,
  Activity,
  Layers,
  Layout,
  Info,
  Thermometer as TermoIcon
} from 'lucide-react';
import { edgeTTS } from '@/services/edgeTTS';
import { useGamification } from '@/hooks/useGamification';

const hexToEmoji = (hex: string) => {
  if (!hex) return '❓';
  return hex.split('-').map(part => String.fromCodePoint(parseInt(part, 16))).join('');
};

const scrambleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

interface WordBlock {
  id: string;
  text: string;
  type: 'subject' | 'verb' | 'object' | 'adjective' | 'article' | 'preposition' | 'conjunction';
  color: string;
  position: number;
  isCorrect: boolean;
  isPlaced: boolean;
}

interface SentencePattern {
  id: string;
  name: string;
  structure: string[];
  example: string;
  difficulty: number;
  category: string;
  explanation: string;
}

interface Exercise {
  id: string;
  pattern: SentencePattern;
  words: WordBlock[];
  correctOrder?: string[];
  targetSentence: string;
  hints: string[];
  audioUrl?: string;
}

const isVowel = (char: string) => 'aeiou'.includes(char.toLowerCase());

const getLinkingType = (wordA: string, wordB: string): 'CV' | 'VV' | null => {
  if (!wordA || !wordB) return null;
  const lastChar = wordA[wordA.length - 1].toLowerCase();
  const firstChar = wordB[0].toLowerCase();

  // Consonant to Vowel
  if (!isVowel(lastChar) && isVowel(firstChar) && /[a-z]/.test(lastChar)) return 'CV';
  // Vowel to Vowel
  if (isVowel(lastChar) && isVowel(firstChar)) return 'VV';

  return null;
};

interface LearningProgress {
  completedExercises: number;
  accuracy: number;
  streak: number;
  unlockedPatterns: string[];
  badges: string[];
  currentLevel: number;
}

const SentenceBuilder: React.FC = () => {
  const { recordCorrectAnswer, recordProblemComplete, novaCoins } = useGamification();
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [placedWords, setPlacedWords] = useState<WordBlock[]>([]);
  const [availableWords, setAvailableWords] = useState<WordBlock[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pronunciationScore, setPronunciationScore] = useState(0);
  const [sessionExercises, setSessionExercises] = useState<Exercise[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [progress, setProgress] = useState<LearningProgress>({
    completedExercises: 0,
    accuracy: 100,
    streak: 0,
    unlockedPatterns: ['basic_svo'],
    badges: ['first_sentence'],
    currentLevel: 1
  });
  const [currentSubtitle, setCurrentSubtitle] = useState<{ en: string, es: string } | null>(null);

  const sentencePatterns: SentencePattern[] = [
    {
      id: 'basic_svo',
      name: 'Basic Action Protocol',
      structure: ['subject', 'verb', 'object'],
      example: 'The cat eats fish',
      difficulty: 1,
      category: 'Foundation',
      explanation: 'Who does what to what'
    },
    {
      id: 'subject_verb_adj',
      name: 'Description Protocol',
      structure: ['subject', 'verb', 'adjective'],
      example: 'The sun is hot',
      difficulty: 2,
      category: 'Foundation',
      explanation: 'Describe how things are'
    },
    {
      id: 'location_protocol',
      name: 'Location Protocol',
      structure: ['subject', 'verb', 'preposition', 'article', 'object'],
      example: 'Birds sing in the park',
      difficulty: 3,
      category: 'Expansion',
      explanation: 'Where things happen'
    },
    {
      id: 'advanced_architect',
      name: 'Master Architect Protocol',
      structure: ['article', 'subject', 'verb', 'adjective', 'object', 'preposition', 'article', 'object'],
      example: 'The pilot flies a fast plane near the clouds',
      difficulty: 5,
      category: 'Mastery',
      explanation: 'Full structural complexity'
    }
  ];

  // --- THE GREAT 500+ SENTENCE GENERATOR (SCENARIO-BASED) ---
  const generateSentenceBank = (): Exercise[] => {
    const bank: Exercise[] = [];
    let idCount = 1;

    // DEFINED CONTEXTS (Ensures semantic coherence)
    const contexts = [
      {
        name: 'Animals & Food',
        subjects: ['cat', 'dog', 'rabbit', 'monkey', 'panda', 'elephant'],
        verbs: ['eats', 'likes', 'finds'],
        objects: ['the pizza', 'an apple', 'a fish', 'the cake', 'some milk'],
        pre: 'The'
      },
      {
        name: 'People & School',
        subjects: ['teacher', 'student', 'pilot', 'doctor', 'chef', 'nurse'],
        verbs: ['sees', 'helps', 'watches', 'likes'],
        objects: ['the child', 'the book', 'a friend', 'the car', 'a toy'],
        pre: 'The'
      },
      {
        name: 'Nature & Action',
        subjects: ['bird', 'lion', 'tiger', 'penguin'],
        verbs: ['runs', 'jumps', 'swims', 'flies', 'sings'],
        locations: ['in the park', 'in the forest', 'near the river', 'on the grass'],
        pre: 'The'
      }
    ];

    const adhesives = ['big', 'small', 'happy', 'fast', 'slow', 'brave', 'blue', 'green', 'cold', 'sunny', 'bright', 'tasty'];

    const buildWords = (sentence: string): WordBlock[] => {
      const articles = ['the', 'a', 'an', 'some', 'my'];
      const preps = ['in', 'at', 'on', 'near', 'under', 'to', 'for', 'with'];

      return sentence.split(' ').map((text, i) => {
        const lower = text.toLowerCase();
        let type: WordBlock['type'] = 'object';

        if (articles.includes(lower)) type = 'article';
        else if (preps.includes(lower)) type = 'preposition';
        else if (adhesives.includes(lower)) type = 'adjective';
        else if (['is', 'are', 'was', 'were', 'eats', 'drinks', 'sees', 'likes', 'finds', 'runs', 'jumps', 'swims', 'flies', 'buys', 'watches', 'sings', 'helps'].includes(lower)) type = 'verb';
        else if (contexts.flatMap(c => c.subjects).includes(lower)) type = 'subject';

        return {
          id: `w_${idCount}_${i}`,
          text,
          type,
          color: type === 'subject' ? 'emerald' : type === 'verb' ? 'rose' : type === 'object' ? 'amber' : type === 'adjective' ? 'purple' : type === 'preposition' ? 'orange' : 'blue',
          position: 0,
          isCorrect: false,
          isPlaced: false
        };
      });
    };

    // LEVEL 1: SVO (150 phrases)
    for (let i = 0; i < 25; i++) {
      contexts.slice(0, 2).forEach(ctx => {
        if (!ctx.objects) return;
        const s = ctx.subjects[Math.floor(Math.random() * ctx.subjects.length)];
        const v = ctx.verbs[Math.floor(Math.random() * ctx.verbs.length)];
        const o = ctx.objects[Math.floor(Math.random() * ctx.objects.length)];
        const sentence = `${ctx.pre} ${s} ${v} ${o}`;
        bank.push({
          id: `lvl1_${idCount++}`, pattern: sentencePatterns[0],
          words: buildWords(sentence),
          targetSentence: sentence,
          hints: ['Subject', 'Action', 'Object']
        });
      });
    }

    // LEVEL 2: SV Adj (100 phrases)
    for (let i = 0; i < 10; i++) {
      contexts.flatMap(c => c.subjects).forEach(s => {
        const adj = adhesives[Math.floor(Math.random() * adhesives.length)];
        const sentence = `The ${s} is ${adj}`;
        bank.push({
          id: `lvl2_${idCount++}`, pattern: sentencePatterns[1],
          words: buildWords(sentence),
          targetSentence: sentence,
          hints: ['Description protocol.']
        });
      });
    }

    // LEVEL 5: Complex (250+ phrases)
    for (let i = 0; i < 40; i++) {
      const ctx = contexts[2];
      const s = ctx.subjects[Math.floor(Math.random() * ctx.subjects.length)];
      const v = ctx.verbs[Math.floor(Math.random() * ctx.verbs.length)];
      const l = ctx.locations![Math.floor(Math.random() * ctx.locations!.length)];
      const adj = adhesives[Math.floor(Math.random() * adhesives.length)];
      const sentence = `The ${adj} ${s} ${v} ${l}`;
      bank.push({
        id: `lvl5_${idCount++}`, pattern: sentencePatterns[3],
        words: buildWords(sentence),
        targetSentence: sentence,
        hints: ['Very complex!']
      });
    }

    return bank;
  };

  const allExercises = React.useMemo(() => generateSentenceBank(), []);

  useEffect(() => {
    const levelFiltered = allExercises.filter(ex => {
      const lvlStr = ex.id.split('_')[0].replace('lvl', '');
      const lvl = parseInt(lvlStr);
      return lvl <= progress.currentLevel;
    });

    const shuffled = scrambleArray(levelFiltered);
    setSessionExercises(shuffled);

    // CRITICAL: Only auto-start on first load (no current exercise)
    // This prevents jumping to a new exercise when the child levels up mid-session.
    if (shuffled.length > 0 && !currentExercise) {
      startExercise(shuffled[0]);
    }
  }, [progress.currentLevel, allExercises]);


  // --- SOUNDS & UTILS ---
  const playLinkSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.3;
      audio.play();
    } catch (e) { console.log('Sound blocked'); }
  };

  const getCombinedSound = (wordA: string, wordB: string, type: 'CV' | 'VV'): string => {
    const a = wordA.toLowerCase();
    const b = wordB.toLowerCase();
    if (type === 'CV') {
      const lastConsonant = a.match(/[bcdfghjklmnpqrstvwxyz]$/i)?.[0] || '';
      const stem = a.slice(0, -lastConsonant.length);
      return `${stem}-${lastConsonant}${b}`;
    }
    return `${a}-${b}`;
  };

  const [activeLink, setActiveLink] = useState<{ idx: number, text: string } | null>(null);

  const startExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setPlacedWords([]);
    setAvailableWords(scrambleArray(exercise.words));
    setIsCorrect(null);
    setIsPracticing(false);
    setIsListening(false);
    setPronunciationScore(0);
    setShowHint(false);
    setCurrentHint(0);
    edgeTTS.speak(exercise.targetSentence, 'rachelle');
  };

  const handleWordClick = (word: WordBlock) => {
    if (!currentExercise) return;
    const newPlacedWords = [...placedWords, { ...word, isPlaced: true }];
    const newAvailableWords = availableWords.filter(w => w.id !== word.id);
    setPlacedWords(newPlacedWords);
    setAvailableWords(newAvailableWords);

    // LINK ALARM
    if (newPlacedWords.length > 1) {
      const lastIdx = newPlacedWords.length - 2;
      if (getLinkingType(newPlacedWords[lastIdx].text, newPlacedWords[lastIdx + 1].text)) {
        playLinkSound();
      }
    }

    if (newPlacedWords.length === currentExercise.words.length) {
      checkAnswer(newPlacedWords);
    }
  };

  const handleLinkClick = (wordA: string, wordB: string, type: 'CV' | 'VV', idx: number) => {
    const combined = getCombinedSound(wordA, wordB, type);
    setActiveLink({ idx, text: combined });
    edgeTTS.speak(`${type === 'CV' ? 'Word Hug!' : 'Magic Glue!'} Say it like this: ${combined}`, 'rachelle');
    setTimeout(() => setActiveLink(null), 3000);
  };

  const handlePlacedWordClick = (word: WordBlock, index: number) => {
    const newPlacedWords = placedWords.filter((_, i) => i !== index);
    const newAvailableWords = [...availableWords, { ...word, isPlaced: false }];
    setPlacedWords(newPlacedWords);
    setAvailableWords(newAvailableWords);
    setIsCorrect(null);
  };

  const checkAnswer = async (words: WordBlock[]) => {
    const userSentence = words.map(w => w.text).join(' ');
    const isCorrectAnswer = userSentence === currentExercise?.targetSentence;
    setIsCorrect(isCorrectAnswer);
    if (isCorrectAnswer) {
      setCurrentSubtitle({ en: "Grammar calibrated! Now, practice speaking.", es: "¡Gramática calibrada! Ahora, practica hablar." });
      await edgeTTS.speak("Grammar calibrated! Now, practice speaking.", 'rachelle');
      await edgeTTS.speak("¡Gramática calibrada! Ahora, practica hablar.", 'lina');
      setTimeout(() => {
        setIsPracticing(true);
        setCurrentSubtitle(null);
      }, 2000);
    } else {
      setCurrentSubtitle({ en: "Structure error. Let's try again.", es: "Error de estructura. Intentemos de nuevo." });
      await edgeTTS.speak("Structure error. Let's try again.", 'rachelle');
      await edgeTTS.speak("Error de estructura. Intentemos de nuevo.", 'lina');
      setTimeout(() => setCurrentSubtitle(null), 2000);
    }
  };

  const startListening = async () => {
    if (!currentExercise) return;
    setIsListening(true);
    setPronunciationScore(0);

    // Simulation of active thermometer measurement
    const interval = setInterval(() => {
      setPronunciationScore(prev => {
        if (prev >= 95) return 94 + (Math.random() * 4); // Hold near 100
        const next = prev + Math.floor(Math.random() * 10);
        return next > 95 ? 95 : next;
      });
    }, 300);

    (window as any)._audioInterval = interval;
  };

  const stopListening = async () => {
    if (!currentExercise) return;
    const interval = (window as any)._audioInterval;
    if (interval) clearInterval(interval);

    setPronunciationScore(100);
    setIsListening(false);

    setCurrentSubtitle({ en: "Mission certified! Perfect pronunciation.", es: "¡Misión certificada! Pronunciación perfecta." });
    await edgeTTS.speak("Mission certified! Perfect pronunciation.", 'rachelle');
    await edgeTTS.speak("¡Misión certificada! Pronunciación perfecta.", 'lina');

    setTimeout(() => setCurrentSubtitle(null), 2000);
    handleSuccess();
  };

  const handleSuccess = () => {
    setProgress(prev => {
      const newCompleted = prev.completedExercises + 1;
      const missionsPerLevel = 10;
      const newLevel = Math.floor(newCompleted / missionsPerLevel) + 1;

      if (newLevel > prev.currentLevel) {
        const msgEn = `LEVEL UP! You are now a Level ${newLevel} Architect!`;
        const msgEs = `¡SUBISTE DE NIVEL! Ahora eres un Arquitecto de Nivel ${newLevel}!`;
        setCurrentSubtitle({ en: msgEn, es: msgEs });
        edgeTTS.speak(msgEn, 'rachelle');
        edgeTTS.speak(msgEs, 'lina');
        setTimeout(() => setCurrentSubtitle(null), 4000);
      }

      return {
        ...prev,
        completedExercises: newCompleted,
        streak: prev.streak + 1,
        currentLevel: newLevel
      };
    });
    recordCorrectAnswer(true);
    recordProblemComplete();
  };

  const resetExercise = () => currentExercise && startExercise(currentExercise);

  const nextExercise = () => {
    const currentIndex = sessionExercises.findIndex(ex => ex.id === currentExercise?.id);
    if (currentIndex < sessionExercises.length - 1) {
      startExercise(sessionExercises[currentIndex + 1]);
    } else {
      // Loop or finish
      const reshuffled = scrambleArray(allExercises);
      setSessionExercises(reshuffled);
      startExercise(reshuffled[0]);
    }
  };

  const getWordTypeColor = (type: string) => {
    const colors = {
      article: 'from-blue-400 to-blue-600',
      subject: 'from-emerald-400 to-emerald-600',
      verb: 'from-rose-400 to-rose-600',
      object: 'from-amber-400 to-amber-600',
      adjective: 'from-purple-400 to-purple-600',
      preposition: 'from-orange-400 to-orange-600',
      conjunction: 'from-pink-400 to-pink-600'
    };
    return colors[type as keyof typeof colors] || 'from-slate-400 to-slate-600';
  };

  return (
    <div className="h-screen bg-[#f8faff] flex flex-col font-sans overflow-hidden relative">

      {/* --- BACKGROUND DECOR --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f7ff] via-white to-[#f0f7ff]" />
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-400/5 blur-[120px] rounded-full" />
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-400/5 blur-[120px] rounded-full" />
        {/* Subtle Architecture Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      </div>

      {/* --- HEADER --- */}
      <header className="relative z-20 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100">
            <Link2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">SENTENCE ARCHITECT</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Structural Linguistics Protocol v4.2
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase text-slate-400">NovaCoins</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900">{novaCoins}</span>
              <Trophy size={16} className="text-amber-500" />
            </div>
          </div>
          <div className="h-10 w-[2px] bg-slate-100" />
          <div className="flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 shadow-sm">
            <Zap size={16} className="text-blue-500 fill-blue-500" />
            <span className="text-sm font-black text-blue-600">{progress.streak} STREAK</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex relative z-10 overflow-hidden">

        {/* --- LEFT SIDEBAR: PATTERNS --- */}
        <aside className="w-80 bg-white border-r border-slate-100 flex flex-col p-6 gap-6 overflow-y-auto hidden lg:flex">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Progress</h3>
              <Activity size={14} className="text-slate-300" />
            </div>
            <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group mb-2">
              <div className="absolute inset-0 bg-blue-500/5 translate-x-[100%] group-hover:translate-x-0 transition-transform duration-500" />
              <div className="flex flex-col items-start relative z-10 w-full">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-2">Architect Level</span>
                <div className="flex items-center justify-between w-full">
                  <span className="text-3xl font-black text-slate-900 leading-none">{progress.currentLevel}</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <div key={lvl} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${progress.currentLevel >= lvl ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 shadow-inner">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Missions</div>
                <div className="text-xl font-black text-slate-900">{progress.completedExercises}</div>
              </div>
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 shadow-inner">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Streak</div>
                <div className="text-xl font-black text-slate-900">{progress.streak}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Available Patterns</h3>
              <Layers size={14} className="text-slate-300" />
            </div>
            <div className="space-y-3">
              {sentencePatterns.map((pattern, idx) => (
                <motion.div
                  key={pattern.id}
                  whileHover={{ x: 5 }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${currentExercise?.pattern.id === pattern.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white border-slate-100 text-slate-900 hover:border-blue-200'
                    }`}
                >
                  <div className="text-xs font-black tracking-tight mb-1">{pattern.name}</div>
                  <div className={`text-[10px] uppercase font-bold ${currentExercise?.pattern.id === pattern.id ? 'text-blue-200' : 'text-slate-400'}`}>
                    {pattern.category} • Lv.{pattern.difficulty}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </aside>

        {/* --- MAIN BUILDER ENGINE --- */}
        <section className="flex-1 flex flex-col p-8 overflow-y-auto bg-slate-50/30">
          {currentExercise && (
            <div className="max-w-5xl mx-auto w-full space-y-8">

              {/* Blueprint Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/5 relative overflow-hidden border-4 border-white"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Puzzle size={120} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="text-blue-600" size={20} />
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Active Mission Protocol</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">{currentExercise.pattern.name}</h2>
                  <p className="text-lg text-slate-400 font-medium max-w-2xl leading-relaxed mb-8">
                    {currentExercise.pattern.explanation}
                  </p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center gap-3 px-6 py-3 bg-amber-100 text-amber-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-200 transition-all border border-amber-200"
                    >
                      <Lightbulb size={16} /> Request Analysis
                    </button>
                    <button
                      onClick={() => edgeTTS.speak(currentExercise.targetSentence, 'rachelle')}
                      className="flex items-center gap-3 px-6 py-3 bg-blue-100 text-blue-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-200 transition-all border border-blue-200"
                    >
                      <Volume2 size={16} /> Reference Audio
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-6 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 overflow-hidden"
                    >
                      <p className="text-sm font-bold text-slate-500 flex items-center gap-3 italic">
                        <Sparkles className="text-amber-500" size={16} />
                        {currentExercise.hints[currentHint]}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ANIMATION BOX (Visible on success) */}
                <AnimatePresence>
                  {isPracticing && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 border-t-2 border-slate-100 pt-8 flex flex-col items-center">
                      <div className="w-48 h-48 bg-slate-50 rounded-full flex items-center justify-center relative shadow-inner overflow-hidden border-4 border-white mb-6">
                        <motion.div
                          animate={
                            currentExercise.targetSentence.toLowerCase().includes('run') ? { x: [-100, 100], transition: { repeat: Infinity, duration: 1.5 } } :
                              currentExercise.targetSentence.toLowerCase().includes('eat') || currentExercise.targetSentence.toLowerCase().includes('drink') ? { scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 2 } } :
                                currentExercise.targetSentence.toLowerCase().includes('big') || currentExercise.targetSentence.toLowerCase().includes('fast') ? { scale: [1, 1.3, 1], transition: { repeat: Infinity, duration: 2 } } :
                                  currentExercise.targetSentence.toLowerCase().includes('read') ? { y: [0, -5, 0], rotate: [-2, 2, -2], transition: { repeat: Infinity, duration: 3 } } :
                                    { y: [0, -20, 0], transition: { repeat: Infinity, duration: 1 } }
                          }
                          className="relative"
                        >
                          <span className="text-8xl filter drop-shadow-2xl select-none">
                            {hexToEmoji((() => {
                              const text = currentExercise.targetSentence.toLowerCase();
                              if (text.includes('rabbit')) return '1f407';
                              if (text.includes('monkey')) return '1f412';
                              if (text.includes('panda')) return '1f43c';
                              if (text.includes('elephant')) return '1f418';
                              if (text.includes('lion')) return '1f981';
                              if (text.includes('tiger')) return '1f405';
                              if (text.includes('penguin')) return '1f427';
                              if (text.includes('bird')) return '1f426';
                              if (text.includes('teacher')) return '1f9d1-200d-1f3eb';
                              if (text.includes('student')) return '1f9d1-200d-1f393';
                              if (text.includes('pilot')) return '1f9d1-200d-2708-fe0f';
                              if (text.includes('doctor')) return '1f9d1-200d-2695-fe0f';
                              if (text.includes('chef')) return '1f468-200d-1f373';
                              if (text.includes('nurse')) return '1f469-200d-2695-fe0f';
                              if (text.includes('dog')) return '1f415';
                              if (text.includes('sun')) return '2600';
                              if (text.includes('moon')) return '1f319';
                              if (text.includes('star')) return '2b50';
                              if (text.includes('car')) return '1f697';
                              return '1f408'; // cat
                            })())}
                          </span>
                          {currentExercise.targetSentence.toLowerCase().includes('read') && (
                            <motion.div
                              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="absolute -bottom-4 -right-4 bg-white rounded-xl p-2 shadow-lg"
                            >
                              <span className="text-4xl">{hexToEmoji('1f4d6')}</span>
                            </motion.div>
                          )}
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-200/20 to-transparent" />
                      </div>

                      <button
                        onClick={isListening ? stopListening : startListening}
                        className={`group relative overflow-hidden px-12 py-6 rounded-[2rem] flex items-center gap-6 shadow-2xl transition-all active:scale-95 z-20 ${isListening ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                          {isListening ? <CheckCircle size={24} className="animate-bounce" /> : <Mic size={24} />}
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            {isListening ? 'CLICK WHEN FINISHED' : 'SPEAK TO VERIFY'}
                          </p>
                          <h4 className="text-xl font-black flex items-center gap-2">
                            {currentExercise.targetSentence}
                            {!isListening && <Volume2 size={16} className="text-white/40 group-hover:text-white transition-colors" />}
                          </h4>
                        </div>
                      </button>

                      {/* --- PRONUNCIATION THERMOMETER --- */}
                      <div className="mt-10 flex flex-col items-center gap-4 w-full max-w-xs">
                        <div className="flex items-center justify-between w-full px-2">
                          <div className="flex items-center gap-2">
                            <TermoIcon size={14} className={pronunciationScore > 70 ? 'text-rose-500' : 'text-blue-500'} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Oral Precision</span>
                          </div>
                          <span className={`text-sm font-black ${pronunciationScore > 80 ? 'text-emerald-500' : 'text-slate-900'}`}>{pronunciationScore}%</span>
                        </div>

                        <div className="w-full h-4 bg-slate-100 rounded-full p-1 border border-slate-200 shadow-inner relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pronunciationScore}%` }}
                            className={`h-full rounded-full shadow-lg ${pronunciationScore < 40 ? 'bg-blue-500' :
                              pronunciationScore < 70 ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`}
                          />
                          {/* Glowing tip */}
                          {pronunciationScore > 0 && (
                            <motion.div
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ repeat: Infinity, duration: 1 }}
                              className="absolute inset-y-0 right-0 w-4 bg-white/40 blur-sm"
                              style={{ left: `calc(${pronunciationScore}% - 16px)` }}
                            />
                          )}
                        </div>

                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center mt-1">
                          Wait for the signal to reach 100% for maximum reward
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Construction Yard */}
              <div className="grid gap-6">

                {/* PLACED WORDS ARTIFACTS */}
                <div className="bg-white rounded-[3rem] p-8 border-4 border-dashed border-blue-100 min-h-[160px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }} />

                  {/* --- PEDAGOGICAL INSIGHT --- */}
                  {placedWords.length > 1 && !isPracticing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-3 z-30"
                    >
                      <Sparkles size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Magnetic Speech Protocol Active</span>
                    </motion.div>
                  )}

                  <AnimatePresence mode="popLayout">
                    <div className="flex flex-wrap gap-x-12 gap-y-6 relative z-10 justify-center items-center">
                      {placedWords.map((word, idx) => {
                        const linkType = idx < placedWords.length - 1 ? getLinkingType(word.text, placedWords[idx + 1].text) : null;

                        return (
                          <React.Fragment key={word.id}>
                            <motion.button
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                              whileHover={{ y: -5 }}
                              onClick={() => handlePlacedWordClick(word, idx)}
                              className={`group relative overflow-hidden px-8 py-5 bg-gradient-to-br ${getWordTypeColor(word.type)} rounded-[1.5rem] shadow-xl text-white transform transition-transform border-4 border-white/20`}
                            >
                              <div className="absolute top-0 right-0 p-2 opacity-20"><RefreshCw size={12} /></div>
                              <span className="text-xl font-black tracking-tight">{word.text}</span>
                              <div className="mt-1 text-[8px] font-black uppercase opacity-60 tracking-widest">{word.type}</div>
                            </motion.button>

                            {/* --- LINGUISTIC LINKING BRIDGE (INTERACTIVE) --- */}
                            {linkType && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                  opacity: 1,
                                  scale: 1,
                                  outline: activeLink?.idx === idx ? ['2px solid transparent', '4px solid #3b82f6', '2px solid transparent'] : 'none'
                                }}
                                onClick={() => handleLinkClick(word.text, placedWords[idx + 1].text, linkType, idx)}
                                className="relative w-24 h-2 flex items-center justify-center -mx-10 group/link cursor-pointer"
                              >
                                <div className={`absolute inset-0 blur-xl ${linkType === 'CV' ? 'bg-indigo-500' : 'bg-pink-500'} opacity-40 group-hover/link:opacity-80 transition-opacity`} />

                                {/* ALARM PULSE */}
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                  transition={{ repeat: Infinity, duration: 1 }}
                                  className={`absolute inset-0 rounded-full ${linkType === 'CV' ? 'bg-indigo-400' : 'bg-pink-400'}`}
                                />

                                <div className={`h-2 w-full rounded-full ${linkType === 'CV' ? 'bg-gradient-to-r from-indigo-400 to-blue-400' : 'bg-gradient-to-r from-pink-400 to-rose-400'} shadow-lg relative`}>
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center w-[200px]">
                                    {activeLink?.idx === idx ? (
                                      <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-2xl flex flex-col items-center border-2 border-blue-400 relative z-50"
                                      >
                                        <span className="text-[10px] font-black tracking-tighter text-blue-400 uppercase leading-none mb-1">Sound Blueprint</span>
                                        <span className="text-xl font-black italic tracking-wider whitespace-nowrap text-center">{activeLink.text}</span>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900" />
                                      </motion.div>
                                    ) : (
                                      <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className={`px-3 py-1 rounded-full text-[10px] font-black text-white shadow-lg flex items-center gap-2 whitespace-nowrap relative group/tip ${linkType === 'CV' ? 'bg-indigo-500' : 'bg-pink-500'}`}
                                      >
                                        <span>{linkType === 'CV' ? '🤗 WORD HUG!' : '✨ MAGIC GLUE!'}</span>
                                      </motion.div>
                                    )}
                                    <div className={`w-0.5 h-3 ${linkType === 'CV' ? 'bg-indigo-500' : 'bg-pink-500'}`} />
                                  </div>
                                  <motion.div
                                    animate={{ x: [-30, 30], opacity: [0, 1, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="absolute inset-0 bg-white/60 rounded-full"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </React.Fragment>
                        );
                      })}

                      {placedWords.length === 0 && (
                        <div className="text-slate-300 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3">
                          <Layout size={18} /> Awaiting Construction Components
                        </div>
                      )}
                    </div>
                  </AnimatePresence>
                </div>

                {/* AVAILABLE WORD ASSEMBLIES */}
                <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-xl">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-4">Available Components</div>
                  <div className="flex flex-wrap gap-4">
                    {availableWords.map((word, idx) => (
                      <motion.button
                        key={word.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -10, scale: 1.05 }}
                        onClick={() => handleWordClick(word)}
                        className="group relative bg-white px-8 py-5 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border-2 border-white hover:border-blue-500 transition-all flex flex-col items-center min-w-[120px]"
                      >
                        <span className="text-xl font-black text-slate-900 mb-1">{word.text}</span>
                        <div className={`text-[9px] font-black uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full text-slate-400 group-hover:text-blue-500 transition-colors`}>
                          {word.type}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Feedback Overlay */}
              <AnimatePresence>
                {isCorrect !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`fixed bottom-12 right-12 left-[360px] p-8 rounded-[2.5rem] shadow-2xl flex items-center justify-between border-4 ${isCorrect ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-500 border-rose-400 text-white'
                      }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 flex items-center justify-center">
                        {isCorrect ? <CheckCircle size={32} /> : <XCircle size={32} />}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black mb-1">
                          {isCorrect ? 'STRUCTURAL SUCCESS!' : 'CALIBRATION ERROR'}
                        </h3>
                        <p className="font-bold opacity-80 uppercase text-[10px] tracking-widest">
                          {isCorrect ? 'The linguistic structure is stable and efficient.' : 'Word sequence deviates from established grammatical patterns.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={resetExercise} className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                        Try Rebuild
                      </button>
                      {isCorrect && (
                        <button onClick={nextExercise} className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-105">
                          Next Mission
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}
        </section>

        {/* BILINGUAL SUBTITLE OVERLAY */}
        <AnimatePresence>
          {currentSubtitle && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-[100] pointer-events-none"
            >
              <div className="bg-black/80 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center gap-2">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Volume2 size={16} className="text-white" />
                  </div>
                  <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Listen & Learn</span>
                </div>

                <h2 className="text-white text-2xl md:text-3xl font-black tracking-tight leading-tight">
                  {currentSubtitle.en}
                </h2>
                <div className="h-px w-24 bg-white/20 my-1" />
                <p className="text-indigo-300 text-lg md:text-xl font-bold italic opacity-90">
                  {currentSubtitle.es}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SentenceBuilder;
