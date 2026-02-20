import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            <div className="max-w-2xl w-full relative z-10">
                {/* 404 Illustration */}
                <div className="text-center mb-8">
                    <div className="relative inline-block">
                        <h1 className="text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-400 leading-none">
                            404
                        </h1>
                        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 -z-10"></div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl text-center">
                    <div className="mb-6">
                        <span className="text-8xl">🧭</span>
                    </div>

                    <h2 className="text-4xl font-black text-white mb-4">
                        ¡Ups! Te has aventurado demasiado lejos
                    </h2>

                    <p className="text-xl text-indigo-200 mb-8 max-w-lg mx-auto">
                        Esta página no existe en nuestro universo educativo. Pero no te preocupes,
                        <span className="font-bold text-white"> ¡podemos llevarte de vuelta!</span>
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 
                                     text-white border border-white/30 px-6 py-3 rounded-xl 
                                     font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver Atrás
                        </button>

                        <button
                            onClick={() => (window.location.href = '/')}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 
                                     hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl 
                                     font-semibold transition-all shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:scale-105"
                        >
                            <Home className="w-5 h-5" />
                            Ir al Dashboard
                        </button>
                    </div>

                    {/* Easter Egg */}
                    <div className="mt-8 pt-8 border-t border-white/20">
                        <p className="text-sm text-indigo-300">
                            💡 <span className="font-semibold">Dato curioso:</span> El error 404 fue nombrado
                            por la habitación 404 en el CERN donde estaba el primer servidor web.
                        </p>
                    </div>
                </div>

                {/* Floating Emoji Decorations */}
                <div className="absolute -top-20 -left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>
                    📚
                </div>
                <div className="absolute -bottom-10 -right-10 text-6xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                    🚀
                </div>
            </div>
        </div>
    );
};
