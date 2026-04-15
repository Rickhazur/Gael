/**
 * Nova ICFES — Banco de Preguntas Nivel Validación Real
 * Preguntas modeladas según los Cuadernillos Oficiales del ICFES
 * Competencias evaluadas según Marcos de Referencia ICFES 2024
 * 
 * LECTURA CRÍTICA: Identificar, Comprender, Reflexionar, Evaluar
 * MATEMÁTICAS: Interpretación, Formulación, Ejecución
 * SOCIALES: Pensamiento Social, Interpretación de Fuentes, Pensamiento Sistémico
 * CIENCIAS: Uso comprensivo, Explicación de fenómenos, Indagación
 * INGLÉS: Comprensión lectora por niveles MCER (A1, A2, B1)
 */

import { supabase } from '../../../services/supabase';

export type IcfesCategory = "LECTURA_CRITICA" | "MATEMATICAS" | "SOCIALES" | "CIENCIAS" | "INGLES";

export type IcfesCompetency = 
  // Lectura Crítica
  | 'LC_IDENTIFICAR' | 'LC_COMPRENDER' | 'LC_REFLEXIONAR' | 'LC_EVALUAR'
  // Matemáticas
  | 'MAT_INTERPRETACION' | 'MAT_FORMULACION' | 'MAT_EJECUCION'
  // Sociales
  | 'SOC_PENSAMIENTO_SOCIAL' | 'SOC_INTERPRETACION_FUENTES' | 'SOC_PENSAMIENTO_SISTEMICO'
  // Ciencias
  | 'CIE_USO_COMPRENSIVO' | 'CIE_EXPLICACION' | 'CIE_INDAGACION'
  // Inglés
  | 'ENG_A1' | 'ENG_A2' | 'ENG_B1';

export interface IcfesQuestion {
  id: string;
  category: IcfesCategory;
  competency?: IcfesCompetency;
  text: string;
  context?: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
  socraticHints: string[];
  techniqueTip?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Group ID for questions that share the same reading passage */
  passageGroup?: string;
}

export const CATEGORY_LABELS: Record<IcfesCategory, string> = {
  LECTURA_CRITICA: "Lectura Crítica",
  MATEMATICAS: "Matemáticas",
  SOCIALES: "Sociales y Ciudadanas",
  CIENCIAS: "Ciencias Naturales",
  INGLES: "Inglés"
};

export const CATEGORY_ICONS: Record<IcfesCategory, string> = {
  LECTURA_CRITICA: "📖",
  MATEMATICAS: "🔢",
  SOCIALES: "🏛️",
  CIENCIAS: "🔬",
  INGLES: "🇬🇧"
};

export const CATEGORY_COLORS: Record<IcfesCategory, string> = {
  LECTURA_CRITICA: "#8B5CF6",
  MATEMATICAS: "#3B82F6",
  SOCIALES: "#F59E0B",
  CIENCIAS: "#10B981",
  INGLES: "#EF4444"
};

export const COMPETENCY_LABELS: Partial<Record<IcfesCompetency, string>> = {
  LC_IDENTIFICAR: 'Identificar información explícita',
  LC_COMPRENDER: 'Comprender el sentido global',
  LC_REFLEXIONAR: 'Reflexionar sobre el contenido',
  LC_EVALUAR: 'Evaluar estructura y argumentos',
  MAT_INTERPRETACION: 'Interpretación de datos',
  MAT_FORMULACION: 'Formulación de problemas',
  MAT_EJECUCION: 'Ejecución de procedimientos',
  SOC_PENSAMIENTO_SOCIAL: 'Pensamiento social',
  SOC_INTERPRETACION_FUENTES: 'Interpretación de fuentes',
  SOC_PENSAMIENTO_SISTEMICO: 'Pensamiento sistémico',
  CIE_USO_COMPRENSIVO: 'Uso comprensivo del conocimiento',
  CIE_EXPLICACION: 'Explicación de fenómenos',
  CIE_INDAGACION: 'Indagación científica',
};

// ─── Fetch from DB or fallback to local ───
export const fetchIcfesQuestions = async (
  category?: IcfesCategory,
  count: number = 20,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<IcfesQuestion[]> => {
  if (!supabase) return getLocalQuestions(category, count, difficulty);

  try {
    let query = supabase.from('icfes_questions').select('*').limit(count);
    if (category) query = query.eq('subject', category);
    
    const { data, error } = await query;
    if (error || !data || data.length === 0) return getLocalQuestions(category, count, difficulty);

    return data.map((q: any) => ({
      id: q.id,
      category: (q.subject || "LECTURA_CRITICA").toUpperCase() as IcfesCategory,
      text: q.enunciado || q.text,
      context: q.contexto || q.context,
      options: Array.isArray(q.options)
        ? q.options.map((o: any) => ({ id: o.letra || o.id, text: o.texto || o.text }))
        : [],
      correctId: q.respuesta_correcta || q.correct_answer,
      explanation: q.explicacion || q.explanation,
      socraticHints: q.pistas_socraticas || q.socratic_hints || [],
      techniqueTip: q.technique_tip || q.tip_estrategico,
      competency: q.competency || q.competencia,
      difficulty: q.difficulty || 'medium'
    }));
  } catch {
    return getLocalQuestions(category, count, difficulty);
  }
};

// ─── Get questions for diagnostic (10 per area, 50 total) ───
// Distribution: 3 easy, 4 medium, 3 hard per area (mirrors real ICFES weighting)
export const getDiagnosticQuestions = (): IcfesQuestion[] => {
  const categories: IcfesCategory[] = ["LECTURA_CRITICA", "MATEMATICAS", "SOCIALES", "CIENCIAS", "INGLES"];
  const result: IcfesQuestion[] = [];
  
  for (const cat of categories) {
    const catQuestions = ALL_QUESTIONS.filter(q => q.category === cat);
    const easy = catQuestions.filter(q => q.difficulty === 'easy');
    const medium = catQuestions.filter(q => q.difficulty === 'medium');
    const hard = catQuestions.filter(q => q.difficulty === 'hard');
    
    const shuffle = (arr: IcfesQuestion[]) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    
    // Pick: 3 easy, 4 medium, 3 hard = 10 per area
    result.push(...shuffle(easy).slice(0, 3));
    result.push(...shuffle(medium).slice(0, 4));
    result.push(...shuffle(hard).slice(0, 3));
  }
  
  return result;
};

// ─── Get random questions for simulation ───
export const getSimulationQuestions = (count: number = 20, category?: IcfesCategory): IcfesQuestion[] => {
  let pool = category ? ALL_QUESTIONS.filter(q => q.category === category) : [...ALL_QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  
  if (!category) {
    const perArea = Math.ceil(count / 5);
    const balanced: IcfesQuestion[] = [];
    const categories: IcfesCategory[] = ["LECTURA_CRITICA", "MATEMATICAS", "SOCIALES", "CIENCIAS", "INGLES"];
    for (const cat of categories) {
      const catQs = pool.filter(q => q.category === cat).slice(0, perArea);
      balanced.push(...catQs);
    }
    return balanced.slice(0, count);
  }
  
  return pool.slice(0, count);
};

function getLocalQuestions(category?: IcfesCategory, count: number = 20, difficulty?: 'easy' | 'medium' | 'hard'): IcfesQuestion[] {
  let pool = [...ALL_QUESTIONS];
  if (category) pool = pool.filter(q => q.category === category);
  if (difficulty) pool = pool.filter(q => q.difficulty === difficulty);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

// ═══════════════════════════════════════════
// BANCO DE PREGUNTAS — NIVEL ICFES VALIDACIÓN
// Formato: Textos largos + preguntas agrupadas
// ═══════════════════════════════════════════

// ─── Pasajes de lectura compartidos ───
const PASSAGES = {
  EDITORIAL_EDUCACION: `La educación en Colombia enfrenta desafíos estructurales que no se resuelven únicamente con mayor inversión. Según el informe "Educación en Colombia" de la OCDE (2023), aunque la cobertura en educación básica alcanza el 97%, la calidad medida por pruebas estandarizadas muestra que solo el 28% de los estudiantes de grado 11 alcanza niveles satisfactorios en lectura crítica.

El problema, argumentan los investigadores, no radica solo en los recursos sino en el modelo pedagógico. Mientras países como Finlandia han transitado hacia el aprendizaje basado en problemas y el pensamiento crítico, Colombia mantiene un sistema centrado en la memorización y la repetición. "No se trata de cuánto sabe el estudiante, sino de qué puede hacer con lo que sabe", señala la investigadora Juliana Mejía de la Universidad Nacional.

Los críticos de esta posición, sin embargo, apuntan que sin una base sólida de conocimientos factuales, el pensamiento crítico carece de sustento. El debate, lejos de resolverse, refleja las tensiones entre dos visiones educativas que coexisten en el país.`,

  POEMA_NERUDA: `"Poema 20" — Pablo Neruda

Puedo escribir los versos más tristes esta noche.
Escribir, por ejemplo: "La noche está estrellada,
y tiritan, azules, los astros, a lo lejos."
El viento de la noche gira en el cielo y canta.

Puedo escribir los versos más tristes esta noche.
Yo la quise, y a veces ella también me quiso.
En las noches como esta la tuve entre mis brazos.
La besé tantas veces bajo el cielo infinito.

Ella me quiso, a veces yo también la quería.
Cómo no haber amado sus grandes ojos fijos.
Puedo escribir los versos más tristes esta noche.
Pensar que no la tengo. Sentir que la he perdido.`,

  ARTICULO_CIENTIFICO: `Un grupo de investigadores de la Universidad de los Andes realizó un experimento para determinar el efecto de la temperatura sobre la velocidad de germinación de semillas de frijol (Phaseolus vulgaris). Se colocaron 30 semillas en tres grupos de 10, cada grupo bajo condiciones controladas idénticas de humedad y luz, pero a diferentes temperaturas: Grupo A (15°C), Grupo B (25°C) y Grupo C (35°C).

Después de 7 días, se registraron los siguientes resultados:
• Grupo A (15°C): 3 de 10 semillas germinaron. Tiempo promedio: 6.2 días.
• Grupo B (25°C): 9 de 10 semillas germinaron. Tiempo promedio: 3.1 días.
• Grupo C (35°C): 5 de 10 semillas germinaron. Tiempo promedio: 4.8 días.

Los investigadores concluyeron que existe una temperatura óptima para la germinación, y que tanto el frío extremo como el calor excesivo reducen la tasa de germinación, aunque por mecanismos diferentes.`,

  CONSTITUCION_ART13: `Artículo 13 de la Constitución Política de Colombia:

"Todas las personas nacen libres e iguales ante la ley, recibirán la misma protección y trato de las autoridades y gozarán de los mismos derechos, libertades y oportunidades sin ninguna discriminación por razones de sexo, raza, origen nacional o familiar, lengua, religión, opinión política o filosófica.

El Estado promoverá las condiciones para que la igualdad sea real y efectiva y adoptará medidas en favor de grupos discriminados o marginados.

El Estado protegerá especialmente a aquellas personas que por su condición económica, física o mental, se encuentren en circunstancia de debilidad manifiesta y sancionará los abusos o maltratos que contra ellas se cometan."`,

  ENGLISH_EMAIL: `From: Sarah Johnson <s.johnson@techcorp.com>
To: All Staff
Subject: Important Changes to Remote Work Policy

Dear Team,

I am writing to inform you about some significant changes to our remote work policy that will take effect starting next month. After careful consideration and feedback from various departments, management has decided to implement a hybrid model.

Under the new policy, employees will be required to work from the office at least three days per week (Tuesday, Wednesday, and Thursday). Mondays and Fridays will remain flexible, allowing team members to work from home if they prefer.

We understand that this change may affect some of you, particularly those who have relocated during the fully remote period. If you have concerns or need special accommodations, please contact Human Resources before the end of this week.

We believe this balance will strengthen team collaboration while maintaining the flexibility you have come to appreciate.

Best regards,
Sarah Johnson
VP of Operations`,

  TABLA_MATEMATICAS: `Una tienda de ropa registró sus ventas durante la primera semana de diciembre:

  Día        | Camisetas | Pantalones | Zapatos | Total ventas ($)
  Lunes      |    12     |     5      |    3    |   $850.000
  Martes     |     8     |     7      |    2    |   $920.000
  Miércoles  |    15     |     3      |    5    | $1.100.000
  Jueves     |    10     |     6      |    4    |   $980.000
  Viernes    |    20     |    10      |    8    | $1.750.000
  Sábado     |    25     |    12      |   10    | $2.100.000

Precios: Camiseta = $35.000 | Pantalón = $55.000 | Zapatos = $80.000`,

  CONFLICTO_ARMADO: `Fragmento adaptado del Informe "¡Basta Ya!" del Centro Nacional de Memoria Histórica (2013):

"El conflicto armado colombiano es uno de los más prolongados del hemisferio occidental. Sus orígenes se remontan a la violencia bipartidista de mediados del siglo XX, pero se transformó con la aparición de guerrillas de orientación marxista en la década de 1960 (FARC, ELN), y posteriormente con el surgimiento de grupos paramilitares en los años 80.

Las víctimas del conflicto, en su gran mayoría civiles y campesinos, no fueron simples 'daños colaterales' sino blancos deliberados de estrategias de control territorial. El desplazamiento forzado afectó a más de 7 millones de colombianos, convirtiéndose en la mayor crisis humanitaria de América Latina.

La firma del Acuerdo de Paz con las FARC en 2016 marcó un hito histórico, pero la construcción de una paz estable y duradera requiere no solo el silencio de las armas, sino la transformación de las condiciones estructurales que dieron origen al conflicto: la desigualdad, la exclusión política y la concentración de la tierra."`,
};

export const ALL_QUESTIONS: IcfesQuestion[] = [

  // ╔══════════════════════════════════════════════════════╗
  // ║     📖 LECTURA CRÍTICA — Nivel Validación ICFES     ║
  // ╚══════════════════════════════════════════════════════╝

  // ── Pasaje 1: Editorial sobre Educación (3 preguntas) ──
  { id: "lc_01", category: "LECTURA_CRITICA", difficulty: "medium", competency: "LC_IDENTIFICAR",
    passageGroup: "editorial_edu",
    context: PASSAGES.EDITORIAL_EDUCACION,
    text: "Según el texto, ¿cuál es el porcentaje de estudiantes de grado 11 que alcanza niveles satisfactorios en lectura crítica?",
    options: [
      { id: "A", text: "97%" },
      { id: "B", text: "28%" },
      { id: "C", text: "72%" },
      { id: "D", text: "El texto no menciona un porcentaje" }
    ],
    correctId: "B", explanation: "El texto dice explícitamente: 'solo el 28% de los estudiantes de grado 11 alcanza niveles satisfactorios en lectura crítica'.",
    socraticHints: ["Relee el primer párrafo. ¿Qué dice sobre la calidad medida por pruebas?", "Busca un número que hable de lectura crítica específicamente."],
    techniqueTip: "Preguntas de 'identificar': busca datos exactos en el texto. No interpretes, localiza."
  },
  { id: "lc_02", category: "LECTURA_CRITICA", difficulty: "hard", competency: "LC_COMPRENDER",
    passageGroup: "editorial_edu",
    context: PASSAGES.EDITORIAL_EDUCACION,
    text: "¿Cuál es la tesis principal que defiende la investigadora Juliana Mejía?",
    options: [
      { id: "A", text: "Colombia necesita más presupuesto para educación" },
      { id: "B", text: "Lo importante no es cuánto se sabe sino qué se puede hacer con ese conocimiento" },
      { id: "C", text: "Finlandia tiene el mejor sistema educativo del mundo" },
      { id: "D", text: "La memorización es la base del aprendizaje" }
    ],
    correctId: "B", explanation: "Mejía dice: 'No se trata de cuánto sabe el estudiante, sino de qué puede hacer con lo que sabe'. Defiende el enfoque por competencias sobre la memorización.",
    socraticHints: ["¿Qué frase está entre comillas y atribuida a Mejía?", "¿Ella habla de dinero o de método de enseñanza?"],
    techniqueTip: "Para identificar una tesis, busca la afirmación que el autor DEFIENDE, no solo menciona. Las citas directas suelen contener la tesis."
  },
  { id: "lc_03", category: "LECTURA_CRITICA", difficulty: "hard", competency: "LC_EVALUAR",
    passageGroup: "editorial_edu",
    context: PASSAGES.EDITORIAL_EDUCACION,
    text: "El último párrafo del texto cumple la función de:",
    options: [
      { id: "A", text: "Dar la razón a la investigadora Juliana Mejía" },
      { id: "B", text: "Presentar una postura contraria y mostrar que el debate sigue abierto" },
      { id: "C", text: "Concluir que la memorización es superior al pensamiento crítico" },
      { id: "D", text: "Citar nuevos datos estadísticos que refuerzan la tesis central" }
    ],
    correctId: "B", explanation: "El último párrafo introduce a 'Los críticos de esta posición' y cierra diciendo que 'el debate, lejos de resolverse, refleja tensiones'. Presenta el contraargumento y deja el debate abierto.",
    socraticHints: ["¿El último párrafo está de acuerdo con Mejía o presenta otra visión?", "¿Las palabras 'sin embargo' indican acuerdo o contraste?"],
    techniqueTip: "Preguntas sobre la FUNCIÓN de un párrafo: ¿introduce? ¿desarrolla? ¿concluye? ¿presenta objeción? Fíjate en los conectores."
  },

  // ── Pasaje 2: Poema de Neruda (3 preguntas) ──
  { id: "lc_04", category: "LECTURA_CRITICA", difficulty: "medium", competency: "LC_COMPRENDER",
    passageGroup: "poema_neruda",
    context: PASSAGES.POEMA_NERUDA,
    text: "El sentimiento predominante en este poema es:",
    options: [
      { id: "A", text: "Alegría por un amor correspondido" },
      { id: "B", text: "Nostalgia y dolor por un amor perdido" },
      { id: "C", text: "Indiferencia ante el paso del tiempo" },
      { id: "D", text: "Esperanza de un reencuentro futuro" }
    ],
    correctId: "B", explanation: "'Sentir que la he perdido', 'pensar que no la tengo', y la repetición de 'los versos más tristes' expresan claramente nostalgia y pérdida.",
    socraticHints: ["¿El poeta habla de un amor presente o pasado?", "'La he perdido', 'no la tengo' — ¿son frases de alegría o de tristeza?"],
    techniqueTip: "En poesía, identifica las emociones a través de verbos ('perdido', 'sentir') y adjetivos ('tristes', 'infinito')."
  },
  { id: "lc_05", category: "LECTURA_CRITICA", difficulty: "hard", competency: "LC_REFLEXIONAR",
    passageGroup: "poema_neruda",
    context: PASSAGES.POEMA_NERUDA,
    text: "En el verso 'y tiritan, azules, los astros, a lo lejos', el verbo 'tiritan' es un ejemplo de:",
    options: [
      { id: "A", text: "Hipérbole" },
      { id: "B", text: "Personificación" },
      { id: "C", text: "Comparación" },
      { id: "D", text: "Onomatopeya" }
    ],
    correctId: "B", explanation: "Los astros no pueden 'tiritar' (temblar). Atribuir acciones humanas a objetos inanimados es una personificación (o prosopopeya).",
    socraticHints: ["¿Los astros son seres vivos? ¿Pueden temblar de frío?", "Cuando le damos cualidades humanas a algo que no es humano, ¿cómo se llama esa figura?"],
    techniqueTip: "Personificación = dar cualidades humanas a animales, objetos o ideas. Clave: ¿este objeto PUEDE hacer eso en la realidad?"
  },
  { id: "lc_06", category: "LECTURA_CRITICA", difficulty: "easy", competency: "LC_IDENTIFICAR",
    passageGroup: "poema_neruda",
    context: PASSAGES.POEMA_NERUDA,
    text: "La frase 'Puedo escribir los versos más tristes esta noche' aparece en el poema:",
    options: [
      { id: "A", text: "Una sola vez al inicio" },
      { id: "B", text: "Dos veces como un estribillo" },
      { id: "C", text: "Tres veces, creando un efecto de repetición" },
      { id: "D", text: "No aparece textualmente" }
    ],
    correctId: "C", explanation: "La frase aparece tres veces (versos 1, 5 y 11), funcionando como un recurso de repetición (anáfora) que refuerza el tono melancólico.",
    socraticHints: ["Cuenta cuántas veces aparece exactamente esa frase.", "¿Aparece solo al principio o se repite?"],
    techniqueTip: "La repetición deliberada en poesía se llama anáfora (al inicio) o estribillo (como verso recurrente). Sirve para enfatizar."
  },

  // ── Preguntas independientes de Lectura Crítica ──
  { id: "lc_07", category: "LECTURA_CRITICA", difficulty: "easy", competency: "LC_IDENTIFICAR",
    text: "Un texto que presenta instrucciones paso a paso para armar un mueble es de tipo:",
    options: [
      { id: "A", text: "Narrativo" },
      { id: "B", text: "Argumentativo" },
      { id: "C", text: "Instructivo" },
      { id: "D", text: "Expositivo" }
    ],
    correctId: "C", explanation: "Los textos instructivos dan pasos u órdenes secuenciales: recetas, manuales, guías de armado.",
    socraticHints: ["¿Un manual cuenta una historia o te dice qué hacer?", "Si dice 'Paso 1... Paso 2...', ¿qué tipo de texto es?"],
    techniqueTip: "Tipos de texto: Narrativo=cuenta, Argumentativo=convence, Expositivo=informa, Instructivo=guía."
  },
  { id: "lc_08", category: "LECTURA_CRITICA", difficulty: "medium", competency: "LC_EVALUAR",
    text: "Un candidato político dice: 'Mi oponente fue acusado de corrupción, por lo tanto su propuesta de reforma tributaria es inviable.' ¿Qué tipo de falacia comete?",
    options: [
      { id: "A", text: "Ad hominem (ataque a la persona)" },
      { id: "B", text: "Falsa analogía" },
      { id: "C", text: "Argumento circular" },
      { id: "D", text: "Generalización apresurada" }
    ],
    correctId: "A", explanation: "Descalifica la propuesta atacando a la persona ('fue acusado de corrupción') en lugar de argumentar contra la reforma en sí.",
    socraticHints: ["¿El candidato habla de la propuesta tributaria o de la persona?", "¿Ser acusado de corrupción prueba que una propuesta económica es mala?"],
    techniqueTip: "Ad hominem = atacar a quien dice algo, no lo que dice. Si el argumento se centra en la persona, es ad hominem."
  },
  { id: "lc_09", category: "LECTURA_CRITICA", difficulty: "medium", competency: "LC_COMPRENDER",
    context: "Texto: 'La inteligencia artificial no reemplazará a los profesores. Sin embargo, los profesores que usen inteligencia artificial reemplazarán a los que no la usen.' — Adaptado de un artículo de opinión, 2024.",
    text: "La idea central de este texto es que:",
    options: [
      { id: "A", text: "La IA va a eliminar todos los empleos docentes" },
      { id: "B", text: "Los profesores no necesitan la tecnología" },
      { id: "C", text: "La IA no sustituye al profesor, pero sí lo hace más competitivo frente a quienes no la adopten" },
      { id: "D", text: "La IA es más inteligente que cualquier profesor" }
    ],
    correctId: "C", explanation: "El texto distingue entre 'reemplazar profesores' (que niega) y 'dar ventaja a quienes la usen' (que afirma). No es eliminar, sino evolucionar.",
    socraticHints: ["¿Dice que la IA reemplazará a los profesores? ¿Qué dice exactamente?", "¿Quiénes serán reemplazados según el texto?"],
    techniqueTip: "Si el texto dice 'no X, pero sí Y', la tesis está en Y (lo que SÍ afirma)."
  },
  { id: "lc_10", category: "LECTURA_CRITICA", difficulty: "easy", competency: "LC_IDENTIFICAR",
    text: "En la oración 'Aunque llovía intensamente, los niños salieron a jugar', la palabra 'aunque' establece una relación de:",
    options: [
      { id: "A", text: "Causa-efecto" },
      { id: "B", text: "Concesión (contraste)" },
      { id: "C", text: "Adición" },
      { id: "D", text: "Temporalidad" }
    ],
    correctId: "B", explanation: "'Aunque' indica que a pesar de una circunstancia adversa (la lluvia), ocurre algo inesperado (salir a jugar). Es una relación concesiva.",
    socraticHints: ["¿Lo esperado sería salir a jugar con lluvia intensa?", "'Aunque' introduce algo que VA EN CONTRA de lo esperado."],
    techniqueTip: "Concesión: aunque, a pesar de, pese a. Causa: porque, ya que. Adición: además, también."
  },
  { id: "lc_11", category: "LECTURA_CRITICA", difficulty: "hard", competency: "LC_REFLEXIONAR",
    context: "'Todo lo que necesitas está ya dentro de ti. La sociedad te convencerá de que no es así. No la escuches.' — Adaptado de un texto de desarrollo personal.",
    text: "Un lector crítico señalaría que este texto comete la falacia de:",
    options: [
      { id: "A", text: "Apelación a la autoridad" },
      { id: "B", text: "Generalización apresurada y simplificación excesiva" },
      { id: "C", text: "Argumento ad hominem" },
      { id: "D", text: "Falsa dicotomía" }
    ],
    correctId: "B", explanation: "Afirmar que 'TODO lo que necesitas está dentro de ti' y que 'la sociedad' (toda) te engaña son generalizaciones sin matiz. La realidad es más compleja.",
    socraticHints: ["¿Es cierto que ABSOLUTAMENTE todo lo que necesitas está ya dentro de ti?", "¿'La sociedad' entera piensa igual? ¿No hay matices?"],
    techniqueTip: "Palabras como TODO, NADA, SIEMPRE, NUNCA suelen indicar generalización apresurada. La realidad casi nunca es absoluta."
  },
  { id: "lc_12", category: "LECTURA_CRITICA", difficulty: "medium", competency: "LC_EVALUAR",
    text: "Si un texto usa 'por consiguiente', 'en consecuencia' y 'por lo tanto', su estructura predominante es:",
    options: [
      { id: "A", text: "Comparación y contraste" },
      { id: "B", text: "Causa-consecuencia" },
      { id: "C", text: "Secuencia cronológica" },
      { id: "D", text: "Problema-solución" }
    ],
    correctId: "B", explanation: "Esos conectores indican que cada idea es CONSECUENCIA de la anterior. Son marcadores de causalidad.",
    socraticHints: ["'Por consiguiente' = ¿qué sigue de qué? ¿Es un orden temporal o una relación de causa?"],
    techniqueTip: "Causa: porque, ya que, debido a. Consecuencia: por lo tanto, en consecuencia, por consiguiente."
  },
  { id: "lc_13", category: "LECTURA_CRITICA", difficulty: "easy", competency: "LC_COMPRENDER",
    text: "Un refrán como 'El que mucho abarca, poco aprieta' aconseja:",
    options: [
      { id: "A", text: "Hacer muchas cosas a la vez para ser más productivo" },
      { id: "B", text: "Concentrarse en pocas cosas para hacerlas bien" },
      { id: "C", text: "No hacer nada porque todo sale mal" },
      { id: "D", text: "Abrazar fuerte a las personas" }
    ],
    correctId: "B", explanation: "'Abarcar' mucho = intentar hacer demasiado. 'Apretar' poco = no hacer nada bien. Aconseja enfocarse.",
    socraticHints: ["Si 'abarcas' mucho, ¿qué pasa con la calidad?", "¿Es mejor hacer 10 cosas regular o 3 cosas excelente?"],
    techniqueTip: "Los refranes usan lenguaje figurado. Traduce cada parte: abarcar=intentar, apretar=lograr bien."
  },
  { id: "lc_14", category: "LECTURA_CRITICA", difficulty: "hard", competency: "LC_EVALUAR",
    context: "Texto: 'Las redes sociales son la mayor amenaza para la democracia moderna. Manipulan opiniones, destruyen el debate racional y convierten a los ciudadanos en consumidores pasivos de desinformación.'",
    text: "¿Cuál sería el contraargumento más fuerte a esta posición?",
    options: [
      { id: "A", text: "Las redes sociales también han democratizado el acceso a la información y han permitido movimientos sociales que de otra forma no existirían" },
      { id: "B", text: "Las redes sociales son divertidas" },
      { id: "C", text: "Siempre ha existido la desinformación, incluso antes de internet" },
      { id: "D", text: "El autor probablemente no usa redes sociales" }
    ],
    correctId: "A", explanation: "A es el contraargumento más fuerte porque reconoce el problema pero presenta evidencia de beneficios concretos para la democracia. B es débil, C no contrarresta la tesis central, D es ad hominem.",
    socraticHints: ["¿Cuál opción ataca la idea con otra idea igual de fuerte?", "¿Un buen contraargumento dice 'no es cierto' o dice 'sí, pero TAMBIÉN...'?"],
    techniqueTip: "El mejor contraargumento no niega todo sino que presenta evidencia contraria igualmente válida."
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║     🔢 MATEMÁTICAS — Nivel Validación ICFES         ║
  // ╚══════════════════════════════════════════════════════╝

  // ── Con tabla de datos ──
  { id: "mat_01", category: "MATEMATICAS", difficulty: "medium", competency: "MAT_INTERPRETACION",
    context: PASSAGES.TABLA_MATEMATICAS,
    text: "¿Qué día de la semana se vendieron más camisetas?",
    options: [
      { id: "A", text: "Viernes" },
      { id: "B", text: "Sábado" },
      { id: "C", text: "Miércoles" },
      { id: "D", text: "Jueves" }
    ],
    correctId: "B", explanation: "El sábado se vendieron 25 camisetas, más que cualquier otro día (Viernes=20, Miércoles=15).",
    socraticHints: ["Compara la columna 'Camisetas' fila por fila.", "¿Cuál número es el mayor en esa columna?"],
    techniqueTip: "En tablas, recorre la columna que te piden y busca el valor máximo o mínimo según la pregunta."
  },
  { id: "mat_02", category: "MATEMATICAS", difficulty: "hard", competency: "MAT_FORMULACION",
    context: PASSAGES.TABLA_MATEMATICAS,
    text: "Si el martes se vendieron 8 camisetas, 7 pantalones y 2 zapatos, y los precios son Camiseta=$35.000, Pantalón=$55.000, Zapatos=$80.000, ¿cuánto debería ser el total de ventas teórico del martes?",
    options: [
      { id: "A", text: "$825.000" },
      { id: "B", text: "$920.000" },
      { id: "C", text: "$825.000 pero la tabla dice $920.000, hay una diferencia de $95.000" },
      { id: "D", text: "$1.000.000" }
    ],
    correctId: "C", explanation: "(8×35.000)+(7×55.000)+(2×80.000) = 280.000+385.000+160.000 = $825.000. La tabla dice $920.000. Diferencia = $95.000, lo que indica otros ingresos o un error.",
    socraticHints: ["Multiplica: cantidad × precio para cada producto.", "¿El total que calculaste coincide con lo que dice la tabla?"],
    techniqueTip: "Cuando un cálculo no coincide con los datos, eso puede ser intencional. Busca qué información adicional explica la diferencia."
  },
  { id: "mat_03", category: "MATEMATICAS", difficulty: "medium", competency: "MAT_INTERPRETACION",
    context: PASSAGES.TABLA_MATEMATICAS,
    text: "¿Cuál fue la media (promedio) de zapatos vendidos por día durante la semana?",
    options: [
      { id: "A", text: "4.5 zapatos" },
      { id: "B", text: "5.3 zapatos" },
      { id: "C", text: "6 zapatos" },
      { id: "D", text: "3.8 zapatos" }
    ],
    correctId: "B", explanation: "Zapatos: 3+2+5+4+8+10 = 32 total. Promedio = 32÷6 = 5.33 ≈ 5.3",
    socraticHints: ["¿Cómo se calcula un promedio?", "Suma todos los zapatos vendidos y divide entre el número de días."],
    techniqueTip: "Promedio = suma de todos los valores ÷ cantidad de datos. No olvides contar bien cuántos datos hay."
  },

  // ── Problemas de razonamiento ──
  { id: "mat_04", category: "MATEMATICAS", difficulty: "easy", competency: "MAT_EJECUCION",
    text: "Si una persona gana $1.200.000 al mes y gasta el 75% en necesidades básicas, ¿cuánto le queda para ahorro?",
    options: [
      { id: "A", text: "$300.000" },
      { id: "B", text: "$400.000" },
      { id: "C", text: "$250.000" },
      { id: "D", text: "$900.000" }
    ],
    correctId: "A", explanation: "Si gasta 75%, le queda 25%. El 25% de $1.200.000 = $1.200.000 × 0.25 = $300.000.",
    socraticHints: ["Si gasta el 75%, ¿qué porcentaje le queda?", "¿Cuánto es el 25% de $1.200.000?"],
    techniqueTip: "Si gasta X%, le queda (100-X)%. No calcules el gasto; calcula directamente lo que queda."
  },
  { id: "mat_05", category: "MATEMATICAS", difficulty: "easy", competency: "MAT_EJECUCION",
    text: "Un rectángulo tiene base de 8 cm y altura de 5 cm. ¿Cuál es su área?",
    options: [
      { id: "A", text: "26 cm²" },
      { id: "B", text: "40 cm²" },
      { id: "C", text: "13 cm²" },
      { id: "D", text: "80 cm²" }
    ],
    correctId: "B", explanation: "Área del rectángulo = base × altura = 8 × 5 = 40 cm².",
    socraticHints: ["¿Cuál es la fórmula del área de un rectángulo?", "Multiplica la base por la altura."],
    techniqueTip: "Áreas: Rectángulo=b×h. Triángulo=(b×h)/2. Círculo=π×r²."
  },
  { id: "mat_06", category: "MATEMATICAS", difficulty: "medium", competency: "MAT_FORMULACION",
    text: "Un bus sale de Bogotá a las 6:00 AM y recorre 80 km/h. Otro bus sale a las 8:00 AM del mismo punto a 120 km/h. ¿A qué hora el segundo bus alcanza al primero?",
    options: [
      { id: "A", text: "10:00 AM" },
      { id: "B", text: "12:00 M" },
      { id: "C", text: "11:00 AM" },
      { id: "D", text: "2:00 PM" }
    ],
    correctId: "B", explanation: "A las 8 AM, el bus 1 lleva 2h×80=160 km de ventaja. El bus 2 cierra la brecha a 120-80=40 km/h. Tiempo = 160÷40 = 4 horas. 8 AM + 4h = 12:00 M.",
    socraticHints: ["¿Cuántos km de ventaja tiene el primer bus cuando sale el segundo?", "¿A qué ritmo se acerca el segundo bus? Es la DIFERENCIA de velocidades."],
    techniqueTip: "Problemas de alcance: ventaja ÷ diferencia de velocidad = tiempo para alcanzar."
  },
  { id: "mat_07", category: "MATEMATICAS", difficulty: "hard", competency: "MAT_INTERPRETACION",
    text: "En una encuesta a 200 personas, el 45% prefiere café, el 30% prefiere té, y el resto prefiere agua. ¿Cuántas personas más prefieren café que agua?",
    options: [
      { id: "A", text: "40" },
      { id: "B", text: "30" },
      { id: "C", text: "50" },
      { id: "D", text: "20" }
    ],
    correctId: "A", explanation: "Agua = 100% - 45% - 30% = 25%. Café = 45% de 200 = 90. Agua = 25% de 200 = 50. Diferencia = 90 - 50 = 40.",
    socraticHints: ["Primero calcula el porcentaje de agua: 100% - café - té", "Luego convierte porcentajes a personas: % × 200"],
    techniqueTip: "En problemas de encuestas, los porcentajes SIEMPRE deben sumar 100%. Si te dan algunos, el resto se calcula."
  },
  { id: "mat_08", category: "MATEMATICAS", difficulty: "easy", competency: "MAT_EJECUCION",
    text: "¿Cuál es el valor de la expresión: 3 + 5 × 2?",
    options: [
      { id: "A", text: "16" },
      { id: "B", text: "13" },
      { id: "C", text: "10" },
      { id: "D", text: "11" }
    ],
    correctId: "B", explanation: "Primero la multiplicación: 5 × 2 = 10. Luego la suma: 3 + 10 = 13. (Jerarquía de operaciones)",
    socraticHints: ["¿Qué operación se hace primero, la suma o la multiplicación?", "Recuerda: primero multiplicar/dividir, después sumar/restar."],
    techniqueTip: "Jerarquía: Paréntesis → Potencias → Multiplicación/División → Suma/Resta."
  },
  { id: "mat_09", category: "MATEMATICAS", difficulty: "medium", competency: "MAT_FORMULACION",
    text: "Si un producto cuesta $80.000 y tiene un descuento del 15%, pero luego se le aplica un IVA del 19% sobre el precio con descuento, ¿cuál es el precio final?",
    options: [
      { id: "A", text: "$80.920" },
      { id: "B", text: "$78.200" },
      { id: "C", text: "$80.880" },
      { id: "D", text: "$68.000" }
    ],
    correctId: "A", explanation: "Descuento: 80.000 × 0.85 = 68.000. IVA: 68.000 × 1.19 = 80.920.",
    socraticHints: ["Paso 1: aplica el descuento. Paso 2: sobre ESE precio, calcula el IVA.", "¿El IVA se calcula sobre el precio original o sobre el precio ya con descuento?"],
    techniqueTip: "Descuento PRIMERO, IVA DESPUÉS. El IVA se aplica sobre el precio descontado, no sobre el original."
  },
  { id: "mat_10", category: "MATEMATICAS", difficulty: "hard", competency: "MAT_INTERPRETACION",
    text: "La mediana de los datos 12, 7, 4, 15, 9, 3, 11 es:",
    options: [
      { id: "A", text: "8.71" },
      { id: "B", text: "9" },
      { id: "C", text: "7" },
      { id: "D", text: "11" }
    ],
    correctId: "B", explanation: "Ordenados: 3, 4, 7, 9, 11, 12, 15. Son 7 datos (impar), la mediana es el valor central: posición 4 = 9.",
    socraticHints: ["Primero ordena los datos de menor a mayor.", "Si hay 7 datos, ¿en qué posición está el del medio?"],
    techniqueTip: "Mediana: ordena los datos. Si son impares (n datos), la mediana está en la posición (n+1)/2."
  },
  { id: "mat_11", category: "MATEMATICAS", difficulty: "easy", competency: "MAT_EJECUCION",
    text: "¿Qué fracción representa 0.75?",
    options: [
      { id: "A", text: "7/5" },
      { id: "B", text: "3/4" },
      { id: "C", text: "1/4" },
      { id: "D", text: "7/10" }
    ],
    correctId: "B", explanation: "0.75 = 75/100 = 3/4 (simplificando entre 25).",
    socraticHints: ["0.75 es lo mismo que 75 centésimas. ¿Puedes simplificar 75/100?"],
    techniqueTip: "Decimales a fracciones: 0.5=1/2, 0.25=1/4, 0.75=3/4, 0.33≈1/3."
  },
  { id: "mat_12", category: "MATEMATICAS", difficulty: "hard", competency: "MAT_FORMULACION",
    text: "Si f(x) = 2x + 3, ¿para qué valor de x se cumple que f(x) = 15?",
    options: [
      { id: "A", text: "x = 6" },
      { id: "B", text: "x = 9" },
      { id: "C", text: "x = 5" },
      { id: "D", text: "x = 7.5" }
    ],
    correctId: "A", explanation: "15 = 2x + 3 → 12 = 2x → x = 6. Verificación: f(6) = 2(6)+3 = 15 ✓",
    socraticHints: ["Reemplaza f(x) por 15 y resuelve la ecuación.", "15 = 2x + 3. ¿Qué haces primero para despejar x?"],
    techniqueTip: "Para resolver ecuaciones lineales: aísla x. Resta/suma primero los números, luego divide por el coeficiente."
  },
  { id: "mat_13", category: "MATEMATICAS", difficulty: "medium", competency: "MAT_INTERPRETACION",
    text: "La probabilidad de sacar un número mayor que 4 al lanzar un dado de 6 caras es:",
    options: [
      { id: "A", text: "1/6" },
      { id: "B", text: "2/6 = 1/3" },
      { id: "C", text: "3/6 = 1/2" },
      { id: "D", text: "4/6 = 2/3" }
    ],
    correctId: "B", explanation: "Números mayores que 4: solo el 5 y el 6 = 2 casos favorables de 6 posibles. P = 2/6 = 1/3.",
    socraticHints: ["¿Cuáles números del dado son MAYORES que 4?", "¿Son el 5 y el 6? ¿Cuántos son? ¿Y cuántos lados tiene el dado?"],
    techniqueTip: "Probabilidad = favorables/posibles. 'Mayor que 4' = {5, 6}. NO incluye el 4."
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║     🏛️ SOCIALES Y CIUDADANAS — Nivel Validación     ║
  // ╚══════════════════════════════════════════════════════╝

  // ── Pasaje: Constitución Art. 13 ──
  { id: "soc_01", category: "SOCIALES", difficulty: "medium", competency: "SOC_INTERPRETACION_FUENTES",
    passageGroup: "constitucion_art13",
    context: PASSAGES.CONSTITUCION_ART13,
    text: "Según el Artículo 13, ¿cuál de las siguientes acciones es CONTRARIA a lo que establece?",
    options: [
      { id: "A", text: "Dar becas especiales a personas de escasos recursos" },
      { id: "B", text: "Negar empleo a una persona por su origen étnico" },
      { id: "C", text: "Crear programas de salud para personas con discapacidad" },
      { id: "D", text: "Proteger a las madres cabeza de familia" }
    ],
    correctId: "B", explanation: "El artículo prohíbe explícitamente la discriminación por 'raza, origen nacional o familiar'. Negar empleo por origen étnico viola directamente este derecho.",
    socraticHints: ["El artículo dice 'sin ninguna discriminación'. ¿Cuál opción ES discriminación?", "A, C y D son acciones de PROTECCIÓN a grupos vulnerables. ¿Y B?"],
    techniqueTip: "En preguntas sobre la Constitución, identifica qué DERECHOS protege y qué PROHIBICIONES establece."
  },
  { id: "soc_02", category: "SOCIALES", difficulty: "hard", competency: "SOC_PENSAMIENTO_SOCIAL",
    passageGroup: "constitucion_art13",
    context: PASSAGES.CONSTITUCION_ART13,
    text: "El segundo párrafo del Artículo 13 establece que el Estado debe 'promover condiciones para que la igualdad sea real y efectiva'. Esto implica que:",
    options: [
      { id: "A", text: "Todos deben recibir exactamente lo mismo sin importar sus circunstancias" },
      { id: "B", text: "La igualdad formal (en la ley) no es suficiente; se necesitan acciones concretas para grupos desventajados" },
      { id: "C", text: "Solo los ricos tienen derechos" },
      { id: "D", text: "El Estado no tiene responsabilidad en la igualdad" }
    ],
    correctId: "B", explanation: "La distinción entre igualdad 'formal' (todos iguales ante la ley) e igualdad 'real y efectiva' (que las oportunidades sean equitativas) es fundamental. El Estado debe actuar para cerrar brechas reales.",
    socraticHints: ["Si todos son iguales ante la ley pero un grupo no puede acceder a educación, ¿es igualdad real?", "'Real y efectiva' sugiere que la igualdad en el papel no basta. ¿Qué más se necesita?"],
    techniqueTip: "Igualdad formal ≠ igualdad material. La Constitución colombiana reconoce que se necesitan acciones afirmativas."
  },

  // ── Pasaje: Conflicto Armado ──
  { id: "soc_03", category: "SOCIALES", difficulty: "hard", competency: "SOC_INTERPRETACION_FUENTES",
    passageGroup: "conflicto_armado",
    context: PASSAGES.CONFLICTO_ARMADO,
    text: "Según el texto, ¿cuál fue la principal consecuencia humanitaria del conflicto armado colombiano?",
    options: [
      { id: "A", text: "La aparición de las guerrillas en 1960" },
      { id: "B", text: "El desplazamiento forzado de más de 7 millones de colombianos" },
      { id: "C", text: "La firma del Acuerdo de Paz en 2016" },
      { id: "D", text: "La violencia bipartidista del siglo XX" }
    ],
    correctId: "B", explanation: "El texto describe el desplazamiento forzado como 'la mayor crisis humanitaria de América Latina', afectando a más de 7 millones de colombianos.",
    socraticHints: ["¿Cuál dato menciona el texto como la 'mayor crisis humanitaria'?", "A y D son causas, C es un evento posterior. ¿Cuál es una CONSECUENCIA humanitaria?"],
    techniqueTip: "Distingue causas (lo que originó) de consecuencias (lo que resultó). 'Afectó a 7 millones' es un resultado."
  },
  { id: "soc_04", category: "SOCIALES", difficulty: "medium", competency: "SOC_PENSAMIENTO_SISTEMICO",
    passageGroup: "conflicto_armado",
    context: PASSAGES.CONFLICTO_ARMADO,
    text: "El texto sugiere que para lograr una paz duradera se necesita:",
    options: [
      { id: "A", text: "Solo que las guerrillas dejen las armas" },
      { id: "B", text: "Más gasto militar para eliminar a todos los grupos armados" },
      { id: "C", text: "Transformar las causas estructurales: desigualdad, exclusión política y concentración de tierra" },
      { id: "D", text: "Olvidar el pasado y empezar de cero" }
    ],
    correctId: "C", explanation: "El texto afirma que 'la construcción de una paz estable requiere la transformación de las condiciones estructurales': desigualdad, exclusión política y concentración de tierra.",
    socraticHints: ["Lee el último párrafo. ¿Qué dice que se necesita ADEMÁS del silencio de las armas?", "¿Cuáles son las 'condiciones estructurales' que menciona?"],
    techniqueTip: "Pensamiento sistémico: busca las causas profundas (estructurales), no solo los síntomas superficiales."
  },

  // ── Preguntas independientes de Sociales ──
  { id: "soc_05", category: "SOCIALES", difficulty: "easy", competency: "SOC_PENSAMIENTO_SOCIAL",
    text: "Los tres poderes del Estado colombiano son:",
    options: [
      { id: "A", text: "Presidente, Gobernador y Alcalde" },
      { id: "B", text: "Ejecutivo, Legislativo y Judicial" },
      { id: "C", text: "Senado, Cámara y Congreso" },
      { id: "D", text: "Fiscal, Procurador y Contralor" }
    ],
    correctId: "B", explanation: "La Constitución de 1991 establece tres ramas del poder público: Ejecutiva (Presidente), Legislativa (Congreso) y Judicial (Tribunales).",
    socraticHints: ["¿Quién hace las leyes? ¿Quién las ejecuta? ¿Quién juzga si se cumplen?"],
    techniqueTip: "Ejecutivo=gobierna., Legislativo=hace leyes. Judicial=juzga. Son independientes pero colaboran."
  },
  { id: "soc_06", category: "SOCIALES", difficulty: "easy", competency: "SOC_PENSAMIENTO_SOCIAL",
    text: "La tutela en Colombia es un mecanismo para:",
    options: [
      { id: "A", text: "Declarar inconstitucional una ley" },
      { id: "B", text: "Proteger los derechos fundamentales de una persona cuando son amenazados o vulnerados" },
      { id: "C", text: "Elegir al presidente de la República" },
      { id: "D", text: "Crear nuevos impuestos" }
    ],
    correctId: "B", explanation: "La acción de tutela (Art. 86 de la Constitución) protege los derechos fundamentales de forma inmediata cuando son vulnerados o amenazados.",
    socraticHints: ["Si te niegan un servicio de salud urgente, ¿qué acción legal puedes usar?"],
    techniqueTip: "La tutela es rápida (10 días), protege derechos FUNDAMENTALES y cualquier persona puede interponerla."
  },
  { id: "soc_07", category: "SOCIALES", difficulty: "medium", competency: "SOC_PENSAMIENTO_SOCIAL",
    text: "¿Qué es la democracia participativa?",
    options: [
      { id: "A", text: "Un sistema donde solo los políticos toman decisiones" },
      { id: "B", text: "Un sistema donde los ciudadanos solo votan cada 4 años" },
      { id: "C", text: "Un sistema donde los ciudadanos pueden participar directamente en decisiones políticas mediante mecanismos como referendos, consultas populares y revocatoria del mandato" },
      { id: "D", text: "Un sistema donde el ejército gobierna" }
    ],
    correctId: "C", explanation: "La Constitución de 1991 define a Colombia como una democracia participativa, no solo representativa. Los ciudadanos pueden participar directamente.",
    socraticHints: ["¿'Participativa' viene de 'participar'. ¿Quiénes participan?", "¿Solo se participa votando o hay otras formas?"],
    techniqueTip: "Democracia representativa= votar por representantes. Participativa= además, participar directamente (referendo, cabildo abierto, etc.)."
  },
  { id: "soc_08", category: "SOCIALES", difficulty: "hard", competency: "SOC_PENSAMIENTO_SISTEMICO",
    text: "La globalización económica ha producido en países como Colombia:",
    options: [
      { id: "A", text: "Solo beneficios: más empleo y mejores salarios para todos" },
      { id: "B", text: "Solo perjuicios: destrucción total de la industria nacional" },
      { id: "C", text: "Efectos mixtos: acceso a mercados internacionales pero también mayor competencia que ha afectado a sectores como la agricultura y la manufactura local" },
      { id: "D", text: "Ningún efecto significativo" }
    ],
    correctId: "C", explanation: "La globalización tiene efectos complejos: abre mercados pero expone a la competencia internacional. La agricultura colombiana, por ejemplo, se vio afectada por importaciones más baratas.",
    socraticHints: ["¿Es posible que algo sea 100% bueno o 100% malo?", "¿Los campesinos colombianos se beneficiaron igual que los exportadores?"],
    techniqueTip: "En Sociales, las respuestas extremas ('solo beneficios' o 'solo perjuicios') casi nunca son correctas. Busca matices."
  },
  { id: "soc_09", category: "SOCIALES", difficulty: "easy", competency: "SOC_INTERPRETACION_FUENTES",
    text: "¿Qué evento histórico se conmemora el 7 de agosto en Colombia?",
    options: [
      { id: "A", text: "El Grito de Independencia" },
      { id: "B", text: "La Batalla de Boyacá que selló la independencia de Colombia" },
      { id: "C", text: "La fundación de Bogotá" },
      { id: "D", text: "La Constitución de 1991" }
    ],
    correctId: "B", explanation: "El 7 de agosto de 1819 se libró la Batalla de Boyacá, donde Simón Bolívar derrotó a las tropas españolas y selló la independencia de la Nueva Granada.",
    socraticHints: ["El 20 de julio es el Grito de Independencia. ¿Qué otra fecha patria tiene Colombia?"],
    techniqueTip: "20 de julio 1810 = Grito de Independencia (INICIO). 7 de agosto 1819 = Batalla de Boyacá (CONSOLIDACIÓN)."
  },
  { id: "soc_10", category: "SOCIALES", difficulty: "medium", competency: "SOC_PENSAMIENTO_SISTEMICO",
    text: "Un caso: Una comunidad indígena se opone a la construcción de una represa en su territorio ancestral. La empresa argumenta que generará empleo y energía limpia. Desde los derechos humanos, lo correcto sería:",
    options: [
      { id: "A", text: "Construir la represa sin consultar a la comunidad porque el progreso es más importante" },
      { id: "B", text: "Realizar una consulta previa, libre e informada con la comunidad, respetando su derecho al territorio" },
      { id: "C", text: "Trasladar a la comunidad sin su consentimiento" },
      { id: "D", text: "Ignorar a la comunidad porque son minoría" }
    ],
    correctId: "B", explanation: "La consulta previa es un derecho fundamental de las comunidades étnicas reconocido por la Constitución (Art. 330) y el Convenio 169 de la OIT.",
    socraticHints: ["¿Los pueblos indígenas tienen derechos sobre su territorio?", "¿Se puede tomar una decisión que los afecta sin preguntarles?"],
    techniqueTip: "Consulta previa = derecho de comunidades étnicas a ser consultadas antes de proyectos que afecten su territorio."
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║     🔬 CIENCIAS NATURALES — Nivel Validación         ║
  // ╚══════════════════════════════════════════════════════╝

  // ── Pasaje: Experimento de germinación ──
  { id: "cie_01", category: "CIENCIAS", difficulty: "medium", competency: "CIE_INDAGACION",
    passageGroup: "experimento_germinacion",
    context: PASSAGES.ARTICULO_CIENTIFICO,
    text: "¿Cuál es la variable independiente en este experimento?",
    options: [
      { id: "A", text: "El número de semillas que germinaron" },
      { id: "B", text: "La temperatura a la que se expusieron los grupos" },
      { id: "C", text: "El tipo de semilla utilizada" },
      { id: "D", text: "La cantidad de agua proporcionada" }
    ],
    correctId: "B", explanation: "La variable independiente es la que el investigador CAMBIA deliberadamente: la temperatura (15°C, 25°C, 35°C). La germinación es la variable dependiente (lo que se MIDE).",
    socraticHints: ["¿Qué cambió intencionalmente entre los tres grupos?", "¿La temperatura fue diferente o igual en cada grupo?"],
    techniqueTip: "Variable independiente = lo que el investigador CAMBIA. Variable dependiente = lo que MIDE. Variables controladas = lo que mantiene IGUAL."
  },
  { id: "cie_02", category: "CIENCIAS", difficulty: "hard", competency: "CIE_EXPLICACION",
    passageGroup: "experimento_germinacion",
    context: PASSAGES.ARTICULO_CIENTIFICO,
    text: "¿Por qué los investigadores mantuvieron iguales las condiciones de humedad y luz en los tres grupos?",
    options: [
      { id: "A", text: "Para ahorrar recursos del laboratorio" },
      { id: "B", text: "Para controlar variables y asegurar que solo la temperatura explique las diferencias en germinación" },
      { id: "C", text: "Porque la humedad y la luz no afectan la germinación" },
      { id: "D", text: "Fue una coincidencia del diseño experimental" }
    ],
    correctId: "B", explanation: "Controlar las variables (mantener iguales humedad y luz) asegura que cualquier diferencia en los resultados se deba SOLO a la variable que se está probando: la temperatura.",
    socraticHints: ["Si también cambiaras la luz, ¿sabrías si el efecto es de la temperatura o de la luz?", "¿Por qué en un experimento se cambia UNA sola cosa a la vez?"],
    techniqueTip: "Variables controladas = se mantienen iguales para que el resultado dependa SOLO de la variable independiente. Es la base del método científico."
  },
  { id: "cie_03", category: "CIENCIAS", difficulty: "medium", competency: "CIE_USO_COMPRENSIVO",
    passageGroup: "experimento_germinacion",
    context: PASSAGES.ARTICULO_CIENTIFICO,
    text: "Según los resultados, ¿cuál es la temperatura óptima para la germinación del frijol?",
    options: [
      { id: "A", text: "15°C porque es la más natural" },
      { id: "B", text: "35°C porque el calor acelera todos los procesos" },
      { id: "C", text: "25°C porque tuvo la mayor tasa de germinación (9/10) y el menor tiempo promedio (3.1 días)" },
      { id: "D", text: "No se puede determinar con estos datos" }
    ],
    correctId: "C", explanation: "A 25°C: 9 de 10 germinaron (90%) en promedio 3.1 días. Es claramente la mejor combinación de tasa y velocidad de germinación.",
    socraticHints: ["¿En cuál grupo germinaron MÁS semillas?", "¿En cuál grupo fue MÁS RÁPIDO?"],
    techniqueTip: "La temperatura 'óptima' es donde se obtiene el MEJOR resultado, no la más alta ni la más baja."
  },

  // ── Preguntas independientes de Ciencias ──
  { id: "cie_04", category: "CIENCIAS", difficulty: "easy", competency: "CIE_USO_COMPRENSIVO",
    text: "La fotosíntesis es un proceso mediante el cual las plantas:",
    options: [
      { id: "A", text: "Respiran oxígeno y liberan dióxido de carbono" },
      { id: "B", text: "Absorben luz solar, CO₂ y agua para producir glucosa y liberar oxígeno" },
      { id: "C", text: "Absorben nutrientes del suelo exclusivamente" },
      { id: "D", text: "Producen semillas y frutos" }
    ],
    correctId: "B", explanation: "Fotosíntesis: CO₂ + H₂O + Luz → Glucosa + O₂. Las plantas usan energía solar para convertir CO₂ y agua en alimento (glucosa), liberando oxígeno.",
    socraticHints: ["'Foto' = luz, 'síntesis' = crear/unir. ¿Qué crean las plantas usando la luz?", "¿De dónde viene el oxígeno que respiramos?"],
    techniqueTip: "Fotosíntesis = proceso de nutrición de las plantas. Respiración = proceso contrario (consume O₂, libera CO₂). NO son lo mismo."
  },
  { id: "cie_05", category: "CIENCIAS", difficulty: "easy", competency: "CIE_USO_COMPRENSIVO",
    text: "El agua hierve a:",
    options: [
      { id: "A", text: "50°C" },
      { id: "B", text: "100°C al nivel del mar" },
      { id: "C", text: "0°C" },
      { id: "D", text: "200°C" }
    ],
    correctId: "B", explanation: "El punto de ebullición del agua es 100°C a presión atmosférica normal (nivel del mar). A mayor altitud, hierve a menor temperatura.",
    socraticHints: ["¿A cuántos grados se congela el agua? ¿Y a cuántos hierve?"],
    techniqueTip: "Agua: se congela a 0°C, hierve a 100°C (al nivel del mar). En Bogotá (2.600m) hierve a ~92°C por la altitud."
  },
  { id: "cie_06", category: "CIENCIAS", difficulty: "medium", competency: "CIE_EXPLICACION",
    text: "Si una especie de insecto desarrolla resistencia a un pesticida después de varias generaciones, esto se explica por:",
    options: [
      { id: "A", text: "Los insectos aprenden a evitar el pesticida" },
      { id: "B", text: "Selección natural: los individuos con mutaciones que los hacen resistentes sobreviven y se reproducen más" },
      { id: "C", text: "El pesticida se hace más débil con el tiempo" },
      { id: "D", text: "Los insectos deciden cambiar su ADN" }
    ],
    correctId: "B", explanation: "La selección natural explica que los pocos insectos con una variación genética que les da resistencia sobreviven, se reproducen, y sus descendientes heredan esa resistencia.",
    socraticHints: ["¿Todos los insectos son idénticos genéticamente?", "Si aplicas un pesticida y mueren el 99%, el 1% que sobrevive tiene algo diferente. ¿Qué pasa cuando ese 1% se reproduce?"],
    techniqueTip: "Selección natural: variación genética + presión ambiental = los más aptos sobreviven y transmiten sus genes."
  },
  { id: "cie_07", category: "CIENCIAS", difficulty: "hard", competency: "CIE_INDAGACION",
    text: "Un estudiante quiere probar si la música afecta el crecimiento de las plantas. ¿Cuál sería el diseño experimental CORRECTO?",
    options: [
      { id: "A", text: "Poner música a una planta y ver si crece" },
      { id: "B", text: "Tener dos grupos de plantas idénticas con las mismas condiciones, pero solo uno expuesto a música, y medir el crecimiento de ambos durante varias semanas" },
      { id: "C", text: "Preguntar a un experto si la música afecta a las plantas" },
      { id: "D", text: "Poner diferentes tipos de música a diferentes tipos de plantas" }
    ],
    correctId: "B", explanation: "El diseño correcto necesita: grupo experimental (con música) y grupo control (sin música), mismas condiciones, mediciones cuantitativas y repeticiones.",
    socraticHints: ["¿Cómo sabes si el crecimiento se debe a la música o a otro factor?", "Necesitas un grupo de comparación (control). ¿Cuál sería?"],
    techniqueTip: "Diseño experimental: 1) Grupo experimental + Grupo control. 2) Solo UNA variable diferente. 3) Mediciones objetivas. 4) Varias repeticiones."
  },
  { id: "cie_08", category: "CIENCIAS", difficulty: "easy", competency: "CIE_USO_COMPRENSIVO",
    text: "¿Cuál de los siguientes es un recurso natural NO renovable?",
    options: [
      { id: "A", text: "La energía solar" },
      { id: "B", text: "El viento" },
      { id: "C", text: "El petróleo" },
      { id: "D", text: "Los bosques" }
    ],
    correctId: "C", explanation: "El petróleo tarda millones de años en formarse, por lo que a escala humana no se regenera. Solar, viento y bosques (si se manejan bien) son renovables.",
    socraticHints: ["¿Cuánto tarda en formarse el petróleo?", "'No renovable' = no se regenera en un tiempo útil para la humanidad."],
    techniqueTip: "No renovables: petróleo, gas natural, carbón, minerales. Renovables: sol, viento, agua, biomasa."
  },
  { id: "cie_09", category: "CIENCIAS", difficulty: "medium", competency: "CIE_EXPLICACION",
    text: "La Tierra tiene estaciones (verano, invierno, etc.) debido a:",
    options: [
      { id: "A", text: "La distancia entre la Tierra y el Sol cambia durante el año" },
      { id: "B", text: "La inclinación del eje terrestre respecto al plano de su órbita" },
      { id: "C", text: "La rotación de la Tierra sobre sí misma" },
      { id: "D", text: "Las fases de la Luna" }
    ],
    correctId: "B", explanation: "La inclinación de 23.5° del eje terrestre hace que durante el año, diferentes hemisferios reciban más o menos radiación solar directa, causando las estaciones.",
    socraticHints: ["Si la Tierra no estuviera inclinada, ¿habría estaciones?", "¿Por qué cuando es verano en Colombia es invierno en Argentina?"],
    techniqueTip: "Estaciones → inclinación del eje. Día/noche → rotación. Año → traslación. Mareas → Luna."
  },
  { id: "cie_10", category: "CIENCIAS", difficulty: "hard", competency: "CIE_INDAGACION",
    text: "En un laboratorio se mide el pH de cuatro sustancias: A=2, B=7, C=9, D=13. ¿Cuál sustancia es un ácido fuerte?",
    options: [
      { id: "A", text: "Sustancia A (pH=2)" },
      { id: "B", text: "Sustancia B (pH=7)" },
      { id: "C", text: "Sustancia C (pH=9)" },
      { id: "D", text: "Sustancia D (pH=13)" }
    ],
    correctId: "A", explanation: "pH < 7 = ácido. pH = 7 = neutro. pH > 7 = base (alcalino). pH=2 es un ácido fuerte (como el jugo gástrico). pH=13 es una base fuerte (como la lejía).",
    socraticHints: ["¿Qué significa un pH bajo?", "La escala va de 0 (muy ácido) a 14 (muy básico). ¿Dónde está el neutro?"],
    techniqueTip: "pH: 0-6=ácido, 7=neutro, 8-14=básico. Más lejos del 7 = más fuerte. Ejemplos: limón≈2, agua=7, jabón≈10."
  },
  { id: "cie_11", category: "CIENCIAS", difficulty: "medium", competency: "CIE_USO_COMPRENSIVO",
    text: "En una cadena alimentaria: Pasto → Vaca → Humano, la vaca es un:",
    options: [
      { id: "A", text: "Productor" },
      { id: "B", text: "Consumidor primario (herbívoro)" },
      { id: "C", text: "Consumidor secundario (carnívoro)" },
      { id: "D", text: "Descomponedor" }
    ],
    correctId: "B", explanation: "La vaca se alimenta directamente del productor (pasto). Es consumidor primario = herbívoro. El humano, al comer la vaca, es consumidor secundario.",
    socraticHints: ["¿De qué se alimenta la vaca?", "Si come directamente del productor (planta), ¿es consumidor primario o secundario?"],
    techniqueTip: "Productor=planta. Consumidor 1°=come plantas. Consumidor 2°=come herbívoros. Consumidor 3°=come carnívoros."
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║     🇬🇧 INGLÉS — Nivel Validación (A1, A2, B1)      ║
  // ╚══════════════════════════════════════════════════════╝

  // ── Pasaje: Email corporativo ──
  { id: "eng_01", category: "INGLES", difficulty: "medium", competency: "ENG_A2",
    passageGroup: "english_email",
    context: PASSAGES.ENGLISH_EMAIL,
    text: "According to the email, how many days per week must employees work from the office?",
    options: [
      { id: "A", text: "Five days" },
      { id: "B", text: "Two days" },
      { id: "C", text: "Three days (Tuesday, Wednesday, Thursday)" },
      { id: "D", text: "It depends on the department" }
    ],
    correctId: "C", explanation: "The email states: 'employees will be required to work from the office at least three days per week (Tuesday, Wednesday, and Thursday)'.",
    socraticHints: ["Look for the words 'required' and 'at least'. What number follows?", "Which specific days are mentioned?"],
    techniqueTip: "En comprensión lectora en inglés, busca las palabras clave de la pregunta ('how many days') en el texto."
  },
  { id: "eng_02", category: "INGLES", difficulty: "hard", competency: "ENG_B1",
    passageGroup: "english_email",
    context: PASSAGES.ENGLISH_EMAIL,
    text: "What should employees do if they have concerns about the new policy?",
    options: [
      { id: "A", text: "Talk to Sarah Johnson directly" },
      { id: "B", text: "Quit their job" },
      { id: "C", text: "Contact Human Resources before the end of the week" },
      { id: "D", text: "Send an email to all staff" }
    ],
    correctId: "C", explanation: "'If you have concerns or need special accommodations, please contact Human Resources before the end of this week.'",
    socraticHints: ["Find the paragraph that starts with 'We understand...'", "'Concerns' = preocupaciones. ¿A quién deben contactar?"],
    techniqueTip: "Para 'what should...' questions, busca instrucciones o recomendaciones en el texto (verbos como 'please contact', 'should', 'must')."
  },

  // ── Preguntas independientes de Inglés ──
  { id: "eng_03", category: "INGLES", difficulty: "easy", competency: "ENG_A1",
    text: "Choose the correct option: 'She _____ to school every day.'",
    options: [
      { id: "A", text: "go" },
      { id: "B", text: "goes" },
      { id: "C", text: "going" },
      { id: "D", text: "gone" }
    ],
    correctId: "B", explanation: "'She' es tercera persona singular. En presente simple, se agrega -s o -es al verbo: she goes. (He/She/It goes)",
    socraticHints: ["'She' es él/ella. ¿Qué pasa con el verbo en presente simple para he/she/it?", "I go, you go, he/she...?"],
    techniqueTip: "Presente simple con He/She/It: agrega -s (works), -es (goes, watches), -ies (studies, cries)."
  },
  { id: "eng_04", category: "INGLES", difficulty: "easy", competency: "ENG_A1",
    text: "What is the opposite of 'expensive'?",
    options: [
      { id: "A", text: "Beautiful" },
      { id: "B", text: "Cheap" },
      { id: "C", text: "Large" },
      { id: "D", text: "Fast" }
    ],
    correctId: "B", explanation: "Expensive = costoso/caro. Cheap = barato/económico. Son antónimos.",
    socraticHints: ["Expensive = caro. ¿Cuál es lo contrario de caro?"],
    techniqueTip: "Antónimos comunes: expensive/cheap, big/small, hot/cold, fast/slow, old/new, happy/sad."
  },
  { id: "eng_05", category: "INGLES", difficulty: "medium", competency: "ENG_A2",
    text: "Complete: 'I _____ dinner when the phone rang.'",
    options: [
      { id: "A", text: "was cooking" },
      { id: "B", text: "cooked" },
      { id: "C", text: "am cooking" },
      { id: "D", text: "have cooked" }
    ],
    correctId: "A", explanation: "Pasado continuo (was cooking) + past simple (rang). Una acción en progreso fue interrumpida por otra. 'I was cooking when the phone rang.'",
    socraticHints: ["¿La acción de cocinar estaba en progreso cuando el teléfono sonó?", "Si una acción larga es interrumpida, ¿qué tiempo verbal usas para la acción larga?"],
    techniqueTip: "Past Continuous (was/were + -ing) = acción en progreso en el pasado. Se usa cuando una acción interrumpe otra."
  },
  { id: "eng_06", category: "INGLES", difficulty: "medium", competency: "ENG_A2",
    text: "Which sentence is correct?",
    options: [
      { id: "A", text: "There is many students in the classroom." },
      { id: "B", text: "There are many students in the classroom." },
      { id: "C", text: "There be many students in the classroom." },
      { id: "D", text: "There have many students in the classroom." }
    ],
    correctId: "B", explanation: "'Students' es plural, por lo tanto se usa 'There are' (hay - plural). 'There is' se usa con singular.",
    socraticHints: ["'Students' es plural o singular?", "There is + singular. There are + plural."],
    techniqueTip: "There is + sustantivo singular (There is a book). There are + sustantivo plural (There are books)."
  },
  { id: "eng_07", category: "INGLES", difficulty: "hard", competency: "ENG_B1",
    text: "Choose the correct sentence in reported speech: Direct: 'I will call you tomorrow,' John said.",
    options: [
      { id: "A", text: "John said that he will call me tomorrow." },
      { id: "B", text: "John said that he would call me the next day." },
      { id: "C", text: "John said that he called me tomorrow." },
      { id: "D", text: "John said that he calls me the next day." }
    ],
    correctId: "B", explanation: "Reported speech: will → would, tomorrow → the next day, I → he, you → me. 'John said that he would call me the next day.'",
    socraticHints: ["En reported speech, los tiempos verbales 'retroceden'. ¿Qué pasa con 'will'?", "'Tomorrow' cambia a 'the next day' en reported speech."],
    techniqueTip: "Reported Speech: will→would, can→could, am/is→was, tomorrow→the next day, here→there, this→that."
  },
  { id: "eng_08", category: "INGLES", difficulty: "easy", competency: "ENG_A1",
    text: "Read the sign: 'NO SMOKING ALLOWED.' This means:",
    options: [
      { id: "A", text: "You can smoke here" },
      { id: "B", text: "Smoking is not permitted in this area" },
      { id: "C", text: "Buy cigarettes here" },
      { id: "D", text: "Smoking is healthy" }
    ],
    correctId: "B", explanation: "'No smoking allowed' = No se permite fumar. Es una prohibición.",
    socraticHints: ["'No' = negación. 'Allowed' = permitido. ¿Qué NO está permitido?"],
    techniqueTip: "'No + gerund + allowed' es una estructura de prohibición: No swimming allowed = No se permite nadar."
  },
  { id: "eng_09", category: "INGLES", difficulty: "hard", competency: "ENG_B1",
    context: "Read: 'Despite facing numerous obstacles, including poverty and discrimination, Malala Yousafzai continued to fight for girls' education. Her courage inspired millions around the world.'",
    text: "The word 'despite' in this context means:",
    options: [
      { id: "A", text: "Because of" },
      { id: "B", text: "In addition to" },
      { id: "C", text: "Even though / In spite of" },
      { id: "D", text: "Without" }
    ],
    correctId: "C", explanation: "'Despite' = a pesar de. Indica que algo sucedió A PESAR de obstáculos. Es sinónimo de 'in spite of' y similar a 'even though'.",
    socraticHints: ["¿Malala se detuvo por los obstáculos o continuó A PESAR de ellos?", "'Despite' introduce algo que podría haber impedido algo, pero no lo hizo."],
    techniqueTip: "Despite/In spite of + sustantivo. Although/Even though + oración completa. Ambos expresan contraste/concesión."
  },
  { id: "eng_10", category: "INGLES", difficulty: "medium", competency: "ENG_A2",
    text: "Select the correct question: '_____ do you go to the gym?'",
    options: [
      { id: "A", text: "How many" },
      { id: "B", text: "How often" },
      { id: "C", text: "How much" },
      { id: "D", text: "How long" }
    ],
    correctId: "B", explanation: "'How often' pregunta por frecuencia (¿Con qué frecuencia?). Respuestas esperadas: every day, twice a week, never, etc.",
    socraticHints: ["La pregunta es sobre ir al gimnasio. ¿Te preguntan cuántas veces o cuánto pesas?", "'Often' = frecuentemente. 'How often' = ¿con qué frecuencia?"],
    techniqueTip: "How often=frecuencia, How many=cantidad contable, How much=cantidad incontable/precio, How long=duración."
  },
  { id: "eng_11", category: "INGLES", difficulty: "easy", competency: "ENG_A1",
    text: "What time is it? The clock shows 3:45.",
    options: [
      { id: "A", text: "It's three forty-five / a quarter to four" },
      { id: "B", text: "It's four forty-five" },
      { id: "C", text: "It's three fifteen" },
      { id: "D", text: "It's half past three" }
    ],
    correctId: "A", explanation: "3:45 = three forty-five = a quarter to four (un cuarto para las cuatro). Half past three sería 3:30.",
    socraticHints: ["3:45 = faltan 15 minutos para las 4. 'A quarter' = 15 minutos."],
    techniqueTip: "Quarter past = :15. Half past = :30. Quarter to = :45. O'clock = :00."
  },
];
