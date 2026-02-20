/**
 * Configuración de estándares MEN (Ministerio de Educación Nacional de Colombia)
 * para enseñanza de español en primaria (grados 1-5)
 * 
 * Basado en "Estándares Básicos de Competencias en Lenguaje"
 */

export type SpanishLevel = 'SP1' | 'SP2' | 'SP3' | 'SP4' | 'SP5' | 'SP6' | 'SP7';

export interface SpanishGradeConfig {
  grade: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Estándares MEN por competencia - Lectura comprensiva */
  readingStandards: string[];
  /** Estándares MEN por competencia - Producción escrita */
  writingStandards: string[];
  /** Estándares MEN por competencia - Expresión oral */
  oralStandards: string[];
  /** Nivel interno (similar a CEFR para tracking) */
  internalLevel: SpanishLevel;
  /** Dominios de vocabulario a priorizar */
  vocabDomains: string[];
  /** Puntos gramaticales que el tutor puede usar */
  grammarPoints: string[];
  /** Máximo de palabras por frase que tutores y generadores deben usar */
  maxSentenceWords: number;
  /** Máximo de palabras nuevas que el tutor debe introducir en un solo turno */
  maxNewWordsPerTurn: number;
}

export const SPANISH_MEN_CONFIG: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, SpanishGradeConfig> = {
  1: {
    grade: 1,
    internalLevel: 'SP1',
    readingStandards: [
      'Reconoce palabras y frases cortas en textos simples',
      'Identifica personajes principales en cuentos cortos',
      'Comprende instrucciones simples de una o dos palabras',
      'Relaciona imágenes con palabras escritas'
    ],
    writingStandards: [
      'Escribe palabras conocidas usando letras mayúsculas y minúsculas',
      'Escribe su nombre y palabras familiares',
      'Copia frases cortas correctamente',
      'Usa espacios entre palabras'
    ],
    oralStandards: [
      'Expresa ideas simples usando frases cortas',
      'Cuenta experiencias personales básicas',
      'Responde preguntas sobre textos escuchados',
      'Participa en conversaciones sobre temas familiares'
    ],
    vocabDomains: ['familia', 'cuerpo', 'animales', 'colores', 'números', 'escuela', 'juguetes'],
    grammarPoints: ['sustantivos comunes', 'artículos (el, la, los, las)', 'verbos simples (ser, estar, tener)', 'adjetivos básicos'],
    maxSentenceWords: 4,
    maxNewWordsPerTurn: 2
  },
  2: {
    grade: 2,
    internalLevel: 'SP2',
    readingStandards: [
      'Lee textos cortos con fluidez básica',
      'Identifica inicio, desarrollo y final en cuentos',
      'Comprende el significado de palabras nuevas en contexto',
      'Responde preguntas literales sobre textos leídos'
    ],
    writingStandards: [
      'Escribe oraciones completas con sujeto y predicado',
      'Escribe textos narrativos cortos (3-5 oraciones)',
      'Usa mayúsculas al inicio de oración y nombres propios',
      'Aplica reglas básicas de acentuación'
    ],
    oralStandards: [
      'Narra eventos en orden cronológico',
      'Describe objetos y personas usando adjetivos',
      'Formula preguntas para obtener información',
      'Expresa opiniones simples sobre textos'
    ],
    vocabDomains: ['casa', 'comida', 'ropa', 'transporte', 'profesiones', 'tiempo', 'lugares'],
    grammarPoints: ['sustantivos propios y comunes', 'verbos en presente', 'adjetivos calificativos', 'pronombres personales', 'plurales'],
    maxSentenceWords: 6,
    maxNewWordsPerTurn: 3
  },
  3: {
    grade: 3,
    internalLevel: 'SP3',
    readingStandards: [
      'Lee textos narrativos y descriptivos con comprensión',
      'Identifica ideas principales y secundarias',
      'Infiere información implícita en textos',
      'Reconoce diferentes tipos de textos (cuento, poema, noticia)'
    ],
    writingStandards: [
      'Escribe textos narrativos y descriptivos (5-8 oraciones)',
      'Usa conectores básicos (y, pero, porque, entonces)',
      'Aplica reglas de acentuación en palabras agudas, graves y esdrújulas',
      'Escribe diálogos usando comillas y guiones'
    ],
    oralStandards: [
      'Expone temas preparados con claridad',
      'Participa en debates respetando turnos',
      'Explica procesos y procedimientos',
      'Expresa emociones y sentimientos'
    ],
    vocabDomains: ['naturaleza', 'ciudad', 'deportes', 'arte', 'tecnología', 'sentimientos', 'acciones'],
    grammarPoints: ['tiempos verbales (presente, pasado, futuro)', 'sustantivos colectivos', 'adjetivos comparativos', 'adverbios de tiempo y lugar', 'preposiciones'],
    maxSentenceWords: 8,
    maxNewWordsPerTurn: 4
  },
  4: {
    grade: 4,
    internalLevel: 'SP4',
    readingStandards: [
      'Lee textos informativos y literarios con comprensión profunda',
      'Identifica la estructura de diferentes tipos de textos',
      'Analiza personajes, escenarios y conflictos en narraciones',
      'Compara información de diferentes fuentes'
    ],
    writingStandards: [
      'Escribe textos narrativos, descriptivos e instructivos (8-12 oraciones)',
      'Usa conectores variados para enlazar ideas',
      'Aplica reglas de ortografía y puntuación avanzadas',
      'Escribe textos con introducción, desarrollo y conclusión'
    ],
    oralStandards: [
      'Presenta argumentos con ejemplos y evidencias',
      'Participa activamente en discusiones grupales',
      'Adapta su lenguaje según el contexto y audiencia',
      'Narra historias con expresión y entonación adecuadas'
    ],
    vocabDomains: ['ciencia', 'historia', 'geografía', 'cultura', 'valores', 'medios', 'comunicación'],
    grammarPoints: ['tiempos verbales compuestos', 'voz activa y pasiva', 'oraciones compuestas', 'sinónimos y antónimos', 'campo semántico'],
    maxSentenceWords: 12,
    maxNewWordsPerTurn: 5
  },
  5: {
    grade: 5,
    internalLevel: 'SP5',
    readingStandards: [
      'Lee textos complejos de diferentes géneros con análisis crítico',
      'Identifica la intención del autor y el propósito del texto',
      'Evalúa la credibilidad de fuentes de información',
      'Sintetiza información de múltiples textos'
    ],
    writingStandards: [
      'Escribe textos argumentativos, expositivos y creativos (12+ oraciones)',
      'Usa recursos literarios básicos (metáfora, comparación, personificación)',
      'Aplica todas las reglas ortográficas y gramaticales',
      'Escribe textos estructurados con párrafos bien organizados'
    ],
    oralStandards: [
      'Expone ideas complejas con claridad y coherencia',
      'Debate temas controvertidos respetando diferentes puntos de vista',
      'Adapta su discurso según la situación comunicativa',
      'Usa recursos expresivos (entonación, gestos, pausas)'
    ],
    vocabDomains: ['sociedad', 'política', 'medio ambiente', 'tecnología avanzada', 'literatura', 'filosofía', 'ética'],
    grammarPoints: ['modo subjuntivo', 'oraciones subordinadas', 'figuras literarias', 'registros de habla (formal/informal)', 'variantes dialectales'],
    maxSentenceWords: 15,
    maxNewWordsPerTurn: 6
  },
  6: {
    grade: 6,
    internalLevel: 'SP6',
    readingStandards: [
      'Analiza textos literarios y no literarios identificando estructuras complejas',
      'Reconoce la intertextualidad y el contexto histórico de los textos',
      'Evalúa la validez de argumentos en textos de opinión',
      'Realiza lecturas críticas de medios de comunicación'
    ],
    writingStandards: [
      'Produce textos argumentativos con tesis clara y sustento empírico',
      'Escribe ensayos breves siguiendo procesos de planeación y revisión',
      'Usa variedad de conectores lógicos para dar cohesión al texto',
      'Aplica normas de citación básicas'
    ],
    oralStandards: [
      'Participa en foros y mesas redondas con argumentos sólidos',
      'Realiza exposiciones orales con apoyo de recursos digitales',
      'Escucha activamente y confronta ideas de manera respetuosa',
      'Emplea léxico técnico y académico según el área del conocimiento'
    ],
    vocabDomains: ['literatura universal', 'derechos humanos', 'globalización', 'biodiversidad crítica', 'análisis de medios'],
    grammarPoints: ['consonancia gramatical compleja', 'uso de nexos subordinantes', 'análisis sintáctico', 'etimologías grecolatinas'],
    maxSentenceWords: 18,
    maxNewWordsPerTurn: 7
  },
  7: {
    grade: 7,
    internalLevel: 'SP7',
    readingStandards: [
      'Interpreta textos con múltiples niveles de significado y simbolismo',
      'Compara visiones del mundo en diversas expresiones literarias',
      'Identifica ideologías y sesgos en textos complejos',
      'Analiza la función social de los géneros discursivos'
    ],
    writingStandards: [
      'Escribe textos de investigación con rigor metodológico básico',
      'Produce crónicas y reportajes combinando narración y descripción',
      'Maneja registros lingüísticos diversos (científico, poético, jurídico)',
      'Aplica estrategias de corrección estilística'
    ],
    oralStandards: [
      'Lidera debates y discusiones sobre temas de interés nacional',
      'Realiza discursos persuasivos con entonación y retórica adecuada',
      'Sintetiza ponencias y conferencias extrayendo puntos clave',
      'Utiliza el lenguaje para resolver conflictos y mediar en el grupo'
    ],
    vocabDomains: ['antropología', 'justicia social', 'desarrollo sostenible', 'crítica literaria', 'ciencias espaciales'],
    grammarPoints: ['estilo indirecto libre', 'uso avanzado de signos de puntuación', 'coherencia y cohesión global', 'morfosintaxis profunda'],
    maxSentenceWords: 20,
    maxNewWordsPerTurn: 8
  }
};

export const getSpanishGradeConfig = (grade: 1 | 2 | 3 | 4 | 5 | 6 | 7): SpanishGradeConfig =>
  SPANISH_MEN_CONFIG[grade];

export const getSpanishLevelConfig = (level: SpanishLevel): SpanishGradeConfig => {
  const gradeMap: Record<SpanishLevel, 1 | 2 | 3 | 4 | 5 | 6 | 7> = {
    'SP1': 1,
    'SP2': 2,
    'SP3': 3,
    'SP4': 4,
    'SP5': 5,
    'SP6': 6,
    'SP7': 7
  };
  return SPANISH_MEN_CONFIG[gradeMap[level]];
};
