import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Volume2, ArrowLeft, RotateCcw,
  Trophy, Star, Coins, ThermometerSun, Sparkles,
  ChevronRight, Target, GraduationCap, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRewards } from "@/hooks/useRewards_mod";
import { toast } from "sonner";
import type { PersonalizedContent } from "@/hooks/usePersonalizedContent_mod";

interface PronunciationItem {
  id: string;
  text: string;
  phonetic: string;
  tips: string;
  type: "word" | "sentence";
  translation?: string;
}

interface DifficultyLevel {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  words: PronunciationItem[];
  sentences: PronunciationItem[];
}

interface PronouncePlayProps {
  onComplete: (totalCoins: number, averageScore: number) => void;
  onBack: () => void;
  personalizedContent?: PersonalizedContent;
  immersionMode?: 'bilingual' | 'standard';
}

type GamePhase = "listening" | "recording" | "result";

// Coin reward thresholds
const COIN_THRESHOLDS = [
  { min: 90, max: 100, coins: 10, label: "Perfect!", color: "text-success", emoji: "🏆" },
  { min: 75, max: 89, coins: 7, label: "Great!", color: "text-primary", emoji: "⭐" },
  { min: 50, max: 74, coins: 4, label: "Good try!", color: "text-warning", emoji: "👍" },
  { min: 0, max: 49, coins: 1, label: "Keep practicing!", color: "text-muted-foreground", emoji: "💪" },
];

// Generate pronunciation tips based on word
const generatePhoneticTip = (word: string): { phonetic: string; tips: string } => {
  const dictionary: Record<string, { phonetic: string; tips: string }> = {
    hypothesis: { phonetic: "jai-PÓ-te-sis", tips: "Stress the 'PO' - jaipótesis" },
    experiment: { phonetic: "eks-PÉ-ri-ment", tips: "Clear 'eks' sound at the start" },
    observation: { phonetic: "ob-ser-VÉI-shon", tips: "Stress the 'VÉI' sound" },
    conclusion: { phonetic: "kon-KLÚ-shon", tips: "Like 'kon' and 'klú' together" },
    total: { phonetic: "TÓU-tal", tips: "Stress the first part" },
    difference: { phonetic: "DÍ-fe-rens", tips: "Three parts: DÍ-fe-rens" },
    century: { phonetic: "SÉN-chu-ri", tips: "Soft 'S' like in Spanish" },
    paragraph: { phonetic: "PÁ-ra-graf", tips: "Like Spanish 'pára' then 'graf'" },
    laboratory: { phonetic: "la-BÓ-ra-to-ri", tips: "Stress the second part 'BÓ'" },
    microscope: { phonetic: "MÁI-kro-skóup", tips: "MÁI like 'my', then skóup" },
    microscopes: { phonetic: "MÁI-kro-skóups", tips: "MÁI like 'my', then skóups" },
    students: { phonetic: "STÍU-dents", tips: "Start with 'S', then TÍU" },
    hello: { phonetic: "je-LÓU", tips: "Like 'je' then 'LÓU'" },
    learn: { phonetic: "lern", tips: "Short 'e', soft 'r'" },
  };

  const lowerWord = word.toLowerCase().trim().replace(/[.,!?;]/g, '');
  if (dictionary[lowerWord]) {
    return dictionary[lowerWord];
  }

  // Basic Spanish-friendly fallback logic
  let pseudo = lowerWord
    .replace(/th/g, 'd')
    .replace(/ph/g, 'f')
    .replace(/sh/g, 'sh')
    .replace(/ch/g, 'ch')
    .replace(/tion/g, 'shon')
    .replace(/sion/g, 'shon')
    .replace(/ay/g, 'éi')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/^h/g, 'j')
    .replace(/ h/g, ' j');

  return {
    phonetic: pseudo,
    tips: `Say it slowly. Focus on the sounds correctly.`,
  };
};

// Generate sentence pronunciation tip
const generateSentenceTip = (sentence: string): { phonetic: string; tips: string } => {
  const words = sentence.split(' ');
  const phoneticParts = words.map(w => {
    const p = generatePhoneticTip(w).phonetic;
    return p.startsWith('/') ? p.slice(1, -1) : p; // Clean slashes if any
  });

  const stressWord = words[Math.floor(words.length / 2)];

  // Manual fixes for common words in sentences
  const sentencePhonetic = phoneticParts.join(' ')
    .replace(/\bthe\b/gi, 'de')
    .replace(/\ba\b/gi, 'ei')
    .replace(/\bhas\b/gi, 'jas')
    .replace(/\bmany\b/gi, 'méni')
    .replace(/\bfor\b/gi, 'for')
    .replace(/\bof\b/gi, 'ov');

  // Linking words logic (Consonant -> Vowel)
  const linkingTips: string[] = [];
  const cleanWords = sentence.toLowerCase().replace(/[.,!?]/g, '').split(' ');
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const consonants = 'bcdfghjklmnpqrstvwxyz'.split('');

  for (let i = 0; i < cleanWords.length - 1; i++) {
    const current = cleanWords[i];
    const next = cleanWords[i + 1];

    if (current.length > 0 && next.length > 0) {
      const lastChar = current.slice(-1);
      const firstChar = next.charAt(0);

      if (consonants.includes(lastChar) && vowels.includes(firstChar)) {
        linkingTips.push(`"${current}‿${next}"`);
      }
    }
  }

  let tipText = `Pause at commas. Stress "${stressWord}".`;
  if (linkingTips.length > 0) {
    tipText += ` Link words: ${linkingTips.join(', ')}.`;
  }

  return {
    phonetic: `[ ${sentencePhonetic} ]`,
    tips: tipText,
  };
};



// Shuffle array helper
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Mock pronunciation scoring
const calculatePronunciationScore = async (
  text: string,
  accent: "british" | "american",
  recordingDuration: number
): Promise<{ score: number; feedback: string }> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const baseScore = Math.floor(Math.random() * 40) + 60;
  const durationBonus = recordingDuration > 500 && recordingDuration < 5000 ? 5 : -10;
  const lengthFactor = text.length > 30 ? -5 : 0; // Sentences are slightly harder
  const finalScore = Math.min(100, Math.max(0, baseScore + durationBonus + lengthFactor));

  let feedback = "";
  if (finalScore >= 90) {
    feedback = "¡Excelente! ¡Tu pronunciación es sobresaliente! 🌟";
  } else if (finalScore >= 75) {
    feedback = "¡Buen trabajo! Casi perfecto, ¡sigue así!";
  } else if (finalScore >= 50) {
    feedback = "¡Buen esfuerzo! Escucha el ejemplo de nuevo e intenta otra vez.";
  } else {
    feedback = "¡Sigue practicando! Enfócate en la guía fonética y prueba de nuevo.";
  }

  return { score: finalScore, feedback };
};

const getCoinsForScore = (score: number): { coins: number; label: string; color: string; emoji: string } => {
  const threshold = COIN_THRESHOLDS.find(t => score >= t.min && score <= t.max);
  return threshold || COIN_THRESHOLDS[COIN_THRESHOLDS.length - 1];
};

const PronouncePlay_mod = ({ onComplete, onBack, personalizedContent, immersionMode = 'bilingual' }: PronouncePlayProps) => {
  const { addCoins, balance } = useRewards();

  // Generate dynamic difficulty levels from personalized content
  const difficultyLevels = useMemo<DifficultyLevel[]>(() => {
    if (!personalizedContent || personalizedContent.vocabulary.length === 0) {
      // Fallback with basic items
      return [
        {
          id: "beginner",
          name: "Beginner",
          emoji: "🌱",
          color: "text-success",
          bgColor: "bg-success/20",
          words: [
            { id: "fb1", text: "hello", phonetic: "/həˈləʊ/", tips: "huh-LOH - friendly greeting", type: "word" as const },
            { id: "fb2", text: "learn", phonetic: "/lɜːn/", tips: "LURN - rhymes with turn", type: "word" as const },
          ],
          sentences: [
            { id: "fbs1", text: "Hello, how are you?", phonetic: "/həˈləʊ haʊ ɑːr juː/", tips: "Pause after Hello", type: "sentence" as const },
          ],
        },
      ];
    }

    const easyVocab = personalizedContent.vocabulary.filter(v => v.difficulty === 'easy');
    const mediumVocab = personalizedContent.vocabulary.filter(v => v.difficulty === 'medium');
    const hardVocab = personalizedContent.vocabulary.filter(v => v.difficulty === 'hard');

    const easySentences = personalizedContent.sentences.filter(s => s.difficulty === 'easy');
    const mediumSentences = personalizedContent.sentences.filter(s => s.difficulty === 'medium');
    const hardSentences = personalizedContent.sentences.filter(s => s.difficulty === 'hard');

    const createWords = (vocab: typeof easyVocab): PronunciationItem[] =>
      vocab.map((v, idx) => {
        const { phonetic, tips } = generatePhoneticTip(v.word);
        return {
          id: `pw-${idx}-${v.word}`,
          text: v.word,
          translation: v.translation,
          phonetic,
          tips,
          type: "word" as const,
        };
      });

    const createSentences = (sentences: typeof easySentences): PronunciationItem[] =>
      sentences.map((s, idx) => {
        const { phonetic, tips } = generateSentenceTip(s.sentence);
        return {
          id: `ps-${idx}`,
          text: s.sentence,
          translation: s.translation,
          phonetic,
          tips,
          type: "sentence" as const,
        };
      });

    return [
      {
        id: "beginner",
        name: "Beginner",
        emoji: "🌱",
        color: "text-success",
        bgColor: "bg-success/20",
        words: createWords(easyVocab.length > 0 ? easyVocab : personalizedContent.vocabulary.slice(0, 5)),
        sentences: createSentences(easySentences.length > 0 ? easySentences : personalizedContent.sentences.slice(0, 3)),
      },
      {
        id: "intermediate",
        name: "Intermediate",
        emoji: "🌿",
        color: "text-warning",
        bgColor: "bg-warning/20",
        words: createWords(mediumVocab.length > 0 ? mediumVocab : personalizedContent.vocabulary.slice(0, 5)),
        sentences: createSentences(mediumSentences.length > 0 ? mediumSentences : personalizedContent.sentences.slice(0, 3)),
      },
      {
        id: "advanced",
        name: "Advanced",
        emoji: "🌳",
        color: "text-destructive",
        bgColor: "bg-destructive/20",
        words: createWords(hardVocab.length > 0 ? hardVocab : personalizedContent.vocabulary.slice(0, 5)),
        sentences: createSentences(hardSentences.length > 0 ? hardSentences : personalizedContent.sentences.slice(0, 3)),
      },
    ];
  }, [personalizedContent]);

  // Level and mode selection
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | null>(null);
  const [practiceMode, setPracticeMode] = useState<"words" | "sentences" | null>(null);

  // Practice state
  const [practiceItems, setPracticeItems] = useState<PronunciationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [accent, setAccent] = useState<"british" | "american">("american");
  const [gamePhase, setGamePhase] = useState<GamePhase>("listening");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Results state
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [lastFeedback, setLastFeedback] = useState("");
  const [coinsEarnedThisItem, setCoinsEarnedThisItem] = useState(0);
  const [thermometerFill, setThermometerFill] = useState(0);

  // Session stats
  const [sessionStats, setSessionStats] = useState({ totalCoins: 0, attempts: 0, scores: [] as number[] });
  const [showResults, setShowResults] = useState(false);

  const recordingStartTime = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const currentItem = practiceItems[currentIndex];

  // Animate thermometer fill
  useEffect(() => {
    if (lastScore !== null) {
      const timer = setTimeout(() => setThermometerFill(lastScore), 100);
      return () => clearTimeout(timer);
    }
  }, [lastScore]);

  // Start practice with selected level and mode
  const startPractice = (level: DifficultyLevel, mode: "words" | "sentences") => {
    setSelectedLevel(level);
    setPracticeMode(mode);
    const items = mode === "words" ? level.words : level.sentences;
    setPracticeItems(shuffleArray(items).slice(0, 10)); // 10 random items
    setCurrentIndex(0);
    setGamePhase("listening");
  };

  // Play the current item audio
  const playItemAudio = useCallback(() => {
    if (!currentItem) return;

    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(currentItem.text);
    utterance.lang = accent === "british" ? "en-GB" : "en-US";
    utterance.rate = currentItem.type === "sentence" ? 0.85 : 0.8;

    utterance.onend = () => {
      setIsPlaying(false);
      // Auto-transition to recording phase after speaking
      setTimeout(() => setGamePhase("recording"), 500);
    };

    window.speechSynthesis.speak(utterance);
  }, [currentItem, accent]);

  // Auto-play when entering listening phase
  useEffect(() => {
    if (gamePhase === "listening" && currentItem && !isPlaying) {
      const timer = setTimeout(() => playItemAudio(), 800);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, currentItem, playItemAudio, isPlaying]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      recordingStartTime.current = Date.now();
      setIsRecording(true);

      mediaRecorder.start();

      // Auto-stop after 8 seconds for sentences, 5 for words
      const maxDuration = currentItem?.type === "sentence" ? 8000 : 5000;
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      }, maxDuration);
    } catch (err) {
      toast.error("Could not access microphone. Please allow microphone access.");
    }
  }, [currentItem]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !currentItem) return;

    const recordingDuration = Date.now() - recordingStartTime.current;

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    setIsProcessing(true);

    // Calculate pronunciation score
    const result = await calculatePronunciationScore(currentItem.text, accent, recordingDuration);

    setLastScore(result.score);
    setLastFeedback(result.feedback);
    setGamePhase("result");

    // Calculate and credit coins
    const coinResult = getCoinsForScore(result.score);
    setCoinsEarnedThisItem(coinResult.coins);

    const creditResult = await addCoins(coinResult.coins, "pronunciation_practice");

    setSessionStats(prev => ({
      totalCoins: prev.totalCoins + (creditResult.coinsAdded || 0),
      attempts: prev.attempts + 1,
      scores: [...prev.scores, result.score],
    }));

    setIsProcessing(false);

    toast.success(`+${creditResult.coinsAdded} coins! ${coinResult.emoji}`, { duration: 2000 });
  }, [currentItem, accent, addCoins]);

  const handleNext = () => {
    if (currentIndex < practiceItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setLastScore(null);
      setThermometerFill(0);
      setCoinsEarnedThisItem(0);
      setGamePhase("listening");
    } else {
      setShowResults(true);
    }
  };

  const handleRetry = () => {
    setLastScore(null);
    setThermometerFill(0);
    setCoinsEarnedThisItem(0);
    setGamePhase("listening");
  };

  // Level selection screen - BROADCAST STUDIO MIXING BOARD THEME
  if (!selectedLevel || !practiceMode) {
    return (
      <div className="h-full flex flex-col p-4 bg-slate-900 relative overflow-hidden font-mono text-cyan-400">
        {/* Studio Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 2px, transparent 2.5px)', backgroundSize: '24px 24px' }}></div>

        {/* Header - Digital Display */}
        <div className="flex items-center gap-3 mb-8 border-b-2 border-cyan-900/50 pb-4 relative z-10">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/30">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-widest uppercase text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
              Studio Control
            </h2>
            <p className="text-xs text-cyan-600 uppercase tracking-widest">Select Input Channel</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-cyan-900/50 px-4 py-2 rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.5)] inset-shadow">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="font-bold font-mono text-red-500 tracking-wider">LIVE</span>
            <span className="w-px h-4 bg-cyan-900 mx-2"></span>
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="font-bold text-yellow-500">{balance}</span>
          </div>
        </div>

        {/* Mixing Board Channels */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-end pb-8">
          {difficultyLevels.map((level, idx) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800 border-x-2 border-b-4 border-slate-950 rounded-b-lg rounded-t-sm p-4 flex flex-col h-[400px] relative group hover:bg-slate-750 transition-colors shadow-2xl"
            >
              {/* Channel Strip Header */}
              <div className="absolute -top-6 left-0 right-0 bg-slate-700 h-6 border-x-2 border-t-2 border-slate-600 rounded-t-sm flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-slate-300 tracking-widest">CH 0{idx + 1}</span>
              </div>

              {/* Channel Label */}
              <div className={`text-center mb-4 p-2 border-2 border-dashed ${level.id === 'beginner' ? 'border-green-500/30 text-green-400' : level.id === 'intermediate' ? 'border-yellow-500/30 text-yellow-400' : 'border-red-500/30 text-red-400'} rounded bg-slate-900/50`}>
                <div className="text-2xl mb-1 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{level.emoji}</div>
                <h3 className="font-black uppercase tracking-widest text-sm">{level.name}</h3>
              </div>

              {/* VU Meter Simulation */}
              <div className="w-4 mx-auto flex-1 bg-slate-950 rounded-full overflow-hidden flex flex-col-reverse gap-0.5 p-0.5 mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className={`w-full h-1.5 rounded-sm ${i > 10 ? 'bg-red-500' : i > 5 ? 'bg-yellow-500' : 'bg-green-500'} opacity-${i < 5 ? '100' : '30'}`}></div>
                ))}
              </div>

              {/* Mode Selection Buttons (Pads) */}
              <div className="grid grid-cols-1 gap-3 mt-auto">
                <button
                  onClick={() => startPractice(level, "words")}
                  className="bg-slate-700 hover:bg-cyan-600 active:bg-cyan-500 active:scale-95 transition-all p-3 rounded-sm border-b-4 border-slate-950 flex items-center justify-center gap-2 group/btn"
                >
                  <div className="w-2 h-2 rounded-full bg-slate-900 group-hover/btn:bg-white transition-colors"></div>
                  <span className="font-bold text-slate-200 uppercase text-xs tracking-wider">Words Mode</span>
                </button>

                <button
                  onClick={() => startPractice(level, "sentences")}
                  className="bg-slate-700 hover:bg-magenta-600 hover:bg-fuchsia-600 active:bg-fuchsia-500 active:scale-95 transition-all p-3 rounded-sm border-b-4 border-slate-950 flex items-center justify-center gap-2 group/btn"
                >
                  <div className="w-2 h-2 rounded-full bg-slate-900 group-hover/btn:bg-white transition-colors"></div>
                  <span className="font-bold text-slate-200 uppercase text-xs tracking-wider">Sentences</span>
                </button>
              </div>

              {/* Screw details */}
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-600 flex items-center justify-center"><div className="w-1.5 h-px bg-slate-800 transform rotate-45"></div></div>
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-600 flex items-center justify-center"><div className="w-1.5 h-px bg-slate-800 transform rotate-45"></div></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-600 flex items-center justify-center"><div className="w-1.5 h-px bg-slate-800 transform rotate-45"></div></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-600 flex items-center justify-center"><div className="w-1.5 h-px bg-slate-800 transform rotate-45"></div></div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const averageScore = sessionStats.scores.length > 0
      ? Math.round(sessionStats.scores.reduce((a, b) => a + b, 0) / sessionStats.scores.length)
      : 0;

    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-primary flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-12 h-12 text-primary-foreground" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">Practice Complete!</h2>
          <p className="text-muted-foreground mb-4">
            {selectedLevel.emoji} {selectedLevel.name} • {practiceMode === "words" ? "Words" : "Sentences"}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-warning/20 to-accent/20 rounded-xl p-4">
              <Coins className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{sessionStats.totalCoins}</p>
              <p className="text-sm text-muted-foreground">Coins Earned</p>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-info/20 rounded-xl p-4">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{averageScore}%</p>
              <p className="text-sm text-muted-foreground">Avg. Score</p>
            </div>
          </div>

          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-8 h-8 ${i < Math.ceil(averageScore / 20) ? "text-warning fill-warning" : "text-muted"
                  }`}
              />
            ))}
          </div>

          <div className="bg-success/10 border border-success/30 rounded-xl p-4 mb-6">
            <p className="text-success font-medium">
              Your coins have been added! 🎉
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Total balance: {balance} coins
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => {
              setSelectedLevel(null);
              setPracticeMode(null);
              setShowResults(false);
              setSessionStats({ totalCoins: 0, attempts: 0, scores: [] });
            }}>
              Practice More
            </Button>
            <Button onClick={() => onComplete(sessionStats.totalCoins, averageScore)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Finish
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const coinInfo = lastScore !== null ? getCoinsForScore(lastScore) : null;

  return (
    <div className="h-full flex flex-col bg-slate-900 text-cyan-50 font-mono relative overflow-hidden">
      {/* Studio Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(34, 211, 238, .05) 25%, rgba(34, 211, 238, .05) 26%, transparent 27%, transparent 74%, rgba(34, 211, 238, .05) 75%, rgba(34, 211, 238, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34, 211, 238, .05) 25%, rgba(34, 211, 238, .05) 26%, transparent 27%, transparent 74%, rgba(34, 211, 238, .05) 75%, rgba(34, 211, 238, .05) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}></div>

      {/* Header Panel */}
      <div className="flex items-center gap-3 p-4 border-b-2 border-cyan-900/50 bg-slate-950/80 relative z-10 shadow-lg">
        <Button variant="ghost" size="icon" onClick={() => {
          setSelectedLevel(null);
          setPracticeMode(null);
        }} className="text-cyan-400 hover:text-white hover:bg-cyan-900/40">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-sm font-bold tracking-[0.2em] text-red-500 uppercase">
              {immersionMode === 'standard' ? 'EN EL AIRE' : 'ON AIR'} // {selectedLevel.name}
            </h2>
          </div>
          <p className="text-xs text-cyan-600 font-mono">
            TRACK {currentIndex + 1} / {practiceItems.length} • {practiceMode === 'words' ? 'ISO VOCAL' : 'FULL MIX'}
          </p>
        </div>

        {/* Digital Clock / Coins */}
        <div className="bg-black border border-cyan-900 px-3 py-1 rounded font-mono text-yellow-400 shadow-[0_0_5px_rgba(234,179,8,0.3)]">
          <div className="flex items-center gap-2">
            <Coins className="w-3 h-3" />
            <span className="font-bold">{balance.toString().padStart(4, '0')}</span>
          </div>
        </div>
      </div>

      {/* Main Control Room */}
      <div className="flex-1 flex flex-col p-4 md:p-8 relative z-10 w-full max-w-4xl mx-auto">

        {/* Progress LED Strip */}
        <div className="flex gap-1 mb-8 opacity-70">
          {practiceItems.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-sm transition-all ${i < currentIndex ? "bg-cyan-500" : i === currentIndex ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-slate-800"}`} />
          ))}
        </div>

        {/* Monitor Screen */}
        <div className="bg-black border-4 border-slate-700 rounded-lg p-1 relative shadow-2xl overflow-hidden mb-8 flex-1 flex flex-col justify-center items-center min-h-[300px]">
          {/* Screen reflections and scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] pointer-events-none z-20"></div>

          {/* Content on Screen */}
          <div className="relative z-10 w-full max-w-2xl text-center flex flex-col items-center">
            <div className="inline-block px-4 py-1 border border-cyan-500/30 bg-cyan-950/30 rounded text-cyan-400 text-xs tracking-widest uppercase mb-6">
              {gamePhase === 'listening' ? 'RECEIVING TRANSMISSION...' : gamePhase === 'recording' ? 'RECORDING SIGNAL...' : gamePhase === 'result' ? 'ANALYSIS COMPLETE' : 'STANDBY'}
            </div>

            <h3 className={`font-bold text-white mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] ${currentItem?.text.length > 20 ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl"}`}>
              {currentItem?.text}
            </h3>

            {immersionMode === 'standard' && currentItem?.translation && (
              <p className="text-xl text-yellow-400 font-medium mb-4 filter drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">{currentItem.translation}</p>
            )}

            <p className="text-cyan-600 font-mono text-lg tracking-wider mb-4 bg-black/50 inline-block px-4 py-1 rounded">{currentItem?.phonetic}</p>

            {/* Pronunciation Tips & Linking */}
            {currentItem?.tips && (
              <div className="mt-2 bg-slate-900/80 border border-yellow-500/30 rounded px-4 py-2 max-w-lg mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">PRO TIP</span>
                </div>
                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                  {currentItem.tips.split('Link words:').map((part, i) => (
                    i === 0 ? part : <><br /><span className="text-cyan-400 font-bold block mt-1">🔗 Link these: {part}</span></>
                  ))}
                </p>
              </div>
            )}

            {/* Result Feedback Overlay */}
            <AnimatePresence>
              {gamePhase === "result" && lastScore !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-900/95 border-2 border-cyan-500/50 p-6 rounded-xl absolute inset-4 flex flex-col items-center justify-center z-30 backdrop-blur-md shadow-2xl"
                >
                  <div className="text-6xl mb-4 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{coinInfo?.emoji}</div>
                  <h2 className={`text-5xl font-black ${lastScore >= 75 ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]'} mb-2 tracking-widest`}>
                    {lastScore}%
                  </h2>
                  <p className="text-cyan-300 mb-8 font-mono text-center max-w-md text-lg">{lastFeedback}</p>

                  <div className="flex gap-4 w-full justify-center">
                    <button onClick={handleRetry} className="px-8 py-3 bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white rounded uppercase tracking-wider text-sm font-bold transition-all hover:scale-105">Retry</button>
                    <button onClick={handleNext} className="px-8 py-3 bg-cyan-600 text-white hover:bg-cyan-500 rounded uppercase tracking-wider text-sm font-bold shadow-[0_0_15px_rgba(8,145,178,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(8,145,178,0.8)]">
                      {currentIndex < practiceItems.length - 1 ? 'Next Track' : 'Finish Session'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Visualizer / Waveform */}
            <div className="h-16 flex items-center justify-center gap-1 mb-4 w-full">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-1.5 mx-0.5 bg-cyan-500 rounded-full ${gamePhase === 'recording' ? 'animate-pulse' : 'opacity-20'}`}
                  animate={gamePhase === 'recording' || isPlaying ? {
                    height: [10, Math.random() * 50 + 10, 10],
                    opacity: [0.5, 1, 0.5],
                    backgroundColor: isRecording ? '#ef4444' : '#06b6d4'
                  } : { height: 4, opacity: 0.2 }}
                  transition={{ repeat: Infinity, duration: 0.1 + Math.random() * 0.2 }}
                ></motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Control Deck */}
        <div className="bg-slate-800 border-t-4 border-slate-700 p-6 -mx-4 -mb-4 md:rounded-t-3xl md:mx-auto md:w-full md:max-w-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.5)] relative">
          {/* Screws */}
          <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-slate-950 flex items-center justify-center"><div className="w-full h-px bg-slate-700 transform rotate-45"></div></div>
          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-slate-950 flex items-center justify-center"><div className="w-full h-px bg-slate-700 transform rotate-45"></div></div>
          <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-slate-950 flex items-center justify-center"><div className="w-full h-px bg-slate-700 transform rotate-45"></div></div>
          <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-slate-950 flex items-center justify-center"><div className="w-full h-px bg-slate-700 transform rotate-45"></div></div>

          <div className="flex justify-center items-center gap-8 md:gap-16">

            {/* Replay Button */}
            <button
              onClick={playItemAudio}
              disabled={isRecording || isProcessing || gamePhase === 'result'}
              className="w-16 h-16 rounded-full bg-slate-700 border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center group hover:bg-slate-600 disabled:opacity-50 disabled:grayscale shadow-lg"
            >
              <Volume2 className="w-6 h-6 text-cyan-400 group-hover:text-cyan-200" />
            </button>

            {/* MAIN RECORD BUTTON */}
            <div className="relative">
              <motion.button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing || gamePhase === 'result'}
                className={`w-24 h-24 rounded-full border-4 ${isRecording ? 'bg-red-600 border-red-800 shadow-[0_0_40px_rgba(220,38,38,0.8)]' : 'bg-red-700 border-red-900 shadow-[0_0_20px_rgba(185,28,28,0.4)]'} flex items-center justify-center transition-all relative overflow-hidden active:scale-95 disabled:opacity-50 disabled:grayscale z-10`}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-tr from-transparent to-white/30 rounded-full pointer-events-none`}></div>
                {isProcessing ? (
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Mic className={`w-10 h-10 text-white ${isRecording ? 'animate-pulse' : ''}`} />
                )}
              </motion.button>
              {/* Button Glow Ring */}
              {isRecording && <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"></div>}
            </div>

            {/* Accent Toggle Switch */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">ACCENT</span>
              <div className="bg-slate-950 p-1.5 rounded flex gap-1 shadow-inner">
                <button onClick={() => setAccent("american")} className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all ${accent === "american" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}>US</button>
                <button onClick={() => setAccent("british")} className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all ${accent === "british" ? "bg-magenta-600 bg-fuchsia-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}>UK</button>
              </div>
            </div>

          </div>

          {/* Status Text simulated LCD */}
          <div className="mt-8 bg-cyan-950 border border-cyan-800/50 rounded p-2 text-center shadow-inner">
            <p className={`font-mono text-sm tracking-widest ${isRecording ? "text-red-400 animate-pulse" : "text-cyan-400"}`}>
              {isRecording ? "🔴 RECORDING SIGNAL..." : isProcessing ? "⚡ ANALYZING WAVEFORM..." : isPlaying ? "🔊 TRANSMITTING AUDIO..." : "READY FOR INPUT"}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default PronouncePlay_mod;
