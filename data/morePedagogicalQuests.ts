// data/morePedagogicalQuests.ts
// Additional educational quests for all grades

import { PedagogicalQuestData } from './pedagogicalQuests';

export const additionalPedagogicalQuests: PedagogicalQuestData[] = [
    // GRADE 1 QUESTS
    {
        id: 'counting-to-20',
        title: {
            es: 'Contando hasta 20',
            en: 'Counting to 20'
        },
        icon: '🔢',
        category: 'math',
        difficulty: 'easy',
        grade: 1,
        learningObjective: {
            es: 'Aprender a contar del 1 al 20 y reconocer los números.',
            en: 'Learn to count from 1 to 20 and recognize numbers.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: {
                    es: 'Los Números son Nuestros Amigos',
                    en: 'Numbers are Our Friends'
                },
                content: {
                    es: 'Los números nos ayudan a contar cosas todos los días.\n\nPodemos contar:\n🍎 Manzanas\n⭐ Estrellas\n🐶 Perritos\n\n¡Vamos a aprender a contar hasta 20!',
                    en: 'Numbers help us count things every day.\n\nWe can count:\n🍎 Apples\n⭐ Stars\n🐶 Puppies\n\nLet\'s learn to count to 20!'
                }
            },
            {
                type: 'example',
                title: {
                    es: 'Contemos Juntos',
                    en: 'Let\'s Count Together'
                },
                content: {
                    es: 'Vamos a contar estas estrellas:',
                    en: 'Let\'s count these stars:'
                },
                interactiveExample: {
                    problem: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐',
                    steps: [
                        {
                            text: 'Señalamos cada estrella mientras contamos',
                            highlight: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10'
                        },
                        {
                            text: 'La última estrella que contamos nos dice cuántas hay en total',
                            highlight: '¡Hay 10 estrellas!'
                        }
                    ],
                    answer: '10 estrellas'
                }
            },
            {
                type: 'practice',
                title: {
                    es: 'Tu Turno de Practicar',
                    en: 'Your Turn to Practice'
                },
                content: {
                    es: 'Cuenta estos corazones:\n❤️❤️❤️❤️❤️❤️❤️\n\n¿Cuántos hay?\n\nRespuesta: 7 corazones',
                    en: 'Count these hearts:\n❤️❤️❤️❤️❤️❤️❤️\n\nHow many are there?\n\nAnswer: 7 hearts'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Mira estos globos: 🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈. ¿Cuántos globos hay?',
                en: 'Look at these balloons: 🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈. How many balloons are there?'
            },
            options: [
                { id: 'a', text: { es: '10', en: '10' } },
                { id: 'b', text: { es: '12', en: '12' } },
                { id: 'c', text: { es: '15', en: '15' } },
                { id: 'd', text: { es: '11', en: '11' } }
            ],
            correctOptionId: 'b',
            explanation: {
                es: '¡Correcto! Hay 12 globos. Si los cuentas uno por uno: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12.',
                en: 'Correct! There are 12 balloons. If you count them one by one: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12.'
            }
        },
        reward: { coins: 60, xp: 100 }
    },
    {
        id: 'legend-valle-g1',
        title: { es: 'Leyendas del Valle', en: 'Valley Legends' },
        icon: '📜',
        category: 'language',
        difficulty: 'hard',
        grade: 1,
        learningObjective: {
            es: 'Reconocer que las palabras escritas comunican ideas.',
            en: 'Recognize that written words communicate ideas.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'El Mensaje de los Guardianes', en: 'Guardians Message' },
                content: {
                    es: 'Los Guardianes dejaron mensajes en las rocas. ¡Cada letra tiene un sonido y juntas forman palabras!\n\n👀 Mira la palabra: B O S Q U E\n👄 Suena así: /b/ /o/ /s/ /k/ /e/\n✨ ¡Dice bosque!',
                    en: 'The Guardians left messages on the rocks. Each letter has a sound and together they form words!\n\n👀 Look at the word: F O R E S T\n👄 Sounds like: /f/ /o/ /r/ /e/ /s/ /t/\n✨ It says forest!'
                }
            }
        ],
        challenge: {
            question: {
                es: '¿Con qué letra empieza la palabra SOL?',
                en: 'With what letter does the word SUN start?'
            },
            options: [
                { id: 'a', text: { es: 'S', en: 'S' } },
                { id: 'b', text: { es: 'O', en: 'O' } },
                { id: 'c', text: { es: 'L', en: 'L' } }
            ],
            correctOptionId: 'a',
            explanation: { es: '¡Muy bien! SSS-ol empieza con la letra S.', en: 'Very well! SSS-un starts with the letter S.' }
        },
        reward: { coins: 100, xp: 150 }
    },

    // GRADE 2 QUESTS
    {
        id: 'addition-within-100',
        title: {
            es: 'Suma hasta 100',
            en: 'Addition within 100'
        },
        icon: '➕',
        category: 'math',
        difficulty: 'easy',
        grade: 2,
        learningObjective: {
            es: 'Aprender a sumar números de dos dígitos.',
            en: 'Learn to add two-digit numbers.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: {
                    es: 'Sumando Números Grandes',
                    en: 'Adding Big Numbers'
                },
                content: {
                    es: 'Cuando sumamos números de dos dígitos, podemos hacerlo en partes:\n\n1️⃣ Primero sumamos las UNIDADES (el número de la derecha)\n2️⃣ Luego sumamos las DECENAS (el número de la izquierda)\n3️⃣ Juntamos los resultados\n\n¡Es como armar un rompecabezas!',
                    en: 'When we add two-digit numbers, we can do it in parts:\n\n1️⃣ First we add the ONES (the right number)\n2️⃣ Then we add the TENS (the left number)\n3️⃣ We put the results together\n\nIt\'s like building a puzzle!'
                }
            },
            {
                type: 'example',
                title: {
                    es: 'Ejemplo Paso a Paso',
                    en: 'Step by Step Example'
                },
                content: {
                    es: 'Vamos a sumar 23 + 15:',
                    en: 'Let\'s add 23 + 15:'
                },
                interactiveExample: {
                    problem: '23 + 15 = ?',
                    steps: [
                        {
                            text: 'Separamos en decenas y unidades',
                            highlight: '23 = 20 + 3    y    15 = 10 + 5'
                        },
                        {
                            text: 'Sumamos las unidades',
                            highlight: '3 + 5 = 8'
                        },
                        {
                            text: 'Sumamos las decenas',
                            highlight: '20 + 10 = 30'
                        },
                        {
                            text: 'Juntamos los resultados',
                            highlight: '30 + 8 = 38'
                        }
                    ],
                    answer: '23 + 15 = 38'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Pedro tiene 34 canicas y su amiga le regala 22 más. ¿Cuántas canicas tiene Pedro ahora?',
                en: 'Pedro has 34 marbles and his friend gives him 22 more. How many marbles does Pedro have now?'
            },
            options: [
                { id: 'a', text: { es: '56', en: '56' } },
                { id: 'b', text: { es: '46', en: '46' } },
                { id: 'c', text: { es: '66', en: '66' } },
                { id: 'd', text: { es: '54', en: '54' } }
            ],
            correctOptionId: 'a',
            explanation: {
                es: '¡Excelente! 34 + 22 = 56. Unidades: 4 + 2 = 6. Decenas: 30 + 20 = 50. Total: 50 + 6 = 56 canicas.',
                en: 'Excellent! 34 + 22 = 56. Ones: 4 + 2 = 6. Tens: 30 + 20 = 50. Total: 50 + 6 = 56 marbles.'
            }
        },
        reward: { coins: 90, xp: 130 }
    },

    // GRADE 2 SPECIAL SUBJECTS
    {
        id: 'golden-sacks-g2',
        title: { es: 'Sacos Dorados', en: 'Golden Sacks' },
        icon: '💰',
        category: 'math',
        difficulty: 'medium',
        grade: 2,
        learningObjective: {
            es: 'Comprender el valor posicional de las centenas usando agrupaciones de 100.',
            en: 'Understand hundreds place value using groupings of 100.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'El Poder de los Sacos', en: 'The Power of Sacks' },
                content: {
                    es: 'Para contar grandes tesoros, los exploradores usan Sacos Dorados.\n\n✨ 1 Saco Dorado = 100 monedas (1 centena)\n✨ 1 Bolsa = 10 monedas (1 decena)\n✨ 1 Moneda = 1 unidad\n\nSi tienes 2 sacos, 3 bolsas y 4 monedas, ¡tienes 234!',
                    en: 'To count big treasures, explorers use Golden Sacks.\n\n✨ 1 Golden Sack = 100 coins (1 hundred)\n✨ 1 Bag = 10 coins (1 ten)\n✨ 1 Coin = 1 unit\n\nIf you have 2 sacks, 3 bags, and 4 coins, you have 234!'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Si encuentras 3 Sacos Dorados y 5 Monedas sueltas, ¿cuántas monedas tienes en total?',
                en: 'If you find 3 Golden Sacks and 5 loose Coins, how many coins do you have in total?'
            },
            options: [
                { id: 'a', text: { es: '35', en: '35' } },
                { id: 'b', text: { es: '305', en: '305' } },
                { id: 'c', text: { es: '350', en: '350' } }
            ],
            correctOptionId: 'b',
            explanation: { es: '¡Magnífico! 3 sacos son 300, y 5 monedas son 5. 300 + 5 = 305.', en: 'Magnificent! 3 sacks are 300, and 5 coins are 5. 300 + 5 = 305.' }
        },
        reward: { coins: 100, xp: 150 }
    },
    {
        id: 'desert-tales-g2',
        title: { es: 'Historias de la Arena', en: 'Desert Tales' },
        icon: '📜',
        category: 'language',
        difficulty: 'medium',
        grade: 2,
        learningObjective: {
            es: 'Identificar el inicio, nudo y desenlace en un cuento.',
            en: 'Identify the beginning, middle, and end in a story.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'La Estructura del Cuento', en: 'Story Structure' },
                content: {
                    es: 'Todas las grandes historias tienen un orden:\n\n🌅 INICIO: Presenta a los personajes y el lugar.\n🏜️ NUDO: Aparece un problema o aventura.\n🌙 DESENLACE: Se resuelve el problema y termina la historia.',
                    en: 'All great stories have an order:\n\n🌅 BEGINNING: Introduces characters and place.\n🏜️ MIDDLE: A problem or adventure appears.\n🌙 END: The problem is solved and the story ends.'
                }
            }
        ],
        challenge: {
            question: {
                es: 'En el cuento del Faraón perdido, él encuentra el camino a casa después de caminar mucho. ¿Qué parte del cuento es esta?',
                en: 'In the story of the lost Pharaoh, he finds the way home after walking a lot. What part of the story is this?'
            },
            options: [
                { id: 'a', text: { es: 'Inicio', en: 'Beginning' } },
                { id: 'b', text: { es: 'Nudo', en: 'Middle' } },
                { id: 'c', text: { es: 'Desenlace', en: 'End' } }
            ],
            correctOptionId: 'c',
            explanation: { es: '¡Correcto! El desenlace es cuando el problema se soluciona y la historia llega a su fin.', en: 'Correct! The end is when the problem is solved and the story reaches its finish.' }
        },
        reward: { coins: 80, xp: 120 }
    },
    {
        id: 'oasis-life-g2',
        title: { es: 'Vida en el Oasis', en: 'Oasis Life' },
        icon: '🌴',
        category: 'science',
        difficulty: 'easy',
        grade: 2,
        learningObjective: {
            es: 'Distinguir entre seres vivos y objetos del entorno.',
            en: 'Distinguish between living beings and objects in the environment.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: '¿Qué es Estar Vivo?', en: 'What is Being Alive?' },
                content: {
                    es: 'En el desierto hay muchas cosas, pero no todas están vivas.\n\n🌿 LOS SERES VIVOS: Nacen, crecen, se alimentan, respiran, se reproducen y mueren. (Ej: Camellos, Cactus)\n🪨 OBJETOS INERTES: No tienen vida. (Ej: Arena, Piedras, Pirámides)',
                    en: 'In the desert there are many things, but not all are alive.\n\n🌿 LIVING BEINGS: Born, grow, eat, breathe, reproduce, and die. (Ex: Camels, Cacti)\n🪨 NON-LIVING OBJECTS: Do not have life. (Ex: Sand, Stones, Pyramids)'
                }
            }
        ],
        challenge: {
            question: {
                es: '¿Cuál de estos es un SER VIVO del desierto?',
                en: 'Which of these is a LIVING BEING of the desert?'
            },
            options: [
                { id: 'a', text: { es: 'Una duna de arena', en: 'A sand dune' } },
                { id: 'b', text: { es: 'Un lagarto', en: 'A lizard' } },
                { id: 'c', text: { es: 'Una vasija antigua', en: 'An ancient vase' } }
            ],
            correctOptionId: 'b',
            explanation: { es: '¡Exacto! El lagarto es un animal, por lo tanto es un ser vivo que respira y se alimenta.', en: 'Exactly! The lizard is an animal, therefore it is a living being that breathes and eats.' }
        },
        reward: { coins: 85, xp: 130 }
    },
    {
        id: 'ancient-routes-g2',
        title: { es: 'Rutas Ancestrales', en: 'Ancient Routes' },
        icon: '🧭',
        category: 'social_studies',
        difficulty: 'medium',
        grade: 2,
        learningObjective: {
            es: 'Usar los puntos cardinales para orientarse en un mapa.',
            en: 'Use cardinal points to orient yourself on a map.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'Los 4 Puntos Cardinales', en: 'The 4 Cardinal Points' },
                content: {
                    es: 'Para no perderse en las dunas, usamos la orientación:\n\n⬆️ NORTE\n⬇️ SUR\n➡️ ESTE (Por donde sale el sol)\n⬅️ OESTE (Por donde se oculta el sol)',
                    en: 'To not get lost in the dunes, we use orientation:\n\n⬆️ NORTH\n⬇️ SOUTH\n➡️ EAST (Where the sun rises)\n⬅️ WEST (Where the sun sets)'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Si el sol sale por la mañana frente a ti, ¿cuál punto cardinal tienes en esa dirección?',
                en: 'If the sun rises in the morning in front of you, which cardinal point do you have in that direction?'
            },
            options: [
                { id: 'a', text: { es: 'Norte', en: 'North' } },
                { id: 'b', text: { es: 'Oeste', en: 'West' } },
                { id: 'c', text: { es: 'Este', en: 'East' } }
            ],
            correctOptionId: 'c',
            explanation: { es: '¡Muy bien! El Este es siempre la dirección por donde vemos salir el sol al amanecer.', en: 'Very well! East is always the direction where we see the sun rise at dawn.' }
        },
        reward: { coins: 90, xp: 140 }
    },
    {
        id: 'subtraction-within-100',
        title: { es: 'Pirámide de Restas', en: 'Subtraction Pyramid' },
        icon: '➖',
        category: 'math',
        difficulty: 'medium',
        grade: 2,
        learningObjective: {
            es: 'Realizar restas con reagrupación (prestando) hasta 100.',
            en: 'Perform subtraction with regrouping up to 100.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: '¿Qué es Pedir Prestado?', en: 'What is Borrowing?' },
                content: {
                    es: 'Si en las unidades no te alcanza para restar, ¡pídele una decena a tu vecino!\n\n✨ Una decena se convierte en 10 unidades.\n✨ Ahora puedes restar sin problemas.',
                    en: 'If you dont have enough ones to subtract, borrow a ten from your neighbor!\n\n✨ One ten becomes 10 ones.\n✨ Now you can subtract without problems.'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Tienes 52 bloques y quitas 25. ¿Cuántos te quedan?',
                en: 'You have 52 blocks and take away 25. How many are left?'
            },
            options: [
                { id: 'a', text: { es: '37', en: '37' } },
                { id: 'b', text: { es: '27', en: '27' } },
                { id: 'c', text: { es: '33', en: '33' } }
            ],
            correctOptionId: 'b',
            explanation: { es: '¡Correcto! 52 - 25 = 27. Tuviste que pedir prestado una decena.', en: 'Correct! 52 - 25 = 27. You had to borrow a ten.' }
        },
        reward: { coins: 100, xp: 150 }
    },
    {
        id: 'sand-clock-g2',
        title: { es: 'Reloj de Arena', en: 'Sand Clock' },
        icon: '⌛',
        category: 'math',
        difficulty: 'medium',
        grade: 2,
        learningObjective: {
            es: 'Leer la hora en relojes analógicos y digitales.',
            en: 'Read time on analog and digital clocks.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'Las Horas y los Minutos', en: 'Hours and Minutes' },
                content: {
                    es: 'El reloj nos dice el tiempo.\n\n⌚ Manecilla CORTA: Marca las horas.\n⌚ Manecilla LARGA: Marca los minutos.\n⌚ 1 Hora = 60 minutos.',
                    en: 'The clock tells us the time.\n\n⌚ SHORT hand: Shows hours.\n⌚ LONG hand: Shows minutes.\n⌚ 1 Hour = 60 minutes.'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Si la manecilla corta está en el 3 y la larga en el 12, ¿qué hora es?',
                en: 'If the short hand is at 3 and the long one at 12, what time is it?'
            },
            options: [
                { id: 'a', text: { es: '3:00', en: '3:00' } },
                { id: 'b', text: { es: '12:03', en: '12:03' } },
                { id: 'c', text: { es: '6:15', en: '6:15' } }
            ],
            correctOptionId: 'a',
            explanation: { es: '¡Cierto! Son las 3 en punto.', en: 'Right! Its 3 oclock.' }
        },
        reward: { coins: 90, xp: 130 }
    },
    {
        id: 'spice-market-g2',
        title: { es: 'Mercado de Especias', en: 'Spice Market' },
        icon: '🌶️',
        category: 'math',
        difficulty: 'hard',
        grade: 2,
        learningObjective: {
            es: 'Utilizar billetes y monedas para resolver problemas de compra y venta.',
            en: 'Use bills and coins to solve buying and selling problems.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'Manejando el Dinero', en: 'Managing Money' },
                content: {
                    es: 'Para comprar especias necesitamos conocer los billetes (Pesos Colombianos).\n\n💵 Billetes de 1.000, 2.000 y 5.000.\n💵 Debes sumar para saber si te alcanza.',
                    en: 'To buy spices we need to know the bills (Colombian Pesos).\n\n💵 1,000, 2,000, and 5,000 bills.\n💵 You must add to know if you have enough.'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Una bolsa de sal cuesta 2.500 y una de pimienta 1.500. ¿Cuánto pagas en total?',
                en: 'A bag of salt costs 2,500 and one of pepper 1,500. How much do you pay in total?'
            },
            options: [
                { id: 'a', text: { es: '3.000', en: '3.000' } },
                { id: 'b', text: { es: '4.000', en: '4.000' } },
                { id: 'c', text: { es: '5.000', en: '5.000' } }
            ],
            correctOptionId: 'b',
            explanation: { es: '¡Perfecto! 2.500 + 1.500 = 4.000 pesos.', en: 'Perfect! 2,500 + 1,500 = 4,000 pesos.' }
        },
        reward: { coins: 120, xp: 180 }
    },
    {
        id: 'ancestral-patterns-g2',
        title: { es: 'Patrones Ancestrales', en: 'Ancestral Patterns' },
        icon: '🐾',
        category: 'math',
        difficulty: 'hard',
        grade: 2,
        learningObjective: {
            es: 'Identificar y continuar patrones de figuras y números.',
            en: 'Identify and continue shape and number patterns.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'El Ritmo de la Arena', en: 'The Sand Rhythm' },
                content: {
                    es: 'Los patrones son cosas que se repiten con un orden.\n\n✨ Ejemplo: 🟢 🔴 🟢 🔴 ... ¿Qué sigue?\n✨ ¡Un círculo verde!',
                    en: 'Patterns are things that repeat with an order.\n\n✨ Example: 🟢 🔴 🟢 🔴 ... What follows?\n✨ A green circle!'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Mira esta serie: 10, 20, 30, 40... ¿Cuál es el siguiente número?',
                en: 'Look at this series: 10, 20, 30, 40... What is the next number?'
            },
            options: [
                { id: 'a', text: { es: '45', en: '45' } },
                { id: 'b', text: { es: '50', en: '50' } },
                { id: 'c', text: { es: '60', en: '60' } }
            ],
            correctOptionId: 'b',
            explanation: { es: '¡Excelente! El patrón es sumar 10 cada vez. 40 + 10 = 50.', en: 'Excellent! The pattern is adding 10 each time. 40 + 10 = 50.' }
        },
        reward: { coins: 110, xp: 160 }
    },

    // GRADE 4 QUESTS
    {
        id: 'area-perimeter',
        title: {
            es: 'Área y Perímetro',
            en: 'Area and Perimeter'
        },
        icon: '📐',
        category: 'math',
        difficulty: 'medium',
        grade: 4,
        learningObjective: {
            es: 'Comprender la diferencia entre área y perímetro y cómo calcularlos.',
            en: 'Understand the difference between area and perimeter and how to calculate them.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: {
                    es: '¿Qué son Área y Perímetro?',
                    en: 'What are Area and Perimeter?'
                },
                content: {
                    es: 'Son dos formas diferentes de medir figuras:\n\n📏 PERÍMETRO: La distancia alrededor de la figura (como una cerca)\n📦 ÁREA: El espacio dentro de la figura (como un piso)\n\nImaginalo así:\n• Perímetro = caminar alrededor\n• Área = pintar por dentro',
                    en: 'They are two different ways to measure shapes:\n\n📏 PERIMETER: The distance around the shape (like a fence)\n📦 AREA: The space inside the shape (like a floor)\n\nThink of it like this:\n• Perimeter = walking around\n• Area = painting inside'
                }
            },
            {
                type: 'example',
                title: {
                    es: 'Calculemos un Rectángulo',
                    en: 'Let\'s Calculate a Rectangle'
                },
                content: {
                    es: 'Tenemos un rectángulo de 5 cm de largo y 3 cm de ancho:',
                    en: 'We have a rectangle 5 cm long and 3 cm wide:'
                },
                interactiveExample: {
                    problem: 'Rectángulo: 5 cm × 3 cm',
                    steps: [
                        {
                            text: 'PERÍMETRO: Sumamos todos los lados',
                            highlight: '5 + 3 + 5 + 3 = 16 cm'
                        },
                        {
                            text: 'O usamos la fórmula: 2 × (largo + ancho)',
                            highlight: '2 × (5 + 3) = 2 × 8 = 16 cm'
                        },
                        {
                            text: 'ÁREA: Multiplicamos largo × ancho',
                            highlight: '5 × 3 = 15 cm²'
                        }
                    ],
                    answer: 'Perímetro = 16 cm, Área = 15 cm²'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Un jardín rectangular mide 8 metros de largo y 4 metros de ancho. ¿Cuál es su área?',
                en: 'A rectangular garden is 8 meters long and 4 meters wide. What is its area?'
            },
            options: [
                { id: 'a', text: { es: '24 m²', en: '24 m²' } },
                { id: 'b', text: { es: '32 m²', en: '32 m²' } },
                { id: 'c', text: { es: '12 m²', en: '12 m²' } },
                { id: 'd', text: { es: '16 m²', en: '16 m²' } }
            ],
            correctOptionId: 'b',
            explanation: {
                es: '¡Correcto! El área se calcula multiplicando largo × ancho: 8 × 4 = 32 metros cuadrados.',
                en: 'Correct! Area is calculated by multiplying length × width: 8 × 4 = 32 square meters.'
            }
        },
        reward: { coins: 130, xp: 190 }
    },

    // GRADE 5 QUESTS
    {
        id: 'decimals-intro',
        title: {
            es: 'Introducción a Decimales',
            en: 'Introduction to Decimals'
        },
        icon: '🔢',
        category: 'math',
        difficulty: 'medium',
        grade: 5,
        learningObjective: {
            es: 'Comprender qué son los decimales y cómo se relacionan con las fracciones.',
            en: 'Understand what decimals are and how they relate to fractions.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: {
                    es: '¿Qué son los Decimales?',
                    en: 'What are Decimals?'
                },
                content: {
                    es: 'Los decimales son otra forma de escribir fracciones.\n\nEl punto decimal (.) separa:\n• La parte ENTERA (a la izquierda)\n• La parte DECIMAL (a la derecha)\n\nEjemplo: 3.5\n• 3 = parte entera\n• .5 = cinco décimos (5/10)\n\n¡Es como tener dinero: 3.50 son 3 pesos y 50 centavos!',
                    en: 'Decimals are another way to write fractions.\n\nThe decimal point (.) separates:\n• The WHOLE part (on the left)\n• The DECIMAL part (on the right)\n\nExample: 3.5\n• 3 = whole part\n• .5 = five tenths (5/10)\n\nIt\'s like having money: 3.50 is 3 dollars and 50 cents!'
                }
            },
            {
                type: 'example',
                title: {
                    es: 'De Fracción a Decimal',
                    en: 'From Fraction to Decimal'
                },
                content: {
                    es: 'Convirtamos 1/2 a decimal:',
                    en: 'Let\'s convert 1/2 to decimal:'
                },
                interactiveExample: {
                    problem: '1/2 = ?',
                    steps: [
                        {
                            text: '1/2 significa 1 dividido entre 2',
                            highlight: '1 ÷ 2'
                        },
                        {
                            text: 'Cuando dividimos 1 entre 2 obtenemos',
                            highlight: '0.5'
                        },
                        {
                            text: 'Podemos verificar: 0.5 es lo mismo que 5/10, que simplificado es 1/2',
                            highlight: '✓ Correcto'
                        }
                    ],
                    answer: '1/2 = 0.5'
                }
            }
        ],
        challenge: {
            question: {
                es: 'María corrió 2.75 kilómetros. ¿Cuál fracción representa la parte decimal (.75)?',
                en: 'Maria ran 2.75 kilometers. Which fraction represents the decimal part (.75)?'
            },
            options: [
                { id: 'a', text: { es: '3/4', en: '3/4' } },
                { id: 'b', text: { es: '1/2', en: '1/2' } },
                { id: 'c', text: { es: '2/3', en: '2/3' } },
                { id: 'd', text: { es: '1/4', en: '1/4' } }
            ],
            correctOptionId: 'a',
            explanation: {
                es: '¡Perfecto! 0.75 = 75/100 = 3/4. Tres cuartos es lo mismo que setenta y cinco centésimos.',
                en: 'Perfect! 0.75 = 75/100 = 3/4. Three fourths is the same as seventy-five hundredths.'
            }
        },
        reward: { coins: 150, xp: 210 }
    },
    {
        id: 'counting-to-999',
        title: { es: 'Conteo de Dunas', en: 'Dune Counting' },
        icon: '🏜️',
        category: 'math',
        difficulty: 'easy',
        grade: 2,
        learningObjective: {
            es: 'Reconocer y representar números hasta 999.',
            en: 'Recognize and represent numbers up to 999.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'Llegando al 999', en: 'Reaching 999' },
                content: {
                    es: 'En el desierto hay miles de granos de arena, pero vamos a contar hasta 999.\n\n🧱 3 dígitos: Centenas, Decenas y Unidades.\n🧱 Ejemplo: 456\n• 400 (Centenas)\n• 50 (Decenas)\n• 6 (Unidades)',
                    en: 'In the desert there are thousands of sand grains, but we will count to 999.\n\n🧱 3 digits: Hundreds, Tens, and Units.\n🧱 Example: 456\n• 400 (Hundreds)\n• 50 (Tens)\n• 6 (Units)'
                }
            }
        ],
        challenge: {
            question: {
                es: '¿Cómo se escribe el número NOVECIENTOS OCHENTA Y DOS?',
                en: 'How do you write the number NINE HUNDRED EIGHTY TWO?'
            },
            options: [
                { id: 'a', text: { es: '928', en: '928' } },
                { id: 'b', text: { es: '982', en: '982' } },
                { id: 'c', text: { es: '892', en: '892' } }
            ],
            correctOptionId: 'b',
            explanation: { es: '¡Correcto! 9 en las centenas, 8 en las decenas y 2 en las unidades: 982.', en: 'Correct! 9 in hundreds, 8 in tens, and 2 in units: 982.' }
        },
        reward: { coins: 50, xp: 80 }
    },
    {
        id: 'island-history-g3',
        title: { es: 'Historia de la Isla', en: 'Island History' },
        icon: '🗿',
        category: 'social_studies',
        difficulty: 'medium',
        grade: 3,
        learningObjective: {
            es: 'Reconocer que el lugar donde vive tiene una historia.',
            en: 'Recognize that the place where they live has a history.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'El Pasado de Nova', en: 'Novas Past' },
                content: {
                    es: 'Antes de nosotros, otros vivieron aquí. ¡Los cambios se ven en las construcciones y los cuentos de los abuelos!\n\n🕰️ El tiempo cambia los lugares.\n🕰️ Los museos guardan estas historias.',
                    en: 'Before us, others lived here. Changes are seen in buildings and grandparents\' stories!\n\n🕰️ Time changes places.\n🕰️ Museums keep these stories.'
                }
            }
        ],
        challenge: {
            question: {
                es: '¿Dónde podemos encontrar objetos antiguos para conocer la historia?',
                en: 'Where can we find old objects to know history?'
            },
            options: [
                { id: 'a', text: { es: 'En un centro comercial', en: 'In a shopping mall' } },
                { id: 'b', text: { es: 'En un museo', en: 'In a museum' } },
                { id: 'c', text: { es: 'En un cine', en: 'In a cinema' } }
            ],
            correctOptionId: 'b',
            explanation: { es: '¡Exacto! Los museos son lugares mágicos que protegen la historia de todos.', en: 'Exactly! Museums are magical places that protect everyone\'s history.' }
        },
        reward: { coins: 140, xp: 200 }
    },
    {
        id: 'air-messages-g4',
        title: { es: 'Mensajes del Aire', en: 'Air Messages' },
        icon: '📢',
        category: 'language',
        difficulty: 'medium',
        grade: 4,
        learningObjective: {
            es: 'Identificar la función de los textos publicitarios.',
            en: 'Identify the function of advertising texts.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: '¿Qué nos dicen?', en: 'What do they tell us?' },
                content: {
                    es: 'En Sky-City hay muchos carteles. Algunos informan y otros quieren convencernos de algo.\n\n📢 PUBLICIDAD: Busca que compremos un producto o usemos un servicio.\n📢 MENSAJE: Usa colores llamativos y palabras cortas.',
                    en: 'In Sky-City there are many posters. Some inform and others want to convince us of something.\n\n📢 ADVERTISING: Seeks for us to buy a product or use a service.\n📢 MESSAGE: Uses striking colors and short words.'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Si ves un anuncio que dice "¡Compre las mejores botas voladoras!", ¿cuál es su intención?',
                en: 'If you see an ad saying "Buy the best flying boots!", what is its intention?'
            },
            options: [
                { id: 'a', text: { es: 'Contar un chiste', en: 'Tell a joke' } },
                { id: 'b', text: { es: 'Convencerte de comprar algo', en: 'Convince you to buy something' } },
                { id: 'c', text: { es: 'Enseñar una receta', en: 'Teach a recipe' } }
            ],
            correctOptionId: 'b',
            explanation: { es: '¡Correcto! Los textos publicitarios intentan persuadirnos para realizar una acción.', en: 'Correct! Advertising texts try to persuade us to take an action.' }
        },
        reward: { coins: 130, xp: 190 }
    },
    {
        id: 'time-ethics-g5',
        title: { es: 'Ética del Tiempo', en: 'Time Ethics' },
        icon: '⚖️',
        category: 'social_studies',
        difficulty: 'medium',
        grade: 5,
        learningObjective: {
            es: 'Analizar las consecuencias de las decisiones tecnológicas en la sociedad.',
            en: 'Analyze the consequences of technological decisions on society.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'Grandes Poderes, Grandes Responsabilidades', en: 'Great Powers, Great Responsibilities' },
                content: {
                    es: 'La tecnología del tiempo es poderosa. Debemos usarla con ética:\n\n⚖️ RESPONSABILIDAD: Pensar en cómo afecta a los demás.\n⚖️ HONESTIDAD: No usarla para engañar.\n⚖️ BIEN COMÚN: Ayudar a que el mundo sea mejor.',
                    en: 'Time technology is powerful. We must use it ethically:\n\n⚖️ RESPONSIBILITY: Thinking how it affects others.\n⚖️ HONESTY: Not using it to deceive.\n⚖️ COMMON GOOD: Helping the world be better.'
                }
            }
        ],
        challenge: {
            question: {
                es: '¿Qué significa actuar con ÉTICA al usar una nueva tecnología?',
                en: 'What does it mean to act with ETHICS when using a new technology?'
            },
            options: [
                { id: 'a', text: { es: 'Usarla solo para beneficio propio', en: 'Using it only for own benefit' } },
                { id: 'b', text: { es: 'Usarla de forma responsable y justa', en: 'Using it in a responsible and fair way' } },
                { id: 'c', text: { es: 'Usarla lo más rápido posible', en: 'Using it as fast as possible' } }
            ],
            correctOptionId: 'b',
            explanation: { es: '¡Exacto! La ética nos guía para hacer lo correcto y beneficiar a la comunidad.', en: 'Exactly! Ethics guide us to do the right thing and benefit the community.' }
        },
        reward: { coins: 160, xp: 220 }
    },

    // SCIENCE QUEST
    {
        id: 'plants-parts',
        title: {
            es: 'Partes de una Planta',
            en: 'Parts of a Plant'
        },
        icon: '🌱',
        category: 'science',
        difficulty: 'easy',
        grade: 3,
        learningObjective: {
            es: 'Identificar las partes principales de una planta y sus funciones.',
            en: 'Identify the main parts of a plant and their functions.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: {
                    es: 'Las Partes de la Planta',
                    en: 'Plant Parts'
                },
                content: {
                    es: 'Cada parte de la planta tiene un trabajo importante:\n\n🌿 RAÍZ: Absorbe agua y nutrientes del suelo\n🌱 TALLO: Sostiene la planta y transporta agua\n🍃 HOJAS: Hacen el alimento de la planta (fotosíntesis)\n🌸 FLOR: Produce semillas para nuevas plantas\n\n¡Todas las partes trabajan juntas!',
                    en: 'Each part of the plant has an important job:\n\n🌿 ROOT: Absorbs water and nutrients from soil\n🌱 STEM: Supports the plant and transports water\n🍃 LEAVES: Make food for the plant (photosynthesis)\n🌸 FLOWER: Produces seeds for new plants\n\nAll parts work together!'
                }
            },
            {
                type: 'example',
                title: {
                    es: 'Ejemplo: Un Girasol',
                    en: 'Example: A Sunflower'
                },
                content: {
                    es: 'Veamos cómo funciona un girasol:',
                    en: 'Let\'s see how a sunflower works:'
                },
                interactiveExample: {
                    problem: '🌻 Girasol',
                    steps: [
                        {
                            text: 'Las raíces absorben agua del suelo',
                            highlight: '💧 Agua sube'
                        },
                        {
                            text: 'El tallo lleva el agua hasta las hojas',
                            highlight: '⬆️ Transporte'
                        },
                        {
                            text: 'Las hojas usan luz del sol para hacer alimento',
                            highlight: '☀️ Fotosíntesis'
                        },
                        {
                            text: 'La flor produce semillas para más girasoles',
                            highlight: '🌻 Nuevas plantas'
                        }
                    ],
                    answer: '¡Ciclo completo de vida!'
                }
            }
        ],
        challenge: {
            question: {
                es: '¿Qué parte de la planta es responsable de hacer el alimento usando la luz del sol?',
                en: 'Which part of the plant is responsible for making food using sunlight?'
            },
            options: [
                { id: 'a', text: { es: 'Raíz', en: 'Root' } },
                { id: 'b', text: { es: 'Hojas', en: 'Leaves' } },
                { id: 'c', text: { es: 'Tallo', en: 'Stem' } },
                { id: 'd', text: { es: 'Flor', en: 'Flower' } }
            ],
            correctOptionId: 'b',
            explanation: {
                es: '¡Correcto! Las hojas hacen el alimento de la planta mediante la fotosíntesis, usando luz del sol, agua y dióxido de carbono.',
                en: 'Correct! Leaves make food for the plant through photosynthesis, using sunlight, water, and carbon dioxide.'
            }
        },
        reward: { coins: 110, xp: 160 }
    },
    // GRADE 1 - Subtraction
    {
        id: 'subtraction-g1',
        title: { es: 'Resta de Semillas', en: 'Seed Subtraction' },
        icon: '🌱',
        category: 'math',
        difficulty: 'easy',
        grade: 1,
        learningObjective: {
            es: 'Aprender a restar quitando elementos de un conjunto.',
            en: 'Learn to subtract by removing items from a set.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: '¿Qué es Restar?', en: 'What is Subtraction?' },
                content: {
                    es: 'Restar es quitarle cosas a un grupo. ¡El número se hace más pequeño!\n\nImagina que tienes 5 manzanas y te comes 2. ¿Cuántas te quedan?',
                    en: 'Subtracting is taking things away from a group. The number gets smaller!\n\nImagine you have 5 apples and you eat 2. How many are left?'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Había 8 pájaros en un árbol. 3 pájaros se fueron volando. ¿Cuántos pájaros quedan?',
                en: 'There were 8 birds in a tree. 3 birds flew away. How many birds are left?'
            },
            options: [
                { id: 'a', text: { es: '5', en: '5' } },
                { id: 'b', text: { es: '11', en: '11' } },
                { id: 'c', text: { es: '6', en: '6' } }
            ],
            correctOptionId: 'a',
            explanation: { es: '¡Correcto! 8 - 3 = 5.', en: 'Correct! 8 - 3 = 5.' }
        },
        reward: { coins: 60, xp: 90 }
    },
    // GRADE 3 - Word Problems
    {
        id: 'word-problems-g3',
        title: { es: 'Detective de Palabras', en: 'Word Detective' },
        icon: '🕵️',
        category: 'math',
        difficulty: 'medium',
        grade: 3,
        learningObjective: {
            es: 'Identificar la operación correcta en un problema matemático.',
            en: 'Identify the correct operation in a math problem.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'Pistas para Detectives', en: 'Detective Clues' },
                content: {
                    es: 'Para resolver problemas, busca palabras clave:\n\n➕ SUMA: "total", "juntar", "más"\n➖ RESTA: "cuántos faltan", "quedan", "perdió"',
                    en: 'To solve problems, look for keywords:\n\n➕ ADD: "total", "together", "more"\n➖ SUBTRACT: "how many left", "remain", "lost"'
                }
            }
        ],
        challenge: {
            question: {
                es: 'En la tienda hay 45 balones. Se venden 12 balones. ¿Qué operación debo hacer para saber cuántos quedan?',
                en: 'There are 45 balls in the shop. 12 balls are sold. What operation should I do to know how many are left?'
            },
            options: [
                { id: 'a', text: { es: 'Suma', en: 'Addition' } },
                { id: 'b', text: { es: 'Resta', en: 'Subtraction' } }
            ],
            correctOptionId: 'b',
            explanation: { es: '¡Cierto! Como se vendieron (se quitaron), usamos resta.', en: 'Right! Since they were sold (removed), we use subtraction.' }
        },
        reward: { coins: 80, xp: 120 }
    },
    // GRADE 5 - Percentages
    {
        id: 'percentages-g5',
        title: { es: 'Misión Porcentajes', en: 'Percentage Mission' },
        icon: '🎯',
        category: 'math',
        difficulty: 'hard',
        grade: 5,
        learningObjective: {
            es: 'Calcular porcentajes básicos usando partes de 100.',
            en: 'Calculate basic percentages using parts of 100.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: '¿Qué es el 50%?', en: 'What is 50%?' },
                content: {
                    es: 'El 50% es la mitad de algo. El 100% es el todo.\n\nSi tienes 10 dulces, el 50% son 5 dulces.',
                    en: '50% is half of something. 100% is the whole.\n\nIf you have 10 candies, 50% is 5 candies.'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Un videojuego cuesta $100. Tiene un descuento del 50%. ¿Cuánto cuesta ahora?',
                en: 'A video game costs $100. It has a 50% discount. How much does it cost now?'
            },
            options: [
                { id: 'a', text: { es: '$50', en: '$50' } },
                { id: 'b', text: { es: '$150', en: '$150' } },
                { id: 'c', text: { es: '$25', en: '$25' } }
            ],
            correctOptionId: 'a',
            explanation: { es: '¡Correcto! El 50% de 100 es 50.', en: 'Correct! 50% of 100 is 50.' }
        },
        reward: { coins: 150, xp: 200 }
    },
    // GRADE 1 - Geometry
    {
        id: 'shapes-g1',
        title: { es: 'Cazador de Formas', en: 'Shape Hunter' },
        icon: '🔺',
        category: 'math',
        difficulty: 'easy',
        grade: 1,
        learningObjective: {
            es: 'Identificar círculos, cuadrados y triángulos en objetos cotidianos.',
            en: 'Identify circles, squares, and triangles in everyday objects.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'Las Formas Están en Todo', en: 'Shapes are Everywhere' },
                content: {
                    es: 'Mira a tu alrededor. ¡Todo tiene forma!\n\n🔴 CÍRCULO: Es redondo como el sol.\n🟦 CUADRADO: Tiene 4 lados iguales como una ventana.\n🔺 TRIÁNGULO: Tiene 3 esquinas como un trozo de pizza.',
                    en: 'Look around. Everything has a shape!\n\n🔴 CIRCLE: It is round like the sun.\n🟦 SQUARE: It has 4 equal sides like a window.\n🔺 TRIANGLE: It has 3 corners like a slice of pizza.'
                }
            }
        ],
        challenge: {
            question: {
                es: '¿Qué forma tiene una moneda?',
                en: 'What shape is a coin?'
            },
            options: [
                { id: 'a', text: { es: 'Círculo', en: 'Circle' } },
                { id: 'b', text: { es: 'Triángulo', en: 'Triangle' } },
                { id: 'c', text: { es: 'Cuadrado', en: 'Square' } }
            ],
            correctOptionId: 'a',
            explanation: { es: '¡Correcto! Las monedas son redondas como los círculos.', en: 'Correct! Coins are round like circles.' }
        },
        reward: { coins: 50, xp: 80 }
    },
    // --- NUEVAS QUESTS CURRÍCULO 1° ---
    {
        id: 'patterns-adventure-g1',
        title: { es: 'Aventura de Patrones', en: 'Pattern Adventure' },
        icon: '🎨',
        category: 'math',
        difficulty: 'easy',
        grade: 1,
        learningObjective: {
            es: 'Identificar y completar patrones lógicos (AB, AAB).',
            en: 'Identify and complete logic patterns (AB, AAB).'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: '¿Qué sigue después?', en: 'What comes next?' },
                content: {
                    es: 'Un patrón es algo que se repite una y otra vez. 🔄\n\nEjemplo: 🍎 🍌 🍎 🍌 ... ¿Qué crees que sigue?\n\n¡La Profesora Lina dice: observa con mucha atención el orden!',
                    en: 'A pattern is something that repeats over and over. 🔄\n\nExample: 🍎 🍌 🍎 🍌 ... What do you think comes next?\n\nProfessor Lina says: look very closely at the order!'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Completa el patrón: 🟦 🔴 🟦 🔴 🟦 ___',
                en: 'Complete the pattern: 🟦 🔴 🟦 🔴 🟦 ___'
            },
            options: [
                { id: 'a', text: { es: '🟦 (Azul)', en: '🟦 (Blue)' } },
                { id: 'b', text: { es: '🔴 (Rojo)', en: '🔴 (Red)' } },
                { id: 'c', text: { es: '🔺 (Triángulo)', en: '🔺 (Triangle)' } }
            ],
            correctOptionId: 'b',
            explanation: { es: '¡Exacto! El patrón es Azul-Rojo, así que después del azul sigue el rojo.', en: 'Exactly! The pattern is Blue-Red, so after blue comes red.' }
        },
        reward: { coins: 70, xp: 120 }
    },
    {
        id: 'money-explorer-colombia',
        title: { es: 'Explorador de Monedas', en: 'Money Explorer' },
        icon: '💵',
        category: 'math',
        difficulty: 'medium',
        grade: 1,
        learningObjective: {
            es: 'Reconocer el dinero colombiano y su uso básico.',
            en: 'Recognize Colombian money and its basic use.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'Nuestras Monedas', en: 'Our Coins' },
                content: {
                    es: 'En Colombia usamos pesos. 🇨🇴\n\nHay monedas de 100, 200, 500 y 1000. ¡Cada una es diferente!\n\nPregunta de Lina: ¿Para qué nos sirve el dinero en la vida diaria?',
                    en: 'In Colombia we use pesos. 🇨🇴\n\nThere are 100, 200, 500 and 1000 coins. Each one is different!\n\nLina\'s question: What do we use money for in our daily lives?'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Si tienes dos monedas de 500, ¿cuánto dinero tienes en total?',
                en: 'If you have two 500 coins, how much money do you have in total?'
            },
            options: [
                { id: 'a', text: { es: '500 pesos', en: '500 pesos' } },
                { id: 'b', text: { es: '1000 pesos', en: '1000 pesos' } },
                { id: 'c', text: { es: '200 pesos', en: '200 pesos' } }
            ],
            correctOptionId: 'b',
            explanation: { es: '¡Super! 500 + 500 son 1000. ¡Ya puedes comprar un dulce!', en: 'Great! 500 + 500 is 1000. You can buy a candy now!' }
        },
        reward: { coins: 80, xp: 150 }
    },
    {
        id: 'data-detectives-g1',
        title: { es: 'Detectives de Datos', en: 'Data Detectives' },
        icon: '📊',
        category: 'math',
        difficulty: 'medium',
        grade: 1,
        learningObjective: {
            es: 'Organizar información en tablas simples.',
            en: 'Organize information in simple tables.'
        },
        learningSteps: [
            {
                type: 'explanation',
                title: { es: 'Contando Favoritos', en: 'Counting Favorites' },
                content: {
                    es: 'Podemos usar tablas para saber qué le gusta más a nuestros amigos. 📝\n\nSi 3 amigos prefieren perros y 2 prefieren gatos, ¿cómo lo anotarías?',
                    en: 'We can use tables to know what our friends like best. 📝\n\nIf 3 friends prefer dogs and 2 prefer cats, how would you write it down?'
                }
            }
        ],
        challenge: {
            question: {
                es: 'Mira esta gráfica: 🍎🍎🍎 (Manzanas), 🍌🍌 (Bananos). ¿Cuál fruta hay MÁS?',
                en: 'Look at this chart: 🍎🍎🍎 (Apples), 🍌🍌 (Bananas). Which fruit is there MORE of?'
            },
            options: [
                { id: 'a', text: { es: 'Manzanas', en: 'Apples' } },
                { id: 'b', text: { es: 'Bananos', en: 'Bananas' } },
                { id: 'c', text: { es: 'Hay igual', en: 'They are equal' } }
            ],
            correctOptionId: 'a',
            explanation: { es: '¡Correcto! Hay 3 manzanas y solo 2 bananos. ¡Las manzanas ganan!', en: 'Correct! There are 3 apples and only 2 bananas. Apples win!' }
        },
        reward: { coins: 100, xp: 200 }
    }
];
