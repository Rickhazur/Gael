import type { TutorReport } from "@/types/tutor";

// Grade-appropriate vocabulary and responses
export const gradeVocabulary: Record<number, { words: string[]; phrases: string[]; grammarFocus: string[] }> = {
  1: {
    words: ["cat", "dog", "sun", "moon", "book", "ball", "red", "blue", "big", "small", "happy", "sad", "run", "jump", "eat", "drink"],
    phrases: ["I am", "You are", "This is", "What is", "I like", "I see", "I have", "It is"],
    grammarFocus: ["Simple present tense", "Basic nouns", "Colors", "Numbers 1-20", "Simple adjectives"],
  },
  2: {
    words: ["friend", "family", "school", "teacher", "apple", "water", "house", "animal", "plant", "weather", "today", "yesterday"],
    phrases: ["I want to", "Can I have", "Do you like", "Where is the", "I am going to", "She is", "He is", "They are"],
    grammarFocus: ["Present progressive", "Simple questions", "Plurals", "Basic prepositions", "Days of the week"],
  },
  3: {
    words: ["environment", "community", "celebration", "discovery", "adventure", "imagination", "character", "problem", "solution", "describe"],
    phrases: ["In my opinion", "I think that", "For example", "First, then, finally", "Because of", "Even though"],
    grammarFocus: ["Past simple tense", "Conjunctions", "Comparative adjectives", "Sequence words", "Paragraphs"],
  },
  4: {
    words: ["hypothesis", "experiment", "evidence", "conclusion", "perspective", "analyze", "compare", "contrast", "significant", "demonstrate"],
    phrases: ["According to", "In addition", "On the other hand", "As a result", "In conclusion", "For instance"],
    grammarFocus: ["Past progressive", "Passive voice basics", "Complex sentences", "Cause and effect", "Essay structure"],
  },
  5: {
    words: ["interpretation", "synthesis", "evaluation", "methodology", "phenomenon", "implication", "substantial", "predominant", "coherent", "elaborate"],
    phrases: ["Furthermore", "Nevertheless", "Consequently", "In contrast to", "With regard to", "It can be concluded that"],
    grammarFocus: ["Perfect tenses", "Conditional sentences", "Complex passive", "Academic vocabulary", "Research writing"],
  },
  6: {
    words: ["personal information", "alphabet", "spelling", "routine", "frequency", "description", "countable", "uncountable", "community", "directions", "weather", "clothes"],
    phrases: ["Nice to meet you", "How do you spell", "I usually...", "There is a...", "I like...", "How can I get to", "It is raining", "I am wearing"],
    grammarFocus: ["Verb to be & Pronouns", "Simple Present & Adverbs", "There is/are", "Like/Love/Hate", "Countable & Uncountable", "Present Continuous", "Prepositions & Connectors"],
  },
};

// Ollie's personality traits by context
export const ollieResponses = {
  greetings: {
    1: ["Hi friend! 🌟", "Hello! Ready to learn? 🦉", "Yay, you're here! 🎉"],
    2: ["Hey there, buddy! 🌈", "Hello! Let's have fun learning! 📚", "Great to see you! 🦉"],
    3: ["Hello! Ready for today's adventure? 🚀", "Hi there! Let's explore English together! 📖", "Welcome back! 🌟"],
    4: ["Hello! Excited to learn something new today? 💡", "Hi! Let's tackle some challenges! 🎯", "Great to have you here! 📚"],
    5: ["Hello! Ready for an engaging lesson? 🎓", "Hi there! Let's dive into today's topic! 🌊", "Welcome! Time to expand your skills! ✨"],
    6: ["Welcome to Grade 6! Ready for secondary? 🎓", "Hello! Let's level up your English skills! 🚀", "Hi! Ready to explore 'My World and Me'? 🌍"],
  },
  encouragement: {
    1: ["Super job! ⭐", "Wow, you did it! 🎉", "Yay! You're amazing! 🌟", "Great work! 👏"],
    2: ["Excellent! Keep going! 🚀", "You're doing great! 💪", "Fantastic work! 🌈", "Well done! 🎯"],
    3: ["Impressive work! You're improving! 📈", "Great thinking! 🧠", "You're on fire! 🔥", "Excellent effort! ⭐"],
    4: ["Outstanding! Your skills are growing! 🌱", "Brilliant analysis! 💎", "You're mastering this! 🏆", "Excellent reasoning! 🎯"],
    5: ["Exceptional work! 🌟", "Your understanding is impressive! 💡", "Sophisticated thinking! 🎓", "You're excelling! 🏅"],
    6: ["Fantastic! You're mastering Grade 6 topics! 🏆", "Excellent use of the language! 🌟", "Great job with that grammar point! 🎯", "You're speaking like a pro! 🗣️"],
  },
  correction: {
    1: ["Oops! Let's try again! 😊", "Almost! Here's a hint... 💡", "Good try! Let me help! 🤝"],
    2: ["Close! Let's figure it out together! 🔍", "Not quite, but you're thinking! 🧠", "Let's practice this one more time! 📝"],
    3: ["Interesting approach! Let's refine it. 🔧", "You're on the right track! Let me explain... 📖", "Good effort! Here's what we can improve... ✨"],
    4: ["That's a common challenge! Let me clarify... 📚", "I see your reasoning! Let's adjust... 🔄", "Good attempt! Consider this perspective... 💭"],
    5: ["Thoughtful response! Let's analyze further... 🔬", "You're close! Let's examine the nuances... 🎯", "Solid thinking! Here's additional context... 📖"],
    6: ["Not quite right, but a great attempt! 📖", "Let's review that structure together. 🤝", "Almost! Think about the verb conjugation. 💡"],
  },
};

// --- BRIDGE MODE RESPONSES (Spanish + English teaching) ---
export const ollieBridgeResponses = {
  greetings: {
    1: ["¡Hola amigo! 🌟 Ready to learn some English?", "¡Hola! ¿Listo para aprender? Let's go! 🦉", "¡Qué alegría verte! Yay, you're here! 🎉"],
    2: ["¡Hola, amiguito! 🌈 Today we'll have fun!", "¡Hola! Vamos a aprender inglés juntos. 📚 Ready?", "¡Qué bueno verte por aquí! It's great to see you! 🦉"],
    3: ["¡Hola! ¿Listo para la aventura de hoy? 🚀 Let's explore!", "¡Hola! Vamos a descubrir palabras nuevas en inglés. Ready?", "¡Bienvenido de nuevo! Welcome back! 🌟"],
    4: ["¡Hola! ¿Emocionado por aprender algo nuevo? 💡 Let's start!", "¡Hola! Hoy vamos a superar nuevos retos. Ready?", "¡Qué bien que estés aquí! It's great to have you! 📚"],
    5: ["¡Hola! ¿Listo para una súper clase? 🎓 Let's dive in!", "¡Hola! Vamos a expandir tus habilidades en inglés. Ready?", "¡Bienvenido! Es momento de aprender más. ✨"],
    6: ["¡Bienvenido a 6º grado! 🎉 Ready for a new challenge?", "¡Hola! Vamos a conquistar el nivel A2 juntos. 🚀", "¡Bienvenido! Let's explore your world in English. 🌍"],
  },
  encouragement: {
    1: ["¡Súper bien! ⭐ You did a great job!", "¡Wow, lo lograste! 🎉 Amazing!", "¡Eso es! You're amazing! 🌟", "¡Gran trabajo! Great work! 👏"],
    2: ["¡Excelente! Keep going! 🚀", "¡Lo estás haciendo muy bien! 💪 You're doing great!", "¡Fantástico! Fantastic work! 🌈", "¡Bien hecho! Well done! 🎯"],
    3: ["¡Impresionante! You're improving! 📈", "¡Qué buen pensamiento! 🧠 Great thinking!", "¡Estás encendido! You're on fire! 🔥", "¡Excelente esfuerzo! Excellent effort! ⭐"],
    4: ["¡Sobresaliente! Your skills are growing! 🌱", "¡Brillante análisis! 💎 Brilliant!", "¡Lo estás dominando! You're mastering this! 🏆", "¡Excelente razonamiento! Excellent! 🎯"],
    5: ["¡Trabajo excepcional! 🌟 Exceptional!", "¡Tu comprensión es impresionante! 💡 Impressive!", "¡Pensamiento muy sofisticado! 🎓 Smart!", "¡Estás sobresaliendo! You're excelling! 🏅"],
    6: ["¡Maravilloso! 🌟 You're doing a pro job!", "¡Excelente! Estás dominando 6º grado. 🏆", "¡Qué bien usas el inglés! Great work! 🌈", "¡Muy bien! Estás progresando rápido. 📈"],
  },
  correction: {
    1: ["¡Ups! Inténtalo de nuevo. 😊 Let's try again!", "¡Casi! Te doy una pista... 💡 Hint!", "¡Buen intento! Yo te ayudo. 🤝 Let me help!"],
    2: ["¡Cerca! Vamos a resolverlo juntos. 🔍 Together!", "No es exactamente así, ¡pero vas bien! 🧠 Keep thinking!", "Vamos a practicarlo una vez más. 📝 One more time!"],
    3: ["¡Qué enfoque tan interesante! Let's refine it. 🔧", "¡Vas por buen camino! Let me explain... 📖", "¡Buen esfuerzo! Aquí podemos mejorar... ✨"],
    4: ["¡Ese es un reto común! Let me clarify... 📚", "¡Entiendo tu razonamiento! Let's adjust... 🔄", "¡Buen intento! Mira esta perspectiva... 💭"],
    5: ["¡Respuesta muy pensada! Let's analyze further... 🔬", "¡Estás cerca! Let's examine the nuances... 🎯", "¡Sólido pensamiento! Here's additional context... 📖"],
    6: ["¡Cerca! Vamos a revisar la regla gramatical. 🤝", "Buen intento, pero revisemos esto de nuevo. 📖", "¡Casi lo tienes! Piensa en el pronombre. 💡"],
  },
};

// Generate personalized lesson based on reports
export const generatePersonalizedContent = (
  reports: TutorReport[],
  gradeLevel: number,
  focusArea?: string,
  immersionMode: 'bilingual' | 'standard' = 'bilingual'
): { topic: string; vocabulary: string[]; exercise: string; tips: string[] } => {
  const gradeContent = gradeVocabulary[gradeLevel] || gradeVocabulary[3];

  // Extract challenges from reports
  const allChallenges = reports.flatMap(r => r.challenges);
  const priorityChallenge = focusArea
    ? allChallenges.find(c => c.area.toLowerCase().includes(focusArea.toLowerCase()))
    : allChallenges.find(c => c.severity === "high") || allChallenges[0];

  if (priorityChallenge) {
    const subject = reports.find(r => r.challenges.includes(priorityChallenge))?.subject || "your studies";
    const topic = priorityChallenge.englishConnection;
    const vocabWords = gradeContent.words.slice(0, 6).join(", ");
    return {
      topic,
      vocabulary: gradeContent.words.slice(0, 6),
      exercise: immersionMode === 'standard'
        ? `¡Vamos a practicar "${topic}"! Estas palabras te ayudarán con ${priorityChallenge.area} en ${subject}. Let's practice: ${vocabWords}`
        : `Let's practice ${topic} to help with ${priorityChallenge.area} in ${subject}!`,
      tips: immersionMode === 'standard'
        ? [
          `Enfócate en: ${topic}`,
          `Esto te ayudará con: ${priorityChallenge.description}`,
          `Objetivo grado ${gradeLevel}: ${gradeContent.grammarFocus[0]}`,
        ]
        : [
          `Focus on: ${topic}`,
          `This will help you with: ${priorityChallenge.description}`,
          `Grade ${gradeLevel} goal: ${gradeContent.grammarFocus[0]}`,
        ],
    };
  }

  const grammarFocus = gradeContent.grammarFocus[0];
  return {
    topic: grammarFocus,
    vocabulary: gradeContent.words.slice(0, 6),
    exercise: immersionMode === 'standard'
      ? `¡Hoy trabajaremos en ${grammarFocus}! Hoy trabajaremos en eso.`
      : `Today we'll work on ${grammarFocus}!`,
    tips: immersionMode === 'standard'
      ? gradeContent.grammarFocus.slice(0, 3).map(t => `Consejo: ${t}`)
      : gradeContent.grammarFocus.slice(0, 3),
  };
};

// Get Ollie's response based on grade, context, and mode
export const getOllieResponse = (
  gradeLevel: number,
  context: "greeting" | "encouragement" | "correction",
  mode: 'bilingual' | 'standard' = 'bilingual'
): string => {
  const source = mode === 'bilingual' ? ollieResponses : ollieBridgeResponses;
  const responses = source[context === "greeting" ? "greetings" : context];
  const gradeResponses = responses[gradeLevel as keyof typeof responses] || responses[3];
  return gradeResponses[Math.floor(Math.random() * gradeResponses.length)];
};

// Sample reports for demo
export const sampleTutorReports: TutorReport[] = [
  {
    id: "1",
    source: "research-center",
    subject: "Science",
    emoji: "🔬",
    date: new Date().toISOString(),
    overallScore: 72,
    trend: "up",
    challenges: [
      {
        id: "c1",
        area: "Scientific Vocabulary",
        severity: "high",
        description: "Struggles with scientific terms like 'hypothesis' and 'experiment'",
        englishConnection: "Academic vocabulary practice",
      },
      {
        id: "c2",
        area: "Lab Report Writing",
        severity: "medium",
        description: "Difficulty writing clear conclusions",
        englishConnection: "Sentence structure and clarity",
      },
    ],
    recommendations: [
      "Practice science-related vocabulary daily",
      "Work on writing complete sentences",
      "Use visual aids for complex terms",
    ],
  },
  {
    id: "2",
    source: "math-tutor",
    subject: "Mathematics",
    emoji: "🧮",
    date: new Date().toISOString(),
    overallScore: 65,
    trend: "stable",
    challenges: [
      {
        id: "c3",
        area: "Word Problems",
        severity: "high",
        description: "Difficulty understanding math word problems in English",
        englishConnection: "Reading comprehension for math",
      },
      {
        id: "c4",
        area: "Instructions",
        severity: "medium",
        description: "Misunderstands multi-step instructions",
        englishConnection: "Sequence words and imperative verbs",
      },
    ],
    recommendations: [
      "Focus on keywords in word problems",
      "Practice step-by-step instructions",
      "Learn math vocabulary in English",
    ],
  },
  {
    id: "3",
    source: "research-center",
    subject: "Social Studies",
    emoji: "🌍",
    date: new Date().toISOString(),
    overallScore: 58,
    trend: "down",
    challenges: [
      {
        id: "c5",
        area: "Historical Dates",
        severity: "medium",
        description: "Confuses date formats and ordinal numbers",
        englishConnection: "Ordinal numbers and date expressions",
      },
      {
        id: "c6",
        area: "Essay Writing",
        severity: "high",
        description: "Struggles with cause-and-effect explanations",
        englishConnection: "Conjunctions and transition words",
      },
    ],
    recommendations: [
      "Practice writing dates in English format",
      "Learn cause-effect connectors",
      "Work on paragraph organization",
    ],
  },
];
