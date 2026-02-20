import { PedagogicalQuestData } from './pedagogicalQuests';

export const saberPrepQuests: PedagogicalQuestData[] = [
    {
        id: 'saber-math-3-1',
        title: {
            es: 'Simulacro SABER: Matemáticas (Paso a Paso)',
            en: 'SABER Mock Exam: Math (Step by Step)'
        },
        icon: '📝',
        category: 'math',
        difficulty: 'medium',
        grade: 3,
        learningObjective: {
            es: 'Identificar el valor posicional de números hasta 999.',
            en: 'Identify the positional value of numbers up to 999.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: '¿Qué es el Valor Posicional?', en: 'What is Place Value?' },
                content: {
                    es: 'Los números tienen diferentes valores según su posición:\n\n• UNIDADES: valen 1.\n• DECENAS: valen 10.\n• CENTENAS: valen 100.',
                    en: 'Numbers have different values depending on their position:\n\n• ONES: worth 1.\n• TENS: worth 10.\n• HUNDREDS: worth 100.'
                }
            },
            {
                type: 'practice',
                title: { es: 'Descomposición', en: 'Decomposition' },
                content: {
                    es: 'Si tenemos el número 345:\n\n• 3 es la centena (300)\n• 4 es la decena (40)\n• 5 es la unidad (5)',
                    en: 'If we have the number 345:\n\n• 3 is the hundred (300)\n• 4 is the ten (40)\n• 5 is the one (5)'
                }
            }
        ],
        challenge: {
            question: {
                es: 'En el número 782, ¿cuál es el valor del número 7?',
                en: 'In the number 782, what is the value of the number 7?'
            },
            options: [
                { id: 'a', text: { es: '7', en: '7' } },
                { id: 'b', text: { es: '70', en: '70' } },
                { id: 'c', text: { es: '700', en: '700' } },
                { id: 'd', text: { es: '7000', en: '7000' } }
            ],
            correctOptionId: 'c',
            explanation: {
                es: 'El 7 está en la posición de las CENTENAS, por lo tanto vale 700.',
                en: 'The 7 is in the HUNDREDS position, therefore it is worth 700.'
            }
        },
        reward: { coins: 150, xp: 200 }
    },
    {
        id: 'saber-lang-3-1',
        title: {
            es: 'Simulacro SABER: Competencia Lectora',
            en: 'SABER Mock Exam: Reading Competence'
        },
        icon: '📖',
        category: 'language',
        difficulty: 'medium',
        grade: 3,
        learningObjective: {
            es: 'Inferir el propósito de un texto narrativo corto.',
            en: 'Infer the purpose of a short narrative text.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'Propósito del Autor', en: 'Author\'s Purpose' },
                content: {
                    es: 'Cuando alguien escribe una historia, lo hace por una razón:\n\n• Para informarnos algo.\n• Para divertirnos.\n• Para darnos una lección (moraleja).',
                    en: 'When someone writes a story, they do it for a reason:\n\n• To inform us about something.\n• To amuse us.\n• To give us a lesson (moral).'
                }
            }
        ],
        challenge: {
            question: {
                es: '"La liebre se burlaba de la tortuga por su lentitud, pero al final la tortuga ganó la carrera". ¿Cuál es el propósito más probable de este texto?',
                en: '"The hare mocked the tortoise for its slowness, but in the end the tortoise won the race." What is the most likely purpose of this text?'
            },
            options: [
                { id: 'a', text: { es: 'Enseñar el valor de la perseverancia', en: 'Teach the value of perseverance' } },
                { id: 'b', text: { es: 'Informar sobre la velocidad de las liebres', en: 'Inform about the speed of hares' } },
                { id: 'c', text: { es: 'Vender zapatos de carrera', en: 'Sell running shoes' } }
            ],
            correctOptionId: 'a',
            explanation: {
                es: 'Esta es una fábula que busca darnos una enseñanza moral sobre no rendirse.',
                en: 'This is a fable that seeks to give us a moral lesson about not giving up.'
            }
        },
        reward: { coins: 150, xp: 200 }
    }
];
