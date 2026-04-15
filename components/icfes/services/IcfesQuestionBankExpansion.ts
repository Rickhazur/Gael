import { IcfesQuestion } from './IcfesQuestionBank';

export const PASSAGES_EXTRA = {
  FILOSOFIA_DESCARTES: "«El buen sentido es la cosa mejor repartida del mundo; pues cada uno piensa estar tan bien provisto de él, que aun los más difíciles de contentar en cualquier otra cosa, no acostumbran a desear más del que tienen. [...] Porque no basta tener buen espíritu, sino que lo principal es aplicarlo bien.» — René Descartes, Discurso del método.",
  
  BIOLOGIA_CELULA: "En un experimento, se cultivaron células musculares en dos condiciones: Muestra A con oxígeno abundante y Muestra B en ausencia absoluta de oxígeno. Después de 24 horas, las células de la Muestra A produjeron 36 moléculas de ATP por cada molécula de glucosa consumida, mientras que las de la Muestra B produjeron solo 2 moléculas de ATP y acumularon grandes cantidades de ácido láctico.",
  
  HISTORIA_COLOMBIA: "El Frente Nacional (1958-1974) fue un pacto político entre los partidos Liberal y Conservador en Colombia, que buscaba poner fin a la violencia partidista. Durante este periodo, se alternaron la presidencia y se dividieron milimétricamente la burocracia estatal, excluyendo de facto a otras fuerzas políticas, lo que a la postre catalizó el surgimiento de movimientos insurgentes.",
};

export const EXTRA_QUESTIONS: IcfesQuestion[] = [
  // LECTURA CRÍTICA
  { id: "lc_ext_01", category: "LECTURA_CRITICA", difficulty: "hard", competency: "LC_EVALUAR",
    passageGroup: "descartes_metodo", context: PASSAGES_EXTRA.FILOSOFIA_DESCARTES,
    text: "Según el texto, Descartes sugiere irónicamente que 'el buen sentido' (la razón) es lo mejor repartido porque:",
    options: [
      { id: "A", text: "Es una cualidad innata que todos los seres humanos desarrollan por igual desde el nacimiento." },
      { id: "B", text: "Nadie cree que le falte inteligencia, incluso aquellos que son inconformes con todo lo demás." },
      { id: "C", text: "La naturaleza ha distribuido las capacidades intelectuales de forma matemáticamente equitativa." },
      { id: "D", text: "El espíritu humano siempre tiende a la verdad sin importar la educación recibida." }
    ],
    correctId: "B", explanation: "Descartes usa la ironía: como nadie se queja de su propia inteligencia (todos creen tener suficiente), concluye bromeando que debe ser lo mejor repartido del mundo.",
    socraticHints: ["¿Qué significa que 'cada uno piensa estar tan bien provisto de él'?", "¿Está hablando de una verdad objetiva o de la percepción personal de la gente sobre sí misma?"],
    techniqueTip: "Busca el tono del autor. La frase 'aun los más difíciles de contentar... no desean más' marca un tono irónico o de observación de la vanidad humana."
  },
  { id: "lc_ext_02", category: "LECTURA_CRITICA", difficulty: "medium", competency: "LC_INFERIR",
    passageGroup: "descartes_metodo", context: PASSAGES_EXTRA.FILOSOFIA_DESCARTES,
    text: "De la frase 'no basta tener buen espíritu, sino que lo principal es aplicarlo bien', se infiere que para el autor:",
    options: [
      { id: "A", text: "El método y la disciplina son más importantes que la mera inteligencia natural." },
      { id: "B", text: "Solo las personas con buen espíritu pueden alcanzar la verdad científica." },
      { id: "C", text: "La inteligencia emocional es superior a la inteligencia racional." },
      { id: "D", text: "El buen talento es inútil si no va acompañado de virtudes morales cristianas." }
    ],
    correctId: "A", explanation: "Descartes enfatiza la aplicación ('aplicarlo bien'), lo cual es la tesis central de su obra: la necesidad de un 'método' para dirigir bien la razón.",
    socraticHints: ["¿Qué significa 'aplicarlo bien' en el contexto de resolver problemas?", "¿Qué propone el autor en el título de su obra ('Discurso del método')?"],
    techniqueTip: "Tesis filosófica principal: La inteligencia sin una estructura (método) se pierde o se equivoca."
  },

  // CIENCIAS NATURALES
  { id: "cie_ext_01", category: "CIENCIAS", difficulty: "medium", competency: "CIE_EXPLICACION",
    passageGroup: "experimento_celula", context: PASSAGES_EXTRA.BIOLOGIA_CELULA,
    text: "La diferencia en la producción de ATP entre la Muestra A y la Muestra B se explica porque la Muestra A realizó:",
    options: [
      { id: "A", text: "Fermentación láctica, que es más eficiente produciendo energía." },
      { id: "B", text: "Respiración celular aerobia, que aprovecha completamente la glucosa." },
      { id: "C", text: "Fotosíntesis celular, utilizando el oxígeno como fuente de energía lumínica." },
      { id: "D", text: "Respiración anaerobia, degradando el ácido láctico en oxígeno." }
    ],
    correctId: "B", explanation: "Con oxígeno (Muestra A), ocurre la respiración celular aerobia (36-38 ATP). Sin oxígeno (Muestra B), ocurre la fermentación láctica, que solo rinde 2 ATP por glucosa.",
    socraticHints: ["¿Qué proceso usan las células cuando tienen abundante oxígeno?", "¿Qué proceso genera ácido láctico cuando hacemos mucho ejercicio y nos falta aire?"],
    techniqueTip: "Oxígeno presente = Aerobio (Mucha energía/ATP). Sin oxígeno = Anaerobio/Fermentación (Poca energía, genera ácido láctico)."
  },
  { id: "cie_ext_02", category: "CIENCIAS", difficulty: "hard", competency: "CIE_INDAGACION",
    passageGroup: "experimento_celula", context: PASSAGES_EXTRA.BIOLOGIA_CELULA,
    text: "Si se añadiera un inhibidor que bloquea el funcionamiento de las mitocondrias a la Muestra A de forma permanente, ¿qué resultado se esperaría observar 12 horas después?",
    options: [
      { id: "A", text: "La producción de ATP se mantendría en 36 moléculas, pero no se usaría el oxígeno." },
      { id: "B", text: "Las células morirían instantáneamente al no poder realizar la fermentación celular." },
      { id: "C", text: "El comportamiento sería idéntico al de la Muestra B, bajando la producción a 2 ATP y acumulando ácido láctico." },
      { id: "D", text: "Las mitocondrias comenzarían a producir ácido láctico en lugar de consumir glucosa." }
    ],
    correctId: "C", explanation: "La mitocondria es responsable del metabolismo aerobio. Sin ella funcionante, la célula se ve obligada a depender únicamente de la glucólisis anaerobia en el citoplasma, igual que en la Muestra B.",
    socraticHints: ["¿Dónde ocurre la respiración celular que requiere oxígeno en la célula?", "Si rompes la 'fábrica' principal de energía aerobia, ¿a qué plan de emergencia recurre la célula muscular?"],
    techniqueTip: "Bloquear la mitocondria es equivalente a quitarle el oxígeno a la célula en términos de vía metabólica."
  },

  // SOCIALES Y CIUDADANAS
  { id: "soc_ext_01", category: "SOCIALES", difficulty: "medium", competency: "SOC_PENSAMIENTO",
    passageGroup: "frente_nacional", context: PASSAGES_EXTRA.HISTORIA_COLOMBIA,
    text: "Desde una perspectiva de pluralismo democrático, la principal consecuencia negativa del diseño institucional del Frente Nacional fue:",
    options: [
      { id: "A", text: "La eliminación física de los líderes de los partidos tradicionales." },
      { id: "B", text: "El cierre del sistema político institucional a alternativas distintas al bipartidismo." },
      { id: "C", text: "El aumento descontrolado de la burocracia estatal por el clientelismo extranjero." },
      { id: "D", text: "La entrega del poder a las fuerzas militares durante 16 años ininterrumpidos." }
    ],
    correctId: "B", explanation: "Al repartirse el poder 50-50 y excluir otras opciones, el Frente Nacional cerró las vías institucionales de participación, lo que marginó a otros sectores políticos y sociales.",
    socraticHints: ["¿Qué dice el texto sobre cómo se dividieron el estado?", "¿Qué pasa en una democracia si solo dos partidos tienen derecho por ley a gobernar?"],
    techniqueTip: "En Ciencias Sociales ICFES, los 'pactos de exclusión' suelen asociarse como causas del surgimiento de vías no institucionales/insurgencia."
  },
  { id: "soc_ext_02", category: "SOCIALES", difficulty: "hard", competency: "SOC_MULTIPERSPECTIVISMO",
    passageGroup: "frente_nacional", context: PASSAGES_EXTRA.HISTORIA_COLOMBIA,
    text: "¿Cuál de las siguientes afirmaciones describe mejor cómo verían el Frente Nacional un líder del partido liberal de la época y un líder estudiantil universitario independiente, respectivamente?",
    options: [
      { id: "A", text: "Ambos lo verían como un sistema opresivo dictatorial apoyado por Estados Unidos." },
      { id: "B", text: "El liberal como el motor del comunismo, y el líder estudiantil como un retroceso capitalista." },
      { id: "C", text: "El liberal como el fin necesario de la violencia bipartidista, y el líder estudiantil como un monopolio excluyente del poder." },
      { id: "D", text: "El liberal como una traición al conservatismo, y el líder estudiantil como la verdadera revolución del siglo XX." }
    ],
    correctId: "C", explanation: "Para quienes lo fundaron (liberal/conservador), era la solución a la Violencia. Para los que quedaron fuera del pacto (estudiantes, izquierda), era una oligarquía excluyente.",
    socraticHints: ["Ponte en los zapatos de cada uno. ¿Cómo ve su propio pacto un Liberal?", "¿Cómo ve un acuerdo restrictivo alguien que no pertenece a esos dos partidos?"],
    techniqueTip: "Esta competencia siempre evalúa cómo diferentes actores tienen intereses o lecturas distintas del mismo hecho histórico."
  },
  
  // MATEMÁTICAS
  { id: "mat_ext_01", category: "MATEMATICAS", difficulty: "medium", competency: "MAT_FORMULACION",
    context: "Un plan de telefonía celular cobra una tarifa fija mensual de $30.000, e incluye 500 minutos libres. Por cada minuto adicional consumido, se cobran $50.",
    text: "Si 'x' representa el total de minutos consumidos en el mes (donde x > 500), ¿cuál de las siguientes expresiones calcula el valor total (V) que debe pagar el usuario en ese mes?",
    options: [
      { id: "A", text: "V(x) = 30.000 + 50x" },
      { id: "B", text: "V(x) = 30.000 + 50(x - 500)" },
      { id: "C", text: "V(x) = 30.000x + 50(x - 500)" },
      { id: "D", text: "V(x) = 50(x - 30.000) / 500" }
    ],
    correctId: "B", explanation: "Se paga la tarifa fija ($30.000) MÁS el valor de los minutos extra. Los minutos extra se calculan restando los 500 minutos libres al total consumido (x - 500), y esto se multiplica por los $50.",
    socraticHints: ["¿Se le cobran los 50 pesos por TODOS los minutos 'x' que habló?", "Solo paga los minutos adicionales. ¿Cómo expresas 'los minutos que sobran después de los 500'?"],
    techniqueTip: "Traduce texto a álgebra: 'Cada minuto adicional' significa multiplicar por la diferencia (x - límite base)."
  },
  { id: "mat_ext_02", category: "MATEMATICAS", difficulty: "hard", competency: "MAT_VALIDACION",
    context: "En un colegio, el 60% de los estudiantes son hombres y el 40% son mujeres. Se sabe que el 30% de los hombres y el 20% de las mujeres practican algún deporte.",
    text: "Se afirma que la probabilidad de escoger al azar a un estudiante que practique algún deporte es del 26%. ¿Es correcta esta afirmación?",
    options: [
      { id: "A", text: "Sí, porque es el promedio entre el 30% de los hombres y el 20% de las mujeres ((30+20)/2 = 25%)." },
      { id: "B", text: "No, porque al sumar los que hacen deporte (30% + 20%) da como resultado 50% de la población total." },
      { id: "C", text: "Sí, porque se calcula sumando el 30% del 60% y el 20% del 40%, es decir, (0.3×0.6) + (0.2×0.4) = 0.18 + 0.08 = 0.26." },
      { id: "D", text: "No, porque no se tiene en cuenta la cantidad exacta de estudiantes en el colegio, haciendo imposible calcular probabilidades." }
    ],
    correctId: "C", explanation: "Probabilidad total: (Prob. Hombre × Prob. Deporte dado Hombre) + (Prob. Mujer × Prob. Deporte dado Mujer). 0.6*0.3 + 0.4*0.2 = 0.18 + 0.08 = 26%.",
    socraticHints: ["Imagina un colegio de 100 alumnos. ¿Cuántos son hombres y cuántos mujeres?", "De esos 60 hombres, ¿cuántos hacen deporte? (el 30%) = 18. Haz lo mismo con las mujeres."],
    techniqueTip: "No promedies porcentajes de poblaciones desiguales. Usa el método del 'población inventada de 100' para sacar números enteros rápidos."
  },

  // INGLES
  { id: "eng_ext_01", category: "INGLES", difficulty: "medium", competency: "ENG_A2",
    context: "Read the sign: 'WARNING: ALL VISITORS MUST WEAR HARD HATS BEYOND THIS POINT. NO SNEAKERS ALLOWED.'",
    text: "Where would you most likely see this sign?",
    options: [
      { id: "A", text: "At a public swimming pool." },
      { id: "B", text: "In a construction site." },
      { id: "C", text: "At a formal dinner party." },
      { id: "D", text: "Inside a hospital room." }
    ],
    correctId: "B", explanation: "Hard hats (cascos de trabajo pesados) y la prohibición de sneakers (zapatos tenis) son típicos de una obra o construcción industrial por seguridad.",
    socraticHints: ["¿Qué son 'hard hats'? Piensa en la cabeza de un ingeniero.", "Sneakers son zapatos de goma (tenis). ¿Dónde sería peligroso usarlos?"],
    techniqueTip: "Preguntas de letreros (Parts 1 & 2 del ICFES): busca vocabulario clave asociado a lugares. Hard hat = construction."
  },
  { id: "eng_ext_02", category: "INGLES", difficulty: "hard", competency: "ENG_B1",
    context: "Sarah: I'm completely exhausted. I have been studying non-stop for three days for the biology exam.\nMark: You really should take a break. ______ will just make you forget what you've learned.",
    text: "Which option gracefully completes Mark's advice?",
    options: [
      { id: "A", text: "Burning the midnight oil" },
      { id: "B", text: "Piece of cake" },
      { id: "C", text: "Hitting the road" },
      { id: "D", text: "Under the weather" }
    ],
    correctId: "A", explanation: "La expresión idiomática 'burning the midnight oil' significa trabajar o estudiar hasta altas horas de la noche. Encaja perfecto con estudiar 'non-stop'.",
    socraticHints: ["Busca la expresión que significa 'trabajar hasta muy tarde'.", "Si está cansada, ¿qué hábito le está causando eso?"],
    techniqueTip: "Aprende los idioms comunes (Expresiones idiomáticas). B1 y B1+ evalúan tu conocimiento de frases hechas que no tienen traducción literal."
  }
];
