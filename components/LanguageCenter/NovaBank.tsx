import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    CreditCard,
    TrendingUp,
    History,
    ShieldCheck,
    ArrowUpRight,
    ArrowDownLeft,
    Lock,
    Plus,
    ChevronRight,
    Wallet,
    Info,
    Sparkles,
    CheckCircle2,
    ArrowRight,
    Calculator,
    Divide,
    Cpu,
    Globe,
    Zap,
    ArrowDownCircle,
    ArrowUpCircle,
    Star,
    Crown,
    Gift,
    Coins,
    AlertCircle,
    HandMetal
} from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { useNovaSound } from '@/hooks/useNovaSound';
import { edgeTTS } from '@/services/edgeTTS';

/* ═══════════════════════════════════════════════════════════════
   🏦 NOVA BANK TYPES
   ═══════════════════════════════════════════════════════════════ */

interface Transaction {
    id: string;
    type: 'income' | 'expense' | 'deposit' | 'withdrawal' | 'debt_payment' | 'credit_use';
    amount: number;
    description: string;
    descriptionEs: string;
    date: Date;
    category: string;
}

/* ═══════════════════════════════════════════════════════════════
   🏦 NOVA BANK COMPONENT (DUAL CARD EDITION)
   ═══════════════════════════════════════════════════════════════ */

export const NovaBank: React.FC = () => {
    const {
        novaCoins, earnCoins, spendCoins,
        savingsBalance, addCoinsToBank, withdrawCoinsFromBank,
        creditDebt, creditLimit, repayDebt, earnCoinsInBank,
        level, xp
    } = useGamification();
    const { playClick, playSuccess, playHover } = useNovaSound();

    // Get student name from localStorage
    const studentName = typeof window !== 'undefined'
        ? (localStorage.getItem('nova_user_name') || 'Student')
        : 'Student';

    // Bank specific state (transactions still local for now, but balance is global)

    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('nova_bank_history');
        if (!saved) return [];
        try {
            return JSON.parse(saved).map((t: any) => ({ ...t, date: new Date(t.date) }));
        } catch { return []; }
    });

    const [hasCard, setHasCard] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('nova_bank_has_card') === 'true';
    });

    const [hasCreditCard, setHasCreditCard] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('nova_bank_has_credit_card') === 'true';
    });

    const [activeTab, setActiveTab] = useState<'overview' | 'savings' | 'credit' | 'history'>('overview');
    const [subtitle, setSubtitle] = useState<{ en: string; es: string } | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(!hasCard);
    const [showCreditApplication, setShowCreditApplication] = useState(false);

    // Credit card requirements - ONLY BALANCE MATTERS NOW (User Request)
    const creditRequirements = useMemo(() => {
        const minBalance = 1000;
        const minTransactions = 0; // Removed transaction requirement

        return {
            hasBalance: savingsBalance >= minBalance,
            hasTransactions: transactions.length >= minTransactions,
            meetsAll: savingsBalance >= minBalance, // Ignore transaction count for approval
            minBalance,
            minTransactions
        };
    }, [savingsBalance, transactions]);

    useEffect(() => {
        localStorage.setItem('nova_bank_history', JSON.stringify(transactions));
        localStorage.setItem('nova_bank_has_card', hasCard.toString());
        localStorage.setItem('nova_bank_has_credit_card', hasCreditCard.toString());
    }, [transactions, hasCard, hasCreditCard]);

    // Robustness check: If user already has savings balance OR is advanced, they've clearly been here before.
    useEffect(() => {
        const isReturningUser = savingsBalance > 0 || novaCoins > 0 || transactions.length > 0 || level > 1 || xp > 50;
        if (isReturningUser && !hasCard) {
            console.log("Auto-activating bank card for returning student...");
            setHasCard(true);
            setShowOnboarding(false);
            localStorage.setItem('nova_bank_has_card', 'true');
        }
    }, [savingsBalance, novaCoins, transactions, hasCard, level, xp]);

    // Migration of wallet coins to savings (handled in context now, or one-time here)
    useEffect(() => {
        if (novaCoins > 0 && typeof window !== 'undefined') {
            const transferred = localStorage.getItem('nova_bank_transferred_wallet');
            if (!transferred) {
                addCoinsToBank(novaCoins);
                localStorage.setItem('nova_bank_transferred_wallet', 'true');
                addTransaction('deposit', novaCoins, `Initial transfer from wallet to bank`, `Transferencia inicial de cartera al banco`);
            }
        }
    }, [novaCoins]);

    const stats = useMemo(() => {
        const income = transactions
            .filter(t => t.type === 'income' || t.type === 'withdrawal')
            .reduce((acc, t) => acc + t.amount, 0);
        const expenses = transactions
            .filter(t => t.type === 'expense' || t.type === 'deposit' || t.type === 'debt_payment')
            .reduce((acc, t) => acc + t.amount, 0);
        return { income, expenses };
    }, [transactions]);

    const speak = async (en: string, es: string) => {
        setSubtitle({ en, es });
        await edgeTTS.speak(en, "rachelle");
        await edgeTTS.speak(es, "lina");
        setTimeout(() => setSubtitle(null), 3500);
    };

    const addTransaction = (type: Transaction['type'], amount: number, en: string, es: string) => {
        const newTx: Transaction = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            amount,
            description: en,
            descriptionEs: es,
            date: new Date(),
            category: 'Bank'
        };
        setTransactions(prev => [newTx, ...prev].slice(0, 50));
    };

    const handleDeposit = async (amount: number) => {
        if (novaCoins >= amount) {
            const success = await addCoinsToBank(amount);
            if (success) {
                addTransaction('deposit', amount, `Saving for my future!`, `¡Ahorrando para mi futuro!`);

                if (!hasCard) {
                    setHasCard(true);
                    setShowOnboarding(false);
                    playSuccess();
                    speak("Yippee! You've activated your Magic Nova Card!", "¡Siii! ¡Has activado tu Tarjeta Nova Mágica!");
                } else {
                    playSuccess();
                    speak("Your coins are safely tucked in the Magic Box!", "¡Tus monedas están bien guardadas en la Caja Mágica!");
                }
            }
        }
    };

    const handleWithdraw = async (amount: number) => {
        if (savingsBalance >= amount) {
            const success = await withdrawCoinsFromBank(amount);
            if (success) {
                addTransaction('withdrawal', amount, `Ready to spend some fun!`, `¡Listo para gastar y divertirme!`);
                playClick();
                speak("Coins in your wallet! Let's go shopping!", "¡Monedas en tu cartera! ¡Vamos de compras!");
            }
        }
    };

    const handleRepay = (amount: number) => {
        const interest = Math.ceil(amount * 0.05);
        if (novaCoins >= amount + interest) {
            if (repayDebt(amount)) {
                spendCoins(interest); // Extra interest payment
                addTransaction('debt_payment', amount + interest, `Repaying my debt + interest`, `Pagando mi deuda + interés`);
                playSuccess();
                speak(`Debt paid! You paid ${interest} extra as a thank you note to the bank.`, `¡Deuda pagada! Pagaste ${interest} extra como agradecimiento al banco.`);
            }
        } else {
            speak("Not enough coins for the payment and interest!", "¡No tienes suficientes monedas para el pago y el interés!");
        }
    };

    const handleApplyCreditCard = () => {
        if (creditRequirements.meetsAll) {
            setHasCreditCard(true);
            setShowCreditApplication(false);
            playSuccess();
            speak("Congratulations! Your Cosmic Pioneer Credit Card has been approved!", "¡Felicidades! ¡Tu Tarjeta de Crédito Pionero Cósmico ha sido aprobada!");
        } else {
            speak("You don't meet all the requirements yet. Keep saving and making transactions!", "¡Aún no cumples todos los requisitos. Sigue ahorrando y haciendo transacciones!");
        }
    };

    /* ══════ Sub-Components ══════ */

    const FloatingBubble = ({ i }: { i: number }) => (
        <motion.div
            initial={{ x: Math.random() * 100 + "%", y: "110%", scale: 0.5 + Math.random() * 1.5, opacity: 0.2 }}
            animate={{ y: "-10%", opacity: [0.2, 0.4, 0], rotate: 360 }}
            transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
            className="absolute w-12 h-12 bg-white/20 rounded-full blur-[2px] pointer-events-none"
        />
    );

    const BankHeader = () => (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 shrink-0 relative">
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(245,158,11,0.3)]">
                        <Building2 className="text-white" size={28} />
                    </div>
                    <div>
                        <span className="text-blue-600 font-black text-sm uppercase tracking-widest block">Financial Discovery Hub</span>
                        <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">NOVA BANK</h1>
                    </div>
                </div>
            </motion.div>

            <div className="flex gap-6">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-xl border-4 border-yellow-100">
                    <div className="w-16 h-16 bg-yellow-400 rounded-3xl flex items-center justify-center text-white"><Wallet size={32} /></div>
                    <div>
                        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Cash / Efectivo</div>
                        <div className="text-4xl font-black text-slate-900">🪙 {novaCoins}</div>
                    </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-xl border-4 border-emerald-100">
                    <div className="w-16 h-16 bg-emerald-400 rounded-3xl flex items-center justify-center text-white"><TrendingUp size={32} /></div>
                    <div>
                        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Savings Account / Cuenta de Ahorro</div>
                        <div className="text-4xl font-black text-slate-900">🪙 {savingsBalance}</div>
                    </div>
                </motion.div>

                {creditDebt > 0 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-rose-50 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-xl border-4 border-rose-100">
                        <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white"><AlertCircle size={32} /></div>
                        <div>
                            <div className="text-[11px] font-black text-rose-400 uppercase tracking-widest">Debt / Deuda</div>
                            <div className="text-4xl font-black text-rose-600">🪙 {creditDebt}</div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );

    const handleActivateAccount = async () => {
        setHasCard(true);
        setShowOnboarding(false);
        playSuccess();

        // Award Welcome Coins ONLY if they don't already have them (prevents duplicates)
        if (savingsBalance < 200) {
            const success = await earnCoinsInBank(200, "Welcome Bonus Coins!");
            if (success) {
                addTransaction('income', 200, "Welcome Bonus Coins!", "¡Monedas de Bienvenida!");
            }
        }

        speak("Welcome to Nova Bank! Your account is ready. You received 200 welcome coins!", "¡Bienvenido a Nova Bank! Tu cuenta está lista. ¡Recibiste 200 monedas de bienvenida!");
    };

    if (showOnboarding) {
        return (
            <div className="h-full bg-gradient-to-br from-sky-100 via-white to-purple-50 flex items-center justify-center p-6 relative overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => <FloatingBubble key={i} i={i} />)}
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-4xl w-full bg-white/80 backdrop-blur-xl border-4 border-white rounded-[4rem] p-16 relative z-10 shadow-2xl flex flex-col md:flex-row gap-16 items-center">
                    <div className="flex-1 text-center md:text-left">
                        <div className="w-32 h-32 bg-yellow-400 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-xl mx-auto md:mx-0"><Gift className="text-white" size={60} /></div>
                        <h2 className="text-5xl font-black text-slate-900 mb-6 leading-tight">Pick Your Hero Power Card!<br /><span className="text-blue-600">¡Elige Tu Tarjeta de Poder!</span></h2>
                        <p className="text-slate-500 font-bold text-lg mb-10 uppercase tracking-wide">Get <span className="text-emerald-500 font-black">200 Welcome Coins!</span> Ready to learn about Debits and Credits? / ¡Listo para aprender sobre Débito y Crédito!</p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3"><CheckCircle2 className="text-blue-500" /><span className="text-slate-700 font-black text-sm uppercase">DEBIT: Use what you have! / DÉBITO: ¡Usa lo que tienes!</span></div>
                            <div className="flex items-center gap-3"><CheckCircle2 className="text-amber-500" /><span className="text-slate-700 font-black text-sm uppercase">CREDIT: Borrow when needed! / CRÉDITO: ¡Pide prestado si necesitas!</span></div>
                        </div>
                    </div>
                    <div className="flex-1 bg-blue-50 p-12 rounded-[3.5rem] border-4 border-blue-100 text-center">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleActivateAccount} className="w-full py-8 bg-blue-600 text-white rounded-3xl font-black text-2xl uppercase shadow-xl flex items-center justify-center gap-4">
                            START JOURNEY! / ¡COMENZAR!
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col relative overflow-y-auto bg-slate-50 p-6 md:p-12 custom-scrollbar">
            <div className="fixed inset-0 pointer-events-none opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />

            <div className="max-w-[1500px] w-full mx-auto relative z-10 flex flex-col min-h-full pb-24">
                <BankHeader />

                <div className="grid lg:grid-cols-[450px_1fr] gap-12 flex-1 min-h-0">
                    {/* LEFT PANEL: THE CARDS */}
                    <div className="flex flex-col gap-8">
                        {/* DEBIT CARD (BLUE) */}
                        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-[3.5rem] p-8 shadow-xl border-4 border-blue-50 relative overflow-hidden flex flex-col items-center">
                            <div className="absolute top-4 right-6 bg-blue-100 px-3 py-1 rounded-full text-blue-600 font-black text-[10px] uppercase">Debit Card / Débito</div>
                            <motion.div className="w-full aspect-[1.586/1] rounded-[2rem] p-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => speak("This is your Stellar Explorer Debit Card. It uses the coins you've already earned on your learning journey!", "Esta es tu Tarjeta de Débito Explorador Estelar. ¡Usa las monedas que ya has ganado en tu viaje de aprendizaje!")}>
                                <div className="absolute inset-0 bg-white/10 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                                {/* Holographic NovaSchola Logo */}
                                <div className="absolute bottom-6 left-6 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-200 via-purple-300 to-pink-200 opacity-40 flex items-center justify-center overflow-hidden group-hover:opacity-60 transition-opacity">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
                                    <div className="relative z-10 font-black text-xs text-white/90 text-center leading-tight">
                                        <div className="text-[10px] tracking-tighter">NOVA</div>
                                        <div className="text-[6px] tracking-widest">SCHOLA</div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-start relative z-10">
                                    <div className="w-12 h-9 bg-yellow-400/80 rounded-lg" />
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2 font-black italic text-xl">NOVA <Sparkles size={16} /></div>
                                        <div className="text-[9px] font-bold opacity-80 uppercase tracking-wider">Stellar Explorer</div>
                                    </div>
                                </div>
                                <div className="mt-8 text-2xl font-mono font-black tracking-widest">**** **** **** 1002</div>
                                <div className="mt-8 flex justify-between items-end">
                                    <div>
                                        <div className="text-[8px] opacity-60 uppercase">Cardholder Name</div>
                                        <div className="font-black text-lg uppercase">{studentName}</div>
                                    </div>
                                    <HandMetal size={24} className="opacity-40" />
                                </div>
                            </motion.div>
                            <p className="mt-6 text-slate-400 font-black text-xs text-center uppercase tracking-widest">DEBIT: NO INTEREST • NO DEBT / DÉBITO: SIN INTERÉS • SIN DEUDA</p>
                        </motion.div>

                        {/* CREDIT CARD (GOLD) */}
                        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-[3.5rem] p-8 shadow-xl border-4 border-yellow-50 relative overflow-hidden flex flex-col items-center">
                            <div className="absolute top-4 right-6 bg-amber-100 px-3 py-1 rounded-full text-amber-600 font-black text-[10px] uppercase">Credit Card / Crédito</div>
                            <motion.div className="w-full aspect-[1.586/1] rounded-[2rem] p-8 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 text-white shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => speak("This is your Cosmic Pioneer Credit Card. Borrow coins for your missions and return them with a small thank-you gift!", "Esta es tu Tarjeta de Crédito Pionero Cósmico. ¡Pide prestadas monedas para tus misiones y devuélvelas con un pequeño regalo de agradecimiento!")}>
                                <div className="absolute inset-0 bg-white/20 opacity-30" style={{ backgroundImage: 'linear-gradient(45deg, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                                {/* Holographic NovaSchola Logo */}
                                <div className="absolute bottom-6 left-6 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-200 via-purple-300 to-pink-200 opacity-40 flex items-center justify-center overflow-hidden group-hover:opacity-60 transition-opacity">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
                                    <div className="relative z-10 font-black text-xs text-white/90 text-center leading-tight">
                                        <div className="text-[10px] tracking-tighter">NOVA</div>
                                        <div className="text-[6px] tracking-widest">SCHOLA</div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-start relative z-10">
                                    <div className="w-12 h-9 bg-slate-100/40 rounded-lg" />
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2 font-black italic text-xl">NOVA <Crown size={18} /></div>
                                        <div className="text-[9px] font-bold opacity-80 uppercase tracking-wider">Cosmic Pioneer</div>
                                    </div>
                                </div>
                                <div className="mt-8 text-2xl font-mono font-black tracking-widest">**** **** **** 8850</div>
                                <div className="mt-8 flex justify-between items-end">
                                    <div>
                                        <div className="text-[8px] opacity-60 uppercase">Cardholder Name</div>
                                        <div className="font-black text-lg uppercase">
                                            {hasCreditCard ? studentName : 'PENDING APPLICATION'}
                                        </div>
                                    </div>
                                    <Zap size={24} className="text-white/80" />
                                </div>
                            </motion.div>

                            {/* Credit Card Requirements / Application */}
                            {!hasCreditCard ? (
                                <div className="mt-6 w-full bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200">
                                    <div className="text-center mb-4">
                                        <h4 className="font-black text-amber-800 text-sm uppercase">Application Requirements</h4>
                                        <p className="text-[10px] text-amber-600 font-bold">Requisitos de Aplicación</p>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className={`flex items-center justify-between p-3 rounded-xl ${creditRequirements.hasBalance ? 'bg-emerald-100 border-emerald-300' : 'bg-slate-100 border-slate-300'} border-2`}>
                                            <div className="flex items-center gap-2">
                                                {creditRequirements.hasBalance ? <CheckCircle2 className="text-emerald-600" size={16} /> : <Lock className="text-slate-400" size={16} />}
                                                <span className="text-[11px] font-black text-slate-700">
                                                    Min. Balance: 🪙 {creditRequirements.minBalance}
                                                </span>
                                            </div>
                                            <span className={`text-[10px] font-bold ${creditRequirements.hasBalance ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {savingsBalance}/{creditRequirements.minBalance}
                                            </span>
                                        </div>

                                        <div className={`flex items-center justify-between p-3 rounded-xl ${creditRequirements.hasTransactions ? 'bg-emerald-100 border-emerald-300' : 'bg-slate-100 border-slate-300'} border-2`}>
                                            <div className="flex items-center gap-2">
                                                {creditRequirements.hasTransactions ? <CheckCircle2 className="text-emerald-600" size={16} /> : <Lock className="text-slate-400" size={16} />}
                                                <span className="text-[11px] font-black text-slate-700">
                                                    Min. Transactions: {creditRequirements.minTransactions}
                                                </span>
                                            </div>
                                            <span className={`text-[10px] font-bold ${creditRequirements.hasTransactions ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {transactions.length}/{creditRequirements.minTransactions}
                                            </span>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={creditRequirements.meetsAll ? { scale: 1.05 } : {}}
                                        whileTap={creditRequirements.meetsAll ? { scale: 0.95 } : {}}
                                        onClick={handleApplyCreditCard}
                                        disabled={!creditRequirements.meetsAll}
                                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase transition-all ${creditRequirements.meetsAll
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg cursor-pointer'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {creditRequirements.meetsAll ? '✨ Apply Now / Aplicar Ahora' : '🔒 Requirements Not Met / Requisitos No Cumplidos'}
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="mt-6 w-full bg-amber-50 p-4 rounded-xl border border-amber-100">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-amber-600"><span>Borrow Limit / Límite</span><span>🪙 {creditLimit}</span></div>
                                    <div className="flex justify-between text-[10px] font-black uppercase text-amber-600"><span>Interest Rate / Interés</span><span>5% "Happy Fee"</span></div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* RIGHT PANEL: ACTIONS */}
                    <div className="bg-white rounded-[4rem] flex flex-col overflow-hidden shadow-xl border-4 border-white">
                        <div className="flex bg-slate-50 border-b p-6 shrink-0 gap-4">
                            {(['overview', 'savings', 'credit', 'history'] as const).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>
                                    {tab === 'overview' ? 'Overview / Resumen' : tab === 'savings' ? 'Savings / Ahorro' : tab === 'credit' ? 'Debt / Deuda' : 'History / Historial'}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                            {activeTab === 'overview' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-blue-600 rounded-[3rem] p-12 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-10"><Zap size={100} /></div>
                                        <div className="text-sm font-black uppercase opacity-60 mb-2">Total Bank Balance / Saldo Bancario Total</div>
                                        <div className="text-8xl font-black">{savingsBalance}</div>
                                        {creditDebt > 0 && (
                                            <div className="mt-6 flex gap-4">
                                                <div className="px-4 py-2 bg-rose-500/30 rounded-full text-xs font-black">DEBT / DEUDA: -{creditDebt}</div>
                                                <div className="px-4 py-2 bg-white/20 rounded-full text-xs font-black">NET / NETO: {savingsBalance - creditDebt}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="p-8 bg-emerald-50 rounded-3xl border-2 border-emerald-100">
                                            <h4 className="font-black text-emerald-700 uppercase text-xs mb-4">Savings Benefit / Beneficio de Ahorro</h4>
                                            <div className="text-4xl font-black text-emerald-600 mb-2">🪙 +{(savingsBalance * 0.005).toFixed(1)}</div>
                                            <p className="text-[10px] font-bold text-emerald-500 uppercase">Safety Reward / Recompensa por Seguridad</p>
                                        </div>
                                        <div className="p-8 bg-rose-50 rounded-3xl border-2 border-rose-100">
                                            <h4 className="font-black text-rose-700 uppercase text-xs mb-4">Current Debt / Deuda Actual</h4>
                                            <div className="text-4xl font-black text-rose-600 mb-2">🪙 {creditDebt}</div>
                                            <p className="text-[10px] font-bold text-rose-500 uppercase">To pay later / Por pagar luego</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'savings' && (
                                <div className="h-full flex flex-col items-center justify-center gap-10 text-center">
                                    <div className="w-40 h-40 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500"><ShieldCheck size={80} /></div>
                                    <div>
                                        <h3 className="text-4xl font-black text-slate-800 uppercase">Keep your money safe!</h3>
                                        <p className="text-emerald-600 font-black text-xl mt-2">¡Mantén tu dinero seguro!</p>
                                        <p className="text-slate-500 font-bold max-w-md mx-auto mt-4">
                                            The safest place for your coins. Earn a small reward for keeping them safe!
                                        </p>
                                        <p className="text-slate-400 text-sm mt-2">
                                            El lugar más seguro para tus monedas. ¡Gana una pequeña recompensa por guardarlas!
                                        </p>
                                    </div>
                                    <div className="bg-emerald-50 p-8 rounded-3xl border-2 border-emerald-100 max-w-md">
                                        <div className="text-sm font-black text-emerald-700 uppercase mb-2">Weekly Reward / Recompensa Semanal</div>
                                        <div className="text-6xl font-black text-emerald-600">+🪙 {(savingsBalance * 0.005).toFixed(1)}</div>
                                        <div className="text-xs text-emerald-500 font-bold mt-2 uppercase">Based on current balance / Basado en saldo actual</div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'credit' && (
                                <div className="h-full flex flex-col items-center justify-center gap-10 text-center">
                                    {!hasCreditCard ? (
                                        <>
                                            <div className="w-40 h-40 bg-amber-100 rounded-full flex items-center justify-center text-amber-500"><Lock size={80} /></div>
                                            <div>
                                                <h3 className="text-4xl font-black text-slate-800 uppercase">Credit Card Not Approved</h3>
                                                <p className="text-amber-600 font-black text-xl mt-2">Tarjeta de Crédito No Aprobada</p>
                                                <p className="text-slate-500 font-bold max-w-md mx-auto mt-4">
                                                    Apply for your Cosmic Pioneer Credit Card to access credit features!
                                                </p>
                                                <p className="text-slate-400 text-sm mt-2">
                                                    ¡Aplica por tu Tarjeta de Crédito Pionero Cósmico para acceder a funciones de crédito!
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-40 h-40 bg-amber-100 rounded-full flex items-center justify-center text-amber-500"><AlertCircle size={80} /></div>
                                            <div>
                                                <h3 className="text-4xl font-black text-slate-800 uppercase">Debt Management / Manejo de Deuda</h3>
                                                {creditDebt > 0 ? (
                                                    <>
                                                        <p className="text-slate-500 font-bold max-w-md mx-auto mt-4 underline decoration-amber-500">You owe 🪙 {creditDebt} coins to the bank. / Debes 🪙 {creditDebt} monedas al banco.</p>
                                                        <p className="text-amber-600 text-[10px] font-black uppercase mt-2">Interest: +5% (Thank you fee) / Interés: +5% (Regalo de agradecimiento)</p>
                                                    </>
                                                ) : (
                                                    <p className="text-emerald-500 font-black uppercase mt-4">Your credit is clear! Zero Debt. / ¡Tu crédito está limpio! Cero Deuda.</p>
                                                )}
                                            </div>
                                            {creditDebt > 0 && (
                                                <div className="flex flex-col gap-4 w-full max-w-xs">
                                                    <button onClick={() => handleRepay(Math.min(creditDebt, 100))} className="w-full py-5 bg-amber-500 text-white rounded-3xl font-black shadow-lg">REPAY DEBT / PAGAR DEUDA</button>
                                                    <p className="text-[10px] text-slate-400 font-bold">COST: Amount + 5% Interest Fee / COSTO: Monto + 5% de Interés</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="space-y-4">
                                    {transactions.map(tx => (
                                        <div key={tx.id} className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between border-2 border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${tx.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                    {tx.amount > 0 ? <Plus size={20} /> : <ArrowDownLeft size={20} />}
                                                </div>
                                                <div><div className="font-black text-slate-800">{tx.description}</div><div className="text-[10px] text-slate-400 font-bold uppercase">{tx.descriptionEs}</div></div>
                                            </div>
                                            <div className={`text-2xl font-black ${tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {subtitle && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-8">
                        <div className="bg-slate-900/95 backdrop-blur-xl border-4 border-white/20 rounded-3xl p-10 shadow-2xl text-center">
                            <p className="text-white text-3xl font-black mb-2">{subtitle.en}</p>
                            <p className="text-blue-400 font-black text-xl italic uppercase tracking-widest">{subtitle.es}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; } 
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                @keyframes shimmer {
                    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                    100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
                }
            `}</style>
        </div>
    );
};

export default NovaBank;
