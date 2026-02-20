import React from 'react';
import { FileText, Tv, Landmark, Presentation, Check, Mic } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Language, TemplateId } from '../../types/research';

interface TemplateSelectorProps {
    selectedTemplate: TemplateId;
    onSelect: (template: TemplateId) => void;
    language: Language;
}

const templates: { id: TemplateId; icon: any; title: Record<Language, string>; description: Record<Language, string>; color: string }[] = [
    {
        id: 'classic',
        icon: FileText,
        title: { es: 'Reporte Clásico', en: 'Classic Report' },
        description: { es: 'Un texto escrito con título y párrafos.', en: 'A written text with title and paragraphs.' },
        color: 'bg-blue-500'
    },
    {
        id: 'news_script',
        icon: Tv,
        title: { es: 'Guion de Noticias', en: 'News Script' },
        description: { es: '¡Presenta tu tema como un reportero!', en: 'Present your topic like a reporter!' },
        color: 'bg-rose-500'
    },
    {
        id: 'museum_card',
        icon: Landmark,
        title: { es: 'Tarjeta de Museo', en: 'Museum Card' },
        description: { es: 'Breve y visual para una exhibición.', en: 'Short and visual for an exhibit.' },
        color: 'bg-amber-500'
    },
    {
        id: 'scientific_poster',
        icon: Presentation,
        title: { es: 'Póster Científico', en: 'Scientific Poster' },
        description: { es: 'Datos clave y descubrimientos.', en: 'Key facts and discoveries.' },
        color: 'bg-emerald-500'
    },
    {
        id: 'podcast',
        icon: Mic,
        title: { es: 'Podcast Educativo', en: 'Educational Podcast' },
        description: { es: 'Conversa sobre tu tema con un amigo.', en: 'Chat about your topic with a friend.' },
        color: 'bg-violet-500'
    }
];

export function TemplateSelector({ selectedTemplate, onSelect, language }: TemplateSelectorProps) {
    return (
        <div className="w-full space-y-3">
            <div className="flex items-center gap-2 mb-2">
                <Presentation className="w-5 h-5 text-indigo-400" />
                <h3 className="font-fredoka text-lg font-bold text-slate-700 dark:text-slate-200">
                    {language === 'es' ? 'Laboratorio de Presentación' : 'Presentation Lab'}
                </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {templates.map((template) => {
                    const Icon = template.icon;
                    const isSelected = selectedTemplate === template.id;

                    return (
                        <button
                            key={template.id}
                            onClick={() => onSelect(template.id)}
                            className={cn(
                                "relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 text-left group",
                                isSelected
                                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-lg scale-105"
                                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 hover:shadow-md"
                            )}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-1 shadow-sm">
                                    <Check className="w-3 h-3" strokeWidth={3} />
                                </div>
                            )}

                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-inner transition-colors",
                                isSelected ? template.color : "bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
                            )}>
                                <Icon className={cn("w-6 h-6", isSelected && "text-white")} />
                            </div>

                            <h4 className={cn(
                                "font-bold text-sm mb-1 text-center font-fredoka",
                                isSelected ? "text-indigo-900 dark:text-indigo-100" : "text-slate-600 dark:text-slate-400"
                            )}>
                                {template.title[language]}
                            </h4>

                            <p className="text-[10px] text-center text-slate-500 dark:text-slate-500 leading-tight">
                                {template.description[language]}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
