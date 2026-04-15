import React, { useState } from 'react';
import { Brain, Copy, CheckCircle2, ChevronRight, Wand2, Loader2 } from 'lucide-react';
import { IcfesCategory, CATEGORY_LABELS } from '../services/IcfesQuestionBank';
import { callGeminiSocratic } from '../../../services/gemini';

export const AIQuestionGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<IcfesCategory>('LECTURA_CRITICA');
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'>('medium');
  const [count, setCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic) {
      setError('Por favor ingresa un tema.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedCode('');
    setCopied(false);

    const systemPrompt = `Eres un experto pedagogo del ICFES en Colombia. Tu trabajo es crear preguntas de simulación EXACTAMENTE con el mismo rigor técnico, longitud y estilo que las pruebas oficiales Saber 11.
DEBES devolver UN ÚNICO JSON ARRAY con cajas fuertes.
ESQUEMA JSON:
[
  {
    "id": "identificador_unico_alfanumerico",
    "category": "${category}",
    "competency": "ELIGE_UNA_COMPETENCIA_VÁLIDA_SEGÚN_LA_CATEGORÍA",
    "text": "La pregunta clara y directa que se va a hacer sobre el contexto.",
    "context": "El texto, artículo, fragmento o caso de estudio (largo y detallado si es necesario). Si es matemáticas, aquí va el planteamiento del problema con los datos.",
    "options": [
      { "id": "A", "text": "Opción 1" },
      { "id": "A", "text": "Opción 2" },
      { "id": "A", "text": "Opción 3" },
      { "id": "A", "text": "Opción 4" }
    ],
    "correctId": "A/B/C/D",
    "explanation": "Explicación detallada de por qué esta es correcta y por qué los distractores no lo son.",
    "socraticHints": ["Pista 1 corta en forma de pregunta", "Pista 2"],
    "techniqueTip": "Un tip técnico sobre cómo abordar el ICFES para este tipo de pregunta.",
    "difficulty": "${difficulty}"
  }
]

REGLAS ICFES:
1. Las opciones C y D deben ser "C" y "D" como ID, ¡no repitas "A"! (Error en el ejemplo intencional para verificar).
2. Los distractores deben ser "casi verdaderos" o errores comunes.
3. El texto no debe ser trivial, debe parecer un examen estatal.`;

    try {
      const response = await callGeminiSocratic(
        systemPrompt,
        [],
        `Genera ${count} pregunta(s) sobre el tema: "${topic}" para el área de ${CATEGORY_LABELS[category]}. Nivel de dificultad: ${difficulty}. Asegúrate de devolver el array en formato JSON.`,
        'es',
        true
      );

      // Convert the JSON output to beautiful TypeScript string
      const tsString = JSON.stringify(response, null, 2).replace(/"([^"]+)":/g, '$1:');
      setGeneratedCode(`// ─── Preguntas de ${topic} ───\nconst newQuestions: IcfesQuestion[] = ${tsString};\n`);
    } catch (err: any) {
      console.error(err);
      setError(`Error generando preguntas: ${err.message || 'Fallo en la API'}. Asegúrate de tener configurada la API KEY de Gemini.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-200" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Wand2 className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Generador IA de Preguntas ICFES</h2>
          <p className="text-slate-500 text-sm">Crea nuevas preguntas para el banco usando Gemini 2.0 Flash.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tema Específico</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: Revolución Industrial, Genética..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Área</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as IcfesCategory)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Dificultad</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              >
                <option value="easy">Fácil</option>
                <option value="medium">Media</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Cantidad a generar: {count}</label>
            <input 
              type="range" min="1" max="5" value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            {isGenerating ? 'Generando con Gemini...' : 'Generar Preguntas'}
          </button>
        </div>

        {/* Output */}
        <div className="relative">
          <div className="bg-slate-900 rounded-2xl h-full min-h-[300px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
              <span className="text-xs font-mono text-slate-400">código_generado.ts</span>
              {generatedCode && (
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copiado' : 'Copiar TS'}
                </button>
              )}
            </div>
            <div className="p-4 overflow-y-auto flex-1 text-sm font-mono text-emerald-400 whitespace-pre-wrap max-h-[400px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-pulse">
                  <Brain className="w-10 h-10 mb-2 opacity-50" />
                  <p>Pensando como ICFES...</p>
                </div>
              ) : generatedCode ? (
                generatedCode
              ) : (
                <span className="text-slate-600">El código generado aparecerá aquí listo para pegar en IcfesQuestionBankExpansion.ts</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIQuestionGenerator;
