import React, { useState, useEffect } from 'react';
import { Brain, Sparkles } from 'lucide-react';

const SplashScreen: React.FC = () => {
    const [showRepair, setShowRepair] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowRepair(true);
            console.log('🔄 Splash taking too long, showing repair option...');
        }, 2000); // Aparece más rápido (2s)
        return () => clearTimeout(timer);
    }, []);

    const handleRepair = () => {
        if (confirm('Esto limpiará el sistema para arreglar errores de carga. ¿Continuar?')) {
            // Unregister Service Worker
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    for (let registration of registrations) {
                        registration.unregister();
                    }
                });
            }
            // Clear cache and storage
            localStorage.clear();
            sessionStorage.clear();
            // Reload
            window.location.reload();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center overflow-hidden font-poppins">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-indigo-100/40 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[800px] h-[800px] bg-purple-100/40 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Logo Animation */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-200 animate-bounce-gentle">
                        <Brain className="w-12 h-12 text-white animate-pulse-slow" />
                    </div>
                    {/* Floating Sparkles */}
                    <div className="absolute -top-4 -right-4 bg-white p-2 rounded-full shadow-md animate-float" style={{ animationDelay: '0.5s' }}>
                        <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                </div>

                {/* Text Reveal */}
                <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight animate-fade-in-up">
                    Nova Schola
                </h1>

                <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="h-[1px] w-8 bg-indigo-200"></div>
                    <span className="text-indigo-600 font-medium text-sm uppercase tracking-widest">
                        Academia IA
                    </span>
                    <div className="h-[1px] w-8 bg-indigo-200"></div>
                </div>

                {/* Loading Indicator */}
                <div className="mt-12 flex flex-col items-center gap-6">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></div>
                        <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></div>
                        <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
                    </div>

                    {showRepair && (
                        <button
                            onClick={handleRepair}
                            className="text-xs text-indigo-400 hover:text-indigo-600 font-medium transition-colors animate-fade-in underline underline-offset-4"
                        >
                            ¿Tarda demasiado? Pulsa aquí para limpiar el sistema
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
