import { MathHintSet, ColorOption, Curriculum } from '../types/tutor';

// Geometry hints for IB PYP and Colombian curriculum
const geometryHints: MathHintSet = {
  type: 'geometry',
  icon: '📐',
  title: { en: 'Geometry', es: 'Geometría' },
  steps: [
    {
      id: 1,
      title: { en: 'Identify', es: 'Identifica' },
      description: {
        en: 'What shape is it? Triangle, square, or circle?',
        es: '¿Qué figura es? ¿Triángulo, cuadrado o círculo?'
      },
      visualType: 'shapes',
      starter: {
        en: 'This shape is a...',
        es: 'Esta figura es un...'
      }
    },
    {
      id: 2,
      title: { en: 'Count', es: 'Cuenta' },
      description: {
        en: 'Count the sides and corners (vertices)',
        es: 'Cuenta los lados y las esquinas (vértices)'
      },
      visualType: 'shapes',
      starter: {
        en: 'It has... sides and... corners',
        es: 'Tiene... lados y... esquinas'
      }
    },
    {
      id: 3,
      title: { en: 'Measure', es: 'Mide' },
      description: {
        en: 'Compare the lengths of the sides',
        es: 'Compara las longitudes de los lados'
      },
      visualType: 'measurement',
      starter: {
        en: 'The sides are... (equal/different)',
        es: 'Los lados son... (iguales/diferentes)'
      }
    },
    {
      id: 4,
      title: { en: 'Classify', es: 'Clasifica' },
      description: {
        en: 'What type of shape is it based on its properties?',
        es: '¿Qué tipo de figura es según sus propiedades?'
      },
      visualType: 'diagram',
      starter: {
        en: 'This is a... because...',
        es: 'Este es un... porque...'
      }
    },
    {
      id: 5,
      title: { en: 'Area', es: 'Área' },
      description: {
        en: 'Calculate the area using small squares',
        es: 'Calcula el área usando cuadrados pequeños'
      },
      visualType: 'measurement',
      starter: {
        en: 'The area is approximately... square units',
        es: 'El área es aproximadamente... unidades cuadradas'
      }
    }
  ]
};

// Quinto grado: problemas difíciles (área triángulo, círculo, volumen, ángulos, Pitágoras)
const geometryGrade5Hints: MathHintSet = {
  type: 'geometry',
  icon: '📐',
  title: { en: 'Geometry (Grade 5)', es: 'Geometría (5° grado)' },
  steps: [
    { id: 1, title: { en: 'Triangle area', es: 'Área del triángulo' }, description: { en: 'Area = base × height ÷ 2', es: 'Área = base × altura ÷ 2' }, visualType: 'shapes', starter: { en: 'Multiply base by height, then divide by 2.', es: 'Multiplica base por altura y divide entre 2.' } },
    { id: 2, title: { en: 'Circle area', es: 'Área del círculo' }, description: { en: 'Area = π × r² (radius squared, then × 3.14)', es: 'Área = π × r² (radio al cuadrado, luego × 3.14)' }, visualType: 'shapes', starter: { en: 'First r², then multiply by π (3.14).', es: 'Primero r², luego multiplica por π (3.14).' } },
    { id: 3, title: { en: 'Circumference', es: 'Circunferencia' }, description: { en: 'Circumference = 2 × π × radius', es: 'Circunferencia = 2 × π × radio' }, visualType: 'shapes', starter: { en: 'Double the radius, then multiply by 3.14.', es: 'Doble del radio, luego multiplica por 3.14.' } },
    { id: 4, title: { en: 'Cube volume', es: 'Volumen del cubo' }, description: { en: 'Volume = side × side × side (side³)', es: 'Volumen = lado × lado × lado (lado³)' }, visualType: 'shapes', starter: { en: 'Multiply the side by itself three times.', es: 'Multiplica el lado por sí mismo tres veces.' } },
    { id: 5, title: { en: 'Triangle angles', es: 'Ángulos del triángulo' }, description: { en: 'The three interior angles of any triangle add up to 180°.', es: 'Los tres ángulos internos de cualquier triángulo suman 180°.' }, visualType: 'shapes', starter: { en: 'Sum = 180°.', es: 'La suma es 180°.' } },
    { id: 6, title: { en: 'Pythagoras', es: 'Pitágoras' }, description: { en: 'In a right triangle: a² + b² = c². Find c: square both legs, add, then take the square root.', es: 'En un triángulo rectángulo: a² + b² = c². Para c: eleva los catetos al cuadrado, suma y saca la raíz.' }, visualType: 'shapes', starter: { en: 'c² = a² + b²; then c = √(a² + b²).', es: 'c² = a² + b²; luego c = √(a² + b²).' } }
  ]
};

const wordProblemHints: MathHintSet = {
  type: 'word_problem',
  icon: '🧩',
  title: { en: 'Word Problems', es: 'Problemas verbales' },
  steps: [
    { id: 1, title: { en: 'Read and understand', es: 'Leer y entender' }, description: { en: 'What is the problem asking? (total, each, left, missing?)', es: '¿Qué pregunta el problema? (total, cada uno, quedan, faltan?)' }, visualType: 'shapes', starter: { en: 'The question asks for...', es: 'La pregunta pide...' } },
    { id: 2, title: { en: 'Find the numbers', es: 'Encontrar los números' }, description: { en: 'Underline or list the numbers and their units (kg, liters, etc.)', es: 'Subraya o anota los números y sus unidades (kg, litros, etc.)' }, visualType: 'shapes', starter: { en: 'The numbers are...', es: 'Los números son...' } },
    { id: 3, title: { en: 'Choose the operation', es: 'Elegir la operación' }, description: { en: 'Total / more → add. Left / less → subtract. Groups of / each → multiply or divide.', es: 'Total / más → sumar. Quedan / menos → restar. Grupos de / cada uno → multiplicar o dividir.' }, visualType: 'equation', starter: { en: 'I need to... (add / subtract / multiply / divide)', es: 'Necesito... (sumar / restar / multiplicar / dividir)' } },
    { id: 4, title: { en: 'Solve step by step', es: 'Resolver paso a paso' }, description: { en: 'Do one operation at a time. For multi-step, find the first result, then use it in the next step.', es: 'Haz una operación a la vez. En varios pasos, halla el primer resultado y úsalo en el siguiente.' }, visualType: 'equation', starter: { en: 'First I... then I...', es: 'Primero... luego...' } }
  ]
};

export const mathHints: MathHintSet[] = [
  // Geometry first for visibility
  geometryHints,
  geometryGrade5Hints,
  wordProblemHints,
  {
    type: 'fractions',
    icon: '🍕',
    title: { en: 'Fractions', es: 'Fracciones' },
    steps: [
      {
        id: 1,
        title: { en: 'Represent', es: 'Representa' },
        description: {
          en: 'Draw the fractions using blocks or strips',
          es: 'Dibuja las fracciones usando bloques o tiras'
        },
        visualType: 'fractionBar',
        starter: {
          en: 'I can see this fraction as...',
          es: 'Puedo ver esta fracción como...'
        }
      },
      {
        id: 2,
        title: { en: 'Common Denominator', es: 'Denominador Común' },
        description: {
          en: 'Find the common denominator for both fractions',
          es: 'Encuentra el denominador común para ambas fracciones'
        },
        visualType: 'equation',
        starter: {
          en: 'The common denominator is...',
          es: 'El denominador común es...'
        }
      },
      {
        id: 3,
        title: { en: 'Convert', es: 'Convierte' },
        description: {
          en: 'Convert fractions to have the same denominator',
          es: 'Convierte las fracciones para que tengan el mismo denominador'
        },
        visualType: 'fractionBar',
        starter: {
          en: 'Now both fractions are...',
          es: 'Ahora ambas fracciones son...'
        }
      },
      {
        id: 4,
        title: { en: 'Calculate', es: 'Calcula' },
        description: {
          en: 'Perform the operation (add or subtract)',
          es: 'Realiza la operación (suma o resta)'
        },
        visualType: 'equation',
        starter: {
          en: 'The result is...',
          es: 'El resultado es...'
        }
      },
      {
        id: 5,
        title: { en: 'Simplify', es: 'Simplifica' },
        description: {
          en: 'Simplify or convert to mixed number',
          es: 'Simplifica o convierte a número mixto'
        },
        visualType: 'fractionBar',
        starter: {
          en: 'The simplified answer is...',
          es: 'La respuesta simplificada es...'
        }
      }
    ]
  },
  {
    type: 'addition',
    icon: '➕',
    title: { en: 'Addition', es: 'Suma' },
    steps: [
      {
        id: 1,
        title: { en: 'Identify', es: 'Identifica' },
        description: {
          en: 'Find the numbers to add',
          es: 'Encuentra los números a sumar'
        },
        visualType: 'blocks',
        starter: {
          en: 'I need to add...',
          es: 'Necesito sumar...'
        }
      },
      {
        id: 2,
        title: { en: 'Visualize', es: 'Visualiza' },
        description: {
          en: 'Use a number line or blocks',
          es: 'Usa una línea numérica o bloques'
        },
        visualType: 'numberLine',
        starter: {
          en: 'Starting from...',
          es: 'Empezando desde...'
        }
      },
      {
        id: 3,
        title: { en: 'Calculate', es: 'Calcula' },
        description: {
          en: 'Add step by step',
          es: 'Suma paso a paso'
        },
        visualType: 'equation',
        starter: {
          en: 'The sum is...',
          es: 'La suma es...'
        }
      }
    ]
  },
  {
    type: 'subtraction',
    icon: '➖',
    title: { en: 'Subtraction', es: 'Resta' },
    steps: [
      {
        id: 1,
        title: { en: 'Identify', es: 'Identifica' },
        description: {
          en: 'Find what you have and what to take away',
          es: 'Encuentra lo que tienes y lo que debes quitar'
        },
        visualType: 'blocks',
        starter: {
          en: 'I start with... and take away...',
          es: 'Empiezo con... y quito...'
        }
      },
      {
        id: 2,
        title: { en: 'Visualize', es: 'Visualiza' },
        description: {
          en: 'Cross out or move backwards on number line',
          es: 'Tacha o retrocede en la línea numérica'
        },
        visualType: 'numberLine',
        starter: {
          en: 'Moving back from...',
          es: 'Retrocediendo desde...'
        }
      },
      {
        id: 3,
        title: { en: 'Calculate', es: 'Calcula' },
        description: {
          en: 'Find the difference',
          es: 'Encuentra la diferencia'
        },
        visualType: 'equation',
        starter: {
          en: 'The difference is...',
          es: 'La diferencia es...'
        }
      }
    ]
  },
  {
    type: 'multiplication',
    icon: '✖️',
    title: { en: 'Multiplication', es: 'Multiplicación' },
    steps: [
      {
        id: 1,
        title: { en: 'Understand', es: 'Comprende' },
        description: {
          en: 'Groups of equal amounts',
          es: 'Grupos de cantidades iguales'
        },
        visualType: 'blocks',
        starter: {
          en: 'I have... groups of...',
          es: 'Tengo... grupos de...'
        }
      },
      {
        id: 2,
        title: { en: 'Visualize', es: 'Visualiza' },
        description: {
          en: 'Draw arrays or groups',
          es: 'Dibuja arreglos o grupos'
        },
        visualType: 'diagram',
        starter: {
          en: 'I can see... rows of...',
          es: 'Puedo ver... filas de...'
        }
      },
      {
        id: 3,
        title: { en: 'Calculate', es: 'Calcula' },
        description: {
          en: 'Count all or use times tables',
          es: 'Cuenta todo o usa las tablas'
        },
        visualType: 'equation',
        starter: {
          en: 'The product is...',
          es: 'El producto es...'
        }
      }
    ]
  },
  {
    type: 'division',
    icon: '➗',
    title: { en: 'Division', es: 'División' },
    steps: [
      {
        id: 1,
        title: { en: 'Set Up', es: 'Organiza' },
        description: {
          en: 'Write the dividend and divisor in the bracket (or L-shape)',
          es: 'Escribe el dividendo y el divisor en la casita (o la L)'
        },
        visualType: 'division_setup', // Special visual type for whiteboard
        starter: {
          en: 'I am dividing... by...',
          es: 'Estoy dividiendo... entre...'
        }
      },
      {
        id: 2,
        title: { en: 'Select', es: 'Separa Cifras' },
        description: {
          en: 'Take enough digits from the left to be larger than the divisor',
          es: 'Separa las cifras necesarias a la izquierda que sean mayores al divisor'
        },
        visualType: 'division_select',
        starter: {
          en: 'I need to select... digits',
          es: 'Debo separar... cifras'
        }
      },
      {
        id: 3,
        title: { en: 'Multiply & Subtract', es: 'Multiplica y Resta' },
        description: {
          en: 'Find a number that multiplied gives close to the target, then subtract',
          es: 'Busca un número en la tabla que se acerque, multiplica y resta lo que sobra'
        },
        visualType: 'division_solve',
        starter: {
          en: 'The closest multiple is...',
          es: 'El múltiplo más cercano es...'
        }
      },
      {
        id: 4,
        title: { en: 'Bring Down', es: 'Baja la Cifra' },
        description: {
          en: 'Bring down the next digit and repeat the process',
          es: 'Baja la siguiente cifra y repite el proceso'
        },
        visualType: 'division_repeat',
        starter: {
          en: 'Next I bring down the...',
          es: 'Ahora bajo el número...'
        }
      }
    ]
  }
];

export const drawingColors: ColorOption[] = [
  { id: 'red', color: '#EF4444', name: 'Red' },
  { id: 'yellow', color: '#FBBF24', name: 'Yellow' },
  { id: 'green', color: '#22C55E', name: 'Green' },
  { id: 'cyan', color: '#06B6D4', name: 'Cyan' },
  { id: 'purple', color: '#8B5CF6', name: 'Purple' },
  { id: 'black', color: '#1F2937', name: 'Black' },
];

export const gradeLabels = {
  en: ['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade'],
  es: ['1° Grado', '2° Grado', '3° Grado', '4° Grado', '5° Grado', '6° Grado', '7° Grado']
};

export const curriculumLabels: Record<Curriculum, { en: string; es: string }> = {
  'ib-pyp': { en: 'IB PYP', es: 'IB PEP' },
  'colombia': { en: 'Colombia', es: 'Colombia' },
  'cambridge-primary': { en: 'Cambridge Primary', es: 'Cambridge Primaria' },
  'common-core': { en: 'Common Core', es: 'Common Core' },
  'national': { en: 'National', es: 'Nacional' }
};

export const curriculumDescriptions: Record<Curriculum, { en: string; es: string }> = {
  'ib-pyp': {
    en: 'International Baccalaureate Primary Years Programme',
    es: 'Programa de la Escuela Primaria del Bachillerato Internacional'
  },
  'colombia': {
    en: 'Colombian National Curriculum',
    es: 'Currículo Nacional de Colombia'
  },
  'cambridge-primary': {
    en: 'Cambridge Primary Curriculum',
    es: 'Currículo de Primaria Cambridge'
  },
  'common-core': {
    en: 'US Common Core State Standards',
    es: 'Estándares Estatales Comunes (EE.UU.)'
  },
  'national': {
    en: 'National Standard Curriculum',
    es: 'Currículo Estándar Nacional'
  }
};

export const tutorMessages = {
  greeting: {
    en: "Hi! 👋 I'm Nova, your tutor. Hold the microphone and tell me what you need help with! You can also draw on the whiteboard.",
    es: "¡Hola! 👋 Soy Nova, tu tutor. ¡Mantén presionado el micrófono y cuéntame en qué necesitas ayuda! También puedes dibujar en la pizarra."
  },
  selectProblem: {
    en: "What type of math problem are you working on?",
    es: "¿Qué tipo de problema matemático estás resolviendo?"
  },
  selectCurriculum: {
    en: "Select your curriculum:",
    es: "Selecciona tu currículo:"
  },
  encouragement: {
    en: ["Great job! 🌟", "You're doing amazing! ⭐", "Keep going! 💪", "Excellent thinking! 🧠"],
    es: ["¡Excelente trabajo! 🌟", "¡Lo estás haciendo increíble! ⭐", "¡Sigue así! 💪", "¡Excelente pensamiento! 🧠"]
  }
};
