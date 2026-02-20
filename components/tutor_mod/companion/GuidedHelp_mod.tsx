import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb, BookOpen, PenLine, CheckCircle2, HelpCircle,
  ChevronRight, ArrowLeft, Sparkles, MessageSquare, Volume2,
  Shield, Star, Zap, GraduationCap, ArrowRight, Play, User, Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { PersonalizedContent } from "@/hooks/usePersonalizedContent_mod";
import { generateGradeContextSentence } from "@/hooks/usePersonalizedContent_mod";
import { RachelleAvatar } from "@/components/MathMaestro/tutor/RachelleAvatar";
import { generateSpeech } from "@/services/edgeTTS";
import { sfx } from '@/services/soundEffects';

// --- CODE BREAKER COMPONENT ---
interface CodeBreakerSkitProps {
  skit: { encryptedPhrase: string; missingComponent: string; correctPhrase: string; hint: string };
  onComplete: () => void;
}

const CodeBreakerSkit = ({ skit, onComplete }: CodeBreakerSkitProps) => {
  const [status, setStatus] = useState<'locked' | 'decrypting' | 'unlocked'>('locked');
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    generateSpeech("Agent! The message is corrupted. Use the decoder key to fix it.", "rachelle");
  }, []);

  const handleDecrypt = () => {
    setStatus('decrypting');
    generateSpeech(`System repairing... ${skit.correctPhrase}`, "rachelle");

    setTimeout(() => {
      setStatus('unlocked');
      setTimeout(onComplete, 2500);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-black relative overflow-hidden p-6 text-center font-mono">
      {/* Matrix Rain Effect (Simplified CSS) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]" />

      <h2 className="text-2xl md:text-4xl font-black text-red-500 uppercase tracking-[0.2em] mb-12 animate-pulse border-b-4 border-red-600 pb-2">
        ⚠ SYSTEM FAILURE ⚠
      </h2>

      {/* ENCRYPTED ALERT */}
      <div className="relative w-full max-w-3xl">
        <div className={`bg-slate-900 border-4 ${status === 'unlocked' ? 'border-green-500 shadow-[0_0_50px_#22c55e]' : 'border-red-500 shadow-[0_0_30px_#ef4444]'} rounded-xl p-8 md:p-12 transition-all duration-500`}>

          {/* THE SENTENCE */}
          <div className="text-xl md:text-4xl font-bold text-white mb-8 leading-relaxed">
            {status === 'unlocked' ? (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 drop-shadow-[0_0_10px_#22c55e]">
                {skit.correctPhrase}
              </motion.span>
            ) : (
              <span>
                {skit.encryptedPhrase.split(/(\[.*?\])/).map((part, i) =>
                  part.match(/\[.*?\]/) ? (
                    <span key={i} className="inline-block bg-red-900/50 text-red-500 px-2 animate-pulse font-mono border border-red-500 mx-2">
                      [ ERROR ]
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </span>
            )}
          </div>

          {/* DECODER KEY */}
          <AnimatePresence>
            {status === 'locked' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Required Protocol Component</div>

                <button
                  onClick={handleDecrypt}
                  className="group relative px-8 py-4 bg-slate-800 hover:bg-cyan-900 border-2 border-cyan-500 text-cyan-400 font-black text-2xl uppercase tracking-widest rounded transition-all hover:scale-110 hover:shadow-[0_0_30px_#06b6d4]"
                >
                  <span className="absolute -top-2 -right-2 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
                  {skit.missingComponent}
                </button>

                <button
                  onClick={() => setShowHint(true)}
                  className="mt-4 text-xs text-slate-600 hover:text-slate-400 flex items-center gap-2"
                >
                  <HelpCircle className="w-3 h-3" /> Request Intel
                </button>

                {showHint && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-yellow-500 text-sm font-bold bg-yellow-900/20 p-2 rounded border border-yellow-700/30">
                    ⚠ HINT: {skit.hint}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* PROGRESS BAR */}
          {status === 'decrypting' && (
            <div className="mt-8 h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "linear" }}
                className="h-full bg-green-500 shadow-[0_0_20px_#22c55e]"
              />
            </div>
          )}

        </div>
      </div>

      <div className="mt-12 opacity-50 hover:opacity-100 transition-opacity">
        <Button onClick={onComplete} variant="ghost" className="text-slate-500 hover:text-white uppercase tracking-widest text-xs">
          Skip Decryption <ChevronRight className="ml-2 w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};



// --- MAIN HELP COMPONENT ---

interface GuidedStep {
  id: string;
  title: string;
  explanation: string;
  example: string;
  starters: string[];
  tryItPrompt: string;
  vocabulary?: Array<{ word: string; definition: string; example: string; translation?: string }>;

  // NEW FIELDS FOR EXERCISES
  answerKey?: string;
  hintProp?: string;
  type?: "fill-in-verb" | "complete-sentence" | "multiple-choice";
  options?: string[];
}

interface GuidedHelpProps {
  topic: string;
  onComplete: (usedHints: boolean) => void;
  onBack: () => void;
  personalizedContent?: PersonalizedContent;
  immersionMode?: 'bilingual' | 'standard';
  codeBreakerSkit?: { encryptedPhrase: string; missingComponent: string; correctPhrase: string; hint: string };
  guidedExercises?: {
    question: string;
    answerKey: string;
    explanation: string;
    type: "fill-in-verb" | "complete-sentence" | "multiple-choice";
    hintProp?: string;
    options?: string[];
  }[];
}

const staticGuidedSteps: Record<string, GuidedStep[]> = {
  grammar: [
    {
      id: "1",
      title: "Operation: Subject-Verb Match",
      explanation: "Agents must ensure the subject and verb agree! Singular subjects take singular verbs. Plural subjects take plural verbs.",
      example: "✓ She walks stealthily. (singular)\n✓ They walk together. (plural)",
      starters: ["The spy ___", "Our team ___", "He always ___"],
      tryItPrompt: "Write a secret message using 'she' and a verb:",
    },
    {
      id: "2",
      title: "Operation: Past Tense Protocol",
      explanation: "To report on past events, use the past tense of verbs. Regular verbs add '-ed', irregular verbs change form.",
      example: "✓ She infiltrated the base. (infiltrate -> infiltrated)\n✓ He saw the enemy. (see -> saw)",
      starters: ["Yesterday, I ___", "The mission ___", "They quickly ___"],
      tryItPrompt: "Describe a past action using 'he' and a past tense verb:",
    },
    {
      id: "3",
      title: "Operation: Future Forecast",
      explanation: "To predict future actions, use 'will' + base verb. This indicates a planned or certain future event.",
      example: "✓ We will deploy at dawn.\n✓ The message will arrive soon.",
      starters: ["Tomorrow, we will ___", "The agent will ___", "I will definitely ___"],
      tryItPrompt: "Predict a future event using 'they' and 'will':",
    },
    {
      id: "4",
      title: "Operation: Adjective Augmentation",
      explanation: "Adjectives provide crucial details about nouns. They describe qualities, quantities, or states.",
      example: "✓ The *brave* agent completed the *difficult* mission.",
      starters: ["The ___ device", "A ___ message", "He is a ___ operative"],
      tryItPrompt: "Describe a 'secret' with two adjectives:",
    },
    {
      id: "5",
      title: "Operation: Adverbial Enhancement",
      explanation: "Adverbs modify verbs, adjectives, or other adverbs, providing information about how, when, where, or to what extent.",
      example: "✓ She moved *silently*.\n✓ He *quickly* analyzed the data.",
      starters: ["The team worked ___", "He spoke ___", "She ___ completed the task"],
      tryItPrompt: "Describe how an agent 'runs' using an adverb:",
    },
    {
      id: "6",
      title: "Operation: Prepositional Positioning",
      explanation: "Prepositions show the relationship between a noun/pronoun and other words in a sentence, often indicating location or time.",
      example: "✓ The intel is *in* the briefcase.\n✓ We meet *at* midnight.",
      starters: ["The file is ___ the desk", "He hid ___ the shadows", "She arrived ___ time"],
      tryItPrompt: "Complete the sentence: 'The message was sent ___ the secure channel.'",
    },
    {
      id: "7",
      title: "Operation: Conjunction Connection",
      explanation: "Conjunctions link words, phrases, or clauses, creating more complex and informative sentences.",
      example: "✓ We need the key *and* the code.\n✓ He is fast, *but* he is not invisible.",
      starters: ["She is smart ___ brave", "I will go ___ you stay", "We failed ___ we tried our best"],
      tryItPrompt: "Combine two ideas using 'because': 'The mission was critical ___ the fate of the world depended on it.'",
    },
    {
      id: "8",
      title: "Operation: Pronoun Precision",
      explanation: "Pronouns replace nouns to avoid repetition. Ensure they agree in number and gender with the noun they replace.",
      example: "✓ *Agent X* is here. *He* has the intel.\n✓ *The agents* are ready. *They* will proceed.",
      starters: ["The data is corrupted. ___ needs to be fixed.", "Sarah is a spy. ___ is very skilled.", "The plans are secret. ___ must not be revealed."],
      tryItPrompt: "Replace the noun with a pronoun: 'The *briefcase* contains the documents. ___ is heavy.'",
    },
    {
      id: "9",
      title: "Operation: Article Assignment",
      explanation: "Articles ('a', 'an', 'the') specify whether a noun is general or specific. 'A' and 'an' are indefinite, 'the' is definite.",
      example: "✓ I need *a* weapon. (any weapon)\n✓ Give me *the* weapon. (a specific weapon)",
      starters: ["I saw ___ agent", "This is ___ important mission", "___ sun is setting"],
      tryItPrompt: "Complete the sentence with the correct article: 'We found ___ ancient artifact.'",
    },
    {
      id: "10",
      title: "Operation: Sentence Structure",
      explanation: "A complete sentence requires a subject and a verb, expressing a complete thought. This is the foundation of clear communication.",
      example: "✓ The agent reported. (Subject: agent, Verb: reported)\n✗ Reported. (Incomplete)",
      starters: ["The message ___", "Our objective ___", "He ___"],
      tryItPrompt: "Write a complete sentence about a 'secret agent':",
    },
  ],
  vocabulary: [
    {
      id: "vocab-1",
      title: "Word: Infiltrate",
      explanation: "To secretly enter or gain access to an organization, place, or system.",
      example: "The spy's mission was to infiltrate the enemy's headquarters.",
      starters: ["The hacker tried to ___", "Our team will ___", "It's hard to ___"],
      tryItPrompt: "Use 'infiltrate' in a sentence about a secret operation:",
      vocabulary: [{ word: "Infiltrate", definition: "To secretly enter or gain access to an organization, place, or system.", example: "The spy's mission was to infiltrate the enemy's headquarters." }]
    },
    {
      id: "vocab-2",
      title: "Word: Decipher",
      explanation: "To succeed in understanding, interpreting, or identifying something.",
      example: "It took the cryptographer hours to decipher the coded message.",
      starters: ["Can you ___ this?", "We need to ___", "The ancient text was ___"],
      tryItPrompt: "Use 'decipher' in a sentence about understanding a difficult code:",
      vocabulary: [{ word: "Decipher", definition: "To succeed in understanding, interpreting, or identifying something.", example: "It took the cryptographer hours to decipher the coded message." }]
    },
    {
      id: "vocab-3",
      title: "Word: Surveillance",
      explanation: "Close observation, especially of a suspected spy or criminal.",
      example: "The agents kept the suspect under constant surveillance.",
      starters: ["They conducted ___", "The building was under ___", "We need more ___"],
      tryItPrompt: "Use 'surveillance' in a sentence about watching a target:",
      vocabulary: [{ word: "Surveillance", definition: "Close observation, especially of a suspected spy or criminal.", example: "The agents kept the suspect under constant surveillance." }]
    },
  ],
  writing: [
    {
      id: "writing-1",
      title: "Mission Brief: Clear Communication",
      explanation: "When writing a mission brief, clarity is paramount. Use concise language and avoid jargon where possible.",
      example: "Instead of: 'Initiate exfiltration protocol post-haste.'\nUse: 'Evacuate immediately.'",
      starters: ["The objective is to ___", "We must ensure ___", "Avoid ___"],
      tryItPrompt: "Write a clear and concise objective for a mission to retrieve a package:",
    },
    {
      id: "writing-2",
      title: "Mission Brief: Action Verbs",
      explanation: "Use strong action verbs to convey urgency and directness in your reports and briefs.",
      example: "Instead of: 'The agent was involved in the capture.'\nUse: 'The agent captured the target.'",
      starters: ["The team will ___", "We must ___", "He ___ the data"],
      tryItPrompt: "Rewrite using a strong action verb: 'The agent made an escape from the facility.'",
    },
  ],
  reading: [
    {
      id: "reading-1",
      title: "Intel Analysis: Identifying Key Information",
      explanation: "When reading intelligence reports, focus on identifying the main subject, action, and outcome. Skim for keywords.",
      example: "Report: 'Agent 007 successfully retrieved the microchip from the villain's lair in Monaco last night.'\nKey Info: Agent 007, retrieved microchip, Monaco, last night.",
      starters: ["The main point is ___", "Who did what? ___", "When and where? ___"],
      tryItPrompt: "Read the following and identify the key information: 'Dr. Evil's plan to freeze the world was foiled by Captain Awesome, who disabled the ice ray in Antarctica this morning.'",
    },
    {
      id: "reading-2",
      title: "Intel Analysis: Inferring Motives",
      explanation: "Beyond the explicit facts, try to infer the motives or implications behind actions described in a report.",
      example: "Report: 'The enemy agent purchased a one-way ticket to a non-allied country.'\nInference: The agent is likely defecting or going into hiding.",
      starters: ["This suggests that ___", "The reason might be ___", "It implies ___"],
      tryItPrompt: "Read and infer: 'The suspect frequently visited the abandoned warehouse at odd hours, always carrying a large, unmarked bag.' What might this imply?",
    },
  ],
};

const generateDynamicSteps = (content: PersonalizedContent, topic: string): GuidedStep[] => {
  const steps: GuidedStep[] = [];

  // Add vocabulary steps if available
  if (content.vocabulary && content.vocabulary.length > 0) {
    content.vocabulary.forEach((v, index) => {
      steps.push({
        id: `vocab-${index + 1}`,
        title: `New Intel: ${v.word}`,
        explanation: v.definition,
        example: v.example || `The word is ${v.word}.`,
        starters: [],
        tryItPrompt: `Use "${v.word}" in a sentence:`,
        vocabulary: [v]
      });
    });
  }

  // Add sentence steps if available
  if (content.sentences && content.sentences.length > 0) {
    content.sentences.forEach((s, index) => {
      steps.push({
        id: `sentence-${index + 1}`,
        title: `Grammar Drill: ${s.grammarPoint}`,
        explanation: `Practice this pattern: ${s.grammarPoint}`,
        example: s.sentence,
        starters: [],
        tryItPrompt: "Create a similar sentence:",
      });
    });
  }

  return steps.length > 0 ? steps : staticGuidedSteps[topic.toLowerCase()] || staticGuidedSteps.grammar;
};

// HELPER: Convert Analysis Exercises to Steps
const convertExercisesToSteps = (exercises: GuidedHelpProps['guidedExercises']): GuidedStep[] => {
  if (!exercises) return [];
  return exercises.map((ex, i) => ({
    id: `ex-${i}`,
    title: `Field Op #${i + 1}: ${ex.type === 'multiple-choice' ? 'Select Protocol' : 'Decipher Code'}`,
    explanation: ex.explanation,
    example: "", // Not used in this mode
    starters: [],
    tryItPrompt: ex.question,
    answerKey: ex.answerKey,
    hintProp: ex.hintProp,
    type: ex.type,
    options: ex.options
  }));
};

const GuidedHelp_mod = ({ topic, onComplete, onBack, personalizedContent, immersionMode = 'bilingual', codeBreakerSkit, guidedExercises }: GuidedHelpProps) => {
  const [showCodeBreaker, setShowCodeBreaker] = useState(!!codeBreakerSkit);

  const steps = useMemo(() => {
    // PRIORITY 1: AI Generated Exercises from Analysis
    if (guidedExercises && guidedExercises.length > 0) {
      return convertExercisesToSteps(guidedExercises);
    }
    // PRIORITY 2: Personalized Content (existing logic)
    if (personalizedContent) {
      return generateDynamicSteps(personalizedContent, topic);
    }
    // PRIORITY 3: Static Fallback
    return staticGuidedSteps[topic.toLowerCase()] || staticGuidedSteps.grammar;
  }, [guidedExercises, personalizedContent, topic]);

  // ... (rest of state) ...
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [usedHints, setUsedHints] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "hint" | "error"; message: string } | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);

  const step = steps[currentStep] || staticGuidedSteps.grammar[0]; // Fallback safety

  const handleSpeak = async (text: string) => {
    setIsAvatarSpeaking(true);
    await generateSpeech(text, 'rachelle');
    setIsAvatarSpeaking(false);
  };

  // ... (useEffect for speech) ...

  const handleSubmit = async () => {
    // If strict answer key exists (AI Exercises)
    if (step.answerKey) {
      const normalize = (s: string) => s.trim().toLowerCase().replace(/[.,!]/g, '');
      const isCorrect = normalize(userAnswer) === normalize(step.answerKey);

      if (isCorrect) {
        setFeedback({ type: "success", message: "ACCESS GRANTED. PROTOCOL CORRECT." });
        sfx.playSuccess(); // Assuming sfx exists globally or imported
      } else {
        setFeedback({ type: "error", message: `ACCESS DENIED. TRY: "${step.answerKey}"` });
        // Don't advance yet
        setTimeout(() => setFeedback(null), 3000);
        return;
      }
    } else {
      // ... existing flexible validation logic ...
      if (!userAnswer.trim()) { /* ... */ return; }
      /* ... word count check ... */
      setFeedback({ type: "success", message: "MISSION LOG UPDATED." });
    }

    // Success Sequence
    if (step.answerKey) { /* already set feedback above */ }
    else { await handleSpeak("Excellent work agent."); }

    setCompletedSteps(prev => [...prev, step.id]);

    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        setUserAnswer("");
        setShowHint(false);
        setFeedback(null);
      } else {
        onComplete(usedHints);
      }
    }, 2000);
  };

  // ... 

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white font-sans overflow-hidden rounded-2xl relative">
      {/* ... Header ... */}

      {/* HEADER HUD (Keep existing) */}
      <div className="bg-slate-900 border-b border-cyan-900/50 p-4 flex items-center justify-between z-10 shadow-lg">
        {/* ... (Keep existing header code) ... */}
        {/* Update progress bar to reflect total steps (10+) */}
        <div className="flex gap-1 mt-1 flex-wrap max-w-[200px]">
          {steps.map((s, i) => (
            <div key={s.id} className={`h-1.5 w-4 rounded-full transition-all ${i <= currentStep ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-slate-800'}`} />
          ))}
        </div>
        {/* ... */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: MISSION CONTEXT */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* AVATAR (Keep existing) */}
          <div className="bg-slate-900/80 border-2 border-cyan-500/30 rounded-2xl overflow-hidden relative shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            {/* ... */}
            <RachelleAvatar state={isAvatarSpeaking ? 'speaking' : 'idle'} size={180} />
            {/* ... */}
          </div>

          {/* PROTOCOL RULE (Explanation) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={`rule-${step.id}`}
            className="bg-slate-900 border-l-4 border-yellow-500 p-5 rounded-r-xl shadow-lg"
          >
            <h4 className="text-yellow-500 font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Grammar Protocol
            </h4>
            <p className="text-white text-lg font-medium leading-relaxed">
              {step.explanation}
            </p>
          </motion.div>

          {/* DECRYPTION KEY (Hint/Clue) */}
          {step.hintProp && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-cyan-950/30 border border-cyan-500/30 p-4 rounded-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-20"><Key className="w-12 h-12 text-cyan-400" /></div>
              <h4 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-1">
                Decryption Key
              </h4>
              <p className="text-cyan-100 font-mono text-xl font-bold tracking-wide">
                {step.hintProp}
              </p>
            </motion.div>
          )}
        </div>

        {/* RIGHT COLUMN: ACTIVE TERMINAL */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <motion.div
            key={`console-${step.id}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border-2 border-indigo-500/30 rounded-xl p-8 shadow-2xl relative overflow-hidden flex-1 flex flex-col"
          >
            {/* ... Gradients ... */}

            <h3 className="text-slate-400 font-mono text-sm uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">
              Incoming Transmission...
            </h3>

            {/* THE QUESTION */}
            <div className="mb-8">
              <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed font-mono">
                {step.tryItPrompt.split('___').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="inline-block w-24 border-b-4 border-indigo-500 mx-2 animate-pulse align-bottom" />
                    )}
                  </span>
                ))}
              </p>
            </div>

            {/* INPUT AREA */}
            <div className="flex-1">
              {step.type === 'multiple-choice' && step.options ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {step.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setUserAnswer(opt)}
                      className={`p-4 rounded-xl border-2 text-lg font-bold transition-all ${userAnswer === opt ? 'border-indigo-400 bg-indigo-900/50 text-white shadow-[0_0_15px_#6366f1]' : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  autoFocus
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl p-4 text-2xl text-white font-mono placeholder:text-slate-700 focus:border-indigo-500 focus:shadow-[0_0_20px_rgba(79,70,229,0.3)] outline-none transition-all"
                  placeholder={step.hintProp?.includes("Verb") ? "Conjugate verb..." : "Complete mission..."}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              )}
            </div>

            {/* FEEDBACK OVERLAY */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-6 p-4 rounded-xl border-l-4 font-mono font-bold ${feedback.type === 'success' ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-red-900/30 border-red-500 text-red-400'}`}
                >
                  {feedback.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* SUBMIT */}
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!userAnswer}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 text-lg font-black uppercase tracking-widest shadow-lg hover:shadow-indigo-500/25 transition-all"
              >
                {step.type === 'multiple-choice' ? 'Confirm Selection' : 'Submit Code'} <ChevronRight className="ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};


export default GuidedHelp_mod;
