import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Repeat, CheckCircle2, XCircle, ArrowLeft, Star, RotateCcw, Sparkles, Brain, Plus, Save, Lightbulb, Edit3, Trash2, BookOpen, Volume2, Shield, Sword, Scroll, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PersonalizedContent } from "@/hooks/usePersonalizedContent_mod";
import { generateGradeContextSentence } from "@/hooks/usePersonalizedContent_mod";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: number;
  correctCount: number;
  incorrectCount: number;
  nextReview?: number;
  createdByStudent?: boolean;
  example?: string;
  imageUrl?: string;
  powerLevel?: number; // Visual stat for RPG theme
}

interface FlashcardsProps {
  cards?: Flashcard[];
  onComplete: (masteredCount: number) => void;
  onBack: () => void;
  onSaveToRepository?: (cards: Flashcard[]) => void;
  personalizedContent?: PersonalizedContent;
  immersionMode?: 'bilingual' | 'standard';
}

const speakText = (text: string, rate: number = 0.8) => {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate; // Slower for kids
  speechSynthesis.speak(utterance);
};

const SPACED_INTERVALS = {
  new: 0,
  learning: 1,
  review: 24,
  mastered: 72,
};

// AI-powered feedback (Mock logic kept but simplified for UI focus)
const getFlashcardFeedback = (front: string, back: string, category: string): { isValid: boolean; suggestions: string[]; encouragement: string } => {
  const suggestions: string[] = [];
  let isValid = true;
  if (front.length < 3) { suggestions.push("Question is too short!"); isValid = false; }
  if (back.length < 2) { suggestions.push("Answer is too short!"); isValid = false; }
  return { isValid, suggestions, encouragement: isValid ? "Great card!" : "Keep trying!" };
};

import { ENGLISH_VOCABULARY_CURRICULUM, getAllVocabulary } from "@/data/englishVocabularyCurriculum";

const FlashcardsSpaced_mod = ({ cards, onComplete, onBack, onSaveToRepository, personalizedContent, immersionMode = 'bilingual' }: FlashcardsProps) => {

  // Generate dynamic cards mostly for demo if empty, ensuring KID FRIENDLY content
  const dynamicCards = useMemo<Flashcard[]>(() => {
    // If strict personalized content exists, use it but try to simplify
    if (personalizedContent && personalizedContent.vocabulary.length > 0) {
      return personalizedContent.vocabulary.map((v, idx) => ({
        id: `pc-${idx}`,
        front: immersionMode === 'standard' ? `¿Cómo se dice "${v.translation}"?` : `What is "${v.word}"?`,
        back: v.word,
        category: v.category,
        difficulty: v.difficulty,
        correctCount: 0,
        incorrectCount: 0,
        example: `I see a ${v.word}.`, // Super simple fallback example
        powerLevel: Math.floor(Math.random() * 100),
      }));
    }

    // FALLBACK: FULL CURRICULUM (A1-B2)
    // As requested: "ALL THE VOCABULARY THE CHILD LEARNS"
    const curriculum = getAllVocabulary();
    return curriculum.map((v) => ({
      id: v.id,
      front: immersionMode === 'standard' ? `¿Cómo se dice "${v.translation}"?` : `What is "${v.word}"?`,
      back: v.word,
      category: v.category,
      difficulty: v.difficulty,
      correctCount: 0,
      incorrectCount: 0,
      example: v.example,
      powerLevel: v.difficulty === 'hard' ? 90 : v.difficulty === 'medium' ? 60 : 30,
    }));
  }, [personalizedContent, immersionMode]);

  const initialCards = cards && cards.length > 0 ? cards : dynamicCards;

  const [deck, setDeck] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("flashcard_deck_mod");
    return saved ? JSON.parse(saved) : initialCards;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, reviewed: 0 });
  const [showComplete, setShowComplete] = useState(false);
  const [mode, setMode] = useState<"review" | "create" | "manage">("review");

  // Create/Edit State
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [newCategory, setNewCategory] = useState<"grammar" | "vocabulary">("vocabulary");
  const [newDifficulty, setNewDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const dueCards = deck.filter(card => !card.nextReview || card.nextReview <= Date.now());
  const currentCard = dueCards[currentIndex];

  useEffect(() => { localStorage.setItem("flashcard_deck_mod", JSON.stringify(deck)); }, [deck]);

  // Pronunciation on flip
  useEffect(() => {
    if (isFlipped && currentCard) speakText(currentCard.back);
  }, [isFlipped, currentCard]);

  const handleResponse = useCallback((correct: boolean) => {
    if (!currentCard) return;
    const updatedCard = {
      ...currentCard,
      lastReviewed: Date.now(),
      correctCount: correct ? currentCard.correctCount + 1 : currentCard.correctCount,
      incorrectCount: correct ? currentCard.incorrectCount : currentCard.incorrectCount + 1,
      nextReview: Date.now() + (correct ? 24 : 1) * 60 * 60 * 1000, // Explicit simple spacing
    };

    setDeck(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      reviewed: prev.reviewed + 1,
    }));

    if (correct) {
      toast.success("Awesome! +10 XP", { icon: "🌟" });
    } else {
      toast.info("Don't worry, try again soon!", { icon: "💪" });
    }

    setIsFlipped(false);
    if (currentIndex < dueCards.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 400); // Slightly faster transition
    } else {
      setShowComplete(true);
    }
  }, [currentCard, currentIndex, dueCards.length]);

  // --- RPG CARD VISUALS ---
  const getCardTheme = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("animal")) return { bg: "bg-amber-100", border: "border-amber-500", icon: "🐾", type: "BEAST" };
    if (cat.includes("color")) return { bg: "bg-purple-100", border: "border-purple-500", icon: "🎨", type: "ART" };
    if (cat.includes("food")) return { bg: "bg-orange-100", border: "border-orange-500", icon: "🍔", type: "CONSUMABLE" };
    if (cat.includes("school") || cat.includes("place")) return { bg: "bg-blue-100", border: "border-blue-500", icon: "🏫", type: "LOCATION" };
    return { bg: "bg-slate-100", border: "border-slate-500", icon: "📜", type: "SPELL" }; // Default
  };

  const currentTheme = currentCard ? getCardTheme(currentCard.category) : { bg: "", border: "", icon: "", type: "" };

  if (showComplete || dueCards.length === 0) {
    const mastered = deck.filter(c => c.correctCount > 5).length;
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-[#2a2a2a] text-white font-sans relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 text-center max-w-md bg-slate-800 p-8 rounded-3xl border-4 border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.3)]">
          <div className="w-24 h-24 mx-auto bg-yellow-400 rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce">
            <Star className="w-12 h-12 text-slate-900 fill-slate-900" />
          </div>
          <h2 className="text-4xl font-black text-yellow-400 mb-2 uppercase tracking-wider">Mission Complete!</h2>
          <p className="text-slate-300 mb-8 font-medium">You reviewed all your cards for today.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-900 p-4 rounded-xl border-2 border-green-500">
              <p className="text-3xl font-black text-green-400">{sessionStats.correct}</p>
              <p className="text-xs uppercase font-bold text-slate-500">Correct</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border-2 border-red-500">
              <p className="text-3xl font-black text-red-400">{sessionStats.incorrect}</p>
              <p className="text-xs uppercase font-bold text-slate-500">Learned</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={onBack} variant="outline" className="border-2 border-slate-600 text-slate-600 hover:text-white hover:bg-slate-600 font-bold uppercase transition-all">Exit</Button>
            <Button onClick={() => onComplete(mastered)} className="bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-black uppercase text-lg px-8 py-6 rounded-xl shadow-[0_4px_0_rgb(161,98,7)] active:translate-y-1 active:shadow-none transition-all">
              Collect Rewards
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // REVIEW MODE UI
  return (
    <div className="h-full flex flex-col bg-slate-900 relative overflow-hidden font-sans">
      {/* Dark Wood / Tabletop Background for card game feel */}
      <div className="absolute inset-0 bg-[#1e1e24]" style={{ backgroundImage: 'radial-gradient(circle at center, #2a2a35 0%, #1a1a20 100%)' }}></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute bg-white rounded-full w-1 h-1"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animation: `float ${3 + Math.random() * 5}s infinite` }} />
        ))}
      </div>

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-black/30 backdrop-blur-md border-b border-white/10">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="font-bold uppercase tracking-wider">Deck</span>
        </Button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase text-yellow-400 tracking-[0.2em] mb-1">XP LEVEL {Math.floor(currentIndex / 5) + 1}</span>
          <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300" style={{ width: `${((currentIndex) / dueCards.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-bold text-slate-300 uppercase">{dueCards.length - currentIndex} LEFT</span>
        </div>
      </div>

      {/* CARD AREA */}
      <div className="flex-1 flex items-center justify-center p-6 relative perspective-[1000px] z-10">
        <motion.div
          className="w-full max-w-[340px] aspect-[3/4] cursor-pointer group relative"
          onClick={() => setIsFlipped(!isFlipped)}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? "back" : "front"}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 w-full h-full rounded-3xl border-[6px] shadow-2xl flex flex-col items-center p-6 text-center select-none overflow-hidden
                     ${isFlipped ? 'bg-white border-yellow-400' : `${currentTheme.bg} ${currentTheme.border}`}
                   `}
            >
              {/* Card Gloss/Shine */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none z-20"></div>

              {/* FRONT CONTENT */}
              {!isFlipped ? (
                <>
                  {/* Header Stat */}
                  <div className="w-full flex justify-between items-center mb-4 z-10 opacity-70">
                    <span className="text-[10px] font-black uppercase bg-black/10 px-2 py-0.5 rounded">{currentTheme.type}</span>
                    <div className="flex text-yellow-500">
                      {[...Array(currentCard.difficulty === 'hard' ? 3 : currentCard.difficulty === 'medium' ? 2 : 1)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                    </div>
                  </div>

                  {/* BIG ICON / ILUSTRATION */}
                  <div className="flex-1 flex items-center justify-center relative w-full">
                    <div className="absolute inset-0 bg-white/50 rounded-full blur-2xl transform scale-75"></div>
                    <div className="text-[8rem] relative z-10 filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      {currentTheme.icon}
                    </div>
                  </div>

                  {/* QUESTION */}
                  <div className="bg-white/90 border-2 border-black/10 rounded-xl p-4 w-full shadow-lg relative z-10 mb-4">
                    {/* <p className="text-xs uppercase font-bold text-slate-400 mb-1 tracking-widest">TRANSLATE THIS:</p> */}
                    <h3 className="text-2xl font-black text-slate-800 leading-tight">
                      {currentCard.front}
                    </h3>
                  </div>

                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-auto mb-2">Tap to Reveal</p>
                </>
              ) : (
                /* BACK CONTENT (ANSWER) */
                <>
                  <div className="w-full flex justify-end z-10">
                    <Volume2 className="w-6 h-6 text-slate-400 hover:text-blue-500" />
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">ANSWER</span>
                    <h2 className="text-4xl font-black text-slate-900 mb-6 drop-shadow-sm">{currentCard.back}</h2>

                    {currentCard.example && (
                      <div className="bg-slate-50 border-l-4 border-yellow-400 p-4 rounded text-left w-full shadow-inner">
                        <p className="text-lg font-serif italic text-slate-600">"{currentCard.example}"</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* CONTROLS */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="p-6 pb-8 bg-black/40 backdrop-blur-md border-t border-white/10 z-20"
          >
            <div className="flex gap-4 max-w-md mx-auto">
              <Button onClick={() => handleResponse(false)} className="flex-1 py-8 rounded-xl bg-rose-500 hover:bg-rose-400 border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all shadow-lg flex flex-col gap-1">
                <XCircle className="w-8 h-8 opacity-50" />
                <span className="font-black uppercase tracking-wider text-xs">Hard</span>
              </Button>
              <Button onClick={() => handleResponse(true)} className="flex-1 py-8 rounded-xl bg-green-500 hover:bg-green-400 border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all shadow-lg flex flex-col gap-1">
                <CheckCircle2 className="w-8 h-8 opacity-50" />
                <span className="font-black uppercase tracking-wider text-xs">Easy!</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isFlipped && (
        <div className="mb-8 flex justify-center z-10">
          <Button onClick={() => setIsFlipped(true)} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md rounded-full px-8 py-6 font-bold uppercase tracking-widest shadow-lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Flip Card
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlashcardsSpaced_mod;
