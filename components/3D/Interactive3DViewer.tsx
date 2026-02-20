import React, { useEffect, useState } from 'react';
import { Info, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface Interactive3DViewerProps {
    modelId: string;
    modelUrl?: string;
    title: string;
    description: string;
    subject: 'science' | 'geometry' | 'history' | 'geography';
    language?: 'es' | 'en';
    /** Add an idea from this model to the report (e.g. in Research Center). */
    onAddIdeaToReport?: (idea: string) => void;
}

export function Interactive3DViewer({
    modelId,
    modelUrl,
    title,
    description,
    subject,
    language = 'es',
    onAddIdeaToReport
}: Interactive3DViewerProps) {
    const [isARSupported, setIsARSupported] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        // Detect if device supports AR
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        setIsARSupported(isMobile);

        // Dynamically load model-viewer script only when this component is used
        if (!customElements.get('model-viewer')) {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
            document.head.appendChild(script);
        }
    }, []);

    // Use provided URL or fallback to local path
    const modelPath = modelUrl || `/models/${subject}/${modelId}.glb`;

    const instructions = language === 'es' ? {
        desktop: '🖱️ Arrastra para rotar • Rueda del ratón para zoom',
        mobile: '👆 Toca y arrastra para rotar • Pellizca para zoom',
        ar: '📱 Ver en tu espacio'
    } : {
        desktop: '🖱️ Drag to rotate • Mouse wheel to zoom',
        mobile: '👆 Touch and drag to rotate • Pinch to zoom',
        ar: '📱 View in your space'
    };

    return (
        <div className="relative w-full h-[600px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-slate-900/95 to-transparent p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-white mb-1">{title}</h3>
                        <p className="text-cyan-300 text-sm">{description}</p>
                    </div>
                    <Button
                        onClick={() => setShowInfo(!showInfo)}
                        className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded-xl"
                    >
                        <Info className="w-5 h-5 text-cyan-400" />
                    </Button>
                </div>
            </div>

            {/* 3D Model Viewer */}
            <div className="relative w-full h-full">
                {/* CSS Placeholder Cube (shows until .glb loads) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-48 h-48 mx-auto mb-6 perspective-1000">
                            <div className="w-full h-full relative transform-style-3d animate-spin-slow">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 opacity-80 border-4 border-cyan-300"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 opacity-60 border-4 border-blue-300 transform rotate-y-90"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-600 opacity-60 border-4 border-purple-300 transform rotate-x-90"></div>
                            </div>
                        </div>
                        <p className="text-white/60 text-sm font-bold">
                            {language === 'es'
                                ? '📦 Modelo 3D de demostración'
                                : '📦 Demo 3D Model'}
                        </p>
                        <p className="text-white/40 text-xs mt-2">
                            {language === 'es'
                                ? 'Agrega archivos .glb para ver modelos reales'
                                : 'Add .glb files to see real models'}
                        </p>
                    </div>
                </div>

                <model-viewer
                    src={modelPath}
                    camera-controls
                    auto-rotate
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    shadow-intensity="1"
                    exposure="1"
                    style={{
                        width: '100%',
                        height: '100%',
                        background: 'transparent'
                    }}
                >
                    {/* AR Button (only shows on mobile) */}
                    <button
                        slot="ar-button"
                        className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                    >
                        <span className="text-2xl">📱</span>
                        {instructions.ar}
                    </button>
                </model-viewer>

                {/* Añadir idea para mi reporte (when used from Research Center) */}
                {onAddIdeaToReport && (
                    <div className="absolute bottom-24 left-6 right-6 z-20 flex justify-center">
                        <Button
                            onClick={() => onAddIdeaToReport(`${title}: ${description}`)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            {language === 'es' ? 'Añadir idea para mi reporte' : 'Add idea to my report'}
                        </Button>
                    </div>
                )}

                {/* Controls Overlay */}
                <div className="absolute bottom-6 left-0 right-0 z-20 px-6">
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                        <p className="text-center text-white/70 text-sm font-medium">
                            {isARSupported ? instructions.mobile : instructions.desktop}
                        </p>
                    </div>
                </div>

                {/* Info Panel */}
                {showInfo && (
                    <div className="absolute top-24 right-6 z-30 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-cyan-400/30 p-6 max-w-sm shadow-[0_0_40px_rgba(6,182,212,0.3)]">
                        <h4 className="text-lg font-black text-white mb-3">
                            {language === 'es' ? '💡 Cómo usar' : '💡 How to use'}
                        </h4>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li className="flex items-start gap-2">
                                <span className="text-cyan-400">•</span>
                                <span>{language === 'es' ? 'Arrastra con el ratón o dedo para rotar el modelo' : 'Drag with mouse or finger to rotate the model'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-cyan-400">•</span>
                                <span>{language === 'es' ? 'Usa la rueda del ratón o pellizca para hacer zoom' : 'Use mouse wheel or pinch to zoom'}</span>
                            </li>
                            {isARSupported && (
                                <li className="flex items-start gap-2">
                                    <span className="text-violet-400">•</span>
                                    <span>{language === 'es' ? 'Toca "Ver en tu espacio" para colocar el modelo en tu habitación usando AR' : 'Tap "View in your space" to place the model in your room using AR'}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {/* Subject Badge */}
                <div className="absolute top-6 right-6 z-20">
                    <div className={`px-4 py-2 rounded-full font-black text-sm ${getSubjectColor(subject)}`}>
                        {getSubjectEmoji(subject)} {subject.toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getSubjectColor(subject: string): string {
    const colors = {
        science: 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300',
        geometry: 'bg-blue-500/20 border border-blue-400/30 text-blue-300',
        history: 'bg-amber-500/20 border border-amber-400/30 text-amber-300',
        geography: 'bg-teal-500/20 border border-teal-400/30 text-teal-300'
    };
    return colors[subject as keyof typeof colors] || colors.science;
}

function getSubjectEmoji(subject: string): string {
    const emojis = {
        science: '🔬',
        geometry: '📐',
        history: '📜',
        geography: '🌍'
    };
    return emojis[subject as keyof typeof emojis] || '📚';
}
