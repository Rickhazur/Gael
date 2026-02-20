import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { edgeTTS } from '@/services/edgeTTS';
import {
    Search,
    FileText,
    Camera,
    X,
    CheckCircle2,
    Lightbulb,
    ClipboardCheck,
    Volume2,
    Siren,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { callChatApi } from '@/services/ai_service';

// Reusing the logic from AssignmentIntake but localized for Inspector Theme
interface InspectionResult {
    id: string;
    analysis: string;
    analysisEs: string;
    solution: string;
    solutionEs: string;
    steps: string[];
    stepsEs: string[];
    tips: string[];
    tipsEs: string[];
}

const analyzeWithInspector = async (text: string, imageUrl?: string): Promise<InspectionResult> => {
    const sysPrompt = `You are the City Inspector, a helpful and precise tutor for elementary students.
  The student has a question or a problem (homework).
  Analyze it and provide a clear, step-by-step solution.
  
  RETURN STRICT JSON:
  {
    "analysis": "Brief summary in English.",
    "analysisEs": "Breve resumen en español.",
    "solution": "The direct answer in English.",
    "solutionEs": "Respuesta directa en español.",
    "steps": ["English step 1", "English step 2"],
    "stepsEs": ["Paso 1 en español", "Paso 2 en español"],
    "tips": ["English tip 1"],
    "tipsEs": ["Consejo 1 en español"]
  }
  `;

    try {
        const messages: any[] = [
            { role: "system", content: sysPrompt },
            {
                role: "user",
                content: imageUrl
                    ? [{ type: "text", text: `Student Inquiry: ${text}` }, { type: "image_url", image_url: { url: imageUrl } }]
                    : `Student Inquiry: ${text}`
            }
        ];

        const data = await callChatApi(messages, "gpt-4o");
        const content = data.choices[0]?.message?.content;
        const json = JSON.parse(content.replace(/```json|```/g, '').trim());

        return {
            id: `ins_${Date.now()}`,
            analysis: json.analysis,
            analysisEs: json.analysisEs,
            solution: json.solution,
            solutionEs: json.solutionEs,
            steps: json.steps || [],
            stepsEs: json.stepsEs || [],
            tips: json.tips || [],
            tipsEs: json.tipsEs || []
        };

    } catch (error) {
        console.error("Inspector Analysis Failed", error);
        return {
            id: `ins_err_${Date.now()}`,
            analysis: "Could not process the specific request.",
            analysisEs: "No se pudo procesar la solicitud específica.",
            solution: "Please try asking again clearly.",
            solutionEs: "Por favor, intenta preguntar de nuevo con claridad.",
            steps: ["Check your spelling", "Provide more details"],
            stepsEs: ["Revisa tu ortografía", "Proporciona más detalles"],
            tips: ["I am here to help!"],
            tipsEs: ["¡Estoy aquí para ayudar!"]
        };
    }
};

const CityInspector: React.FC = () => {
    const [query, setQuery] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [isInspecting, setIsInspecting] = useState(false);
    const [result, setResult] = useState<InspectionResult | null>(null);
    const [currentSubtitle, setCurrentSubtitle] = useState<{ en: string, es: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInspect = async () => {
        if (!query.trim() && !image) return;
        setIsInspecting(true);
        setCurrentSubtitle({ en: "Inspecting your inquiry. Please wait.", es: "Inspeccionando tu consulta. Por favor espera." });
        await edgeTTS.speak("Inspecting your inquiry. Please wait.", "rachelle");
        await edgeTTS.speak("Inspeccionando tu consulta. Por favor espera.", "lina");

        const res = await analyzeWithInspector(query, image || undefined);
        setResult(res);
        setIsInspecting(false);
        setCurrentSubtitle({ en: "Inspection complete. Here are my findings.", es: "Inspección completa. Aquí están mis hallazgos." });
        await edgeTTS.speak("Inspection complete. Here are my findings.", "rachelle");
        await edgeTTS.speak("Inspección completa. Aquí están mis hallazgos.", "lina");
        setTimeout(() => setCurrentSubtitle(null), 3000);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const reset = () => {
        setResult(null);
        setQuery("");
        setImage(null);
    };

    return (
        <div className="h-screen bg-slate-50 flex flex-col items-center p-6 relative overflow-hidden font-sans text-slate-900">
            {/* Background */}
            <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Header */}
            <div className="z-10 w-full max-w-4xl flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Siren size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">City Inspector</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Analysis Hub</p>
                    </div>
                </div>
                {!result && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        inspector online
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="z-10 w-full max-w-3xl flex-1 flex flex-col">
                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 flex-1 flex flex-col relative overflow-hidden"
                        >
                            <h2 className="text-lg font-black text-slate-700 mb-6 flex items-center gap-2">
                                <Search className="text-blue-500" />
                                SUBMIT INQUIRY FOR INSPECTION
                            </h2>

                            <Textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Type your question here... (e.g. 'How do I solve 2x + 4 = 10?')"
                                className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl p-6 text-lg resize-none focus:bg-white focus:border-blue-500 transition-all mb-4"
                            />

                            {image && (
                                <div className="mb-4 relative inline-block">
                                    <img src={image} alt="Evidence" className="h-32 rounded-xl border-2 border-slate-200" />
                                    <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                                </div>
                            )}

                            <div className="flex gap-4 mt-auto">
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-14 px-6 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600 font-bold uppercase">
                                    <Camera className="mr-2" size={20} /> Attach Photo
                                </Button>
                                <Button
                                    onClick={handleInspect}
                                    disabled={isInspecting || (!query && !image)}
                                    className="flex-1 h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-lg shadow-lg hover:shadow-blue-500/30 transition-all"
                                >
                                    {isInspecting ? 'Inspecting...' : 'Inspect Now'}
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[2rem] shadow-xl border-t-8 border-blue-600 p-8 flex-1 flex flex-col relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                                <ClipboardCheck size={120} />
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 uppercase">Inspection Report</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Case ID: {result.id.slice(-6)}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Analysis</h3>
                                    <p className="text-slate-700 font-bold">{result.analysis}</p>
                                    <p className="text-slate-500 text-sm italic mt-1">{result.analysisEs}</p>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Solution Steps</h3>
                                    <div className="space-y-3">
                                        {result.steps.map((step, i) => (
                                            <div key={i} className="flex gap-4 items-start">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 shrink-0">{i + 1}</div>
                                                <div>
                                                    <p className="text-slate-800 font-bold">{step}</p>
                                                    <p className="text-slate-500 text-sm italic">{result.stepsEs[i]}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                                    <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Lightbulb size={14} /> Inspector's Tips
                                    </h3>
                                    <ul className="list-disc list-inside text-slate-700 space-y-2">
                                        {result.tips.map((tip, i) => (
                                            <li key={i}>
                                                <span className="font-bold">{tip}</span>
                                                <br />
                                                <span className="text-slate-500 text-sm italic ml-5">({result.tipsEs[i]})</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <Button onClick={reset} className="mt-6 w-full h-16 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl">
                                Verify Another Case
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                    <Volume2 size={16} className="text-white" />
                                </div>
                                <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Inspector's Voice</span>
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
        </div>
    );
};

export default CityInspector;
