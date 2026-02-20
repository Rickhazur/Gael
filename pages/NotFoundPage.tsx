import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, HelpCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full text-center"
            >
                {/* Animated 404 */}
                <motion.div
                    className="mb-8"
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut"
                    }}
                >
                    <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                        404
                    </h1>
                </motion.div>

                {/* Illustration */}
                <div className="mb-8 text-8xl">
                    🔍🌌
                </div>

                {/* Message */}
                <h2 className="text-4xl font-black text-slate-800 mb-4">
                    ¡Ups! Página no encontrada
                </h2>
                <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                    Parece que te has aventurado demasiado lejos en el universo Nova. 
                    Esta página no existe o fue movida a otra dimensión.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <motion.button
                        onClick={() => navigate('/')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Volver al Inicio
                    </motion.button>

                    <motion.button
                        onClick={() => navigate(-1)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-white text-slate-700 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border-2 border-slate-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Página Anterior
                    </motion.button>
                </div>

                {/* Help Links */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-center gap-2">
                        <HelpCircle className="w-5 h-5 text-indigo-500" />
                        ¿Necesitas ayuda?
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <a
                            href="/dashboard"
                            className="p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all group"
                        >
                            <div className="text-3xl mb-2">🏠</div>
                            <div className="font-semibold text-slate-800 group-hover:text-indigo-600">
                                Dashboard
                            </div>
                        </a>
                        <a
                            href="/help"
                            className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all group"
                        >
                            <div className="text-3xl mb-2">📚</div>
                            <div className="font-semibold text-slate-800 group-hover:text-purple-600">
                                Centro de Ayuda
                            </div>
                        </a>
                        <a
                            href="mailto:soporte@novaschola.com"
                            className="p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-all group"
                        >
                            <div className="text-3xl mb-2">💬</div>
                            <div className="font-semibold text-slate-800 group-hover:text-pink-600">
                                Contacto
                            </div>
                        </a>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="mt-8 flex justify-center gap-4 text-4xl opacity-30">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                    >
                        ⭐
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                    >
                        🚀
                    </motion.div>
                    <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 5 }}
                    >
                        🌟
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};
