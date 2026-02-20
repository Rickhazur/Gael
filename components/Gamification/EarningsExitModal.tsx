import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Building2, Star } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';

interface EarningsExitModalProps {
    sessionEarnings: number;
    onComplete: () => void;
}

const EarningsExitModal: React.FC<EarningsExitModalProps> = ({ sessionEarnings, onComplete }) => {
    const { spendCoins } = useGamification();
    const [isTransferring, setIsTransferring] = useState(false);

    const handleBankTransfer = () => {
        setIsTransferring(true);

        // 1. Deduct from Wallet (as we are moving it to bank)
        // The coins were already added to the global wallet during gameplay via addXp/globalAddRewards
        spendCoins(sessionEarnings);

        // 2. Add to Savings (LocalStorage manual update to match NovaBank logic)
        const currentSavings = Number(localStorage.getItem('nova_bank_savings') || '200');
        const newSavings = currentSavings + sessionEarnings;
        localStorage.setItem('nova_bank_savings', newSavings.toString());

        // 3. Add to History
        const history = JSON.parse(localStorage.getItem('nova_bank_history') || '[]');
        history.unshift({
            id: Date.now(),
            type: 'deposit',
            amount: sessionEarnings,
            date: new Date().toLocaleDateString(),
            description: 'Activity Earnings / Ganancias'
        });
        localStorage.setItem('nova_bank_history', JSON.stringify(history));

        // 4. Complete after short delay for effect
        setTimeout(() => {
            onComplete();
        }, 1500);
    };

    const handleKeepInWallet = () => {
        // Coins are already in wallet from gameplay
        onComplete();
    };

    if (sessionEarnings <= 0) {
        // If no earnings, just exit immediately or show a "Good job anyway" 
        // But typically we should just exit unless we want to encourage them.
        // For now, let's just loop through to onComplete to avoid getting stuck, 
        // or show a simple summary. Let's show summary for positive reinforcement.
        // Actually, better to just exit if 0 to not annoy user? 
        // The user said "gano estos novacoins", implying > 0.
        // If 0, we can just call onComplete immediately in useEffect or render nothing.
        // But safe to show "0 coins" if they really earned nothing, so they know.
        // Let's stick to showing it.
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border-4 border-yellow-400 relative overflow-hidden text-center"
            >
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-yellow-500">
                    <Wallet size={120} />
                </div>

                <h2 className="text-2xl font-black text-slate-800 mb-1 uppercase">Session Complete!</h2>
                <p className="text-slate-500 font-bold mb-6">¡Sesión Completada!</p>

                <div className="bg-yellow-50 rounded-2xl p-6 mb-8 border-2 border-yellow-200">
                    <p className="text-xs font-black text-yellow-600 uppercase mb-2">You Earned / Ganaste</p>
                    <div className="text-5xl font-black text-slate-900 flex items-center justify-center gap-2">
                        <span>🪙</span> {sessionEarnings}
                    </div>
                </div>

                <p className="text-sm font-bold text-slate-600 mb-4 px-4">
                    Where do you want to keep your coins?
                    <br />
                    <span className="text-slate-400 font-normal">¿Dónde quieres guardar tus monedas?</span>
                </p>

                {isTransferring ? (
                    <div className="py-8 flex flex-col items-center animate-pulse">
                        <Building2 size={48} className="text-emerald-500 mb-4" />
                        <p className="font-black text-emerald-600">Transferring to Bank...</p>
                    </div>
                ) : (
                    <div className="space-y-3 relative z-10">
                        <button
                            onClick={handleKeepInWallet}
                            className="w-full py-4 bg-white border-4 border-slate-100 rounded-2xl font-black text-slate-600 uppercase hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Wallet size={16} />
                            </div>
                            <span>Keep in Wallet / Billetera</span>
                        </button>

                        <button
                            onClick={handleBankTransfer}
                            className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase hover:bg-emerald-600 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <Building2 size={16} />
                            </div>
                            <span>Send to Bank / Banco</span>
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default EarningsExitModal;
