/**
 * Nova ICFES — Currículo Completo por Grados (6° a 11°)
 * Basado en los Derechos Básicos de Aprendizaje (DBA) del MEN Colombia
 * y los Estándares Básicos de Competencias (EBC)
 * 
 * Cada grado tiene módulos por área ICFES con lecciones detalladas
 * que simulan una clase real con la Profesora Lina.
 */

export interface Lesson {
  id: string;
  title: string;
  objective: string; // Lo que aprenderás
  explanation: string; // Explicación completa tipo clase (Profesora Lina)
  examples: { problem: string; solution: string }[];
  keyFormulas?: string[]; // Para matemáticas/ciencias
  keyTerms?: { term: string; definition: string }[];
  practiceQuestions: {
    text: string;
    context?: string;
    options: { id: string; text: string }[];
    correctId: string;
    explanation: string;
    socraticHints: string[];
  }[];
  duration: string; // Ej: "12 min"
  type: 'lesson' | 'practice' | 'review' | 'exam';
}

export interface GradeModule {
  id: string;
  area: 'LECTURA_CRITICA' | 'MATEMATICAS' | 'SOCIALES' | 'CIENCIAS' | 'INGLES';
  areaName: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

export interface GradeCurriculum {
  grade: number;
  name: string;
  description: string;
  modules: GradeModule[];
}

// ═══════════════════════════════════════════
// GRADO 6° — FUNDAMENTOS
// ═══════════════════════════════════════════

const GRADE_6: GradeCurriculum = {
  grade: 6,
  name: "Sexto Grado",
  description: "Bases fundamentales: fracciones, gramática, célula, geografía e inglés básico",
  modules: [
    {
      id: "g6-mat", area: "MATEMATICAS", areaName: "Matemáticas", icon: "🔢", color: "#3B82F6",
      lessons: [
        {
          id: "g6-mat-01", title: "Números naturales y operaciones", duration: "15 min",
          type: "lesson",
          objective: "Dominar las cuatro operaciones básicas con números naturales y su jerarquía.",
          explanation: `¡Hola! Soy la Profesora Lina 👩‍🏫 y hoy vamos a hablar de algo que usas TODOS los días: las operaciones con números.

**¿Sabías que ya haces matemáticas sin darte cuenta?**
Cuando compras algo en la tienda y calculas el vuelto, estás restando. Cuando repartes una pizza en partes iguales, estás dividiendo.

**Las 4 operaciones básicas:**
• **Suma (+):** Juntar cantidades → 15 + 8 = 23
• **Resta (-):** Quitar o encontrar la diferencia → 23 - 8 = 15
• **Multiplicación (×):** Sumar un número varias veces → 5 × 4 = 20 (es como sumar 5+5+5+5)
• **División (÷):** Repartir en partes iguales → 20 ÷ 4 = 5

**⚡ La regla de oro: Jerarquía de operaciones**
Cuando hay varias operaciones juntas, HAY UN ORDEN:
1. Primero: Paréntesis ( )
2. Segundo: Multiplicación y División (de izquierda a derecha)
3. Último: Suma y Resta (de izquierda a derecha)

**Ejemplo:** 3 + 4 × 2 = ?
❌ Incorrecto: 3 + 4 = 7, luego 7 × 2 = 14
✅ Correcto: 4 × 2 = 8, luego 3 + 8 = **11**
(¡Primero la multiplicación, luego la suma!)

Piénsalo así: si te piden "compra 3 panes de $500 y una gaseosa de $2.000", el total es 3×500 + 2.000 = $3.500, no (3+500)×2.000. ¡El orden importa!`,
          examples: [
            { problem: "Calcula: 12 + 3 × 5 - 2", solution: "Primero 3×5 = 15. Luego 12 + 15 - 2 = 25" },
            { problem: "Calcula: (8 + 2) × 3", solution: "Primero el paréntesis: 8+2 = 10. Luego 10×3 = 30" },
            { problem: "Un bus lleva 45 personas. En una parada bajan 12 y suben 8. ¿Cuántas van ahora?", solution: "45 - 12 + 8 = 41 personas" }
          ],
          keyTerms: [
            { term: "Jerarquía de operaciones", definition: "El orden en que se deben resolver las operaciones: paréntesis → ×÷ → +-" },
            { term: "Múltiplo", definition: "Resultado de multiplicar un número por otro natural" },
            { term: "Factor", definition: "Cada número que se multiplica" }
          ],
          practiceQuestions: [
            {
              text: "¿Cuánto es 5 + 3 × 4?",
              options: [{ id: "A", text: "32" }, { id: "B", text: "17" }, { id: "C", text: "20" }, { id: "D", text: "12" }],
              correctId: "B",
              explanation: "Primero multiplicación: 3×4=12. Luego suma: 5+12=17.",
              socraticHints: ["¿Qué operación se hace primero según la jerarquía?", "La multiplicación va antes que la suma."]
            },
            {
              text: "Un trabajador gana $50.000 diarios. ¿Cuánto gana en una semana de 6 días laborales?",
              options: [{ id: "A", text: "$250.000" }, { id: "B", text: "$300.000" }, { id: "C", text: "$350.000" }, { id: "D", text: "$500.000" }],
              correctId: "B",
              explanation: "$50.000 × 6 = $300.000",
              socraticHints: ["¿Cuántos días trabaja?", "Si gana $50.000 por DÍA, y trabaja 6 días..."]
            },
            {
              text: "¿Cuánto es (15 - 3) × 2 + 4?",
              options: [{ id: "A", text: "28" }, { id: "B", text: "20" }, { id: "C", text: "32" }, { id: "D", text: "24" }],
              correctId: "A",
              explanation: "Paréntesis: 15-3=12. Multiplicación: 12×2=24. Suma: 24+4=28.",
              socraticHints: ["¿Qué haces primero: el paréntesis o la multiplicación?", "Después del paréntesis, ¿qué sigue?"]
            }
          ]
        },
        {
          id: "g6-mat-02", title: "Fracciones: la base de todo", duration: "18 min",
          type: "lesson",
          objective: "Entender qué es una fracción y operar con fracciones en la vida cotidiana.",
          explanation: `¡Bienvenido de nuevo! Hoy vamos con un tema que mucha gente le tiene miedo: **las fracciones**. Pero yo te prometo que al final de esta lección vas a decir "¡era fácil!" 😊

**¿Qué es una fracción?**
Es una forma de representar PARTES de un todo. Imagina una pizza cortada en 8 pedazos. Si te comes 3:
• Comiste **3/8** de la pizza (3 de 8 pedazos)
• El número de arriba (3) es el **numerador** = lo que tienes
• El número de abajo (8) es el **denominador** = en cuántas partes se dividió

**Fracciones en tu día a día:**
• "Media libra de arroz" = 1/2 libra
• "Un cuarto de hora" = 1/4 de hora = 15 minutos
• "Tres cuartos de tanque" = 3/4 del tanque de gasolina

**Fracciones equivalentes:**
1/2 = 2/4 = 3/6 = 4/8 → ¡Todas representan LA MITAD!
Es como decir: "media pizza" es lo mismo si la cortas en 4 o en 8 pedazos.

**Suma de fracciones (mismo denominador):**
2/5 + 1/5 = 3/5 (solo sumas los numeradores)

**Suma de fracciones (diferente denominador):**
1/2 + 1/3 → Necesitas un denominador común: 3/6 + 2/6 = 5/6
Truco: multiplica los denominadores (2×3=6) y ajusta los numeradores.

**Multiplicación de fracciones:**
2/3 × 4/5 = (2×4)/(3×5) = 8/15 (¡numerador×numerador, denominador×denominador!)`,
          examples: [
            { problem: "¿Cuánto es 1/4 + 2/4?", solution: "Mismo denominador: (1+2)/4 = 3/4" },
            { problem: "Si una receta pide 1/3 de taza de azúcar y le agregas el doble, ¿cuánto usaste?", solution: "2 × 1/3 = 2/3 de taza" },
            { problem: "¿Cuánto es 1/2 + 1/4?", solution: "Convertir 1/2 a 2/4. Luego 2/4 + 1/4 = 3/4" }
          ],
          keyFormulas: [
            "Suma (mismo denominador): a/c + b/c = (a+b)/c",
            "Suma (diferente denominador): a/b + c/d = (ad+bc)/(bd)",
            "Multiplicación: a/b × c/d = (a×c)/(b×d)",
            "División: a/b ÷ c/d = a/b × d/c (invertir y multiplicar)"
          ],
          practiceQuestions: [
            {
              text: "Si una pizza tiene 8 pedazos y te comes 3, ¿qué fracción comiste?",
              options: [{ id: "A", text: "3/5" }, { id: "B", text: "3/8" }, { id: "C", text: "8/3" }, { id: "D", text: "5/8" }],
              correctId: "B",
              explanation: "Comiste 3 de 8 pedazos = 3/8",
              socraticHints: ["El numerador es lo que comiste. ¿Cuántos comiste?", "El denominador es el total de pedazos."]
            },
            {
              text: "¿Cuánto es 2/5 + 1/5?",
              options: [{ id: "A", text: "3/5" }, { id: "B", text: "3/10" }, { id: "C", text: "2/5" }, { id: "D", text: "1/5" }],
              correctId: "A",
              explanation: "Mismo denominador: (2+1)/5 = 3/5",
              socraticHints: ["¿Los denominadores son iguales?", "Si sí, solo suma los numeradores."]
            },
            {
              text: "¿Cuánto es 1/3 × 3/4?",
              options: [{ id: "A", text: "3/7" }, { id: "B", text: "1/4" }, { id: "C", text: "4/3" }, { id: "D", text: "3/12" }],
              correctId: "B",
              explanation: "(1×3)/(3×4) = 3/12 = 1/4 (simplificado)",
              socraticHints: ["¿Cómo se multiplican fracciones?", "Numerador por numerador, denominador por denominador."]
            }
          ]
        },
        {
          id: "g6-mat-03", title: "Decimales y porcentajes", duration: "15 min",
          type: "lesson",
          objective: "Convertir entre fracciones, decimales y porcentajes. Calcular descuentos.",
          explanation: `¡Hola de nuevo! 👩‍🏫 ¿Sabías que fracciones, decimales y porcentajes son LA MISMA COSA pero escrita diferente?

**La conexión mágica:**
• 1/2 = 0.5 = 50% → ¡Son lo mismo! La mitad.
• 1/4 = 0.25 = 25% → Un cuarto.
• 3/4 = 0.75 = 75% → Tres cuartos.

**¿Cómo convertir?**
• Fracción → Decimal: Divide numerador ÷ denominador → 3/4 = 3÷4 = 0.75
• Decimal → Porcentaje: Multiplica × 100 → 0.75 × 100 = 75%
• Porcentaje → Fracción: Divide entre 100 → 75% = 75/100 = 3/4

**Atajos para porcentajes (¡úsalos en el ICFES!):**
• 50% = dividir entre 2 → 50% de 80 = 40
• 25% = dividir entre 4 → 25% de 80 = 20
• 10% = mover el punto decimal → 10% de 250 = 25
• 20% = 10% × 2 → 20% de 250 = 25 × 2 = 50

**Ejemplo real: Descuentos**
Un pantalón cuesta $80.000 con 30% de descuento.
• 10% de 80.000 = 8.000
• 30% = 10% × 3 = 8.000 × 3 = $24.000 de descuento
• Precio final: 80.000 - 24.000 = **$56.000**`,
          examples: [
            { problem: "¿Cuánto es el 15% de $200.000?", solution: "10% = $20.000. 5% = $10.000. Total: $30.000" },
            { problem: "Convierte 3/5 a porcentaje", solution: "3÷5 = 0.6. 0.6 × 100 = 60%" }
          ],
          keyFormulas: [
            "Porcentaje = (Parte / Total) × 100",
            "Descuento = Precio × (Porcentaje / 100)",
            "Precio final = Precio original - Descuento"
          ],
          practiceQuestions: [
            {
              text: "Un producto de $120.000 tiene 25% de descuento. ¿Cuánto pagas?",
              options: [{ id: "A", text: "$80.000" }, { id: "B", text: "$90.000" }, { id: "C", text: "$95.000" }, { id: "D", text: "$100.000" }],
              correctId: "B",
              explanation: "25% de $120.000 = $30.000. Precio final: $120.000 - $30.000 = $90.000",
              socraticHints: ["25% es dividir entre 4. ¿Cuánto es 120.000 ÷ 4?", "Eso es el descuento. Ahora réstalo del precio original."]
            }
          ]
        }
      ]
    },
    {
      id: "g6-lc", area: "LECTURA_CRITICA", areaName: "Lectura Crítica", icon: "📖", color: "#8B5CF6",
      lessons: [
        {
          id: "g6-lc-01", title: "Tipos de texto: ¿qué estoy leyendo?", duration: "12 min",
          type: "lesson",
          objective: "Identificar textos narrativos, informativos, argumentativos e instructivos.",
          explanation: `¡Hola! Soy la Profesora Lina 👩‍🏫 y hoy vamos a aprender algo súper útil para el ICFES: **reconocer tipos de texto**.

En el examen te van a poner un texto y te van a preguntar cosas sobre él. Si sabes QUÉ TIPO de texto es, ya tienes la mitad de la batalla ganada.

**Los 4 tipos principales:**

📗 **Narrativo:** Cuenta una historia con personajes, tiempo y lugar.
→ Cuentos, novelas, fábulas, noticias, crónicas.
→ Pista: tiene personajes, inicio-nudo-desenlace.

📘 **Informativo (Expositivo):** Explica un tema sin dar opinión.
→ Artículos de enciclopedia, textos científicos, informes.
→ Pista: usa lenguaje objetivo, datos, definiciones.

📕 **Argumentativo:** Defiende una posición con razones.
→ Editoriales, ensayos, columnas de opinión, debates.
→ Pista: tiene una TESIS (idea que defiende) + argumentos.

📙 **Instructivo:** Da pasos o indicaciones para hacer algo.
→ Recetas, manuales, reglamentos, tutoriales.
→ Pista: usa verbos imperativos (mezcle, agregue, conecte).

**Truco ICFES:** Lee la primera y última oración del texto. Ahí casi siempre está la clave para saber qué tipo es.`,
          examples: [
            { problem: "\"Érase una vez un niño que vivía en la montaña...\" — ¿Qué tipo de texto es?", solution: "Narrativo. Tiene personajes y cuenta una historia." },
            { problem: "\"Para preparar arroz: 1) Lave el arroz. 2) Ponga a hervir agua...\" — ¿Tipo?", solution: "Instructivo. Da pasos para hacer algo." }
          ],
          practiceQuestions: [
            {
              text: "\"La contaminación del aire en Bogotá ha aumentado un 15% según el IDEAM, afectando especialmente las zonas industriales.\" ¿Qué tipo de texto es?",
              options: [{ id: "A", text: "Narrativo" }, { id: "B", text: "Informativo" }, { id: "C", text: "Argumentativo" }, { id: "D", text: "Instructivo" }],
              correctId: "B",
              explanation: "Presenta datos objetivos (15%, IDEAM) sin dar opinión personal. Es informativo.",
              socraticHints: ["¿El texto cuenta una historia o da información?", "¿Usa datos y cifras? ¿Da una opinión o solo informa?"]
            },
            {
              text: "\"Es necesario que el gobierno invierta más en educación pública porque la desigualdad social sigue creciendo.\" ¿Qué tipo de texto es?",
              options: [{ id: "A", text: "Narrativo" }, { id: "B", text: "Informativo" }, { id: "C", text: "Argumentativo" }, { id: "D", text: "Instructivo" }],
              correctId: "C",
              explanation: "Defiende una posición ('es necesario que...') y da una razón ('porque...'). Es argumentativo.",
              socraticHints: ["¿El autor está dando una opinión o solo informando?", "¿Hay palabras como 'es necesario' o 'debería'?"]
            }
          ]
        }
      ]
    },
    {
      id: "g6-cie", area: "CIENCIAS", areaName: "Ciencias Naturales", icon: "🔬", color: "#10B981",
      lessons: [
        {
          id: "g6-cie-01", title: "La célula: unidad de la vida", duration: "15 min",
          type: "lesson",
          objective: "Identificar las partes de la célula y la diferencia entre célula animal y vegetal.",
          explanation: `¡Hola! 👩‍🏫 Hoy vamos a hablar de algo INCREÍBLE: tu cuerpo está hecho de **37 BILLONES** de células. Sí, billones con B.

**¿Qué es la célula?**
Es la unidad más pequeña que tiene vida propia. Es como un ladrillo: así como una casa está hecha de ladrillos, tu cuerpo está hecho de células.

**Partes principales de la célula:**
🟡 **Membrana celular:** La "piel" de la célula. Protege y decide qué entra y qué sale.
🟣 **Núcleo:** El "cerebro" de la célula. Contiene el ADN (las instrucciones genéticas).
🔵 **Citoplasma:** El "relleno" gelatinoso donde flotan las otras partes.
🟢 **Mitocondrias:** Las "baterías". Producen energía para la célula.
🟠 **Ribosomas:** Las "fábricas de proteínas".

**Célula animal vs. vegetal:**
| Característica | Animal | Vegetal |
|---|---|---|
| Pared celular | ❌ No tiene | ✅ Sí tiene (rígida) |
| Cloroplastos | ❌ No tiene | ✅ Sí tiene (fotosíntesis) |
| Vacuola | Pequeñas | Una grande |
| Forma | Irregular | Rectangular |

**¿Por qué la célula vegetal tiene cloroplastos?**
¡Porque hace fotosíntesis! Los cloroplastos capturan la luz del sol para producir alimento. Por eso las plantas son verdes (por la clorofila).`,
          examples: [
            { problem: "¿Qué parte de la célula contiene el ADN?", solution: "El núcleo. Es como el 'cerebro' que tiene las instrucciones genéticas." },
            { problem: "¿Por qué las células vegetales son rígidas y las animales no?", solution: "Porque las vegetales tienen pared celular, una capa rígida extra sobre la membrana." }
          ],
          practiceQuestions: [
            {
              text: "¿Cuál es la función principal de las mitocondrias?",
              options: [{ id: "A", text: "Almacenar ADN" }, { id: "B", text: "Producir energía" }, { id: "C", text: "Hacer fotosíntesis" }, { id: "D", text: "Proteger la célula" }],
              correctId: "B",
              explanation: "Las mitocondrias son las 'centrales energéticas' de la célula. Producen ATP (energía).",
              socraticHints: ["¿Qué necesita la célula para funcionar?", "Las mitocondrias son como las 'baterías'. ¿Qué hacen las baterías?"]
            }
          ]
        }
      ]
    },
    {
      id: "g6-soc", area: "SOCIALES", areaName: "Sociales y Ciudadanas", icon: "🏛️", color: "#F59E0B",
      lessons: [
        {
          id: "g6-soc-01", title: "Colombia: geografía básica", duration: "12 min",
          type: "lesson",
          objective: "Ubicar las regiones naturales de Colombia y sus características.",
          explanation: `¡Hola! 👩‍🏫 Hoy vamos a recorrer Colombia sin salir de aquí. ¿Sabías que nuestro país tiene 6 regiones naturales?

**Las 6 regiones de Colombia:**

🏔️ **Andina:** Donde vive la mayoría. Bogotá, Medellín, Cali, Bucaramanga. Montañas, clima frío a templado. Agricultura: café, papa, flores.

🌊 **Caribe:** Costa norte. Barranquilla, Cartagena, Santa Marta. Playas, clima cálido. Turismo y comercio.

🌊 **Pacífica:** Costa oeste. Buenaventura, Quibdó. Mucha lluvia, selva, biodiversidad. Puerto comercial importante.

🌳 **Amazonía:** Sureste. Leticia. Selva tropical, ríos enormes. Mayor biodiversidad del mundo.

🌿 **Orinoquía (Llanos):** Este. Villavicencio. Llanuras, ganadería, petróleo.

🏝️ **Insular:** San Andrés y Providencia. Islas en el Caribe. Turismo.

**Dato ICFES:** Colombia es el segundo país más biodiverso del mundo. Esto se pregunta MUCHO en el examen.

**Límites de Colombia:**
- Norte: Mar Caribe
- Sur: Ecuador y Perú
- Este: Venezuela y Brasil
- Oeste: Océano Pacífico y Panamá`,
          examples: [
            { problem: "¿A qué región pertenece Bogotá?", solution: "Región Andina. Está en la cordillera oriental, a 2.600 metros sobre el nivel del mar." }
          ],
          practiceQuestions: [
            {
              text: "¿Cuál región de Colombia se caracteriza por tener la mayor biodiversidad del planeta?",
              options: [{ id: "A", text: "Caribe" }, { id: "B", text: "Andina" }, { id: "C", text: "Amazonía" }, { id: "D", text: "Orinoquía" }],
              correctId: "C",
              explanation: "La Amazonía colombiana es parte del 'pulmón del mundo' y tiene la mayor biodiversidad del planeta.",
              socraticHints: ["¿Qué región tiene la selva más grande?", "¿Dónde hay más especies de animales y plantas?"]
            }
          ]
        }
      ]
    },
    {
      id: "g6-eng", area: "INGLES", areaName: "Inglés", icon: "🇬🇧", color: "#EF4444",
      lessons: [
        {
          id: "g6-eng-01", title: "Verb To Be: I am, You are, She is", duration: "12 min",
          type: "lesson",
          objective: "Usar el verbo 'to be' para presentarte y describir personas.",
          explanation: `¡Hi! Hello! 👩‍🏫 ¡Hoy empezamos con el verbo más importante del inglés: **TO BE** (ser/estar)!

**¿Cómo funciona?**
| Persona | To Be | Ejemplo | Significado |
|---|---|---|---|
| I | **am** | I am Carlos | Yo soy Carlos |
| You | **are** | You are smart | Tú eres inteligente |
| He | **is** | He is tall | Él es alto |
| She | **is** | She is a teacher | Ella es profesora |
| It | **is** | It is a dog | Es un perro |
| We | **are** | We are friends | Somos amigos |
| They | **are** | They are happy | Ellos están felices |

**Contracciones (forma corta, muy usada):**
• I am → I'm → "I'm Carlos"
• You are → You're → "You're smart"
• He is → He's → "He's tall"
• She is → She's → "She's nice"

**Para hacer preguntas, invierte el orden:**
• You are happy → **Are you** happy? (¿Estás feliz?)
• She is a doctor → **Is she** a doctor? (¿Es ella doctora?)

**Para negar, agrega NOT:**
• I am not tired → I'm not tired (No estoy cansado)
• He is not here → He isn't here (Él no está aquí)`,
          examples: [
            { problem: "Traduce: 'Ella es mi mamá'", solution: "She is my mom / She's my mom" },
            { problem: "Haz pregunta: 'You are a student'", solution: "Are you a student?" }
          ],
          practiceQuestions: [
            {
              text: "Complete: 'My name ____ María. I ____ from Colombia.'",
              options: [{ id: "A", text: "is / am" }, { id: "B", text: "am / is" }, { id: "C", text: "are / am" }, { id: "D", text: "is / are" }],
              correctId: "A",
              explanation: "'My name' = it (tercera persona) → 'is'. 'I' → 'am'. My name IS María. I AM from Colombia.",
              socraticHints: ["'My name' es como 'it'. ¿Qué verbo va con 'it'?", "'I' siempre va con... ¿'am', 'is' o 'are'?"]
            }
          ]
        }
      ]
    }
  ]
};

// ═══════════════════════════════════════════
// GRADO 7° — PROFUNDIZACIÓN BÁSICA
// ═══════════════════════════════════════════

const GRADE_7: GradeCurriculum = {
  grade: 7,
  name: "Séptimo Grado",
  description: "Proporcionalidad, texto argumentativo, ecosistemas, historia precolombina, present simple",
  modules: [
    {
      id: "g7-mat", area: "MATEMATICAS", areaName: "Matemáticas", icon: "🔢", color: "#3B82F6",
      lessons: [
        {
          id: "g7-mat-01", title: "Proporcionalidad y regla de tres", duration: "15 min",
          type: "lesson",
          objective: "Resolver problemas de proporcionalidad directa usando regla de tres.",
          explanation: `¡Hola! 👩‍🏫 La regla de tres es probablemente la herramienta más ÚTIL de toda la matemática. La usas todos los días sin saberlo.

**¿Qué es la proporcionalidad directa?**
Cuando una cantidad aumenta y la otra también aumenta en la misma proporción.
→ Más horas trabajadas = Más dinero
→ Más ingredientes = Más porciones
→ Más kilómetros = Más gasolina

**La Regla de Tres Simple:**
Si 3 libras de arroz cuestan $10.500, ¿cuánto cuestan 5 libras?

Paso 1: Organiza la información
• 3 libras → $10.500
• 5 libras → $X

Paso 2: Multiplica en cruz
X = (5 × 10.500) / 3 = 52.500 / 3 = **$17.500**

**Truco rápido:** 
Divide el total entre las unidades para encontrar el precio unitario:
$10.500 ÷ 3 = $3.500 por libra
Luego multiplica: $3.500 × 5 = $17.500 ✅

**En el ICFES te la ponen así:**
"Si un carro recorre 180 km con 15 litros de gasolina, ¿cuántos litros necesita para 300 km?"
X = (300 × 15) / 180 = 4.500 / 180 = **25 litros**`,
          examples: [
            { problem: "Si 4 trabajadores pintan una casa en 12 días, ¿cuánto se demoran 6 trabajadores?", solution: "Ojo: esta es INVERSA. Más trabajadores → menos tiempo. X = (4×12)/6 = 8 días" },
            { problem: "Si 2 kilos de carne cuestan $36.000, ¿cuánto cuestan 3 kilos?", solution: "X = (3 × 36.000) / 2 = $54.000" }
          ],
          keyFormulas: [
            "Regla de tres directa: X = (b × c) / a",
            "Precio unitario = Total / Cantidad",
            "Regla de tres inversa: X = (a × b) / c"
          ],
          practiceQuestions: [
            {
              text: "Si 5 metros de tela cuestan $75.000, ¿cuánto cuestan 8 metros?",
              options: [{ id: "A", text: "$100.000" }, { id: "B", text: "$120.000" }, { id: "C", text: "$135.000" }, { id: "D", text: "$96.000" }],
              correctId: "B",
              explanation: "X = (8 × 75.000) / 5 = 600.000 / 5 = $120.000",
              socraticHints: ["Primero: ¿cuánto cuesta 1 metro?", "75.000 ÷ 5 = $15.000 por metro. Ahora, ¿cuánto son 8 metros?"]
            }
          ]
        }
      ]
    },
    { id: "g7-lc", area: "LECTURA_CRITICA", areaName: "Lectura Crítica", icon: "📖", color: "#8B5CF6", lessons: [] },
    { id: "g7-cie", area: "CIENCIAS", areaName: "Ciencias Naturales", icon: "🔬", color: "#10B981", lessons: [] },
    { id: "g7-soc", area: "SOCIALES", areaName: "Sociales y Ciudadanas", icon: "🏛️", color: "#F59E0B", lessons: [] },
    { id: "g7-eng", area: "INGLES", areaName: "Inglés", icon: "🇬🇧", color: "#EF4444", lessons: [] }
  ]
};

// Placeholder grades 8-11 (structure ready for content expansion)
const createGradePlaceholder = (grade: number, name: string, desc: string): GradeCurriculum => ({
  grade, name, description: desc,
  modules: [
    { id: `g${grade}-mat`, area: "MATEMATICAS", areaName: "Matemáticas", icon: "🔢", color: "#3B82F6", lessons: [] },
    { id: `g${grade}-lc`, area: "LECTURA_CRITICA", areaName: "Lectura Crítica", icon: "📖", color: "#8B5CF6", lessons: [] },
    { id: `g${grade}-cie`, area: "CIENCIAS", areaName: "Ciencias Naturales", icon: "🔬", color: "#10B981", lessons: [] },
    { id: `g${grade}-soc`, area: "SOCIALES", areaName: "Sociales y Ciudadanas", icon: "🏛️", color: "#F59E0B", lessons: [] },
    { id: `g${grade}-eng`, area: "INGLES", areaName: "Inglés", icon: "🇬🇧", color: "#EF4444", lessons: [] }
  ]
});

const GRADE_8 = createGradePlaceholder(8, "Octavo Grado", "Ecuaciones lineales, conectores, tabla periódica, Constitución del 91, past simple");
const GRADE_9 = createGradePlaceholder(9, "Noveno Grado", "Funciones, falacias, genética, globalización, conditionals");
const GRADE_10 = createGradePlaceholder(10, "Décimo Grado", "Trigonometría, textos filosóficos, termodinámica, economía, present perfect");
const GRADE_11 = createGradePlaceholder(11, "Undécimo Grado", "Estadística, argumentación avanzada, ondas, derechos humanos, reading comprehension");

// Inyectar lecciones de matemáticas socráticas para los grados 7 a 11
GRADE_7.modules.find(m => m.area === "MATEMATICAS")!.lessons.push(
  { id: 'g7-mat-02', title: 'Operaciones con Números Enteros', duration: '20 min', type: 'lesson', objective: 'Saber operar deudas (números negativos) en contextos de negocios.', explanation: '', examples: [], practiceQuestions: [] },
  { id: 'g7-mat-03', title: 'Ecuaciones de Primer Grado', duration: '15 min', type: 'lesson', objective: 'Introducir variables en problemas de la vida real.', explanation: '', examples: [], practiceQuestions: [] }
);

GRADE_8.modules.find(m => m.area === "MATEMATICAS")!.lessons = [
  { id: 'g8-mat-01', title: 'Expresiones Algebraicas Básicas', duration: '20 min', type: 'lesson', objective: 'Interpretar y simplificar "x" y "y" en problemas ICFES.', explanation: '', examples: [], practiceQuestions: [] },
  { id: 'g8-mat-02', title: 'Lectura Ágil del Plano Cartesiano', duration: '15 min', type: 'lesson', objective: 'Coordenadas, gráficas de barras e historia de datos.', explanation: '', examples: [], practiceQuestions: [] },
  { id: 'g8-mat-03', title: 'Estadística: Promedio, Moda y Mediana', duration: '20 min', type: 'lesson', objective: 'Análisis e interpretación de datos poblacionales.', explanation: '', examples: [], practiceQuestions: [] }
];

GRADE_9.modules.find(m => m.area === "MATEMATICAS")!.lessons = [
  { id: 'g9-mat-01', title: 'Función Lineal en la Realidad', duration: '20 min', type: 'lesson', objective: 'Aprender sobre pendientes (ej: tarifario de taxi).', explanation: '', examples: [], practiceQuestions: [] },
  { id: 'g9-mat-02', title: 'Sistemas de Ecuaciones Sensillos', duration: '15 min', type: 'lesson', objective: 'Uso de dos ecuaciones para resolver un problema cotidiano.', explanation: '', examples: [], practiceQuestions: [] },
  { id: 'g9-mat-03', title: 'Geometría: Área y Volumen de Cilindros', duration: '15 min', type: 'lesson', objective: 'Calcular qué tanto cabe en un tanque o botella de agua.', explanation: '', examples: [], practiceQuestions: [] }
];

GRADE_10.modules.find(m => m.area === "MATEMATICAS")!.lessons = [
  { id: 'g10-mat-01', title: 'Teorema de Pitágoras Práctico', duration: '15 min', type: 'lesson', objective: 'Hallar distancias faltantes usando sombras o escaleras.', explanation: '', examples: [], practiceQuestions: [] },
  { id: 'g10-mat-02', title: 'Trigonometría (Seno, Coseno, Tangente)', duration: '20 min', type: 'lesson', objective: 'El clásico dolor de cabeza, explicado súper fácil por Lina.', explanation: '', examples: [], practiceQuestions: [] },
  { id: 'g10-mat-03', title: 'Funciones de Crecimiento (Exponencial)', duration: '15 min', type: 'lesson', objective: 'Bacterias, inversiones bancarias e inflación.', explanation: '', examples: [], practiceQuestions: [] }
];

GRADE_11.modules.find(m => m.area === "MATEMATICAS")!.lessons = [
  { id: 'g11-mat-01', title: 'Lectura de Gráficas Avanzadas', duration: '20 min', type: 'lesson', objective: 'Diagramas de caja, torta y tendencias anuales.', explanation: '', examples: [], practiceQuestions: [] },
  { id: 'g11-mat-02', title: 'Probabilidad y Azar Diarios', duration: '15 min', type: 'lesson', objective: 'Lanzar monedas, urnas y cartas. Probabilidad ICFES pura.', explanation: '', examples: [], practiceQuestions: [] },
  { id: 'g11-mat-03', title: 'Lógica Combinatoria', duration: '20 min', type: 'lesson', objective: '¿De cuántas formas me puedo vestir? Permutaciones simples.', explanation: '', examples: [], practiceQuestions: [] },
  { id: 'g11-mat-04', title: 'Inecuaciones Cotidianas', duration: '15 min', type: 'lesson', objective: 'Entender qué significa que el límite de velocidad sea <60km/h.', explanation: '', examples: [], practiceQuestions: [] }
];

// Inyección de LECTURA CRÍTICA
GRADE_7.modules.find(m => m.area === "LECTURA_CRITICA")!.lessons = [
  { id: 'g7-lc-01', title: 'Textos Argumentativos', duration: '15 min', type: 'lesson', objective: 'Aprender a diferenciar hechos de opiniones.', explanation: '', examples: [], practiceQuestions: [] },
  { id: 'g7-lc-02', title: 'La Crónica Periodística', duration: '15 min', type: 'lesson', objective: 'Entender el orden de los eventos.', explanation: '', examples: [], practiceQuestions: [] }
];
GRADE_8.modules.find(m => m.area === "LECTURA_CRITICA")!.lessons = [ { id: 'g8-lc-01', title: 'La Poesía y el Lenguaje Figurado', duration: '20 min', type: 'lesson', objective: 'Metáforas y símiles en poemas colombianos.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_9.modules.find(m => m.area === "LECTURA_CRITICA")!.lessons = [ { id: 'g9-lc-01', title: 'Análisis de Columnas de Opinión', duration: '15 min', type: 'lesson', objective: 'Descubrir la tesis principal de un autor.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_10.modules.find(m => m.area === "LECTURA_CRITICA")!.lessons = [ { id: 'g10-lc-01', title: 'Falacias Lógicas', duration: '20 min', type: 'lesson', objective: 'Identificar argumentos engañosos.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_11.modules.find(m => m.area === "LECTURA_CRITICA")!.lessons = [ { id: 'g11-lc-01', title: 'Lectura Crítica Filosófica', duration: '20 min', type: 'lesson', objective: 'Interpretar textos de Kant y Descartes (Nivel ICFES).', explanation: '', examples: [], practiceQuestions: [] } ];

// Inyección de CIENCIAS
GRADE_7.modules.find(m => m.area === "CIENCIAS")!.lessons = [ { id: 'g7-cie-01', title: 'Ecosistemas y Redes Tróficas', duration: '15 min', type: 'lesson', objective: 'Entender cómo fluye la energía en la selva colombiana.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_8.modules.find(m => m.area === "CIENCIAS")!.lessons = [ { id: 'g8-cie-01', title: 'Genética y Leyes de Mendel', duration: '20 min', type: 'lesson', objective: 'Cómo heredamos el color de ojos.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_9.modules.find(m => m.area === "CIENCIAS")!.lessons = [ { id: 'g9-cie-01', title: 'Tabla Periódica', duration: '15 min', type: 'lesson', objective: 'Comprender los elementos químicos básicos.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_10.modules.find(m => m.area === "CIENCIAS")!.lessons = [ { id: 'g10-cie-01', title: 'Cinemática y Termodinámica', duration: '20 min', type: 'lesson', objective: 'Caída libre y leyes del calor.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_11.modules.find(m => m.area === "CIENCIAS")!.lessons = [ { id: 'g11-cie-01', title: 'Química Orgánica', duration: '20 min', type: 'lesson', objective: 'El átomo de carbono en nuestras vidas.', explanation: '', examples: [], practiceQuestions: [] } ];

// Inyección de SOCIALES
GRADE_7.modules.find(m => m.area === "SOCIALES")!.lessons = [ { id: 'g7-soc-01', title: 'Culturas Precolombinas', duration: '15 min', type: 'lesson', objective: 'Muiscas, Tayronas y más.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_8.modules.find(m => m.area === "SOCIALES")!.lessons = [ { id: 'g8-soc-01', title: 'Revolución Industrial', duration: '20 min', type: 'lesson', objective: 'Cómo las fábricas cambiaron el mundo.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_9.modules.find(m => m.area === "SOCIALES")!.lessons = [ { id: 'g9-soc-01', title: 'Geopolítica Mundial', duration: '15 min', type: 'lesson', objective: 'Guerras Mundiales e impacto en Sudamérica.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_10.modules.find(m => m.area === "SOCIALES")!.lessons = [ { id: 'g10-soc-01', title: 'Constitución del 91 y Derechos', duration: '20 min', type: 'lesson', objective: 'Mecanismos de participación como la Tutela.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_11.modules.find(m => m.area === "SOCIALES")!.lessons = [ { id: 'g11-soc-01', title: 'Economía y Globalización', duration: '20 min', type: 'lesson', objective: 'TLCs, inflación, PBI y la economía de Colombia.', explanation: '', examples: [], practiceQuestions: [] } ];

// Inyección de INGLÉS
GRADE_7.modules.find(m => m.area === "INGLES")!.lessons = [ { id: 'g7-eng-01', title: 'Present Simple vs Continuous', duration: '15 min', type: 'lesson', objective: 'Rutinas vs lo que está pasando ahora.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_8.modules.find(m => m.area === "INGLES")!.lessons = [ { id: 'g8-eng-01', title: 'Past Simple, Regular & Irregular', duration: '20 min', type: 'lesson', objective: 'Contar anécdotas del pasado.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_9.modules.find(m => m.area === "INGLES")!.lessons = [ { id: 'g9-eng-01', title: 'Future: Will vs Going To', duration: '15 min', type: 'lesson', objective: 'Planificar o predecir el futuro.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_10.modules.find(m => m.area === "INGLES")!.lessons = [ { id: 'g10-eng-01', title: 'Present Perfect', duration: '20 min', type: 'lesson', objective: 'Hablar de experiencias de vida.', explanation: '', examples: [], practiceQuestions: [] } ];
GRADE_11.modules.find(m => m.area === "INGLES")!.lessons = [ { id: 'g11-eng-01', title: 'Conditionals (If...)', duration: '20 min', type: 'lesson', objective: 'Condiciones y consecuencias imposibles.', explanation: '', examples: [], practiceQuestions: [] } ];

// ═══════════════════════════════════════════
// EXPORTACIÓN COMPLETA
// ═══════════════════════════════════════════

export const CURRICULUM: GradeCurriculum[] = [
  GRADE_6, GRADE_7, GRADE_8, GRADE_9, GRADE_10, GRADE_11
];

export const getGrade = (grade: number): GradeCurriculum | undefined => CURRICULUM.find(g => g.grade === grade);
export const getGradeModules = (grade: number, area?: string): GradeModule[] => {
  const g = getGrade(grade);
  if (!g) return [];
  return area ? g.modules.filter(m => m.area === area) : g.modules;
};
export const getLesson = (lessonId: string): { lesson: Lesson; grade: number; area: string } | undefined => {
  for (const g of CURRICULUM) {
    for (const m of g.modules) {
      const l = m.lessons.find(l => l.id === lessonId);
      if (l) return { lesson: l, grade: g.grade, area: m.area };
    }
  }
  return undefined;
};
export const getAllLessonsForArea = (area: string): { lesson: Lesson; grade: number }[] => {
  const result: { lesson: Lesson; grade: number }[] = [];
  for (const g of CURRICULUM) {
    for (const m of g.modules) {
      if (m.area === area) {
        for (const l of m.lessons) {
          result.push({ lesson: l, grade: g.grade });
        }
      }
    }
  }
  return result;
};
