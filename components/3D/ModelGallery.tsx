import React, { useState } from 'react';
import { Search, Filter, Grid3x3, List } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Interactive3DViewer } from './Interactive3DViewer';
import { MODELS_LIBRARY, getModelsBySubject, searchModels, type Model3D } from './models-library';

interface ModelGalleryProps {
    subject?: 'science' | 'geometry' | 'history' | 'geography';
    grade?: number;
    language?: 'es' | 'en';
    onModelSelect?: (modelId: string) => void;
    initialSearchQuery?: string;
    /** Callback to add an idea from a 3D model to the report (e.g. from Research Center). */
    onAddIdeaToReport?: (idea: string) => void;
}

export function ModelGallery({
    subject,
    grade,
    language = 'es',
    onModelSelect,
    initialSearchQuery = '',
    onAddIdeaToReport
}: ModelGalleryProps) {
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [selectedSubject, setSelectedSubject] = useState<string>(subject || 'all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);

    // Update search if initialSearchQuery changes
    React.useEffect(() => {
        if (initialSearchQuery) setSearchQuery(initialSearchQuery);
    }, [initialSearchQuery]);

    // Recommended models for research topic (when initialSearchQuery is set)
    const recommendedModels = React.useMemo(() => {
        if (!initialSearchQuery || initialSearchQuery.length < 2) return [];
        let list = searchModels(initialSearchQuery, language);
        if (grade) list = list.filter(m => m.grade.includes(grade));
        return list;
    }, [initialSearchQuery, grade, language]);

    // Filter models
    const filteredModels = React.useMemo(() => {
        let models = MODELS_LIBRARY;

        // Filter by subject
        if (selectedSubject !== 'all') {
            models = getModelsBySubject(selectedSubject as any);
        }

        // Filter by grade
        if (grade) {
            models = models.filter(m => m.grade.includes(grade));
        }

        // Filter by search
        if (searchQuery) {
            models = searchModels(searchQuery, language);
        }

        return models;
    }, [selectedSubject, grade, searchQuery, language]);

    const subjects = [
        { id: 'all', label: { es: 'Todos', en: 'All' }, emoji: '📚', color: 'bg-slate-500' },
        { id: 'science', label: { es: 'Ciencias', en: 'Science' }, emoji: '🔬', color: 'bg-emerald-500' },
        { id: 'geometry', label: { es: 'Geometría', en: 'Geometry' }, emoji: '📐', color: 'bg-blue-500' },
        { id: 'history', label: { es: 'Historia', en: 'History' }, emoji: '📜', color: 'bg-amber-500' },
        { id: 'geography', label: { es: 'Geografía', en: 'Geography' }, emoji: '🌍', color: 'bg-teal-500' }
    ];

    const handleModelClick = (model: Model3D) => {
        setSelectedModel(model);
        onModelSelect?.(model.id);
    };

    if (selectedModel) {
        return (
            <div className="space-y-4">
                <Button
                    onClick={() => setSelectedModel(null)}
                    className="bg-slate-700 hover:bg-slate-600"
                >
                    ← {language === 'es' ? 'Volver a la galería' : 'Back to gallery'}
                </Button>
                <Interactive3DViewer
                    modelId={selectedModel.id}
                    modelUrl={selectedModel.modelFile}
                    title={selectedModel.title[language]}
                    description={selectedModel.description[language]}
                    subject={selectedModel.subject}
                    language={language}
                    onAddIdeaToReport={onAddIdeaToReport}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-white mb-2">
                        {language === 'es' ? '🎨 Galería 3D' : '🎨 3D Gallery'}
                    </h2>
                    <p className="text-white/60">
                        {language === 'es'
                            ? 'Explora modelos 3D interactivos. En el móvil, usa AR para verlos en tu espacio.'
                            : 'Explore interactive 3D models. On mobile, use AR to see them in your space.'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setViewMode('grid')}
                        className={viewMode === 'grid' ? 'bg-cyan-500' : 'bg-slate-700'}
                    >
                        <Grid3x3 className="w-5 h-5" />
                    </Button>
                    <Button
                        onClick={() => setViewMode('list')}
                        className={viewMode === 'list' ? 'bg-cyan-500' : 'bg-slate-700'}
                    >
                        <List className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'es' ? 'Buscar modelos...' : 'Search models...'}
                    className="pl-12 bg-slate-800 border-slate-700 text-white placeholder:text-white/40 h-14 text-lg"
                />
            </div>

            {/* Recomendados para tu tema (when used from Research with a topic) */}
            {recommendedModels.length > 0 && initialSearchQuery && (
                <div className="space-y-3">
                    <h3 className="text-xl font-black text-cyan-300">
                        {language === 'es' ? '⭐ Recomendados para tu tema' : '⭐ Recommended for your topic'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendedModels.map(model => (
                            <ModelCard
                                key={model.id}
                                model={model}
                                language={language}
                                viewMode="grid"
                                onClick={() => handleModelClick(model)}
                            />
                        ))}
                    </div>
                    <h3 className="text-lg font-bold text-white/70 pt-2">
                        {language === 'es' ? 'Todos los modelos' : 'All models'}
                    </h3>
                </div>
            )}

            {/* Subject Filter */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {subjects.map(subj => (
                    <button
                        key={subj.id}
                        onClick={() => setSelectedSubject(subj.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${selectedSubject === subj.id
                            ? `${subj.color} text-white shadow-lg scale-105`
                            : 'bg-slate-800 text-white/60 hover:bg-slate-700'
                            }`}
                    >
                        <span className="text-xl">{subj.emoji}</span>
                        {subj.label[language]}
                    </button>
                ))}
            </div>

            {/* Models Grid/List */}
            {filteredModels.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-white/40 text-lg">
                        {language === 'es' ? 'No se encontraron modelos' : 'No models found'}
                    </p>
                </div>
            ) : (
                <div className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                }>
                    {filteredModels.map(model => (
                        <ModelCard
                            key={model.id}
                            model={model}
                            language={language}
                            viewMode={viewMode}
                            onClick={() => handleModelClick(model)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface ModelCardProps {
    model: Model3D;
    language: 'es' | 'en';
    viewMode: 'grid' | 'list';
    onClick: () => void;
}

function ModelCard({ model, language, viewMode, onClick }: ModelCardProps) {
    const subjectColors = {
        science: 'from-emerald-500/20 to-emerald-600/20 border-emerald-400/30',
        geometry: 'from-blue-500/20 to-blue-600/20 border-blue-400/30',
        history: 'from-amber-500/20 to-amber-600/20 border-amber-400/30',
        geography: 'from-teal-500/20 to-teal-600/20 border-teal-400/30'
    };

    const subjectEmojis = {
        science: '🔬',
        geometry: '📐',
        history: '📜',
        geography: '🌍'
    };

    return (
        <button
            onClick={onClick}
            className={`group relative bg-gradient-to-br ${subjectColors[model.subject]} border-2 rounded-2xl p-6 text-left transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] ${viewMode === 'list' ? 'flex items-center gap-6' : ''
                }`}
        >
            {/* Thumbnail Placeholder */}
            <div className={`bg-slate-900/50 rounded-xl flex items-center justify-center ${viewMode === 'grid' ? 'aspect-square mb-4' : 'w-24 h-24 flex-shrink-0'
                }`}>
                <span className="text-6xl">{subjectEmojis[model.subject]}</span>
            </div>

            {/* Content */}
            <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                        {model.title[language]}
                    </h3>
                    <span className="text-2xl ml-2">🎯</span>
                </div>
                <p className="text-white/60 text-sm mb-3">
                    {model.description[language]}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white/80">
                        {language === 'es' ? 'Grados' : 'Grades'} {model.grade.join(', ')}
                    </span>
                    <span className="px-3 py-1 bg-cyan-500/20 rounded-full text-xs font-bold text-cyan-300">
                        3D + AR
                    </span>
                </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
        </button>
    );
}
