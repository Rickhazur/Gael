import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface CreateNotebookModalProps {
    onClose: () => void;
    onCreate: (data: any) => void;
    language: 'es' | 'en';
}

export const CreateNotebookModal: React.FC<CreateNotebookModalProps> = ({ onClose, onCreate, language }) => {
    const [subject, setSubject] = useState('math');
    const [title, setTitle] = useState(language === 'es' ? 'Mi Cuaderno de Matemáticas' : 'My Math Notebook');
    const [description, setDescription] = useState('');

    // Pre-fill title when subject changes if user hasn't typed a custom one
    React.useEffect(() => {
        const labels: Record<string, { es: string; en: string }> = {
            math: { es: 'Matemáticas', en: 'Math' },
            english: { es: 'Inglés', en: 'English' },
            science: { es: 'Ciencias', en: 'Science' },
            history: { es: 'Historia', en: 'History' },
            other: { es: 'Notas Varias', en: 'Other' }
        };
        const subjectLabel = labels[subject]?.[language] || subject;
        setTitle(language === 'es' ? `Mi Cuaderno de ${subjectLabel}` : `My ${subjectLabel} Notebook`);
    }, [subject, language]);
    const [selectedColor, setSelectedColor] = useState('#8B5CF6');
    const [selectedEmoji, setSelectedEmoji] = useState('📓');

    const colors = [
        { name: 'Purple', value: '#8B5CF6' },
        { name: 'Blue', value: '#3B82F6' },
        { name: 'Green', value: '#10B981' },
        { name: 'Red', value: '#EF4444' },
        { name: 'Orange', value: '#F59E0B' },
        { name: 'Pink', value: '#EC4899' },
    ];

    const emojis = ['📓', '📗', '📘', '📙', '📕', '📔', '📒', '📚', '📖', '✏️', '📝', '🎨', '🔬', '🌍', '📐', '🧮'];

    const subjects = [
        { id: 'math', label: language === 'es' ? 'Matemáticas' : 'Math' },
        { id: 'english', label: 'English' },
        { id: 'science', label: language === 'es' ? 'Ciencias' : 'Science' },
        { id: 'history', label: language === 'es' ? 'Historia' : 'History' },
        { id: 'other', label: language === 'es' ? 'Otros' : 'Other' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({
            title,
            subject,
            description,
            color: selectedColor,
            cover_emoji: selectedEmoji,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-slate-800">
                        {language === 'es' ? '✨ Crear Nuevo Cuaderno' : '✨ Create New Notebook'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            {language === 'es' ? 'Título del Cuaderno' : 'Notebook Title'}
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={language === 'es' ? 'Ej: Álgebra Básica' : 'Ex: Basic Algebra'}
                            required
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-all"
                        />
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            {language === 'es' ? 'Materia' : 'Subject'}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {subjects.map((subj) => (
                                <button
                                    key={subj.id}
                                    type="button"
                                    onClick={() => setSubject(subj.id)}
                                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${subject === subj.id
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {subj.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            {language === 'es' ? 'Color de Portada' : 'Cover Color'}
                        </label>
                        <div className="flex gap-3">
                            {colors.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`w-12 h-12 rounded-xl transition-all ${selectedColor === color.value ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Emoji */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            {language === 'es' ? 'Icono' : 'Icon'}
                        </label>
                        <div className="grid grid-cols-8 gap-2">
                            {emojis.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setSelectedEmoji(emoji)}
                                    className={`text-3xl p-2 rounded-xl transition-all ${selectedEmoji === emoji ? 'bg-indigo-100 scale-110' : 'hover:bg-slate-100'
                                        }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            {language === 'es' ? 'Descripción (Opcional)' : 'Description (Optional)'}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={language === 'es' ? 'Describe de qué trata este cuaderno...' : 'Describe what this notebook is about...'}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Preview */}
                    <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-6">
                        <p className="text-sm font-bold text-slate-600 mb-3">
                            {language === 'es' ? 'Vista Previa' : 'Preview'}
                        </p>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-20 h-28 rounded-xl flex items-center justify-center text-4xl shadow-lg"
                                style={{ backgroundColor: selectedColor }}
                            >
                                {selectedEmoji}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{title || (language === 'es' ? 'Mi Cuaderno' : 'My Notebook')}</h3>
                                <p className="text-slate-600 text-sm">{subjects.find(s => s.id === subject)?.label}</p>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                        >
                            {language === 'es' ? 'Cancelar' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={!title}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Sparkles className="w-5 h-5 inline mr-2" />
                            {language === 'es' ? 'Crear Cuaderno' : 'Create Notebook'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};
