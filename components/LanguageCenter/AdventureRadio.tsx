import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EarningsExitModal from '@/components/Gamification/EarningsExitModal';
import { edgeTTS } from '@/services/edgeTTS';
import { useGamification } from '@/hooks/useGamification';
import {
    Radio,
    Map as MapIcon,
    Navigation,
    Target,
    MapPin,
    CheckCircle2,
    AlertCircle,
    Trophy,
    ArrowRight,
    ArrowLeft,
    Flame,
    Volume2,
    Compass,
    Activity,
    Wind,
    Shield,
    Check,
    Lock,
    Globe
} from 'lucide-react';

// --- ASSETS ---
const hexToEmoji = (hex: string) => {
    if (!hex) return '❓';
    return hex.split('-').map(part => String.fromCodePoint(parseInt(part, 16))).join('');
};

interface MissionStep {
    id: string;
    instruction: string;
    instructionEs: string;
    targetId: string;
    targetHex: string;
    completed: boolean;
    preposition?: string; // used for A2 logic (next to, behind, etc)
}

interface Mission {
    id: string;
    title: string;
    titleEs: string;
    description: string;
    descriptionEs: string;
    steps: MissionStep[];
    rewardXp: number;
}

// --- NEW: Rich Location Data for "Inside" View ---
// Added nameEs for items
const LOCATION_DETAILS: Record<string, { desc: string; descEs: string; color: string; colorText: string; icon: string, items?: { id: string; name: string; nameEs: string; icon: string }[] }> = {
    bakery: {
        desc: "Mmm! Smells like fresh bread here!",
        descEs: "¡Mmm! ¡Huele a pan recién hecho aquí!",
        color: "bg-amber-50", colorText: "text-amber-700", icon: "🥖",
        items: [
            { id: 'baguette', name: 'Baguette', nameEs: 'Baguette', icon: '🥖' },
            { id: 'croissant', name: 'Croissant', nameEs: 'Croissant', icon: '🥐' },
            { id: 'donut', name: 'Donut', nameEs: 'Dona', icon: '🍩' },
            { id: 'cake', name: 'Cake', nameEs: 'Pastel', icon: '🍰' },
            { id: 'cookie', name: 'Cookie', nameEs: 'Galleta', icon: '🍪' },
            { id: 'bread', name: 'Bread', nameEs: 'Pan', icon: '🍞' }
        ]
    },
    school: {
        desc: "Time to learn and play!",
        descEs: "¡Hora de aprender y jugar!",
        color: "bg-blue-50", colorText: "text-blue-700", icon: "🏫",
        items: [
            { id: 'book', name: 'Book', nameEs: 'Libro', icon: '📕' },
            { id: 'pencil', name: 'Pencil', nameEs: 'Lápiz', icon: '✏️' },
            { id: 'backpack', name: 'Backpack', nameEs: 'Mochila', icon: '🎒' },
            { id: 'ruler', name: 'Ruler', nameEs: 'Regla', icon: '📏' },
            { id: 'scissors', name: 'Scissors', nameEs: 'Tijeras', icon: '✂️' }
        ]
    },
    park: {
        desc: "Listen to the birds singing!",
        descEs: "¡Escucha los pájaros cantando!",
        color: "bg-emerald-50", colorText: "text-emerald-700", icon: "⛲",
        items: [
            { id: 'bench', name: 'Bench', nameEs: 'Banco', icon: '🪑' },
            { id: 'tree', name: 'Tree', nameEs: 'Árbol', icon: '🌳' },
            { id: 'flower', name: 'Flower', nameEs: 'Flor', icon: '🌻' },
            { id: 'bike', name: 'Bike', nameEs: 'Bicicleta', icon: '🚲' }
        ]
    },
    hospital: {
        desc: "Doctors help people feel better.",
        descEs: "Los doctores ayudan a las personas a sentirse mejor.",
        color: "bg-rose-50", colorText: "text-rose-700", icon: "🩺",
        items: [
            { id: 'mask', name: 'Mask', nameEs: 'Mascarilla', icon: '😷' },
            { id: 'ambulance', name: 'Ambulance', nameEs: 'Ambulancia', icon: '🚑' },
            { id: 'pill', name: 'Medicine', nameEs: 'Medicina', icon: '💊' },
            { id: 'stethoscope', name: 'Stethoscope', nameEs: 'Estetoscopio', icon: '🩺' }
        ]
    },
    super: {
        desc: "Fresh fruits and veggies!",
        descEs: "¡Frutas y verduras frescas!",
        color: "bg-green-50", colorText: "text-green-700", icon: "🛒",
        items: [
            { id: 'apple', name: 'Apple', nameEs: 'Manzana', icon: '🍎' },
            { id: 'banana', name: 'Banana', nameEs: 'Banana', icon: '🍌' },
            { id: 'milk', name: 'Milk', nameEs: 'Leche', icon: '🥛' },
            { id: 'grapes', name: 'Grapes', nameEs: 'Uvas', icon: '🍇' },
            { id: 'cheese', name: 'Cheese', nameEs: 'Queso', icon: '🧀' }
        ]
    },
    police: {
        desc: "Safety first! Reporting for duty.",
        descEs: "¡Seguridad primero! Reportándose.",
        color: "bg-slate-100", colorText: "text-slate-700", icon: "🚔",
        items: [
            { id: 'badge', name: 'Badge', nameEs: 'Placa', icon: '🛡️' },
            { id: 'radio', name: 'Radio', nameEs: 'Radio', icon: '📻' },
            { id: 'whistle', name: 'Whistle', nameEs: 'Silbato', icon: '😙' },
            { id: 'hat', name: 'Police Hat', nameEs: 'Gorra', icon: '👮' },
            { id: 'handcuffs', name: 'Handcuffs', nameEs: 'Esposas', icon: '🔗' }
        ]
    },
    house: {
        desc: "Home Sweet Home! So cozy.",
        descEs: "¡Hogar dulce hogar! Muy acogedor.",
        color: "bg-indigo-50", colorText: "text-indigo-700", icon: "🏠",
        items: [
            { id: 'sofa', name: 'Sofa', nameEs: 'Sofá', icon: '🛋️' },
            { id: 'tv', name: 'TV', nameEs: 'Televisor', icon: '📺' },
            { id: 'bed', name: 'Bed', nameEs: 'Cama', icon: '🛏️' },
            { id: 'plant', name: 'Plant', nameEs: 'Planta', icon: '🪴' },
            { id: 'lamp', name: 'Lamp', nameEs: 'Lámpara', icon: '💡' }
        ]
    },
    bank: {
        desc: "Keeping our coins safe.",
        descEs: "Manteniendo nuestras monedas seguras.",
        color: "bg-yellow-50", colorText: "text-yellow-700", icon: "🏦",
        items: [
            { id: 'coin', name: 'Coin', nameEs: 'Moneda', icon: '🪙' },
            { id: 'cash', name: 'Cash', nameEs: 'Efectivo', icon: '💵' },
            { id: 'card', name: 'Credit Card', nameEs: 'Tarjeta', icon: '💳' },
            { id: 'vault', name: 'Vault', nameEs: 'Bóveda', icon: '🔒' },
            { id: 'gold', name: 'Gold Bar', nameEs: 'Oro', icon: '👑' }
        ]
    },
    fire: {
        desc: "Ready to save the day!",
        descEs: "¡Listos para salvar el día!",
        color: "bg-orange-50", colorText: "text-orange-700", icon: "🚒",
        items: [
            { id: 'truck', name: 'Fire Truck', nameEs: 'Camión', icon: '🚒' },
            { id: 'helmet', name: 'Helmet', nameEs: 'Casco', icon: '⛑️' },
            { id: 'hose', name: 'Hose', nameEs: 'Manguera', icon: '🚿' },
            { id: 'ladder', name: 'Ladder', nameEs: 'Escalera', icon: '🪜' },
            { id: 'axe', name: 'Axe', nameEs: 'Hacha', icon: '🪓' }
        ]
    },
    lib: {
        desc: "Shh... everyone is reading.",
        descEs: "Shh... todos están leyendo.",
        color: "bg-teal-50", colorText: "text-teal-700", icon: "📚",
        items: [
            { id: 'book', name: 'Book', nameEs: 'Libro', icon: '📖' },
            { id: 'computer', name: 'Computer', nameEs: 'Computadora', icon: '💻' },
            { id: 'desk', name: 'Desk', nameEs: 'Escritorio', icon: '🪑' },
            { id: 'globe', name: 'Globe', nameEs: 'Globo', icon: '🌎' },
            { id: 'glasses', name: 'Reading Glasses', nameEs: 'Lentes', icon: '👓' }
        ]
    },
    cinema: {
        desc: "Popcorn and movies time!",
        descEs: "¡Hora de palomitas y películas!",
        color: "bg-purple-50", colorText: "text-purple-700", icon: "🎬",
        items: [
            { id: 'popcorn', name: 'Popcorn', nameEs: 'Palomitas', icon: '🍿' },
            { id: 'ticket', name: 'Ticket', nameEs: 'Boleto', icon: '🎟️' },
            { id: 'soda', name: 'Soda', nameEs: 'Refresco', icon: '🥤' },
            { id: 'screen', name: 'Screen', nameEs: 'Pantalla', icon: '🖥️' },
            { id: '3dglasses', name: '3D Glasses', nameEs: 'Lentes 3D', icon: '🕶️' }
        ]
    },
    stadium: {
        desc: "Go team go! The crowd is cheering!",
        descEs: "¡Vamos equipo! ¡La multitud aclama!",
        color: "bg-sky-50", colorText: "text-sky-700", icon: "🏟️",
        items: [
            { id: 'ball', name: 'Soccer Ball', nameEs: 'Balón', icon: '⚽' },
            { id: 'trophy', name: 'Trophy', nameEs: 'Trofeo', icon: '🏆' },
            { id: 'jersey', name: 'Jersey', nameEs: 'Camiseta', icon: '👕' },
            { id: 'whistle', name: 'Ref Whistle', nameEs: 'Silbato', icon: '😙' },
            { id: 'flag', name: 'Flag', nameEs: 'Bandera', icon: '🚩' }
        ]
    },
};

interface AdventureRadioProps {
    onBack?: () => void;
}

const AdventureRadio: React.FC<AdventureRadioProps> = ({ onBack }) => {
    const { experiencePoints, novaCoins, level: globalLevel, getLevelInfo, recordCorrectAnswer, recordProblemComplete } = useGamification();

    // Track initial coins to calculate session earnings
    const initialCoinsRef = useRef(novaCoins);
    const [showEarningsModal, setShowEarningsModal] = useState(false);
    const [sessionEarnings, setSessionEarnings] = useState(0);

    useEffect(() => {
        // Set initial coins only once when component mounts
        if (initialCoinsRef.current === undefined) {
            initialCoinsRef.current = novaCoins;
        }
    }, []);

    const handleExit = () => {
        const earned = novaCoins - initialCoinsRef.current;
        if (earned > 0) {
            setSessionEarnings(earned);
            setShowEarningsModal(true);
        } else {
            if (onBack) onBack();
        }
    };

    // Force initial ref set if it was 0 or strictly equal to current on first render (safety)
    // Actually simpler: just calculate diff when needed. logic above is fine.
    const [currentMission, setCurrentMission] = useState<Mission | null>(null);
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [missionsCompleted, setMissionsCompleted] = useState(0);
    const [mapSeed, setMapSeed] = useState<any[]>([]);
    const [currentSubtitle, setCurrentSubtitle] = useState<{ en: string, es: string } | null>(null);

    // Translation Toggle State
    const [showTranslation, setShowTranslation] = useState(true);

    const level = useMemo(() => Math.floor(missionsCompleted / 10) + 1, [missionsCompleted]);
    const missionInLevel = missionsCompleted % 10;

    // Generate a fixed random map
    useEffect(() => {
        const items = [
            { id: 'hospital', hex: '1f3e5', w: 'Hospital' },
            { id: 'park', hex: '1f3de', w: 'Park' },
            { id: 'school', hex: '1f3eb', w: 'School' },
            { id: 'bakery', hex: '1f956', w: 'Bakery' },
            { id: 'super', hex: '1f6d2', w: 'Supermarket' },
            { id: 'police', hex: '1f46e', w: 'Police Station' },
            { id: 'house', hex: '1f3e0', w: 'House' },
            { id: 'bank', hex: '1f3e6', w: 'Bank' },
            { id: 'fire', hex: '1f692', w: 'Fire Station' },
            { id: 'lib', hex: '1f4da', w: 'Library' },
            { id: 'cinema', hex: '1f3a6', w: 'Cinema' },
            { id: 'stadium', hex: '1f3df', w: 'Stadium' }
        ];
        const grid = Array(12).fill(0).map((_, i) => ({
            id: i,
            item: items[i % items.length],
            x: (i % 4) * 25 + 12.5,
            y: Math.floor(i / 4) * 30 + 15
        }));
        setMapSeed(grid);
    }, []);

    const allMissions: Mission[] = [
        // 1. BAKERY - Sweet
        {
            id: 'm1', title: 'Bakery Treats', titleEs: 'Delicias de Panadería', description: 'Find 3 sweet items.', descriptionEs: 'Encuentra 3 artículos dulces.',
            steps: [
                { id: 's1', instruction: 'Go to the Bakery.', instructionEs: 'Ve a la Panadería.', targetId: 'bakery', targetHex: '1f956', completed: false },
                { id: 's2', instruction: 'Find the Donut.', instructionEs: 'Encuentra la Dona.', targetId: 'donut', targetHex: '1f369', completed: false },
                { id: 's3', instruction: 'Find the Cookie.', instructionEs: 'Encuentra la Galleta.', targetId: 'cookie', targetHex: '1f36a', completed: false },
                { id: 's4', instruction: 'Find the Cake.', instructionEs: 'Encuentra el Pastel.', targetId: 'cake', targetHex: '1f370', completed: false }
            ], rewardXp: 150
        },
        // 2. SCHOOL - Studying
        {
            id: 'm2', title: 'Time to Study', titleEs: 'Hora de Estudiar', description: 'Get your supplies.', descriptionEs: 'Consigue tus útiles.',
            steps: [
                { id: 's1', instruction: 'Go to the School.', instructionEs: 'Ve a la Escuela.', targetId: 'school', targetHex: '1f3eb', completed: false },
                { id: 's2', instruction: 'Find the Book.', instructionEs: 'Encuentra el Libro.', targetId: 'book', targetHex: '1f4da', completed: false },
                { id: 's3', instruction: 'Find the Pencil.', instructionEs: 'Encuentra el Lápiz.', targetId: 'pencil', targetHex: '270f', completed: false },
                { id: 's4', instruction: 'Find the Ruler.', instructionEs: 'Encuentra la Regla.', targetId: 'ruler', targetHex: '1f4cf', completed: false }
            ], rewardXp: 150
        },
        // 3. PARK - Nature
        {
            id: 'm3', title: 'Nature Walk', titleEs: 'Caminata Natural', description: 'Explore nature in the park.', descriptionEs: 'Explora la naturaleza en el parque.',
            steps: [
                { id: 's1', instruction: 'Go to the Park.', instructionEs: 'Ve al Parque.', targetId: 'park', targetHex: '1f3de', completed: false },
                { id: 's2', instruction: 'Find the Tree.', instructionEs: 'Encuentra el Árbol.', targetId: 'tree', targetHex: '1f333', completed: false },
                { id: 's3', instruction: 'Find the Flower.', instructionEs: 'Encuentra la Flor.', targetId: 'flower', targetHex: '1f33b', completed: false },
                { id: 's4', instruction: 'Find the Bench.', instructionEs: 'Encuentra el Banco.', targetId: 'bench', targetHex: '1f9fb', completed: false }
            ], rewardXp: 150
        },
        // 4. HOSPITAL - Emergency
        {
            id: 'm4', title: 'Medical Help', titleEs: 'Ayuda Médica', description: 'The hospital needs supplies.', descriptionEs: 'El hospital necesita suministros.',
            steps: [
                { id: 's1', instruction: 'Go to the Hospital.', instructionEs: 'Ve al Hospital.', targetId: 'hospital', targetHex: '1f3e5', completed: false },
                { id: 's2', instruction: 'Find the Ambulance.', instructionEs: 'Encuentra la Ambulancia.', targetId: 'ambulance', targetHex: '1f691', completed: false },
                { id: 's3', instruction: 'Find the Medicine.', instructionEs: 'Encuentra la Medicina.', targetId: 'pill', targetHex: '1f48a', completed: false },
                { id: 's4', instruction: 'Find the Mask.', instructionEs: 'Encuentra la Mascarilla.', targetId: 'mask', targetHex: '1f637', completed: false }
            ], rewardXp: 150
        },
        // 5. SUPERMARKET - Breakfast
        {
            id: 'm5', title: 'Breakfast Run', titleEs: 'Compras de Desayuno', description: 'Buy food for breakfast.', descriptionEs: 'Compra comida para el desayuno.',
            steps: [
                { id: 's1', instruction: 'Go to the Supermarket.', instructionEs: 'Ve al Supermercado.', targetId: 'super', targetHex: '1f6d2', completed: false },
                { id: 's2', instruction: 'Find the Milk.', instructionEs: 'Encuentra la Leche.', targetId: 'milk', targetHex: '1f95b', completed: false },
                { id: 's3', instruction: 'Find the Banana.', instructionEs: 'Encuentra la Banana.', targetId: 'banana', targetHex: '1f34c', completed: false },
                { id: 's4', instruction: 'Find the Cheese.', instructionEs: 'Encuentra el Queso.', targetId: 'cheese', targetHex: '1f9c0', completed: false }
            ], rewardXp: 150
        },
        // 6. POLICE - Officer
        {
            id: 'm6', title: 'Police Patrol', titleEs: 'Patrulla Policial', description: 'Gear up for duty.', descriptionEs: 'Prepárate para el deber.',
            steps: [
                { id: 's1', instruction: 'Go to the Police Station.', instructionEs: 'Ve a la Estación de Policía.', targetId: 'police', targetHex: '1f46e', completed: false },
                { id: 's2', instruction: 'Find the Badge.', instructionEs: 'Encuentra la Placa.', targetId: 'badge', targetHex: '1f6e1', completed: false },
                { id: 's3', instruction: 'Find the Police Hat.', instructionEs: 'Encuentra la Gorra.', targetId: 'hat', targetHex: '1f46e', completed: false },
                { id: 's4', instruction: 'Find the Whistle.', instructionEs: 'Encuentra el Silbato.', targetId: 'whistle', targetHex: '1f9f6', completed: false }
            ], rewardXp: 150
        },
        // 7. HOUSE - Relax
        {
            id: 'm7', title: 'Cozy Evening', titleEs: 'Tarde Acogedora', description: 'Relax at home.', descriptionEs: 'Relájate en casa.',
            steps: [
                { id: 's1', instruction: 'Go to the House.', instructionEs: 'Ve a la Casa.', targetId: 'house', targetHex: '1f3e0', completed: false },
                { id: 's2', instruction: 'Find the Sofa.', instructionEs: 'Encuentra el Sofá.', targetId: 'sofa', targetHex: '1f6cb', completed: false },
                { id: 's3', instruction: 'Find the TV.', instructionEs: 'Encuentra el Televisor.', targetId: 'tv', targetHex: '1f4fa', completed: false },
                { id: 's4', instruction: 'Find the Lamp.', instructionEs: 'Encuentra la Lámpara.', targetId: 'lamp', targetHex: '1f4a1', completed: false }
            ], rewardXp: 150
        },
        // 8. BANK - Money
        {
            id: 'm8', title: 'Save Money', titleEs: 'Ahorrar Dinero', description: 'Visit the bank vault.', descriptionEs: 'Visita la bóveda del banco.',
            steps: [
                { id: 's1', instruction: 'Go to the Bank.', instructionEs: 'Ve al Banco.', targetId: 'bank', targetHex: '1f3e6', completed: false },
                { id: 's2', instruction: 'Find the Coin.', instructionEs: 'Encuentra la Moneda.', targetId: 'coin', targetHex: '1fa99', completed: false },
                { id: 's3', instruction: 'Find the Cash.', instructionEs: 'Encuentra el Efectivo.', targetId: 'cash', targetHex: '1f4b5', completed: false },
                { id: 's4', instruction: 'Find the Vault.', instructionEs: 'Encuentra la Bóveda.', targetId: 'vault', targetHex: '1f512', completed: false }
            ], rewardXp: 150
        },
        // 9. FIRE - Rescue
        {
            id: 'm9', title: 'Fire Rescue', titleEs: 'Rescate de Incendios', description: 'Prepare the fire truck.', descriptionEs: 'Prepara el camión de bomberos.',
            steps: [
                { id: 's1', instruction: 'Go to the Fire Station.', instructionEs: 'Ve a la Estación de Bomberos.', targetId: 'fire', targetHex: '1f692', completed: false },
                { id: 's2', instruction: 'Find the Fire Truck.', instructionEs: 'Encuentra el Camión.', targetId: 'truck', targetHex: '1f692', completed: false },
                { id: 's3', instruction: 'Find the Helmet.', instructionEs: 'Encuentra el Casco.', targetId: 'helmet', targetHex: '1f96d', completed: false },
                { id: 's4', instruction: 'Find the Hose.', instructionEs: 'Encuentra la Manguera.', targetId: 'hose', targetHex: '1f4a6', completed: false }
            ], rewardXp: 150
        },
        // 10. LIBRARY - Research
        {
            id: 'm10', title: 'Research Time', titleEs: 'Tiempo de Investigación', description: 'Read some books.', descriptionEs: 'Lee algunos libros.',
            steps: [
                { id: 's1', instruction: 'Go to the Library.', instructionEs: 'Ve a la Biblioteca.', targetId: 'lib', targetHex: '1f4da', completed: false },
                { id: 's2', instruction: 'Find the Book.', instructionEs: 'Encuentra el Libro.', targetId: 'book', targetHex: '1f4d6', completed: false },
                { id: 's3', instruction: 'Find the Globe.', instructionEs: 'Encuentra el Globo.', targetId: 'globe', targetHex: '1f30e', completed: false },
                { id: 's4', instruction: 'Find the Computer.', instructionEs: 'Encuentra la Computadora.', targetId: 'computer', targetHex: '1f4bb', completed: false }
            ], rewardXp: 150
        },
        // 11. CINEMA - Movies
        {
            id: 'm11', title: 'Movie Night', titleEs: 'Noche de Películas', description: 'Get snacks for the movie.', descriptionEs: 'Consigue bocadillos para la película.',
            steps: [
                { id: 's1', instruction: 'Go to the Cinema.', instructionEs: 'Ve al Cine.', targetId: 'cinema', targetHex: '1f3a6', completed: false },
                { id: 's2', instruction: 'Find the Popcorn.', instructionEs: 'Encuentra las Palomitas.', targetId: 'popcorn', targetHex: '1f37f', completed: false },
                { id: 's3', instruction: 'Find the Ticket.', instructionEs: 'Encuentra el Boleto.', targetId: 'ticket', targetHex: '1f3ab', completed: false },
                { id: 's4', instruction: 'Find the Soda.', instructionEs: 'Encuentra el Refresco.', targetId: 'soda', targetHex: '1f964', completed: false }
            ], rewardXp: 150
        },
        // 12. STADIUM - Match
        {
            id: 'm12', title: 'Soccer Match', titleEs: 'Partido de Fútbol', description: 'Get ready for the game.', descriptionEs: 'Prepárate para el juego.',
            steps: [
                { id: 's1', instruction: 'Go to the Stadium.', instructionEs: 'Ve al Estadio.', targetId: 'stadium', targetHex: '1f3df', completed: false },
                { id: 's2', instruction: 'Find the Soccer Ball.', instructionEs: 'Encuentra el Balón.', targetId: 'ball', targetHex: '26bd', completed: false },
                { id: 's3', instruction: 'Find the Jersey.', instructionEs: 'Encuentra la Camiseta.', targetId: 'jersey', targetHex: '1f455', completed: false },
                { id: 's4', instruction: 'Find the Trophy.', instructionEs: 'Encuentra el Trofeo.', targetId: 'trophy', targetHex: '1f3c6', completed: false }
            ], rewardXp: 150
        },
        // --- MULTI-LOCATION MISSIONS ---
        // 13. Weekend Fun (Park + Bakery)
        {
            id: 'm13', title: 'Picnic Prep', titleEs: 'Preparar Picnic', description: 'Get bread and go to the park.', descriptionEs: 'Consigue pan y ve al parque.',
            steps: [
                { id: 's1', instruction: 'Go to the Bakery.', instructionEs: 'Ve a la Panadería.', targetId: 'bakery', targetHex: '1f956', completed: false },
                { id: 's2', instruction: 'Find the Bread.', instructionEs: 'Encuentra el Pan.', targetId: 'bread', targetHex: '1f35e', completed: false },
                { id: 's3', instruction: 'Go to the Park.', instructionEs: 'Ve al Parque.', targetId: 'park', targetHex: '1f3de', completed: false },
                { id: 's4', instruction: 'Find the Bench.', instructionEs: 'Encuentra el Banco.', targetId: 'bench', targetHex: '1f9fb', completed: false }
            ], rewardXp: 200
        },
        // 14. First Aid (Super + Hospital)
        {
            id: 'm14', title: 'Healthy Day', titleEs: 'Día Saludable', description: 'Buy fruit and visit the doctor.', descriptionEs: 'Compra fruta y visita al doctor.',
            steps: [
                { id: 's1', instruction: 'Go to the Supermarket.', instructionEs: 'Ve al Supermercado.', targetId: 'super', targetHex: '1f6d2', completed: false },
                { id: 's2', instruction: 'Find the Apple.', instructionEs: 'Encuentra la Manzana.', targetId: 'apple', targetHex: '1f34e', completed: false },
                { id: 's3', instruction: 'Go to the Hospital.', instructionEs: 'Ve al Hospital.', targetId: 'hospital', targetHex: '1f3e5', completed: false },
                { id: 's4', instruction: 'Find the Stethoscope.', instructionEs: 'Encuentra el Estetoscopio.', targetId: 'stethoscope', targetHex: '1fa7a', completed: false }
            ], rewardXp: 200
        },
        // 15. Career Day (Police + Fire)
        {
            id: 'm15', title: 'Emergency Hero', titleEs: 'Héroe de Emergencia', description: 'Visit both emergency stations.', descriptionEs: 'Visita ambas estaciones de emergencia.',
            steps: [
                { id: 's1', instruction: 'Go to the Police Station.', instructionEs: 'Ve a la Policía.', targetId: 'police', targetHex: '1f46e', completed: false },
                { id: 's2', instruction: 'Find the Radio.', instructionEs: 'Encuentra el Radio.', targetId: 'radio', targetHex: '1f4fb', completed: false },
                { id: 's3', instruction: 'Go to the Fire Station.', instructionEs: 'Ve a los Bomberos.', targetId: 'fire', targetHex: '1f692', completed: false },
                { id: 's4', instruction: 'Find the Axe.', instructionEs: 'Encuentra el Hacha.', targetId: 'axe', targetHex: '1fa93', completed: false }
            ], rewardXp: 200
        },
        // 16. Errands (Bank + Super)
        {
            id: 'm16', title: 'City Errands', titleEs: 'Recados de la Ciudad', description: 'Get cash and buy groceries.', descriptionEs: 'Consigue efectivo y compra comida.',
            steps: [
                { id: 's1', instruction: 'Go to the Bank.', instructionEs: 'Ve al Banco.', targetId: 'bank', targetHex: '1f3e6', completed: false },
                { id: 's2', instruction: 'Find the Cash.', instructionEs: 'Encuentra el Efectivo.', targetId: 'cash', targetHex: '1f4b5', completed: false },
                { id: 's3', instruction: 'Go to the Supermarket.', instructionEs: 'Ve al Supermercado.', targetId: 'super', targetHex: '1f6d2', completed: false },
                { id: 's4', instruction: 'Find the Grapes.', instructionEs: 'Encuentra las Uvas.', targetId: 'grapes', targetHex: '1f347', completed: false }
            ], rewardXp: 200
        },
        // 17. Student Research (School + Library)
        {
            id: 'm17', title: 'School Project', titleEs: 'Proyecto Escolar', description: 'Class and research.', descriptionEs: 'Clase e investigación.',
            steps: [
                { id: 's1', instruction: 'Go to the School.', instructionEs: 'Ve a la Escuela.', targetId: 'school', targetHex: '1f3eb', completed: false },
                { id: 's2', instruction: 'Find the Backpack.', instructionEs: 'Encuentra la Mochila.', targetId: 'backpack', targetHex: '1f392', completed: false },
                { id: 's3', instruction: 'Go to the Library.', instructionEs: 'Ve a la Biblioteca.', targetId: 'lib', targetHex: '1f4da', completed: false },
                { id: 's4', instruction: 'Find the Computer.', instructionEs: 'Encuentra la Computadora.', targetId: 'computer', targetHex: '1f4bb', completed: false }
            ], rewardXp: 200
        },
        // 18. Fun Night (Cinema + House)
        {
            id: 'm18', title: 'Night Out', titleEs: 'Salida Nocturna', description: 'Movie then home.', descriptionEs: 'Película y luego a casa.',
            steps: [
                { id: 's1', instruction: 'Go to the Cinema.', instructionEs: 'Ve al Cine.', targetId: 'cinema', targetHex: '1f3a6', completed: false },
                { id: 's2', instruction: 'Find the 3D Glasses.', instructionEs: 'Encuentra los Lentes 3D.', targetId: '3dglasses', targetHex: '1f453', completed: false },
                { id: 's3', instruction: 'Go to the House.', instructionEs: 'Ve a la Casa.', targetId: 'house', targetHex: '1f3e0', completed: false },
                { id: 's4', instruction: 'Find the Bed.', instructionEs: 'Encuentra la Cama.', targetId: 'bed', targetHex: '1f6cf', completed: false }
            ], rewardXp: 200
        },
        // 19. Sports Day (Stadium + Park)
        {
            id: 'm19', title: 'Active Day', titleEs: 'Día Activo', description: 'Play sports and ride a bike.', descriptionEs: 'Juega deportes y monta bici.',
            steps: [
                { id: 's1', instruction: 'Go to the Stadium.', instructionEs: 'Ve al Estadio.', targetId: 'stadium', targetHex: '1f3df', completed: false },
                { id: 's2', instruction: 'Find the Flag.', instructionEs: 'Encuentra la Bandera.', targetId: 'flag', targetHex: '1f3f1', completed: false },
                { id: 's3', instruction: 'Go to the Park.', instructionEs: 'Ve al Parque.', targetId: 'park', targetHex: '1f3de', completed: false },
                { id: 's4', instruction: 'Find the Bike.', instructionEs: 'Encuentra la Bicicleta.', targetId: 'bike', targetHex: '1f6b2', completed: false }
            ], rewardXp: 200
        },
        // 20. Bakery + House (Dessert)
        {
            id: 'm20', title: 'Dessert Time', titleEs: 'Hora del Postre', description: 'Buy cake and eat at home.', descriptionEs: 'Compra pastel y come en casa.',
            steps: [
                { id: 's1', instruction: 'Go to the Bakery.', instructionEs: 'Ve a la Panadería.', targetId: 'bakery', targetHex: '1f956', completed: false },
                { id: 's2', instruction: 'Find the Cake.', instructionEs: 'Encuentra el Pastel.', targetId: 'cake', targetHex: '1f370', completed: false },
                { id: 's3', instruction: 'Go to the House.', instructionEs: 'Ve a la Casa.', targetId: 'house', targetHex: '1f3e0', completed: false },
                { id: 's4', instruction: 'Find the TV.', instructionEs: 'Encuentra el Televisor.', targetId: 'tv', targetHex: '1f4fa', completed: false }
            ], rewardXp: 200
        }
    ];

    const currentLevelMissions = useMemo(() => {
        // Just return all missions for now for testing
        return allMissions;
    }, [level]);

    const startMission = async (m: Mission) => {
        setCurrentMission(JSON.parse(JSON.stringify(m))); // Deep copy to avoid mutating original
        setCurrentStepIdx(0);
        setIsBroadcasting(true);
        const textEn = `Mission ${missionInLevel + 1}: ${m.title}. ${m.description}`;
        const textEs = `Misión ${missionInLevel + 1}: ${m.titleEs}. ${m.descriptionEs}`;
        setCurrentSubtitle({ en: textEn, es: textEs });
        await edgeTTS.speak(textEn, "rachelle");
        if (showTranslation) await edgeTTS.speak(textEs, "lina");
        await announceStep(m.steps[0]);
        setIsBroadcasting(false);
    };

    const announceStep = async (step: MissionStep) => {
        setIsBroadcasting(true);
        setCurrentSubtitle({ en: step.instruction, es: step.instructionEs });
        await edgeTTS.speak(step.instruction, "rachelle");
        // Only speak Spanish if enabled, but we always set the text in currentSubtitle for the UI to use
        if (showTranslation) await edgeTTS.speak(step.instructionEs, "lina");
        setIsBroadcasting(false);
    };

    const [visitedLocation, setVisitedLocation] = useState<{ id: string; item: any } | null>(null);

    const handleTargetClick = async (targetId: string) => {
        if (isBroadcasting || visitedLocation) return;

        // --- EXPLORATION MODE (No Mission) ---
        if (!currentMission) {
            const cell = mapSeed.find(c => c.item.id === targetId);
            if (cell) {
                // Open "Inside" View for exploration
                setVisitedLocation({ id: targetId, item: cell.item });
                await edgeTTS.speak(cell.item.w, "rachelle");
            }
            return;
        }

        const currentStep = currentMission.steps[currentStepIdx];
        if (targetId === currentStep.targetId) {
            // Success - Show "Inside" View first
            const cell = mapSeed.find(c => c.item.id === targetId);
            if (cell) {

                // Mark current step (Find Location) as COMPLETE
                const newSteps = [...currentMission.steps];
                newSteps[currentStepIdx].completed = true;
                setCurrentMission({ ...currentMission, steps: newSteps });
                recordCorrectAnswer(true);
                // Double Points Bonus
                if (!showTranslation) {
                    recordCorrectAnswer(true);
                }

                // Open Location
                setVisitedLocation({ id: targetId, item: cell.item });

                // Check if there is a next step
                if (currentStepIdx < currentMission.steps.length - 1) {
                    setCurrentStepIdx(v => v + 1);
                    // Announce the NEW step (e.g. "Find the Baguette")
                    await announceStep(newSteps[currentStepIdx + 1]);
                } else {
                    // Mission Complete immediately (if no items needed)
                    const msgEn = "Mission Complete! Great job.";
                    const msgEs = "¡Misión Completa! Buen trabajo.";
                    setCurrentSubtitle({ en: msgEn, es: msgEs });
                    await edgeTTS.speak(msgEn, "rachelle");
                }
            }
        } else {
            // Wrong target
            setCurrentSubtitle({ en: "No, that's not it. Look carefully.", es: "No, eso no es. Mira con cuidado." });
            await edgeTTS.speak("No, that's not it. Look carefully.", "rachelle");
            if (showTranslation) await edgeTTS.speak("No, eso no es. Mira con cuidado.", "lina");
            await announceStep(currentStep); // Re-announce
        }
    };

    const handleInsideItemClick = async (itemId: string) => {
        if (!currentMission) return;

        const currentStep = currentMission.steps[currentStepIdx];

        if (itemId === currentStep.targetId) {
            // Correct Item Found!
            const newSteps = [...currentMission.steps];
            newSteps[currentStepIdx].completed = true;
            setCurrentMission({ ...currentMission, steps: newSteps });
            recordCorrectAnswer(true); // Small reward for step
            // Double Points Bonus
            if (!showTranslation) {
                recordCorrectAnswer(true);
            }

            // Audio feedback
            const items = LOCATION_DETAILS[visitedLocation!.item.id]?.items;
            const itemDetails = items?.find(i => i.id === itemId);
            const itemName = itemDetails?.name || itemId;
            const itemNameEs = itemDetails?.nameEs || itemId;

            const msgEn = `You found the ${itemName}!`;
            const msgEs = `¡Encontraste el/la ${itemNameEs}!`;

            setCurrentSubtitle({ en: msgEn, es: msgEs });
            await edgeTTS.speak(msgEn, "rachelle");

            if (currentStepIdx < currentMission.steps.length - 1) {
                // Move to next step (find next item)
                setCurrentStepIdx(v => v + 1);
                setTimeout(() => announceStep(newSteps[currentStepIdx + 1]), 1500); // Small delay before next instruction
            } else {
                // ALL STEPS DONE -> Mission Complete
                recordProblemComplete(); // Big reward

                // Double Reward for Mission Completion if translation was off
                if (!showTranslation) {
                    // Simulate extra reward by triggering "correct answers" to boost score
                    recordCorrectAnswer(true);
                    recordCorrectAnswer(true);
                    recordCorrectAnswer(true);
                }

                setMissionsCompleted(v => v + 1);

                const doneEn = !showTranslation ? "Mission Complete! DOUBLE POINTS EARNED!" : "Mission Complete! Excellent scouting.";
                const doneEs = "¡Misión Completa! Excelente exploración.";

                setCurrentSubtitle({ en: doneEn, es: doneEs });
                await edgeTTS.speak(doneEn, "rachelle");
                if (showTranslation) await edgeTTS.speak(doneEs, "lina");

                // Close after 3s
                setTimeout(() => {
                    setVisitedLocation(null);
                    setCurrentMission(null);
                    setCurrentSubtitle(null);
                }, 3000);
            }

        } else {
            // Wrong Item
            const msgEn = "That's not what we're looking for.";
            const msgEs = "Eso no es lo que estamos buscando.";
            setCurrentSubtitle({ en: msgEn, es: msgEs });
            await edgeTTS.speak(msgEn, "rachelle");
        }
    };

    const handleContinueFromLocation = async () => {
        setVisitedLocation(null);
        // If mission was done, clear it
        if (currentMission && currentStepIdx >= currentMission.steps.length) {
            setCurrentMission(null);
            setCurrentSubtitle(null);
        }
    };

    return (
        <div className="h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center justify-center p-6 overflow-hidden font-sans relative selection:bg-blue-100">

            {/* --- TOPOGRAPHIC EXPLORER BACKGROUND --- */}
            <div className="absolute inset-0 z-0 bg-[#f8fafc]">
                {/* Dot Grid */}
                <div className="absolute inset-0 opacity-[0.4]" style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }} />

                {/* Organic Shapes */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-emerald-100/50 to-transparent rounded-full blur-[100px]" />
            </div>

            {/* --- NAVIGATION BAR --- */}
            <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="z-50 w-full max-w-7xl flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={handleExit} className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-indigo-600">
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Compass size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none">Navigator</h1>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">City Protocol</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 bg-white/80 backdrop-blur-md border border-white px-2 py-2 rounded-full shadow-sm">
                    {/* TRANSLATION TOGGLE */}
                    <div className="flex flex-col items-end mr-4">
                        <button
                            onClick={() => setShowTranslation(prev => !prev)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all ${showTranslation ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-900 text-white shadow-lg shadow-indigo-500/30'}`}
                        >
                            <Globe size={16} />
                            {showTranslation ? "ES: ON" : "ES: OFF (+XP)"}
                        </button>
                        <AnimatePresence>
                            {showTranslation ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute top-16 right-0 bg-gradient-to-r from-violet-600 to-indigo-600 p-1 rounded-2xl shadow-2xl z-50 w-72 text-center"
                                >
                                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                                        <div className="text-lg font-black text-yellow-300 leading-none mb-1 drop-shadow-md animate-pulse">
                                            ¿QUIERES PREMIOS?
                                        </div>
                                        <div className="text-sm font-bold text-white leading-tight">
                                            ¡Apaga la traducción para ganar <br />
                                            <span className="text-amber-300 font-black text-base bg-black/20 px-2 py-0.5 rounded-full mt-1 inline-block border border-yellow-400/50">DOBLES PUNTOS! 🚀</span>
                                        </div>
                                    </div>
                                    <div className="absolute -top-2 right-10 w-4 h-4 bg-indigo-600 rotate-45" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    className="absolute top-16 right-0 bg-amber-400 text-amber-900 border-2 border-white p-3 rounded-xl shadow-xl z-50 pointer-events-none whitespace-nowrap"
                                >
                                    <div className="text-xs font-black leading-tight flex items-center gap-2">
                                        <Flame size={16} className="fill-amber-900" /> ¡DOBLES PUNTOS ACTIVOS!
                                    </div>
                                    <div className="absolute -top-2 right-10 w-4 h-4 bg-amber-400 border-l-2 border-t-2 border-white rotate-45" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="w-px h-8 bg-slate-200" />

                    <div className="flex flex-col items-end px-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Credits</span>
                        <span className="text-xl font-black text-slate-800 leading-none">{novaCoins}</span>
                    </div>
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                        <Trophy size={20} className="text-amber-500" />
                    </div>
                </div>
            </motion.div>

            {/* --- MAIN GRID --- */}
            <div className="z-10 w-full max-w-7xl grid grid-cols-12 gap-6 flex-1 min-h-0">

                {/* LEFT: MISSION CONTROL */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    className="col-span-12 lg:col-span-4 h-full min-h-0 flex flex-col"
                >
                    <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] p-6 flex flex-col gap-4 shadow-xl shadow-slate-200/50 h-full overflow-hidden">

                        {/* Status Header */}
                        <div className="shrink-0 flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <Activity size={16} className="text-indigo-500" />
                                <span className="text-xs font-black text-slate-500 uppercase">Radio Link</span>
                            </div>
                            <div className="flex gap-1 h-3 items-end">
                                <motion.div animate={{ height: [4, 12, 6] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-indigo-400 rounded-full" />
                                <motion.div animate={{ height: [8, 4, 10] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-1 bg-indigo-400 rounded-full" />
                                <motion.div animate={{ height: [6, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-1 bg-indigo-400 rounded-full" />
                            </div>
                        </div>

                        {!currentMission ? (
                            <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
                                <div className="mb-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 text-center">
                                    <h3 className="text-lg font-black text-indigo-900 mb-1">Select Mission</h3>
                                    <p className="text-xs text-indigo-600/70 font-medium">Or tap map icons to explore</p>
                                </div>
                                <div className="space-y-2">
                                    {currentLevelMissions.map((m) => {
                                        const isCompleted = allMissions.findIndex(tm => tm.id === m.id) < missionsCompleted;
                                        return (
                                            <button
                                                key={m.id} onClick={() => startMission(m)}
                                                className={`w-full text-left p-4 rounded-2xl transition-all border-2 group relative overflow-hidden ${isCompleted ? 'bg-white border-emerald-100 text-slate-500' : 'bg-white border-slate-100 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-100 text-slate-800'}`}
                                            >
                                                <div className="relative z-10 flex items-center justify-between">
                                                    <div>
                                                        <h4 className={`font-black text-sm ${isCompleted ? 'line-through opacity-50' : ''}`}>{m.title}</h4>
                                                        {showTranslation && <p className="text-xs text-slate-500 mb-1">{m.titleEs}</p>}
                                                        <p className="text-[10px] font-medium opacity-60 uppercase tracking-wider"> Reward: {m.rewardXp} XP</p>
                                                    </div>
                                                    {isCompleted ? <CheckCircle2 size={18} className="text-emerald-400" /> : <ArrowRight size={18} className="text-indigo-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="shrink-0 mb-4">
                                    <h3 className="text-lg font-black text-slate-800 leading-tight">{currentMission.title}</h3>
                                    {showTranslation && (
                                        <p className="text-sm font-bold text-slate-500">{currentMission.titleEs}</p>
                                    )}
                                    <p className="text-xs font-medium text-slate-400 mt-2">{currentMission.description}</p>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                    {currentMission.steps.map((step, idx) => (
                                        <div key={step.id} className={`p-4 rounded-2xl border-l-4 transition-all ${idx === currentStepIdx ? 'bg-indigo-50 border-indigo-500 pl-4' : idx < currentStepIdx ? 'bg-slate-50 border-emerald-400 opacity-60' : 'bg-white border-slate-200 opacity-40'}`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${idx === currentStepIdx ? 'bg-indigo-500 text-white' : idx < currentStepIdx ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                    {idx < currentStepIdx ? <Check size={12} /> : idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold leading-relaxed">{step.instruction}</p>
                                                    {showTranslation && idx <= currentStepIdx && (
                                                        <p className="text-xs font-medium text-slate-500 mt-1 italic">{step.instructionEs}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={() => { setCurrentMission(null); setVisitedLocation(null); }} className="shrink-0 w-full py-3 mt-4 text-xs font-black text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors uppercase tracking-widest">
                                    Abort Mission
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>


                {/* RIGHT: MAP AREA */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="col-span-12 lg:col-span-8 h-full relative"
                >
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl border-[3px] border-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden">

                        {/* Map Grid */}
                        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

                        {mapSeed.length > 0 && mapSeed.map((cell) => {
                            const isUpdatedTarget = currentMission && currentMission.steps[currentStepIdx].targetId === cell.item.id && !currentMission.steps[currentStepIdx].completed;

                            return (
                                <motion.button
                                    key={cell.id}
                                    onClick={() => handleTargetClick(cell.item.id)}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 group outline-none"
                                    style={{ left: `${cell.x}%`, top: `${cell.y}%` }}
                                    whileHover={{ scale: 1.1, zIndex: 50 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {/* Icon Container */}
                                    <div className={`relative w-20 h-20 flex flex-col items-center justify-center rounded-[1.5rem] shadow-lg transition-all duration-300 border-2 ${isUpdatedTarget ? 'bg-white border-indigo-500 shadow-indigo-200 ring-4 ring-indigo-500/20 z-20' : 'bg-white border-white hover:border-indigo-200 shadow-slate-100'}`}>
                                        <div className="text-4xl filter drop-shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300">
                                            {hexToEmoji(cell.item.hex)}
                                        </div>

                                        {/* Name Tag */}
                                        <div className="absolute -bottom-3 bg-slate-800 text-white text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                            {cell.item.w}
                                        </div>
                                    </div>

                                    {/* Floor Spot */}
                                    <div className="absolute top-[85%] left-1/2 -translate-x-1/2 w-12 h-3 bg-slate-900/10 rounded-[100%] blur-[2px] -z-10 group-hover:w-16 transition-all" />
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* --- INSIDE LOCATION MODAL (Updated for Item Search) --- */}
                    <AnimatePresence>
                        {visitedLocation && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute inset-4 z-50 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white flex flex-col items-center justify-center p-8 text-center"
                            >
                                <div className="absolute top-8 left-8 flex items-center gap-4">
                                    <div className={`w-16 h-16 ${LOCATION_DETAILS[visitedLocation.item.id]?.color || 'bg-slate-100'} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                                        {LOCATION_DETAILS[visitedLocation.item.id]?.icon || hexToEmoji(visitedLocation.item.hex)}
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                            {visitedLocation.item.w}
                                        </h2>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Interior View</p>
                                    </div>
                                </div>

                                <div className="mb-8 mt-12">
                                    <p className={`text-lg font-bold ${LOCATION_DETAILS[visitedLocation.item.id]?.colorText || 'text-slate-500'} max-w-lg mb-4`}>
                                        "{showTranslation ? LOCATION_DETAILS[visitedLocation.item.id]?.descEs : LOCATION_DETAILS[visitedLocation.item.id]?.desc}"
                                    </p>

                                    {/* Sub-instruction for items */}
                                    {currentMission && currentMission.steps && currentMission.steps[currentStepIdx] && !currentMission.steps[currentStepIdx].completed && (
                                        <div className="inline-block bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-black animate-pulse shadow-lg shadow-indigo-200">
                                            <div>{currentMission.steps[currentStepIdx].instruction}</div>
                                            {showTranslation && <div className="text-[10px] font-medium text-slate-400 mt-0.5">{currentMission.steps[currentStepIdx].instructionEs}</div>}
                                        </div>
                                    )}
                                </div>

                                {/* Items Grid */}
                                {LOCATION_DETAILS[visitedLocation.item.id]?.items ? (
                                    <div className="flex flex-wrap justify-center gap-6 mb-10 max-w-3xl">
                                        {LOCATION_DETAILS[visitedLocation.item.id].items!.map((item) => (
                                            <motion.button
                                                key={item.id}
                                                onClick={() => handleInsideItemClick(item.id)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="flex flex-col items-center gap-2 group"
                                            >
                                                <div className="w-24 h-24 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-4xl shadow-sm group-hover:border-indigo-400 group-hover:shadow-indigo-100 transition-all">
                                                    {item.icon}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-600 uppercase group-hover:text-indigo-600">{item.name}</span>
                                                    {showTranslation && (
                                                        <span className="text-[10px] font-bold text-slate-400">{item.nameEs}</span>
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl mb-8 opacity-50">
                                        <p className="text-sm font-bold text-slate-400">No items to explore here yet.</p>
                                    </div>
                                )}


                                <button
                                    onClick={handleContinueFromLocation}
                                    className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                                >
                                    {currentMission && !currentMission.steps.every(s => s.completed) ? (
                                        <>
                                            EXIT & CONTINUE <ArrowRight size={20} />
                                        </>
                                    ) : (
                                        <>
                                            RETURN TO MAP <MapIcon size={20} />
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

            </div>

            <AnimatePresence>
                {showEarningsModal && (
                    <EarningsExitModal
                        sessionEarnings={sessionEarnings}
                        onComplete={() => {
                            setShowEarningsModal(false);
                            if (onBack) onBack();
                        }}
                    />
                )}
            </AnimatePresence>


        </div>
    );
};

export default AdventureRadio;
