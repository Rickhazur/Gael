/**
 * Multi-Agent Orchestrator — Plataforma Nova ICFES
 * 
 * Agente 1 (Evaluador/Analista): Analiza la respuesta del estudiante e identifica la falla de competencia exacta.
 * Agente 2 (Investigador): Determina la mejor táctica/técnica ICFES para resolver el problema basado en el diagnóstico del analista.
 * Agente 3 (Pedagogo / Profe Lina): Toma la táctica del investigador y la traduce a un diálogo socrático, cálido y enfocado al estudiante.
 */
import { callGeminiSocratic } from '../../../services/gemini';
import { ChatMessage } from './AiTutorService';

interface OrchestratorInput {
  lessonObjective: string;
  questionText: string;
  studentHistory: ChatMessage[];
  studentLatestMessage: string;
}

// Global Memory (Simulated DB)
const getGlobalProfile = () => localStorage.getItem('icfes_global_profile') || '';
const updateGlobalProfile = (newInsight: string) => {
  const current = getGlobalProfile();
  localStorage.setItem('icfes_global_profile', current ? `${current}\n- ${newInsight}` : `- ${newInsight}`);
};

export async function orchestrateTutorResponse(input: OrchestratorInput): Promise<string> {
  const { lessonObjective, questionText, studentHistory, studentLatestMessage } = input;
  const historyText = studentHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

  // ─── AGENTE 1: ANALISTA (Evaluador) ───
  // Su trabajo es determinar EXACTAMENTE dónde se bloqueó Danna o qué competencia falla.
  let analystDiagnosis = "";
  try {
    const analystPrompt = `Eres el AGENTE ANALISTA COGNITIVO. Tu único trabajo es analizar el último mensaje del estudiante, el historial de chat y el problema actual.
Problema: ${questionText}
Objetivo: ${lessonObjective}
Historial:
${historyText}

Último mensaje del estudiante: "${studentLatestMessage}"

IDENTIFICA EL BLOQUEO:
1. ¿El estudiante ignoró datos clave?
2. ¿Cometió un error aritmético?
3. ¿Simplemente no sabe qué hacer (bloqueo total)?
Responde de forma clínica y técnica en 2 oraciones.`;
    
    analystDiagnosis = await callGeminiSocratic(
      "Eres un analista de fallas de aprendizaje.", 
      [{ role: 'user', content: analystPrompt }], 
      "", 'es', false
    ) as string;

    // Si el analista nota una falla profunda, la guardamos en el perfil
    if (analystDiagnosis.toLowerCase().includes('dificultad') || analystDiagnosis.toLowerCase().includes('confunde')) {
       updateGlobalProfile(`Reciente: ${analystDiagnosis.replace(/\//g, '')}`);
    }
  } catch (e) {
    console.error("Agent 1 (Analyst) failed", e);
    analystDiagnosis = "El estudiante parece atascado con este concepto puntual.";
  }

  // ─── AGENTE 2: INVESTIGADOR (ICFES Strategist) ───
  // Su trabajo es encontrar el TRUCO o TÁCTICA ICFES para destrabar al estudiante.
  let researcherTactic = "";
  try {
    const profile = getGlobalProfile();
    const researcherPrompt = `Eres el AGENTE INVESTIGADOR ICFES. Eres un maestro en trucos del examen Saber 11.
Problema: ${questionText}
Diagnóstico del Analista: ${analystDiagnosis}
Debilidades históricas del alumno: ${profile}

INSTRUCCIÓN:
Genera la ESTRATEGIA EXACTA o la PISTA SECRETA para que el estudiante destrabe este problema. NO le hables al estudiante. Háblale a la Profesora Lina. Dile qué técnica ICFES debe usar para explicárselo. Ejemplo: "Lina, dile que descarte los distractores absolutos que tengan las palabras 'siempre' o 'nunca'." o "Lina, haz que se imagine el problema de fracciones con pedazos de pizza."`;

    researcherTactic = await callGeminiSocratic(
      "Eres un estratega experto del examen ICFES de Colombia.", 
      [{ role: 'user', content: researcherPrompt }], 
      "", 'es', false
    ) as string;
  } catch (e) {
    console.error("Agent 2 (Researcher) failed", e);
    researcherTactic = "Lina, usa el método de hacerle una pregunta simple con un ejemplo de la vida real.";
  }

  // ─── AGENTE 3: PEDAGOGO (Profe Lina) ───
  // Traduce todo al método Socrático amigable.
  try {
    const linaPrompt = `TÚ ERES LA PROFESORA LINA. Tu estudiante te acaba de decir esto: "${studentLatestMessage}"

EL ANALISTA DICE: ${analystDiagnosis}
EL INVESTIGADOR TE ORDENA USAR ESTA TÁCTICA: ${researcherTactic}

INSTRUCCIÓN ESTRÍCTA:
1. Habla normalmente como la Profe Lina (cálida, paisa o colombiana joven, entusiasta, "dale", "bacano").
2. APLICA LA TÁCTICA DEL INVESTIGADOR EXACTAMENTE.
3. NUNCA DE LA RESPUESTA DIRECTA. NUNCA.
4. Termina tu mensaje haciéndole UNA SOLA PREGUNTA al estudiante que lo guíe a aplicar la técnica.
5. Usa máximo 2.5 oraciones. Sé brevísimo y directo al grano, pero empática.`;

    const linaResponse = await callGeminiSocratic(
      "Eres la Profesora Lina, una tutora socrática cálida colombiana experta en ICFES.", 
      [{ role: 'user', content: linaPrompt }], 
      "", 'es', false
    ) as string;

    return linaResponse;
  } catch (e) {
    console.error("Agent 3 (Tutor) failed", e);
    return "¡Uf! Se me cruzó un cablecito con el internet. ¿Me puedes repetir lo último que pensaste?";
  }
}
