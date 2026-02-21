import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

// --- TYPES & INTERFACES ---
import { ViewState } from '@/types';
import { stopSpeaking as stopNativeSpeaking } from '@/services/tts';
import ttsService from '@/services/tts';
import { generateSpeech } from '../services/edgeTTS';

interface DemoStep {
    id: number;
    title: string;
    description: string;
    narratorText?: string;
    audioPath?: string; // High quality local audio
    view: ViewState;
    autoData?: any;
    waitAfterAudio?: number; // Delay after audio before moving to next step
    hotspots?: { x: number; y: number; label: string; position?: 'top' | 'bottom' | 'left' | 'right' }[];
    /** Step 0: How to create account - shown as overlay before the main tour */
    isAccountCreationStep?: boolean;
}

export type DemoVariant = 'bilingual' | 'standard';

interface DemoTourState {
    isActive: boolean;
    currentStep: number;
    totalSteps: number;
    steps: DemoStep[];
    variant: DemoVariant;
}

interface DemoTourContextType {
    tourState: DemoTourState;
    startTour: (opts?: { variant?: DemoVariant }) => void;
    nextStep: () => void;
    previousStep: () => void;
    endTour: () => void;
    getCurrentStepData: () => DemoStep | null;
}

const DEFAULT_DEMO_STATE: DemoTourState = {
    isActive: false,
    currentStep: 0,
    totalSteps: 11,
    steps: [],
    variant: 'bilingual'
};

const DEFAULT_DEMO_CONTEXT: DemoTourContextType = {
    tourState: DEFAULT_DEMO_STATE,
    startTour: () => { },
    nextStep: () => { },
    previousStep: () => { },
    endTour: () => { },
    getCurrentStepData: () => null
};

const DemoTourContext = createContext<DemoTourContextType>(DEFAULT_DEMO_CONTEXT);

/** Presentación para colegio bilingüe: Lina + Rachelle en matemáticas, Research/Inglés con énfasis bilingüe. */
const DEMO_STEPS_BILINGUAL: DemoStep[] = [
    {
        id: 0,
        title: '📝 CÓMO CREAR TU CUENTA',
        description: 'Antes del recorrido, aprende cómo registrarte como padre o estudiante.',
        audioPath: '/audio/tour/nova_s0_account.mp3',
        view: ViewState.DASHBOARD,
        isAccountCreationStep: true,
        waitAfterAudio: 1500
    },
    {
        id: 1,
        title: '👋 ¡BIENVENIDA!',
        description: '¡Soy Nova! Tu puerta de entrada a la app del siglo 21. ¡Prepárate para una aventura inolvidable!',
        narratorText: '¡¡Hola!! ¡Qué alegría tenerte aquí! Soy Nova, tu asistente de aprendizaje inteligente. ¡Prepárate para una aventura inolvidable con la app del siglo 21! ¿Listo para despegar?',
        audioPath: '/audio/tour/nova_s1_welcome.mp3',
        view: ViewState.DASHBOARD,
        autoData: { showFullCampus: true },
        waitAfterAudio: 1000
    },
    {
        id: 2,
        title: '🎛️ CENTRO DE MANDO',
        description: '¡Control total! Sincronizamos **Google Classroom** para que organizar tus clases sea tan divertido como un juego espacial.',
        narratorText: '¡Comencemos en el Centro de Mando! Aquí tienes tus misiones, como esta de fracciones. Haz clic en la misión y te lleva directamente a la tutoría de matemáticas. Es muy importante la sección de evaluación: sube tu evaluación o toma una foto y Nova la guarda, creando misiones personalizadas para mejorar tu rendimiento. ¡Sincronizamos tu Google Classroom para que nunca pierdas el rumbo!',
        audioPath: '/audio/tour/nova_s2_commander.mp3',
        view: ViewState.TASK_CONTROL,
        autoData: { demoMode: true, showGoogleSync: true },
        waitAfterAudio: 1000
    },
    {
        id: 3,
        title: '➗ TUTORÍA DE MATEMÁTICAS',
        description: '¡La profesora explica! El tutor guía al niño para que **descubra** la solución por sí mismo.',
        narratorText: '¡La profe Lina te explica matemáticas! Mira cómo te guía paso a paso. Cuando termines, guarda la explicación en tu cuaderno.',
        audioPath: '/audio/tour/nova_s3_math_intro.mp3',
        view: ViewState.MATH_TUTOR,
        autoData: { demoMode: true, showStaticExample: true }
    },
    {
        id: 4,
        title: '📗 BIBLIOTECA DE CUADERNOS',
        description: 'Los cuadernos guardados en el estante.',
        narratorText: '¡Mira! Guardaste la explicación. Aquí está la biblioteca con tus cuadernos en el estante.',
        audioPath: '/audio/tour/nova_s6_library.mp3',
        view: ViewState.NOTEBOOK_LIBRARY,
        autoData: { demoMode: true, shelfNotebooks: ['math'] },
        hotspots: [
            { x: 20, y: 55, label: 'Explicación guardada', position: 'bottom' },
            { x: 50, y: 75, label: 'Tips del tutor', position: 'top' }
        ],
        waitAfterAudio: 1500
    },
    {
        id: 5,
        title: '⚡ TARJETAS MÁGICAS',
        description: '¡Se crean automáticamente! Para repasar lo que aprendiste.',
        narratorText: '¡Y se crearon las Tarjetas Mágicas! Para que repases en segundos. ¡Adiós al estrés de los exámenes!',
        audioPath: '/audio/tour/nova_s4_flashcards.mp3',
        view: ViewState.FLASHCARDS,
        autoData: { demoMode: true, mathFlashcards: true },
        waitAfterAudio: 1000
    },
    {
        id: 6,
        title: '🎛️ VUELVE AL CENTRO DE MANDO',
        description: 'Ahora una misión de investigación.',
        narratorText: '¡Vuelve al Centro de Mando! Aquí se crea una misión de investigación. Haz clic y te lleva al Centro de Investigación.',
        audioPath: '/audio/tour/nova_s2_missions.mp3',
        view: ViewState.TASK_CONTROL,
        autoData: { demoMode: true, showResearchMission: true },
        waitAfterAudio: 1000
    },
    {
        id: 7,
        title: '🔬 CENTRO DE INVESTIGACIÓN',
        description: 'Investiga con IA y crea reportes originales.',
        narratorText: '¡El Centro de Investigación! Aquí el niño hace su investigación. Después la guarda y se crea su cuaderno de ciencias.',
        view: ViewState.RESEARCH_CENTER,
        autoData: { demoMode: true, skipEntrance: true },
        hotspots: [
            { x: 15, y: 30, label: 'Asistente IA', position: 'right' },
            { x: 50, y: 60, label: 'Área de Investigación', position: 'top' }
        ],
        waitAfterAudio: 1000
    },
    {
        id: 8,
        title: '📙 BIBLIOTECA DE CUADERNOS',
        description: 'Matemáticas y Ciencias en el estante.',
        narratorText: '¡Mira! Se guardó lo que hizo el niño. Aquí está la biblioteca con sus cuadernos de matemáticas y ciencias.',
        audioPath: '/audio/tour/nova_s6_science.mp3',
        view: ViewState.NOTEBOOK_LIBRARY,
        autoData: { demoMode: true, shelfNotebooks: ['math', 'science'], scienceNotebookOpen: true },
        hotspots: [
            { x: 20, y: 55, label: 'Investigación guardada', position: 'bottom' }
        ],
        waitAfterAudio: 1500
    },
    {
        id: 9,
        title: '🇬🇧 CENTRO DE LENGUAS',
        description: '¡Domina el mundo bilingüe! Miss Rachelle te ayuda con vocabulario académico.',
        narratorText: 'Y para dominar el mundo bilingüe, visita el Centro de Lenguas con Miss Rachelle.',
        audioPath: '/audio/tour/nova_s7_english.mp3',
        view: ViewState.BUDDY_LEARN,
        autoData: { demoMode: true }
    },
    {
        id: 10,
        title: '🛍️ NOVA SHOP',
        description: '¡Tu esfuerzo vale oro! Compra accesorios épicos para tu Avatar con las Nova Coins que ganas estudiando.',
        narratorText: '¿El esfuerzo paga? ¡Claro que sí! En la Nova Shop puedes mejorar tu Avatar con las monedas que ganas estudiando. ¡Tú te lo ganaste con tu esfuerzo!',
        audioPath: '/audio/tour/nova_s8_shop.mp3',
        view: ViewState.REWARDS,
        autoData: { demoMode: true, openStore: true, defaultCategory: 'face', demoGlassesPurchase: true },
        waitAfterAudio: 3500
    },
    {
        id: 11,
        title: '🏹 ARENA NOVA',
        description: '¡Juega con un propósito! Salva el planeta real cumpliendo misiones épicas basadas en tu progreso académico.',
        narratorText: '¡Genial! Ahora lleva tu avatar a la Arena Nova. Aquí, tu progreso académico se convierte en misiones para salvar el planeta real. ¡Jugar con un propósito!',
        audioPath: '/audio/tour/nova_s9_arena.mp3',
        view: ViewState.ARENA,
        autoData: {
            demoMode: true,
            showGlobalMissions: true,
            openDoor: true, // MOSTRAR LAS MISIONES GLOBALES POR DEFECTO EN EL DEMO CON PUERTA
            globalMissions: [
                {
                    id: 'm-g5-1',
                    grade: 5,
                    title: '🌊 Limpieza de Océanos',
                    desc: 'Remueve plásticos del arrecife usando fracciones.',
                    reward: '500 Coins',
                    difficulty: 'Media',
                    guide: 'Fracciones'
                },
                {
                    id: 'm-g5-2',
                    grade: 5,
                    title: '🌳 Reforestación Amazonas',
                    desc: 'Calcula el área de siembra para salvar el pulmón del mundo.',
                    reward: '750 Coins',
                    difficulty: 'Alta',
                    guide: 'Geometría'
                },
                {
                    id: 'm-g5-3',
                    grade: 5,
                    title: '☀️ Energía Solar Neo-Tokio',
                    desc: 'Optimiza los paneles solares resolviendo porcentajes.',
                    reward: '350 Coins',
                    difficulty: 'Baja',
                    guide: 'Porcentajes'
                }
            ]
        },
        waitAfterAudio: 800
    },
    {
        id: 12,
        title: '👨‍👩‍👧‍👦 TORRE DE CONTROL',
        description: 'Los padres dan puntos y premios reales por labores de la casa: tender cama, lavar platos, ordenar cuarto… También premios como tiempo extra de pantalla o helado.',
        narratorText: 'Finalmente, tus padres tienen su propia Torre de Control. Aquí pueden darte puntos por las labores de la casa: tender la cama, lavar platos, ordenar tu cuarto y más. Además de monedas virtuales, pueden asignarte premios reales como tiempo extra de pantalla, helado o una salida al parque. Reciben reportes inteligentes y celebran cada uno de tus logros en este viaje seguro y feliz.',
        audioPath: '/audio/tour/nova_s10_parents.mp3',
        view: ViewState.PARENT_DASHBOARD,
        autoData: { demoMode: true, showCompletion: true },
        waitAfterAudio: 1200
    },
    {
        id: 13,
        title: '🚀 ¡BIENVENIDO AL FUTURO!',
        description: '¡Nova Schola ya es tu hogar! ¡Es hora de despegar hacia el éxito infinito!',
        narratorText: '¡Nova Skola ya es tu hogar! Bienvenidos al futuro de la educación. ¡Es hora de descubrir todo tu potencial infinito! ¡Nos vemos en clase!',
        audioPath: '/audio/tour/nova_s11_final.mp3',
        view: ViewState.DASHBOARD,
        autoData: { demoMode: true, showFullCampus: true }
    }
];

/** Presentación para colegio no bilingüe: solo Lina en matemáticas, Research/Inglés sin énfasis bilingüe. */
const DEMO_STEPS_STANDARD: DemoStep[] = [
    {
        id: 0,
        title: '📝 CÓMO CREAR TU CUENTA',
        description: 'Antes del recorrido, aprende cómo registrarte como padre o estudiante.',
        narratorText: '¡Hola! Antes de comenzar nuestro recorrido mágico, te explico rápido cómo crear tu cuenta. Puedes registrarte como estudiante para jugar y aprender, o como padre para ver el progreso. ¡Es súper fácil!',
        audioPath: '/audio/tour/nova_s0_account_dynamic.mp3', // Path ficticio
        view: ViewState.DASHBOARD,
        isAccountCreationStep: true,
        waitAfterAudio: 1500
    },
    {
        id: 1,
        title: '👋 ¡BIENVENIDA!',
        description: '¡Soy Nova! Tu puerta de entrada a la app del siglo 21. ¡Prepárate para una aventura inolvidable!',
        narratorText: '¡¡Hola!! ¡Qué alegría tenerte aquí! Soy la profe Lina. ¡Prepárate para una aventura inolvidable con la app del siglo 21! ¿Listo para despegar?',
        audioPath: '/audio/tour/nova_s1_welcome_dynamic.mp3', // Path ficticio
        view: ViewState.DASHBOARD,
        waitAfterAudio: 1000
    },
    {
        id: 2,
        title: '🎛️ CENTRO DE MANDO',
        description: '¡Control total! Sincronizamos **Google Classroom** para que organizar tus clases sea tan divertido como un juego espacial.',
        narratorText: '¡Comencemos en el Centro de Mando! Aquí tienes tus misiones. Es muy importante la sección de evaluación: sube tu evaluación o toma una foto y Nova la guarda. ¡Sincronizamos tu Google Classroom para que nunca pierdas el rumbo!',
        audioPath: '/audio/tour/nova_s2_commander_dynamic.mp3', // Path ficticio
        view: ViewState.TASK_CONTROL,
        autoData: { demoMode: true, showGoogleSync: true },
        waitAfterAudio: 1000
    },
    {
        id: 3,
        title: '➗ TUTORÍA DE MATEMÁTICAS',
        description: '¡La profesora explica! La profe Lina guía al niño para que **descubra** la solución.',
        narratorText: '¡La profe Lina te explica matemáticas! Mira cómo te guía paso a paso. Cuando termines, guarda la explicación en tu cuaderno.',
        audioPath: '/audio/tour/nova_s3_math_intro.mp3',
        view: ViewState.MATH_TUTOR,
        autoData: { demoMode: true, showStaticExample: true }
    },
    {
        id: 4,
        title: '📗 BIBLIOTECA DE CUADERNOS',
        description: 'Los cuadernos guardados en el estante.',
        narratorText: '¡Mira! Guardaste la explicación. Aquí está la biblioteca con tus cuadernos en el estante.',
        audioPath: '/audio/tour/nova_s6_library.mp3',
        view: ViewState.NOTEBOOK_LIBRARY,
        autoData: { demoMode: true, shelfNotebooks: ['math'] },
        hotspots: [
            { x: 20, y: 55, label: 'Explicación guardada', position: 'bottom' },
            { x: 50, y: 75, label: 'Tips del tutor', position: 'top' }
        ],
        waitAfterAudio: 1500
    },
    {
        id: 5,
        title: '⚡ TARJETAS MÁGICAS',
        description: '¡Se crean automáticamente! Para repasar lo que aprendiste.',
        narratorText: '¡Y se crearon las Tarjetas Mágicas! Para que repases en segundos. ¡Adiós al estrés de los exámenes!',
        audioPath: '/audio/tour/nova_s4_flashcards.mp3',
        view: ViewState.FLASHCARDS,
        autoData: { demoMode: true, mathFlashcards: true },
        waitAfterAudio: 1000
    },
    {
        id: 6,
        title: '🎛️ VUELVE AL CENTRO DE MANDO',
        description: 'Ahora una misión de investigación.',
        narratorText: '¡Vuelve al Centro de Mando! Aquí se crea una misión de investigación. Haz clic y te lleva al Centro de Investigación.',
        audioPath: '/audio/tour/nova_s2_missions.mp3',
        view: ViewState.TASK_CONTROL,
        autoData: { demoMode: true, showResearchMission: true },
        waitAfterAudio: 1000
    },
    {
        id: 7,
        title: '🔬 CENTRO DE INVESTIGACIÓN',
        description: 'Investiga con IA y crea reportes originales.',
        narratorText: '¡El Centro de Investigación! Aquí el niño hace su investigación. Después la guarda y se crea su cuaderno de ciencias.',
        view: ViewState.RESEARCH_CENTER,
        autoData: { demoMode: true, skipEntrance: true },
        hotspots: [
            { x: 15, y: 30, label: 'Asistente IA', position: 'right' },
            { x: 50, y: 60, label: 'Área de Investigación', position: 'top' }
        ],
        waitAfterAudio: 1000
    },
    {
        id: 8,
        title: '📙 BIBLIOTECA DE CUADERNOS',
        description: 'Matemáticas y Ciencias en el estante.',
        narratorText: '¡Mira! Se guardó lo que hizo el niño. Aquí está la biblioteca con sus cuadernos de matemáticas y ciencias.',
        audioPath: '/audio/tour/nova_s6_science.mp3',
        view: ViewState.NOTEBOOK_LIBRARY,
        autoData: { demoMode: true, shelfNotebooks: ['math', 'science'], scienceNotebookOpen: true },
        hotspots: [
            { x: 20, y: 55, label: 'Investigación guardada', position: 'bottom' }
        ],
        waitAfterAudio: 1500
    },
    {
        id: 9,
        title: '🇬🇧 CENTRO DE LENGUAS',
        description: 'Refuerza tu inglés con Miss Rachelle y mejora tu vocabulario académico.',
        narratorText: 'También puedes visitar el Centro de Lenguas con Miss Rachelle para reforzar tu vocabulario y brillar en clase.',
        audioPath: '/audio/tour/nova_s7_english.mp3',
        view: ViewState.BUDDY_LEARN,
        autoData: { demoMode: true }
    },
    {
        id: 10,
        title: '🛍️ NOVA SHOP',
        description: '¡Tu esfuerzo vale oro! Compra accesorios épicos para tu Avatar con las Nova Coins que ganas estudiando.',
        narratorText: '¿El esfuerzo paga? ¡Claro que sí! En la Nova Shop puedes mejorar tu Avatar con las monedas que ganas estudiando. ¡Tú te lo ganaste con tu esfuerzo!',
        audioPath: '/audio/tour/nova_s8_shop.mp3',
        view: ViewState.REWARDS,
        autoData: { demoMode: true, openStore: true, defaultCategory: 'face', demoGlassesPurchase: true },
        waitAfterAudio: 3500
    },
    {
        id: 11,
        title: '🏹 ARENA NOVA',
        description: '¡Juega con un propósito! Salva el planeta real cumpliendo misiones épicas basadas en tu progreso académico.',
        narratorText: '¡Genial! Ahora lleva tu avatar a la Arena Nova. Aquí, tu progreso académico se convierte en misiones para salvar el planeta real. ¡Jugar con un propósito!',
        audioPath: '/audio/tour/nova_s9_arena.mp3',
        view: ViewState.ARENA,
        autoData: {
            demoMode: true,
            showGlobalMissions: true,
            openDoor: true,
            globalMissions: [
                { id: 'm-g5-1', grade: 5, title: '🌊 Limpieza de Océanos', desc: 'Remueve plásticos del arrecife usando fracciones.', reward: '500 Coins', difficulty: 'Media', guide: 'Fracciones' },
                { id: 'm-g5-2', grade: 5, title: '🌳 Reforestación Amazonas', desc: 'Calcula el área de siembra para salvar el pulmón del mundo.', reward: '750 Coins', difficulty: 'Alta', guide: 'Geometría' },
                { id: 'm-g5-3', grade: 5, title: '☀️ Energía Solar Neo-Tokio', desc: 'Optimiza los paneles solares resolviendo porcentajes.', reward: '350 Coins', difficulty: 'Baja', guide: 'Porcentajes' }
            ]
        },
        waitAfterAudio: 800
    },
    {
        id: 12,
        title: '👨‍👩‍👧‍👦 TORRE DE CONTROL',
        description: 'Los padres dan puntos y premios reales por labores de la casa: tender cama, lavar platos, ordenar cuarto… También premios como tiempo extra de pantalla o helado.',
        narratorText: 'Finalmente, tus padres tienen su propia Torre de Control. Aquí pueden darte puntos por las labores de la casa: tender la cama, lavar platos, ordenar tu cuarto y más. Además de monedas virtuales, pueden asignarte premios reales como tiempo extra de pantalla, helado o una salida al parque. Reciben reportes inteligentes y celebran cada uno de tus logros en este viaje seguro y feliz.',
        audioPath: '/audio/tour/nova_s10_parents.mp3',
        view: ViewState.PARENT_DASHBOARD,
        autoData: { demoMode: true, showCompletion: true },
        waitAfterAudio: 1200
    },
    {
        id: 13,
        title: '🚀 ¡BIENVENIDO AL FUTURO!',
        description: '¡Nova Schola ya es tu hogar! ¡Es hora de despegar hacia el éxito infinito!',
        narratorText: '¡Nova Skola ya es tu hogar! Bienvenidos al futuro de la educación. ¡Es hora de descubrir todo tu potencial infinito! ¡Nos vemos en clase!',
        audioPath: '/audio/tour/nova_s11_final.mp3',
        view: ViewState.DASHBOARD,
        autoData: { demoMode: true }
    }
];

export function DemoTourProvider({ children }: { children: React.ReactNode; userName?: string }) {
    const [tourState, setTourState] = useState<DemoTourState>({
        isActive: false,
        currentStep: 0,
        totalSteps: DEMO_STEPS_BILINGUAL.length,
        steps: DEMO_STEPS_BILINGUAL,
        variant: 'bilingual'
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);
    /** Prevents double play when effect runs twice (e.g. React Strict Mode or concurrent re-run). */
    const playedForStepRef = useRef<number>(0);

    const stopAllAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.onended = null;
            audioRef.current.onerror = null;
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current = null;
        }
        stopNativeSpeaking();
    }, []);

    const endTour = useCallback(() => {
        stopAllAudio();
        playedForStepRef.current = 0;
        setTourState(prev => ({ ...prev, isActive: false, currentStep: 0 }));
        localStorage.removeItem('nova_demo_mode');
        // Reset avatar sin gafas para que al volver a iniciar el demo, Sofia empiece sin gafas
        window.dispatchEvent(new CustomEvent('nova-demo-end'));
    }, [stopAllAudio]);

    const startTour = useCallback((opts?: { variant?: DemoVariant }) => {
        stopAllAudio();
        playedForStepRef.current = 0;
        const variant: DemoVariant = opts?.variant ?? (typeof localStorage !== 'undefined' && localStorage.getItem('nova_immersion_mode') === 'standard' ? 'standard' : 'bilingual');
        const steps = variant === 'standard' ? DEMO_STEPS_STANDARD : DEMO_STEPS_BILINGUAL;
        setTourState({
            isActive: true,
            currentStep: 1,
            totalSteps: steps.length,
            steps,
            variant
        });
        localStorage.setItem('nova_demo_mode', 'true');
        const avatarPayload = { detail: { avatarId: 'g5_girl_1', grade: 5 } };
        window.dispatchEvent(new CustomEvent('nova-demo-avatar-set', avatarPayload));
        // Preload audios importantes para evitar trabas en móvil
        if (typeof window !== 'undefined') {
            const audioPathsToPreload = [
                steps[0]?.audioPath,
                steps[1]?.audioPath,
                '/audio/lina/math_intro_frac.mp3',
                '/audio/rachelle/math_intro_frac.mp3',
                '/audio/tour/nova_s8_shop.mp3'
            ].filter(Boolean);
            audioPathsToPreload.forEach(path => {
                if (path) {
                    const preload = new Audio(path);
                    preload.preload = 'auto';
                    preload.load();
                }
            });
        }
    }, [stopAllAudio]);

    const nextStep = useCallback(() => {
        if (tourState.currentStep < tourState.totalSteps) {
            setTourState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
        } else {
            endTour();
        }
    }, [tourState.currentStep, tourState.totalSteps, endTour]);

    const previousStep = useCallback(() => {
        if (tourState.currentStep > 1) {
            setTourState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
            stopAllAudio();
        }
    }, [tourState.currentStep, stopAllAudio]);

    const getCurrentStepData = useCallback((): DemoStep | null => {
        if (tourState.currentStep === 0) return null;
        return tourState.steps[tourState.currentStep - 1] || null;
    }, [tourState.currentStep, tourState.steps]);

    // 🎙️ CENTRAL SEQUENTIAL ENGINE (diferido en móvil para no trabar el thread)
    useEffect(() => {
        if (!tourState.isActive || tourState.currentStep === 0) return;

        // Prevent double play when this effect runs twice for the same step (e.g. library phrase repeating)
        if (playedForStepRef.current === tourState.currentStep) return;
        playedForStepRef.current = tourState.currentStep;

        const timers: any[] = [];
        let cancelled = false;

        const runStep = () => {
            if (cancelled || !tourState.isActive || tourState.currentStep === 0) return;
            const step = tourState.steps[tourState.currentStep - 1];
            if (!step) return;

            const playStepAudio = (path: string, onEnd: () => void, opts?: { highlightEvaluationAt?: number; useRafForPlay?: boolean }) => {
                const url = `${path}?v=${Date.now()}`;
                const audio = new Audio(url);
                audioRef.current = audio;
                audio.preload = 'auto';

                const isLina = path.includes('lina_') || path.includes('interaccion');
                const isRachelle = path.includes('rachelle_');
                const isGuardian = path.includes('guardian_');
                const voiceType = isLina ? 'lina' : isRachelle ? 'rachelle' : isGuardian ? 'onyx' : 'nova';

                window.dispatchEvent(new CustomEvent('nova-demo-voice', { detail: { voice: voiceType, lang: 'es' } }));

                let hlTimer: ReturnType<typeof setTimeout> | null = null;
                if (opts?.highlightEvaluationAt != null) {
                    hlTimer = setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('nova-demo-highlight-evaluation'));
                    }, opts.highlightEvaluationAt);
                    timers.push(hlTimer);
                }

                const cleanup = () => {
                    if (hlTimer) window.dispatchEvent(new CustomEvent('nova-demo-highlight-evaluation-end'));
                    window.dispatchEvent(new CustomEvent('nova-demo-voice-end'));
                };

                const doPlay = () => {
                    const play = () => {
                        const playPromise = audio.play();
                        if (playPromise !== undefined) {
                            playPromise
                                .then(() => {
                                    // Play started successfully
                                })
                                .catch(e => {
                                    console.warn("Play blocked/interrupted:", e);
                                    // En móvil, si falla el play inicial (autoplay policy), intentamos una vez más con un delay corto
                                    // si falla de nuevo, terminamos el paso para no bloquear
                                    setTimeout(() => {
                                        audio.play().catch(() => {
                                            cleanup();
                                            onEnd();
                                        });
                                    }, 300);
                                });
                        }
                    };

                    // Doble rAF para asegurar que el DOM esté listo y el thread liberado en móviles
                    if (opts?.useRafForPlay && typeof requestAnimationFrame !== 'undefined') {
                        requestAnimationFrame(() => requestAnimationFrame(play));
                    } else {
                        play();
                    }
                };

                audio.onended = () => {
                    if (!tourState.isActive) return;
                    cleanup();
                    onEnd();
                };

                audio.onerror = () => {
                    cleanup();
                    console.error("Audio failed:", path);
                    onEnd();
                };

                const READY_TIMEOUT_MS = 12000;
                let played = false;
                const onReady = () => {
                    if (played) return;
                    played = true;
                    audio.removeEventListener('canplaythrough', onReady);
                    audio.removeEventListener('loadeddata', onReady);
                    clearTimeout(readyTimeout);
                    doPlay();
                };
                const readyTimeout = setTimeout(onReady, READY_TIMEOUT_MS);
                timers.push(readyTimeout);

                if (audio.readyState >= 3) {
                    onReady();
                } else {
                    audio.addEventListener('canplaythrough', onReady);
                    audio.addEventListener('loadeddata', onReady);
                    audio.load();
                }
            };

            /** Usa el TTS del navegador (vía edgeTTS) para voces animadas */
            const playDemoSpeech = (text: string, voiceId: 'lina' | 'rachelle', onEnd: () => void) => {
                const lang = voiceId === 'lina' ? 'es' : 'en';
                generateSpeech(text, voiceId)
                    .then(() => {
                        if (!tourState.isActive) return;
                        onEnd();
                    })
                    .catch(() => {
                        // Fallback a ttsService antiguo si edgeTTS falla
                        ttsService.updateSettings(8, lang);
                        ttsService.speak(text, onEnd);
                    });
            };

            const handleStepEnd = () => {
                if (tourState.currentStep === tourState.totalSteps) {
                    endTour();
                    return;
                }

                const delay = step.waitAfterAudio || 500;
                const timer = setTimeout(() => {
                    if (tourState.isActive) {
                        if (tourState.currentStep < tourState.totalSteps) {
                            setTourState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
                        } else {
                            endTour();
                        }
                    }
                }, delay);
                timers.push(timer);
            };

            // --- STEP LOGIC ---
            if (tourState.currentStep === 4) {
                // MATH DEMO: Intro con voz Lina (ElevenLabs) → fracciones, MCM → cierre → Rachel al final
                if (!tourState.isActive) return;

                // 1) Voz Lina: Introducción Math (fracciones) - Restauramos la voz original de ElevenLabs
                const linaPath = '/audio/lina/tutor_math_1.mp3';
                const LINA_MATH_INTRO_TEXT = "¡Hola mi niño, hola campeón! Soy Lina. Vamos a sumar estas fracciones. Mira con atención el número de abajo, el Denominador. ¿Qué es lo primero que debemos hacer?";
                const RACHELLE_AUDIO = '/audio/rachelle/math_intro_frac.mp3';

                const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
                const initialDelay = isMobile ? 2200 : 200;

                const playMathAudio = (url: string, voice: string, onEnd: () => void, fallbackText?: string) => {
                    const a = new Audio(`${url}?v=${Date.now()}`);
                    a.preload = 'auto';
                    let played = false;
                    const doPlay = () => {
                        if (played) return;
                        played = true;
                        a.removeEventListener('canplaythrough', doPlay);
                        a.removeEventListener('loadeddata', doPlay);

                        if (isMobile) {
                            requestAnimationFrame(() => requestAnimationFrame(() => {
                                a.play().catch(() => handleFallback());
                            }));
                        } else {
                            a.play().catch(() => handleFallback());
                        }
                    };

                    const handleFallback = () => {
                        if (fallbackText) {
                            playDemoSpeech(fallbackText, voice as any, () => {
                                window.dispatchEvent(new CustomEvent('nova-demo-voice-end'));
                                onEnd();
                            });
                        } else {
                            window.dispatchEvent(new CustomEvent('nova-demo-voice-end'));
                            onEnd();
                        }
                    };

                    a.onended = () => {
                        window.dispatchEvent(new CustomEvent('nova-demo-voice-end'));
                        onEnd();
                    };
                    a.onerror = handleFallback;

                    if (a.readyState >= 3) doPlay();
                    else {
                        a.addEventListener('canplaythrough', doPlay);
                        a.addEventListener('loadeddata', doPlay);
                        a.load();
                    }
                };

                const startTimer = setTimeout(() => {
                    if (cancelled || !tourState.isActive) return;

                    window.dispatchEvent(new CustomEvent('nova-demo-voice', { detail: { voice: 'lina', lang: 'es' } }));
                    window.dispatchEvent(new CustomEvent('nova-demo-math-phase', { detail: { phase: 'table' } }));

                    // Usamos TTS dinámico para Lina también (para que las mejoras de accent de Mexicano funcionen)
                    playDemoSpeech(LINA_MATH_INTRO_TEXT, 'lina', () => {
                        if (!tourState.isActive) return;

                        const highlightTimer = setTimeout(() => {
                            if (!tourState.isActive) return;
                            window.dispatchEvent(new CustomEvent('nova-demo-math-phase', { detail: { phase: 'highlight' } }));
                        }, 300);
                        timers.push(highlightTimer);

                        if (tourState.variant === 'bilingual') {
                            const rachelleDelay = setTimeout(() => {
                                if (!tourState.isActive) return;
                                window.dispatchEvent(new CustomEvent('nova-demo-voice', { detail: { voice: 'rachelle', lang: 'en' } }));

                                const RACHELLE_TEXT = "I can help you with the problem too! Exactly! That's brilliant. We find the Common Denominator. In English, we call it the Least Common Multiple.";

                                // Usamos TTS dinámico para Rachel para asegurar la frase exacta solicitada
                                playDemoSpeech(RACHELLE_TEXT, 'rachelle', () => {
                                    if (tourState.isActive) {
                                        handleStepEnd();
                                    }
                                });
                            }, 800);
                            timers.push(rachelleDelay);
                        } else {
                            handleStepEnd();
                        }
                    });
                }, 200); // Standardize delay
                timers.push(startTimer);
            }
            else if (tourState.currentStep === 8) {
                // RESEARCH CENTER: 1) Introducción presentadora, 2) Avatar (voz profunda y robotizada en español - Azure)
                const INTRO = '/audio/tour/nova_s5_bilingual.mp3';
                const avatarGreeting = "Yo soy el director de investigación y te voy a ayudar con tu tarea.";
                const playUrlWhenReady = (url: string, onEnd: () => void) => {
                    const a = new Audio(`${url}?v=${Date.now()}`);
                    a.preload = 'auto';
                    let played = false;
                    const doPlay = () => {
                        if (played) return;
                        played = true;
                        a.removeEventListener('canplaythrough', doPlay);
                        a.removeEventListener('loadeddata', doPlay);
                        a.play().catch(() => onEnd());
                    };
                    a.onended = onEnd;
                    a.onerror = () => onEnd();
                    if (a.readyState >= 3) doPlay();
                    else {
                        a.addEventListener('canplaythrough', doPlay);
                        a.addEventListener('loadeddata', doPlay);
                        a.load();
                    }
                };
                // 1) Presentadora introduce el Centro de Investigación
                window.dispatchEvent(new CustomEvent('nova-demo-voice', { detail: { voice: 'nova', lang: 'es' } }));
                playUrlWhenReady(INTRO, () => {
                    if (!tourState.isActive) return;
                    window.dispatchEvent(new CustomEvent('nova-demo-voice-end'));
                    // 2) Avatar Station (voz profunda y robotizada - ahora vía edgeTTS)
                    window.dispatchEvent(new CustomEvent('nova-demo-voice', { detail: { voice: 'onyx', lang: 'es' } }));
                    generateSpeech(avatarGreeting, 'lina').then(() => {
                        if (tourState.isActive) {
                            window.dispatchEvent(new CustomEvent('nova-demo-voice-end'));
                            handleStepEnd();
                        }
                    }).catch(() => {
                        // Fallback a ttsService
                        ttsService.setVoiceProfile('station');
                        ttsService.updateSettings(8, 'es');
                        ttsService.speak(avatarGreeting, () => {
                            ttsService.setVoiceProfile('default');
                            if (tourState.isActive) {
                                window.dispatchEvent(new CustomEvent('nova-demo-voice-end'));
                                handleStepEnd();
                            }
                        });
                    });
                });
            }
            else if (tourState.currentStep === 10) {
                // ENGLISH CENTER: 1) Presentadora introduce, 2) Miss Rachel da la bienvenida
                const INTRO = step.audioPath || '/audio/tour/nova_s7_english.mp3';
                const rachelWelcome = "Hi! I'm Miss Rachelle. Welcome to the English Center! I'm here to help you master English.";
                const playUrlWhenReady = (url: string, onEnd: () => void) => {
                    const a = new Audio(`${url}?v=${Date.now()}`);
                    a.preload = 'auto';
                    let played = false;
                    const doPlay = () => {
                        if (played) return;
                        played = true;
                        a.removeEventListener('canplaythrough', doPlay);
                        a.removeEventListener('loadeddata', doPlay);
                        a.play().catch(() => onEnd());
                    };
                    a.onended = onEnd;
                    a.onerror = () => onEnd();
                    if (a.readyState >= 3) doPlay();
                    else {
                        a.addEventListener('canplaythrough', doPlay);
                        a.addEventListener('loadeddata', doPlay);
                        a.load();
                    }
                };
                // 1) Presentadora introduce el Centro de Inglés
                window.dispatchEvent(new CustomEvent('nova-demo-voice', { detail: { voice: 'nova', lang: 'es' } }));
                playUrlWhenReady(INTRO, () => {
                    if (!tourState.isActive) return;
                    window.dispatchEvent(new CustomEvent('nova-demo-voice-end'));
                    // 2) Miss Rachel da la bienvenida
                    window.dispatchEvent(new CustomEvent('nova-demo-voice', { detail: { voice: 'rachelle', lang: 'en' } }));
                    playDemoSpeech(rachelWelcome, 'rachelle', () => {
                        if (tourState.isActive) {
                            window.dispatchEvent(new CustomEvent('nova-demo-voice-end'));
                            handleStepEnd();
                        }
                    });
                });
            }
            else {
                // NORMAL SEQUENTIAL STEP
                if (step.audioPath) {
                    const opts = tourState.currentStep === 3 ? { highlightEvaluationAt: 12000 } : undefined;
                    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
                    const isFirstAudioStep = tourState.currentStep === 1;
                    const isSecondStep = tourState.currentStep === 2;
                    // Móvil: más delay al inicio para que la presentadora no se trabe; delay corto en cada paso para que pinte la vista
                    // Paso 1 (Bienvenida): delay extra largo en móvil (1500ms) para asegurar que la UI esté lista
                    // Paso 2 (Centro de Mando): delay medio en móvil (600ms) para transición suave
                    const delayBeforeFirstAudio = isFirstAudioStep ? 400 : 0;
                    const delayBeforeSecondStep = isSecondStep ? 200 : 0;
                    const delayBeforeOtherOnMobile = 0;
                    const delayMs = delayBeforeFirstAudio || delayBeforeSecondStep || delayBeforeOtherOnMobile;
                    const playOpts = (isFirstAudioStep || isSecondStep) && isMobile ? { ...opts, useRafForPlay: true } : opts;
                    if (delayMs > 0) {
                        const t = setTimeout(() => {
                            if (cancelled || !tourState.isActive) return;
                            playStepAudio(step.audioPath!, handleStepEnd, playOpts);
                        }, delayMs);
                        timers.push(t);
                    } else {
                        playStepAudio(step.audioPath, handleStepEnd, playOpts);
                    }
                } else {
                    handleStepEnd();
                }
            }

        }; // end runStep

        const cleanup = () => {
            if (audioRef.current) {
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current = null;
            }
            timers.forEach(t => clearTimeout(t));
        };

        runStep();
        return cleanup;
    }, [tourState.isActive, tourState.currentStep, tourState.variant, endTour]);

    // 🎊 CELEBRATORY EFFECTS: confetti al entrar al paso Tienda
    useEffect(() => {
        if (!tourState.isActive || tourState.currentStep !== 11) return;
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF1493', '#00BFFF', '#FFD700']
        });
    }, [tourState.currentStep, tourState.isActive]);

    return (
        <DemoTourContext.Provider value={{ tourState, startTour, nextStep, previousStep, endTour, getCurrentStepData }}>
            {children}
        </DemoTourContext.Provider>
    );
}

export function useDemoTour() {
    const context = useContext(DemoTourContext);
    return context ?? DEFAULT_DEMO_CONTEXT;
}
