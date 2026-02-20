import React, { useState, useEffect, useMemo, useRef } from 'react';
import { edgeTTS } from '@/services/edgeTTS';
import { motion, AnimatePresence } from 'framer-motion';
import { useNovaSound } from '@/hooks/useNovaSound';
import { useGamification } from '@/hooks/useGamification';
import {
    Mic, ShoppingCart, ArrowLeft, Scan, CheckCircle, Sparkles, Volume2, Wallet, CreditCard, Receipt,
    ShoppingBag, RefreshCcw, Package, Banknote, Coins, Zap
} from 'lucide-react';
import { CATALOG } from './CityCatalog';
import { Button } from '@/components/ui/button';

const hexToEmoji = (hex: string) => {
    if (!hex) return '❓';
    return hex.split('-').map(part => String.fromCodePoint(parseInt(part, 16))).join('');
};

// --- SUPERMARKET ZONES CONFIGURATION ---
const MARKET_ZONES = [
    {
        id: 'produce', name: 'PRODUCE', nameEs: 'Frutas y Verduras', icon: '🍎',
        color: '#dcfce7', borderColor: '#16a34a',
        x: 2, y: 2, w: 30, h: 30,
        hintEn: "Fresh from the farm!", hintEs: "¡Fresco de la granja!",
        match: ['Apple', 'Banana', 'Grapes', 'Strawberry', 'Mango', 'Carrot', 'Broccoli', 'Corn', 'Mushroom', 'Pineapple', 'Watermelon', 'Pumpkin', 'Potato', 'Onion', 'Tomato', 'Lemon', 'Orange', 'Pear', 'Peach', 'Cherry', 'Avocado', 'Coconut', 'Kiwi', 'Lettuce', 'Cucumber', 'Pepper', 'Garlic', 'Eggplant']
    },
    {
        id: 'bakery', name: 'BAKERY', nameEs: 'Panadería', icon: '🥐',
        color: '#ffedd5', borderColor: '#ea580c',
        x: 34, y: 2, w: 30, h: 30,
        hintEn: "Yummy fresh bread!", hintEs: "¡Pan delicioso!",
        match: ['Bread', 'Croissant', 'Donut', 'Cake', 'Pizza Slice', 'Sandwich', 'Cookie', 'Pie', 'Baguette', 'Pancake', 'Waffle', 'Bagel', 'Pretzel', 'Muffin', 'Tart']
    },
    {
        id: 'dairy', name: 'FRIDGE & DRINKS', nameEs: 'Refrigerados y Bebidas', icon: '❄️',
        color: '#e0f2fe', borderColor: '#0284c7',
        x: 66, y: 2, w: 30, h: 30,
        hintEn: "Cold drinks and cheese!", hintEs: "¡Bebidas frías y queso!",
        match: ['Milk', 'Cheese', 'Ice Cream', 'Yogurt', 'Butter', 'Egg', 'Juice', 'Water', 'Soda', 'Tofu', 'Hummus', 'Smoothie', 'Orange Juice', 'Apple Juice', 'Lemonade', 'Iced Tea', 'Ice Cream Tub', 'Popsicle', 'Frozen Pizza', 'Frozen Peas', 'Frozen Berries']
    },
    {
        id: 'pantry', name: 'PANTRY', nameEs: 'Despensa', icon: '🥫',
        color: '#f3f4f6', borderColor: '#4b5563',
        x: 2, y: 35, w: 46, h: 40,
        hintEn: "Cans and boxes!", hintEs: "¡Latas y cajas!",
        match: ['Cereal', 'Canned Soup', 'Pasta', 'Rice', 'Honey', 'Jam', 'Chocolate', 'Chips', 'Tea', 'Coffee', 'Sugar', 'Flour', 'Oil', 'Peanuts', 'Soda', 'Water Bottle', 'Popcorn', 'Candy', 'Lollipop', 'Fries', 'Veggie Burger', 'Veggie Taco', 'Ketchup', 'Mustard', 'Mayonnaise', 'Spaghetti', 'Rice Bag', 'Beans', 'Peanut Butter', 'Hot Sauce', 'Vanilla', 'Gum', 'Chocolate Bar', 'Mints', 'Pudding', 'Gummy Bears', 'Olive Oil', 'Vinegar', 'Oats', 'Almonds', 'Lentils', 'Hot Cocoa']
    },
    {
        id: 'home', name: 'HOME & SCHOOL', nameEs: 'Hogar y Escuela', icon: '📝',
        color: '#fdf4ff', borderColor: '#d946ef',
        x: 50, y: 35, w: 46, h: 40,
        hintEn: "School and cleaning!", hintEs: "¡Escuela y limpieza!",
        match: ['Shampoo', 'Conditioner', 'Soap', 'Toothbrush', 'Toothpaste', 'Deodorant', 'Hair Dye', 'Toilet Paper', 'Tissues', 'Sunscreen', 'Perfume', 'Lipstick', 'Nail Polish', 'Razor', 'Comb', 'Lotion', 'Bandage', 'Vitamins', 'Diapers', 'Detergent', 'Sponge', 'Broom', 'Bucket', 'Trash Bags', 'Batteries', 'Light Bulb', 'Dog Food', 'Cat Food', 'Plate', 'Bowl', 'Cup', 'Fork', 'Spoon', 'Knife', 'Frying Pan', 'Pot', 'Spatula', 'Notebook', 'Pen', 'Pencil', 'Eraser', 'Glue', 'Scissors', 'Ruler', 'Crayons', 'Backpack']
    },
];

interface MarketItem {
    id: string; // unique instance id
    hex: string;
    w: string;
    es: string;
    enS?: string;
    esS?: string;
    price: number;
    zoneId: string;
}

interface SupermarketZoneProps {
    onBack: () => void;
}

const SupermarketZone: React.FC<SupermarketZoneProps> = ({ onBack }) => {
    const { playClick, playSuccess, playStickerApply } = useNovaSound();
    const { novaCoins, spendCoins, earnCoins, useCredit } = useGamification();

    // --- STATE ---
    const [cartItems, setCartItems] = useState<MarketItem[]>([]); // Items waiting to be placed (Restock Mode)
    const [placedItems, setPlacedItems] = useState<MarketItem[]>([]); // Items on shelves
    const [checkoutItems, setCheckoutItems] = useState<MarketItem[]>([]); // Items scanned for checkout

    // Interaction State
    const [draggedItem, setDraggedItem] = useState<MarketItem | null>(null);
    const [scanningItem, setScanningItem] = useState<MarketItem | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [currentSubtitle, setCurrentSubtitle] = useState<{ en: string, es: string } | null>(null);

    // Checkout Process State
    const [isCheckoutMode, setIsCheckoutMode] = useState(false);
    const [totalBill, setTotalBill] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'selecting' | 'processing' | 'paid'>('idle');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'debit' | 'credit' | null>(null);
    const [cashbackEarned, setCashbackEarned] = useState(0);

    const hasNovaCard = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('nova_bank_has_card') === 'true';
    }, [paymentStatus]);
    // Filter & Init Items
    const marketInventory = useMemo(() => {
        const found: MarketItem[] = [];
        let idCounter = 0;

        for (const cat in CATALOG) {
            CATALOG[cat].forEach(item => {
                const zone = MARKET_ZONES.find(z => z.match.includes(item.w));
                if (zone) {
                    const price = Math.floor(Math.random() * 8) + 2; // $2 - $10
                    found.push({
                        id: `market_${idCounter++}`,
                        hex: item.hex, w: item.w, es: item.es,
                        enS: item.enS, esS: item.esS,
                        price, zoneId: zone.id
                    });
                }
            })
        }
        return found;
    }, []);

    // Load initial cart
    useEffect(() => {
        if (cartItems.length === 0 && placedItems.length === 0 && checkoutItems.length === 0) {
            const shuffled = [...marketInventory].sort(() => 0.5 - Math.random());
            setCartItems(shuffled.slice(0, 120)); // Stock up to 120 items
        }
    }, [marketInventory]);

    // --- HELPERS ---
    const speakBilingual = async (item: MarketItem) => {
        // 1. Basic pronunciation
        setCurrentSubtitle({ en: item.w, es: item.es });
        await edgeTTS.speak(item.w, "rachelle");
        await edgeTTS.speak(item.es, "lina");

        await new Promise(r => setTimeout(r, 1000));
        setCurrentSubtitle(null);

        // 2. Example sentences
        if (item.enS) {
            setCurrentSubtitle({ en: item.enS, es: item.esS || "" });
            await edgeTTS.speak("Listen to the example.", "rachelle");
            await edgeTTS.speak(item.enS, "rachelle");
            if (item.esS) await edgeTTS.speak(item.esS, "lina");

            await new Promise(r => setTimeout(r, 1500));
            setCurrentSubtitle(null);
        }
    };

    const speakItem = async (text: string, esText?: string) => {
        setCurrentSubtitle({ en: text, es: esText || "" });
        await edgeTTS.speak(text, "rachelle");
        if (esText) await edgeTTS.speak(esText, "lina");

        await new Promise(r => setTimeout(r, 1000));
        setCurrentSubtitle(null);
    };
    const speakSpanish = async (text: string, enText?: string) => {
        if (enText) setCurrentSubtitle({ en: enText, es: text });
        await edgeTTS.speak(text, "lina");

        await new Promise(r => setTimeout(r, 1000));
        setCurrentSubtitle(null);
    };

    const handleItemDragStart = (item: MarketItem) => {
        if (isCheckoutMode) return;
        playClick();
        speakItem(item.w);
        setDraggedItem(item);
    };

    const handleZoneClick = (zoneId: string) => {
        if (!draggedItem) return;
        if (draggedItem.zoneId === zoneId) {
            playSuccess();
            playStickerApply();
            setPlacedItems(prev => [...prev, draggedItem]);
            setCartItems(prev => prev.filter(i => i.id !== draggedItem.id));
            setDraggedItem(null);
        } else {
            speakItem("Try another shelf!", "¡Prueba con otro estante!");
        }
    };

    // --- CHECKOUT LOGIC ---
    const startCheckout = () => {
        if (placedItems.length === 0) {
            speakItem("Shelves are empty!", "¡Los estantes están vacíos!");
            return;
        }
        setIsCheckoutMode(true);
        setTotalBill(0);
        speakItem("Touch items to scan them!", "¡Toca los productos para escanearlos!");
    };

    const initiateScan = async (item: MarketItem) => {
        if (paymentStatus !== 'idle') return;
        playClick();

        setScanningItem(item); // Open Scan Modal
        setCurrentSubtitle({ en: item.w, es: item.es });
        await speakItem(item.w);
        await speakSpanish(item.es);
        setCurrentSubtitle(null);
    };

    const confirmScan = (item: MarketItem, withVoiceBonus: boolean = false) => {
        playSuccess(); // Beep
        // Move from Placed -> Checkout
        setPlacedItems(prev => prev.filter(i => i.id !== item.id));
        setCheckoutItems(prev => [...prev, item]);
        setTotalBill(prev => prev + item.price);
        setScanningItem(null);

        if (withVoiceBonus) {
            earnCoins(5);
            speakItem("Perfect pronunciation! +5 coins!", "¡Pronunciación perfecta! +5 monedas!");
        } else {
            speakItem(`Scanned! Price: ${item.price} dollars.`, `¡Escaneado! Precio: ${item.price} dólares.`);
        }
    };

    // --- VOICE RECOGNITION ---
    const startListening = () => {
        if (!scanningItem || !('webkitSpeechRecognition' in window)) return;
        setIsListening(true);
        const rec = new (window as any).webkitSpeechRecognition();
        rec.lang = 'en-US';
        rec.start();
        rec.onresult = (e: any) => {
            const heard = e.results[0][0].transcript.toLowerCase();
            const confidence = e.results[0][0].confidence;

            // Relaxed match logic - if word is heard, accept it regardless of confidence
            if (heard.includes(scanningItem.w.toLowerCase()) || (heard.length > 4 && scanningItem.w.toLowerCase().includes(heard))) {
                confirmScan(scanningItem, true);
            } else {
                // Only complain if we really didn't match the word
                speakItem("Almost! Try again: " + scanningItem.w, "¡Casi! Intenta de nuevo: " + scanningItem.es);
                setTimeout(() => {
                    if (scanningItem) startListening();
                }, 2500);
            }
            setIsListening(false);
        };
        rec.onerror = () => {
            setIsListening(false);
            // Silent fail or retry silently to not annoy user
        };
        rec.onend = () => setIsListening(false);
    };

    // --- PAYMENT ---
    const openPaymentMethods = () => {
        speakItem("How would you like to pay? Use your money or borrow from the bank?", "¿Cómo te gustaría pagar? ¿Usas tu dinero o pides prestado al banco?");
        setPaymentStatus('selecting');
    };

    const processPayment = (method: 'cash' | 'debit' | 'credit') => {
        if (method !== 'cash' && !hasNovaCard) {
            speakItem("Activate your Nova Card at the bank first!", "¡Activa tu Tarjeta Nova en el banco primero!");
            return;
        }

        setPaymentMethod(method);

        // Validation
        if (novaCoins < totalBill) {
            speakItem("Not enough Nova Coins!", "¡No tienes suficientes Nova Coins!");
            return;
        }

        setPaymentStatus('processing');
        playClick(); // Beep

        setTimeout(() => {
            if (method === 'credit') {
                if (useCredit(totalBill)) {
                    speakItem(`Bought with Credit! Remember to pay it back at the bank!`, `¡Comprado con Crédito! ¡Recuerda pagarlo en el banco!`);
                } else {
                    speakItem("Your Credit Card is full! Go pay it at the bank.", "¡Tu Tarjeta de Crédito está llena! Ve a pagarla al banco.");
                    setPaymentStatus('idle');
                    return;
                }
            } else {
                if (novaCoins < totalBill) {
                    speakItem("Not enough Nova Coins!", "¡No tienes suficientes Nova Coins!");
                    setPaymentStatus('idle');
                    return;
                }
                spendCoins(totalBill);

                if (method === 'debit') {
                    const cb = Math.floor(totalBill * 0.05);
                    if (cb > 0) {
                        setCashbackEarned(cb);
                        earnCoins(cb);
                    }
                    speakItem(`Debit payment successful! You earned ${cb} coins cashback.`, `¡Pago con débito exitoso! Ganaste ${cb} monedas de reembolso.`);
                } else {
                    speakItem("Cash payment successful! Here is your receipt.", "¡Pago en efectivo exitoso! Aquí tienes tu recibo.");
                }
            }

            setPaymentStatus('paid');
            playSuccess();
        }, 2000);
    };

    const resetStore = () => {
        setIsCheckoutMode(false);
        setPaymentStatus('idle');
        setPaymentMethod(null);
        setCheckoutItems([]);
        setPlacedItems([]);
        const shuffled = [...marketInventory].sort(() => 0.5 - Math.random());
        setCartItems(shuffled.slice(0, 120));
        setTotalBill(0);
        // Restore layout
    };

    // --- RENDER ---
    return (
        <div className="h-full bg-slate-100 flex flex-col md:flex-row overflow-hidden font-sans text-slate-800 relative select-none">

            {/* --- LEFT SIDEBAR: STOCKING CART --- */}
            <div className={`transition-all duration-500 ease-in-out border-r-4 border-slate-300 relative z-30 shadow-2xl flex flex-col bg-white
                ${isCheckoutMode ? 'w-0 opacity-0 overflow-hidden' : 'w-full md:w-[320px]'}`}>

                <div className="p-4 bg-blue-600 text-white shadow-md z-10">
                    <button onClick={onBack} className="flex items-center gap-2 mb-3 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all text-xs font-black uppercase">
                        <ArrowLeft size={14} /> Back
                    </button>
                    <h1 className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
                        <ShoppingCart size={24} /> STOCKROOM
                    </h1>
                    <p className="text-[10px] font-bold opacity-80 uppercase">Place items on shelves</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 relative">
                    <div className="grid grid-cols-2 gap-3 pb-20">
                        {cartItems.map(item => (
                            <motion.button
                                key={item.id}
                                layoutId={item.id}
                                onClick={() => handleItemDragStart(item)}
                                className={`aspect-square bg-white rounded-xl border-2 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95 relative
                                    ${draggedItem?.id === item.id ? 'border-blue-500 ring-4 ring-blue-200 z-50 scale-105 bg-blue-50' : 'border-slate-200'}
                                `}
                            >
                                <div className="w-12 h-12 mb-1 flex items-center justify-center text-3xl">{hexToEmoji(item.hex)}</div>
                                <div className="text-[10px] font-black text-slate-600 uppercase truncate px-1">{item.w}</div>
                                <div className="text-[9px] text-slate-400 font-bold">{item.es}</div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- MAIN FLOOR --- */}
            <div className="flex-1 relative bg-slate-200 overflow-hidden flex flex-col h-screen md:h-auto">

                {/* CHECKOUT HEADER */}
                <AnimatePresence mode='popLayout'>
                    {isCheckoutMode && (
                        <motion.div
                            initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}
                            className="bg-white border-b-4 border-red-500 p-4 shadow-xl z-40 flex justify-between items-center shrink-0"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-red-100 p-2 rounded-xl text-red-600 animate-pulse">
                                    <Scan size={28} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">CHECKOUT MODE</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Start Scanning!</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                                <div className="text-right">
                                    <div className="text-[9px] font-black uppercase text-slate-400">Total</div>
                                    <div className="text-2xl font-black text-slate-800">${totalBill}</div>
                                </div>
                                {paymentStatus === 'paid' ? (
                                    <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-black text-sm flex items-center gap-2">
                                        <CheckCircle size={16} /> PAID
                                    </div>
                                ) : (
                                    <Button
                                        onClick={openPaymentMethods}
                                        disabled={totalBill === 0 || placedItems.length > 0}
                                        className="bg-slate-900 text-white hover:bg-slate-800 font-black"
                                    >
                                        <CreditCard size={16} className="mr-2" /> PAY {totalBill > 0 ? `$${totalBill}` : ''}
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SHELVES AREA */}
                <div className="flex-1 relative p-4 overflow-y-auto custom-scrollbar bg-slate-200/50">
                    <div className="w-full max-w-5xl mx-auto h-[600px] relative mt-4">
                        {MARKET_ZONES.map(zone => {
                            const zoneItems = placedItems.filter(i => i.zoneId === zone.id);
                            return (
                                <div key={zone.id}
                                    onClick={() => isCheckoutMode ? null : handleZoneClick(zone.id)}
                                    className={`absolute rounded-3xl border-[4px] transition-all duration-300 overflow-hidden bg-white shadow-lg
                                        ${isCheckoutMode ? 'opacity-90 hover:opacity-100' : (draggedItem?.zoneId === zone.id ? 'ring-4 ring-green-400 scale-[1.01] shadow-2xl z-20' : 'hover:shadow-xl')}
                                    `}
                                    style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%`, borderColor: zone.borderColor }}
                                >
                                    {/* Zone Title */}
                                    <div className="bg-slate-50 border-b p-2 flex items-center gap-2">
                                        <span className="text-xl">{zone.icon}</span>
                                        <div>
                                            <div className="text-xs font-black uppercase text-slate-700">{zone.name}</div>
                                            <div className="text-[9px] font-bold text-slate-400">{zone.nameEs}</div>
                                        </div>
                                    </div>
                                    {/* Items Grid inside Shelf */}
                                    <div className="p-2 w-full h-full relative flex flex-wrap content-start gap-1">
                                        {zoneItems.map(item => (
                                            <motion.button
                                                key={item.id}
                                                layoutId={item.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isCheckoutMode) {
                                                        initiateScan(item);
                                                    } else {
                                                        playClick();
                                                        speakBilingual(item);
                                                    }
                                                }}
                                                className={`w-12 h-12 relative group ${isCheckoutMode ? 'cursor-zoom-in hover:scale-110 z-10' : 'hover:scale-110'}`}
                                            >
                                                <div className="w-full h-full flex items-center justify-center text-3xl drop-shadow-sm">
                                                    {hexToEmoji(item.hex)}
                                                </div>
                                                {isCheckoutMode && (
                                                    <div className="absolute inset-0 rounded-full border-2 border-red-400 opacity-0 group-hover:opacity-100 animate-pulse" />
                                                )}
                                            </motion.button>
                                        ))}
                                        {/* Drop Hint */}
                                        {!isCheckoutMode && draggedItem?.zoneId === zone.id && (
                                            <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center pointer-events-none">
                                                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg animate-bounce">
                                                    DROP HERE
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* --- SCANNING MODAL --- */}
                    <AnimatePresence>
                        {scanningItem && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                            >
                                <div className="absolute inset-0" onClick={() => setScanningItem(null)} /> {/* Backdrop click close */}
                                <motion.div
                                    initial={{ scale: 0.5, y: 100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.5, y: 100 }}
                                    className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full relative overflow-hidden z-10"
                                >
                                    {/* Laser Effect */}
                                    <div className="absolute top-0 left-0 w-full h-2 bg-red-500 shadow-[0_0_20px_red] animate-[scan_1s_ease-in-out_infinite] z-20 pointer-events-none"
                                        style={{ animation: 'scan 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                                    />
                                    <style>{`@keyframes scan { 0% { top: 0% } 50% { top: 100% } 100% { top: 0% } }`}</style>

                                    <div className="flex flex-col items-center text-center relative z-10">
                                        <div className="w-32 h-32 mb-4 relative flex items-center justify-center text-7xl drop-shadow-xl">
                                            {hexToEmoji(scanningItem.hex)}
                                        </div>

                                        <h2 className="text-3xl font-black text-slate-800 mb-1">{scanningItem.w}</h2>
                                        <p className="text-xl font-bold text-slate-500 italic mb-4">{scanningItem.es}</p>

                                        <div className="bg-green-100 text-green-700 font-black px-4 py-1 rounded-full text-lg mb-6 shadow-sm border border-green-200">
                                            ${scanningItem.price}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 w-full">
                                            <button
                                                onClick={() => confirmScan(scanningItem)}
                                                className="bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 py-3 rounded-xl font-black text-xs transition-colors shadow-sm"
                                            >
                                                SCAN IT →
                                            </button>
                                            <button
                                                onClick={startListening}
                                                className={`active:scale-95 ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all`}
                                            >
                                                <Mic size={16} />
                                                {isListening ? 'LISTENING...' : 'SAY IT (+5 🟡)'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* --- PAYMENT SELECTION MODAL --- */}
                    <AnimatePresence>
                        {paymentStatus === 'selecting' && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
                            >
                                <div className="absolute inset-0" onClick={() => setPaymentStatus('idle')} />
                                <motion.div
                                    initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                                    className="bg-white p-8 rounded-[40px] shadow-2xl max-w-md w-full text-center relative z-10"
                                >
                                    <h2 className="text-2xl font-black text-slate-800 mb-6">CHOOSE PAYMENT METHOD</h2>

                                    <div className="grid grid-cols-1 gap-4 mb-6">
                                        <button
                                            onClick={() => processPayment('cash')}
                                            className="bg-green-100 hover:bg-green-200 border-4 border-green-400 rounded-3xl p-4 flex items-center gap-4 transition-all hover:scale-105 shadow-xl group"
                                        >
                                            <div className="bg-green-500 text-white p-3 rounded-2xl shadow-lg">
                                                <Banknote size={32} />
                                            </div>
                                            <div className="text-left">
                                                <span className="font-black text-green-800 text-lg uppercase block">Cash / Efectivo</span>
                                                <span className="text-[10px] font-bold text-green-600 block">Use your wallet coins</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => processPayment('debit')}
                                            className={`rounded-3xl p-4 flex items-center gap-4 transition-all shadow-xl group relative overflow-hidden
                                                ${hasNovaCard ? 'bg-blue-100 hover:bg-blue-200 border-4 border-blue-400 hover:scale-105' : 'bg-slate-100 border-4 border-slate-300 opacity-60 grayscale cursor-not-allowed'}`}
                                        >
                                            <div className={`${hasNovaCard ? 'bg-blue-500' : 'bg-slate-500'} text-white p-3 rounded-2xl shadow-lg`}>
                                                <CreditCard size={32} />
                                            </div>
                                            <div className="text-left">
                                                <span className="font-black text-blue-800 text-lg uppercase block">Debit Card / Débito</span>
                                                <span className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest italic block leading-none mb-1">"Mi Monedero"</span>
                                                <span className="text-[10px] font-bold text-blue-600 block">Use your own money (5% Cashback!)</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => processPayment('credit')}
                                            className={`rounded-3xl p-4 flex items-center gap-4 transition-all shadow-xl group relative overflow-hidden
                                                ${hasNovaCard ? 'bg-amber-100 hover:bg-amber-200 border-4 border-amber-400 hover:scale-105' : 'bg-slate-100 border-4 border-slate-300 opacity-60 grayscale cursor-not-allowed'}`}
                                        >
                                            <div className={`${hasNovaCard ? 'bg-amber-500' : 'bg-slate-500'} text-white p-3 rounded-2xl shadow-lg`}>
                                                <Zap size={32} fill="currentColor" />
                                            </div>
                                            <div className="text-left">
                                                <span className="font-black text-amber-800 text-lg uppercase block">Credit Card / Crédito</span>
                                                <span className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest italic block leading-none mb-1">"El Impulsor"</span>
                                                <span className="text-[10px] font-bold text-amber-600 block">Borrow from bank (Pay later!)</span>
                                            </div>
                                        </button>
                                    </div>

                                    <div className="bg-slate-100 p-4 rounded-xl flex justify-between items-center mb-6">
                                        <span className="text-sm font-bold text-slate-500 uppercase">Your Balance</span>
                                        <div className="flex items-center gap-2 font-black text-amber-500 text-2xl">
                                            <Coins size={24} fill="currentColor" /> {novaCoins}
                                        </div>
                                    </div>

                                    <button onClick={() => setPaymentStatus('idle')} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline">
                                        Cancel Payment
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* --- RECEIPT SUCCESS MODAL --- */}
                    <AnimatePresence>
                        {paymentStatus === 'paid' && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="absolute inset-0 z-[60] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
                            >
                                <motion.div
                                    initial={{ y: 20 }} animate={{ y: 0 }}
                                    className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-slate-100 max-w-sm w-full relative overflow-hidden"
                                >
                                    {/* Receipt Top Zigzag */}
                                    <div className="absolute top-0 left-0 w-full h-4 -mt-2 bg-slate-800 rotate-180" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}></div>

                                    <div className="mt-4 mb-4">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                                            <CheckCircle size={40} className="text-green-500" />
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-800 mb-1">APPROVED</h2>
                                        <p className="text-sm font-bold text-slate-400 uppercase">
                                            {paymentMethod === 'debit' ? 'DEBIT CARD "MI MONEDERO"' :
                                                paymentMethod === 'credit' ? 'CREDIT CARD "EL IMPULSOR"' :
                                                    'CASH PAYMENT RECEIVED'}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-4 mb-6 border-dashed border-2 border-slate-200">
                                        <div className="flex justify-between font-black text-3xl text-slate-800 mb-2">
                                            <span>TOTAL</span>
                                            <span>${totalBill}</span>
                                        </div>
                                        {(paymentMethod === 'debit' || paymentMethod === 'credit') && cashbackEarned > 0 && (
                                            <div className="flex justify-between items-center text-emerald-600 font-black text-sm mb-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100 animate-pulse">
                                                <span className="uppercase tracking-tighter">✨ Cashback Recibido</span>
                                                <span>+🪙 {cashbackEarned}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-xs font-bold text-amber-500">
                                            <span>Wallet Balance / Cartera</span>
                                            <span>{novaCoins} Coins</span>
                                        </div>
                                    </div>

                                    <Button onClick={resetStore} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
                                        <RefreshCcw size={20} className="mr-2" /> SHOP AGAIN
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
                {/* BOTTOM BAR */}
                {!isCheckoutMode && (
                    <div className="bg-white p-4 border-t border-slate-200 flex justify-between items-center relative z-40 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">
                            <Package size={14} className="text-blue-500" /> STOCK THE SHELVES
                        </div>
                        <Button
                            onClick={startCheckout}
                            disabled={placedItems.length === 0}
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-105 active:scale-95 text-white font-black px-8 py-6 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            GO TO CHECKOUT <ArrowLeft className="ml-2 rotate-180" size={16} />
                        </Button>
                    </div>
                )}
            </div>

            {/* BILINGUAL SUBTITLE OVERLAY */}
            <AnimatePresence>
                {currentSubtitle && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-[100] pointer-events-none"
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
                            <div className="h-px w-24 bg-white/20 my-1" />
                            <p className="text-indigo-300 text-lg md:text-xl font-bold italic opacity-90">
                                {currentSubtitle.es}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupermarketZone;
