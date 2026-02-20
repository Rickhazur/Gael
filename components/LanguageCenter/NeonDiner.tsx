import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { edgeTTS } from '@/services/edgeTTS';
import {
    Coffee,
    UtensilsCrossed,
    Star,
    CheckCircle2,
    ArrowLeft,
    Zap,
    Clock,
    MessageSquare,
    Users,
    Award,
    Mic,
    MicOff,
    Volume2,
    Sparkles,
    ShoppingBag,
    ChefHat,
    Stethoscope,
    Settings,
    ShieldCheck,
    Briefcase,
    HeartPulse,
    Wrench,
    Map,
    Info,
    X,
    Languages,
    Coins,
    ChevronRight,
    Trophy as TrophyIcon
} from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';

// --- ASSETS ---
const hexToEmoji = (hex: string) => {
    if (!hex) return '❓';
    return hex.split('-').map(part => String.fromCodePoint(parseInt(part, 16))).join('');
};

const TRANSLATIONS: Record<string, string> = {
    // Food & Diner - Main Dishes
    'Burger': 'Hamburguesa',
    'Pizza': 'Pizza',
    'Chicken': 'Pollo',
    'Fries': 'Papas Fritas',
    'Tacos': 'Tacos',
    'Sandwich': 'Sandwich',
    'Hot dog': 'Perro Caliente',
    'Mac and cheese': 'Macarrones con queso',
    // Food & Diner - Fruits & Veggies
    'Apple': 'Manzana',
    'Banana': 'Banana',
    'Orange': 'Naranja',
    'Grapes': 'Uvas',
    'Strawberries': 'Fresas',
    'Carrots': 'Zanahorias',
    'Broccoli': 'Brócoli',
    'Corn': 'Maíz',
    'Salad': 'Ensalada',
    // Food & Diner - Desserts & Drinks
    'Shake': 'Batido',
    'Coffee': 'Café',
    'Donut': 'Dona',
    'Cake': 'Pastel',
    'Cookie': 'Galleta',
    'Ice cream': 'Helado',
    'Brownie': 'Brownie',
    'Cupcake': 'Cupcake',
    'Water': 'Agua',
    'Milk': 'Leche',
    'Juice': 'Jugo',
    'Soda': 'Gaseosa',
    // Food & Diner - Restaurant Terms
    'Order': 'Pedido',
    'Menu': 'Menú',
    'Table': 'Mesa',
    'Plate': 'Plato',
    'Cup': 'Vaso',
    'Fork': 'Tenedor',
    'Spoon': 'Cuchara',
    'Knife': 'Cuchillo',
    'Napkin': 'Servilleta',
    'Hungry': 'Hambriento',
    'Yummy': 'Rico / Sabroso',
    'Delicious': 'Delicioso',
    'Gross': 'Asqueroso',
    'Spicy': 'Picante',
    'Sweet': 'Dulce',
    'Salty': 'Salado',
    // Medical - Body
    'Head': 'Cabeza',
    'Stomach': 'Estómago',
    'Tummy': 'Pancita',
    'Arm': 'Brazo',
    'Leg': 'Pierna',
    'Back': 'Espalda',
    'Throat': 'Garganta',
    'Tooth': 'Diente',
    'Teeth': 'Dientes',
    // Medical - Symptoms
    'Pain': 'Dolor',
    'Hurt': 'Duele',
    'Fever': 'Fiebre',
    'Cough': 'Tos',
    'Cold': 'Resfriado',
    'Headache': 'Dolor de cabeza',
    'Stomachache': 'Dolor de estómago',
    'Toothache': 'Dolor de muela',
    'Vomit': 'Vomitar',
    'Dizzy': 'Mareado',
    'Tired': 'Cansado',
    'Sleepy': 'Con sueño',
    'Itchy': 'Pica',
    'Swollen': 'Hinchado',
    'Bruise': 'Moretón',
    'Cut': 'Cortada',
    'Bleeding': 'Sangrando',
    'Rash': 'Erupción / Ronchas',
    'Sick': 'Enfermo',
    'Allergic': 'Alérgico',
    // Medical - Treatments & Tools
    'Medicine': 'Medicina',
    'Pill': 'Pastilla',
    'Syrup': 'Jarabe',
    'Bandage': 'Venda',
    'Shot': 'Vacuna / Inyección',
    'Scanner': 'Escáner',
    'Thermometer': 'Termómetro',
    'Inhaler': 'Inhalador',
    'Ice': 'Hielo',
    'Mask': 'Mascarilla',
    'Glasses': 'Lentes',
    // Medical - Places & People
    'Doctor': 'Doctor',
    'Nurse': 'Enfermera',
    'Dentist': 'Dentista',
    'Hospital': 'Hospital',
    'Clinic': 'Clínica',
    // Medical - General
    'Healthy': 'Saludable',
    'Germs': 'Gérmenes',
    'Rest': 'Descansar',
    'Heart': 'Corazón',
    'Temperature': 'Temperatura',
    // Mechanic - Tools
    'Hammer': 'Martillo',
    'Screwdriver': 'Destornillador',
    'Wrench': 'Llave Inglesa',
    'Pliers': 'Pinzas',
    'Tape measure': 'Cinta métrica',
    'Level': 'Nivel',
    'Drill': 'Taladro',
    'Saw': 'Sierra',
    'Scissors': 'Tijeras',
    'Nails': 'Clavos',
    'Screws': 'Tornillos',
    'Wood': 'Madera',
    // Mechanic - Fixing & Workshop
    'Broom': 'Escoba',
    'Mop': 'Trapeador',
    'Bucket': 'Balde',
    'Sponge': 'Esponja',
    'Toolbox': 'Caja de herramientas',
    'Ladder': 'Escalera',
    'Flashlight': 'Linterna',
    'Gloves': 'Guantes',
    'Goggles': 'Gafas de seguridad',
    'Hard hat': 'Casco',
    // Mechanic - General
    'Broken': 'Roto',
    'Fix': 'Reparar / Arreglar',
    'Engine': 'Motor',
    'Battery': 'Batería',
    'Gear': 'Engranaje',
    'Bolt': 'Tornillo',
    'Magnet': 'Imán'
};

interface CareerTool {
    id: string;
    name: string;
    hex: string;
    category: string;
}

interface CareerMission {
    id: string;
    customer: string;
    text: string;
    targetTools: string[];
    correctResponse: string;
    responses: { text: string, es: string }[];
    difficulty: number; // 1 to 5
    vocabFocus: string[];
}

interface Career {
    id: string;
    name: string;
    icon: any;
    color: string;
    accent: string;
    description: string;
    tools: CareerTool[];
    missions: CareerMission[];
}

const CAREERS: Career[] = [
    {
        id: 'diner',
        name: 'CYBER CHEF',
        icon: ChefHat,
        color: 'from-pink-500 to-rose-700',
        accent: 'pink',
        description: 'Serve the future with delicious vocabulary and recipes.',
        tools: [
            { id: 'burger', name: 'Burger', hex: '1f354', category: 'Main' },
            { id: 'pizza', name: 'Pizza', hex: '1f355', category: 'Main' },
            { id: 'tacos', name: 'Tacos', hex: '1f32e', category: 'Main' },
            { id: 'fries', name: 'Fries', hex: '1f35f', category: 'Sides' },
            { id: 'apple', name: 'Apple', hex: '1f34e', category: 'Fruit' },
            { id: 'broccoli', name: 'Broccoli', hex: '1f966', category: 'Veggies' },
            { id: 'icecream', name: 'Ice cream', hex: '1f366', category: 'Dessert' },
            { id: 'juice', name: 'Juice', hex: '1f9c3', category: 'Drinks' },
            { id: 'water', name: 'Water', hex: '1f964', category: 'Drinks' }
        ],
        missions: [
            {
                id: 'd1',
                customer: 'Spark',
                text: "Hello! I am very hungry. I want a Burger and some Fries, please.",
                targetTools: ['burger', 'fries'],
                correctResponse: "Sure! Coming right up.",
                responses: [
                    { text: "Sure! Coming right up.", es: "¡Claro! Enseguida sale." },
                    { text: "No, we don't have that.", es: "No, no tenemos eso." },
                    { text: "Hello!", es: "¡Hola!" }
                ],
                difficulty: 1,
                vocabFocus: ['Hungry', 'Burger', 'Fries']
            },
            {
                id: 'd2',
                customer: 'Officer Alex',
                text: "Everything looks delicious! I want a Pizza and some Juice.",
                targetTools: ['pizza', 'juice'],
                correctResponse: "One hot pizza coming your way.",
                responses: [
                    { text: "One hot pizza coming your way.", es: "Una pizza caliente en camino." },
                    { text: "Pizza is round.", es: "La pizza es redonda." },
                    { text: "Wait for your turn.", es: "Espera tu turno." }
                ],
                difficulty: 2,
                vocabFocus: ['Delicious', 'Pizza', 'Juice']
            },
            {
                id: 'd3',
                customer: 'Robot Ollie',
                text: "I do not like Broccoli. It is gross! Can I have a Taco and an Apple?",
                targetTools: ['tacos', 'apple'],
                correctResponse: "No broccoli for you! Here are your items.",
                responses: [
                    { text: "No broccoli for you! Here are your items.", es: "¡Sin brócoli para ti! Aquí tienes." },
                    { text: "Eat your vegetables.", es: "Come tus vegetales." },
                    { text: "Beep boop.", es: "Beep boop." }
                ],
                difficulty: 3,
                vocabFocus: ['Broccoli', 'Gross', 'Tacos', 'Apple']
            },
            {
                id: 'd4',
                customer: 'Citizen Sam',
                text: "Yummy! Can we get Ice cream for dessert? And some Water too.",
                targetTools: ['icecream', 'water'],
                correctResponse: "Sweet choice! Enjoy your dessert.",
                responses: [
                    { text: "Sweet choice! Enjoy your dessert.", es: "¡Dulce elección! Disfruta tu postre." },
                    { text: "It is too cold.", es: "Está muy frío." },
                    { text: "Follow the rules.", es: "Sigue las reglas." }
                ],
                difficulty: 4,
                vocabFocus: ['Yummy', 'Ice cream', 'Water']
            },
            {
                id: 'd5',
                customer: 'Gourmet Gus',
                text: "The salad is very fresh but I want something spicy. Give me Tacos and Juice!",
                targetTools: ['tacos', 'juice'],
                correctResponse: "Of course! Our spicy tacos are the best in the sector.",
                responses: [
                    { text: "Of course! Our spicy tacos are the best in the sector.", es: "¡Claro! Nuestros tacos son los mejores." },
                    { text: "Don't eat too much.", es: "No comas demasiado." },
                    { text: "I prefer pizza.", es: "Prefiero la pizza." }
                ],
                difficulty: 5,
                vocabFocus: ['Salad', 'Spicy', 'Fresh', 'Tacos']
            }
        ]
    },
    {
        id: 'medical',
        name: 'SPACE DOCTOR',
        icon: Stethoscope,
        color: 'from-cyan-500 to-blue-700',
        accent: 'cyan',
        description: 'Heal citizens with the best medical vocabulary.',
        tools: [
            { id: 'pill', name: 'Pill', hex: '1f48a', category: 'Medicine' },
            { id: 'bandage', name: 'Bandage', hex: '1fa79', category: 'First Aid' },
            { id: 'scanner', name: 'Scanner', hex: '1f4f1', category: 'Tools' },
            { id: 'syringe', name: 'Syringe', hex: '1f489', category: 'Medicine' },
            { id: 'thermometer', name: 'Thermometer', hex: '1f321', category: 'Tools' },
            { id: 'medicine', name: 'Medicine', hex: '1f37c', category: 'Medicine' },
            { id: 'mask', name: 'Mask', hex: '1f637', category: 'Protection' },
            { id: 'ice', name: 'Ice', hex: '2744', category: 'Care' },
            { id: 'inhaler', name: 'Inhaler', hex: '1f4a8', category: 'Care' }
        ],
        missions: [
            {
                id: 'm1',
                customer: 'Officer Alex',
                text: "My arm hurts after the mission. I need a Scanner and a Bandage.",
                targetTools: ['scanner', 'bandage'],
                correctResponse: "Relax, let me help you with that.",
                responses: [
                    { text: "Relax, let me help you with that.", es: "Relájate, déjame ayudarte." },
                    { text: "You need sleep.", es: "Necesitas dormir." },
                    { text: "Drink water.", es: "Bebe agua." }
                ],
                difficulty: 1,
                vocabFocus: ['Hurt', 'Arm', 'Scanner', 'Bandage']
            },
            {
                id: 'm2',
                customer: 'Citizen Luna',
                text: "My stomach hurts. I feel sick. I think I need some medicine.",
                targetTools: ['medicine', 'pill'],
                correctResponse: "Don't worry, this will make you feel better.",
                responses: [
                    { text: "Don't worry, this will make you feel better.", es: "No te preocupes, te sentirás mejor." },
                    { text: "Eat an apple.", es: "Come una manzana." },
                    { text: "Go to school.", es: "Ve a la escuela." }
                ],
                difficulty: 2,
                vocabFocus: ['Stomach', 'Hurt', 'Sick', 'Medicine']
            },
            {
                id: 'm3',
                customer: 'Robot Ollie',
                text: "Beep! My temperature is too high. I have a fever. I need a Thermometer and a Pill.",
                targetTools: ['thermometer', 'pill'],
                correctResponse: "Stay still while I check your systems.",
                responses: [
                    { text: "Stay still while I check your systems.", es: "Quieto mientras reviso tus sistemas." },
                    { text: "Rebooting now.", es: "Reiniciando ahora." },
                    { text: "Beep boop.", es: "Beep boop." }
                ],
                difficulty: 3,
                vocabFocus: ['Temperature', 'Fever', 'Pill']
            },
            {
                id: 'm4',
                customer: 'Spark',
                text: "I fell down! My leg is bleeding and I have a big bruise.",
                targetTools: ['bandage', 'scanner'],
                correctResponse: "I will clean your leg and put a bandage.",
                responses: [
                    { text: "I will clean your leg and put a bandage.", es: "Limpiaré tu pierna y pondré una venda." },
                    { text: "Run faster next time.", es: "Corre más rápido la próxima vez." },
                    { text: "Look at the stars.", es: "Mira las estrellas." }
                ],
                difficulty: 4,
                vocabFocus: ['Leg', 'Bleeding', 'Bruise', 'Bandage']
            },
            {
                id: 'm5',
                customer: 'Patient Pete',
                text: "I am allergic to dust! I feel dizzy and my arm is swollen and itchy.",
                targetTools: ['medicine', 'scanner'],
                correctResponse: "We must analyze the allergic reaction immediately.",
                responses: [
                    { text: "We must analyze the allergic reaction immediately.", es: "Debemos analizar la reacción ya." },
                    { text: "Try to sneeze.", es: "Intenta estornudar." },
                    { text: "Wear a jacket.", es: "Usa una chaqueta." }
                ],
                difficulty: 5,
                vocabFocus: ['Allergic', 'Dizzy', 'Swollen', 'Itchy']
            }
        ]
    },
    {
        id: 'workshop',
        name: 'ROBO MECHANIC',
        icon: Wrench,
        color: 'from-amber-500 to-orange-700',
        accent: 'amber',
        description: 'Fix the future with engineering and tool vocabulary.',
        tools: [
            { id: 'hammer', name: 'Hammer', hex: '1f528', category: 'Basic' },
            { id: 'wrench', name: 'Wrench', hex: '1f527', category: 'Basic' },
            { id: 'screwdriver', name: 'Screwdriver', hex: '1fa9b', category: 'Basic' },
            { id: 'drill', name: 'Drill', hex: '26cf', category: 'Power' },
            { id: 'flashlight', name: 'Flashlight', hex: '1f526', category: 'Workshop' },
            { id: 'toolbox', name: 'Toolbox', hex: '1f9f0', category: 'Workshop' },
            { id: 'gloves', name: 'Gloves', hex: '1f9e4', category: 'Safety' },
            { id: 'goggles', name: 'Goggles', hex: '1f97d', category: 'Safety' },
            { id: 'hat', name: 'Hard hat', hex: '26d1', category: 'Safety' }
        ],
        missions: [
            {
                id: 'w1',
                customer: 'Engineer Sam',
                text: "The main engine is loose! Bring me the Wrench and a Screwdriver.",
                targetTools: ['wrench', 'screwdriver'],
                correctResponse: "Tools delivered. Ready for repair!",
                responses: [
                    { text: "Tools delivered. Ready for repair!", es: "¡Herramientas listas! A reparar." },
                    { text: "The engine is red.", es: "El motor es rojo." },
                    { text: "I like robots.", es: "Me gustan los robots." }
                ],
                difficulty: 1,
                vocabFocus: ['Engine', 'Wrench', 'Screwdriver']
            },
            {
                id: 'w2',
                customer: 'Robot Ollie',
                text: "This is broken! I need a Hammer and my Toolbox.",
                targetTools: ['hammer', 'toolbox'],
                correctResponse: "Don't worry, I can fix it for you.",
                responses: [
                    { text: "Don't worry, I can fix it for you.", es: "No te preocupes, puedo arreglarlo." },
                    { text: "It is a big box.", es: "Es una caja grande." },
                    { text: "Hammer time!", es: "¡Hora del martillo!" }
                ],
                difficulty: 2,
                vocabFocus: ['Broken', 'Hammer', 'Fix']
            },
            {
                id: 'w3',
                customer: 'Mechanic Max',
                text: "Be careful! Use your Gloves and Goggles for safety.",
                targetTools: ['gloves', 'goggles'],
                correctResponse: "Safety protocol activated. I am ready.",
                responses: [
                    { text: "Safety protocol activated. I am ready.", es: "Protocolo de seguridad activado." },
                    { text: "I am wearing a hat.", es: "Estoy usando un sombrero." },
                    { text: "Look at my tools.", es: "Mira mis herramientas." }
                ],
                difficulty: 3,
                vocabFocus: ['Gloves', 'Goggles', 'Safety']
            },
            {
                id: 'w4',
                customer: 'Worker Wendy',
                text: "It is dark in here. I need a Flashlight and a Hard hat.",
                targetTools: ['flashlight', 'hat'],
                correctResponse: "Lighting the way! Let's get to work.",
                responses: [
                    { text: "Lighting the way! Let's get to work.", es: "¡Iluminando el camino! A trabajar." },
                    { text: "It is sunny today.", es: "Hoy está soleado." },
                    { text: "The hat is blue.", es: "El sombrero es azul." }
                ],
                difficulty: 4,
                vocabFocus: ['Flashlight', 'Hard hat', 'Work']
            },
            {
                id: 'w5',
                customer: 'Master Rig',
                text: "The battery is dead and the gear is stuck. Bring the Drill and the flashlight!",
                targetTools: ['drill', 'flashlight'],
                correctResponse: "Understood. Initiating deep maintenance protocol.",
                responses: [
                    { text: "Understood. Initiating deep maintenance protocol.", es: "Entendido. Iniciando mantenimiento." },
                    { text: "The battery is heavy.", es: "La batería es pesada." },
                    { text: "I need a sandwich.", es: "Necesito un sandwich." }
                ],
                difficulty: 5,
                vocabFocus: ['Battery', 'Gear', 'Maintenance', 'Drill']
            }
        ]
    }
];

const NeonDiner: React.FC = () => {
    const { recordProblemComplete, novaCoins: totalCoins } = useGamification();
    const [xp, setXp] = useState(0);
    const [earnedCoins, setEarnedCoins] = useState(0);
    const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
    const [currentMission, setCurrentMission] = useState<CareerMission | null>(null);
    const [missionLevel, setMissionLevel] = useState(1); // 1 to 5
    const [isTalking, setIsTalking] = useState(false);
    const [gameState, setGameState] = useState<'idle' | 'career-select' | 'performing' | 'complete' | 'mastered'>('career-select');
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [heardText, setHeardText] = useState("");
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [translationModal, setTranslationModal] = useState<{ word: string, translation: string } | null>(null);
    const [currentSubtitle, setCurrentSubtitle] = useState<{ en: string, es: string } | null>(null);

    const handleCareerSelect = (career: Career) => {
        setSelectedCareer(career);
        setMissionLevel(1);
        setGameState('idle');
    };

    const startNextMission = async () => {
        if (!selectedCareer) return;

        // Find mission for current level
        const mission = selectedCareer.missions.find(m => m.difficulty === missionLevel);

        if (!mission) {
            setGameState('mastered');
            return;
        }

        setCurrentMission(mission);
        setSelectedTools([]);
        setGameState('performing');
        setHeardText("");
        setIsTalking(true);
        setCurrentSubtitle({ en: mission.text, es: "" });
        await edgeTTS.speak(`${mission.customer} says: ${mission.text}`, "rachelle");
        setCurrentSubtitle(null);
        setIsTalking(false);
    };

    const toggleTool = (id: string) => {
        if (gameState !== 'performing') return;
        setSelectedTools(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const showTranslation = (word: string) => {
        const cleanWord = word.replace(/[.,!]/g, "");
        const translation = TRANSLATIONS[cleanWord] || "Traducción no disponible";
        setTranslationModal({ word: cleanWord, translation });
    };

    const startSpeech = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Please use Chrome or Edge for voice features!");
            return;
        }

        setIsListening(true);
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            const speechResult = event.results[0][0].transcript;
            setHeardText(speechResult);
            checkVoiceResponse(speechResult);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const checkVoiceResponse = async (text: string) => {
        if (!currentMission) return;
        const target = currentMission.correctResponse.toLowerCase().replace(/[.,!]/g, "");
        const heard = text.toLowerCase().replace(/[.,!]/g, "");

        if (heard.includes(target) || target.includes(heard)) {
            checkMission(currentMission.correctResponse);
        } else {
            setIsTalking(true);
            const msg = `I heard "${text}", but the protocol requires: ${currentMission.correctResponse}`;
            setCurrentSubtitle({ en: msg, es: "" });
            await edgeTTS.speak(msg, "rachelle");
            await new Promise(r => setTimeout(r, 2000));
            setCurrentSubtitle(null);
            setIsTalking(false);
        }
    };

    const checkMission = async (response: string) => {
        if (!currentMission) return;

        const toolsCorrect = currentMission.targetTools.every(i => selectedTools.includes(i)) &&
            selectedTools.length === currentMission.targetTools.length;
        const responseCorrect = response === currentMission.correctResponse;

        if (toolsCorrect && responseCorrect) {
            const rewardXP = isVoiceMode ? 75 : 50;
            const rewardCoins = isVoiceMode ? 20 : 10;
            setXp(v => v + rewardXP);
            setEarnedCoins(rewardCoins);
            recordProblemComplete(isVoiceMode); // Awards coins to global state

            setIsTalking(true);
            setCurrentSubtitle({ en: "Mission Successful! Excellent work, cadet.", es: "¡Misión exitosa! Excelente trabajo, cadete." });
            await edgeTTS.speak("Mission Successful! Excellent work, cadet.", "rachelle");
            await new Promise(r => setTimeout(r, 2000));
            setCurrentSubtitle(null);
            setGameState('complete');
            setIsTalking(false);
        } else {
            setIsTalking(true);
            if (!toolsCorrect) {
                setCurrentSubtitle({ en: "Check your equipment. Those are not the correct items.", es: "Revisa tu equipo. Esos no son los objetos correctos." });
                await edgeTTS.speak("Check your equipment. Those are not the correct items.", "rachelle");
                await new Promise(r => setTimeout(r, 2000));
                setCurrentSubtitle(null);
            } else {
                setCurrentSubtitle({ en: "Your verbal protocol is incorrect. Try the professional response.", es: "Tu protocolo verbal es incorrecto. Prueba la respuesta profesional." });
                await edgeTTS.speak("Your verbal protocol is incorrect. Try the professional response.", "rachelle");
                await new Promise(r => setTimeout(r, 2000));
                setCurrentSubtitle(null);
            }
            setIsTalking(false);
        }
    };

    const handleContinue = () => {
        if (missionLevel < 5) {
            setMissionLevel(prev => prev + 1);
            setGameState('idle');
        } else {
            setGameState('mastered');
        }
    };

    return (
        <div className="h-full min-h-[700px] w-full bg-[#f8fafc] text-indigo-950 flex flex-col items-center p-4 md:p-8 overflow-y-auto font-sans relative custom-scrollbar">

            {/* --- BACKGROUND --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-pink-50" />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className={`absolute top-[-10%] right-[-10%] w-[600px] h-[600px] ${selectedCareer?.accent === 'cyan' ? 'bg-cyan-400' : selectedCareer?.accent === 'amber' ? 'bg-amber-400' : 'bg-pink-400'} blur-[150px] rounded-full`}
                />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            {/* --- HEADER --- */}
            <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="z-10 w-full max-w-6xl flex justify-between items-center mb-10">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setGameState('career-select')}
                        className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl border-2 border-slate-100 hover:border-blue-400 transition-all group"
                    >
                        <Briefcase size={32} className="text-slate-400 group-hover:text-blue-500" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            {selectedCareer?.name || 'CAREER ACADEMY'}
                        </h1>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                {selectedCareer ? `Sector: ${selectedCareer.id.toUpperCase()}` : 'Select your professional path'}
                            </p>
                            {selectedCareer && (
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(lvl => (
                                        <div
                                            key={lvl}
                                            className={`w-4 h-1 rounded-full transition-all ${lvl <= missionLevel ? (lvl === missionLevel ? 'bg-blue-500 w-8' : 'bg-blue-300') : 'bg-slate-200'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsVoiceMode(!isVoiceMode)}
                        className={`flex items-center gap-2 px-8 py-4 rounded-3xl border-2 transition-all font-black text-xs tracking-widest ${isVoiceMode ? 'bg-blue-600 border-white text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'}`}
                    >
                        <Mic size={16} /> {isVoiceMode ? 'VOICE PROTOCOL ON (+XP)' : 'VOICE MODE OFF'}
                    </button>
                    <div className="flex items-center gap-8 bg-white/60 backdrop-blur-3xl border border-white px-10 py-4 rounded-[2.5rem] shadow-xl">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nova Coins</span>
                            <span className="text-3xl font-black text-amber-500 font-mono tracking-tighter flex items-center gap-2">
                                <Coins size={20} className="fill-current" /> {totalCoins}
                            </span>
                        </div>
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                            <Award size={28} className="text-indigo-500" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- MAIN INTERFACE --- */}
            <div className="z-10 w-full max-w-7xl flex-1 min-h-0 px-4">
                <AnimatePresence mode="wait">
                    {gameState === 'career-select' ? (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="grid grid-cols-3 gap-10 h-full py-10"
                        >
                            {CAREERS.map(career => (
                                <motion.button
                                    key={career.id}
                                    whileHover={{ y: -20, scale: 1.05 }}
                                    onClick={() => handleCareerSelect(career)}
                                    className={`relative bg-gradient-to-br ${career.color} rounded-[4rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl border-4 border-white/20`}
                                >
                                    <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-[3rem] flex items-center justify-center mb-8 shadow-xl">
                                        <career.icon className="w-16 h-16 text-white" />
                                    </div>
                                    <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">{career.name}</h2>
                                    <p className="text-white/80 font-bold leading-relaxed mb-10 px-4">{career.description}</p>
                                    <div className="px-10 py-4 bg-white text-slate-900 rounded-3xl font-black text-xs tracking-widest uppercase shadow-xl hover:bg-slate-50 transition-colors">
                                        Start Career
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-12 gap-8 h-full"
                        >
                            {/* TOOL TERMINAL */}
                            <div className="col-span-8 flex flex-col gap-6 h-full pb-8">
                                <div className="bg-white/40 backdrop-blur-3xl border-2 border-white rounded-[4rem] p-12 flex flex-col gap-10 shadow-xl h-full">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-black text-indigo-950/80 flex items-center gap-4">
                                            {selectedCareer?.icon && <selectedCareer.icon className="text-blue-500" />} {selectedCareer?.name} TOOLKIT
                                        </h2>
                                        {selectedTools.length > 0 && (
                                            <button
                                                onClick={() => setSelectedTools([])}
                                                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
                                            >
                                                Reset selection
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-8 overflow-y-auto pr-4 custom-scrollbar">
                                        {selectedCareer?.tools.map(tool => (
                                            <motion.button
                                                key={tool.id}
                                                whileHover={{ scale: 1.05 }}
                                                onClick={() => toggleTool(tool.id)}
                                                className={`relative rounded-[3rem] border-4 transition-all p-8 flex flex-col items-center gap-6 ${selectedTools.includes(tool.id) ? 'bg-blue-600 border-white shadow-2xl' : 'bg-white/50 border-white hover:border-blue-200'}`}
                                            >
                                                <div className={`p-4 rounded-full flex items-center justify-center text-5xl ${selectedTools.includes(tool.id) ? 'bg-white/20' : 'bg-blue-50'}`}>
                                                    {hexToEmoji(tool.hex)}
                                                </div>
                                                <div className="text-center">
                                                    <p className={`text-lg font-black ${selectedTools.includes(tool.id) ? 'text-white' : 'text-indigo-950'}`}>{tool.name}</p>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); showTranslation(tool.name); }}
                                                        className={`mt-2 flex items-center gap-1 mx-auto text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-all ${selectedTools.includes(tool.id) ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                                                    >
                                                        <Info size={10} /> Qué es?
                                                    </button>
                                                </div>
                                                {selectedTools.includes(tool.id) && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-3 w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-50">
                                                        <CheckCircle2 size={24} />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* INTERACTION HUB */}
                            <div className="col-span-4 flex flex-col gap-6 h-full pb-8">
                                <div className="bg-white/40 backdrop-blur-3xl border-2 border-white rounded-[4rem] p-10 flex flex-col gap-6 shadow-xl h-full relative overflow-hidden">
                                    {gameState === 'idle' ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-10">
                                            <motion.div
                                                animate={{ y: [0, -20, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="w-32 h-32 bg-blue-100 rounded-[3rem] flex items-center justify-center shadow-xl"
                                            >
                                                <Zap size={60} className="text-blue-600" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-[10px] font-black text-blue-500 mb-2 uppercase tracking-[0.3em]">Sector 0{missionLevel}</h3>
                                                <h3 className="text-3xl font-black text-indigo-950 mb-4 tracking-tighter uppercase">MISSION {missionLevel}</h3>
                                                <div className="flex justify-center gap-2 mb-4">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star key={star} size={16} className={star <= missionLevel ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                                                    ))}
                                                </div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                    {missionLevel <= 2 ? 'Novice Level' : missionLevel <= 4 ? 'Professional Level' : 'Master Level'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={startNextMission}
                                                className="bg-blue-600 text-white font-black px-12 py-6 rounded-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all text-xl"
                                            >
                                                START LEVEL {missionLevel}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col gap-8">
                                            {/* Guest Card */}
                                            <div className="flex items-center gap-5 bg-white p-6 rounded-[2.5rem] shadow-sm">
                                                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                                                    <Users size={28} className="text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Citizen</p>
                                                    <h3 className="text-2xl font-black text-indigo-950">{currentMission?.customer}</h3>
                                                </div>
                                            </div>

                                            {/* Mission Text */}
                                            <div className="bg-white p-8 rounded-[3rem] shadow-xl relative border border-blue-50">
                                                <MessageSquare className="text-blue-400 mb-4" size={24} />
                                                <p className="text-xl font-bold leading-tight text-indigo-950 italic">
                                                    "{currentMission?.text.split(' ').map((word, i) => {
                                                        const clean = word.replace(/[.,!]/g, "");
                                                        const hasTrans = !!TRANSLATIONS[clean];
                                                        return (
                                                            <span
                                                                key={i}
                                                                onClick={() => hasTrans && showTranslation(clean)}
                                                                className={hasTrans ? "text-blue-600 cursor-help hover:underline decoration-dotted" : ""}
                                                            >
                                                                {word}{' '}
                                                            </span>
                                                        );
                                                    })}"
                                                </p>
                                            </div>

                                            {/* Vocab Help */}
                                            <div className="flex flex-wrap gap-2">
                                                {currentMission?.vocabFocus.map(word => (
                                                    <button
                                                        key={word}
                                                        onClick={() => showTranslation(word)}
                                                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-blue-100 transition-colors"
                                                    >
                                                        {word}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Action Section */}
                                            <div className="mt-auto space-y-4">
                                                {isVoiceMode ? (
                                                    <div className="space-y-4">
                                                        <div className="p-6 bg-slate-50 rounded-[2rem] text-center border-2 border-blue-100">
                                                            <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">Required Protocol:</p>
                                                            <p className="text-lg font-black text-indigo-950">
                                                                {currentMission?.correctResponse.split(' ').map((word, i) => {
                                                                    const clean = word.replace(/[.,!]/g, "");
                                                                    const hasTrans = !!TRANSLATIONS[clean];
                                                                    return (
                                                                        <span
                                                                            key={i}
                                                                            onClick={() => hasTrans && showTranslation(clean)}
                                                                            className={hasTrans ? "text-blue-600 cursor-help" : ""}
                                                                        >
                                                                            {word}{' '}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={startSpeech}
                                                            disabled={isListening}
                                                            className={`w-full py-6 rounded-3xl flex items-center justify-center gap-4 text-xl font-black transition-all shadow-xl ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-600 text-white hover:scale-105'}`}
                                                        >
                                                            {isListening ? <MicOff /> : <Mic />} {isListening ? 'LISTENING...' : 'TAP TO SPEAK'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {currentMission?.responses.map((resp, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => checkMission(resp.text)}
                                                                className="w-full text-left bg-white border-2 border-slate-100 p-4 rounded-[2rem] hover:border-blue-400 transition-all shadow-sm hover:shadow-md group"
                                                            >
                                                                <p className="text-sm font-black text-indigo-950 group-hover:text-blue-600 transition-colors">{resp.text}</p>
                                                                <p className="text-xs font-bold text-slate-400 italic mt-1 group-hover:text-blue-400">{resp.es}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- TRANSLATION MODAL --- */}
            <AnimatePresence>
                {translationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setTranslationModal(null)}
                        className="absolute inset-0 z-[110] bg-indigo-950/40 backdrop-blur-md flex items-center justify-center p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-[3rem] p-12 max-w-sm w-full shadow-2xl text-center relative border-4 border-blue-100"
                        >
                            <button
                                onClick={() => setTranslationModal(null)}
                                className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                <Languages className="text-blue-500" size={40} />
                            </div>
                            <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Traducción</h3>
                            <div className="text-4xl font-black text-indigo-950 mb-2">{translationModal.word}</div>
                            <div className="text-2xl font-bold text-blue-600 mb-6">= {translationModal.translation}</div>

                            <button
                                onClick={() => edgeTTS.speak(translationModal.word, "rachelle")}
                                className="flex items-center justify-center gap-3 w-full py-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all border-2 border-blue-100 mb-4 group"
                            >
                                <Volume2 size={20} className="group-hover:scale-110 transition-transform" />
                                ESCUCHAR PRONUNCIACIÓN
                            </button>

                            <button
                                onClick={() => setTranslationModal(null)}
                                className="w-full py-4 bg-indigo-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-900 transition-all"
                            >
                                Entendido!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- FEEDBACK --- */}
            <AnimatePresence>
                {isTalking && (
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute bottom-10 z-[60]">
                        <div className="bg-white/80 backdrop-blur-3xl px-10 py-5 rounded-full shadow-2xl border border-white flex items-center gap-5">
                            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Processing Vocal Audio...</span>
                        </div>
                    </motion.div>
                )}

                {/* --- SUCCESS OVERLAY --- */}
                {gameState === 'complete' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-2xl"
                    >
                        <div className="text-center max-w-2xl px-10">
                            <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", damping: 10 }}
                                className="w-48 h-48 bg-blue-600 rounded-[4rem] mx-auto flex items-center justify-center shadow-2xl mb-10 border-8 border-blue-400"
                            >
                                <Award size={100} className="text-white" />
                            </motion.div>
                            <h2 className="text-7xl font-black text-indigo-950 tracking-tighter mb-4 uppercase">LEVEL COMPLETE!</h2>
                            <p className="text-2xl font-bold text-slate-400 mb-12 italic">"Super performance at Level {missionLevel}!"</p>

                            <div className="flex items-center justify-center gap-6 mb-12">
                                <div className="bg-blue-50 px-12 py-6 rounded-[3rem] border-2 border-blue-100 min-w-[200px] shadow-sm">
                                    <p className="text-[10px] font-black text-blue-400 uppercase mb-1">XP Earned</p>
                                    <p className="text-5xl font-black text-blue-600">+{isVoiceMode ? '75' : '50'}</p>
                                </div>
                                <div className="bg-amber-50 px-12 py-6 rounded-[3rem] border-2 border-amber-100 min-w-[200px] shadow-sm">
                                    <p className="text-[10px] font-black text-amber-500 uppercase mb-1">Nova Coins</p>
                                    <p className="text-5xl font-black text-amber-600">+{earnedCoins}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleContinue}
                                className="group bg-indigo-950 text-white font-black px-16 py-8 rounded-[2.5rem] shadow-2xl hover:bg-blue-600 transition-all text-2xl flex items-center gap-6 mx-auto"
                            >
                                CONTINUE TO LEVEL {missionLevel + 1}
                                <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* --- CAREER MASTERED OVERLAY --- */}
                {gameState === 'mastered' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-[110] flex items-center justify-center bg-gradient-to-br from-indigo-950 to-blue-900"
                    >
                        <div className="text-center px-10">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-64 h-64 bg-amber-400 rounded-[5rem] mx-auto flex items-center justify-center shadow-[0_0_100px_rgba(251,191,36,0.3)] mb-12 border-8 border-white/20"
                            >
                                <TrophyIcon size={120} className="text-white" />
                            </motion.div>
                            <h2 className="text-8xl font-black text-white tracking-tighter mb-4 uppercase">CAREER MASTERED!</h2>
                            <p className="text-3xl font-bold text-blue-200 mb-16">Congratulations! You are now a Professional {selectedCareer?.name}.</p>

                            <button
                                onClick={() => setGameState('career-select')}
                                className="bg-white text-indigo-950 font-black px-20 py-10 rounded-[3rem] shadow-2xl hover:scale-110 active:scale-95 transition-all text-3xl"
                            >
                                RETURN TO HUB
                            </button>
                        </div>

                        {/* Confetti effect simulation */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: -100, x: Math.random() * 2000 }}
                                    animate={{ y: 2000, rotate: 360 }}
                                    transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                                    className="absolute w-4 h-4 rounded-sm bg-white/40"
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>

            {/* BILINGUAL SUBTITLE OVERLAY */}
            <AnimatePresence>
                {currentSubtitle && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-[100] pointer-events-none"
                    >
                        <div className="bg-black/80 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center gap-2">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                    <Volume2 size={16} className="text-white" />
                                </div>
                                <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Listen & Learn</span>
                            </div>

                            <h2 className="text-white text-2xl md:text-3xl font-black tracking-tight leading-tight">
                                {currentSubtitle.en}
                            </h2>
                            {currentSubtitle.es && (
                                <>
                                    <div className="h-px w-24 bg-white/20 my-1" />
                                    <p className="text-indigo-300 text-lg md:text-xl font-bold italic opacity-90">
                                        {currentSubtitle.es}
                                    </p>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NeonDiner;
