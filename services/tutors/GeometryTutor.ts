
import { StepResponse, Step } from './types';
import { MathSolver, MathStep } from '../mathSolver';

type ShapeKind = 'rectangle' | 'triangle' | 'circle' | 'cube' | 'right_triangle';
type GeometryKind = 'perimeter' | 'area' | 'circumference' | 'volume' | 'angle_sum' | 'pythagoras';

export class GeometryTutor {
    static handleGeometry(input: string, prob: any, lang: 'es' | 'en', history: any[], _studentName?: string): StepResponse | null {
        const shape: ShapeKind = prob.shape || 'rectangle';
        const geometryType: GeometryKind = prob.geometryType || (shape === 'rectangle' ? 'area' : 'area');
        const n1 = prob.n1 != null ? parseFloat(String(prob.n1)) : NaN;
        const n2 = prob.n2 != null ? parseFloat(String(prob.n2)) : NaN;

        const lastState = this.getCurrentState(history);

        // Generar highlights de palabras clave según el tipo de problema
        const getKeywordHighlights = (): { text: string; color: string }[] => {
            const highlights: { text: string; color: string }[] = [];

            if (geometryType === 'perimeter' || geometryType === 'circumference') {
                highlights.push(
                    { text: lang === 'es' ? 'perímetro' : 'perimeter', color: 'blue' },
                    { text: lang === 'es' ? 'perimetro' : 'perimeter', color: 'blue' }
                );
            }
            if (geometryType === 'area') {
                highlights.push(
                    { text: lang === 'es' ? 'área' : 'area', color: 'green' },
                    { text: lang === 'es' ? 'area' : 'area', color: 'green' }
                );
            }
            if (geometryType === 'volume') {
                highlights.push({ text: lang === 'es' ? 'volumen' : 'volume', color: 'purple' });
            }

            // Dimensiones
            if (shape === 'rectangle') {
                highlights.push(
                    { text: lang === 'es' ? 'largo' : 'length', color: 'orange' },
                    { text: lang === 'es' ? 'ancho' : 'width', color: 'red' },
                    { text: String(n1), color: 'orange' },
                    { text: String(n2), color: 'red' }
                );
            } else if (shape === 'triangle') {
                highlights.push(
                    { text: lang === 'es' ? 'base' : 'base', color: 'orange' },
                    { text: lang === 'es' ? 'altura' : 'height', color: 'red' },
                    { text: String(n1), color: 'orange' },
                    { text: String(n2), color: 'red' }
                );
            } else if (shape === 'circle') {
                highlights.push(
                    { text: lang === 'es' ? 'radio' : 'radius', color: 'orange' },
                    { text: String(n1), color: 'orange' }
                );
            } else if (shape === 'cube') {
                highlights.push(
                    { text: lang === 'es' ? 'lado' : 'side', color: 'orange' },
                    { text: String(n1), color: 'orange' }
                );
            }

            return highlights;
        };

        const getMathSteps = (): MathStep[] => {
            if (shape === 'rectangle') {
                return geometryType === 'perimeter'
                    ? MathSolver.solveRectanglePerimeter(n1, n2)
                    : MathSolver.solveRectangleArea(n1, n2);
            }
            if (shape === 'triangle' && geometryType === 'area') {
                return MathSolver.solveTriangleArea(n1, n2);
            }
            if (shape === 'triangle' && geometryType === 'angle_sum') {
                return MathSolver.solveTriangleAngleSum();
            }
            if (shape === 'circle' && geometryType === 'area') {
                return MathSolver.solveCircleArea(n1);
            }
            if (shape === 'circle' && geometryType === 'circumference') {
                return MathSolver.solveCircleCircumference(n1);
            }
            if (shape === 'cube' && geometryType === 'volume') {
                return MathSolver.solveCubeVolume(n1);
            }
            if ((shape === 'right_triangle' || shape === 'triangle') && geometryType === 'pythagoras') {
                return MathSolver.solvePythagoras(n1, n2);
            }
            return MathSolver.solveRectangleArea(n1, n2);
        };

        const mathSteps = getMathSteps();

        const buildVisualData = (s: MathStep, idx: number): any => {
            const base: any = {
                shape,
                geometryType,
                n1: !Number.isNaN(n1) ? n1 : undefined,
                n2: !Number.isNaN(n2) ? n2 : undefined,
                labels: [],
                highlight: s.boardDraw?.type === 'highlight' ? 'shape' : 'none',
                // Agregar datos para visualización interactiva
                useInteractive: true,
                currentPhase: idx === 0 ? 'intro' : idx === mathSteps.length - 1 ? 'result' : 'solving',
                dimensions: {},
                formula: this.getFormula(shape, geometryType, lang)
            };

            // Construir objeto de dimensiones para el componente interactivo
            if (shape === 'rectangle') {
                base.length = n1;
                base.width = n2;
                base.type = geometryType;
                base.dimensions = {
                    [lang === 'es' ? 'largo' : 'length']: n1,
                    [lang === 'es' ? 'ancho' : 'width']: n2
                };
                base.labels = idx === 0 ? [String(n1), String(n2)] : [String(n1), String(n2), s.boardDraw?.type === 'writeAnswer' ? String(s.boardDraw.value) : ''];
            } else if (shape === 'triangle' && geometryType === 'area') {
                base.base = n1;
                base.height = n2;
                base.type = 'area';
                base.dimensions = {
                    [lang === 'es' ? 'base' : 'base']: n1,
                    [lang === 'es' ? 'altura' : 'height']: n2
                };
                base.labels = [String(n1), String(n2), s.boardDraw?.type === 'writeAnswer' ? String(s.boardDraw.value) : ''];
            } else if (shape === 'circle') {
                base.radius = n1;
                base.type = geometryType;
                base.dimensions = { [lang === 'es' ? 'radio' : 'radius']: n1 };
                base.labels = [String(n1), s.boardDraw?.type === 'writeAnswer' ? String(s.boardDraw.value) : ''];
            } else if (shape === 'cube') {
                base.side = n1;
                base.type = 'volume';
                base.dimensions = { [lang === 'es' ? 'lado' : 'side']: n1 };
                base.labels = [String(n1), s.boardDraw?.type === 'writeAnswer' ? String(s.boardDraw.value) : ''];
            } else if (geometryType === 'pythagoras') {
                base.n1 = n1;
                base.n2 = n2;
                base.type = 'pythagoras';
                base.dimensions = {
                    [lang === 'es' ? 'cateto1' : 'leg1']: n1,
                    [lang === 'es' ? 'cateto2' : 'leg2']: n2
                };
                base.labels = [String(n1), String(n2), s.boardDraw?.type === 'writeAnswer' ? String(s.boardDraw.value) : ''];
            } else if (geometryType === 'angle_sum') {
                base.type = 'angle_sum';
                base.labels = s.boardDraw?.type === 'writeAnswer' ? [String(s.boardDraw.value)] : [];
            }
            return base;
        };

        if (prob.isNew || !lastState) {
            const highlights = getKeywordHighlights();

            // Crear problema textual enriquecido
            const problemText = this.buildProblemText(shape, geometryType, n1, n2, lang);

            // Primer paso: mostrar el problema con highlights
            const introStep: Step = {
                text: problemText,
                speech: lang === 'es'
                    ? `¡Vamos a resolver un problema de geometría! ${problemText}`
                    : `Let's solve a geometry problem! ${problemText}`,
                visualType: 'geometry_interactive',
                visualData: {
                    ...buildVisualData(mathSteps[0], 0),
                    phase: 'problem',
                    problemText,
                    highlights,
                    showShape: false,
                    solutionSteps: mathSteps.map(s => s.text[lang]) // Pasar pasos reales
                },
                detailedExplanation: {
                    es: 'Introducción al problema de geometría',
                    en: 'Introduction to geometry problem'
                }
            };

            // Convertir pasos matemáticos a pasos interactivos
            const interactiveSteps = mathSteps.map((s: MathStep, idx: number) => ({
                text: s.text[lang],
                speech: s.speech ? s.speech[lang] : s.text[lang],
                visualType: 'geometry_interactive',
                visualData: {
                    ...buildVisualData(s, idx),
                    phase: idx === 0 ? 'identify' : idx === mathSteps.length - 1 ? 'result' : 'calculate',
                    highlights: idx === 0 ? highlights : [],
                    problemText, // Incluir en todos los pasos
                    showShape: idx > 0 // Mostrar la figura después del primer paso
                },
                detailedExplanation: s.failureHints ? { es: s.failureHints.es[0], en: s.failureHints.en[0] } : undefined
            })) as Step[];

            return {
                steps: [introStep, ...interactiveSteps]
            };
        }

        const currentStepIdx = history.filter(h => h.role === 'user').length;
        if (currentStepIdx >= mathSteps.length) return null;

        const s = mathSteps[currentStepIdx];
        const expected = s.expectedAnswer;
        if (expected != null && input.trim()) {
            const numMatch = input.replace(',', '.').match(/-?\d+\.?\d*/);
            const userNum = numMatch ? parseFloat(numMatch[0]) : null;
            const tolerance = expected >= 1 ? 0.01 : 0.001;
            const isCorrect = userNum != null && (Number.isInteger(expected) ? userNum === expected : Math.abs(userNum - expected) <= tolerance);
            if (!isCorrect && s.failureHints) {
                return {
                    steps: [{
                        text: (lang === 'es' ? s.failureHints.es[0] : s.failureHints.en[0]) + '\n\n' + s.text[lang],
                        speech: lang === 'es' ? s.failureHints.es[0] : s.failureHints.en[0],
                        visualType: 'geometry_interactive',
                        visualData: {
                            ...buildVisualData(s, currentStepIdx),
                            phase: 'hint'
                        },
                        detailedExplanation: { es: s.failureHints.es[0], en: s.failureHints.en[0] }
                    }] as Step[]
                };
            }
        }

        return {
            steps: [{
                text: s.text[lang],
                speech: s.speech ? s.speech[lang] : s.text[lang],
                visualType: 'geometry_interactive',
                visualData: buildVisualData(s, currentStepIdx),
                detailedExplanation: s.failureHints ? { es: s.failureHints.es[0], en: s.failureHints.en[0] } : undefined
            }] as Step[]
        };
    }

    private static getFormula(shape: ShapeKind, type: GeometryKind, lang: 'es' | 'en'): string {
        const formulas: Record<string, Record<string, { es: string; en: string }>> = {
            rectangle: {
                perimeter: { es: 'P = 2(largo + ancho)', en: 'P = 2(length + width)' },
                area: { es: 'A = largo × ancho', en: 'A = length × width' }
            },
            triangle: {
                area: { es: 'A = (base × altura) ÷ 2', en: 'A = (base × height) ÷ 2' },
                perimeter: { es: 'P = lado1 + lado2 + lado3', en: 'P = side1 + side2 + side3' }
            },
            circle: {
                area: { es: 'A = π × radio²', en: 'A = π × radius²' },
                circumference: { es: 'C = 2 × π × radio', en: 'C = 2 × π × radius' }
            },
            cube: {
                volume: { es: 'V = lado³', en: 'V = side³' }
            }
        };

        return formulas[shape]?.[type]?.[lang] || '';
    }

    private static buildProblemText(shape: ShapeKind, type: GeometryKind, n1: number, n2: number, lang: 'es' | 'en'): string {
        if (lang === 'es') {
            if (shape === 'rectangle') {
                if (type === 'perimeter') {
                    return `Calcula el perímetro de un rectángulo con largo ${n1} cm y ancho ${n2} cm.`;
                } else {
                    return `Calcula el área de un rectángulo con largo ${n1} cm y ancho ${n2} cm.`;
                }
            } else if (shape === 'triangle' && type === 'area') {
                return `Calcula el área de un triángulo con base ${n1} cm y altura ${n2} cm.`;
            } else if (shape === 'circle') {
                if (type === 'area') {
                    return `Calcula el área de un círculo con radio ${n1} cm.`;
                } else {
                    return `Calcula la circunferencia de un círculo con radio ${n1} cm.`;
                }
            } else if (shape === 'cube') {
                return `Calcula el volumen de un cubo con lado ${n1} cm.`;
            }
        } else {
            if (shape === 'rectangle') {
                if (type === 'perimeter') {
                    return `Calculate the perimeter of a rectangle with length ${n1} cm and width ${n2} cm.`;
                } else {
                    return `Calculate the area of a rectangle with length ${n1} cm and width ${n2} cm.`;
                }
            } else if (shape === 'triangle' && type === 'area') {
                return `Calculate the area of a triangle with base ${n1} cm and height ${n2} cm.`;
            } else if (shape === 'circle') {
                if (type === 'area') {
                    return `Calculate the area of a circle with radius ${n1} cm.`;
                } else {
                    return `Calculate the circumference of a circle with radius ${n1} cm.`;
                }
            } else if (shape === 'cube') {
                return `Calculate the volume of a cube with side ${n1} cm.`;
            }
        }
        return '';
    }

    private static getCurrentState(history: any[]): any {
        for (let i = history.length - 1; i >= 0; i--) {
            const h = history[i];
            if (h.role === 'assistant' || h.role === 'nova') {
                try {
                    const json = JSON.parse(h.content.match(/\{.*\}/)[0]);
                    if (json.steps && json.steps[0].visualType === 'geometry_interactive') return json.steps[0].visualData;
                } catch (e) { }
            }
        }
        return null;
    }
}
