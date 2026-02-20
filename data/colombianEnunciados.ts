/**
 * Enunciados típicos de matemáticas de quinto grado en colegios colombianos
 * (MEN, cuadernos de actividades, problemas verbales y geometría).
 * Sirven para verificar que el bot los reconoce.
 */

export interface EnunciadoColombiano {
  id: string;
  text: string;
  /** Tipo esperado: wordProblem (tanque, suma, resta, mult, div, multi-paso), geometry, operation (+, -, ×, ÷), percentage */
  expectedCategory: 'wordProblem' | 'geometry' | 'operation' | 'percentage' | 'any';
  /** Si el parser específico de problemas verbales debería reconocerlo (parseWordProblem o parseGenericWordProblem) */
  expectWordProblemParser?: boolean;
}

export const ENUNCIADOS_COLOMBIANOS: EnunciadoColombiano[] = [
  // ----- Tanque (capacidad, mitad, fracción, añadir, faltan) -----
  {
    id: 'tanque-1',
    text: 'Un tanque tiene capacidad de 200 litros cuando está lleno. Estaba lleno solo hasta la mitad. Se gastaron dos quintos de lo que había. Luego añadieron 15 litros. ¿Cuántos litros faltan para llenar el tanque por completo?',
    expectedCategory: 'wordProblem',
    expectWordProblemParser: true,
  },
  {
    id: 'tanque-2',
    text: 'Un depósito tiene 200 litros de capacidad. Estaba lleno hasta la mitad. Se gastaron 2/5 de lo que había. ¿Cuántos litros quedan?',
    expectedCategory: 'wordProblem',
    expectWordProblemParser: true,
  },

  // ----- Suma de cantidades (kg, litros, total) -----
  {
    id: 'suma-kg-1',
    text: 'Ana compró 2,5 kg de manzanas y 1,75 kg de naranjas. ¿Cuántos kg en total?',
    expectedCategory: 'wordProblem',
    expectWordProblemParser: true,
  },
  {
    id: 'suma-kg-2',
    text: 'En el mercado compré 3 kg de arroz y 2 kg de frijoles. ¿Cuántos kilogramos en total llevo?',
    expectedCategory: 'wordProblem',
    expectWordProblemParser: true,
  },
  {
    id: 'suma-litros-1',
    text: 'Un camión llevó 120 litros de leche y 85 litros de jugo. ¿Cuántos litros en total?',
    expectedCategory: 'wordProblem',
    expectWordProblemParser: true,
  },

  // ----- Resta (quedan) -----
  {
    id: 'resta-1',
    text: 'En la tienda había 50 kg de arroz. Vendieron 20 kg. ¿Cuántos kg quedan?',
    expectedCategory: 'wordProblem',
    expectWordProblemParser: true,
  },
  {
    id: 'resta-2',
    text: 'Tenía 100 litros de agua. Gasté 35 litros. ¿Cuántos litros quedan?',
    expectedCategory: 'wordProblem',
    expectWordProblemParser: true,
  },

  // ----- Multi-paso (tenía, compró, vendió) -----
  {
    id: 'multipaso-1',
    text: 'Juan tenía 50 pesos. Compró un jugo por 30 pesos. Su abuela le regaló 20 pesos. ¿Cuántos pesos tiene ahora?',
    expectedCategory: 'wordProblem',
    expectWordProblemParser: true,
  },
  {
    id: 'multipaso-2',
    text: 'En la fiesta del otoño se repartieron 425 almendrucos más este curso que el pasado. Si el curso anterior se repartieron 875 almendrucos, ¿cuántos se repartieron en los dos años?',
    expectedCategory: 'wordProblem',
    expectWordProblemParser: true,
  },

  // ----- Multiplicación (cajas, cada una, total) -----
  {
    id: 'mult-1',
    text: 'Hay 4 cajas con 12 manzanas cada una. ¿Cuántas manzanas hay en total?',
    expectedCategory: 'wordProblem',
    expectWordProblemParser: true,
  },
  {
    id: 'mult-2',
    text: 'En la tienda venden paquetes de 6 galletas. Si compro 5 paquetes, ¿cuántas galletas tengo en total?',
    expectedCategory: 'wordProblem',
    expectWordProblemParser: true,
  },

  // ----- División (repartir entre, cada uno) -----
  {
    id: 'div-1',
    text: 'Se reparten 36 galletas entre 6 niños. ¿Cuántas galletas le tocan a cada uno?',
    expectedCategory: 'wordProblem',
    expectWordProblemParser: true,
  },
  {
    id: 'div-2',
    text: 'Repartir 60 dulces entre 5 niños. ¿Cuántos dulces cada uno?',
    expectedCategory: 'wordProblem',
    expectWordProblemParser: true,
  },
  {
    id: 'div-3',
    text: 'El profesor reparte 48 hojas entre 8 estudiantes. ¿Cuántas hojas recibe cada estudiante?',
    expectedCategory: 'wordProblem',
    expectWordProblemParser: true,
  },

  // ----- Geometría (área, perímetro, triángulo, círculo) -----
  {
    id: 'geo-rect-1',
    text: 'Un rectángulo tiene 5 m de largo y 3 m de ancho. ¿Cuál es su perímetro?',
    expectedCategory: 'geometry',
  },
  {
    id: 'geo-rect-2',
    text: '¿Cuál es el área de un rectángulo de 8 por 4?',
    expectedCategory: 'geometry',
  },
  {
    id: 'geo-tri-1',
    text: 'Área de un triángulo base 4 altura 3.',
    expectedCategory: 'geometry',
  },
  {
    id: 'geo-circ-1',
    text: 'Área de un círculo de radio 3. (usa pi = 3,14)',
    expectedCategory: 'geometry',
  },
  {
    id: 'geo-cubo-1',
    text: '¿Cuál es el volumen de un cubo de lado 3?',
    expectedCategory: 'geometry',
  },

  // ----- Operaciones directas (símbolos) -----
  {
    id: 'op-div-1',
    text: '2456 ÷ 12',
    expectedCategory: 'operation',
  },
  {
    id: 'op-frac-1',
    text: '2/5 + 1/3',
    expectedCategory: 'operation',
  },
  {
    id: 'op-pct-1',
    text: '¿Cuánto es el 20% de 150?',
    expectedCategory: 'percentage',
  },
];
