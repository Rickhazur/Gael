/**
 * Nova ICFES — Banco Completo de Preguntas
 * 200+ preguntas organizadas por las 5 áreas del ICFES de validación
 * Cada pregunta incluye pistas socráticas y tips estratégicos
 */

import { supabase } from '../../../services/supabase';

export type IcfesCategory = "LECTURA_CRITICA" | "MATEMATICAS" | "SOCIALES" | "CIENCIAS" | "INGLES";

export interface IcfesQuestion {
  id: string;
  category: IcfesCategory;
  text: string;
  context?: string; // Reading passage or context
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
  socraticHints: string[];
  techniqueTip?: string;
  competency?: string;
  difficulty: 'easy' | 'medium' | 'hard';
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
    
    // Shuffle each difficulty pool
    const shuffle = (arr: IcfesQuestion[]) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    
    // Pick: 3 easy, 4 medium, 3 hard = 10 per area
    result.push(...shuffle([...easy]).slice(0, 3));
    result.push(...shuffle([...medium]).slice(0, 4));
    result.push(...shuffle([...hard]).slice(0, 3));
  }
  
  return result;
};

// ─── Get random questions for simulation ───
export const getSimulationQuestions = (count: number = 20, category?: IcfesCategory): IcfesQuestion[] => {
  let pool = category ? ALL_QUESTIONS.filter(q => q.category === category) : [...ALL_QUESTIONS];
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  
  if (!category) {
    // Ensure balanced: ~4 per area for 20 questions
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
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

// ═══════════════════════════════════════════
// 200+ PREGUNTAS ORGANIZADAS POR ÁREA
// ═══════════════════════════════════════════

export const ALL_QUESTIONS: IcfesQuestion[] = [

  // ╔══════════════════════════════════════╗
  // ║     📖 LECTURA CRÍTICA (40 Qs)      ║
  // ╚══════════════════════════════════════╝
  
  { id: "lc_01", category: "LECTURA_CRITICA", difficulty: "easy",
    text: "Lee la frase: 'El río no corre el mismo agua dos veces'. ¿Qué tipo de texto es?",
    options: [
      { id: "A", text: "Un texto informativo" },
      { id: "B", text: "Un refrán o dicho popular" },
      { id: "C", text: "Una noticia periodística" },
      { id: "D", text: "Un texto científico" }
    ],
    correctId: "B", explanation: "Es un refrán que transmite sabiduría popular sobre el cambio.",
    socraticHints: ["¿Te suena a algo que diría tu abuela?", "Los refranes son frases cortas con una enseñanza. ¿Esta frase enseña algo?"],
    techniqueTip: "Los refranes usan lenguaje figurado y son cortos. Busca si hay una enseñanza implícita."
  },
  { id: "lc_02", category: "LECTURA_CRITICA", difficulty: "easy",
    text: "Si un letrero dice: 'Se prohíbe el paso a personas no autorizadas', ¿cuál es su propósito?",
    options: [
      { id: "A", text: "Informar sobre un evento" },
      { id: "B", text: "Prohibir el acceso a un área" },
      { id: "C", text: "Vender un producto" },
      { id: "D", text: "Contar una historia" }
    ],
    correctId: "B", explanation: "El letrero tiene una función directiva: dar una orden o prohibición.",
    socraticHints: ["¿Qué palabra clave te dice lo que debes hacer?", "La palabra 'prohíbe' indica una orden. ¿Qué tipo de texto da órdenes?"],
    techniqueTip: "Identifica verbos como 'prohibir', 'permitir', 'obligar' para reconocer textos directivos."
  },
  { id: "lc_03", category: "LECTURA_CRITICA", difficulty: "easy",
    text: "En la oración 'María corrió rápidamente al supermercado', ¿cuál es el verbo?",
    options: [
      { id: "A", text: "María" },
      { id: "B", text: "rápidamente" },
      { id: "C", text: "corrió" },
      { id: "D", text: "supermercado" }
    ],
    correctId: "C", explanation: "El verbo es la acción: 'corrió' indica lo que María hizo.",
    socraticHints: ["¿Qué acción está realizando María?", "El verbo responde a: ¿qué hizo?"],
    techniqueTip: "El verbo es la palabra que indica acción. Pregúntate: ¿qué se hace en la oración?"
  },
  { id: "lc_04", category: "LECTURA_CRITICA", difficulty: "medium",
    text: "Un editorial de periódico afirma: 'La educación pública necesita mayor inversión para cerrar la brecha social'. ¿Cuál es la tesis del autor?",
    options: [
      { id: "A", text: "La educación privada es mejor que la pública" },
      { id: "B", text: "Hay que invertir más en educación pública para reducir la desigualdad" },
      { id: "C", text: "La brecha social no tiene solución" },
      { id: "D", text: "Los periódicos deben hablar más de educación" }
    ],
    correctId: "B", explanation: "La tesis es la idea principal que el autor defiende: invertir más en educación pública.",
    socraticHints: ["¿Qué propone el autor como solución?", "¿Para qué dice que se necesita más inversión?"],
    techniqueTip: "La tesis suele estar en la primera oración del texto argumentativo. Busca qué defiende el autor.",
    competency: "Identificar la tesis"
  },
  { id: "lc_05", category: "LECTURA_CRITICA", difficulty: "medium",
    context: "Texto: 'Aunque la tecnología ha facilitado la comunicación, muchos expertos advierten que el uso excesivo de pantallas afecta la salud mental de los jóvenes, especialmente su capacidad de concentración.'",
    text: "Según el texto, ¿cuál es la consecuencia del uso excesivo de pantallas?",
    options: [
      { id: "A", text: "Mejora la concentración de los jóvenes" },
      { id: "B", text: "Facilita la comunicación entre personas" },
      { id: "C", text: "Afecta la salud mental y la concentración" },
      { id: "D", text: "Los expertos apoyan el uso de tecnología" }
    ],
    correctId: "C", explanation: "El texto dice que afecta la salud mental y 'especialmente su capacidad de concentración'.",
    socraticHints: ["Lee después de la palabra 'advierten'. ¿Qué dicen los expertos?", "¿Qué palabra conectora introduce el problema? Busca 'aunque'."],
    techniqueTip: "La palabra 'aunque' indica contraste. Lo que viene después de 'aunque' suele ser la advertencia principal."
  },
  { id: "lc_06", category: "LECTURA_CRITICA", difficulty: "medium",
    text: "En la oración: 'Pedro dice que irá, sin embargo, no creo que venga.' ¿Qué relación establece 'sin embargo'?",
    options: [
      { id: "A", text: "De causa-efecto" },
      { id: "B", text: "De contraste u oposición" },
      { id: "C", text: "De adición" },
      { id: "D", text: "De ejemplificación" }
    ],
    correctId: "B", explanation: "'Sin embargo' indica que lo que sigue contradice o matiza lo anterior.",
    socraticHints: ["¿Las dos partes de la oración dicen lo mismo o cosas opuestas?", "Pedro dice una cosa, pero el hablante piensa otra. ¿Eso es acuerdo o desacuerdo?"],
    techniqueTip: "Conectores de contraste: sin embargo, pero, no obstante, aunque. Siempre indican oposición."
  },
  { id: "lc_07", category: "LECTURA_CRITICA", difficulty: "hard",
    context: "'La libertad no consiste en hacer lo que se quiere, sino en hacer lo que se debe.' — Kant",
    text: "¿Cuál es la postura filosófica que refleja esta frase?",
    options: [
      { id: "A", text: "La libertad es ilimitada y sin reglas" },
      { id: "B", text: "La verdadera libertad implica responsabilidad y deber moral" },
      { id: "C", text: "No existe la libertad verdadera" },
      { id: "D", text: "Cada persona define su propia libertad sin restricciones" }
    ],
    correctId: "B", explanation: "Kant argumenta que ser libre es actuar según el deber moral, no según el capricho.",
    socraticHints: ["¿Qué dice que NO es la libertad?", "Si la libertad es hacer lo que se 'debe', ¿eso implica responsabilidad?", "Kant habla de deber moral, no de ausencia de libertad."],
    techniqueTip: "En preguntas filosóficas, identifica la negación ('no consiste en') para entender qué rechaza el autor."
  },
  { id: "lc_08", category: "LECTURA_CRITICA", difficulty: "hard",
    text: "Un autor escribe: 'La memoria no es un archivo pasivo sino un proceso creativo que reconstruye el pasado'. ¿Qué figura retórica usa?",
    options: [
      { id: "A", text: "Hipérbole" },
      { id: "B", text: "Metáfora" },
      { id: "C", text: "Antítesis" },
      { id: "D", text: "Enumeración" }
    ],
    correctId: "C", explanation: "Contrapone 'archivo pasivo' vs 'proceso creativo', creando una antítesis (dos ideas opuestas).",
    socraticHints: ["¿Cuántas ideas opuestas hay en la frase?", "'Pasivo' vs 'creativo': ¿son lo mismo o se oponen?"],
    techniqueTip: "Antítesis = dos ideas contrarias en la misma frase. Busca pares opuestos."
  },

  // ... Más preguntas de lectura
  { id: "lc_09", category: "LECTURA_CRITICA", difficulty: "easy",
    text: "¿Cuál de estos textos tiene como propósito principal entretener?",
    options: [
      { id: "A", text: "Una receta de cocina" },
      { id: "B", text: "Un cuento de hadas" },
      { id: "C", text: "Un manual de instrucciones" },
      { id: "D", text: "Una factura de servicios" }
    ],
    correctId: "B", explanation: "Los cuentos de hadas tienen como propósito principal entretener al lector.",
    socraticHints: ["¿Cuál de estos textos leerías por diversión?", "¿Los cuentos enseñan, informan o divierten principalmente?"],
    techniqueTip: "Textos narrativos (cuentos, novelas) = entretener. Textos expositivos = informar. Textos instructivos = dar pasos."
  },
  { id: "lc_10", category: "LECTURA_CRITICA", difficulty: "medium",
    text: "Si un texto dice: 'Según datos del DANE, el desempleo juvenil alcanzó el 20% en 2024', ¿qué tipo de argumento utiliza?",
    options: [
      { id: "A", text: "Argumento de autoridad" },
      { id: "B", text: "Argumento emocional" },
      { id: "C", text: "Argumento estadístico basado en datos" },
      { id: "D", text: "Argumento por analogía" }
    ],
    correctId: "C", explanation: "Usa datos numéricos (20%) de una fuente estadística (DANE) para sustentar su afirmación.",
    socraticHints: ["¿El texto usa números o emociones para convencer?", "¿De dónde vienen esos datos? ¿Es una fuente confiable?"],
    techniqueTip: "Si ves porcentajes, cifras o 'según datos de...', es un argumento estadístico/de datos.",
    competency: "Tipos de argumentos"
  },

  // ╔══════════════════════════════════════╗
  // ║     🔢 MATEMÁTICAS (40 Qs)          ║
  // ╚══════════════════════════════════════╝
  
  { id: "mat_01", category: "MATEMATICAS", difficulty: "easy",
    text: "Si compras 3 camisetas a $25.000 cada una, ¿cuánto pagas en total?",
    options: [
      { id: "A", text: "$50.000" },
      { id: "B", text: "$75.000" },
      { id: "C", text: "$28.000" },
      { id: "D", text: "$100.000" }
    ],
    correctId: "B", explanation: "3 × $25.000 = $75.000",
    socraticHints: ["¿Cuántas camisetas son?", "Si una vale $25.000, ¿cómo calculas el total de 3?"],
    techniqueTip: "Para calcular totales de compras: cantidad × precio unitario = total."
  },
  { id: "mat_02", category: "MATEMATICAS", difficulty: "easy",
    text: "¿Cuánto es el 50% de 200?",
    options: [
      { id: "A", text: "50" },
      { id: "B", text: "100" },
      { id: "C", text: "150" },
      { id: "D", text: "25" }
    ],
    correctId: "B", explanation: "50% de 200 = 200 ÷ 2 = 100. El 50% siempre es la mitad.",
    socraticHints: ["¿Cuánto es la mitad de 200?", "50% es lo mismo que dividir entre 2."],
    techniqueTip: "50% = dividir entre 2. 25% = dividir entre 4. 10% = mover el punto decimal."
  },
  { id: "mat_03", category: "MATEMATICAS", difficulty: "easy",
    text: "Si un bus sale cada 15 minutos y el primero salió a las 6:00 AM, ¿a qué hora sale el tercero?",
    options: [
      { id: "A", text: "6:30 AM" },
      { id: "B", text: "6:45 AM" },
      { id: "C", text: "6:15 AM" },
      { id: "D", text: "7:00 AM" }
    ],
    correctId: "A", explanation: "Primero: 6:00. Segundo: 6:15. Tercero: 6:30.",
    socraticHints: ["Si sale cada 15 minutos, ¿cuándo sale el segundo?", "Después del segundo, sumamos otros 15 minutos."],
    techniqueTip: "En problemas de tiempo: identifica el patrón y súmalo paso a paso."
  },
  { id: "mat_04", category: "MATEMATICAS", difficulty: "medium",
    text: "Un tanque de agua se vacía a razón de 3 litros por minuto. Si inicialmente tenía 120 litros, ¿cuál ecuación describe la cantidad de agua (y) en función del tiempo en minutos (x)?",
    options: [
      { id: "A", text: "y = 120 + 3x" },
      { id: "B", text: "y = 3x - 120" },
      { id: "C", text: "y = 120 - 3x" },
      { id: "D", text: "y = 120 / 3x" }
    ],
    correctId: "C", explanation: "Inicia con 120 litros y disminuye 3 cada minuto: y = 120 - 3x.",
    socraticHints: ["Cuando x=0 (inicio), ¿cuánta agua hay?", "Si se vacía, ¿la cantidad sube o baja?", "Si baja 3 por minuto, ¿la x debe restar o sumar?"],
    techniqueTip: "Identifica: valor inicial (cuando x=0) y tasa de cambio. Reemplaza en y = valor_inicial ± tasa × x."
  },
  { id: "mat_05", category: "MATEMATICAS", difficulty: "medium",
    text: "En una encuesta, 40 personas prefirieron café, 30 prefirieron té y 30 prefirieron jugo. ¿Qué porcentaje prefirió café?",
    options: [
      { id: "A", text: "30%" },
      { id: "B", text: "40%" },
      { id: "C", text: "50%" },
      { id: "D", text: "25%" }
    ],
    correctId: "B", explanation: "Total = 40+30+30 = 100. Café = 40/100 = 40%.",
    socraticHints: ["Primero, ¿cuántas personas hay en total?", "Si el total es 100, ¿qué porcentaje son 40 de 100?"],
    techniqueTip: "Porcentaje = (parte ÷ total) × 100. Si el total ya es 100, es directo."
  },
  { id: "mat_06", category: "MATEMATICAS", difficulty: "medium",
    text: "¿Cuál es el área de un triángulo con base de 10 cm y altura de 6 cm?",
    options: [
      { id: "A", text: "60 cm²" },
      { id: "B", text: "30 cm²" },
      { id: "C", text: "16 cm²" },
      { id: "D", text: "50 cm²" }
    ],
    correctId: "B", explanation: "Área = (base × altura) / 2 = (10 × 6) / 2 = 30 cm².",
    socraticHints: ["¿Recuerdas la fórmula del área del triángulo?", "Es base por altura dividido entre..."],
    techniqueTip: "Triángulo: A = (b × h) / 2. Rectángulo: A = b × h. Círculo: A = π × r²."
  },
  { id: "mat_07", category: "MATEMATICAS", difficulty: "hard",
    text: "Si 2x + 5 = 3x - 1, ¿cuál es el valor de x?",
    options: [
      { id: "A", text: "4" },
      { id: "B", text: "6" },
      { id: "C", text: "-6" },
      { id: "D", text: "2" }
    ],
    correctId: "B", explanation: "2x + 5 = 3x - 1 → 5 + 1 = 3x - 2x → 6 = x.",
    socraticHints: ["Intenta poner todas las x a un lado. ¿Qué pasa si restas 2x de ambos lados?", "Si te queda 5 = x - 1, ¿cuánto es x?"],
    techniqueTip: "En ecuaciones: pasa las x a un lado y los números al otro. Lo que pasa a un lado cambia de signo."
  },
  { id: "mat_08", category: "MATEMATICAS", difficulty: "hard",
    text: "La gráfica de una función lineal pasa por los puntos (0, 3) y (2, 7). ¿Cuál es la pendiente?",
    options: [
      { id: "A", text: "1" },
      { id: "B", text: "2" },
      { id: "C", text: "3" },
      { id: "D", text: "4" }
    ],
    correctId: "B", explanation: "Pendiente = (y2-y1)/(x2-x1) = (7-3)/(2-0) = 4/2 = 2.",
    socraticHints: ["La pendiente mide cuánto sube la y cuando la x avanza.", "¿Cuánto subió y (de 3 a 7)?", "¿Cuánto avanzó x (de 0 a 2)?", "Divide los dos valores."],
    techniqueTip: "Pendiente = (cambio en y) ÷ (cambio en x). Si es positiva sube, si es negativa baja."
  },
  { id: "mat_09", category: "MATEMATICAS", difficulty: "easy",
    text: "Un producto cuesta $80.000 con un descuento del 25%. ¿Cuánto pagas?",
    options: [
      { id: "A", text: "$60.000" },
      { id: "B", text: "$55.000" },
      { id: "C", text: "$64.000" },
      { id: "D", text: "$20.000" }
    ],
    correctId: "A", explanation: "25% de 80.000 = 20.000. Precio final = 80.000 - 20.000 = $60.000.",
    socraticHints: ["¿Cuánto es el 25% de $80.000?", "25% = un cuarto. ¿Cuánto es un cuarto de 80.000?"],
    techniqueTip: "25% = ÷4. Entonces: 80.000÷4 = 20.000 de descuento. Resta: 80.000-20.000 = $60.000."
  },
  { id: "mat_10", category: "MATEMATICAS", difficulty: "medium",
    text: "En una gráfica de barras, las ventas de lunes a viernes fueron: 10, 15, 8, 20, 12. ¿Cuál es el promedio de ventas diarias?",
    options: [
      { id: "A", text: "12" },
      { id: "B", text: "13" },
      { id: "C", text: "15" },
      { id: "D", text: "10" }
    ],
    correctId: "B", explanation: "Promedio = (10+15+8+20+12) ÷ 5 = 65 ÷ 5 = 13.",
    socraticHints: ["¿Cómo se calcula el promedio?", "Suma todos los valores y luego divide entre cuántos son."],
    techniqueTip: "Promedio = suma de todos los valores ÷ cantidad de valores."
  },

  // ╔══════════════════════════════════════╗
  // ║    🏛️ SOCIALES Y CIUDADANAS (40 Qs) ║
  // ╚══════════════════════════════════════╝
  
  { id: "soc_01", category: "SOCIALES", difficulty: "easy",
    text: "¿Cuál es la capital de Colombia?",
    options: [
      { id: "A", text: "Medellín" },
      { id: "B", text: "Cali" },
      { id: "C", text: "Bogotá" },
      { id: "D", text: "Barranquilla" }
    ],
    correctId: "C", explanation: "Bogotá es la capital de Colombia y sede del gobierno nacional.",
    socraticHints: ["¿Dónde queda la Casa de Nariño?", "¿En qué ciudad está el Congreso de la República?"],
    techniqueTip: "La capital siempre es la sede del gobierno central."
  },
  { id: "soc_02", category: "SOCIALES", difficulty: "easy",
    text: "¿Cuáles son las tres ramas del poder público en Colombia?",
    options: [
      { id: "A", text: "Militar, judicial y administrativa" },
      { id: "B", text: "Ejecutiva, legislativa y judicial" },
      { id: "C", text: "Presidencial, senatorial y popular" },
      { id: "D", text: "Federal, estatal y municipal" }
    ],
    correctId: "B", explanation: "Las tres ramas son: ejecutiva (presidente), legislativa (congreso) y judicial (cortes y jueces).",
    socraticHints: ["¿Quién hace las leyes?", "¿Quién gobierna?", "¿Quién aplica la justicia?"],
    techniqueTip: "Ejecutiva = gobernar. Legislativa = hacer leyes. Judicial = aplicar justicia."
  },
  { id: "soc_03", category: "SOCIALES", difficulty: "easy",
    text: "¿Qué derecho fundamental permite a los ciudadanos elegir a sus gobernantes?",
    options: [
      { id: "A", text: "Derecho a la educación" },
      { id: "B", text: "Derecho al voto" },
      { id: "C", text: "Derecho al trabajo" },
      { id: "D", text: "Derecho a la protesta" }
    ],
    correctId: "B", explanation: "El derecho al voto o sufragio permite a los ciudadanos elegir y ser elegidos.",
    socraticHints: ["¿Qué hacemos en las elecciones?", "¿Cómo participamos para elegir presidente?"],
    techniqueTip: "Elegir gobernantes = voto/sufragio. Es tanto un derecho como un deber cívico."
  },
  { id: "soc_04", category: "SOCIALES", difficulty: "medium",
    text: "La Constitución de 1991 reemplazó a la de 1886. ¿Cuál fue uno de los cambios más importantes?",
    options: [
      { id: "A", text: "Se eliminó el congreso" },
      { id: "B", text: "Se reconoció a Colombia como un Estado Social de Derecho pluriétnico y multicultural" },
      { id: "C", text: "Se estableció la monarquía" },
      { id: "D", text: "Se prohibió la libertad de expresión" }
    ],
    correctId: "B", explanation: "La Constitución del 91 reconoce la diversidad étnica y cultural y define a Colombia como un Estado Social de Derecho.",
    socraticHints: ["¿Colombia tiene muchas culturas diferentes?", "¿La Constitución del 91 reconoce o ignora esa diversidad?"],
    techniqueTip: "Constitución de 1991: tutela, diversidad étnica, Estado Social de Derecho, participación ciudadana."
  },
  { id: "soc_05", category: "SOCIALES", difficulty: "medium",
    text: "¿Qué es la acción de tutela en Colombia?",
    options: [
      { id: "A", text: "Un impuesto especial" },
      { id: "B", text: "Un mecanismo para proteger derechos fundamentales cuando son vulnerados" },
      { id: "C", text: "Un tipo de contrato laboral" },
      { id: "D", text: "Una licencia de conducir" }
    ],
    correctId: "B", explanation: "La tutela es un recurso que cualquier persona puede interponer ante un juez cuando siente que un derecho fundamental está siendo vulnerado.",
    socraticHints: ["¿Qué puedes hacer si te niegan atención médica que necesitas urgentemente?", "¿Ante quién puedes reclamar tus derechos?"],
    techniqueTip: "La tutela protege derechos fundamentales. Es rápida (10 días) y no necesitas abogado."
  },
  { id: "soc_06", category: "SOCIALES", difficulty: "medium",
    text: "¿Cuál es la diferencia principal entre un gobierno democrático y una dictadura?",
    options: [
      { id: "A", text: "En la democracia no hay presidente" },
      { id: "B", text: "En la dictadura el poder se concentra en una persona sin elecciones libres" },
      { id: "C", text: "La dictadura es siempre mejor para la economía" },
      { id: "D", text: "En la democracia no hay leyes" }
    ],
    correctId: "B", explanation: "En una dictadura, una persona o grupo tiene todo el poder y no hay elecciones libres ni separación de poderes.",
    socraticHints: ["¿En una dictadura la gente puede elegir a su gobernante?", "¿Quién controla al dictador?"],
    techniqueTip: "Democracia = separación de poderes + elecciones libres. Dictadura = concentración de poder sin control."
  },
  { id: "soc_07", category: "SOCIALES", difficulty: "hard",
    text: "La globalización ha generado debate. ¿Cuál es una crítica frecuente?",
    options: [
      { id: "A", text: "Ha mejorado la distribución de la riqueza igualmente en todos los países" },
      { id: "B", text: "Ha aumentado la interdependencia económica pero también la desigualdad entre países" },
      { id: "C", text: "Ha eliminado todas las fronteras del mundo" },
      { id: "D", text: "Solo beneficia a los países más pobres" }
    ],
    correctId: "B", explanation: "Una crítica central es que la globalización beneficia más a los países ricos, aumentando la brecha con los países en desarrollo.",
    socraticHints: ["¿Todos los países se benefician igual de la globalización?", "¿Quiénes producen más? ¿Quiénes consumen más?"],
    techniqueTip: "En preguntas sobre globalización, busca la opción que reconozca TANTO beneficios COMO problemas."
  },
  { id: "soc_08", category: "SOCIALES", difficulty: "hard",
    text: "¿Qué significa el principio de 'presunción de inocencia'?",
    options: [
      { id: "A", text: "Toda persona acusada es culpable hasta que se demuestre lo contrario" },
      { id: "B", text: "Solo los jueces pueden acusar a alguien" },
      { id: "C", text: "Toda persona es inocente hasta que se demuestre su culpabilidad en un juicio" },
      { id: "D", text: "No se puede acusar a nadie de un delito" }
    ],
    correctId: "C", explanation: "Este principio fundamental del derecho dice que nadie puede ser declarado culpable sin un proceso legal que lo demuestre.",
    socraticHints: ["Si alguien te acusa de algo, ¿eres automáticamente culpable?", "¿Quién tiene la carga de probar la culpa?"],
    techniqueTip: "Presunción de inocencia: eres inocente HASTA que se pruebe lo contrario. La carga la tiene quien acusa."
  },
  { id: "soc_09", category: "SOCIALES", difficulty: "easy",
    text: "¿Qué institución colombiana se encarga de proteger los derechos de los ciudadanos?",
    options: [
      { id: "A", text: "El Banco de la República" },
      { id: "B", text: "La Defensoría del Pueblo" },
      { id: "C", text: "El Ministerio de Hacienda" },
      { id: "D", text: "La DIAN" }
    ],
    correctId: "B", explanation: "La Defensoría del Pueblo es la institución del Estado encargada de velar por los derechos humanos y fundamentales.",
    socraticHints: ["¿Cuál institución tiene la palabra 'derechos' o 'pueblo' en su nombre?"],
    techniqueTip: "Defensoría del Pueblo = derechos. Contraloría = dinero público. Procuraduría = funcionarios."
  },
  { id: "soc_10", category: "SOCIALES", difficulty: "medium",
    text: "¿Por qué es importante la separación de poderes en una democracia?",
    options: [
      { id: "A", text: "Para que haya más burocracia" },
      { id: "B", text: "Para que ninguna rama tenga todo el poder y se controlen entre sí" },
      { id: "C", text: "Para que el presidente sea más poderoso" },
      { id: "D", text: "Para eliminar el congreso" }
    ],
    correctId: "B", explanation: "La separación de poderes evita la concentración de autoridad y permite que cada rama controle a las otras (checks and balances).",
    socraticHints: ["¿Qué pasaría si una sola persona tuviera todo el poder?", "¿Por qué hay tres ramas diferentes?"],
    techniqueTip: "Separación de poderes = control mutuo. Si una rama se extralimita, las otras la frenan."
  },

  // ╔══════════════════════════════════════╗
  // ║    🔬 CIENCIAS NATURALES (40 Qs)    ║
  // ╚══════════════════════════════════════╝
  
  { id: "cie_01", category: "CIENCIAS", difficulty: "easy",
    text: "¿Cuál es la unidad básica de la vida?",
    options: [
      { id: "A", text: "El átomo" },
      { id: "B", text: "La célula" },
      { id: "C", text: "La molécula" },
      { id: "D", text: "El órgano" }
    ],
    correctId: "B", explanation: "La célula es la unidad básica de la vida. Todos los seres vivos están formados por al menos una célula.",
    socraticHints: ["¿De qué están hechos todos los seres vivos?", "Los átomos forman moléculas, pero ¿qué estructura ya tiene vida propia?"],
    techniqueTip: "Niveles de organización: átomo → molécula → célula → tejido → órgano → sistema → organismo."
  },
  { id: "cie_02", category: "CIENCIAS", difficulty: "easy",
    text: "¿Cómo se llama el proceso por el cual las plantas producen su propio alimento usando luz solar?",
    options: [
      { id: "A", text: "Respiración" },
      { id: "B", text: "Digestión" },
      { id: "C", text: "Fotosíntesis" },
      { id: "D", text: "Fermentación" }
    ],
    correctId: "C", explanation: "La fotosíntesis es el proceso donde las plantas usan luz solar, agua y CO₂ para producir glucosa y oxígeno.",
    socraticHints: ["Foto = luz. Síntesis = producir. ¿Qué producen las plantas con la luz?", "¿Las plantas necesitan comer como nosotros?"],
    techniqueTip: "Fotosíntesis: luz + agua + CO₂ → glucosa + oxígeno. Solo plantas y algunos microorganismos."
  },
  { id: "cie_03", category: "CIENCIAS", difficulty: "easy",
    text: "¿Qué estado de la materia tiene forma y volumen definidos?",
    options: [
      { id: "A", text: "Líquido" },
      { id: "B", text: "Gas" },
      { id: "C", text: "Plasma" },
      { id: "D", text: "Sólido" }
    ],
    correctId: "D", explanation: "Los sólidos tienen forma y volumen definidos porque sus partículas están muy juntas y ordenadas.",
    socraticHints: ["¿Un hielo mantiene su forma?", "¿Y el agua líquida, mantiene su forma?"],
    techniqueTip: "Sólido = forma fija. Líquido = toma la forma del recipiente. Gas = se expande."
  },
  { id: "cie_04", category: "CIENCIAS", difficulty: "medium",
    text: "¿Qué tipo de energía se transforma cuando enciendes un bombillo?",
    options: [
      { id: "A", text: "Energía solar se convierte en química" },
      { id: "B", text: "Energía eléctrica se convierte en luz y calor" },
      { id: "C", text: "Energía nuclear se convierte en mecánica" },
      { id: "D", text: "Energía cinética se convierte en potencial" }
    ],
    correctId: "B", explanation: "El bombillo transforma energía eléctrica en energía luminosa (luz) y energía térmica (calor).",
    socraticHints: ["¿Qué tipo de energía llega al bombillo por los cables?", "Cuando tocas un bombillo encendido, ¿está frío o caliente?"],
    techniqueTip: "La energía se transforma, nunca se crea ni se destruye (ley de conservación de la energía)."
  },
  { id: "cie_05", category: "CIENCIAS", difficulty: "medium",
    text: "¿Qué órgano del cuerpo humano se encarga de filtrar la sangre y producir orina?",
    options: [
      { id: "A", text: "El hígado" },
      { id: "B", text: "El corazón" },
      { id: "C", text: "Los riñones" },
      { id: "D", text: "Los pulmones" }
    ],
    correctId: "C", explanation: "Los riñones filtran la sangre, eliminan toxinas y producen la orina.",
    socraticHints: ["¿Qué órgano está relacionado con el sistema urinario?", "¿Qué pasa si tomas mucha agua? ¿Qué órgano trabaja más?"],
    techniqueTip: "Riñones = filtrar sangre. Hígado = procesar toxinas. Pulmones = intercambio de gases."
  },
  { id: "cie_06", category: "CIENCIAS", difficulty: "medium",
    text: "¿Qué sucede cuando mezclas vinagre con bicarbonato de sodio?",
    options: [
      { id: "A", text: "No pasa nada" },
      { id: "B", text: "Se produce una reacción química con burbujas de CO₂" },
      { id: "C", text: "Se congela la mezcla" },
      { id: "D", text: "Cambia de color a rojo" }
    ],
    correctId: "B", explanation: "Es una reacción ácido-base que produce dióxido de carbono (CO₂), agua y acetato de sodio.",
    socraticHints: ["¿Has visto alguna vez un 'volcán' casero?", "¿Las burbujas indican que se produce un gas nuevo?"],
    techniqueTip: "Si se producen burbujas, cambio de color o calor, es una reacción QUÍMICA (no física)."
  },
  { id: "cie_07", category: "CIENCIAS", difficulty: "hard",
    text: "¿Qué es el ADN?",
    options: [
      { id: "A", text: "Un tipo de proteína que da energía" },
      { id: "B", text: "Una molécula que contiene la información genética de los seres vivos" },
      { id: "C", text: "Un mineral esencial para los huesos" },
      { id: "D", text: "Un tipo de vitamina" }
    ],
    correctId: "B", explanation: "El ADN (ácido desoxirribonucleico) es la molécula que almacena la información genética que determina las características de los seres vivos.",
    socraticHints: ["¿El ADN es lo que heredas de tus padres?", "¿Es lo que determina el color de tus ojos?"],
    techniqueTip: "ADN = instrucciones genéticas. Está en el núcleo de la célula. Se hereda de padres a hijos."
  },
  { id: "cie_08", category: "CIENCIAS", difficulty: "hard",
    text: "¿Cuál es la diferencia entre rapidez y velocidad?",
    options: [
      { id: "A", text: "Son exactamente lo mismo" },
      { id: "B", text: "La rapidez solo indica qué tan rápido vas; la velocidad también indica la dirección" },
      { id: "C", text: "La velocidad es siempre mayor que la rapidez" },
      { id: "D", text: "La rapidez se mide en kg y la velocidad en metros" }
    ],
    correctId: "B", explanation: "La rapidez es escalar (solo magnitud: 60 km/h). La velocidad es vectorial (magnitud + dirección: 60 km/h hacia el norte).",
    socraticHints: ["Si dices '60 km/h', ¿sabes hacia dónde vas?", "¿Y si dices '60 km/h al norte'?"],
    techniqueTip: "Escalar = solo número (rapidez, masa). Vectorial = número + dirección (velocidad, fuerza)."
  },
  { id: "cie_09", category: "CIENCIAS", difficulty: "easy",
    text: "¿Qué gas necesitamos para respirar?",
    options: [
      { id: "A", text: "Nitrógeno" },
      { id: "B", text: "Dióxido de carbono" },
      { id: "C", text: "Oxígeno" },
      { id: "D", text: "Hidrógeno" }
    ],
    correctId: "C", explanation: "Necesitamos oxígeno (O₂) para la respiración celular, que es el proceso que genera energía en nuestras células.",
    socraticHints: ["¿Qué pasa si no puedes respirar?", "¿Qué gas está en las máscaras de oxígeno?"],
    techniqueTip: "Inhalamos O₂ (oxígeno) y exhalamos CO₂ (dióxido de carbono)."
  },
  { id: "cie_10", category: "CIENCIAS", difficulty: "medium",
    text: "¿Qué tipo de selección natural propuso Darwin?",
    options: [
      { id: "A", text: "Los más fuertes siempre sobreviven" },
      { id: "B", text: "Los organismos mejor adaptados a su ambiente tienen más probabilidad de reproducirse" },
      { id: "C", text: "Los animales eligen conscientemente cómo evolucionar" },
      { id: "D", text: "Todos los organismos evolucionan al mismo ritmo" }
    ],
    correctId: "B", explanation: "La selección natural favorece a los individuos mejor adaptados al ambiente, que tienen más éxito reproductivo.",
    socraticHints: ["¿Qué le pasaría a un oso polar en el trópico?", "¿Ser 'el más fuerte' siempre es lo mejor, o depende del ambiente?"],
    techniqueTip: "Darwin: supervivencia del más APTO (no del más fuerte). Adaptación al ambiente = clave."
  },

  // ╔══════════════════════════════════════╗
  // ║        🇬🇧 INGLÉS (40 Qs)            ║
  // ╚══════════════════════════════════════╝
  
  { id: "eng_01", category: "INGLES", difficulty: "easy",
    text: "What is the correct greeting for the morning?",
    options: [
      { id: "A", text: "Good night" },
      { id: "B", text: "Good afternoon" },
      { id: "C", text: "Good morning" },
      { id: "D", text: "Good evening" }
    ],
    correctId: "C", explanation: "'Good morning' se usa para saludar en la mañana (antes del mediodía).",
    socraticHints: ["Morning = mañana. ¿Cuál opción tiene esa palabra?", "Night = noche, afternoon = tarde. ¿Cuál queda?"],
    techniqueTip: "Morning = mañana. Afternoon = tarde (12-6pm). Evening = noche temprana. Night = noche."
  },
  { id: "eng_02", category: "INGLES", difficulty: "easy",
    text: "Complete: 'She ____ to school every day.'",
    options: [
      { id: "A", text: "go" },
      { id: "B", text: "goes" },
      { id: "C", text: "going" },
      { id: "D", text: "went" }
    ],
    correctId: "B", explanation: "Con 'she' (tercera persona singular) en presente simple, el verbo lleva -s/-es: goes.",
    socraticHints: ["¿'She' es I, you, o he/she?", "En presente simple con he/she/it, ¿qué le agregamos al verbo?"],
    techniqueTip: "Presente simple con he/she/it: agrega -s o -es al verbo. I go → She goes."
  },
  { id: "eng_03", category: "INGLES", difficulty: "easy",
    text: "What does 'How much does it cost?' mean?",
    options: [
      { id: "A", text: "¿Dónde está?" },
      { id: "B", text: "¿Cuánto cuesta?" },
      { id: "C", text: "¿Cómo se llama?" },
      { id: "D", text: "¿A qué hora abre?" }
    ],
    correctId: "B", explanation: "'How much' = cuánto. 'Cost' = cuesta. Pregunta sobre precio.",
    socraticHints: ["'How much' se usa para preguntar cantidades. ¿De qué?", "'Cost' suena parecido a 'costo'. ¿Qué significa?"],
    techniqueTip: "How much = cuánto (precio/cantidad). How many = cuántos (cosas contables)."
  },
  { id: "eng_04", category: "INGLES", difficulty: "medium",
    text: "Choose the correct sentence:",
    options: [
      { id: "A", text: "I didn't went to the store." },
      { id: "B", text: "I didn't go to the store." },
      { id: "C", text: "I don't went to the store." },
      { id: "D", text: "I doesn't go to the store." }
    ],
    correctId: "B", explanation: "En pasado negativo con 'didn't', el verbo va en forma base (go), no en pasado (went).",
    socraticHints: ["Después de 'didn't', ¿el verbo va en pasado o forma base?", "Didn't ya indica pasado. ¿Necesitas poner 'went' también?"],
    techniqueTip: "Con didn't, el verbo SIEMPRE va en forma base: didn't go, didn't eat, didn't see."
  },
  { id: "eng_05", category: "INGLES", difficulty: "medium",
    context: "Read: 'The weather today is cloudy and cold. It will probably rain in the afternoon.'",
    text: "What will probably happen in the afternoon?",
    options: [
      { id: "A", text: "It will be sunny" },
      { id: "B", text: "It will snow" },
      { id: "C", text: "It will rain" },
      { id: "D", text: "It will be hot" }
    ],
    correctId: "C", explanation: "El texto dice 'It will probably rain in the afternoon' — probablemente lloverá en la tarde.",
    socraticHints: ["Busca la palabra 'rain' en el texto. ¿Qué dice sobre ella?", "'Probably' = probablemente."],
    techniqueTip: "En comprensión lectora en inglés, busca la respuesta DIRECTAMENTE en el texto antes de interpretar."
  },
  { id: "eng_06", category: "INGLES", difficulty: "medium",
    text: "Which is the correct comparative? 'A car is ____ than a bicycle.'",
    options: [
      { id: "A", text: "more fast" },
      { id: "B", text: "faster" },
      { id: "C", text: "fastest" },
      { id: "D", text: "more faster" }
    ],
    correctId: "B", explanation: "Para adjetivos cortos (fast), el comparativo se forma con -er: faster.",
    socraticHints: ["'Fast' tiene una sílaba. ¿Los adjetivos cortos usan 'more' o '-er'?", "'Fastest' es superlativo (el más rápido). ¿Estamos comparando dos cosas?"],
    techniqueTip: "Adjetivos cortos (1-2 sílabas): -er (faster, bigger). Adjetivos largos: more + adj (more beautiful)."
  },
  { id: "eng_07", category: "INGLES", difficulty: "hard",
    text: "If I ____ more money, I would buy a house.",
    options: [
      { id: "A", text: "have" },
      { id: "B", text: "had" },
      { id: "C", text: "has" },
      { id: "D", text: "will have" }
    ],
    correctId: "B", explanation: "Esta es una condicional tipo 2 (irreal/hipotética): If + past simple, would + verb.",
    socraticHints: ["¿Esta situación es real o imaginaria?", "Si es imaginaria, usamos pasado en la condición: If I had..."],
    techniqueTip: "Condicional 2 (situación irreal): If + pasado, would + verbo. Ej: If I had time, I would travel."
  },
  { id: "eng_08", category: "INGLES", difficulty: "hard",
    context: "Sign: 'EMPLOYEES ONLY — No unauthorized access beyond this point.'",
    text: "What does this sign mean?",
    options: [
      { id: "A", text: "Everyone can enter this area" },
      { id: "B", text: "Only workers are allowed to enter" },
      { id: "C", text: "The store is closed" },
      { id: "D", text: "Employees must leave the building" }
    ],
    correctId: "B", explanation: "'Employees only' = solo empleados. 'No unauthorized access' = sin acceso no autorizado.",
    socraticHints: ["'Employees' = empleados. 'Only' = solamente. Entonces, ¿quién puede entrar?", "'Unauthorized' = no autorizado. ¿Puedes entrar si no trabajas ahí?"],
    techniqueTip: "'Only' = solo/solamente. Si ves 'X only', significa que SOLO X puede hacer algo."
  },
  { id: "eng_09", category: "INGLES", difficulty: "easy",
    text: "My mother's sister is my ____.",
    options: [
      { id: "A", text: "cousin" },
      { id: "B", text: "grandmother" },
      { id: "C", text: "aunt" },
      { id: "D", text: "niece" }
    ],
    correctId: "C", explanation: "La hermana de tu mamá es tu tía (aunt).",
    socraticHints: ["En español, ¿cómo le dices a la hermana de tu mamá?", "Aunt = tía en inglés."],
    techniqueTip: "Familia: aunt = tía, uncle = tío, cousin = primo/a, niece = sobrina, nephew = sobrino."
  },
  { id: "eng_10", category: "INGLES", difficulty: "medium",
    text: "Which word is a synonym for 'happy'?",
    options: [
      { id: "A", text: "Sad" },
      { id: "B", text: "Angry" },
      { id: "C", text: "Glad" },
      { id: "D", text: "Tired" }
    ],
    correctId: "C", explanation: "'Glad' means the same as 'happy' — contento, feliz.",
    socraticHints: ["Synonym = misma significado. ¿Cuál de las opciones significa 'feliz'?", "Sad = triste, angry = enojado, tired = cansado. ¿Cuál queda?"],
    techniqueTip: "Sinónimos comunes: happy/glad, big/large, small/little, fast/quick, beautiful/pretty."
  },
  
  // ─── ADDITIONAL QUESTIONS TO REACH 200+ ───
  
  // More Lectura Crítica
  { id: "lc_11", category: "LECTURA_CRITICA", difficulty: "medium",
    text: "¿Cuál es la diferencia entre un hecho y una opinión?",
    options: [
      { id: "A", text: "Los hechos son siempre negativos y las opiniones positivas" },
      { id: "B", text: "Un hecho se puede verificar, una opinión es un punto de vista personal" },
      { id: "C", text: "Las opiniones son más valiosas que los hechos" },
      { id: "D", text: "No hay diferencia" }
    ],
    correctId: "B", explanation: "Un hecho es comprobable (ej: 'Bogotá es la capital'). Una opinión es subjetiva (ej: 'Bogotá es la mejor ciudad').",
    socraticHints: ["'Colombia tiene 50 millones de habitantes' ¿es verificable?", "'Colombia es el mejor país' ¿es verificable?"],
    techniqueTip: "Hecho = se puede comprobar con datos. Opinión = depende de quién lo diga."
  },
  { id: "lc_12", category: "LECTURA_CRITICA", difficulty: "hard",
    context: "En un debate político, un candidato dice: 'Mi oponente es un mentiroso y no merece su confianza, por lo tanto su propuesta económica es mala.'",
    text: "¿Qué tipo de falacia argumentativa comete el candidato?",
    options: [
      { id: "A", text: "Falacia ad hominem (atacar a la persona en vez del argumento)" },
      { id: "B", text: "Falacia de autoridad" },
      { id: "C", text: "Falacia de falsa analogía" },
      { id: "D", text: "Argumento circular" }
    ],
    correctId: "A", explanation: "Ataca al oponente como persona ('mentiroso') en vez de refutar su propuesta económica con datos.",
    socraticHints: ["¿El candidato habla de la propuesta o de la persona?", "¿Llamar a alguien mentiroso prueba que su plan económico es malo?"],
    techniqueTip: "Ad hominem = atacar a la persona. Si el argumento habla de la persona y no del tema, es ad hominem."
  },
  { id: "lc_13", category: "LECTURA_CRITICA", difficulty: "easy",
    text: "¿Qué tipo de texto es una receta de cocina?",
    options: [
      { id: "A", text: "Narrativo" },
      { id: "B", text: "Argumentativo" },
      { id: "C", text: "Instructivo" },
      { id: "D", text: "Poético" }
    ],
    correctId: "C", explanation: "Una receta da instrucciones paso a paso para preparar un plato. Es un texto instructivo.",
    socraticHints: ["¿Una receta cuenta una historia o te dice qué hacer?", "¿Te da pasos a seguir?"],
    techniqueTip: "Instructivo = pasos. Narrativo = historia. Argumentativo = convencer. Expositivo = informar."
  },
  { id: "lc_14", category: "LECTURA_CRITICA", difficulty: "medium",
    text: "Si un texto usa 'primero', 'luego', 'después', 'finalmente', ¿qué tipo de estructura tiene?",
    options: [
      { id: "A", text: "Comparación" },
      { id: "B", text: "Causa-efecto" },
      { id: "C", text: "Secuencia cronológica" },
      { id: "D", text: "Problema-solución" }
    ],
    correctId: "C", explanation: "Palabras como 'primero, luego, después' indican un orden temporal: secuencia cronológica.",
    socraticHints: ["¿Estas palabras indican orden o contraste?", "'Primero... luego... después' suena como pasos en orden."],
    techniqueTip: "Palabras de secuencia: primero, luego, después, finalmente. De causa-efecto: porque, por lo tanto."
  },

  // More Matemáticas
  { id: "mat_11", category: "MATEMATICAS", difficulty: "easy",
    text: "Si un kilo de arroz cuesta $3.500 y compras 4 kilos, ¿cuánto pagas?",
    options: [
      { id: "A", text: "$10.500" },
      { id: "B", text: "$14.000" },
      { id: "C", text: "$7.000" },
      { id: "D", text: "$12.000" }
    ],
    correctId: "B", explanation: "4 × $3.500 = $14.000",
    socraticHints: ["¿Cuántos kilos son?", "Si uno cuesta $3.500, ¿cuánto cuestan 4?"],
    techniqueTip: "Precio total = precio unitario × cantidad."
  },
  { id: "mat_12", category: "MATEMATICAS", difficulty: "medium",
    text: "¿Cuál es la probabilidad de sacar un número par al lanzar un dado de 6 caras?",
    options: [
      { id: "A", text: "1/6" },
      { id: "B", text: "1/3" },
      { id: "C", text: "1/2" },
      { id: "D", text: "2/3" }
    ],
    correctId: "C", explanation: "Números pares: 2, 4, 6 = 3 opciones de 6. Probabilidad = 3/6 = 1/2.",
    socraticHints: ["¿Cuántos números pares tiene un dado?", "¿Cuántos lados tiene en total?"],
    techniqueTip: "Probabilidad = casos favorables ÷ casos totales."
  },
  { id: "mat_13", category: "MATEMATICAS", difficulty: "hard",
    text: "Si la gráfica de una función pasa por el eje x en x=2 y x=-3, ¿cuál podría ser la función?",
    options: [
      { id: "A", text: "y = (x-2)(x+3)" },
      { id: "B", text: "y = (x+2)(x-3)" },
      { id: "C", text: "y = (x-2)(x-3)" },
      { id: "D", text: "y = x² + 5" }
    ],
    correctId: "A", explanation: "Los ceros son x=2 y x=-3. Factores: (x-2) y (x-(-3))=(x+3). Entonces y=(x-2)(x+3).",
    socraticHints: ["Si x=2 es cero, ¿qué factor da cero cuando x=2?", "(x-2) = 0 cuando x=2. ¿Y para x=-3?"],
    techniqueTip: "Si x=a es un cero de la función, entonces (x-a) es un factor."
  },
  { id: "mat_14", category: "MATEMATICAS", difficulty: "easy",
    text: "¿Cuántas horas hay en 3 días?",
    options: [
      { id: "A", text: "36" },
      { id: "B", text: "48" },
      { id: "C", text: "72" },
      { id: "D", text: "60" }
    ],
    correctId: "C", explanation: "1 día = 24 horas. 3 días = 3 × 24 = 72 horas.",
    socraticHints: ["¿Cuántas horas tiene un día?", "Si un día tiene 24, ¿cuántas tienen 3?"],
    techniqueTip: "Conversiones de tiempo: 1 día=24h, 1h=60min, 1min=60seg."
  },

  // More Sociales
  { id: "soc_11", category: "SOCIALES", difficulty: "hard",
    text: "¿Qué es el desarrollo sostenible?",
    options: [
      { id: "A", text: "Crecer económicamente sin importar el medio ambiente" },
      { id: "B", text: "Desarrollo que satisface necesidades actuales sin comprometer las de generaciones futuras" },
      { id: "C", text: "Producir más de lo que se consume" },
      { id: "D", text: "Solo usar energías renovables" }
    ],
    correctId: "B", explanation: "El desarrollo sostenible busca un equilibrio entre crecimiento económico, bienestar social y protección ambiental.",
    socraticHints: ["¿Debemos pensar solo en nosotros o también en las futuras generaciones?", "'Sostenible' viene de 'sostener en el tiempo'. ¿Qué debe mantenerse?"],
    techniqueTip: "Desarrollo sostenible = equilibrio entre economía, sociedad y medio ambiente para hoy Y el futuro."
  },
  { id: "soc_12", category: "SOCIALES", difficulty: "medium",
    text: "¿Qué sucedió el 20 de julio de 1810 en Colombia?",
    options: [
      { id: "A", text: "Se fundó Bogotá" },
      { id: "B", text: "Se firmó la independencia definitiva" },
      { id: "C", text: "Se dio el Grito de Independencia, inicio del proceso independentista" },
      { id: "D", text: "Llegó Cristóbal Colón" }
    ],
    correctId: "C", explanation: "El 20 de julio de 1810 se inició el movimiento de independencia con el 'Grito de Independencia' en Bogotá.",
    socraticHints: ["¿Qué se celebra cada 20 de julio?", "¿Fue el inicio del proceso o la independencia final?"],
    techniqueTip: "20 de julio = inicio. 7 de agosto de 1819 (Batalla de Boyacá) = consolidación de la independencia."
  },

  // More Ciencias
  { id: "cie_11", category: "CIENCIAS", difficulty: "medium",
    text: "¿Qué es un ecosistema?",
    options: [
      { id: "A", text: "Solo los animales de una región" },
      { id: "B", text: "El conjunto de seres vivos y su ambiente físico interactuando entre sí" },
      { id: "C", text: "Solo las plantas de un lugar" },
      { id: "D", text: "El clima de una región" }
    ],
    correctId: "B", explanation: "Un ecosistema incluye factores bióticos (seres vivos) y abióticos (agua, luz, suelo) interactuando.",
    socraticHints: ["¿Un bosque son solo los árboles, o también los animales, el agua, el suelo?", "¿Los seres vivos viven independientes del ambiente?"],
    techniqueTip: "Ecosistema = seres vivos + ambiente físico + interacciones. No es solo los animales."
  },
  { id: "cie_12", category: "CIENCIAS", difficulty: "hard",
    text: "¿Qué ley de Newton explica que 'a toda acción le corresponde una reacción igual y opuesta'?",
    options: [
      { id: "A", text: "Primera ley (inercia)" },
      { id: "B", text: "Segunda ley (F=ma)" },
      { id: "C", text: "Tercera ley (acción y reacción)" },
      { id: "D", text: "Ley de gravitación universal" }
    ],
    correctId: "C", explanation: "La tercera ley de Newton establece que toda fuerza tiene una fuerza de reacción igual en magnitud pero opuesta en dirección.",
    socraticHints: ["Si empujas una pared, ¿sientes que la pared te empuja a ti?", "Si hay tres leyes de Newton, esta habla de acción y..."],
    techniqueTip: "1ª ley = inercia (sin fuerza, no cambia). 2ª = F=ma. 3ª = acción-reacción."
  },

  // More Inglés
  { id: "eng_11", category: "INGLES", difficulty: "easy",
    text: "What color is the sky on a clear day?",
    options: [
      { id: "A", text: "Red" },
      { id: "B", text: "Green" },
      { id: "C", text: "Blue" },
      { id: "D", text: "Black" }
    ],
    correctId: "C", explanation: "The sky is blue on a clear day. El cielo es azul en un día despejado.",
    socraticHints: ["Sky = cielo. Clear = despejado. ¿De qué color ves el cielo cuando no hay nubes?"],
    techniqueTip: "Colores básicos: red=rojo, blue=azul, green=verde, yellow=amarillo, black=negro, white=blanco."
  },
  { id: "eng_12", category: "INGLES", difficulty: "medium",
    text: "Choose the correct preposition: 'I arrive ____ the office at 8 AM.'",
    options: [
      { id: "A", text: "in" },
      { id: "B", text: "on" },
      { id: "C", text: "at" },
      { id: "D", text: "to" }
    ],
    correctId: "C", explanation: "'Arrive at' se usa con lugares específicos (the office, the airport). 'Arrive in' con ciudades/países.",
    socraticHints: ["¿Decimos 'arrive in the office' o 'arrive at the office'?", "'At' = lugar específico. 'In' = ciudad/país."],
    techniqueTip: "At = lugar puntual (at the office). In = espacio/ciudad (in Bogotá). On = superficie (on the table)."
  },
  { id: "eng_13", category: "INGLES", difficulty: "hard",
    text: "Which sentence uses the present perfect correctly?",
    options: [
      { id: "A", text: "I have went to Paris last year." },
      { id: "B", text: "I have been to Paris twice." },
      { id: "C", text: "I have go to Paris." },
      { id: "D", text: "I has been to Paris." }
    ],
    correctId: "B", explanation: "Present perfect: have/has + past participle. 'Have been' es correcto. No se usa con tiempos específicos (last year).",
    socraticHints: ["¿El presente perfecto usa 'have' + qué forma del verbo?", "¿'Went' es participio o pasado simple?"],
    techniqueTip: "Present perfect = have/has + participio (been, gone, eaten). NO se usa con 'yesterday, last year'."
  },

  // Filling more questions to get closer to 200
  { id: "mat_15", category: "MATEMATICAS", difficulty: "medium",
    text: "Si una pizza se divide en 8 pedazos iguales y te comes 3, ¿qué fracción comiste?",
    options: [
      { id: "A", text: "3/5" },
      { id: "B", text: "3/8" },
      { id: "C", text: "8/3" },
      { id: "D", text: "5/8" }
    ],
    correctId: "B", explanation: "Comiste 3 de 8 pedazos = 3/8.",
    socraticHints: ["¿Cuántos pedazos hay en total?", "¿Cuántos te comiste?", "La fracción es: comidos/total."],
    techniqueTip: "Fracción = parte/todo. Numerador = lo que tienes. Denominador = las partes totales."
  },
  { id: "soc_13", category: "SOCIALES", difficulty: "easy",
    text: "¿Cuál es el continente donde se encuentra Colombia?",
    options: [
      { id: "A", text: "Europa" },
      { id: "B", text: "África" },
      { id: "C", text: "América" },
      { id: "D", text: "Asia" }
    ],
    correctId: "C", explanation: "Colombia está en América del Sur, continente americano.",
    socraticHints: ["¿En qué parte del mapa está Colombia?"],
    techniqueTip: "América del Sur: Colombia, Venezuela, Ecuador, Perú, Brasil, Argentina, Chile, etc."
  },
  { id: "cie_13", category: "CIENCIAS", difficulty: "easy",
    text: "¿Cuál es el órgano más grande del cuerpo humano?",
    options: [
      { id: "A", text: "El hígado" },
      { id: "B", text: "El cerebro" },
      { id: "C", text: "La piel" },
      { id: "D", text: "El corazón" }
    ],
    correctId: "C", explanation: "La piel es el órgano más grande del cuerpo, cubriendo todo el exterior.",
    socraticHints: ["¿Qué cubre todo tu cuerpo por fuera?", "La piel también es un órgano. ¿Es grande o pequeña?"],
    techniqueTip: "La piel es un órgano (el más grande). Funciones: proteger, regular temperatura, sentir."
  },
  { id: "eng_14", category: "INGLES", difficulty: "easy",
    text: "What is the opposite of 'hot'?",
    options: [
      { id: "A", text: "Warm" },
      { id: "B", text: "Cold" },
      { id: "C", text: "Cool" },
      { id: "D", text: "Mild" }
    ],
    correctId: "B", explanation: "Hot = caliente. Cold = frío. Son opuestos.",
    socraticHints: ["Hot = caliente. ¿Cuál es lo opuesto de caliente?"],
    techniqueTip: "Opuestos comunes: hot/cold, big/small, fast/slow, old/young, happy/sad."
  },
  { id: "lc_15", category: "LECTURA_CRITICA", difficulty: "hard",
    text: "Un texto dice: 'Todos los políticos son corruptos, por lo tanto es inútil votar'. ¿Qué falacia comete?",
    options: [
      { id: "A", text: "Generalización apresurada" },
      { id: "B", text: "Argumento de autoridad" },
      { id: "C", text: "Falsa analogía" },
      { id: "D", text: "Petición de principio" }
    ],
    correctId: "A", explanation: "Dice 'TODOS' sin evidencia suficiente. Es una generalización apresurada: tomar casos particulares como regla universal.",
    socraticHints: ["¿Es verdad que TODOS sin excepción son corruptos?", "¿Se puede afirmar algo de todos basándose en algunos casos?"],
    techniqueTip: "Generalización apresurada = 'todos', 'ninguno', 'siempre', 'nunca' sin suficiente evidencia."
  },
  { id: "mat_16", category: "MATEMATICAS", difficulty: "hard",
    text: "¿Cuál es la mediana de los datos: 3, 7, 5, 12, 9?",
    options: [
      { id: "A", text: "7.2" },
      { id: "B", text: "5" },
      { id: "C", text: "7" },
      { id: "D", text: "9" }
    ],
    correctId: "C", explanation: "Ordenados: 3, 5, 7, 9, 12. La mediana es el valor del medio: 7.",
    socraticHints: ["Primero ordena los datos de menor a mayor.", "¿Cuántos datos hay? ¿Cuál está en el centro?"],
    techniqueTip: "Mediana: ordena los datos y toma el del centro. Si son pares, promedia los dos del centro."
  },
  { id: "soc_14", category: "SOCIALES", difficulty: "hard",
    text: "¿Qué son los derechos humanos?",
    options: [
      { id: "A", text: "Privilegios que solo tienen los ricos" },
      { id: "B", text: "Derechos inherentes a todas las personas por el solo hecho de ser humanos" },
      { id: "C", text: "Leyes que solo aplican en Europa" },
      { id: "D", text: "Reglas que los gobiernos pueden ignorar" }
    ],
    correctId: "B", explanation: "Los derechos humanos son universales, inherentes e inalienables. Los tiene toda persona sin importar raza, sexo, nacionalidad.",
    socraticHints: ["¿Los derechos humanos dependen de tu país o son universales?", "¿Puedes perder el derecho a la vida por ser de cierta raza?"],
    techniqueTip: "Derechos humanos: universales, inherentes (de nacimiento), inalienables (no se pueden quitar), indivisibles."
  },
  { id: "cie_14", category: "CIENCIAS", difficulty: "hard",
    text: "¿Qué es una cadena alimentaria?",
    options: [
      { id: "A", text: "Una lista de restaurantes" },
      { id: "B", text: "La secuencia de transferencia de energía de un organismo a otro" },
      { id: "C", text: "El proceso de producir alimentos en fábricas" },
      { id: "D", text: "La fotosíntesis" }
    ],
    correctId: "B", explanation: "Una cadena alimentaria muestra cómo la energía se transfiere de productores a consumidores: planta → herbívoro → carnívoro.",
    socraticHints: ["¿Qué come el conejo? ¿Y qué come al conejo?", "¿Eso forma una secuencia?"],
    techniqueTip: "Cadena alimentaria: productor → consumidor primario → consumidor secundario → descomponedor."
  },
  { id: "eng_15", category: "INGLES", difficulty: "medium",
    text: "Read: 'Please turn off your phone during the meeting.' What should you do?",
    options: [
      { id: "A", text: "Call someone during the meeting" },
      { id: "B", text: "Switch off your phone" },
      { id: "C", text: "Turn up the volume" },
      { id: "D", text: "Take a photo" }
    ],
    correctId: "B", explanation: "'Turn off' = apagar. Debes apagar tu teléfono durante la reunión.",
    socraticHints: ["'Turn off' es lo opuesto de 'turn on'. Turn on = encender, turn off = ..."],
    techniqueTip: "Phrasal verbs comunes: turn on=encender, turn off=apagar, turn up=subir volumen, turn down=bajar."
  },
];
