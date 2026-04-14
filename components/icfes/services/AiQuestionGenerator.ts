import { IcfesQuestion, IcfesCategory } from './IcfesQuestionBank';

interface GenerateQuestionParams {
  category: IcfesCategory;
  topic: string; // Ej: 'Fracciones', 'Lectura crítica de fábulas', etc.
  difficulty: 'easy' | 'medium' | 'hard';
  grade: number; // 6 a 11
}

/**
 * Servicio para generar preguntas ICFES usando IA (Gemini).
 * Se conecta al proxy local configurado (localhost:8787).
 */
export class AiQuestionGenerator {
  // Configuración del proxy de Clicky / Gemini
  private static readonly API_URL = 'http://localhost:8787/api/chat';

  /**
   * Genera una nueva pregunta tipo ICFES adaptada al grado y dificultad.
   */
  static async generateUniqueQuestion(params: GenerateQuestionParams): Promise<IcfesQuestion | null> {
    const { category, topic, difficulty, grade } = params;

    // Prompt estricto que fuerza al modelo a responder SOLO con JSON válido
    const systemPrompt = `
      Eres un experto pedagogo del ICFES en Colombia para validación de bachillerato.
      Tu tarea es generar UNA (1) pregunta de opción múltiple INÉDITA (siempre nueva) 
      para un estudiante de grado ${grade}°, sobre el tema "${topic}", en el área de ${category}.
      Dificultad: ${difficulty}.
      
      Reglas estrictas:
      1. La pregunta debe evaluar competencias (no solo memoria).
      2. Debe incluir un pequeño texto de contexto si aplica.
      3. Solo puede haber UNA respuesta correcta.
      4. Debes proporcionar "socraticHints": 2 pistas estilo Profesora Lina que guíen al estudiante sin darle la respuesta.
      5. La "explanation" debe ser cálida y clara, estilo Profesora Lina.
      
      DEBES responder ÚNICAMENTE con un objeto JSON con la siguiente estructura exacta (no añadas markdown \`\`\`json ni nada extra):
      {
        "text": "Texto completo de la pregunta",
        "context": "Texto opcional que introduce la pregunta (o string vacío)",
        "options": [
          { "id": "A", "text": "Opción A" },
          { "id": "B", "text": "Opción B" },
          { "id": "C", "text": "Opción C" },
          { "id": "D", "text": "Opción D" }
        ],
        "correctId": "A", 
        "explanation": "Explicación de por qué es la correcta",
        "socraticHints": ["Pista socrática 1", "Pista socrática 2"]
      }
    `;

    try {
      // 1. Intentar llamar al proxy de Gemini
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Genera la pregunta en formato JSON ahora.' }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('No se pudo conectar con la IA');
      }

      const data = await response.json();
      const textResponse = data.choices?.[0]?.message?.content || data.reply || '';
      
      // Limpiar posible markdown del JSON (como ```json ... ```)
      const cleanJson = textResponse.replace(/^```json/m, '').replace(/^```/m, '').trim();
      const parsedData = JSON.parse(cleanJson);

      // Convertir al formato interno IcfesQuestion
      const generatedQuestion: IcfesQuestion = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category,
        difficulty,
        ...parsedData
      };

      return generatedQuestion;

    } catch (error) {
      console.error("Error generando pregunta con IA:", error);
      // Fallback: Si no hay internet o el proxy falla, devolver null 
      // para que el sistema use las preguntas fijas del banco.
      return null;
    }
  }
}
