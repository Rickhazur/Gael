import React, { useState, useRef } from 'react';
import { MathBlockWorkspace } from './BlocklyWorkspace';
import { TutorChat, TutorChatRef } from '../MathMaestro/tutor/TutorChat';
import { Button } from '@/components/ui/button';
import { useLearning } from '@/context/LearningContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const MathLab: React.FC = () => {
    const { language } = useLearning();
    const chatRef = useRef<TutorChatRef>(null);
    const [xml, setXml] = useState<string>("");

    // Convert XML/Block state to a readable string for the AI
    // In a real implementation, this would parse the XML or use Blockly's code generator
    const getWorkspaceSummary = (xmlString: string) => {
        if (!xmlString || xmlString.length < 50) return "Empty Workspace";
        // Simple heuristic for now: pass the raw XML or specific block types found
        // Ideally we generate code e.g. "Number(5) + Number(6)"
        return `Current Block Structure (XML): ${xmlString}`;
    };

    const handleCheck = async () => {
        if (chatRef.current) {
            const summary = getWorkspaceSummary(xml);
            const prompt = language === 'es'
                ? `[SYSTEM] El estudiante ha construido esto en Blockly: ${summary}. Evalúa si es correcto para el problema actual.`
                : `[SYSTEM] Student built this in Blockly: ${summary}. Evaluate if correct.`;

            // We interpret this as a "Text" analysis since strictly speaking it's not an image yet
            // (Unless we screenshot the div, which is harder. Textual representation of logic is better for code-tutors)
            await chatRef.current.analyzeText(prompt);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 font-nunito p-4 gap-4">
            {/* Header */}
            <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                        <span className="text-2xl">🧩</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white">
                            {language === 'es' ? 'Laboratorio de Bloques' : 'Block Math Lab'}
                        </h1>
                        <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                            {language === 'es' ? 'CONSTRUYE TU MATEMÁTICA' : 'BUILD YOUR MATH'}
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleCheck}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black px-8 py-6 rounded-xl shadow-lg shadow-indigo-900/50 transition-all hover:scale-105"
                >
                    {language === 'es' ? 'REVISAR BLOQUES' : 'CHECK BLOCKS'}
                </Button>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* LEFT: Blockly Workspace */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-[2] bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 relative"
                >
                    <MathBlockWorkspace
                        onWorkspaceChange={(newXml) => setXml(newXml)}
                    />
                </motion.div>

                {/* RIGHT: Tutor Chat */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden flex flex-col"
                >
                    <TutorChat
                        ref={chatRef}
                        language={language === 'bilingual' ? 'es' : language}
                        grade={3}
                        curriculum="ib-pyp"
                        studentName="Estudiante" // TODO: Get real name
                        tutor="lina"
                        /* Mock handlers since we don't have a whiteboard here */
                        onSendToBoard={() => { }}
                        onDrawVerticalOp={() => { }}
                        onDrawDivisionStep={() => { }}
                    />
                </motion.div>
            </div>
        </div>
    );
};
