import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GEOMETRY_CURRICULUM, GeometryTopic, GeometryConcept } from '@/data/geometryCurriculum';
import { BookOpen, Shapes, Ruler, Box, RefreshCw, Map, Wrench } from 'lucide-react';

interface GeometryExplorerProps {
    language?: 'es' | 'en';
    onSelectConcept?: (concept: GeometryConcept) => void;
}

export const GeometryExplorer: React.FC<GeometryExplorerProps> = ({
    language = 'es',
    onSelectConcept
}) => {
    const [selectedTopic, setSelectedTopic] = useState<GeometryTopic | null>(null);
    const [selectedConcept, setSelectedConcept] = useState<GeometryConcept | null>(null);

    const categoryIcons: { [key: string]: any } = {
        'Fundamentos': BookOpen,
        'Medición': Ruler,
        '3D': Box,
        'Transformaciones': RefreshCw,
        'Ubicación': Map,
        'Herramientas': Wrench
    };

    const categoryColors: { [key: string]: string } = {
        'Fundamentos': 'from-blue-500 to-cyan-500',
        'Medición': 'from-purple-500 to-pink-500',
        '3D': 'from-orange-500 to-red-500',
        'Transformaciones': 'from-green-500 to-emerald-500',
        'Ubicación': 'from-yellow-500 to-amber-500',
        'Herramientas': 'from-indigo-500 to-violet-500'
    };

    const handleConceptClick = (concept: GeometryConcept) => {
        setSelectedConcept(concept);
        onSelectConcept?.(concept);
    };

    return (
        <div className="w-full h-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
                    {language === 'es' ? '📐 Explorador de Geometría' : '📐 Geometry Explorer'}
                </h1>
                <p className="text-xl text-slate-300 font-medium">
                    {language === 'es' ? 'Quinto de Primaria - Programa Completo' : '5th Grade - Complete Program'}
                </p>
            </motion.div>

            <AnimatePresence mode="wait">
                {!selectedTopic ? (
                    // Vista de categorías
                    <motion.div
                        key="categories"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                    >
                        {GEOMETRY_CURRICULUM.map((topic, idx) => {
                            const Icon = categoryIcons[topic.category] || Shapes;
                            const colorClass = categoryColors[topic.category] || 'from-gray-500 to-gray-600';

                            return (
                                <motion.button
                                    key={topic.id}
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedTopic(topic)}
                                    className="group relative overflow-hidden rounded-3xl p-8 bg-slate-800/50 border-2 border-slate-700 hover:border-cyan-400 transition-all shadow-xl hover:shadow-2xl"
                                >
                                    {/* Gradient background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-20 transition-opacity`} />

                                    {/* Icon */}
                                    <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                                        <Icon className="w-10 h-10 text-white" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-black text-white mb-2">
                                        {language === 'es' ? topic.title : topic.titleEn}
                                    </h3>

                                    {/* Category badge */}
                                    <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${colorClass} text-white text-sm font-bold`}>
                                        {topic.category}
                                    </div>

                                    {/* Concept count */}
                                    <div className="mt-4 text-slate-400 font-medium">
                                        {topic.concepts.length} {language === 'es' ? 'conceptos' : 'concepts'}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                ) : !selectedConcept ? (
                    // Vista de conceptos
                    <motion.div
                        key="concepts"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-6xl mx-auto"
                    >
                        {/* Back button */}
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => setSelectedTopic(null)}
                            className="mb-8 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                        >
                            ← {language === 'es' ? 'Volver' : 'Back'}
                        </motion.button>

                        {/* Topic header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl text-white"
                        >
                            <h2 className="text-4xl font-black mb-2">
                                {language === 'es' ? selectedTopic.title : selectedTopic.titleEn}
                            </h2>
                            <p className="text-xl opacity-90">
                                {selectedTopic.category}
                            </p>
                        </motion.div>

                        {/* Concepts grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {selectedTopic.concepts.map((concept, idx) => (
                                <motion.button
                                    key={concept.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ scale: 1.03, x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleConceptClick(concept)}
                                    className="text-left p-6 bg-slate-800/70 hover:bg-slate-700/70 border-2 border-slate-600 hover:border-cyan-400 rounded-2xl transition-all shadow-lg"
                                >
                                    <h3 className="text-2xl font-black text-cyan-400 mb-3">
                                        {language === 'es' ? concept.name : concept.nameEn}
                                    </h3>
                                    <p className="text-slate-300 mb-4 leading-relaxed">
                                        {language === 'es' ? concept.definition : concept.definitionEn}
                                    </p>
                                    {concept.formula && (
                                        <div className="inline-block px-4 py-2 bg-purple-500/20 border border-purple-400 rounded-lg">
                                            <code className="text-purple-300 font-mono font-bold">
                                                {concept.formula}
                                            </code>
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    // Vista detallada del concepto
                    <motion.div
                        key="concept-detail"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-4xl mx-auto"
                    >
                        {/* Back button */}
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => setSelectedConcept(null)}
                            className="mb-8 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                        >
                            ← {language === 'es' ? 'Volver' : 'Back'}
                        </motion.button>

                        {/* Concept card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-12 border-4 border-cyan-400 shadow-2xl"
                        >
                            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6">
                                {language === 'es' ? selectedConcept.name : selectedConcept.nameEn}
                            </h2>

                            <div className="bg-slate-700/50 rounded-2xl p-6 mb-8">
                                <h3 className="text-xl font-bold text-cyan-300 mb-3">
                                    {language === 'es' ? 'Definición:' : 'Definition:'}
                                </h3>
                                <p className="text-2xl text-white leading-relaxed">
                                    {language === 'es' ? selectedConcept.definition : selectedConcept.definitionEn}
                                </p>
                            </div>

                            {selectedConcept.formula && (
                                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400 rounded-2xl p-8 mb-8">
                                    <h3 className="text-xl font-bold text-purple-300 mb-4">
                                        {language === 'es' ? 'Fórmula:' : 'Formula:'}
                                    </h3>
                                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-mono">
                                        {selectedConcept.formula}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-green-400 mb-4">
                                    {language === 'es' ? '💡 Ejemplos:' : '💡 Examples:'}
                                </h3>
                                {selectedConcept.examples.map((example, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-start gap-4 p-4 bg-green-500/10 border border-green-400/30 rounded-xl"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {idx + 1}
                                        </div>
                                        <p className="text-lg text-slate-200 leading-relaxed">
                                            {example}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
