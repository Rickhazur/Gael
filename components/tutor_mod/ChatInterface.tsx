import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send, Gamepad2, Sparkles, GraduationCap, FileText, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import TutorMascot from "./TutorMascot";
import { getOllieResponse, gradeVocabulary } from "@/lib/olliePersonality_mod";
import { TutorReport } from "@/types/tutor";

interface Message {
  id: string;
  role: "tutor" | "student";
  content: string;
  type?: "text" | "game-prompt" | "correction" | "praise" | "personalized";
  emoji?: string;
  translation?: string;
  phonetic?: string;
  correction?: string;
  replyOptions?: (string | { en: string; es: string })[];
  metadata?: {
    focusArea?: string;
    gradeLevel?: number;
    source?: string;
  };
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onStartGame: () => void;
  onOpenReports?: () => void;
  isTyping?: boolean;
  studentName?: string;
  gradeLevel?: number;
  activeReports?: TutorReport[];
  /** 'standard' = no bilingüe: encabezado y etiquetas en español */
  immersionMode?: 'bilingual' | 'standard';
}

const ChatInterface = ({
  messages,
  onSendMessage,
  onStartGame,
  onOpenReports,
  isTyping = false,
  studentName = "Student",
  gradeLevel = 3,
  activeReports = [],
  immersionMode = 'bilingual',
}: ChatInterfaceProps) => {
  const isNonBilingual = immersionMode === 'standard';
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const getMessageStyle = (type?: string) => {
    switch (type) {
      case "correction":
        return "bg-warning/20 border-warning/30";
      case "praise":
        return "bg-success/20 border-success/30";
      case "game-prompt":
        return "gradient-magic border-accent/30";
      case "personalized":
        return "bg-primary/10 border-primary/30";
      default:
        return "bg-card border-border";
    }
  };

  const getGradeLevelLabel = (grade: number) => {
    const ordinal = ["1st", "2nd", "3rd", "4th", "5th"];
    return ordinal[grade - 1] || `${grade}th`;
  };

  // Get priority challenges for quick actions
  const priorityChallenges = activeReports
    .flatMap(r => r.challenges)
    .filter(c => c.severity === "high")
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full bg-[#050b18] relative group/chat overflow-hidden">
      {/* Background HUD Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5" />

      {/* Holographic Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.02]">
        <div className="w-full h-[2px] bg-blue-400 absolute top-0 animate-[scanline_8s_linear_infinite]" />
      </div>

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
      `}</style>

      {/* Grade Level Indicator — Technological HUD Style */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-indigo-500/20 flex items-center justify-between backdrop-blur-2xl relative z-10">
        <div className="flex items-center gap-4 text-sm">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-lg animate-pulse" />
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border-2 border-indigo-500/30 relative">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="font-black text-white text-[11px] uppercase tracking-[0.2em]">
                {isNonBilingual ? `ARCHIVO ACADÉMICO: GRADO ${gradeLevel}°` : `DIGITAL ARCHIVE: ${getGradeLevelLabel(gradeLevel)} GRADE`}
              </span>
            </div>
            <span className="text-[10px] text-indigo-400/60 font-black uppercase tracking-widest mt-0.5">
              {isNonBilingual ? 'SISTEMA DE ASISTENCIA OLLIE v4.2' : `PROTOCOL: ${studentName.toUpperCase()} DATASET`}
            </span>
          </div>
        </div>
        {activeReports.length > 0 && (
          <button
            onClick={onOpenReports}
            className="group/report flex items-center gap-3 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-black uppercase text-indigo-400 hover:bg-indigo-500/20 transition-all shadow-[0_0_20px_rgba(99,102,241,0.1)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-indigo-500/5 translate-x-[-100%] group-hover/report:translate-x-[100%] transition-transform duration-700" />
            <FileText className="w-3.5 h-3.5" />
            <span>{activeReports.length} {isNonBilingual ? (activeReports.length === 1 ? 'EXPEDIENTE' : 'EXPEDIENTES') : `RECORD${activeReports.length > 1 ? 'S' : ''}`}</span>
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 chat-scrollbar custom-scrollbar relative">
        <AnimatePresence initial={false}>
          {messages.map((message, idx) => (
            <motion.div
              key={message.id}
              className={`flex items-start gap-5 ${message.role === "student" ? "flex-row-reverse" : ""}`}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Avatar with Deep Glow */}
              {message.role === "tutor" && (
                <div className="flex-shrink-0 relative mt-1">
                  <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-xl animate-pulse" />
                  <div className="relative border-2 border-indigo-400/40 rounded-full p-1 bg-slate-950 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                    <TutorMascot size="sm" animate={false} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                </div>
              )}

              {/* Message bubble */}
              <div className="flex flex-col gap-3 max-w-[85%] relative">
                <div
                  className={cn(
                    "p-6 rounded-2xl border transition-all duration-300 relative group overflow-hidden",
                    message.role === "student"
                      ? "bg-slate-950/60 backdrop-blur-md border-indigo-500/40 text-white rounded-tr-none shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                      : "bg-indigo-950/30 backdrop-blur-xl border-indigo-400/20 text-slate-100 rounded-tl-none shadow-2xl"
                  )}
                >
                  {/* Digital Glitch Decoration Pins */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-indigo-400/50" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-indigo-400/50" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-indigo-400/50" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-indigo-400/50" />

                  {message.emoji && (
                    <span className="text-3xl block mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{message.emoji}</span>
                  )}

                  <p className="text-[16px] leading-[1.6] font-medium tracking-tight">
                    {message.content}
                  </p>

                  {/* Translation with separate style */}
                  {message.translation && (
                    <div className="mt-4 pt-4 border-t border-indigo-500/10 italic text-[14px] text-indigo-300/80 font-medium leading-relaxed">
                      {message.translation}
                    </div>
                  )}

                  {message.metadata?.focusArea && (
                    <div className="mt-5 pt-4 border-t border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] bg-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-lg border border-indigo-500/30 flex items-center gap-2 w-fit">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
                        NODE: {message.metadata.focusArea}
                      </span>
                    </div>
                  )}

                  {/* Correction Display */}
                  {message.correction && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-5 p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/30 text-emerald-100 text-sm shadow-[0_0_30px_rgba(16,185,129,0.1)] relative"
                    >
                      <div className="flex items-center gap-3 font-black uppercase tracking-[0.2em] text-[11px] mb-3 text-emerald-400">
                        <Sparkles className="w-4 h-4" />
                        Optimal Syntax Protocol:
                      </div>
                      <p className="leading-relaxed opacity-90 font-medium">{message.correction}</p>
                    </motion.div>
                  )}

                  {/* Phonetic Pronunciation Display */}
                  {message.phonetic && (
                    <div className="mt-5 p-4 rounded-xl bg-blue-500/5 border-l-4 border-blue-500/50 text-blue-100 text-xs">
                      <div className="font-black opacity-60 uppercase tracking-[0.2em] text-[10px] mb-3 flex items-center gap-3">
                        <Mic className="w-3.5 h-3.5" />
                        AUDITORY DATA STREAM
                      </div>
                      <div className="font-mono bg-slate-950/60 px-4 py-3 rounded-lg border border-white/5 italic text-[14px] tracking-wide shadow-inner">
                        {message.phonetic}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reply Options */}
                {message.role === "tutor" && message.replyOptions && idx === messages.length - 1 && (
                  <div className="flex flex-wrap gap-3 mt-5">
                    {message.replyOptions.map((option, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        onClick={() => onSendMessage(typeof option === 'string' ? option : option.en)}
                        className="flex flex-col items-start px-6 py-3.5 bg-slate-950/40 border-2 border-indigo-500/20 hover:border-indigo-400 rounded-xl shadow-2xl hover:shadow-indigo-500/20 transition-all active:scale-95 group/btn relative overflow-hidden backdrop-blur-sm"
                      >
                        <div className="absolute inset-0 bg-indigo-500/0 group-hover/btn:bg-indigo-500/10 transition-colors" />
                        <span className="text-[13px] font-black text-indigo-300 group-hover/btn:text-white relative z-10 uppercase tracking-tighter">
                          {typeof option === 'string' ? option : option.en}
                        </span>
                        {typeof option !== 'string' && option.es && (
                          <span className="text-[10px] text-slate-500 font-bold italic mt-1 relative z-10 transition-colors uppercase tracking-widest">
                            {option.es}
                          </span>
                        )}
                        <div className="absolute right-2 bottom-2 w-1.5 h-1.5 bg-indigo-500/40 rounded-full" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Student avatar with Tech Border */}
              {message.role === "student" && (
                <div className="shrink-0 relative mt-1">
                  <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-xl animate-pulse" />
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 border-2 border-indigo-500/40 flex items-center justify-center flex-shrink-0 shadow-2xl relative z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(79,70,229,0.2),_transparent)]" />
                    <span className="text-2xl relative z-10">🧑‍🚀</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              className="flex items-start gap-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative w-11 h-11 border-2 border-indigo-500/30 rounded-full bg-slate-950 flex items-center justify-center p-1.5 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                <TutorMascot size="sm" mood="thinking" animate={false} />
                <div className="absolute inset-0 border-2 border-indigo-400/30 rounded-full animate-ping opacity-20" />
              </div>
              <div className="bg-indigo-950/20 backdrop-blur-xl p-6 rounded-2xl rounded-tl-none border border-indigo-400/20 shadow-2xl">
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Priority Challenges Quick Actions */}
      {priorityChallenges.length > 0 && (
        <div className="px-6 py-5 bg-slate-950/90 border-t border-indigo-500/20 backdrop-blur-3xl relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/70 mb-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-indigo-500 rounded-sm rotate-45 animate-pulse shadow-[0_0_10px_#6366f1]" />
            {isNonBilingual ? 'PROTOCOLOS DE REFUERZO ACTIVO:' : 'ACTIVE REINFORCEMENT NODES:'}
          </p>
          <div className="flex gap-4 flex-wrap">
            {priorityChallenges.map((challenge) => (
              <button
                key={challenge.id}
                onClick={() => onSendMessage(isNonBilingual ? `Ayúdame con ${challenge.englishConnection}` : `Help me with ${challenge.englishConnection}`)}
                className="px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-[12px] font-black text-indigo-300 uppercase tracking-tight transition-all active:scale-95 shadow-lg shadow-indigo-500/5 hover:border-indigo-400 flex items-center gap-2 group/node"
              >
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full group-hover/node:scale-150 transition-transform" />
                {challenge.area}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions Tool Bar */}
      <div className="px-6 py-5 flex gap-4 overflow-x-auto bg-slate-950/60 border-t border-indigo-500/10 scrollbar-hide backdrop-blur-md">
        <button
          onClick={onStartGame}
          className="flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all font-black uppercase text-[11px] tracking-widest active:scale-95 shrink-0 relative overflow-hidden group/btn"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform" />
          <Gamepad2 className="w-5 h-5 relative z-10" />
          <span className="relative z-10">{isNonBilingual ? 'Misiones' : 'Missions'}</span>
        </button>
        <button
          onClick={() => onSendMessage(isNonBilingual ? 'Dame un nuevo desafío 🎯' : 'Give me a new challenge 🎯')}
          className="flex items-center gap-3 px-6 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-2xl border-2 border-white/5 hover:border-amber-500/30 transition-all font-black uppercase text-[11px] tracking-widest active:scale-95 shrink-0 group/btn"
        >
          <Sparkles className="w-5 h-5 text-amber-400 group-hover/btn:animate-spin" />
          <span>{isNonBilingual ? 'Desafío' : 'Challenge'}</span>
        </button>
        {onOpenReports && (
          <button
            onClick={onOpenReports}
            className="flex items-center gap-3 px-6 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-2xl border-2 border-white/5 hover:border-indigo-400/30 transition-all font-black uppercase text-[11px] tracking-widest active:scale-95 shrink-0 group/btn"
          >
            <FileText className="w-5 h-5 text-indigo-400 group-hover/btn:scale-110 transition-transform" />
            <span>{isNonBilingual ? 'Archivos' : 'Files'}</span>
          </button>
        )}
      </div>

      {/* Input area - Futuristic Hud Bar */}
      <form onSubmit={handleSubmit} className="p-8 border-t border-indigo-500/20 bg-slate-950/90 backdrop-blur-3xl relative z-20">
        <div className="flex gap-5 relative">
          <div className="relative flex-1 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-10 group-focus-within:opacity-30 blur transition-all" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isNonBilingual ? `REDACTAR INFORME DE SESIÓN...` : `LOGGING SESSION DATA...`}
              className="w-full p-5 px-8 rounded-2xl bg-slate-900/80 border-2 border-white/5 focus:border-indigo-500/50 focus:bg-slate-900 focus:outline-none transition-all text-white placeholder:text-slate-700 text-[16px] font-medium shadow-2xl relative z-10"
            />
            {/* Pulsing indicator in input */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse opacity-50 z-20" />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-[0_0_40px_rgba(0,0,0,0.5)] active:scale-[0.85] relative overflow-hidden group/send",
              input.trim()
                ? "bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-500 hover:shadow-indigo-500/50 border-2 border-indigo-400/50"
                : "bg-slate-900 text-slate-800 cursor-not-allowed border-2 border-white/5"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent translate-y-[100%] group-hover/send:translate-y-0 transition-transform" />
            <Send className={cn("w-7 h-7 relative z-10", input.trim() && "group-hover/send:translate-x-1 group-hover/send:-translate-y-1 transition-transform animate-pulse")} />
          </button>
        </div>
        {/* Footer HUD info */}
        <div className="mt-4 flex justify-between items-center px-2">
          <div className="flex gap-4">
            <span className="text-[9px] font-black text-indigo-500/50 tracking-widest uppercase">ENCRYPTED CONNECTION: AES-256</span>
            <span className="text-[9px] font-black text-indigo-500/50 tracking-widest uppercase">STATUS: ACTIVE</span>
          </div>
          <span className="text-[9px] font-black text-indigo-500/30 tracking-[0.2em] uppercase">SYSTEM.OLLIE.CORE_V4</span>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
