import { useState, useEffect, useCallback } from 'react';
import { detectVisualConcepts, getTutorForSubject, generateEducationalImagePrompt } from '@/services/visualConceptDetector';
import { debounce } from 'lodash';

interface VisualConcept {
    name: string;
    description: string;
    imagePrompt: string;
    confidence: number;
}

interface UseVisualAssistantOptions {
    enabled: boolean;
    minContentLength?: number;
    debounceMs?: number;
}

export function useVisualAssistant(
    noteContent: string,
    subject: string,
    language: 'es' | 'en',
    options: UseVisualAssistantOptions = { enabled: true }
) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [suggestedConcept, setSuggestedConcept] = useState<VisualConcept | null>(null);
    const [allConcepts, setAllConcepts] = useState<VisualConcept[]>([]);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [dismissedConcepts, setDismissedConcepts] = useState<Set<string>>(new Set());

    const {
        enabled = true,
        minContentLength = 100,
        debounceMs = 2000
    } = options;

    // Analizar contenido para detectar conceptos visualizables
    const analyzeContent = useCallback(
        debounce(async (content: string) => {
            if (!enabled || content.length < minContentLength) {
                return;
            }

            setIsAnalyzing(true);
            try {
                const result = await detectVisualConcepts(content, subject, language);

                if (result.hasVisualConcepts && result.concepts.length > 0) {
                    setAllConcepts(result.concepts);

                    // Seleccionar el concepto con mayor confianza que no haya sido descartado
                    const topConcept = result.concepts.find(
                        c => !dismissedConcepts.has(c.name)
                    );

                    if (topConcept) {
                        setSuggestedConcept(topConcept);
                        setShowSuggestion(true);
                    }
                }
            } catch (error) {
                console.error('Error analyzing content:', error);
            } finally {
                setIsAnalyzing(false);
            }
        }, debounceMs),
        [enabled, minContentLength, subject, language, dismissedConcepts]
    );

    // Ejecutar análisis cuando cambia el contenido
    useEffect(() => {
        if (noteContent && enabled) {
            analyzeContent(noteContent);
        }
    }, [noteContent, enabled, analyzeContent]);

    // Descartar sugerencia actual
    const dismissSuggestion = useCallback(() => {
        if (suggestedConcept) {
            setDismissedConcepts(prev => new Set(prev).add(suggestedConcept.name));
        }
        setShowSuggestion(false);
        setSuggestedConcept(null);
    }, [suggestedConcept]);

    // Aceptar sugerencia
    const acceptSuggestion = useCallback(() => {
        setShowSuggestion(false);
        // No agregamos a dismissed porque ya fue aceptada
    }, []);

    // Obtener siguiente concepto sugerido
    const getNextSuggestion = useCallback(() => {
        const nextConcept = allConcepts.find(
            c => c.name !== suggestedConcept?.name && !dismissedConcepts.has(c.name)
        );

        if (nextConcept) {
            setSuggestedConcept(nextConcept);
            setShowSuggestion(true);
        }
    }, [allConcepts, suggestedConcept, dismissedConcepts]);

    // Resetear estado
    const reset = useCallback(() => {
        setSuggestedConcept(null);
        setAllConcepts([]);
        setShowSuggestion(false);
        setDismissedConcepts(new Set());
    }, []);

    // Determinar qué tutora debe aparecer
    const tutorName = getTutorForSubject(subject);

    return {
        isAnalyzing,
        suggestedConcept,
        allConcepts,
        showSuggestion,
        tutorName,
        dismissSuggestion,
        acceptSuggestion,
        getNextSuggestion,
        reset,
        hasMoreSuggestions: allConcepts.length > (dismissedConcepts.size + 1)
    };
}

/**
 * Hook para manejar la galería de imágenes generadas
 */
export function useImageGallery(notebookId?: string) {
    const [images, setImages] = useState<Array<{
        id: string;
        url: string;
        concept: string;
        prompt: string;
        createdAt: string;
    }>>([]);

    const addImage = useCallback((imageData: {
        url: string;
        concept: string;
        prompt: string;
    }) => {
        const newImage = {
            id: `img-${Date.now()}`,
            ...imageData,
            createdAt: new Date().toISOString()
        };

        setImages(prev => [newImage, ...prev]);

        // Guardar en localStorage si hay notebookId
        if (notebookId) {
            const key = `notebook-images-${notebookId}`;
            const stored = localStorage.getItem(key);
            const existing = stored ? JSON.parse(stored) : [];
            localStorage.setItem(key, JSON.stringify([newImage, ...existing]));
        }

        return newImage.id;
    }, [notebookId]);

    const removeImage = useCallback((imageId: string) => {
        setImages(prev => prev.filter(img => img.id !== imageId));

        if (notebookId) {
            const key = `notebook-images-${notebookId}`;
            const stored = localStorage.getItem(key);
            if (stored) {
                const existing = JSON.parse(stored);
                const filtered = existing.filter((img: any) => img.id !== imageId);
                localStorage.setItem(key, JSON.stringify(filtered));
            }
        }
    }, [notebookId]);

    const loadImages = useCallback(() => {
        if (notebookId) {
            const key = `notebook-images-${notebookId}`;
            const stored = localStorage.getItem(key);
            if (stored) {
                setImages(JSON.parse(stored));
            }
        }
    }, [notebookId]);

    useEffect(() => {
        loadImages();
    }, [loadImages]);

    return {
        images,
        addImage,
        removeImage,
        loadImages
    };
}
