/**
 * Comprueba si el bot reconoce enunciados típicos colombianos.
 * Ejecutar: node scripts/check-colombian-enunciados.mjs
 * (Requiere que el proyecto tenga resolución de módulos para .ts; si no, usar ts-node o compilar antes.)
 *
 * Versión que usa solo los parsers y simulate el flujo de detección sin TypeScript.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Cargar parsers vía require (compilados o ts-node)
let parseWordProblem, parseGenericWordProblem, AlgorithmicTutor;
try {
  const wp = await import('../data/wordProblemParser.ts');
  parseWordProblem = wp.parseWordProblem;
  parseGenericWordProblem = wp.parseGenericWordProblem;
} catch (e) {
  console.log('No se pudo cargar wordProblemParser. Usando datos estáticos.');
}

const ENUNCIADOS = [
  { id: 'tanque-1', text: 'Un tanque tiene capacidad de 200 litros cuando está lleno. Estaba lleno solo hasta la mitad. Se gastaron dos quintos de lo que había. Luego añadieron 15 litros. ¿Cuántos litros faltan para llenar el tanque por completo?', expectWP: true },
  { id: 'suma-kg-1', text: 'Ana compró 2,5 kg de manzanas y 1,75 kg de naranjas. ¿Cuántos kg en total?', expectWP: true },
  { id: 'resta-1', text: 'En la tienda había 50 kg de arroz. Vendieron 20 kg. ¿Cuántos kg quedan?', expectWP: true },
  { id: 'multipaso-1', text: 'Juan tenía 50 pesos. Compró un jugo por 30 pesos. Su abuela le regaló 20 pesos. ¿Cuántos pesos tiene ahora?', expectWP: true },
  { id: 'mult-1', text: 'Hay 4 cajas con 12 manzanas cada una. ¿Cuántas manzanas hay en total?', expectWP: true },
  { id: 'div-1', text: 'Se reparten 36 galletas entre 6 niños. ¿Cuántas galletas le tocan a cada uno?', expectWP: true },
  { id: 'div-2', text: 'Repartir 60 dulces entre 5 niños. ¿Cuántos dulces cada uno?', expectWP: true },
  { id: 'geo-rect-1', text: 'Un rectángulo tiene 5 m de largo y 3 m de ancho. ¿Cuál es su perímetro?', expectWP: false },
  { id: 'geo-tri-1', text: 'Área de un triángulo base 4 altura 3.', expectWP: false },
  { id: 'op-div-1', text: '2456 ÷ 12', expectWP: false },
];

async function main() {
  const path = await import('path');
  const base = path.dirname(path.dirname(import.meta.url));
  process.chdir(base);

  // Dynamic import for TS (if available)
  let wpParser, genericParser, algoTutor;
  try {
    const wp = await import('../data/wordProblemParser.ts');
    wpParser = wp.parseWordProblem;
    genericParser = wp.parseGenericWordProblem;
  } catch (_) {
    console.log('⚠️ wordProblemParser no cargable en este entorno. Solo se listan enunciados.');
  }
  try {
    const algo = await import('../services/algorithmicTutor.ts');
    algoTutor = algo.AlgorithmicTutor;
  } catch (_) {
    console.log('⚠️ AlgorithmicTutor no cargable en este entorno.');
  }

  console.log('=== Enunciados típicos colombianos (quinto grado) ===\n');

  for (const e of ENUNCIADOS) {
    let wpOk = false;
    let genericOk = false;
    let botOk = false;

    if (wpParser && e.text.length >= 30 && /litros|capacidad|mitad|faltan|gastaron|añadieron/i.test(e.text)) {
      const r = wpParser(e.text);
      wpOk = r != null;
    }
    if (genericParser && e.text.length >= 20) {
      const r = genericParser(e.text);
      genericOk = r != null;
    }
    if (algoTutor && algoTutor.generateResponse) {
      const resp = algoTutor.generateResponse(e.text, [], 'es', undefined, undefined);
      botOk = resp != null && resp.steps && resp.steps.length > 0;
    }

    const parserReconoce = wpOk || genericOk;
    const esperadoWP = e.expectWP;
    const okParser = !esperadoWP || parserReconoce;
    const okBot = !algoTutor || botOk;

    console.log(`[${e.id}] ${e.text.slice(0, 60)}...`);
    console.log(`  Parser WP/Gen: ${parserReconoce ? 'Sí' : 'No'} ${esperadoWP ? (okParser ? '✓' : '✗ esperado') : ''}  |  Bot responde: ${okBot ? 'Sí ✓' : 'No ✗'}`);
    console.log('');
  }

  console.log('=== Fin ===');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
