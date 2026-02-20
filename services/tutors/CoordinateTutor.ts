import { StepResponse, VisualState } from './types';
import { StateHelper } from './utils';

export class CoordinateTutor {
    static handleCoordinates(input: string, prob: any, lang: 'es' | 'en', history: any[], studentName?: string): StepResponse | null {
        const lastState = StateHelper.getCurrentVisualState(history) as VisualState;
        const cleanInput = input.trim().toLowerCase();

        // Initialization
        if (prob.isNew || !lastState?.phase || (!lastState.points && !lastState.currentPoint)) {
            const x = prob.x != null ? parseInt(String(prob.x)) : (Math.floor(Math.random() * 10) - 5);
            const y = prob.y != null ? parseInt(String(prob.y)) : (Math.floor(Math.random() * 10) - 5);

            return {
                steps: [{
                    text: lang === 'es'
                        ? `¡Hola! Vamos a explorar el **Plano Cartesiano**. 🌐\n\nTenemos que ubicar el punto **(${x}, ${y})**. ¿Cuál es la coordenada **X**? (El primer número)`
                        : `Hi! Let's explore the **Coordinate Plane**. 🌐\n\nWe need to plot the point **(${x}, ${y})**. What is the **X** coordinate? (The first number)`,
                    speech: lang === 'es' ? `¿Cuál es la coordenada equis?` : `What is the X coordinate?`,
                    visualType: "coordinate_grid",
                    visualData: {
                        phase: 'coords_intro',
                        currentPoint: { x, y },
                        highlight: 'x_axis'
                    },
                    detailedExplanation: { es: "Identificar eje X", en: "Identify X axis" }
                }]
            };
        }

        const phase = lastState.phase;
        const targetPoint = lastState.currentPoint || { x: 0, y: 0 };

        // Step 1: Confirm X
        if (phase === 'coords_intro') {
            const numMatch = cleanInput.match(/(-?\d+)/);
            if (numMatch && parseInt(numMatch[1]) === targetPoint.x) {
                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Correcto! X = **${targetPoint.x}**. Ahora, ¿cuál es la coordenada **Y**? (El segundo número)`
                            : `Correct! X = **${targetPoint.x}**. Now, what is the **Y** coordinate? (The second number)`,
                        speech: lang === 'es' ? `¿Y la coordenada ye?` : `And the Y coordinate?`,
                        visualType: "coordinate_grid",
                        visualData: { ...lastState, phase: 'coords_plot', highlight: 'y_axis' },
                        detailedExplanation: { es: "Identificar eje Y", en: "Identify Y axis" }
                    }]
                };
            }
        }

        // Step 2: Confirm Y and Show Plotting
        if (phase === 'coords_plot') {
            const numMatch = cleanInput.match(/(-?\d+)/);
            if (numMatch && parseInt(numMatch[1]) === targetPoint.y) {
                const quadrant = targetPoint.x >= 0 ? (targetPoint.y >= 0 ? 1 : 4) : (targetPoint.y >= 0 ? 2 : 3);
                const quadrantName = lang === 'es' ? `Cuadrante ${quadrant}` : `Quadrant ${quadrant}`;

                return {
                    steps: [{
                        text: lang === 'es'
                            ? `¡Muy bien! El punto **(${targetPoint.x}, ${targetPoint.y})** está en el **${quadrantName}**.\n\n¡Lo hemos ubicado correctamente! 🎉`
                            : `Very good! The point **(${targetPoint.x}, ${targetPoint.y})** is in **${quadrantName}**.\n\nWe've plotted it correctly! 🎉`,
                        speech: lang === 'es' ? `¡Excelente! Ya ubicamos el punto.` : `Excellent! We plotted the point.`,
                        visualType: "coordinate_grid",
                        visualData: { ...lastState, phase: 'coords_done', highlight: 'point', points: [{ ...targetPoint, label: 'P' }] },
                        detailedExplanation: { es: "Punto ubicado con éxito", en: "Point plotted successfully" }
                    }]
                };
            }
        }

        return null;
    }
}
