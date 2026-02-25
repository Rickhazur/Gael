import { callChatApi } from './ai_service';

/**
 * Analiza el contenido de una nota y detecta conceptos que se beneficiarían de visualización
 */
export async function detectVisualConcepts(
    noteContent: string,
    subject: string,
    language: 'es' | 'en'
): Promise<{
    hasVisualConcepts: boolean;
    concepts: Array<{
        name: string;
        description: string;
        imagePrompt: string;
        confidence: number;
    }>;
}> {
    // Disable visual concepts for math as requested
    if (subject === 'math') {
        return { hasVisualConcepts: false, concepts: [] };
    }
    const prompt = `
Eres un asistente educativo experto. Analiza el siguiente texto de un estudiante de primaria y detecta conceptos que se beneficiarían de una imagen educativa.

TEXTO DEL ESTUDIANTE:
"""
${noteContent}
"""

MATERIA: ${subject}
IDIOMA: ${language}

INSTRUCCIONES:
1. Identifica máximo 3 conceptos clave que serían más claros con una imagen
2. Solo sugiere conceptos VISUALIZABLES (objetos, procesos, diagramas)
3. NO sugieras conceptos abstractos o que no se puedan ilustrar
4. Para cada concepto, genera un prompt de imagen educativa apropiado para niños

RESPONDE EN FORMATO JSON:
{
  "hasVisualConcepts": boolean,
  "concepts": [
    {
      "name": "nombre del concepto",
      "description": "por qué ayudaría verlo",
      "imagePrompt": "prompt detallado para generar imagen educativa",
      "confidence": 0.0-1.0
    }
  ]
}

EJEMPLOS DE CONCEPTOS VISUALIZABLES:
- Ciencias: célula, sistema solar, ciclo del agua, partes de una planta
- Historia: eventos, personajes, mapas, líneas de tiempo
- Matemáticas: figuras geométricas, fracciones, gráficos
- Inglés: objetos de vocabulario, escenas de cuentos

RESPONDE SOLO EL JSON, SIN TEXTO ADICIONAL.
`;

    try {
        const response = await callChatApi(
            [{ role: 'user', content: prompt }],
            'gpt-4o-mini',
            false
        );

        const content = response.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            return { hasVisualConcepts: false, concepts: [] };
        }

        const result = JSON.parse(jsonMatch[0]);

        // Filtrar solo conceptos con alta confianza
        result.concepts = result.concepts.filter((c: any) => c.confidence >= 0.6);
        result.hasVisualConcepts = result.concepts.length > 0;

        return result;
    } catch (error) {
        console.error('Error detecting visual concepts:', error);
        return { hasVisualConcepts: false, concepts: [] };
    }
}

/**
 * Genera un prompt optimizado para imagen educativa según la materia
 */
export function generateEducationalImagePrompt(
    concept: string,
    subject: string,
    language: 'es' | 'en',
    additionalContext?: string
): string {
    const baseStyle = "Educational illustration, colorful, clear labels, suitable for elementary school students, simple and engaging, high quality";

    const subjectStyles: Record<string, string> = {
        math: "diagram style, clean geometric shapes, labeled parts, mathematical precision",
        science: "scientific illustration, anatomical accuracy, labeled components, cross-section view if applicable",
        english: "vocabulary illustration, clear object depiction, simple background, word association",
        history: "historical illustration, period-accurate, educational context, timeline style",
        art: "artistic style, creative interpretation, vibrant colors, inspiring",
        other: "clear educational diagram, well-labeled, easy to understand"
    };

    const style = subjectStyles[subject] || subjectStyles.other;

    let prompt = `${concept}. ${baseStyle}. ${style}.`;

    if (additionalContext) {
        prompt += ` ${additionalContext}`;
    }

    // Agregar especificaciones de idioma para labels
    if (language === 'es') {
        prompt += " Labels and text in Spanish.";
    } else {
        prompt += " Labels and text in English.";
    }

    // Agregar restricciones de seguridad
    prompt += " Safe for children, educational purpose, no inappropriate content.";

    return prompt;
}

/**
 * Mensajes de la tutora según el concepto detectado
 */
export function getTutorSuggestionMessage(
    conceptName: string,
    tutorName: 'Lina' | 'Rachelle',
    language: 'es' | 'en'
): {
    greeting: string;
    suggestion: string;
    encouragement: string;
} {
    if (language === 'es') {
        return {
            greeting: `¡Hola! Soy ${tutorName} 👋`,
            suggestion: `Veo que estás estudiando sobre <strong>${conceptName}</strong>. ¿Te gustaría que genere una imagen para entenderlo mejor?`,
            encouragement: "¡Las imágenes ayudan mucho a recordar conceptos! 🎨"
        };
    } else {
        return {
            greeting: `Hi! I'm ${tutorName} 👋`,
            suggestion: `I see you're studying about <strong>${conceptName}</strong>. Would you like me to generate an image to help you understand it better?`,
            encouragement: "Images really help remember concepts! 🎨"
        };
    }
}

/**
 * Determina qué tutora debe aparecer según la materia
 */
export function getTutorForSubject(subject: string): 'Lina' | 'Rachelle' {
    const subjectMapping: Record<string, 'Lina' | 'Rachelle'> = {
        math: 'Lina',
        science: 'Lina',
        english: 'Rachelle',
        history: 'Lina',
        art: 'Lina',
        other: 'Lina'
    };

    return subjectMapping[subject] || 'Lina';
}
