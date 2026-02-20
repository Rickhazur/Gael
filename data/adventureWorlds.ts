// data/adventureWorlds.ts
// Definition of Adventure Worlds for each grade level

export interface AdventureWorld {
    id: string;
    grade: number;
    title: { es: string; en: string };
    description: { es: string; en: string };
    themeColor: string;
    bgGradient: string;
    icon: string;
    mapImage: string; // Added mapImage field
    lore: { es: string; en: string };
    missions: AdventureMission[];
}

export interface AdventureMission {
    id: string;
    level: string; // e.g., "1-1"
    title: { es: string; en: string };
    problem: { es: string; en: string }; // The real-world problem
    dba: string; // Reference to Colombian DBA
    category: 'math' | 'science' | 'language' | 'social_studies';
    difficulty: 'easy' | 'medium' | 'hard';
    reward: { coins: number; xp: number };
    status: 'locked' | 'available' | 'completed';
    position: { x: number; y: number }; // For the map layout
    hints: { es: string[]; en: string[] }; // Mario-style hints
    trophyId: string; // ID of the trophy gained
    /** Tutor (Lina) explains to the child what to do before the lesson. */
    tutorIntro?: { es: string; en: string };
    /** Nano Banana Pro: prompt for charming educational image. */
    imagePrompt?: string;
}

export const adventureWorlds: AdventureWorld[] = [
    {
        id: 'world-g1',
        grade: 1,
        title: { es: 'Valle de los Guardianes', en: 'Guardians Valley' },
        description: { es: 'Restaura el orden en la naturaleza.', en: 'Restore order in nature.' },
        themeColor: 'emerald',
        bgGradient: 'from-emerald-400 to-green-600',
        icon: '🌳',
        mapImage: '/assets/arena/master_map.png',
        lore: {
            es: 'Los Guardianes del Bosque han perdido su equipo. ¡Ayúdalos a clasificar y contar para salvar el bosque!',
            en: 'The Forest Guardians have lost their gear. Help them classify and count to save the forest!'
        },
        missions: [
            {
                id: 'm-g1-1',
                level: '1-1',
                title: { es: 'Censo de Criaturas', en: 'Creature Census' },
                problem: { es: '¡Muchos animales se han mezclado! Ayúdalos a contarlos por especie hasta 20.', en: 'Many animals have mixed up! Help count them by species up to 20.' },
                dba: 'DBA 1: Cuenta, compara y ordena números del 0 al 20.',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 50, xp: 80 },
                status: 'available',
                position: { x: 150, y: 300 },
                hints: { es: ['Usa tus dedos para no perder la cuenta.', 'Agrupa de 5 en 5.'], en: ['Use your fingers to keep track.', 'Group by 5s.'] },
                trophyId: 'trophy-g1-1'
            },
            {
                id: 'm-g1-2',
                level: '1-2',
                title: { es: 'Suma de Cristales', en: 'Crystal Addition' },
                problem: { es: 'Junta los cristales de luz para encender las flores. Sumas simples.', en: 'Gather light crystals to light up the flowers. Simple additions.' },
                dba: 'DBA 2: Resuelve problemas de suma (agrupar, juntar) con material concreto.',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 60, xp: 90 },
                status: 'locked',
                position: { x: 300, y: 250 },
                hints: { es: ['1+1 es igual a...', 'Cuenta los cristales uno por uno.'], en: ['1+1 equals...', 'Count crystals one by one.'] },
                trophyId: 'trophy-g1-2'
            },
            {
                id: 'm-g1-3',
                level: '1-3',
                title: { es: 'Resta de Semillas', en: 'Seed Subtraction' },
                problem: { es: '¿Cuántas semillas quedan si los pájaros se llevan algunas?', en: 'How many seeds are left if the birds take some?' },
                dba: 'DBA 2: Resuelve problemas de resta (quitar, separar) en situaciones cotidianas.',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 65, xp: 100 },
                status: 'locked',
                position: { x: 450, y: 200 },
                hints: { es: ['Si quitas, el número se hace pequeño.'], en: ['If you take away, the number gets smaller.'] },
                trophyId: 'trophy-g1-3'
            },
            {
                id: 'm-g1-4',
                level: '1-4',
                title: { es: 'Formas del Bosque', en: 'Forest Shapes' },
                problem: { es: 'Identifica círculos, cuadrados, rectángulos y triángulos ocultos.', en: 'Identify hidden circles, squares, rectangles, and triangles.' },
                dba: 'DBA 6: Compara y clasifica objetos bidimensionales por sus atributos.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 70, xp: 110 },
                status: 'locked',
                position: { x: 600, y: 280 },
                hints: { es: ['Mira los bordes de las piedras.', 'Cuenta las esquinas.'], en: ['Look at the edges of the stones.', 'Count the corners.'] },
                trophyId: 'trophy-g1-4'
            },
            {
                id: 'm-g1-5',
                level: '1-5',
                title: { es: 'Puente de Longitudes', en: 'Length Bridge' },
                problem: { es: 'Mide qué tronco es más largo usando tus propios pasos.', en: 'Measure which log is longer using your own steps.' },
                dba: 'DBA 4: Compara longitudes y alturas usando medidas no estandarizadas.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 75, xp: 120 },
                status: 'locked',
                position: { x: 800, y: 220 },
                hints: { es: ['Ponlos uno al lado del otro.'], en: ['Put them side by side.'] },
                trophyId: 'trophy-g1-5'
            },
            {
                id: 'm-g1-6',
                level: '1-6',
                title: { es: 'Reloj de Sol', en: 'Sun Clock' },
                problem: { es: 'Ordena la rutina de los guardianes: Mañana, Tarde, Noche.', en: 'Order the guardians routine: Morning, Afternoon, Night.' },
                dba: 'DBA 4: Establece relaciones temporales y secuencias de eventos.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 80, xp: 130 },
                status: 'locked',
                position: { x: 1000, y: 150 },
                hints: { es: ['¿Qué haces primero al despertar?', 'El sol sale en la mañana.'], en: ['What do you do first when you wake up?', 'The sun rises in the morning.'] },
                trophyId: 'trophy-g1-6'
            },
            {
                id: 'm-g1-7',
                level: '1-7',
                title: { es: 'Conteo de Tesoros', en: 'Treasure Counting' },
                problem: { es: 'Clasifica las hojas por color y cuéntalas en una tabla.', en: 'Sort leaves by color and count them in a table.' },
                dba: 'DBA 10: Clasifica y organiza datos en tablas (pictogramas simples).',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 85, xp: 140 },
                status: 'locked',
                position: { x: 1200, y: 300 },
                hints: { es: ['Haz una marca por cada hoja verde.'], en: ['Make a mark for each green leaf.'] },
                trophyId: 'trophy-g1-7'
            },
            {
                id: 'm-g1-8',
                level: '1-8',
                title: { es: 'El Gran 100', en: 'The Big 100' },
                problem: { es: 'Completa la serie numérica contando de 10 en 10 hasta 100.', en: 'Complete the number series counting by 10s up to 100.' },
                dba: 'DBA 1: Reconoce el sistema decimal y cuenta hasta 100 de diversas formas.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 90, xp: 150 },
                status: 'locked',
                position: { x: 1400, y: 200 },
                hints: { es: ['10, 20, 30...', 'Son las decenas.'], en: ['10, 20, 30...', 'These are the tens.'] },
                trophyId: 'trophy-g1-8'
            },
            {
                id: 'm-g1-9',
                level: '1-9',
                title: { es: 'Carrera de Guardianes', en: 'Guardian Race' },
                problem: { es: 'Identifica quién llegó Primero, Segundo y Tercero.', en: 'Identify who arrived First, Second, and Third.' },
                dba: 'DBA 1: Usa números ordinales para identificar posiciones.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 100, xp: 180 },
                status: 'locked',
                position: { x: 1250, y: 400 },
                hints: { es: ['El 1° es el ganador.', 'El 2° va después.'], en: ['1st is the winner.', '2nd comes after.'] },
                trophyId: 'trophy-g1-9'
            },
            {
                id: 'm-g1-10',
                level: '1-10',
                title: { es: 'Leyendas del Valle', en: 'Valley Legends' },
                problem: { es: 'Lee el mensaje de los ancestros y encuentra las palabras clave.', en: 'Read the message from the ancestors and find the keywords.' },
                dba: 'DBA 2: Identifica las letras del abecedario en textos escritos.',
                category: 'language',
                difficulty: 'hard',
                reward: { coins: 200, xp: 300 },
                status: 'locked',
                position: { x: 1000, y: 450 },
                hints: { es: ['Busca la letra inicial.', 'Sigue la lectura de izquierda a derecha.'], en: ['Find the starting letter.', 'Read from left to right.'] },
                trophyId: 'trophy-g1-10'
            }
        ]
    },
    {
        id: 'world-g2',
        grade: 2,
        title: { es: 'Desierto de los Enigmas', en: 'Desert of Enigmas' },
        description: { es: 'Descifra los secretos de las arenas antiguas.', en: 'Decipher the secrets of the ancient sands.' },
        themeColor: 'amber',
        bgGradient: 'from-orange-300 to-amber-600',
        icon: '🦂',
        mapImage: '/assets/arena/master_map.png',
        lore: {
            es: 'Las pirámides guardan tesoros matemáticos. Resuelve los enigmas numéricos para encontrar el Oasis Sagrado.',
            en: 'The pyramids hold mathematical treasures. Solve the numeric riddles to find the Sacred Oasis.'
        },
        missions: [
            {
                id: 'm-g2-1',
                level: '2-1',
                title: { es: 'Conteo de Dunas', en: 'Dune Counting' },
                problem: { es: 'Cuenta de 2 en 2, 5 en 5 y 10 en 10 hasta 999.', en: 'Count by 2s, 5s, and 10s up to 999.' },
                dba: 'DBA 1: Utiliza el sistema de numeración decimal (unidades, decenas, centenas).',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 50, xp: 80 },
                status: 'available',
                position: { x: 150, y: 350 },
                hints: { es: ['Identifica las centenas.', '900 + 90 + 9'], en: ['Identify the hundreds.', '900 + 90 + 9'] },
                trophyId: 'trophy-g2-1'
            },
            {
                id: 'm-g2-2',
                level: '2-2',
                title: { es: 'Sacos Dorados', en: 'Golden Sacks' },
                problem: { es: 'Organiza las monedas en sacos de 100 para contar el tesoro.', en: 'Organize coins in sacks of 100 to count the treasure.' },
                dba: 'DBA 2: Resuelve problemas aditivos de composición (unidades, decenas, centenas).',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 60, xp: 90 },
                status: 'locked',
                position: { x: 300, y: 400 },
                hints: { es: ['Cada saco dorado vale 100.', 'Junta 10 decenas para armar un saco.'], en: ['Each golden sack is 100.', 'Join 10 tens to make a sack.'] },
                trophyId: 'trophy-g2-2'
            },
            {
                id: 'm-g2-3',
                level: '2-3',
                title: { es: 'Pirámide de Restas', en: 'Subtraction Pyramid' },
                problem: { es: 'Resta bloques para bajar de la pirámide (desagrupando).', en: 'Subtract blocks to climb down the pyramid (regrouping).' },
                dba: 'DBA 2: Realiza sustracciones desagrupando decenas (restas prestando).',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 70, xp: 100 },
                status: 'locked',
                position: { x: 450, y: 300 },
                hints: { es: ['Si no te alcanza, pide prestado al vecino.'], en: ['If not enough, borrow from the neighbor.'] },
                trophyId: 'trophy-g2-3'
            },
            {
                id: 'm-g2-4',
                level: '2-4',
                title: { es: 'Cuentos de la Arena', en: 'Desert Tales' },
                problem: { es: 'Lee la leyenda del Faraón y ordena los sucesos.', en: 'Read the Pharaoh\'s legend and order the events.' },
                dba: 'DBA 6: Identifica la secuencia de las acciones en un texto literario.',
                category: 'language',
                difficulty: 'medium',
                reward: { coins: 75, xp: 110 },
                status: 'locked',
                position: { x: 600, y: 250 },
                hints: { es: ['¿Qué pasó primero?', 'Busca el final del cuento.'], en: ['What happened first?', 'Find the end of the story.'] },
                trophyId: 'trophy-g2-4'
            },
            {
                id: 'm-g2-5',
                level: '2-5',
                title: { es: 'Reloj de Arena', en: 'Sand Clock' },
                problem: { es: 'Lee la hora en relojes y mide la duración de eventos.', en: 'Read time on clocks and measure event duration.' },
                dba: 'DBA 8: Reconoce unidades de tiempo (horas, minutos) y eventos.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 80, xp: 120 },
                status: 'locked',
                position: { x: 750, y: 350 },
                hints: { es: ['1 hora tiene 60 minutos.'], en: ['1 hour has 60 minutes.'] },
                trophyId: 'trophy-g2-5'
            },
            {
                id: 'm-g2-6',
                level: '2-6',
                title: { es: 'Vida en el Oasis', en: 'Oasis Life' },
                problem: { es: 'Clasifica los seres vivos y objetos inertes del desierto.', en: 'Classify living beings and non-living objects of the desert.' },
                dba: 'DBA 3: Comprende que los seres vivos comparten características.',
                category: 'science',
                difficulty: 'hard',
                reward: { coins: 90, xp: 130 },
                status: 'locked',
                position: { x: 900, y: 450 },
                hints: { es: ['¿Respira y crece?', 'Los animales son seres vivos.'], en: ['Does it breathe and grow?', 'Animals are living beings.'] },
                trophyId: 'trophy-g2-6'
            },
            {
                id: 'm-g2-7',
                level: '2-7',
                title: { es: 'Mercado de Especias', en: 'Spice Market' },
                problem: { es: 'Usa monedas y billetes para comprar especias (Pesos Colombianos).', en: 'Use coins and bills to buy spices (Colombian Pesos).' },
                dba: 'DBA 1: Reconoce y opera con el valor de monedas y billetes.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 100, xp: 140 },
                status: 'locked',
                position: { x: 1050, y: 300 },
                hints: { es: ['Suma los valores. 1000 + 2000 = 3000.'], en: ['Sum the values. 1000 + 2000 = 3000.'] },
                trophyId: 'trophy-g2-7'
            },
            {
                id: 'm-g2-8',
                level: '2-8',
                title: { es: 'Rutas Ancestrales', en: 'Ancient Routes' },
                problem: { es: 'Dibuja el mapa de tu comunidad en la arena.', en: 'Draw the map of your community in the sand.' },
                dba: 'DBA 4: Reconoce puntos cardinales y se orienta en el espacio.',
                category: 'social_studies',
                difficulty: 'medium',
                reward: { coins: 110, xp: 150 },
                status: 'locked',
                position: { x: 1200, y: 200 },
                hints: { es: ['El sol sale por el Este.', 'Norte, Sur, Este y Oeste.'], en: ['The sun rises in the East.', 'North, South, East, and West.'] },
                trophyId: 'trophy-g2-8'
            },
            {
                id: 'm-g2-9',
                level: '2-9',
                title: { es: 'Multiplicación de Cactus', en: 'Cactus Multiplication' },
                problem: { es: 'Usa la suma repetida para contar espinas.', en: 'Use repeated addition to count thorns.' },
                dba: 'DBA 3: Comprende la multiplicación como suma repetida.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 120, xp: 180 },
                status: 'locked',
                position: { x: 1350, y: 350 },
                hints: { es: ['3 cactus con 5 espinas... 5+5+5 = 3x5'], en: ['3 cactus with 5 thorns... 5+5+5 = 3x5'] },
                trophyId: 'trophy-g2-9'
            },
            {
                id: 'm-g2-10',
                level: '2-10',
                title: { es: 'Patrones Ancestrales', en: 'Ancestral Patterns' },
                problem: { es: 'Descubre el patrón de crecimiento en los murales egipcios.', en: 'Discover the growth pattern in the Egyptian murals.' },
                dba: 'DBA 9: Identifica patrones numéricos y geométricos.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 200, xp: 300 },
                status: 'locked',
                position: { x: 1500, y: 300 },
                hints: { es: ['Observa qué cambia en cada paso.'], en: ['Observe what changes in each step.'] },
                trophyId: 'trophy-g2-10'
            }
        ]
    },
    {
        id: 'world-g3',
        grade: 3,
        title: { es: 'Isla de las Operaciones', en: 'Operations Island' },
        description: { es: 'Ciencia y tecnología para la zona costera.', en: 'Science and tech for the coastal zone.' },
        themeColor: 'indigo',
        bgGradient: 'from-blue-600 to-indigo-900',
        icon: '⛰️',
        mapImage: '/assets/arena/master_map.png',
        lore: {
            es: 'El Dr. Nova necesita asistentes brillantes. La isla se está quedando sin energía y solo el conocimiento puede reactivar los generadores en los diferentes biomas.',
            en: 'Dr. Nova needs brilliant assistants. The island is running out of power and only knowledge can reactivate the generators in different biomes.'
        },
        missions: [
            {
                id: 'm-g3-1',
                level: '3-1',
                title: { es: 'Multiplicación de Corales', en: 'Coral Multiplication' },
                problem: { es: 'Calcula el total multiplicando filas por columnas.', en: 'Calculate the total by multiplying rows by columns.' },
                dba: 'DBA 1: Resuelve problemas multiplicativos (suma repetida, arreglos).',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 80, xp: 120 },
                status: 'available',
                position: { x: 150, y: 350 },
                hints: { es: ['Filas x Columnas = Total.'], en: ['Rows x Columns = Total.'] },
                trophyId: 'trophy-g3-1'
            },
            {
                id: 'm-g3-2',
                level: '3-2',
                title: { es: 'Fracciones del Manglar', en: 'Mangrove Fractions' },
                problem: { es: 'Identifica fracciones como parte de un conjunto.', en: 'Identify fractions as part of a set.' },
                dba: 'DBA 3: Interpreta fracciones en contextos de medida y reparto.',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 90, xp: 140 },
                status: 'locked',
                position: { x: 320, y: 300 },
                hints: { es: ['El denominador indica el total de partes.', '1 de 4 es 1/4.'], en: ['Denominator indicates total parts.', '1 of 4 is 1/4.'] },
                trophyId: 'trophy-g3-2'
            },
            {
                id: 'm-g3-3',
                level: '3-3',
                title: { es: 'División en la Selva', en: 'Rainforest Division' },
                problem: { es: 'Reparte los suministros equitativamente.', en: 'Share supplies equally.' },
                dba: 'DBA 2: Comprende la división como repartos y restas repetidas.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 100, xp: 160 },
                status: 'locked',
                position: { x: 480, y: 220 },
                hints: { es: ['¿Cuántos le tocan a cada uno?'], en: ['How many does each one get?'] },
                trophyId: 'trophy-g3-3'
            },
            {
                id: 'm-g3-4',
                level: '3-4',
                title: { es: 'Geometría del Dosel', en: 'Canopy Geometry' },
                problem: { es: 'Identifica y describe figuras bidimensionales y tridimensionales.', en: 'Identify and describe 2D and 3D shapes.' },
                dba: 'DBA 5: Clasifica figuras y cuerpos geométricos por sus atributos.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 110, xp: 180 },
                status: 'locked',
                position: { x: 650, y: 140 },
                hints: { es: ['¿Tiene lados rectos o curvos?', '¿Es plano o tiene volumen?'], en: ['Does it have straight or curved sides?', 'Is it flat or does it have volume?'] },
                trophyId: 'trophy-g3-4'
            },
            {
                id: 'm-g3-5',
                level: '3-5',
                title: { es: 'Estadística del Valle', en: 'Valley Statistics' },
                problem: { es: 'Lee diagramas de barras sobre la lluvia caída.', en: 'Read bar charts about rainfall.' },
                dba: 'DBA 10: Lee e interpreta información en diagramas de barras.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 120, xp: 200 },
                status: 'locked',
                position: { x: 850, y: 200 },
                hints: { es: ['Compara la altura de las barras.'], en: ['Compare the height of the bars.'] },
                trophyId: 'trophy-g3-5'
            },
            {
                id: 'm-g3-6',
                level: '3-6',
                title: { es: 'Cálculo de Cumbres', en: 'Peak Calculation' },
                problem: { es: 'Realiza sumas y restas con números hasta 100.000.', en: 'Perform addition and subtraction with numbers up to 100,000.' },
                dba: 'DBA 1: Usa propiedades de las operaciones lógicas y aritméticas.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 130, xp: 220 },
                status: 'locked',
                position: { x: 1050, y: 150 },
                hints: { es: ['Ordena por unidades, decenas, centenas...'], en: ['Order by units, tens, hundreds...'] },
                trophyId: 'trophy-g3-6'
            },
            {
                id: 'm-g3-7',
                level: '3-7',
                title: { es: 'Historia de la Isla', en: 'Island History' },
                problem: { es: 'Investiga quiénes fueron los primeros habitantes de la isla.', en: 'Investigate who were the first inhabitants of the island.' },
                dba: 'DBA 4: Reconoce las características de su comunidad y los cambios que ha tenido.',
                category: 'social_studies',
                difficulty: 'medium',
                reward: { coins: 140, xp: 240 },
                status: 'locked',
                position: { x: 1250, y: 100 },
                hints: { es: ['Busca huellas en las cuevas.'], en: ['Look for footprints in the caves.'] },
                trophyId: 'trophy-g3-7'
            },
            {
                id: 'm-g3-8',
                level: '3-8',
                title: { es: 'Patrones de Obsidiana', en: 'Obsidian Patterns' },
                problem: { es: 'Descubre la regla de formación en la secuencia numérica.', en: 'Discover the formation rule in the number sequence.' },
                dba: 'DBA 8: Identifica patrones numéricos y geométricos.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 150, xp: 260 },
                status: 'locked',
                position: { x: 1450, y: 250 },
                hints: { es: ['¿Suma siempre la misma cantidad?'], en: ['Does it always add the same amount?'] },
                trophyId: 'trophy-g3-8'
            },
            {
                id: 'm-g3-9',
                level: '3-9',
                title: { es: 'Probabilidad Volcánica', en: 'Volcanic Probability' },
                problem: { es: '¿Es seguro o imposible que el volcán despierte hoy?', en: 'Is it certain or impossible for the volcano to wake up today?' },
                dba: 'DBA 11: Describe situaciones de azar (seguro, posible, imposible).',
                category: 'science',
                difficulty: 'hard',
                reward: { coins: 160, xp: 280 },
                status: 'locked',
                position: { x: 1300, y: 400 },
                hints: { es: ['Si nunca ha pasado, es poco probable.'], en: ['If it has never happened, it is unlikely.'] },
                trophyId: 'trophy-g3-9'
            },
            {
                id: 'm-g3-10',
                level: '3-10',
                title: { es: 'Sumo Sacerdote', en: 'High Priest' },
                problem: { es: 'Resuelve un problema mixto de operaciones y lógica.', en: 'Solve a mixed operations and logic problem.' },
                dba: 'DBA 2 (Integral): Resolución de problemas aditivos y multiplicativos.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 300, xp: 500 },
                status: 'locked',
                position: { x: 1100, y: 480 },
                hints: { es: ['Divide el problema en pasos pequeños.'], en: ['Break the problem into small steps.'] },
                trophyId: 'trophy-g3-10'
            }
        ]
    },
    {
        id: 'world-g4',
        grade: 4,
        title: { es: 'Laboratorio del Cielo', en: 'Sky Laboratory' },
        description: { es: 'Investigación aérea en la ciudad flotante.', en: 'Aerial research in the floating city.' },
        themeColor: 'cyan',
        bgGradient: 'from-cyan-400 to-blue-600',
        icon: '🛸',
        mapImage: '/assets/arena/master_map.png',
        lore: {
            es: 'En las nubes se encuentra Sky-City, donde los científicos de Nova estudian el clima. ¡Ayúdales a calibrar sus máquinas!',
            en: 'In the clouds lies Sky-City, where Nova scientists study the weather. Help them calibrate their machines!'
        },
        missions: [
            {
                id: 'm-g4-1',
                level: '4-1',
                title: { es: 'Métrica de Nubes', en: 'Cloud Metrics' },
                problem: { es: 'Calcula el área y perímetro de las plataformas flotantes.', en: 'Calculate the area and perimeter of the floating platforms.' },
                dba: 'DBA 4: Calcula el área y perímetro de rectángulos y cuadrados.',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 100, xp: 150 },
                status: 'available',
                position: { x: 150, y: 250 },
                hints: { es: ['Área = Largo x Ancho. Perímetro = Suma de lados.'], en: ['Area = Length x Width. Perimeter = Sum of sides.'] },
                trophyId: 'trophy-g4-1'
            },
            {
                id: 'm-g4-2',
                level: '4-2',
                title: { es: 'Radar Decimal', en: 'Decimal Radar' },
                problem: { es: 'Identifica y ordena números decimales en los sensores.', en: 'Identify and order decimal numbers on the sensors.' },
                dba: 'DBA 1: Interpreta y usa números decimales hasta las milésimas.',
                category: 'math',
                difficulty: 'easy',
                reward: { coins: 110, xp: 170 },
                status: 'locked',
                position: { x: 300, y: 350 },
                hints: { es: ['Mira la posición después de la coma.'], en: ['Look at the position after the comma.'] },
                trophyId: 'trophy-g4-2'
            },
            {
                id: 'm-g4-3',
                level: '4-3',
                title: { es: 'Fracciones de Vuelo', en: 'Flight Fractions' },
                problem: { es: 'Suma y resta fracciones con el mismo denominador.', en: 'Add and subtract fractions with the same denominator.' },
                dba: 'DBA 1: Realiza operaciones con fracciones homogéneas.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 120, xp: 190 },
                status: 'locked',
                position: { x: 450, y: 280 },
                hints: { es: ['Deja el denominador igual y opera los de arriba.'], en: ['Keep the denominator same and operate the top ones.'] },
                trophyId: 'trophy-g4-3'
            },
            {
                id: 'm-g4-4',
                level: '4-4',
                title: { es: 'Mensajes del Aire', en: 'Air Messages' },
                problem: { es: 'Analiza los anuncios de Sky-City y encuentra su intención.', en: 'Analyze Sky-City ads and find their intention.' },
                dba: 'DBA 5: Comprende la intención comunicativa de diferentes tipos de texto.',
                category: 'language',
                difficulty: 'medium',
                reward: { coins: 130, xp: 210 },
                status: 'locked',
                position: { x: 600, y: 200 },
                hints: { es: ['¿Qué quieren que hagas?', 'Mira las imágenes y el texto.'], en: ['What do they want you to do?', 'Look at the images and text.'] },
                trophyId: 'trophy-g4-4'
            },
            {
                id: 'm-g4-5',
                level: '4-5',
                title: { es: 'Ángulos de Navegación', en: 'Navigation Angles' },
                problem: { es: 'Mide ángulos usando el transportador para el despegue.', en: 'Measure angles using the protractor for takeoff.' },
                dba: 'DBA 3: Mide y clasifica ángulos (agudo, recto, obtuso).',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 140, xp: 230 },
                status: 'locked',
                position: { x: 800, y: 320 },
                hints: { es: ['Menos de 90° es agudo.'], en: ['Less than 90° is acute.'] },
                trophyId: 'trophy-g4-5'
            },
            {
                id: 'm-g4-6',
                level: '4-6',
                title: { es: 'Promedio Atmosférico', en: 'Atmospheric Average' },
                problem: { es: 'Calcula el promedio de temperatura de la semana.', en: 'Calculate the average temperature of the week.' },
                dba: 'DBA 10: Interpreta la media (promedio) de un conjunto de datos.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 150, xp: 250 },
                status: 'locked',
                position: { x: 1000, y: 380 },
                hints: { es: ['Suma todo y divide por la cantidad de datos.'], en: ['Sum everything and divide by the count of data.'] },
                trophyId: 'trophy-g4-6'
            },
            {
                id: 'm-g4-7',
                level: '4-7',
                title: { es: 'Detección de Datos', en: 'Data Detection' },
                problem: { es: 'Organiza datos de vientos en diagramas de líneas.', en: 'Organize wind data in line charts.' },
                dba: 'DBA 10: Representa datos en diagramas de barras y líneas.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 160, xp: 270 },
                status: 'locked',
                position: { x: 1200, y: 300 },
                hints: { es: ['Une los puntos para ver la tendencia.'], en: ['Connect the dots to see the trend.'] },
                trophyId: 'trophy-g4-7'
            },
            {
                id: 'm-g4-8',
                level: '4-8',
                title: { es: 'Geometría Espacial', en: 'Space Geometry' },
                problem: { es: 'Diferencia prismas y pirámides por sus caras y bases.', en: 'Differentiate prisms and pyramids by their faces and bases.' },
                dba: 'DBA 3: Diferencia cuerpos geométricos (prismas, pirámides).',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 180, xp: 300 },
                status: 'locked',
                position: { x: 1400, y: 220 },
                hints: { es: ['La pirámide termina en punta.'], en: ['The pyramid ends in a point.'] },
                trophyId: 'trophy-g4-8'
            },
            {
                id: 'm-g4-9',
                level: '4-9',
                title: { es: 'Secuencia de Clima', en: 'Weather Sequence' },
                problem: { es: 'Predice el siguiente valor en una secuencia multiplicativa.', en: 'Predict the next value in a multiplicative sequence.' },
                dba: 'DBA 9: Identifica patrones en secuencias multiplicativas.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 200, xp: 350 },
                status: 'locked',
                position: { x: 1300, y: 450 },
                hints: { es: ['¿Por cuánto se multiplica cada vez?'], en: ['By how much do you multiply each time?'] },
                trophyId: 'trophy-g4-9'
            },
            {
                id: 'm-g4-10',
                level: '4-10',
                title: { es: 'Ingeniero Jefe', en: 'Chief Engineer' },
                problem: { es: 'Resuelve un reto de operaciones combinadas para salvar la ciudad.', en: 'Solve a combined operations challenge to save the city.' },
                dba: 'DBA INTEGRAL: Resolución de problemas con números naturales y decimales.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 400, xp: 800 },
                status: 'locked',
                position: { x: 1000, y: 550 },
                hints: { es: ['Sigue el orden de las operaciones.'], en: ['Follow the order of operations.'] },
                trophyId: 'trophy-g4-10'
            }
        ]
    },
    {
        id: 'world-g5',
        grade: 5,
        title: { es: 'Ciudadela del Tiempo', en: 'Citadel of Time' },
        description: { es: 'Salva el planeta con matemáticas de impacto real.', en: 'Save the planet with real-world impact math.' },
        themeColor: 'violet',
        bgGradient: 'from-violet-500 to-purple-900',
        icon: '🌍',
        mapImage: '/assets/arena/master_map.png',
        lore: {
            es: 'Tu progreso académico se convierte en misiones para salvar el planeta real. ¡Jugar con un propósito!',
            en: 'Your academic progress becomes missions to save the real planet. Play with a purpose!'
        },
        missions: [
            {
                id: 'm-g5-1',
                level: '5-1',
                title: { es: 'Limpieza de Océanos', en: 'Ocean Cleanup' },
                problem: { es: 'Remueve plásticos del arrecife usando fracciones para clasificar y contar residuos.', en: 'Remove plastics from the reef using fractions to classify and count waste.' },
                dba: 'DBA 2: Interpreta y resuelve problemas con fracciones y sus operaciones.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 500, xp: 150 },
                status: 'available',
                position: { x: 150, y: 300 },
                hints: { es: ['¿Qué fracción del total son plásticos?', 'Numerador: lo que cuentas. Denominador: el total.'], en: ['What fraction of the total is plastic?', 'Numerator: what you count. Denominator: the total.'] },
                trophyId: 'trophy-g5-1',
                tutorIntro: { es: '¡Hola, explorador! 🌊 En el arrecife hay plásticos mezclados con corales y peces. Tu misión es usar fracciones para contar qué parte del total son residuos. Así sabremos cuánto limpiar. ¡Vamos a salvar el océano juntos!', en: 'Hey, explorer! 🌊 The reef has plastic mixed with corals and fish. Your mission is to use fractions to count what part of the total is waste. That way we know how much to clean. Let\'s save the ocean together!' },
                imagePrompt: 'charming underwater reef with colorful fish and friendly diver collecting plastic bottles, bright and hopeful kids illustration'
            },
            {
                id: 'm-g5-2',
                level: '5-2',
                title: { es: 'Reforestación Amazonas', en: 'Amazon Reforestation' },
                problem: { es: 'Calcula el área de siembra para salvar el pulmón del mundo.', en: 'Calculate the planting area to save the world\'s lung.' },
                dba: 'DBA 6: Calcula áreas de triángulos y cuadriláteros.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 750, xp: 200 },
                status: 'locked',
                position: { x: 300, y: 350 },
                hints: { es: ['Área = base × altura (rectángulos).', '(Base × Altura) / 2 para triángulos.'], en: ['Area = base × height (rectangles).', '(Base × Height) / 2 for triangles.'] },
                trophyId: 'trophy-g5-2',
                tutorIntro: { es: '¡Qué emoción! 🌳 El Amazonas necesita árboles nuevos. Vamos a calcular el área de las zonas de siembra con formas que ya conoces: rectángulos y triángulos. Cada número que calcules son árboles que volverán a crecer.', en: 'How exciting! 🌳 The Amazon needs new trees. We\'ll calculate the planting area using shapes you know: rectangles and triangles. Every number you find means more trees growing back.' },
                imagePrompt: 'whimsical rainforest with kids planting small trees and friendly animals, green and hopeful educational illustration'
            },
            {
                id: 'm-g5-3',
                level: '5-3',
                title: { es: 'Energía Solar Neo-Tokio', en: 'Neo-Tokyo Solar Energy' },
                problem: { es: 'Optimiza los paneles solares resolviendo porcentajes de eficiencia.', en: 'Optimize solar panels by solving efficiency percentages.' },
                dba: 'DBA 3: Resuelve problemas que involucran porcentajes.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 350, xp: 170 },
                status: 'locked',
                position: { x: 450, y: 250 },
                hints: { es: ['50% es la mitad.', 'Porcentaje = (parte / total) × 100'], en: ['50% is half.', 'Percentage = (part / total) × 100'] },
                trophyId: 'trophy-g5-3',
                tutorIntro: { es: '¡Luz y números! ☀️ En Neo-Tokio los paneles solares dan energía a la ciudad. Tu trabajo es calcular qué porcentaje de cada panel está funcionando. Así sabremos cuánta energía limpia estamos generando. ¡Tú decides el futuro de la ciudad!', en: 'Light and numbers! ☀️ In Neo-Tokyo solar panels power the city. Your job is to find what percentage of each panel is working. That way we know how much clean energy we\'re making. You decide the city\'s future!' },
                imagePrompt: 'friendly futuristic city with solar panels on rooftops and sun rays, cheerful kids style illustration'
            },
            {
                id: 'm-g5-4',
                level: '5-4',
                title: { es: 'Datos del Clima', en: 'Climate Data' },
                problem: { es: 'Calcula la media, mediana y moda de temperaturas para predecir patrones.', en: 'Calculate mean, median, and mode of temperatures to predict patterns.' },
                dba: 'DBA 11: Interpreta la media, mediana y moda en conjuntos de datos.',
                category: 'math',
                difficulty: 'medium',
                reward: { coins: 130, xp: 180 },
                status: 'locked',
                position: { x: 600, y: 400 },
                hints: { es: ['La moda es el valor que más se repite.'], en: ['Mode is the value that repeats most.'] },
                trophyId: 'trophy-g5-4',
                tutorIntro: { es: '¡Somos científicos del clima! 📊 Tenemos temperaturas de la semana y queremos encontrar la media, la mediana y la moda. Con eso podremos predecir si mañana hará sol o lluvia. ¡Tú manejas los datos!', en: 'We\'re climate scientists! 📊 We have temperatures for the week and we need to find the mean, median, and mode. With that we can predict sun or rain tomorrow. You\'re in charge of the data!' },
                imagePrompt: 'cute weather station with thermometer and clouds, kids and friendly sun, educational illustration'
            },
            {
                id: 'm-g5-5',
                level: '5-5',
                title: { es: 'Triángulos Solares', en: 'Solar Triangles' },
                problem: { es: 'Calcula el área de los paneles triangulares del techo solar.', en: 'Calculate the area of triangular solar roof panels.' },
                dba: 'DBA 6: Calcula áreas de triángulos y cuadriláteros.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 140, xp: 200 },
                status: 'locked',
                position: { x: 750, y: 300 },
                hints: { es: ['(Base x Altura) / 2'], en: ['(Base x Height) / 2'] },
                trophyId: 'trophy-g5-5',
                tutorIntro: { es: '¡Formas que dan energía! 🔺 Los techos tienen paneles en forma de triángulo. Vamos a calcular su área con la fórmula base por altura entre dos. Cada triángulo que resuelvas es más luz para las casas.', en: 'Shapes that make energy! 🔺 The roofs have triangular panels. We\'ll find their area with base times height divided by two. Every triangle you solve means more light for homes.' },
                imagePrompt: 'charming house with triangular solar panels on roof, sun and friendly family, bright kids illustration'
            },
            {
                id: 'm-g5-6',
                level: '5-6',
                title: { es: 'Tanques de Agua', en: 'Water Tanks' },
                problem: { es: 'Calcula el volumen de tanques de almacenamiento de agua potable.', en: 'Calculate the volume of drinking water storage tanks.' },
                dba: 'DBA 6: Diferencia y calcula el volumen de cuerpos geométricos.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 150, xp: 210 },
                status: 'locked',
                position: { x: 900, y: 350 },
                hints: { es: ['Largo x Ancho x Alto.'], en: ['Length x Width x Height.'] },
                trophyId: 'trophy-g5-6',
                tutorIntro: { es: '¡Agua para todos! 💧 El pueblo necesita tanques para guardar agua potable. Vamos a calcular el volumen de cada tanque con largo, ancho y alto. Así sabremos cuánta agua cabrá y cuántas familias podremos ayudar.', en: 'Water for everyone! 💧 The town needs tanks to store drinking water. We\'ll find the volume of each tank using length, width, and height. That way we know how much water fits and how many families we can help.' },
                imagePrompt: 'friendly village with water tanks and happy children, blue sky and green plants, whimsical educational art'
            },
            {
                id: 'm-g5-7',
                level: '5-7',
                title: { es: 'Ética Ambiental', en: 'Environmental Ethics' },
                problem: { es: 'Debate: decisiones sobre uso de recursos y tecnología para el planeta.', en: 'Debate: decisions about resource use and technology for the planet.' },
                dba: 'DBA 6: Participa en debates sobre temas de interés general.',
                category: 'social_studies',
                difficulty: 'medium',
                reward: { coins: 160, xp: 220 },
                status: 'locked',
                position: { x: 1050, y: 250 },
                hints: { es: ['Piensa en el bien de todos.', 'Argumenta tu posición.'], en: ['Think of the good of all.', 'Argue your position.'] },
                trophyId: 'trophy-g5-7',
                tutorIntro: { es: '¡Tu voz cuenta! 🌍 Vamos a debatir cómo usar la tecnología y los recursos sin dañar el planeta. No hay una sola respuesta correcta: tú piensas, argumentas y escuchas. Así aprendemos a tomar decisiones juntos.', en: 'Your voice matters! 🌍 We\'ll debate how to use technology and resources without hurting the planet. There\'s no single right answer: you think, argue, and listen. That\'s how we learn to decide together.' },
                imagePrompt: 'diverse kids in a circle discussing and caring for a small globe, warm and inclusive illustration'
            },
            {
                id: 'm-g5-8',
                level: '5-8',
                title: { es: 'Probabilidad de Lluvia', en: 'Rain Probability' },
                problem: { es: 'Expresa la probabilidad de precipitación como fracción para planear riego.', en: 'Express rain probability as a fraction to plan irrigation.' },
                dba: 'DBA 10: Predice y calcula la probabilidad de ocurrencia.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 170, xp: 230 },
                status: 'locked',
                position: { x: 1200, y: 400 },
                hints: { es: ['Casos favorables / Casos totales.'], en: ['Favorable cases / Total cases.'] },
                trophyId: 'trophy-g5-8',
                tutorIntro: { es: '¡Lluvia y matemáticas! 🌧️ Los agricultores necesitan saber si va a llover para regar o no. Vamos a escribir la probabilidad de lluvia como una fracción: casos favorables entre casos totales. Así ayudamos a cuidar el agua.', en: 'Rain and math! 🌧️ Farmers need to know if it will rain so they know whether to irrigate. We\'ll write rain probability as a fraction: favorable cases over total cases. That way we help save water.' },
                imagePrompt: 'charming farm with rain clouds and sun, kids with umbrella and plants, cozy educational scene'
            },
            {
                id: 'm-g5-9',
                level: '5-9',
                title: { es: 'Proporción de Recursos', en: 'Resource Proportion' },
                problem: { es: 'Resuelve proporcionalidad directa para repartir agua y semillas (regla de tres).', en: 'Solve direct proportionality to distribute water and seeds (rule of three).' },
                dba: 'DBA 5: Resuelve problemas de proporcionalidad directa.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 190, xp: 260 },
                status: 'locked',
                position: { x: 1350, y: 300 },
                hints: { es: ['Si 1 vale 10, 2 valen 20.'], en: ['If 1 equals 10, 2 equals 20.'] },
                trophyId: 'trophy-g5-9',
                tutorIntro: { es: '¡Repartir con justicia! ⚖️ Tenemos agua y semillas para varias comunidades. Con la regla de tres calculamos cuánto le toca a cada una si repartimos en proporción. Así todos reciben lo que necesitan.', en: 'Share fairly! ⚖️ We have water and seeds for several communities. With the rule of three we find how much each one gets when we share in proportion. Everyone gets what they need.' },
                imagePrompt: 'friendly scene of sharing water cans and seed bags between villages, warm and hopeful kids art'
            },
            {
                id: 'm-g5-10',
                level: '5-10',
                title: { es: 'El Equilibrio Maestro', en: 'The Master Balance' },
                problem: { es: 'Desafío final: ecuaciones simples para equilibrar recursos (x + 5 = 10).', en: 'Final challenge: simple equations to balance resources (x + 5 = 10).' },
                dba: 'DBA 7 (Variacional): Encuentra el valor desconocido en igualdades.',
                category: 'math',
                difficulty: 'hard',
                reward: { coins: 300, xp: 600 },
                status: 'locked',
                position: { x: 1500, y: 300 },
                hints: { es: ['¿Qué número falta para que sea igual?'], en: ['What number is missing to make it equal?'] },
                trophyId: 'trophy-g5-10',
                tutorIntro: { es: '¡El reto final! 🏆 Para que el planeta esté en equilibrio, hay que encontrar el número que falta en ecuaciones como x + 5 = 10. Tú descubres la incógnita y cierras el ciclo. ¡Estás listo para ser el Equilibrio Maestro!', en: 'The final challenge! 🏆 For the planet to be in balance, we need to find the missing number in equations like x + 5 = 10. You find the unknown and close the cycle. You\'re ready to be the Master of Balance!' },
                imagePrompt: 'magical balance scale with glowing numbers and a friendly earth, epic but cute kids illustration'
            }
        ]
    }
];
