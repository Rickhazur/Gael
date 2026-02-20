import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, CheckCircle2, XCircle, ArrowLeft, BookOpen, Zap, Target, PenTool, Camera, FileText, AlertCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRewards } from "@/hooks/useRewards_mod";
import { toast } from "sonner";
import type { PersonalizedContent } from "@/hooks/usePersonalizedContent_mod";
import { PRESS_ROOM_CONTENT, type PressLesson, type PressQuestion } from "@/data/pressRoomContent";

interface EvalQuestion {
  id: string;
  type: "multiple-choice" | "fill-blank" | "reorder" | "short-answer";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  skill: "grammar" | "vocabulary" | "reading" | "writing";
  difficulty: "easy" | "medium" | "hard";
  word?: string;
  example?: string;
}

interface PracticeEvalProps {
  title?: string;
  questions?: EvalQuestion[];
  timed?: boolean;
  timeLimit?: number;
  onComplete: (score: number, totalCoins: number) => void;
  onBack: () => void;
  personalizedContent?: PersonalizedContent;
  immersionMode?: 'bilingual' | 'standard';
}

const speakText = (text: string, rate: number = 0.8) => {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  speechSynthesis.speak(utterance);
};

// Press Room Topics
const evalTopics = [
  { id: "verbs", label: "Action News", sub: "Verbs & Tenses", icon: Zap, color: "bg-amber-100", border: "border-amber-900" },
  { id: "vocabulary", label: "Word Power", sub: "Synonyms & Antonyms", icon: BookOpen, color: "bg-cyan-100", border: "border-cyan-900" },
  { id: "grammar", label: "Style Guide", sub: "Punctuation Rules", icon: PenTool, color: "bg-rose-100", border: "border-rose-900" },
  { id: "reading", label: "Proofreading", sub: "Comprehension", icon: Target, color: "bg-lime-100", border: "border-lime-900" },
  { id: "custom", label: "Special Report", sub: "Custom Topic", icon: Camera, color: "bg-purple-100", border: "border-purple-900" },
];

/* --- QUESTION GENERATORS (Fallback/Custom) --- */
const generateGeneralQuestions = (topic: string): EvalQuestion[] => {
  // Basic fallback if no structured content found
  const questions: EvalQuestion[] = [
    { id: "q1", type: "multiple-choice", question: "Which is a noun?", options: ["Run", "Blue", "Car", "Slowly"], correctAnswer: "Car", explanation: "Person, place, or thing.", skill: "grammar", difficulty: "easy" },
    { id: "q2", type: "fill-blank", question: "I ___ (eat) an apple.", correctAnswer: "eat", explanation: "Present tense.", skill: "grammar", difficulty: "easy" },
    { id: "q5", type: "multiple-choice", question: "What is a 'deadline'?", options: ["A finish line", "Time limit", "A broken line", "A new job"], correctAnswer: "Time limit", explanation: "Deadlines are when work must be completed.", skill: "vocabulary", difficulty: "medium" },
  ];
  return [...questions, ...questions].map((q, i) => ({ ...q, id: `gx${i}` }));
};

const PracticeQuiz_mod = ({
  title = "Evaluation",
  timed = true,
  timeLimit = 300,
  onComplete,
  onBack,
  immersionMode = 'bilingual'
}: PracticeEvalProps) => {
  const { completeGame } = useRewards();
  const [mode, setMode] = useState<"select" | "briefing" | "quiz" | "complete">("select");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<PressLesson | null>(null);
  const [questions, setQuestions] = useState<EvalQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResult, setShowResult] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [reorderItems, setReorderItems] = useState<string[]>([]);
  const [selectedReorder, setSelectedReorder] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showBilingual, setShowBilingual] = useState(immersionMode === 'standard');

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (mode !== "quiz" || !timed) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, timed]);

  useEffect(() => {
    if (currentQuestion?.type === "reorder" && currentQuestion.options) {
      setReorderItems([...currentQuestion.options].sort(() => Math.random() - 0.5));
      setSelectedReorder([]);
    }
    setInputValue("");
  }, [currentIndex, currentQuestion]);

  const handleTopicSelect = async (topicId: string) => {
    setSelectedTopic(topicId);

    // Check if we have structured content
    const content = PRESS_ROOM_CONTENT[topicId];
    if (content) {
      setCurrentLesson(content);
      setQuestions(content.quiz as any); // Type assertion for compatibility
      setMode("briefing");
    } else {
      // Fallback / Custom
      setCurrentLesson(null);
      const generated = generateGeneralQuestions(topicId);
      setQuestions(generated);
      setMode("quiz");
      setTimeRemaining(timeLimit);
    }
  }

  const handleStartQuiz = () => {
    setMode("quiz");
    setTimeRemaining(timeLimit);
  };

  const handleAnswer = (answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));

    let isCorrect = false;
    let normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!]/g, '');

    if (Array.isArray(currentQuestion.correctAnswer)) {
      // Compare arrays by joining or simplistic check
      if (Array.isArray(answer)) {
        isCorrect = normalize(answer.join(' ')) === normalize(currentQuestion.correctAnswer.join(' '));
      }
    } else {
      if (typeof answer === "string") {
        isCorrect = normalize(answer) === normalize(currentQuestion.correctAnswer as string);
      }
    }

    setCurrentFeedback({
      correct: isCorrect,
      explanation: currentQuestion.explanation,
    });
    setShowResult(true);

    if (isCorrect) speakText("Approved!");
    else speakText("Rejected.");
  };

  const handleNext = () => {
    setShowResult(false);
    setCurrentFeedback(null);
    setSelectedReorder([]);
    setInputValue("");

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    let correct = 0;
    questions.forEach(q => {
      const ans = answers[q.id];
      if (!ans) return;

      let isCorrect = false;
      let normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!]/g, '');

      if (Array.isArray(q.correctAnswer)) {
        if (Array.isArray(ans)) {
          isCorrect = normalize(ans.join(' ')) === normalize(q.correctAnswer.join(' '));
        }
      } else {
        if (typeof ans === "string") {
          isCorrect = normalize(ans) === normalize(q.correctAnswer as string);
        }
      }

      if (isCorrect) correct++;
    });

    const result = await completeGame("evaluacion", correct, questions.length);
    toast.success(`Exam Complete! Score: ${correct}/${questions.length}`);
    onComplete(correct, result.actualCoinsAdded);
  };

  const handleReorderSelect = (item: string) => {
    if (selectedReorder.includes(item)) {
      setSelectedReorder(prev => prev.filter(i => i !== item));
      setReorderItems(prev => [...prev, item]);
    } else {
      setSelectedReorder(prev => [...prev, item]);
      setReorderItems(prev => prev.filter(i => i !== item));
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' + sec : sec}`;
  };

  if (mode === "select") {
    return (
      <div className="flex-1 flex flex-col bg-[#f0e7d5] p-4 md:p-8 relative overflow-hidden font-serif min-h-screen">
        <div className="absolute inset-0 opacity-20 pointer-events-none z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}></div>

        <div className="relative z-10 border-b-8 border-double border-black pb-6 mb-8 text-center bg-white p-6 shadow-[8px_8px_0_0_#000] border-4">
          <div className="flex justify-between items-center mb-4 border-b-2 border-slate-900 pb-2">
            <Button variant="ghost" onClick={onBack} className="text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all border-2 border-transparent hover:border-black">
              ← RETREAT
            </Button>
            <div className="flex gap-2 items-center bg-black text-white px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">LIVE FEED</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter mb-2 leading-none" style={{ fontFamily: 'Times New Roman, serif' }}>
            PRESS EXAM
          </h1>
          <p className="text-slate-600 font-sans font-black uppercase tracking-[0.3em] text-xs md:text-sm bg-slate-200 inline-block px-4 py-1">
            Official Accreditation & Skill Verification
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full px-2 pb-20 overflow-y-auto">
          {evalTopics.map((topic) => (
            <motion.button
              key={topic.id}
              onClick={() => handleTopicSelect(topic.id)}
              className={`relative group bg-white p-6 border-4 border-black text-left h-64 flex flex-col shadow-[8px_8px_0_0_#000] hover:-translate-y-2 hover:shadow-[16px_16px_0_0_#000] transition-all overflow-hidden`}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`absolute top-0 right-0 p-3 ${topic.color} border-l-4 border-b-4 border-black`}>
                <topic.icon className="w-8 h-8 text-black" />
              </div>

              <span className="inline-block bg-black text-white text-[10px] font-black px-2 py-1 mb-6 w-fit uppercase tracking-[0.2em]">
                DEPT: {topic.id}
              </span>

              <h3 className="text-4xl font-black mb-2 font-serif leading-none group-hover:underline decoration-4 underline-offset-4">
                {topic.label}
              </h3>
              <p className="text-slate-500 font-sans font-bold uppercase tracking-widest text-xs mb-4">
                {topic.sub}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // BRIEFING MODE (NEW)
  if (mode === "briefing" && currentLesson) {
    return (
      <div className="flex-1 flex flex-col bg-[#e6e2d3] p-4 md:p-8 relative overflow-hidden font-mono min-h-screen text-slate-900">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}></div>

        <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
          {/* Briefing Header */}
          <div className="border-b-4 border-black pb-4 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setMode("select")} className="font-bold border-2 border-transparent hover:border-black uppercase">
                ← Back
              </Button>
              {/* Bilingual Toggle Switch */}
              <div className="flex bg-slate-200 p-1 rounded-full border-2 border-slate-300 shadow-inner">
                <button
                  onClick={() => setShowBilingual(false)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${!showBilingual ? 'bg-black text-yellow-400 shadow-lg scale-105 ring-2 ring-yellow-400/50' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Zap className={`w-3 h-3 ${!showBilingual ? 'fill-yellow-400' : ''}`} />
                  English
                </button>
                <button
                  onClick={() => setShowBilingual(true)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${showBilingual ? 'bg-cyan-500 text-white shadow-lg scale-105 ring-2 ring-cyan-400/50' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Globe className="w-3 h-3" />
                  Bilingual
                </button>
              </div>
            </div>
            <div className="bg-red-600 text-white px-4 py-1 text-sm font-black uppercase tracking-widest -rotate-2 shadow-md hidden md:block">
              CLASSIFIED BRIEFING
            </div>
          </div>

          {/* Lesson Content Card */}
          <div className="bg-[#fffdf5] border-4 border-black shadow-[12px_12px_0_0_#1a1a1a] p-8 md:p-12 flex-1 overflow-y-auto relative mb-8">
            {/* Old Paper Texture */}
            <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(#a8a29e 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

            <div className="relative z-10">
              <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Subject: {currentLesson.topic.toUpperCase()}</span>

              <div className="mb-4">
                <h2 className="text-3xl md:text-5xl font-black font-serif leading-none uppercase">
                  {currentLesson.headline}
                </h2>
                <AnimatePresence>
                  {showBilingual && currentLesson.headline_es && (
                    <motion.h2
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xl md:text-3xl font-black font-serif leading-none uppercase text-cyan-700 mt-2"
                    >
                      {currentLesson.headline_es}
                    </motion.h2>
                  )}
                </AnimatePresence>
              </div>

              <div className="mb-8 border-b-4 border-black pb-4">
                <h3 className="text-lg font-bold font-sans italic text-slate-600 bg-yellow-100 inline-block px-2">
                  "{currentLesson.subheadline}"
                </h3>
                {showBilingual && currentLesson.subheadline_es && (
                  <div className="mt-2 text-md font-bold font-sans italic text-cyan-600 bg-cyan-50 inline-block px-2">
                    "{currentLesson.subheadline_es}"
                  </div>
                )}
              </div>

              <div className="prose prose-lg font-serif mb-12 text-black leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />

                <AnimatePresence>
                  {showBilingual && currentLesson.content_es && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 pt-6 border-t-2 border-dashed border-cyan-300 text-cyan-900 bg-cyan-50/50 p-4 rounded-lg"
                    >
                      <div dangerouslySetInnerHTML={{ __html: currentLesson.content_es }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Examples */}
              <div className="bg-slate-100 border-l-8 border-black p-6 mb-8 transform rotate-1">
                <h4 className="font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Witness Statements (Examples)
                </h4>
                <div className="space-y-4">
                  {currentLesson.examples.map((ex, i) => (
                    <div key={i} className="flex flex-col border-b border-slate-300 pb-2 last:border-0 last:pb-0">
                      <div className="flex flex-col md:flex-row gap-2 md:items-center">
                        <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase w-fit">{ex.context}</span>
                        <span className="font-mono text-lg" dangerouslySetInnerHTML={{ __html: ex.sentence }} />
                      </div>
                      {showBilingual && ex.sentence_es && (
                        <div className="mt-1 ml-0 md:ml-24 text-cyan-700 italic text-sm">
                          <span dangerouslySetInnerHTML={{ __html: ex.sentence_es }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <Button onClick={handleStartQuiz} className="w-full bg-black text-white h-20 text-3xl font-black uppercase tracking-widest border-4 border-black hover:bg-green-600 hover:border-green-800 shadow-[8px_8px_0_0_#000] transition-all transform hover:-translate-y-1">
            <FileText className="w-8 h-8 mr-4" /> Start Assignment
          </Button>
        </div>
      </div>
    );
  }

  // QUIZ MODE (Existing Implementation with minor tweaks if needed)
  return (
    <div className="flex-1 flex flex-col bg-[#2a2a2a] p-4 md:p-8 relative overflow-hidden font-mono min-h-screen text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex justify-between items-center mb-8 border-b-4 border-slate-600 pb-4 bg-black/20 p-4 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-6">
          <Button onClick={() => setMode("select")} variant="outline" className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-xs h-10 px-6">
            ABORT
          </Button>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-white leading-none">
              {selectedTopic}
            </h2>
            <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              <span>Question: {currentIndex + 1}/{questions.length}</span>
              <span>•</span>
              <span>Clearance: PENDING</span>
            </div>
          </div>
        </div>

        {timed && (
          <div className={`px-6 py-2 font-black text-2xl border-4 shadow-[4px_4px_0_0_#000] bg-black ${timeRemaining < 60 ? 'border-red-500 text-red-500 animate-pulse' : 'border-green-500 text-green-500'}`}>
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Question Area */}
      <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col gap-8 relative">

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 50, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -50, rotateX: 10 }}
            className="bg-[#fdfbf7] text-black p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-8 border-black relative min-h-[500px] flex flex-col"
            style={{ fontFamily: '"Courier Prime", "Courier New", monospace' }}
          >
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}></div>

            {/* Watermark */}
            <div className="absolute top-8 right-8 border-4 border-red-600/20 text-red-600/20 px-4 py-2 font-black text-4xl -rotate-12 pointer-events-none uppercase tracking-widest">
              CONFIDENTIAL
            </div>

            <div className="mb-12 relative z-10">
              <span className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4 inline-block shadow-[4px_4px_0_0_#999]">
                INCOMING WIRE
              </span>
              <h3 className="text-3xl md:text-5xl font-bold leading-tight typewriter-text border-l-4 border-black pl-6 py-2">
                {currentQuestion?.question}
              </h3>
            </div>

            {/* OPTIONS */}
            <div className="flex-1 space-y-4 relative z-10 max-w-3xl">
              {currentQuestion?.type === "multiple-choice" && currentQuestion.options?.map((opt, i) => {
                const isSel = answers[currentQuestion.id] === opt;
                const isCorrect = showResult && (opt === currentQuestion.correctAnswer);
                const isWrong = showResult && isSel && (opt !== currentQuestion.correctAnswer);

                return (
                  <button
                    key={i}
                    disabled={showResult}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full text-left p-4 border-4 transition-all font-bold text-xl flex items-center gap-6 group hover:-translate-x-2
                                ${isCorrect ? 'bg-green-100 border-green-600 text-green-900 shadow-[8px_8px_0_0_#16a34a]' :
                        isWrong ? 'bg-red-100 border-red-600 text-red-900 shadow-[8px_8px_0_0_#dc2626] line-through opacity-50' :
                          isSel ? 'bg-black text-white border-black shadow-[8px_8px_0_0_#666]' :
                            'bg-white border-black hover:bg-yellow-50 shadow-[8px_8px_0_0_#000]'}`}
                  >
                    <span className={`w-10 h-10 border-2 flex items-center justify-center font-black text-lg ${isSel ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {isCorrect && <CheckCircle2 className="ml-auto w-8 h-8 text-green-600" />}
                    {isWrong && <XCircle className="ml-auto w-8 h-8 text-red-600" />}
                  </button>
                )
              })}

              {/* REORDER TYPE */}
              {currentQuestion?.type === "reorder" && (
                <div className="space-y-8">
                  <div className="flex flex-wrap gap-3 min-h-[100px] p-6 bg-slate-100 border-4 border-dashed border-slate-300">
                    {selectedReorder.length === 0 && <span className="text-slate-400 italic font-bold">Tap words below to build sentence...</span>}
                    {selectedReorder.map((word, i) => (
                      <motion.button
                        key={`sel-${i}`}
                        layoutId={word}
                        onClick={() => !showResult && handleReorderSelect(word)}
                        className="px-6 py-3 bg-black text-white font-black text-xl shadow-[4px_4px_0_0_#666] border-2 border-black"
                      >
                        {word}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {reorderItems.map((word, i) => (
                      <motion.button
                        key={`item-${i}`}
                        layoutId={word}
                        onClick={() => handleReorderSelect(word)}
                        className="px-6 py-3 bg-white border-4 border-black font-black text-xl shadow-[6px_6px_0_0_#000] hover:-translate-y-1 transition-transform"
                      >
                        {word}
                      </motion.button>
                    ))}
                  </div>
                  {!showResult && selectedReorder.length > 0 && (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 h-16 text-xl font-black border-4 border-black shadow-[6px_6px_0_0_#000]" onClick={() => handleAnswer(selectedReorder)}>
                      SUBMIT SENTENCE
                    </Button>
                  )}
                </div>
              )}

              {/* FILL BLANK / INPUT */}
              {(currentQuestion?.type === "fill-blank" || currentQuestion?.type === "short-answer") && (
                <div className="space-y-6">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your answer..."
                    className="border-b-8 border-black bg-slate-50 text-4xl font-mono p-8 rounded-none focus:ring-0 focus:border-blue-600 h-auto placeholder:text-slate-300"
                    disabled={showResult}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAnswer(inputValue);
                    }}
                  />
                  {!showResult && <Button className="w-full bg-black h-16 text-2xl font-black border-4 border-transparent hover:border-white uppercase tracking-widest shadow-[6px_6px_0_0_#666]" onClick={() => handleAnswer(inputValue)}>
                    SUBMIT REPORT
                  </Button>}
                </div>
              )}

            </div>

            {/* FEEDBACK STAMP */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ scale: 3, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: -12 }}
                  className={`absolute bottom-20 right-20 border-[12px] ${currentFeedback?.correct ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'} p-6 font-black text-6xl uppercase tracking-[0.2em] opacity-90 rotate-[-12deg] z-50 pointer-events-none mix-blend-multiply flex flex-col items-center justify-center`}
                >
                  {currentFeedback?.correct ? (
                    <>
                      <span>APPROVED</span>
                      <span className="text-sm tracking-normal bg-green-600 text-white px-2 mt-2">Ready for Print</span>
                    </>
                  ) : (
                    <>
                      <span>REJECTED</span>
                      <span className="text-sm tracking-normal bg-red-600 text-white px-2 mt-2">Rewrite Needed</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </AnimatePresence>

        {/* CONTROLS */}
        <div className="flex justify-end relative z-20">
          {showResult && (
            <Button onClick={handleNext} className="bg-yellow-400 text-black border-4 border-black shadow-[8px_8px_0_0_#fff] hover:translate-y-1 hover:shadow-[4px_4px_0_0_#fff] hover:bg-yellow-500 font-black text-2xl px-12 py-8 uppercase tracking-widest transition-all">
              {currentIndex < questions.length - 1 ? 'NEXT ASSIGNMENT →' : 'FINISH EXAM'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeQuiz_mod;
