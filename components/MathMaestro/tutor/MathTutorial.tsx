
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinaAvatar } from './LinaAvatar';
import ttsService from '@/services/tts';
import { Button } from '@/components/ui/button';
import { ChevronRight, X, Sparkles, Brain, Zap, Trophy } from 'lucide-react';

interface TutorialStep {
    id: string;
    targetId: string;
    title: string;
    content: string;
    speech: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'welcome',
        targetId: 'tut-whiteboard',
        title: "¡Bienvenido a tu Pizarra Mágica!",
        content: "Aquí es donde ocurre toda la magia. Puedes dibujar o escribir tus problemas matemáticos.",
        speech: "¡Hola! Soy la Profe Lina. ¡Qué alegría tenerte aquí! Esta es tu pizarra mágica. Aquí puedes dibujar números, figuras o escribir cualquier problema que quieras resolver conmigo.",
        position: 'center'
    },
    {
        id: 'keyboard',
        targetId: 'tut-keyboard',
        title: "Escribe tus problemas",
        content: "Usa el teclado para ingresar operaciones rápidamente como 25 + 18 o 1/2 + 1/4.",
        speech: "Si prefieres usar el teclado, pulsa este botón. Podrás escribir operaciones súper rápido y yo las organizaré en la pizarra para ti.",
        position: 'top'
    },
    {
        id: 'mic',
        targetId: 'tut-mic',
        title: "Habla conmigo",
        content: "Pulsa el micrófono y dime 'continuar' o 'revisar' para interactuar sin escribir.",
        speech: "¡Mira esto! Con el micrófono puedes hablarme directamente. Di 'continuar' para pasar al siguiente paso o 'revisar' para que vea lo que has hecho.",
        position: 'top'
    },
    {
        id: 'photo',
        targetId: 'tut-photo',
        title: "Escanea tu cuaderno",
        content: "¡Toma una foto a tu cuaderno y yo la analizaré para ayudarte con tus tareas!",
        speech: "Este es mi favorito. Si tienes una tarea en tu cuaderno, ¡tómale una foto! Yo la escanearé y la pondré aquí en la pizarra para que la resolvamos juntos.",
        position: 'top'
    },
    {
        id: 'arena',
        targetId: 'tut-arena',
        title: "Diviértete en la Arena",
        content: "Cuando termines de estudiar, ¡practica con juegos espaciales y gana monedas!",
        speech: "¡La Arena de Juegos! Aquí puedes practicar lo que aprendimos con emocionantes juegos espaciales. ¡Gana muchas monedas Nova y conviértete en un experto!",
        position: 'top'
    },
    {
        id: 'mastery',
        targetId: 'tut-mastery',
        title: "Modo Maestro",
        content: "Actívalo para un reto mayor sin pistas y gana el doble de recompensas.",
        speech: "¿Quieres un reto de verdad? Activa el Modo Maestro. No te daré pistas, ¡pero ganarás el DOBLE de monedas por cada ejercicio correcto!",
        position: 'top'
    },
    {
        id: 'eraser',
        targetId: 'tut-eraser',
        title: "Limpia la Pizarra",
        content: "¿Quieres empezar de nuevo? Usa el borrador para dejar todo reluciente.",
        speech: "Si quieres empezar un ejercicio nuevo, usa el borrador. ¡Dejará la pizarra y el chat limpios para una nueva aventura!",
        position: 'top'
    },
    {
        id: 'save',
        targetId: 'tut-save',
        title: "Guarda tus Apuntes",
        content: "No olvides guardar lo que aprendimos hoy para repasarlo después en la Biblioteca.",
        speech: "Por último, no olvides guardar tus apuntes. Así podrás repasar todo lo que aprendimos hoy cuando quieras en tu Biblioteca personal.",
        position: 'bottom'
    },
    {
        id: 'chat',
        targetId: 'tut-chat-input',
        title: "Chatea conmigo",
        content: "Escribe tus dudas aquí y yo te responderé paso a paso.",
        speech: "Aquí es donde charlamos. Escribe cualquier duda que tengas y yo te ayudaré a resolverla dándote pistas inteligentes.",
        position: 'top'
    },
    {
        id: 'vision',
        targetId: 'tut-magic-vision',
        title: "Visión Banana Pro",
        content: "Usa este botón para que cree imágenes mágicas de tus problemas.",
        speech: "¡Y mira este botón especial! Es la Visión Banana Pro. Cuando tengamos un problema difícil, puedo crear imágenes mágicas para que lo entiendas mejor.",
        position: 'bottom'
    },
    {
        id: 'ready',
        targetId: 'tut-whiteboard',
        title: "¡Todo Listo!",
        content: "¿Empezamos con un ejercicio? ¡Escribe 'Hola Lina' en el chat o dibuja algo!",
        speech: "¡Ya eres un experto en mi sistema! Ahora, intentemos algo. Escribe 'Hola Lina' en el chat o pon una suma en la pizarra. ¡Vamos a divertirnos con las matemáticas!",
        position: 'center'
    }
];

interface MathTutorialProps {
    isOpen: boolean;
    onClose: () => void;
    language: 'es' | 'en';
    userName?: string;
}

export const MathTutorial: React.FC<MathTutorialProps> = ({ isOpen, onClose, language, userName }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlight, setSpotlight] = useState({ x: 0, y: 0, width: 0, height: 0, opacity: 0 });
    const [isLinaSpeaking, setIsLinaSpeaking] = useState(false);

    const step = TUTORIAL_STEPS[currentStep];

    useEffect(() => {
        if (!isOpen) return;

        const updateSpotlight = () => {
            const element = document.getElementById(step.targetId);
            if (element) {
                const rect = element.getBoundingClientRect();
                setSpotlight({
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height,
                    opacity: 1
                });
            } else if (step.id === 'welcome' || step.id === 'ready') {
                setSpotlight({ x: window.innerWidth / 2, y: window.innerHeight / 2, width: 0, height: 0, opacity: 0 });
            }
        };

        updateSpotlight();
        window.addEventListener('resize', updateSpotlight);

        // Speech logic
        const finalSpeech = step.speech.replace('{userName}', userName || "amigo");
        setIsLinaSpeaking(true);
        ttsService.stop();
        ttsService.speak(finalSpeech, () => setIsLinaSpeaking(false));

        return () => window.removeEventListener('resize', updateSpotlight);
    }, [currentStep, isOpen, step, userName]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        ttsService.stop();
        localStorage.setItem('nova_math_tutorial_completed', 'true');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[2000] pointer-events-none overflow-hidden">
            {/* Dark Overlay with Hole */}
            <div className="absolute inset-0 pointer-events-auto bg-slate-950/70 transition-opacity duration-500"
                style={{
                    clipPath: spotlight.opacity
                        ? `polygon(0% 0%, 0% 100%, ${spotlight.x}px 100%, ${spotlight.x}px ${spotlight.y}px, ${spotlight.x + spotlight.width}px ${spotlight.y}px, ${spotlight.x + spotlight.width}px ${spotlight.y + spotlight.height}px, ${spotlight.x}px ${spotlight.y + spotlight.height}px, ${spotlight.x}px 100%, 100% 100%, 100% 0%)`
                        : 'none'
                }}
            />

            {/* Content Card */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`pointer-events-auto bg-white rounded-[2.5rem] shadow-2xl border-4 border-cyan-400 p-8 max-w-lg w-full relative flex flex-col md:flex-row gap-6 ${step.position === 'top' ? 'mt-auto mb-32' :
                            step.position === 'bottom' ? 'mb-auto mt-32' : ''
                            }`}
                    >
                        {/* Lina Profile */}
                        <div className="flex flex-col items-center shrink-0">
                            <div className="w-24 h-24 bg-slate-900 rounded-2xl p-2 relative overflow-hidden border-2 border-cyan-100">
                                <LinaAvatar state={isLinaSpeaking ? 'speaking' : 'idle'} size={80} />
                                <div className="absolute bottom-1 right-1 flex gap-0.5">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`w-1 h-1 rounded-full ${isLinaSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} style={{ animationDelay: `${i * 0.1}s` }} />
                                    ))}
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-cyan-600 mt-2 tracking-widest uppercase">Profe Lina</span>
                        </div>

                        {/* Text Content */}
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-cyan-500" />
                                {step.title}
                            </h3>
                            <p className="text-slate-600 font-bold leading-tight mb-6">
                                {step.content}
                            </p>

                            <div className="flex items-center justify-between gap-4 mt-auto">
                                <div className="flex gap-1">
                                    {TUTORIAL_STEPS.map((_, i) => (
                                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-cyan-500' : 'w-1.5 bg-slate-200'}`} />
                                    ))}
                                </div>

                                <Button
                                    onClick={handleNext}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl px-6 py-2 shadow-lg shadow-cyan-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    {currentStep === TUTORIAL_STEPS.length - 1 ? '¡VAMOS!' : 'ENTENDIDO'}
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-lg hover:rotate-90 transition-all pointer-events-auto"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
