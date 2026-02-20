import React from 'react';
import { ModelGallery } from '../components/3D/ModelGallery';
import { GeometryVisualizer } from '../components/MathMaestro/tutor/GeometryVisualizer';

export function AR3DDemo() {
    const [mode, setMode] = React.useState<'gallery' | 'geometry'>('gallery');
    const [language, setLanguage] = React.useState<'es' | 'en'>('es');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-5xl font-black text-white mb-2">
                            🎨 3D/AR Demo
                        </h1>
                        <p className="text-white/60 text-lg">
                            {language === 'es'
                                ? 'Explora modelos 3D en tu navegador. En móvil, usa AR para verlos en tu espacio.'
                                : 'Explore 3D models in your browser. On mobile, use AR to see them in your space.'}
                        </p>
                    </div>
                    <button
                        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                        className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-all"
                    >
                        {language === 'es' ? '🇬🇧 English' : '🇪🇸 Español'}
                    </button>
                </div>

                {/* Mode Selector */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setMode('gallery')}
                        className={`flex-1 py-4 px-6 rounded-2xl font-black text-lg transition-all ${mode === 'gallery'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105'
                                : 'bg-slate-800 text-white/60 hover:bg-slate-700'
                            }`}
                    >
                        📚 {language === 'es' ? 'Galería Completa' : 'Full Gallery'}
                    </button>
                    <button
                        onClick={() => setMode('geometry')}
                        className={`flex-1 py-4 px-6 rounded-2xl font-black text-lg transition-all ${mode === 'geometry'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                                : 'bg-slate-800 text-white/60 hover:bg-slate-700'
                            }`}
                    >
                        📐 {language === 'es' ? 'Geometría (Math Maestro)' : 'Geometry (Math Maestro)'}
                    </button>
                </div>

                {/* Info Banner */}
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-400/30 rounded-2xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white mb-2">
                                {language === 'es' ? '📦 Modelos 3D Requeridos' : '📦 3D Models Required'}
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed">
                                {language === 'es'
                                    ? 'Para que los modelos 3D aparezcan, necesitas descargar archivos .glb y colocarlos en public/models/. Ver docs/3D_AR_IMPLEMENTATION.md para instrucciones completas.'
                                    : 'For 3D models to appear, you need to download .glb files and place them in public/models/. See docs/3D_AR_IMPLEMENTATION.md for complete instructions.'}
                            </p>
                            <div className="mt-3 flex gap-2">
                                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-lg text-emerald-300 text-xs font-bold">
                                    ✅ Model-Viewer Installed
                                </span>
                                <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300 text-xs font-bold">
                                    ✅ Components Ready
                                </span>
                                <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-lg text-amber-300 text-xs font-bold">
                                    ⏳ Models Needed
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto">
                {mode === 'gallery' ? (
                    <ModelGallery language={language} />
                ) : (
                    <GeometryVisualizer language={language} currentGrade={4} />
                )}
            </div>

            {/* Footer Instructions */}
            <div className="max-w-7xl mx-auto mt-12">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                    <h3 className="text-2xl font-black text-white mb-4">
                        🚀 {language === 'es' ? 'Cómo Usar' : 'How to Use'}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-lg font-bold text-cyan-300 mb-2">
                                💻 {language === 'es' ? 'En Computadora' : 'On Computer'}
                            </h4>
                            <ul className="space-y-2 text-white/70 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-cyan-400">•</span>
                                    <span>{language === 'es' ? 'Arrastra con el ratón para rotar' : 'Drag with mouse to rotate'}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-cyan-400">•</span>
                                    <span>{language === 'es' ? 'Rueda del ratón para zoom' : 'Mouse wheel to zoom'}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-cyan-400">•</span>
                                    <span>{language === 'es' ? 'Haz clic en modelos para explorar' : 'Click on models to explore'}</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-violet-300 mb-2">
                                📱 {language === 'es' ? 'En Móvil (Bonus AR)' : 'On Mobile (Bonus AR)'}
                            </h4>
                            <ul className="space-y-2 text-white/70 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-violet-400">•</span>
                                    <span>{language === 'es' ? 'Toca y arrastra para rotar' : 'Touch and drag to rotate'}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-violet-400">•</span>
                                    <span>{language === 'es' ? 'Pellizca para zoom' : 'Pinch to zoom'}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-violet-400">•</span>
                                    <span>{language === 'es' ? 'Botón "Ver en tu espacio" para AR' : '"View in your space" button for AR'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
