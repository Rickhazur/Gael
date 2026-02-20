import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, X, CheckCircle2, Newspaper, PenTool, Globe, Send, RefreshCw, Languages, User, Coins, Star, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { callChatApi } from "@/services/ai_service";
import { edgeTTS } from "@/services/edgeTTS";
import confetti from 'canvas-confetti';

export interface AssignmentAnalysis {
  id: string;
  headline: string;
  headlineEs: string;
  leadStory: string; // English Explanation
  leadStoryEs: string; // Spanish Explanation
  skills: {
    grammar: number;
    vocabulary: number;
    creativity: number;
  };
  estimatedTime: number; // minutes
  difficulty: "junior" | "senior" | "editor";
  topics: string[];
  editorChallenges: {
    title: string;
    instruction: string;
    question: string;
    answerKey: string;
    type: "fix-headline" | "fill-quote" | "fact-check";
    options?: string[];
    hint: string;
    hintEs: string; // Bilingual Hint
  }[];
  codeBreakerSkit?: {
    encryptedPhrase: string;
    missingComponent: string;
    correctPhrase: string;
    hint: string;
  };
}

interface AssignmentIntakeProps {
  grade: 1 | 2 | 3 | 4 | 5;
  onAnalysisComplete: (analysis: AssignmentAnalysis) => void;
  onClose: () => void;
  immersionMode?: 'bilingual' | 'standard';
  studentName?: string;
}

// AI Analysis Function (NEWSPAPER THEME + BILINGUAL SUPPORT + 5 MIXED QUESTIONS)
const analyzeAssignmentWithAI = async (text: string, grade: number, imageUrl?: string): Promise<AssignmentAnalysis> => {
  const sysPrompt = `You are the 'Chief Editor' of the City Newspaper, helping a Junior Reporter (Grade ${grade} Student).
    
    1. **ANALYSIS & EXPLANATION**:
       - Create a catchy "Headline" (and translate it to Spanish).
       - Write a "Lead Story" explaining the concept clearly in ENGLISH.
       - Write a "Lead Story (Spanish)" explaining the concept clearly in SPANISH.
       - **MANDATORY**: You MUST explain the "Third Person Singular 's'" rule (He/She/It adds 's') and when NOT to use it (I/You/We/They). This is the "Golden Rule of the Day".
       - Use HTML tags to highlight key terms: <mark>concept</mark> or <strong>important</strong>.
  
    2. **CHALLENGES**:
       - Create EXACTLY 5 interactive challenges.
       - **CRITICAL MIX**: 
         - Some questions MUST require the 'Third Person S' (He/She/It).
         - Some questions MUST NOT require the 'S' (I/You/We/They).
         - The student must demonstrate they know the difference.
       - Include a Spanish hint for each challenge.
    
    RETURN STRICT JSON:
    {
      "headline": "The Mystery of the Third Person 'S' Solved!",
      "headlineEs": "¡El Misterio de la 'S' en Tercera Persona Resuelto!",
      "leadStory": "Extra! Extra! In the Present Simple tense, we have a golden rule. When talking about <strong>He</strong>, <strong>She</strong>, or <strong>It</strong> (The Third Person), the verb gets a special prize: the letter <mark>'s'</mark>! But remember: <strong>I</strong>, <strong>You</strong>, <strong>We</strong>, and <strong>They</strong> DO NOT get the 's'. <br/><br/>Example: I run, but he <mark>runs</mark>!",
      "leadStoryEs": "¡Extra! ¡Extra! En el presente simple, tenemos una regla de oro. Cuando hablamos de <strong>Él (He)</strong>, <strong>Ella (She)</strong> o <strong>Eso (It)</strong>, ¡el verbo recibe un premio especial: la letra <mark>'s'</mark>! Pero recuerda: <strong>I</strong>, <strong>You</strong>, <strong>We</strong>, y <strong>They</strong> NO llevan la 's'. <br/><br/>Ejemplo: I run (Yo corro), pero he <mark>runs</mark> (él corre)!",
      "difficulty": "junior",
      "estimatedTime": 15,
      "skills": { "grammar": 80, "vocabulary": 60, "creativity": 50 },
      "topics": ["Grammar", "Verbs"],
      "editorChallenges": [
        {
          "title": "Fix the Headline",
          "instruction": "The verb is missing its 'S'! Tap the right one.",
          "question": "The cat ___ nicely.",
          "answerKey": "sits",
          "type": "fix-headline",
          "options": ["sit", "sits", "sitting"],
          "hint": "The cat is 'It'. It needs an 'S'!",
          "hintEs": "El gato es 'It'. ¡Necesita una 'S'!"
        }
      ]
    }
    `;

  try {
    const messages: any[] = [
      { role: "system", content: sysPrompt },
      {
        role: "user",
        content: imageUrl
          ? [{ type: "text", text: `Reporter's Lead: ${text}` }, { type: "image_url", image_url: { url: imageUrl } }]
          : `Reporter's Lead: ${text}`
      }
    ];

    const data = await callChatApi(messages, "gpt-4o");
    const content = data.choices[0]?.message?.content;
    const jsonContent = content.replace(/```json|```/g, '').trim();
    const json = JSON.parse(jsonContent);

    return {
      id: `news_${Date.now()}`,
      headline: json.headline,
      headlineEs: json.headlineEs || json.headline,
      leadStory: json.leadStory,
      leadStoryEs: json.leadStoryEs || json.leadStory,
      skills: json.skills || { grammar: 50, vocabulary: 50, creativity: 50 },
      estimatedTime: json.estimatedTime || 15,
      difficulty: json.difficulty || "junior",
      topics: json.topics || ["General News"],
      editorChallenges: json.editorChallenges || []
    };

  } catch (error) {
    console.error("AI Analysis Failed", error);
    return {
      id: `news_err_${Date.now()}`,
      headline: "Breaking News: System Overload!",
      headlineEs: "¡Noticia de Última Hora: Sobrecarga del Sistema!",
      leadStory: "Our printing press jammed! <mark>Error 404</mark> prevented the story from printing.",
      leadStoryEs: "¡Nuestra imprenta se atascó! <mark>Error 404</mark> impidió la impresión de la historia.",
      skills: { grammar: 50, vocabulary: 50, creativity: 50 },
      estimatedTime: 10,
      difficulty: "junior",
      topics: ["System Error"],
      editorChallenges: []
    };
  }
};

const AssignmentIntake_mod = ({ grade, onAnalysisComplete, onClose, immersionMode = 'bilingual', studentName = "Junior Reporter" }: AssignmentIntakeProps) => {
  const [inputText, setInputText] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'printing' | 'ready' | 'published'>('idle');
  const [analysis, setAnalysis] = useState<AssignmentAnalysis | null>(null);
  const [isSpanish, setIsSpanish] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for interactive challenges
  const [userAnswers, setUserAnswers] = useState<Record<number, string | null>>({});
  const [feedback, setFeedback] = useState<Record<number, 'correct' | 'incorrect' | null>>({});

  // Coin Counting Animation
  useEffect(() => {
    if (status === 'published' && displayedCoins < earnedCoins) {
      const interval = setInterval(() => {
        setDisplayedCoins(prev => {
          if (prev < earnedCoins) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 50); // Speed of counting
      return () => clearInterval(interval);
    }
  }, [status, earnedCoins, displayedCoins]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        toast.success("Evidence attached!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && !uploadedImage) {
      toast.error("Reporter! We need a story first!");
      return;
    }

    setStatus('printing');
    await edgeTTS.speak("Hold the front page! Processing your story now!", "rachelle");

    // AI Analysis
    const result = await analyzeAssignmentWithAI(inputText || "News Story", grade, uploadedImage || undefined);

    setTimeout(() => {
      setAnalysis(result);
      setStatus('ready');
      edgeTTS.speak("Extra! Extra! Read all about it!", "rachelle");
    }, 3000); // Slightly longer for the animation
  };

  const handleOptionSelect = (challengeIdx: number, option: string) => {
    if (!analysis) return;

    const isCorrect = option === analysis.editorChallenges[challengeIdx].answerKey;

    setUserAnswers(prev => ({ ...prev, [challengeIdx]: option }));
    setFeedback(prev => ({ ...prev, [challengeIdx]: isCorrect ? 'correct' : 'incorrect' }));

    if (isCorrect) {
      toast.success("Editor Approved!");
      edgeTTS.speak("Correct! Good edit.", "rachelle");
    } else {
      toast.error("Correction Needed!");
      edgeTTS.speak("Check the rule again.", "rachelle");
    }
  };

  const handlePublish = async () => {
    // Logic for publishing
    const correctCount = Object.values(feedback).filter(f => f === 'correct').length;
    const totalCoins = correctCount * 10;
    setEarnedCoins(totalCoins);
    setDisplayedCoins(0);

    setStatus('published');
    await edgeTTS.speak(`Excellent Reporting! You earned ${totalCoins} coins.`, "rachelle");

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FCD34D', '#F59E0B', '#FFFFFF'], // Gold, Amber, White
    });
  };

  const renderHighlightedText = (text: string) => {
    const parts = text.split(/(<mark>.*?<\/mark>|<strong>.*?<\/strong>|<br\/>)/g);

    return (
      <span className="leading-loose">
        {parts.map((part, i) => {
          if (part.startsWith('<mark>')) {
            return <span key={i} className="bg-yellow-300 text-slate-900 font-bold px-1 rounded mx-0.5 border-b-2 border-yellow-500 shadow-sm">{part.replace(/<\/?mark>/g, '')}</span>;
          }
          if (part.startsWith('<strong>')) {
            return <span key={i} className="font-black text-indigo-800 mx-0.5 text-xl tracking-tight underline decoration-wavy decoration-indigo-300">{part.replace(/<\/?strong>/g, '')}</span>;
          }
          if (part === '<br/>') {
            return <br key={i} />;
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#f0e6d2] p-6 relative overflow-hidden font-serif text-slate-900 rounded-3xl border-4 border-slate-900 shadow-2xl">

      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
      />

      {/* Header */}
      <div className="flex flex-col items-center justify-center mb-6 relative z-10 border-b-4 border-double border-slate-900 pb-4">
        <div className="flex justify-between w-full items-center px-4">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-600">Vol. {new Date().getFullYear()}</div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 mx-auto transform hover:scale-105 transition-transform cursor-pointer" style={{ fontFamily: 'Times New Roman, serif' }}>
            THE DAILY NOVA
          </h1>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-600">Price: Knowledge</div>
        </div>

        {/* Toggle Language - Only show if analysis is ready and NOT published */}
        {status === 'ready' && analysis && (
          <div className="absolute top-16 right-4 z-50">
            <Button
              onClick={() => setIsSpanish(!isSpanish)}
              className="bg-slate-900 text-white hover:bg-slate-800 border-2 border-slate-700 shadow-md font-bold uppercase tracking-widest flex items-center gap-2"
            >
              <Languages className="w-4 h-4" />
              {isSpanish ? "Switch to English" : "Leer en Español"}
            </Button>
          </div>
        )}

        <div className="w-full flex justify-between items-center mt-2 px-10 border-t border-slate-900 pt-1">
          <span className="text-[10px] font-bold uppercase">City Edition</span>
          <span className="text-[10px] font-bold uppercase flex items-center gap-2"><User size={12} /> By: {studentName}</span>
          <span className="text-[10px] font-bold uppercase">{new Date().toLocaleDateString()}</span>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0 hover:bg-slate-900/10 rounded-full">
          <X className="w-6 h-6" />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="intake"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col gap-6 relative z-10 max-w-4xl mx-auto w-full"
          >
            <div className="bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border-2 border-slate-900 p-6 rounded-xl relative rotate-1 transition-transform hover:rotate-0">
              <div className="absolute -top-3 -left-3 bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase transform -rotate-3 shadow-sm border border-black">
                Breaking News Tip
              </div>

              <div className="mb-4">
                <label className="text-sm font-bold uppercase text-slate-500 tracking-widest block mb-2">
                  What's the story, reporter?
                </label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your story here... E.g. The cat runs fast!"
                  className="w-full min-h-[150px] bg-[#fdfbf7] border-2 border-slate-200 focus:border-slate-900 rounded-lg p-4 text-xl font-sans leading-relaxed resize-none"
                />
              </div>

              <div className="flex gap-4">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1 border-2 border-slate-300 hover:border-slate-900 hover:bg-slate-100 text-slate-500 uppercase font-bold tracking-widest h-12">
                  <Camera className="w-5 h-5 mr-2" /> Add Photo
                </Button>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <Button
                onClick={handleAnalyze}
                className="bg-slate-900 text-white text-2xl font-black uppercase tracking-widest px-10 py-8 rounded-xl shadow-[8px_8px_0px_0px_#ef4444] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#ef4444] transition-all border-2 border-black flex items-center gap-4 group"
              >
                <Send className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                Send to Editor
              </Button>
            </div>
          </motion.div>
        )}

        {status === 'printing' && (
          <motion.div
            key="printing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center z-20"
          >
            {/* Spinning Newspaper Animation */}
            <motion.div
              animate={{ rotate: 360, scale: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="mb-8"
            >
              <Newspaper size={120} className="text-slate-900" />
            </motion.div>

            <div className="w-64 h-4 bg-slate-300 rounded-full overflow-hidden border-2 border-slate-900 mb-8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut" }}
                className="h-full bg-red-600"
              />
            </div>
            <h3 className="text-2xl font-black uppercase animate-pulse">Printing Special Edition...</h3>
          </motion.div>
        )}

        {status === 'ready' && analysis && (
          <motion.div
            key="report"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col gap-4 relative z-10 overflow-y-auto max-w-5xl mx-auto w-full custom-scrollbar pb-10"
          >
            <div className="bg-white p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.8)] border-4 border-slate-900 relative">

              {/* HEADLINE */}
              <div className="border-b-4 border-slate-900 pb-4 mb-6 text-center">
                <motion.h2
                  initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                  className="text-4xl md:text-5xl font-black uppercase leading-tight tracking-tighter text-slate-900 font-serif"
                >
                  {isSpanish ? analysis.headlineEs : analysis.headline}
                </motion.h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* LEFT COLUMN: The Story (Main Article) */}
                <div className="md:col-span-2 text-xl leading-relaxed font-serif text-slate-800 text-justify border-r-2 border-slate-200 pr-6 first-letter:text-5xl first-letter:font-black first-letter:mr-2 first-letter:float-left">
                  {renderHighlightedText(isSpanish ? analysis.leadStoryEs : analysis.leadStory)}
                </div>

                {/* RIGHT COLUMN: Quick Facts & Challenges */}
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-100 p-4 border-2 border-slate-900 relative">
                    <span className="absolute -top-3 left-4 bg-slate-900 text-white px-2 py-0.5 text-[10px] font-black uppercase">Editor's Desk</span>
                    <ul className="text-sm space-y-2 font-sans mt-2">
                      <li><strong>Difficulty:</strong> {analysis.difficulty.toUpperCase()}</li>
                      <li><strong>Time:</strong> {analysis.estimatedTime} Min</li>
                      <li><strong>Skills:</strong> Grammar +{analysis.skills.grammar}</li>
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-black uppercase text-xl mb-4 flex items-center gap-2">
                      <PenTool className="w-5 h-5" /> Editor's Challenge
                    </h4>

                    <div className="space-y-6">
                      {analysis.editorChallenges.map((challenge, idx) => (
                        <div
                          key={idx}
                          className={`border-2 p-4 relative transition-colors ${feedback[idx] === 'correct' ? 'bg-green-100 border-green-600' :
                            feedback[idx] === 'incorrect' ? 'bg-red-100 border-red-600' :
                              'bg-yellow-50 border-slate-900 hover:bg-yellow-100'
                            }`}
                        >
                          <div className="absolute -top-3 -right-3 bg-slate-900 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-sm">
                            {idx + 1}
                          </div>

                          <h5 className="font-bold uppercase text-[10px] text-slate-500 mb-2 tracking-widest">{challenge.title}</h5>
                          <p className="font-bold text-lg mb-4 leading-tight font-serif">{challenge.question}</p>

                          {/* HINT DISPLAY IN SPANISH IF TOGGLED */}
                          {isSpanish && (
                            <p className="text-xs text-indigo-600 font-bold mb-3 bg-indigo-50 p-2 rounded border border-indigo-200">
                              💡 Pista: {challenge.hintEs}
                            </p>
                          )}

                          {challenge.options && (
                            <div className="grid grid-cols-1 gap-2">
                              {challenge.options.map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => handleOptionSelect(idx, opt)}
                                  disabled={feedback[idx] === 'correct'}
                                  className={`px-4 py-3 text-sm font-sans uppercase font-bold text-left border-2 transition-all 
                                                            ${userAnswers[idx] === opt
                                      ? (opt === challenge.answerKey ? 'bg-green-600 text-white border-green-800' : 'bg-red-600 text-white border-red-800')
                                      : 'bg-white border-slate-300 hover:border-slate-900 hover:bg-slate-50'
                                    }
                                                        `}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}

                          {feedback[idx] === 'correct' && (
                            <div className="mt-3 text-green-700 font-bold text-xs uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Great Catch!
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t-4 border-double border-slate-900 flex justify-between items-center">
                <span className="font-serif italic text-slate-500">Page 1 of 1 • The Daily Nova</span>
                <Button
                  onClick={handlePublish}
                  disabled={Object.keys(feedback).length < 5}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black uppercase text-xl px-8 py-6 rounded-none shadow-[4px_4px_0px_0px_#000000] border-2 border-black"
                >
                  {Object.keys(feedback).length < 5 ? `Finish Editing (${Object.keys(feedback).length}/5)` : "Publish Report"} <Send className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PUBLISHED SUCCESS SCREEN - Enhanced Engaging Visuals */}
        {status === 'published' && (
          <motion.div
            key="published"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center relative z-20"
          >
            <div className="bg-white p-12 border-4 border-slate-900 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] max-w-3xl w-full text-center relative rotate-2">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-400 border-2 border-black px-6 py-2 rounded-full font-black text-xl uppercase tracking-widest shadow-lg">
                Best Seller!
              </div>

              <h2 className="text-5xl font-black uppercase mb-4 mt-6 font-serif text-slate-900">Report Published!</h2>
              <div className="w-24 h-2 bg-slate-900 mx-auto mb-8" />

              <div className="grid grid-cols-2 gap-6 my-10">
                <div className="flex flex-col items-center justify-center gap-2 text-2xl font-bold text-slate-700 bg-slate-100 p-6 rounded-xl border-2 border-slate-200">
                  <User className="w-12 h-12 text-slate-500" />
                  <span className="uppercase tracking-widest text-xs font-black text-slate-400">Reporter</span>
                  <span className="font-serif text-3xl text-slate-900">{studentName}</span>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 bg-yellow-50 p-6 rounded-xl border-2 border-yellow-400 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Coins size={80} />
                  </div>
                  <Coins className="w-12 h-12 text-yellow-600 animate-bounce" />
                  <span className="uppercase tracking-widest text-xs font-black text-yellow-600">Earnings</span>
                  <span className="font-mono text-5xl font-black text-yellow-600">+{displayedCoins}</span>
                </div>
              </div>

              <Button
                onClick={() => onAnalysisComplete(analysis!)}
                className="w-full bg-slate-900 text-white text-2xl font-bold py-8 uppercase tracking-widest hover:bg-slate-800 border-4 border-transparent hover:border-yellow-400 transition-all"
              >
                Collect & File Report
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentIntake_mod;
