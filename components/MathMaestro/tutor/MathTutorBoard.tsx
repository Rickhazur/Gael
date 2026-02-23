import { useState, useRef, useEffect } from 'react';
import { generateNoteSummary, extractMathFromImage } from '@/services/ai_service';
import { GradeLevel, Curriculum } from '../../../types/tutor';
import { useLearning } from '@/context/LearningContext';
import { Header } from './Header';
import { TutorChat, TutorChatRef } from './TutorChat';
import { CleanWhiteboard, WhiteboardRef } from './CleanWhiteboard';
import { Interactive3DViewer } from '@/components/3D/Interactive3DViewer';
import { GeometryInteractive } from '../GeometryInteractive';
import { getModelById } from '@/components/3D/models-library';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from '@/utils/errorMessages';
import { normalizePastedFractions } from '@/utils/normalizePastedFractions';
import { supabase } from '../../../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { UniversalNotebook } from '@/components/Notebook/UniversalNotebook';
import { notebookService } from '@/services/notebookService';
import { useDemoTour } from '@/context/DemoTourContext';
import { MathBlockWorkspace } from '@/components/MathLab/BlocklyWorkspace'; // NEW IMPORT
import { recordMathTutorCompletion } from '../../../services/learningProgress';
import { recordMathAttempt } from '../../../services/mathPerformance';
import { MathProgressWidget } from '../MathProgressWidget';
import { MultiStarRunner } from '../games/MultiStarRunner';
import MathPhoenix from '../games/MathPhoenix/MathPhoenix';
import { MathTutorEnhancements } from '../MathTutorEnhancements';
import { generateExercises, type MathExercise, type MathOperation } from '../../../services/exerciseGenerator';
import { parseMathProblem } from '@/services/mathValidator';
import { usePetContext } from '@/context/PetContext';
import { ViewState } from '@/types';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Egg, Mic } from 'lucide-react';


// Compress canvas image for API (mobile-friendly: smaller payload, faster upload)
async function compressCanvasForApi(dataUrl: string, maxWidth = 800): Promise<string> {
    const withTimeout = (promise: Promise<string>, ms: number) =>
        Promise.race([
            promise,
            new Promise<string>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
        ]);
    const compress = () =>
        new Promise<string>((resolve) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const w = img.width;
                    const h = img.height;
                    const scale = w > maxWidth ? maxWidth / w : 1;
                    const cw = Math.round(w * scale);
                    const ch = Math.round(h * scale);
                    const canvas = document.createElement('canvas');
                    canvas.width = cw;
                    canvas.height = ch;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) { resolve(dataUrl); return; }
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(0, 0, cw, ch);
                    ctx.drawImage(img, 0, 0, cw, ch);
                    resolve(canvas.toDataURL('image/jpeg', 0.88));
                } catch {
                    resolve(dataUrl);
                }
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        });
    try {
        return await withTimeout(compress(), 4000);
    } catch {
        return dataUrl; // fallback to raw image on timeout (e.g. mobile)
    }
}

// Define props interface
interface MathTutorBoardProps {
    initialGrade?: number;
    userName?: string;
    userId?: string;
    onNavigate?: (view: ViewState) => void;
}

export function MathTutorBoard({ initialGrade = 3, userName, userId, onNavigate }: MathTutorBoardProps) {
    const { language, setLanguage } = useLearning();
    const { hasPet, setIsPetPanelOpen, completeLesson } = usePetContext();
    const effectiveLanguage = (language === 'bilingual' ? 'es' : language) as 'es' | 'en';
    const whiteboardRef = useRef<WhiteboardRef>(null);
    const whiteboardContainerRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<TutorChatRef>(null);
    const [boardMicListening, setBoardMicListening] = useState(false);
    const boardRecognitionRef = useRef<any>(null);

    // Microphone in toolbar: send voice to chat (e.g. "continuar") without switching to chat tab
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = effectiveLanguage === 'es' ? 'es-ES' : 'en-US';
        boardRecognitionRef.current = recognition;
        recognition.onresult = (event: any) => {
            const transcript = (event.results?.[0]?.[0]?.transcript ?? '').trim();
            if (transcript) chatRef.current?.analyzeText(transcript);
            setBoardMicListening(false);
        };
        recognition.onerror = () => setBoardMicListening(false);
        recognition.onend = () => setBoardMicListening(false);
        return () => {
            try { boardRecognitionRef.current?.abort?.(); } catch (_) { }
            boardRecognitionRef.current = null;
        };
    }, [effectiveLanguage]);

    const toggleBoardMic = () => {
        if (boardMicListening) {
            try { boardRecognitionRef.current?.stop?.(); } catch (_) { }
            setBoardMicListening(false);
        } else if (boardRecognitionRef.current) {
            try {
                boardRecognitionRef.current.start();
                setBoardMicListening(true);
            } catch (e) {
                console.warn('Board mic start failed', e);
                setBoardMicListening(false);
            }
        }
    };

    // HELPER: Convert "123 + 456", "3/4 + 1/2", "2.5 + 1.3", etc. into Blockly XML
    const generateBlocklyFromText = (text: string) => {
        const clean = text.replace(/\s+/g, '');

        // Fractions: 3/4+1/2 or 1/2-1/4
        const fracMatch = clean.match(/(\d+)\/(\d+)\s*([+\-])\s*(\d+)\/(\d+)/);
        if (fracMatch) {
            const [n1, d1, op, n2, d2] = [fracMatch[1], fracMatch[2], fracMatch[3], fracMatch[4], fracMatch[5]];
            const frac1 = `<block type="vertical_column">
                <value name="TOP"><block type="math_number_simple"><field name="NUM">${n1}</field></block></value>
                <value name="BOTTOM"><block type="math_number_simple"><field name="NUM">${d1}</field></block></value>
                <next>
                <block type="vertical_column">
                <value name="TOP"><block type="math_number_simple"><field name="NUM">${n2}</field></block></value>
                <value name="BOTTOM"><block type="math_number_simple"><field name="NUM">${d2}</field></block></value>
                </block>
                </next>
            </block>`;
            return `<xml xmlns="http://www.w3.org/1999/xhtml">
                <block type="math_operation_setup" x="50" y="50">
                    <statement name="COLUMNS">${frac1}</statement>
                </block>
            </xml>`;
        }

        // Decimals: 2.5+1.3 (treat as whole numbers 25+13 for column structure)
        const decMatch = clean.match(/(\d+)\.(\d+)\s*([+])\s*(\d+)\.(\d+)/);
        if (decMatch) {
            const [i1, f1, i2, f2] = [decMatch[1], decMatch[2], decMatch[4], decMatch[5]];
            const maxDec = Math.max(f1.length, f2.length);
            const topStr = i1 + f1.padEnd(maxDec, '0');
            const botStr = i2 + f2.padEnd(maxDec, '0');
            const len = Math.max(topStr.length, botStr.length);
            const topPad = topStr.padStart(len, '0');
            const botPad = botStr.padStart(len, '0');
            const buildCol = (i: number): string => i < 0 ? '' : `<block type="vertical_column">
                <value name="TOP"><block type="math_number_simple"><field name="NUM">${topPad[i]}</field></block></value>
                <value name="BOTTOM"><block type="math_number_simple"><field name="NUM">${botPad[i]}</field></block></value>
                <next>${buildCol(i - 1)}</next>
            </block>`;
            return `<xml xmlns="http://www.w3.org/1999/xhtml">
                <block type="math_operation_setup" x="50" y="50">
                    <statement name="COLUMNS">${buildCol(len - 1)}</statement>
                </block>
            </xml>`;
        }

        const addMatch = clean.match(/(\d+)\+(\d+)/);
        const subMatch = clean.match(/(\d+)\-(\d+)/);
        const mulMatch = clean.match(/(\d+)[x×*](\d+)/);
        const divMatch = clean.match(/(\d+)[÷/](\d+)/);
        const match = addMatch || subMatch || mulMatch || divMatch;

        if (!match) return "";

        const topStr = match[1];
        const botStr = match[2];
        const len = Math.max(topStr.length, botStr.length);
        const topPad = topStr.padStart(len, '0');
        const botPad = botStr.padStart(len, '0');

        // Build columns from Right to Left (Units -> Tens) for the linked list structure
        // Actually Blockly stacks typically go Top->Bottom visually, but "Next" connection implies sequence.
        // For vertical math, we often want the "Units" column to be the first one focused or just listed in order.
        // Let's list them Left-to-Right (Highest place value to lowest) or Right-to-Left?
        // Socratic usually goes Right-to-Left (Units first). Let's build Units -> Tens -> Hundreds.

        let blocksXml = "";

        // We need to nest them: Col(Units) -> next -> Col(Tens) -> next -> Col(Hundreds)...
        // Recursion or loop to build the string?

        const buildColumn = (index: number): string => {
            if (index < 0) return "";

            // Current digits (using padded string, but we want empty if it was padding? 
            // Standard vertical math shows spaces. Let's stick to numbers or 0 for now)
            const d1 = topPad[index];
            const d2 = botPad[index]; // simple logic, ignore spaces for now

            return `
            <block type="vertical_column">
                <value name="TOP">
                    <block type="math_number_simple">
                        <field name="NUM">${d1}</field>
                    </block>
                </value>
                <value name="BOTTOM">
                    <block type="math_number_simple">
                        <field name="NUM">${d2}</field>
                    </block>
                </value>
                <next>
                    ${buildColumn(index - 1)}
                </next>
            </block>`;
        };

        // Start from last index (Rightmost / Units)
        const columns = buildColumn(len - 1);

        return `
        <xml xmlns="http://www.w3.org/1999/xhtml">
            <block type="math_operation_setup" x="50" y="50">
                <statement name="COLUMNS">
                    ${columns}
                </statement>
            </block>
        </xml>`;
    };

    const [isAnalyzeLoading, setIsAnalyzeLoading] = useState(false);
    const [noteData, setNoteData] = useState<any>(null); // Store processed note
    const { tourState, getCurrentStepData } = useDemoTour();

    // NEW: Session State for the "Welcome -> Split" flow
    const [sessionState, setSessionState] = useState<'checking' | 'ready'>('checking');
    /** Cuando el tutor dibuja geometría (rectángulo), mostramos figura 3D manipulable en el tablero. */
    const [geometry3D, setGeometry3D] = useState<{ modelId: string; modelUrl?: string; title: string; description: string } | null>(null);
    /** Geometría interactiva: problema completo con highlights, figura 3D y fórmulas paso a paso */
    const [geometryInteractive, setGeometryInteractive] = useState<{
        problem: string;
        shape: 'rectangle' | 'circle' | 'triangle' | 'square';
        dimensions: { [key: string]: number };
        geometryType: string;
        solutionSteps?: string[];
    } | null>(null);
    const [showGame, setShowGame] = useState(false);
    const [selectedGame, setSelectedGame] = useState<'runner' | 'phoenix' | null>(null);

    // Robustly handle grade input to prevent crashes
    const [contextMessage, setContextMessage] = useState<string | null>(null);

    // NEW: Update context when drawing operations
    const updateContextFromVisualData = (visualData: any) => {
        if (visualData?.context) {
            setContextMessage(visualData.context);
        } else {
            // Optional: Auto-clear or keep last? Let's keep last unless explicitly cleared.
        }
    };

    const [grade, setGrade] = useState<GradeLevel>(() => {
        const num = Number(initialGrade);
        if (!isNaN(num) && num >= 1 && num <= 5) {
            return num as GradeLevel;
        }
        return 3;
    });

    const [curriculum, setCurriculum] = useState<Curriculum>('ib-pyp');
    const [activeTask, setActiveTask] = useState<string | null>(null);
    const [studentName, setStudentName] = useState<string>(userName || "Student");
    const [selectedTutor, setSelectedTutor] = useState<'lina' | 'rachelle'>(() => {
        // Force Lina if in demo mode to avoid Rachelle appearing prematurely
        const isDemo = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
        if (isDemo) return 'lina';

        // 🎓 PEDAGOGY: 1st Grade is ALWAYS Profesora Lina (MEN/IB Persona)
        const gNum = Number(initialGrade);
        if (gNum <= 1) return 'lina';

        return effectiveLanguage === 'es' ? 'lina' : 'rachelle';
    });

    // TAB STATE FOR MOBILE
    const [mobileTab, setMobileTab] = useState<'board' | 'chat'>('board');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // BLOCKLY STATE (invisible, for tutor's internal validation)
    const [blocklyXml, setBlocklyXml] = useState<string>("");


    // DIVISION STYLE: Cargar preferencia del usuario o usar 'us' por defecto.
    const [divisionStyle, setDivisionStyle] = useState<'latin' | 'us'>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('nova_math_division_style');
            if (stored === 'latin' || stored === 'us') return stored;
        }
        return 'us';
    });
    const [pendingDivision, setPendingDivision] = useState<any | null>(null);
    const [lastDivisionProps, setLastDivisionProps] = useState<any | null>(null);
    const [showStylePicker, setShowStylePicker] = useState(false);
    const [masteryMode, setMasteryMode] = useState(false); // NEW STATE for choice flow
    const [showGrid, setShowGridState] = useState(true);
    const [boardScale, setBoardScale] = useState(1.0); // NEW: Board zoom/scale state
    const [toolMode, setToolMode] = useState<'pen' | 'hand'>('pen'); // Restored for Mobile Scroll vs Draw

    // ZOOM FUNCTIONS RE-ADDED
    const zoomIn = () => {
        setBoardScale(prev => Math.min(prev + 0.1, 2.0));
    };

    const zoomOut = () => {
        setBoardScale(prev => Math.max(prev - 0.1, 0.5));
    };

    const resetZoom = () => {
        setBoardScale(1.0);
    };

    const scrollToBottom = () => {
        if (whiteboardContainerRef.current) {
            setTimeout(() => {
                whiteboardContainerRef.current?.scrollTo({
                    top: whiteboardContainerRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
    };

    // Auto-scroll when hint changes
    useEffect(() => {
        if (contextMessage) scrollToBottom();
    }, [contextMessage]);

    const handleSetDivisionStyle = (style: 'latin' | 'us') => {
        setDivisionStyle(style);
        localStorage.setItem('nova_math_division_style', style);

        const propsToUse = pendingDivision || lastDivisionProps;
        if (propsToUse) {
            const { div, divisor, q, p, r, highlight, columnIndex, visualData } = propsToUse;
            whiteboardRef.current?.drawDivisionStep(div, divisor, q, p, r, highlight, style, columnIndex, visualData);
            setLastDivisionProps(propsToUse);
            setPendingDivision(null);
        }
        setShowStylePicker(false);

        // Notificar al tutor del cambio para que la siguiente explicación use el estilo correcto
        const taskToRetry = activeTask || lastDrawnText;
        if (taskToRetry) {
            const systemMsg = language === 'es' ? `[SYSTEM: Cambiar estilo a ${style}]` : `[SYSTEM: Change style to ${style}]`;
            setTimeout(() => chatRef.current?.analyzeText(systemMsg, true), 100);
        }

        toast.success(style === 'latin'
            ? (language === 'es' ? "Estilo Tradicional (Latam) activado" : "Traditional Style active")
            : (language === 'es' ? "Estilo Americano activado" : "American Style active")
        );
    };

    const toggleGrid = () => {
        const newVal = !showGrid;
        setShowGridState(newVal);
        whiteboardRef.current?.setShowGrid(newVal);
        toast.info(newVal ? (language === 'es' ? "Cuadrícula activada" : "Grid ON") : (language === 'es' ? "Cuadrícula desactivada" : "Grid OFF"));
    };


    // Simulate "Checking for Google Classroom Tasks" on mount
    // Load Mission Context from LocalStorage (set by MissionsLog or Arena)
    // DEMO STEP 4: SYNC VISUALS WITH AUDIO (Lina → fracciones; Rachel → tabla MCM → highlight; Lina cierre, sin respuesta final)
    useEffect(() => {
        if (!tourState.isActive || tourState.currentStep !== 4) return;

        const lcmPayload = {
            type: 'lcm_list',
            lists: [
                { base: 2, items: [2, 4, 6, 8] },
                { base: 4, items: [4, 8, 12, 16] }
            ],
            match: 4,
            originalOp: { n1: 1, d1: 2, n2: 1, d2: 4, operator: '+' }
        };

        const handleVoiceSync = (e: any) => {
            const { voice } = e.detail;
            // Lina empieza a explicar → en ese momento salen las fracciones (solo ½ + ¼)
            if (voice === 'lina') {
                whiteboardRef.current?.drawSolutionSteps(["Suma de Fracciones:", "½ + ¼"], -1);
            }
        };

        const handleMathPhase = (e: any) => {
            const phase = e.detail?.phase;
            if (phase === 'table') {
                whiteboardRef.current?.drawFraction({ ...lcmPayload, highlightMatch: false });
            }
            if (phase === 'highlight') {
                whiteboardRef.current?.drawFraction({ ...lcmPayload, highlightMatch: true });
            }
        };

        window.addEventListener('nova-demo-voice', handleVoiceSync);
        window.addEventListener('nova-demo-math-phase', handleMathPhase);

        // Fracciones al inicio del paso (por si el evento lina llega después)
        const initTimer = setTimeout(() => {
            whiteboardRef.current?.drawSolutionSteps(["½ + ¼"], -1);
        }, 800);

        return () => {
            window.removeEventListener('nova-demo-voice', handleVoiceSync);
            window.removeEventListener('nova-demo-math-phase', handleMathPhase);
            clearTimeout(initTimer);
        };
    }, [tourState.currentStep, tourState.isActive]);

    // AUTO-SWITCH TUTOR AVATAR BASED ON DEMO AUDIO LANGUAGE
    useEffect(() => {
        const handleVoiceChange = (e: any) => {
            const voice = e.detail?.voice;
            if (voice === 'en' || voice === 'rachelle' || voice === 'en-US') {
                setSelectedTutor('rachelle');
                setLanguage('en');
            } else if (voice === 'es' || voice === 'lina' || voice === 'es-MX') {
                setSelectedTutor('lina');
                setLanguage('es');
            }
        };

        window.addEventListener('nova-demo-voice', handleVoiceChange);
        return () => window.removeEventListener('nova-demo-voice', handleVoiceChange);
    }, []);

    useEffect(() => {
        const checkTasks = async () => {
            try {
                // 1. Get User Name
                const { data: { user } } = await supabase?.auth.getUser() || { data: { user: null } };
                if (user) {
                    const name = user.user_metadata?.full_name || user.user_metadata?.name || "Campeón";
                    setStudentName(name);
                } else {
                    const stored = localStorage.getItem('nova_user_name');
                    if (stored) setStudentName(stored);
                }

                // 2. Check for Active Mission Context (solo si viene del Centro de Mando / Misiones)
                const missionParams = localStorage.getItem('nova_mission_params');
                const fromCenter = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nova_mission_from_center') === '1';

                if (missionParams && fromCenter) {
                    try {
                        const mission = JSON.parse(missionParams);
                        console.log("🚀 Mission Context Loaded:", mission);
                        const title = mission.missionTitle || mission.title;
                        setActiveTask(title);

                        // Si es una misión del panel de padres, activamos el diálogo automáticamente
                        if (mission.isParentMission) {
                            setTimeout(() => {
                                if (mission.mode === 'remedial') {
                                    chatRef.current?.analyzeText(`${language === 'es' ? 'Hola Lina, mi papá escaneó mi boletín y me asignó un refuerzo en' : 'Hi Lina, my parent scanned my report card and I need help with'} ${mission.topic || title}. ${language === 'es' ? '¿Podemos practicar?' : 'Can we practice?'}`, true);
                                } else {
                                    chatRef.current?.analyzeText(`${language === 'es' ? '¡Hola! Vengo a cumplir mi misión:' : 'Hi! I am here to do my mission:'} ${title}`, true);
                                }
                            }, 2000);
                        }
                    } catch (e) {
                        console.error("Error parsing mission params", e);
                        setActiveTask(null);
                    }
                } else {
                    setActiveTask(null);
                    if (missionParams && !fromCenter) localStorage.removeItem('nova_mission_params');
                }

                // Limpiar flag de origen después de leerlo para evitar re-triggers al recargar
                if (fromCenter) sessionStorage.removeItem('nova_mission_from_center');

            } catch (e) { console.error("Error fetching user:", e); }

            // Short delay for animation smoothness
            await new Promise(r => setTimeout(r, 1500));
            setSessionState('ready');
        };

        checkTasks();
    }, []);

    // Al salir del tutor de matemáticas, borrar la misión guardada para que la próxima vez que
    // abras Math desde el menú/campus no siga cargando divisiones (u otra operación) del Centro de Mando.
    useEffect(() => {
        return () => {
            localStorage.removeItem('nova_mission_params');
        };
    }, []);

    // Cuando el usuario viene de una misión MATH (Centro de Mando o Misiones): cargar ese ejercicio.
    // Si abre Math desde el menú/campus (sin la marca), no cargar misión aunque queden params viejos (p. ej. tras refresh).
    const missionStarterShown = useRef(false);
    useEffect(() => {
        if (sessionState !== 'ready' || missionStarterShown.current || !whiteboardRef.current || !chatRef.current) return;
        if (tourState?.isActive) return; // don't override demo tour

        const raw = localStorage.getItem('nova_mission_params');
        const fromCenter = sessionStorage.getItem('nova_mission_from_center') === '1';
        // Si hay params pero NO viene del Centro de Mando (abrió Math desde menú/campus o refrescó), borrar y no cargar misión.
        if (raw && !fromCenter) {
            localStorage.removeItem('nova_mission_params');
            return;
        }
        if (!raw) return;

        let mission: { subject?: string; mode?: string; difficulty?: number; missionTitle?: string; missionDescription?: string } = {};
        try {
            mission = JSON.parse(raw);
        } catch {
            return;
        }
        if (mission.subject !== 'MATH') return;

        const mode = (mission.mode || '').toLowerCase();
        const opMap: Record<string, MathOperation> = {
            multiplication: 'multiplication',
            multiplicacion: 'multiplication',
            division: 'division',
            división: 'division',
            addition: 'addition',
            suma: 'addition',
            subtraction: 'subtraction',
            resta: 'subtraction',
            fractions: 'fractions',
            fracciones: 'fractions'
        };
        const operation = opMap[mode] || (mission.missionTitle?.toLowerCase().includes('multiplic') ? 'multiplication' : mission.missionTitle?.toLowerCase().includes('divis') ? 'division' : mission.missionTitle?.toLowerCase().includes('sum') ? 'addition' : mission.missionTitle?.toLowerCase().includes('rest') ? 'subtraction' : 'multiplication');
        const diffNum = typeof mission.difficulty === 'number' ? mission.difficulty : 2;
        const difficulty = diffNum <= 1 ? 'easy' : diffNum >= 3 ? 'hard' : 'medium';

        const titleAndDesc = `${mission.missionTitle || ''} ${mission.missionDescription || ''}`.toLowerCase();
        const wantsDivisionWithRemainder = operation === 'division' && /inexacta|residuo|remainder/.test(titleAndDesc);

        const exercises = generateExercises({
            operation,
            difficulty,
            count: 1,
            divisionWithRemainder: wantsDivisionWithRemainder
        });
        const first = exercises[0];
        if (!first?.problem) return;

        missionStarterShown.current = true;
        const problem = normalizePastedFractions(first.problem);

        const timer = setTimeout(() => {
            requestAnimationFrame(() => {
                handleIntelligentDraw(problem);
            });
            const xml = generateBlocklyFromText(problem);
            if (xml) setBlocklyXml(xml);
            chatRef.current?.analyzeText(problem);
            toast.success(effectiveLanguage === 'es' ? '¡Ejercicio de tu misión en la pizarra! Resuelve con Lina.' : 'Mission exercise on the board! Solve it with Lina.');
            // Usado: quitar marca y params para que al volver a abrir Math desde el menú no siga la misma misión.
            sessionStorage.removeItem('nova_mission_from_center');
            localStorage.removeItem('nova_mission_params');
        }, 2500);

        return () => clearTimeout(timer);
    }, [sessionState, effectiveLanguage]);

    const handleIntelligentDraw = (trimmed: string) => {
        // DETECCIÓN INTELIGENTE DE LAYOUT INMEDIATO (Para TODAS las operaciones)
        const clean = trimmed.replace(/\s+/g, '');

        // 1. DIVISIÓN (123/4 o 12.5/4.2)
        const divMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*[÷/]\s*(\d+(?:\.\d+)?)$/);

        // 2. SUMA (solo positivos para render vertical, ej 123+456)
        const addMatch = clean.match(/^(\d+(?:\.\d+)?)\+(\d+(?:\.\d+)?)$/);

        // 3. RESTA (solo positivos para render vertical, ej 123-45)
        const subMatch = clean.match(/^(\d+(?:\.\d+)?)\-(\d+(?:\.\d+)?)$/);

        // 4. MULTIPLICACIÓN (solo positivos para render vertical, ej 123x45)
        const mulMatch = clean.match(/^(\d+(?:\.\d+)?)[x×*](\d+(?:\.\d+)?)$/);

        if (divMatch) {
            const [_, dividend, divisor] = divMatch;
            whiteboardRef.current?.drawDivisionStep(dividend, divisor, '', '', '', undefined, divisionStyle);
        } else if (addMatch) {
            const [_, n1, n2] = addMatch;
            whiteboardRef.current?.drawVerticalOp(n1, n2, '', '+', '', undefined);
        } else if (subMatch) {
            const [_, n1, n2] = subMatch;
            whiteboardRef.current?.drawVerticalOp(n1, n2, '', '-', '', undefined);
        } else if (mulMatch) {
            const [_, n1, n2] = mulMatch;
            whiteboardRef.current?.drawVerticalOp(n1, n2, '', '×', '', undefined);
        } else {
            whiteboardRef.current?.drawText(trimmed);
        }
        setLastDrawnText(trimmed);
    };

    // NEW: Trigger Session Start ONCE when state becomes ready and component is mounted
    const [lastDrawnText, setLastDrawnText] = useState("");
    const lastCheckRef = useRef(0);
    const [isOrganizeLoading, setIsOrganizeLoading] = useState(false);
    const runCheckAfterOrganizeRef = useRef(false);

    const handleOrganizeBoard = async () => {
        if (isOrganizeLoading || isAnalyzeLoading) return;
        const rawImage = whiteboardRef.current?.getImage();
        if (!rawImage) {
            toast.error(language === 'es' ? "El tablero está vacío" : "Board is empty");
            return;
        }
        setIsOrganizeLoading(true);
        try {
            const imageData = await compressCanvasForApi(rawImage);
            const extracted = await extractMathFromImage(imageData, effectiveLanguage);
            if (!extracted?.steps?.length) {
                toast.error(language === 'es' ? "No pude reconocer la operación. Intenta escribir más claro." : "Couldn't recognize the operation. Try writing more clearly.");
                if (runCheckAfterOrganizeRef.current) {
                    toast.info(language === 'es' ? "Enviando tu pizarra a la profesora para que la revise." : "Sending your board to the teacher for review.");
                }
                return;
            }
            const step = extracted.steps[0];
            const vType = step.visualType;
            const v = step.visualData || {};

            if ((vType === 'fraction_equation' || vType === 'fraction_op') && (v.num1 != null && v.den1 != null && v.num2 != null && v.den2 != null)) {
                whiteboardRef.current?.drawFractionEquation({
                    num1: v.num1, den1: v.den1, num2: v.num2, den2: v.den2,
                    operator: v.operator || '+',
                    originalOp: v.originalOp || { n1: v.num1, d1: v.den1, n2: v.num2, d2: v.den2, operator: v.operator || '+' }
                });
                const txt = `${v.num1}/${v.den1} ${v.operator || '+'} ${v.num2}/${v.den2}`;
                setLastDrawnText(txt);
            } else if ((vType === 'fraction_bar' || vType === 'fraction') && (v.numerator != null && v.denominator != null)) {
                whiteboardRef.current?.drawFraction(v.numerator, v.denominator, v.type || 'bar');
                setLastDrawnText(`${v.numerator}/${v.denominator}`);
            } else if ((vType === 'division') && (v.dividend && v.divisor)) {
                whiteboardRef.current?.drawDivisionStep(v.dividend, v.divisor, v.quotient || '', v.product, v.remainder);
                setLastDrawnText(`${v.dividend} ÷ ${v.divisor}`);
            } else if ((vType === 'vertical_op') && (v.operand1 != null && v.operand2 != null)) {
                const op = v.operator || '+';
                whiteboardRef.current?.drawVerticalOp(v.operand1, v.operand2, v.result || '', op, v.carry, v.highlight, v.borrows, v.helpers, v);
                setLastDrawnText(`${v.operand1} ${op} ${v.operand2}`);
            } else {
                runCheckAfterOrganizeRef.current = false;
                toast.warning(language === 'es' ? "Operación reconocida pero formato no soportado para organizar." : "Operation recognized but format not supported for organizing.");
                return;
            }
            toast.success(language === 'es' ? "¡Organizado! Pulsa REVISAR para que la profesora lo revise." : "Organized! Press CHECK for the teacher to review.");
        } catch (e) {
            console.error(e);
            toast.error(ERROR_MESSAGES.analyze(language === 'es' ? 'es' : 'en'));
        } finally {
            setIsOrganizeLoading(false);
            if (runCheckAfterOrganizeRef.current) {
                runCheckAfterOrganizeRef.current = false;
                handleCheckBoard();
            }
        }
    };

    const handleCheckBoard = async () => {
        if (!chatRef.current) return;
        if (isAnalyzeLoading) return;
        if (Date.now() - lastCheckRef.current < 400) return; // prevent double-tap on mobile
        lastCheckRef.current = Date.now();
        setIsAnalyzeLoading(true);

        try {
            // Si el tablero tiene texto conocido como operación (ej. "3/4", "3 ÷ 4"), enviar al tutor algorítmico en vez de la IA por imagen → evita respuestas genéricas tipo "Hola"
            const textToCheck = lastDrawnText?.trim();
            if (textToCheck && parseMathProblem(textToCheck)) {
                chatRef.current.analyzeText(textToCheck);
                setIsAnalyzeLoading(false);
                toast.success(language === 'es' ? 'Revisando con la Profe Lina…' : 'Checking with Ms. Lina…');
                return;
            }

            const rawImage = whiteboardRef.current?.getImage();
            if (!rawImage) {
                toast.error(language === 'es'
                    ? "No se pudo ver la pizarra. Toca la pestaña PIZARRA, escribe o dibuja el ejercicio y pulsa REVISAR de nuevo."
                    : "Could not see the board. Tap the BOARD tab, write or draw the exercise, then tap CHECK again.");
                setIsAnalyzeLoading(false);
                return;
            }

            // Compress for mobile (smaller payload = faster upload, fewer timeouts)
            const imageData = await compressCanvasForApi(rawImage);

            const msgs = chatRef.current.getAllMessages() || [];
            const lastNovaMsg = msgs.filter(m => m.role === 'nova').pop()?.content || "";

            const contextPrefix = language === 'es' ? "Revisa mi trabajo." : "Check my work.";
            let fullContext = contextPrefix;

            if (lastDrawnText) {
                const divMatch = lastDrawnText.match(/(\d+)\s*\/\s*(\d+)/);
                if (divMatch) {
                    const dividend = divMatch[1];
                    const divisor = divMatch[2];
                    fullContext = language === 'es'
                        ? `Estoy resolviendo ${dividend} dividido entre ${divisor}. Revisa mi trabajo en el tablero.`
                        : `I'm solving ${dividend} divided by ${divisor}. Check my work on the board.`;
                } else {
                    fullContext = `${contextPrefix} The problem on the board is: ${lastDrawnText}`;
                }
            }

            const orgInstruction = language === 'es'
                ? " CRÍTICO: Si detectas una operación matemática (suma, resta, multiplicación, división, fracciones), SIEMPRE incluye en tu respuesta un step con visualType 'vertical_op' (o 'fraction_bar' si son fracciones) y visualData con operand1, operand2, operator y result para que pueda redibujar la operación ORGANIZADA en el tablero."
                : " CRITICAL: If you detect a math operation (add, subtract, multiply, divide, fractions), ALWAYS include in your response a step with visualType 'vertical_op' (or 'fraction_bar' for fractions) and visualData with operand1, operand2, operator and result so I can redraw the operation ORGANIZED on the board.";

            const no3x4Instruction = language === 'es'
                ? " PROHIBIDO: NUNCA sugieras '3 por 4', 'grupos iguales', 'dibuja círculos' ni cambies a geometría. Responde SOLO sobre lo que REALMENTE está dibujado en esta imagen."
                : " FORBIDDEN: NEVER suggest '3 times 4', 'equal groups', 'draw circles' or switch to geometry. Respond ONLY about what is ACTUALLY drawn in this image.";

            if (lastNovaMsg) {
                fullContext = `CONTEXTO DEL SISTEMA (IMPORTANTE):
El estudiante está respondiendo a tu última pregunta: "${lastNovaMsg}".
La respuesta está DIBUJADA en esta imagen del tablero.
NO digas "no sé qué ejercicio es". ASUME que es la respuesta a tu pregunta.
Analiza si el número o dibujo en el tablero responde correctamente a "${lastNovaMsg}".
${fullContext}${orgInstruction}${no3x4Instruction}`;
            } else {
                fullContext = `${fullContext}${orgInstruction}${no3x4Instruction}`;
            }

            await chatRef.current.analyzeImage(imageData, fullContext);

        } catch (e) {
            console.error(e);
            toast.error(ERROR_MESSAGES.analyze(language === 'es' ? 'es' : 'en'));
        } finally {
            setIsAnalyzeLoading(false);
        }
    };

    const [isInputModalOpen, setIsInputModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    // Pre-fill with demo problem
    const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
    const [problemText, setProblemText] = useState(isDemoMode ? '¿Cuánto es 1/2 + 1/4?' : '');

    const handleProblemSubmit = () => {
        const raw = problemText.trim();
        if (!raw) return;
        const trimmed = normalizePastedFractions(raw);
        if (trimmed) {
            requestAnimationFrame(() => {
                handleIntelligentDraw(trimmed);
            });

            if (chatRef.current) {
                // Send normalized text so the professor recognizes the operation
                chatRef.current.analyzeText(trimmed);
            }
            setProblemText("");
            setIsInputModalOpen(false);
            toast.success(language === 'es' ? "Problema añadido a la pizarra" : "Problem added to board");
        }
    };

    // NEW HANDLERS FOR ENHANCEMENTS
    const handleFeedbackFromScanner = (feedback: string, detectedProblem?: string) => {
        if (chatRef.current) {
            // Add AI feedback to the chat
            chatRef.current.addTutorMessage(feedback);
            toast.success(language === 'es' ? "Análisis recibido" : "Analysis received");
        }

        if (detectedProblem && whiteboardRef.current) {
            const normalized = normalizePastedFractions(detectedProblem);
            whiteboardRef.current.drawText(normalized);
            setLastDrawnText(normalized);
        }
    };

    const handleExerciseFromTraining = (exercise: MathExercise) => {
        // Load the problem into the solver input
        setProblemText(exercise.problem);
        setIsInputModalOpen(true);
        toast.info(language === 'es' ? "¡Ejercicio cargado! Haz click en enviar" : "Exercise loaded! Click send");
    };


    if (sessionState === 'checking') {
        return (
            <div className="h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6 relative overflow-hidden font-nunito">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-black pointer-events-none" />
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-t-cyan-500 border-r-transparent border-b-cyan-500 border-l-transparent rounded-full animate-spin" />
                    <div className="absolute inset-4 border-4 border-t-transparent border-r-purple-500 border-b-transparent border-l-purple-500 rounded-full animate-spin-reverse" />
                    <span className="text-6xl animate-pulse">🚀</span>
                </div>
                <h2 className="text-2xl font-black text-cyan-400 tracking-widest uppercase">
                    {language === 'es' ? 'Inicializando Tutor...' : 'Initializing Tutor...'}
                </h2>
                <div className="flex gap-2 items-center text-slate-500 font-bold font-mono text-sm">
                    <span className="animate-ping text-cyan-500">●</span>
                    <span>Systems Check: OK</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-950 font-nunito selection:bg-cyan-500/30 selection:text-cyan-100 overflow-hidden">

            {/* ... (Header and Background) ... */}

            {/* Solo layout americano: modal de estilo oculto */}
            <AnimatePresence>
                {false && ((pendingDivision && !divisionStyle) || showStylePicker) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border-4 border-cyan-400 relative overflow-hidden"
                        >
                            <div className="text-center mb-8 relative z-10">
                                <h3 className="text-3xl font-black text-slate-800 mb-2">
                                    {language === 'es' ? '¿Cómo prefieres dividir?' : 'How do you prefer to divide?'}
                                </h3>
                                <p className="text-slate-500 font-bold text-lg">
                                    {language === 'es' ? 'Elige el estilo que usas en tu escuela:' : 'Choose the style used in your school:'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                {/* LATIN STYLE CARD - Dividendo | Divisor */}
                                <button
                                    onClick={() => handleSetDivisionStyle('latin')}
                                    className="group relative flex flex-col items-center p-6 rounded-2xl border-3 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white hover:border-cyan-500 hover:shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.98]"
                                >
                                    {/* Visual Example */}
                                    <div className="mb-4 bg-white p-5 rounded-2xl border-2 border-cyan-100 shadow-lg group-hover:border-cyan-300 group-hover:shadow-cyan-200/50">
                                        <div className="flex items-start gap-1">
                                            {/* Dividendo */}
                                            <div className="flex flex-col">
                                                <span className="font-comic text-3xl font-black text-cyan-600">489</span>
                                                <span className="font-comic text-xl font-bold text-rose-500 -mt-1">-3↓</span>
                                                <span className="font-comic text-2xl font-bold text-emerald-500 border-t-2 border-slate-400 pt-1">18</span>
                                            </div>
                                            {/* Caja divisor */}
                                            <div className="border-l-4 border-t-4 border-slate-700 pl-3 pt-1 ml-1">
                                                <span className="font-comic text-3xl font-black text-blue-600">3</span>
                                                <div className="border-t-2 border-slate-500 mt-1 pt-1">
                                                    <span className="font-comic text-2xl font-bold text-purple-600">1</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black text-cyan-600 flex items-center gap-2">
                                        🇨🇴 {language === 'es' ? 'Opción A' : 'Option A'}
                                    </div>
                                    <div className="text-sm text-slate-500 font-bold mt-1">
                                        {language === 'es' ? 'Latinoamericano / Europeo' : 'Latin American / European'}
                                    </div>
                                    <div className="absolute top-3 right-3 text-cyan-500 opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">✓</div>
                                    </div>
                                </button>

                                {/* US STYLE CARD - Divisor ) Dividendo */}
                                <button
                                    onClick={() => handleSetDivisionStyle('us')}
                                    className="group relative flex flex-col items-center p-6 rounded-2xl border-3 border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:border-purple-500 hover:shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.98]"
                                >
                                    {/* Visual Example */}
                                    <div className="mb-4 bg-white p-5 rounded-2xl border-2 border-purple-100 shadow-lg group-hover:border-purple-300 group-hover:shadow-purple-200/50">
                                        <div className="flex flex-col items-center">
                                            {/* Cociente arriba */}
                                            <span className="font-comic text-2xl font-bold text-purple-600 mb-1 ml-8">1</span>
                                            {/* Divisor y dividendo */}
                                            <div className="flex items-center">
                                                <span className="font-comic text-3xl font-black text-blue-600">3</span>
                                                <div className="border-t-4 border-l-4 border-slate-700 pl-3 pt-1 rounded-tl-lg ml-1">
                                                    <span className="font-comic text-3xl font-black text-cyan-600">489</span>
                                                </div>
                                            </div>
                                            {/* Pasos debajo */}
                                            <div className="ml-8 mt-1">
                                                <span className="font-comic text-xl font-bold text-rose-500">-3↓</span>
                                                <div className="border-t-2 border-slate-400 mt-1 pt-1">
                                                    <span className="font-comic text-2xl font-bold text-emerald-500">18</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black text-purple-600 flex items-center gap-2">
                                        🇺🇸 {language === 'es' ? 'Opción B' : 'Option B'}
                                    </div>
                                    <div className="text-sm text-slate-500 font-bold mt-1">
                                        {language === 'es' ? 'Americano (USA)' : 'American (USA)'}
                                    </div>
                                    <div className="absolute top-3 right-3 text-purple-500 opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">✓</div>
                                    </div>
                                </button>
                            </div>

                            <div className="flex justify-center mt-8 relative z-10">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setShowStylePicker(false);
                                        setPendingDivision(null);
                                    }}
                                    className="text-slate-400 hover:text-slate-600 font-bold"
                                >
                                    {language === 'es' ? 'Cerrar' : 'Close'}
                                </Button>
                            </div>

                            {/* Decorative Blobs */}
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl" />
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ... (rest of main content) ... */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(15,23,42,0.9)_2px,transparent_2px),linear-gradient(90deg,rgba(15,23,42,0.9)_2px,transparent_2px)] bg-[length:40px_40px] pointer-events-none opacity-50 z-0" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05),transparent_70%)] pointer-events-none z-0" />

            {/* --- MOBILE MENU (hamburger: Salir, Adoptar) - visible only on small screens --- */}
            {onNavigate && (
                <div className="lg:hidden fixed top-4 left-4 z-[50]">
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                className="touch-manipulation flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-600 text-white shadow-lg"
                                aria-label={effectiveLanguage === 'es' ? 'Menú' : 'Menu'}
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] bg-slate-900 border-slate-700 p-0">
                            <div className="p-4 border-b border-slate-700">
                                <h3 className="font-bold text-white">{effectiveLanguage === 'es' ? 'Menú' : 'Menu'}</h3>
                            </div>
                            <div className="p-2 flex flex-col gap-1">
                                <button
                                    type="button"
                                    onClick={() => { onNavigate(ViewState.DASHBOARD); setMobileMenuOpen(false); }}
                                    className="touch-manipulation flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left text-white hover:bg-slate-800 active:bg-slate-700"
                                >
                                    <Home className="w-5 h-5 text-cyan-400" />
                                    <span className="font-medium">{effectiveLanguage === 'es' ? 'Salir al inicio' : 'Back to home'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setMobileTab('board'); setMobileMenuOpen(false); }}
                                    className="touch-manipulation flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left text-white hover:bg-slate-800 active:bg-slate-700"
                                >
                                    <span className="text-lg">🎨</span>
                                    <span className="font-medium">{effectiveLanguage === 'es' ? 'Pizarra' : 'Board'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setMobileTab('chat'); setMobileMenuOpen(false); }}
                                    className="touch-manipulation flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left text-white hover:bg-slate-800 active:bg-slate-700"
                                >
                                    <span className="text-lg">💬</span>
                                    <span className="font-medium">Chat</span>
                                </button>
                                {!hasPet && (
                                    <button
                                        type="button"
                                        onClick={() => { setIsPetPanelOpen(true); setMobileMenuOpen(false); }}
                                        className="touch-manipulation flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left text-white bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50"
                                    >
                                        <Egg className="w-5 h-5" />
                                        <span className="font-medium">{effectiveLanguage === 'es' ? '¡Adoptar!' : 'Adopt!'}</span>
                                    </button>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            )}

            {/* --- TOP HEADER (Now Dark) --- */}
            <div className="relative z-10">
                <Header
                    language={effectiveLanguage}
                    grade={grade}
                    curriculum={curriculum}
                    tutor={selectedTutor}
                    sessionLabel={selectedTutor === 'lina' ? (effectiveLanguage === 'es' ? 'Sesión de Matemáticas' : 'Math Session') : (effectiveLanguage === 'es' ? 'Sesión de Inglés' : 'English Session')}
                    tutorName={selectedTutor === 'lina' ? (effectiveLanguage === 'es' ? 'Profesora Lina' : 'Ms. Lina') : (effectiveLanguage === 'es' ? 'Ms. Rachelle' : 'Ms. Rachelle')}
                    onLanguageChange={setLanguage}
                    onGradeChange={setGrade}
                    onCurriculumChange={setCurriculum}
                    onTutorChange={(t) => {
                        setSelectedTutor(t);
                        setLanguage(t === 'lina' ? 'es' : 'en');
                    }}
                    onBack={() => onNavigate?.(ViewState.DASHBOARD)}
                />

            </div>

            {/* --- MOBILE TAB SWITCHER --- */}
            <div className="lg:hidden px-4 pb-2 flex gap-3 z-20 shrink-0">
                <button
                    onClick={() => setMobileTab('board')}
                    className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mobileTab === 'board'
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50 scale-[1.02]'
                        : 'bg-slate-900/50 text-slate-500 hover:bg-slate-800'
                        }`}
                >
                    <span>🎨</span> {language === 'es' ? 'PIZARRA' : 'BOARD'}
                </button>
                <div className="relative flex-1">
                    <button
                        onClick={() => setMobileTab('chat')}
                        className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mobileTab === 'chat'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 scale-[1.02]'
                            : 'bg-slate-900/50 text-slate-500 hover:bg-slate-800'
                            }`}
                    >
                        <span>💬</span> CHAT
                    </button>
                    {/* Unread indicator could go here */}
                </div>
            </div>

            {/* --- TUTOR MODE (Original) --- */}
            {/* --- TUTOR MODE (Original) --- */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 lg:p-6 gap-2 lg:gap-6 relative z-10">

                {/* --- 2. WHITEBOARD AREA (Left - 66%) --- */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`flex-[2] flex flex-col gap-4 ${mobileTab === 'board' ? 'flex' : 'hidden lg:flex'}`}
                >
                    {/* Screen Container */}
                    <div className="flex-1 rounded-[2rem] bg-slate-900 p-2 shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-700/50 relative overflow-hidden group flex flex-col">
                        {/* Upper label tab */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur border-b border-x border-slate-600 rounded-b-xl px-4 py-1 z-20 shadow-md flex items-center gap-2">
                            <span className="text-cyan-400 text-xs font-black tracking-wider">
                                {language === 'es' ? '🎨 PIZARRA INTERACTIVA' : '🎨 INTERACTIVE BOARD'}
                            </span>
                        </div>

                        <div className="flex-1 bg-white rounded-[1.5rem] relative shadow-inner flex overflow-hidden">
                            {/* 🧠 IMMOVABLE HINT BOX - FIXED ON LEFT SIDE */}
                            <div className="absolute top-4 left-4 z-40 pointer-events-none">
                                <AnimatePresence>
                                    {(contextMessage && !masteryMode) && (
                                        <motion.div
                                            initial={{ x: -100, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -100, opacity: 0 }}
                                            className="w-64 bg-yellow-50/95 backdrop-blur-md border-2 border-yellow-400 p-4 rounded-2xl shadow-xl pointer-events-auto"
                                        >
                                            <div className="flex items-center justify-between gap-2 text-yellow-700 border-b border-yellow-200/50 pb-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">💡</span>
                                                    <span className="font-black text-[10px] uppercase tracking-wider">
                                                        {language === 'es' ? 'PISTA' : 'TIP'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setContextMessage(null)}
                                                    className="w-5 h-5 rounded-full hover:bg-yellow-200 flex items-center justify-center text-yellow-700 transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <p className="font-comic text-slate-800 font-bold text-xs leading-tight">
                                                {contextMessage}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>


                            {/* SCROLLABLE WHITEBOARD AREA: canvas o figura 3D manipulable cuando hay geometría */}
                            <div
                                ref={whiteboardContainerRef}
                                className="flex-1 overflow-y-auto relative z-0 scroll-smooth pt-16 px-4"
                            >
                                <div className="min-h-full w-full" style={{
                                    transform: `scale(${boardScale})`,
                                    transformOrigin: 'top left',
                                    transition: 'transform 0.2s ease-out'
                                }}>
                                    {geometryInteractive ? (
                                        <div className="relative w-full min-h-[500px] h-full">
                                            <button
                                                onClick={() => setGeometryInteractive(null)}
                                                className="absolute top-3 right-3 z-30 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl transition-all hover:scale-105"
                                                title="Cerrar Geometría"
                                            >
                                                ✕
                                            </button>
                                            <GeometryInteractive
                                                problem={geometryInteractive.problem}
                                                shape={geometryInteractive.shape}
                                                dimensions={geometryInteractive.dimensions}
                                                solutionSteps={geometryInteractive.solutionSteps}
                                                onStepComplete={(step) => {
                                                    console.log('Geometry step completed:', step);
                                                }}
                                            />
                                        </div>
                                    ) : geometry3D ? (
                                        <div className="relative w-full min-h-[400px] rounded-2xl overflow-hidden border-2 border-cyan-500/30 bg-slate-900">
                                            <button
                                                onClick={() => setGeometry3D(null)}
                                                className="absolute top-3 right-3 z-30 bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-600 shadow-lg"
                                            >
                                                {effectiveLanguage === 'es' ? 'Volver al tablero' : 'Back to board'}
                                            </button>
                                            <Interactive3DViewer
                                                modelId={geometry3D.modelId}
                                                modelUrl={geometry3D.modelUrl}
                                                title={geometry3D.title}
                                                description={geometry3D.description}
                                                subject="geometry"
                                                language={effectiveLanguage}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ pointerEvents: toolMode === 'hand' ? 'none' : 'auto' }}>
                                            <CleanWhiteboard ref={whiteboardRef} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hidden Blockly Workspace for Internal Validation */}
                        <div className="hidden">
                            <MathBlockWorkspace
                                onWorkspaceChange={(newXml) => setBlocklyXml(newXml)}
                                initialXml={blocklyXml}
                            />
                        </div>

                        {/* Scanning Overlay */}
                        <AnimatePresence>
                            {(isAnalyzeLoading || isOrganizeLoading) && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 pointer-events-none z-30 flex flex-col bg-cyan-900/10 backdrop-blur-[2px]"
                                >
                                    <div className="h-1 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] animate-scan-slow w-full" />
                                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 text-cyan-400 px-6 py-2 rounded-full border border-cyan-500/50 shadow-xl flex items-center gap-3">
                                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                                        <span className="font-mono text-sm font-bold tracking-widest">
                                            {isOrganizeLoading ? (language === 'es' ? 'Organizando...' : 'Organizing...') : (language === 'es' ? 'Analizando...' : 'Scanning Image...')}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Toolbar: modo maestro, arena, escribir, borrar, guía, cámara (foto al tablero), adoptar (solo en toolbar; sin botón en esquina) */}
                    <div className="min-h-16 lg:h-20 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 flex flex-wrap items-center justify-center gap-2 lg:gap-4 px-2 lg:px-4 py-2 shadow-2xl overflow-x-auto">
                        <div className="w-px h-8 bg-slate-700 mx-1 lg:mx-2 hidden first:block" aria-hidden="true" />

                        {/* MASTERY MODE TOGGLE */}
                        <button
                            onClick={() => {
                                const newVal = !masteryMode;
                                setMasteryMode(newVal);
                                toast.success(newVal
                                    ? (language === 'es' ? "¡MODO MAESTRO ACTIVADO! Monedas x2 👑" : "MASTERY MODE ON! 2x Coins 👑")
                                    : (language === 'es' ? "Modo Aprendiz: Pistas activadas 🌱" : "Apprentice Mode: Hints ON 🌱")
                                );
                            }}
                            className={`flex flex-col items-center justify-center px-4 h-12 rounded-xl border transition-all duration-300 transform hover:scale-105 active:scale-95 ${masteryMode
                                ? 'bg-amber-500 text-white border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/30'
                                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-500'
                                }`}
                        >
                            <span className="text-lg leading-none">{masteryMode ? '👑' : '🌱'}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest mt-0.5">
                                {masteryMode
                                    ? (language === 'es' ? 'MODO MAESTRO' : 'MASTERY MODE')
                                    : (language === 'es' ? 'CON PISTAS' : 'WITH HINTS')
                                }
                            </span>
                        </button>

                        <div className="w-px h-8 bg-slate-700 mx-1 lg:mx-2" />
                        <ActionBtn icon="🎮" label="ARENA" color="amber" onClick={() => setShowGame(true)} highlight />
                        <ActionBtn icon="⌨️" label={language === 'es' ? 'ESCRIBIR' : 'TYPE'} color="cyan" onClick={() => setIsInputModalOpen(true)} />
                        <ActionBtn icon="🗑️" label={language === 'es' ? 'BORRAR' : 'CLEAR'} color="rose" onClick={() => {
                            setGeometry3D(null);
                            whiteboardRef.current?.clear();
                            setLastDrawnText("");
                            setContextMessage(null);
                            chatRef.current?.clearChat();
                            toast.success(language === 'es' ? 'Tablero y chat listos. Escribe otra operación o problema.' : 'Board and chat cleared. Type another operation or problem.');
                        }} />
                        <button
                            type="button"
                            onClick={toggleBoardMic}
                            title={language === 'es' ? 'Micrófono (di "continuar" etc.)' : 'Microphone (say "continue" etc.)'}
                            className={`flex flex-col items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer active:scale-95 flex-shrink-0 ${boardMicListening ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/50 hover:bg-slate-500 hover:text-white'}`}
                        >
                            <Mic className="w-6 h-6 lg:w-7 lg:h-7 mb-0.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{language === 'es' ? 'MIC' : 'MIC'}</span>
                        </button>
                        <ActionBtn icon="📷" label={language === 'es' ? 'FOTO' : 'PHOTO'} color="violet" onClick={() => document.getElementById('board-upload')?.click()} />
                        <input type="file" accept="image/*" className="hidden" id="board-upload" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                    const result = ev.target?.result as string;
                                    if (result && whiteboardRef.current) {
                                        whiteboardRef.current.drawImage(result);
                                        setLastDrawnText("");
                                        toast.success(language === 'es' ? "Foto cargada" : "Photo loaded");
                                    }
                                };
                                reader.readAsDataURL(file);
                            }
                            e.target.value = '';
                        }} />

                        <div className="w-px h-8 bg-slate-700 mx-1 lg:mx-2" />
                        <ActionBtn
                            icon={divisionStyle === 'us' ? "🇺🇸" : "🇨🇴"}
                            label={language === 'es' ? 'Dividir' : 'Division'}
                            color="slate"
                            onClick={() => setShowStylePicker(true)}
                        />

                        {!hasPet && (
                            <>
                                <div className="w-px h-8 bg-slate-700 mx-1 lg:mx-2" />
                                <button
                                    type="button"
                                    onClick={() => setIsPetPanelOpen(true)}
                                    className="flex flex-col items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer active:scale-95 bg-violet-500/10 text-violet-400 border-violet-500/50 hover:bg-violet-500 hover:text-white"
                                    title={language === 'es' ? '¡Adoptar!' : 'Adopt!'}
                                >
                                    <span className="text-xl lg:text-2xl mb-0.5">🥚</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest">{(language === 'es' ? 'ADOPTAR' : 'ADOPT')}</span>
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* --- 3. TUTOR CHAT PANEL (Right - 33%) --- */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className={`flex-[1] bg-slate-900/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-700 overflow-hidden flex flex-col relative ${mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'}`}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                    {userId && (
                        <div className="absolute top-4 right-4 z-20 w-48 max-w-[40%]">
                            <MathProgressWidget userId={userId} language={effectiveLanguage} />
                        </div>
                    )}
                    <div className="absolute top-4 left-4 z-20">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="bg-white/90 backdrop-blur border-2 border-slate-200 shadow-lg px-3 py-1 rounded-full flex items-center gap-2 text-slate-600 font-bold text-xs hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
                            onClick={async () => {
                                const toastId = toast.loading(effectiveLanguage === 'es' ? "Generando resumen inteligente..." : "Generating smart summary...");
                                try {
                                    const msgs = chatRef.current?.getAllMessages() || [];
                                    let summaryData = { title: "", summary: "" };

                                    if (msgs.length > 0) {
                                        // Use LLM to extract concepts and title
                                        summaryData = await generateNoteSummary(msgs, effectiveLanguage);
                                    } else {
                                        summaryData = {
                                            title: effectiveLanguage === 'es' ? "Sesión de Práctica" : "Practice Session",
                                            summary: effectiveLanguage === 'es' ? "Sin notas todavía." : "No notes yet."
                                        };
                                    }

                                    const boardImg = whiteboardRef.current?.getImage() || null;

                                    setNoteData({
                                        topic: summaryData.title, // Use the specific AI-generated topic
                                        date: new Date().toLocaleDateString(),
                                        summary: summaryData.summary,
                                        boardImage: boardImg,
                                        subject: 'math'
                                    });

                                    toast.dismiss(toastId);
                                    setIsNoteModalOpen(true);
                                } catch (e) {
                                    toast.dismiss(toastId);
                                    console.error("Note gen error", e);
                                    toast.error("Error generating notes");
                                    // Fallback
                                    setIsNoteModalOpen(true);
                                }
                            }}
                        >
                            <span>💾</span>
                            {effectiveLanguage === 'es' ? "Guardar Apuntes" : "Save Notes"}
                        </Button>
                    </div>

                    <TutorChat
                        ref={chatRef}
                        language={effectiveLanguage}
                        grade={grade}
                        curriculum={curriculum}
                        studentName={studentName}
                        tutor={selectedTutor}
                        initialTask={activeTask || undefined}
                        divisionStyle={divisionStyle}
                        onShowDivisionSelector={() => setShowStylePicker(true)}
                        onSendToBoard={(img) => whiteboardRef.current?.drawImage(img)}
                        onDrawText={(text, highlights) => {
                            const normalized = normalizePastedFractions(text ?? '').trim();
                            if (!normalized) return;
                            requestAnimationFrame(() => {
                                whiteboardRef.current?.drawText(normalized, highlights ?? []);
                                setLastDrawnText(normalized);
                            });
                        }}
                        onDrawDivisionStep={(div, divisor, q, p, r, highlight, style, col, visualData) => {
                            setPendingDivision({ div, divisor, q, p, r, highlight, columnIndex: col, visualData });
                            whiteboardRef.current?.drawDivisionStep(div, divisor, q, p, r, highlight, style, col, visualData);
                            updateContextFromVisualData(visualData);
                        }}
                        onDrawGeometry={(s, p) => {
                            const shape = (s || '').toLowerCase();

                            // Si los datos incluyen useInteractive, activar GeometryInteractive
                            if (p?.useInteractive) {
                                const shapeMap: Record<string, 'rectangle' | 'circle' | 'triangle' | 'square'> = {
                                    'rectangle': 'rectangle',
                                    'rect': 'rectangle',
                                    'circle': 'circle',
                                    'circulo': 'circle',
                                    'triangle': 'triangle',
                                    'triangulo': 'triangle',
                                    'square': 'square',
                                    'cuadrado': 'square'
                                };

                                const mappedShape = shapeMap[shape] || 'rectangle';
                                const problemText = p.problemText || '';
                                const dimensions = p.dimensions || {};

                                setGeometryInteractive(prev => ({
                                    problem: problemText,
                                    shape: mappedShape,
                                    dimensions,
                                    geometryType: p.geometryType || 'area',
                                    solutionSteps: p.solutionSteps || prev?.solutionSteps || []
                                }));
                                setGeometry3D(null); // Limpiar el modo 3D simple
                                return;
                            }

                            // Modo 3D simple para rectángulos (legacy) - SOLAMENTE si no es problema verbal guiado
                            if ((shape.includes('rect') || shape.includes('rectangle') || shape === 'rectangle') && !p?.wpPhase) {
                                const model = getModelById('cube');
                                const len = p?.length ?? p?.labels?.[0] ?? '?';
                                const wid = p?.width ?? p?.labels?.[1] ?? '?';
                                const tipo = p?.type === 'perimeter' ? (effectiveLanguage === 'es' ? 'perímetro' : 'perimeter') : (effectiveLanguage === 'es' ? 'área' : 'area');
                                setGeometry3D({
                                    modelId: 'cube',
                                    modelUrl: model?.modelFile,
                                    title: effectiveLanguage === 'es' ? `Rectángulo ${len} × ${wid}` : `Rectangle ${len} × ${wid}`,
                                    description: effectiveLanguage === 'es'
                                        ? `${tipo === 'perímetro' ? 'Perímetro = 2 × (largo + ancho)' : 'Área = largo × ancho'}. Arrastra para rotar en 3D.`
                                        : `${tipo === 'perimeter' ? 'Perimeter = 2 × (length + width)' : 'Area = length × width'}. Drag to rotate in 3D.`
                                });
                                setGeometryInteractive(null); // Limpiar modo interactivo
                                whiteboardRef.current?.clear();
                            } else {
                                setGeometry3D(null);
                                setGeometryInteractive(null);
                                whiteboardRef.current?.drawGeometry(s, p);
                            }
                        }}
                        onDrawFraction={(n, d, t) => {
                            requestAnimationFrame(() => whiteboardRef.current?.drawFraction(n, d, t));
                        }}
                        onDrawFractionEquation={(vd) => {
                            requestAnimationFrame(() => whiteboardRef.current?.drawFractionEquation(vd));
                        }}
                        onDrawDataPlot={(d) => whiteboardRef.current?.drawDataPlot(d)}
                        onDrawVerticalOp={(n1, n2, res, op, carry, highlight, borrows, helpers, visualData) => {
                            whiteboardRef.current?.drawVerticalOp(n1, n2, res, op, carry, highlight, borrows, helpers, visualData);
                            updateContextFromVisualData(visualData);
                            scrollToBottom();
                        }}
                        onDrawBase10Blocks={(v) => whiteboardRef.current?.drawBase10Blocks(v)}
                        onDrawDecomposition={(n1, f1, n2, f2) => whiteboardRef.current?.drawDecomposition(n1, f1, n2, f2)}
                        onDrawAlgebra={(eq, v, p, hl) => whiteboardRef.current?.drawAlgebra(eq, v, p, hl)}
                        onDrawCoordinateGrid={(pts, cp, p) => whiteboardRef.current?.drawCoordinateGrid(pts, cp, p)}
                        onDrawMultiplicationGroups={(n, i, t) => whiteboardRef.current?.drawMultiplicationGroups(n, i, t)}
                        onDrawImage={(url) => whiteboardRef.current?.drawImage(url)}
                        onSetupDragAndDrop={(bg, items) => whiteboardRef.current?.setupDragAndDrop(bg, items)}
                        onDrawProportionTable={(a1, b1, a2, b2, unitA, unitB, highlight) => whiteboardRef.current?.drawProportionTable(a1, b1, a2, b2, unitA, unitB, highlight)}
                        onTriggerCelebration={(type) => whiteboardRef.current?.triggerCelebration(type)}
                        masteryMode={masteryMode}
                        isDemo={tourState.isActive}
                        onExerciseComplete={(operationType) => {
                            notebookService.saveMathExerciseIfAllowed(operationType).catch(() => { });
                            completeLesson('math', 15);
                        }}
                        onPersistProgress={(operationType) => {
                            if (userId) recordMathTutorCompletion(userId, operationType, true);
                            recordMathAttempt(operationType, true);
                        }}
                    />

                </motion.div>
            </main>


            {/* PROBLEM INPUT MODAL (DARK THEME) */}
            <AnimatePresence>
                {isInputModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-slate-700 rounded-[2rem] p-6 lg:p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-slate-700">
                                    ⌨️
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white leading-none">
                                        {language === 'es' ? 'Ingresar Problema' : 'Input Problem'}
                                    </h3>
                                    <p className="text-xs text-cyan-400 font-bold mt-1 uppercase tracking-wider">
                                        {language === 'es' ? 'TIPO DE EJERCICIO' : 'EXERCISE TYPE'}
                                    </p>
                                </div>
                            </div>

                            <textarea
                                className="w-full h-32 p-5 rounded-2xl border border-slate-700 bg-slate-950 text-2xl font-black text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600 resize-none font-mono"
                                placeholder="25 + 18"
                                value={problemText}
                                onChange={(e) => setProblemText(e.target.value)}
                                autoFocus
                            />

                            <div className="flex gap-3 mt-8">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsInputModalOpen(false)}
                                    className="flex-1 h-12 rounded-xl text-slate-400 font-bold hover:bg-slate-800 hover:text-white"
                                >
                                    {language === 'es' ? 'Cancelar' : 'Cancel'}
                                </Button>
                                <Button
                                    onClick={handleProblemSubmit}
                                    className="flex-[2] h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all hover:scale-105 active:scale-95 border border-cyan-400/20"
                                >
                                    {language === 'es' ? '¡LISTO!' : 'GO!'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* NOTE GENERATION MODAL (LIVING NOTEBOOK) */}
            <UniversalNotebook
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                language={effectiveLanguage}
                getNoteData={() => noteData || {
                    topic: activeTask || "Sesión General",
                    date: new Date().toLocaleDateString(),
                    summary: "...",
                    boardImage: null,
                    subject: 'math'
                }}
                onSave={(noteData) => {
                    notebookService.saveNote(noteData as any);
                }}
                onStudy={(noteData) => {
                    setIsNoteModalOpen(false);
                    // Trigger AI Study Mode with Context
                    if (chatRef.current) {
                        const prompt = language === 'es'
                            ? `[SYSTEM: El estudiante está repasando sus apuntes sobre "${noteData.topic}". Resumen: "${noteData.summary.substring(0, 100)}...". Ayúdalo a estudiar o responde sus dudas sobre esto.]`
                            : `[SYSTEM: Student is reviewing notes on "${noteData.topic}". Summary: "${noteData.summary.substring(0, 100)}...". Help them study or answer questions about this.]`;

                        chatRef.current.analyzeText(prompt);
                        toast.info(language === 'es' ? "Modo Estudio Activado 🧠" : "Study Mode Activated 🧠");
                    }
                }}
            />

            {/* 🎯 DIVISION STYLE PICKER MODAL */}
            <AnimatePresence>
                {showStylePicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-700 rounded-[3rem] p-8 w-full max-w-4xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
                        >
                            {/* Decorative lighting */}
                            <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                            <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />

                            <div className="text-center mb-10">
                                <h3 className="text-3xl font-black text-white mb-3">
                                    {language === 'es' ? '¿Cómo prefieres dividir?' : 'How do you want to divide?'}
                                </h3>
                                <p className="text-slate-400 font-bold">
                                    {language === 'es'
                                        ? 'Elige el estilo que más te guste para resolver operaciones.'
                                        : 'Choose the style you prefer to solve operations.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* LATIN / COLOMBIAN OPTION */}
                                <button
                                    onClick={() => handleSetDivisionStyle('latin')}
                                    className={`group relative flex flex-col items-center p-8 rounded-[2.5rem] border-4 transition-all duration-500 ${divisionStyle === 'latin'
                                        ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.3)] scale-105'
                                        : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
                                        }`}
                                >
                                    <div className="mb-6 flex items-center gap-3">
                                        <span className="text-4xl">🇨🇴</span>
                                        <div className="text-left">
                                            <span className="block text-xl font-black text-white">
                                                {language === 'es' ? 'Tradicional' : 'Traditional'}
                                            </span>
                                            <span className="block text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                                                {language === 'es' ? 'Estilo Colombia / Latam' : 'Latin American Style'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Visual Preview for Latin */}
                                    <div className="w-full aspect-video bg-white rounded-2xl flex items-center justify-center p-4 shadow-inner pointer-events-none group-hover:bg-slate-50 transition-colors">
                                        <div className="text-black font-comic font-bold text-2xl flex items-start gap-2">
                                            <span>125</span>
                                            <div className="border-l-4 border-b-4 border-black pl-2 pb-1 pr-6">
                                                <span>5</span>
                                            </div>
                                        </div>
                                    </div>

                                    {divisionStyle === 'latin' && (
                                        <div className="absolute -top-4 -right-4 bg-cyan-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg animate-bounce">
                                            ✓
                                        </div>
                                    )}
                                </button>

                                {/* US / AMERICAN OPTION */}
                                <button
                                    onClick={() => handleSetDivisionStyle('us')}
                                    className={`group relative flex flex-col items-center p-8 rounded-[2.5rem] border-4 transition-all duration-500 ${divisionStyle === 'us'
                                        ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.3)] scale-105'
                                        : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
                                        }`}
                                >
                                    <div className="mb-6 flex items-center gap-3">
                                        <span className="text-4xl">🇺🇸</span>
                                        <div className="text-left">
                                            <span className="block text-xl font-black text-white">
                                                {language === 'es' ? 'Americano' : 'American'}
                                            </span>
                                            <span className="block text-[10px] font-black text-purple-400 uppercase tracking-widest">
                                                {language === 'es' ? 'Estilo USA / Internacional' : 'US / International Style'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Visual Preview for US */}
                                    <div className="w-full aspect-video bg-white rounded-2xl flex items-center justify-center p-4 shadow-inner pointer-events-none group-hover:bg-slate-50 transition-colors">
                                        <div className="text-black font-comic font-bold text-2xl flex flex-col items-center">
                                            <div className="border-b-4 border-black w-24 text-right pr-2 mb-1">
                                                <span>25</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="italic mr-1">5 )</span>
                                                <span>125</span>
                                            </div>
                                        </div>
                                    </div>

                                    {divisionStyle === 'us' && (
                                        <div className="absolute -top-4 -right-4 bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg animate-bounce">
                                            ✓
                                        </div>
                                    )}
                                </button>
                            </div>

                            <div className="mt-12 flex justify-center">
                                <Button
                                    onClick={() => setShowStylePicker(false)}
                                    className="px-12 h-14 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-black rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 text-lg"
                                >
                                    {language === 'es' ? '¡LISTO PARA APRENDER!' : 'READY TO LEARN!'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🎮 ARENA GAME OVERLAY */}
            <AnimatePresence>
                {showGame && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed inset-0 z-[60] bg-slate-950 flex items-center justify-center p-4 lg:p-12"
                    >
                        <div className="w-full max-w-7xl h-[85vh] relative flex flex-col items-center justify-center">
                            <Button
                                variant="ghost"
                                onClick={() => { setShowGame(false); setSelectedGame(null); }}
                                className="absolute -top-12 right-0 text-white hover:bg-white/10"
                            >
                                ✖ {language === 'es' ? 'SALIR DE LA ARENA' : 'LEAVE ARENA'}
                            </Button>

                            <div className="w-full h-full relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                                <MathPhoenix />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Adoptar está solo en el menú móvil (hamburger); sin botón en esquina para no duplicar */}

        </div >
    );
}




// Subcomponent for buttons
const ActionBtn = ({ icon, label, color, onClick, highlight }: { icon: string; label: string; color: string; onClick: () => void; highlight?: boolean }) => {
    const colorClasses: Record<string, string> = {
        cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500 hover:text-white",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500 hover:text-white",
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/50 hover:bg-rose-500 hover:text-white",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/50 hover:bg-amber-500 hover:text-white",
        violet: "bg-violet-500/10 text-violet-400 border-violet-500/50 hover:bg-violet-500 hover:text-white",
        slate: "bg-slate-500/10 text-slate-400 border-slate-500/50 hover:bg-slate-500 hover:text-white",
    };

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer active:scale-95 ${colorClasses[color] || colorClasses.cyan} ${highlight ? 'animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.6)] border-amber-400 ring-2 ring-amber-400/20' : ''}`}
            title={label}
        >
            <span className="text-xl lg:text-2xl mb-0.5">{icon}</span>
        </button>
    );
};
