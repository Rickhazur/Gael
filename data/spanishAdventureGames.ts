/**
 * Spanish Adventure Games - Making grammar and spelling EPIC!
 * Transform boring grammar/orthography into exciting adventures
 */

export interface SpanishAdventureLevel {
  id: string;
  worldName: string;
  worldEmoji: string;
  theme: string;
  description: string;
  bossName: string;
  bossEmoji: string;
  challenges: SpanishChallenge[];
  reward: { coins: number; xp: number; badge?: string };
}

export interface SpanishChallenge {
  id: string;
  type: 'grammar' | 'orthography' | 'accentuation' | 'punctuation' | 'vocabulary';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  powerUp?: string; // Special power-up name if correct
  enemy?: string; // Enemy name if wrong
}

// EPIC ADVENTURE WORLDS FOR SPANISH
export const SPANISH_ADVENTURE_WORLDS: Record<1 | 2 | 3 | 4 | 5, SpanishAdventureLevel[]> = {
  1: [
    {
      id: 'world-1-1',
      worldName: 'El Reino de las Letras Perdidas',
      worldEmoji: '🏰',
      theme: 'Castle adventure',
      description: 'Las letras se han escapado del castillo. ¡Ayuda a Lina a encontrarlas y formar palabras!',
      bossName: 'El Dragón de las Palabras',
      bossEmoji: '🐉',
      challenges: [
        {
          id: 'c1-1',
          type: 'vocabulary',
          question: '¿Qué palabra falta? "El ___ es rojo"',
          options: ['sol', 'luna', 'cielo', 'mar'],
          correctAnswer: 'sol',
          explanation: '¡Correcto! El sol es rojo al atardecer.',
          powerUp: 'Espada de Letras',
          enemy: 'Monstruo de Confusión'
        },
        {
          id: 'c1-2',
          type: 'grammar',
          question: 'Elige la palabra correcta: "Yo tengo un ___"',
          options: ['perro', 'perra', 'perros', 'perras'],
          correctAnswer: 'perro',
          explanation: '¡Genial! "Perro" es masculino singular.',
          powerUp: 'Escudo Gramatical',
          enemy: 'Fantasma de los Errores'
        },
        {
          id: 'c1-3',
          type: 'grammar',
          question: 'Elige el artículo correcto: "___ casa es grande"',
          options: ['El', 'La', 'Los', 'Las'],
          correctAnswer: 'La',
          explanation: '¡Perfecto! "Casa" es femenino, usa "la".',
          powerUp: 'Artículo Mágico',
          enemy: 'Duende de los Artículos'
        },
        {
          id: 'c1-4',
          type: 'vocabulary',
          question: '¿Qué palabra completa la frase? "Mi ___ se llama Lina"',
          options: ['mamá', 'casa', 'perro', 'libro'],
          correctAnswer: 'mamá',
          explanation: '¡Excelente! "Mamá" es una palabra de familia.',
          powerUp: 'Corazón Familiar',
          enemy: 'Fantasma Olvidadizo'
        }
      ],
      reward: { coins: 50, xp: 100, badge: 'Guardián de Letras' }
    },
    {
      id: 'world-1-2',
      worldName: 'La Selva de los Acentos',
      worldEmoji: '🌴',
      theme: 'Jungle adventure',
      description: 'Los acentos se han escondido en la selva. ¡Encuéntralos antes de que las palabras se vuelvan locas!',
      bossName: 'El Jaguar Sin Acento',
      bossEmoji: '🐆',
      challenges: [
        {
          id: 'c2-1',
          type: 'accentuation',
          question: '¿Dónde va el acento? "mama" (mamá)',
          options: ['máma', 'mamá', 'mama', 'mámá'],
          correctAnswer: 'mamá',
          explanation: '¡Perfecto! "Mamá" lleva acento en la última sílaba.',
          powerUp: 'Acento Mágico',
          enemy: 'Serpiente Sin Acento'
        },
        {
          id: 'c2-2',
          type: 'accentuation',
          question: '¿Cómo se escribe correctamente? "nino"',
          options: ['niño', 'nino', 'níño', 'nino'],
          correctAnswer: 'niño',
          explanation: '¡Bien! "Niño" lleva ñ y acento.',
          powerUp: 'Ñ Protectora',
          enemy: 'Monstruo Sin Ñ'
        },
        {
          id: 'c2-3',
          type: 'orthography',
          question: 'Escribe correctamente: "El ___ (niño) juega"',
          options: ['niño', 'nino', 'niño', 'nino'],
          correctAnswer: 'niño',
          explanation: '¡Correcto! Siempre usa ñ en "niño".',
          powerUp: 'Espada de la Ñ',
          enemy: 'Dragón Sin Ñ'
        }
      ],
      reward: { coins: 60, xp: 120, badge: 'Cazador de Acentos' }
    }
  ],
  2: [
    {
      id: 'world-2-1',
      worldName: 'El Laberinto de los Verbos',
      worldEmoji: '🌀',
      theme: 'Maze adventure',
      description: 'Los verbos están atrapados en un laberinto. ¡Conjuga correctamente para liberarlos!',
      bossName: 'El Minotauro de los Tiempos',
      bossEmoji: '🐂',
      challenges: [
        {
          id: 'c3-1',
          type: 'grammar',
          question: 'Conjuga: "Yo ___ (jugar) en el parque"',
          options: ['juego', 'jugo', 'juga', 'jugamos'],
          correctAnswer: 'juego',
          explanation: '¡Excelente! "Yo juego" es presente simple.',
          powerUp: 'Verbo Poderoso',
          enemy: 'Fantasma del Pasado'
        },
        {
          id: 'c3-2',
          type: 'grammar',
          question: 'Conjuga: "Tú ___ (correr) muy rápido"',
          options: ['corres', 'corre', 'corro', 'corren'],
          correctAnswer: 'corres',
          explanation: '¡Genial! "Tú corres" es la conjugación correcta.',
          powerUp: 'Velocidad Épica',
          enemy: 'Tortuga Lenta'
        },
        {
          id: 'c3-3',
          type: 'grammar',
          question: 'Elige la forma correcta: "Nosotros ___ (comer) pizza"',
          options: ['comemos', 'come', 'como', 'comen'],
          correctAnswer: 'comemos',
          explanation: '¡Perfecto! "Nosotros comemos" concuerda con el sujeto.',
          powerUp: 'Poder del Nosotros',
          enemy: 'Duende de la Discordancia'
        }
      ],
      reward: { coins: 70, xp: 150, badge: 'Maestro de Verbos' }
    }
  ],
  3: [
    {
      id: 'world-3-1',
      worldName: 'La Torre de la Ortografía',
      worldEmoji: '🗼',
      theme: 'Tower defense',
      description: 'Sube la torre derrotando monstruos de ortografía. ¡Cada nivel es más difícil!',
      bossName: 'El Rey de las Reglas',
      bossEmoji: '👑',
      challenges: [
        {
          id: 'c4-1',
          type: 'orthography',
          question: 'Escribe correctamente: "El ___ (niño) juega"',
          options: ['niño', 'nino', 'niño', 'nino'],
          correctAnswer: 'niño',
          explanation: '¡Bien! "Niño" lleva ñ, no n.',
          powerUp: 'Espada de Ortografía',
          enemy: 'Dragón de los Errores'
        },
        {
          id: 'c4-2',
          type: 'orthography',
          question: '¿Cómo se escribe? "El ___ (año) nuevo"',
          options: ['año', 'ano', 'año', 'ano'],
          correctAnswer: 'año',
          explanation: '¡Correcto! "Año" siempre lleva ñ.',
          powerUp: 'Escudo del Año',
          enemy: 'Monstruo Sin Ñ'
        },
        {
          id: 'c4-3',
          type: 'orthography',
          question: 'Elige la palabra correcta: "___ (haber) muchas flores"',
          options: ['Hay', 'Ahí', 'Ay', 'Hay'],
          correctAnswer: 'Hay',
          explanation: '¡Perfecto! "Hay" es del verbo haber.',
          powerUp: 'Rayo de Claridad',
          enemy: 'Fantasma de la Confusión'
        },
        {
          id: 'c4-4',
          type: 'orthography',
          question: '¿Cuál es correcta? "Voy ___ (a ver) la película"',
          options: ['a ver', 'haber', 'a ver', 'haber'],
          correctAnswer: 'a ver',
          explanation: '¡Genial! "A ver" son dos palabras separadas.',
          powerUp: 'Separador Mágico',
          enemy: 'Dragón de las Palabras Juntas'
        }
      ],
      reward: { coins: 80, xp: 180, badge: 'Defensor de la Torre' }
    }
  ],
  4: [
    {
      id: 'world-4-1',
      worldName: 'El Océano de las Comas',
      worldEmoji: '🌊',
      theme: 'Ocean adventure',
      description: 'Navega por el océano colocando comas y puntos correctamente. ¡Los piratas te persiguen!',
      bossName: 'El Capitán Puntuación',
      bossEmoji: '🏴‍☠️',
      challenges: [
        {
          id: 'c5-1',
          type: 'punctuation',
          question: '¿Dónde va la coma? "Hola cómo estás"',
          options: ['Hola, cómo estás', 'Hola cómo, estás', 'Hola, cómo, estás', 'Hola cómo estás'],
          correctAnswer: 'Hola, cómo estás',
          explanation: '¡Perfecto! Después de un saludo va coma.',
          powerUp: 'Brújula de Puntuación',
          enemy: 'Kraken de las Comas'
        },
        {
          id: 'c5-2',
          type: 'punctuation',
          question: '¿Dónde va el punto? "Voy al parque___ Luego jugaré"',
          options: ['Voy al parque. Luego jugaré', 'Voy al parque, Luego jugaré', 'Voy al parque Luego jugaré', 'Voy al parque; Luego jugaré'],
          correctAnswer: 'Voy al parque. Luego jugaré',
          explanation: '¡Excelente! Entre oraciones completas va punto.',
          powerUp: 'Punto Final',
          enemy: 'Pirata Sin Puntos'
        },
        {
          id: 'c5-3',
          type: 'punctuation',
          question: 'Elige la frase correcta',
          options: [
            'María, Juan y Pedro juegan.',
            'María Juan y Pedro juegan.',
            'María, Juan, y Pedro juegan.',
            'María Juan, y Pedro juegan.'
          ],
          correctAnswer: 'María, Juan y Pedro juegan.',
          explanation: '¡Genial! Antes de "y" no va coma en listas simples.',
          powerUp: 'Coma Inteligente',
          enemy: 'Monstruo de las Comas'
        }
      ],
      reward: { coins: 90, xp: 200, badge: 'Navegante de la Gramática' }
    }
  ],
  5: [
    {
      id: 'world-5-1',
      worldName: 'El Universo de los Textos',
      worldEmoji: '🌌',
      theme: 'Space adventure',
      description: 'Viaja por el espacio creando textos épicos. ¡Derrota al villano final!',
      bossName: 'El Emperador de la Escritura',
      bossEmoji: '👽',
      challenges: [
        {
          id: 'c6-1',
          type: 'grammar',
          question: 'Elige la oración correcta',
          options: [
            'El niño juega en el parque.',
            'El niño juegan en el parque.',
            'El niño jugar en el parque.',
            'El niño jugamos en el parque.'
          ],
          correctAnswer: 'El niño juega en el parque.',
          explanation: '¡Genial! El sujeto y verbo concuerdan.',
          powerUp: 'Rayo de Coherencia',
          enemy: 'Alien de la Discordancia'
        },
        {
          id: 'c6-2',
          type: 'grammar',
          question: 'Elige la forma correcta: "Los niños ___ (estudiar) mucho"',
          options: ['estudian', 'estudia', 'estudio', 'estudiamos'],
          correctAnswer: 'estudian',
          explanation: '¡Perfecto! "Los niños" es plural, usa "estudian".',
          powerUp: 'Poder del Plural',
          enemy: 'Fantasma del Singular'
        },
        {
          id: 'c6-3',
          type: 'grammar',
          question: 'Elige la oración con concordancia correcta',
          options: [
            'Las flores son bonitas.',
            'Las flores es bonitas.',
            'Las flores son bonito.',
            'Las flores es bonito.'
          ],
          correctAnswer: 'Las flores son bonitas.',
          explanation: '¡Excelente! Todo concuerda: sujeto plural, verbo plural, adjetivo plural.',
          powerUp: 'Armadura de Concordancia',
          enemy: 'Dragón de la Discordancia'
        },
        {
          id: 'c6-4',
          type: 'grammar',
          question: 'Elige la forma correcta del verbo: "Yo ___ (querer) jugar"',
          options: ['quiero', 'quiere', 'queremos', 'quieren'],
          correctAnswer: 'quiero',
          explanation: '¡Genial! "Yo quiero" es la conjugación correcta.',
          powerUp: 'Deseo Poderoso',
          enemy: 'Duende de los Verbos'
        }
      ],
      reward: { coins: 100, xp: 250, badge: 'Héroe del Español' }
    }
  ]
};

export const getSpanishAdventureWorlds = (grade: 1 | 2 | 3 | 4 | 5): SpanishAdventureLevel[] =>
  SPANISH_ADVENTURE_WORLDS[grade] || [];
