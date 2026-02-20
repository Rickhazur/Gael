
// --- HELPER: Mobile Feature Card (Nano Style) ---
const MobileFeatureCard = ({ title, icon, color, onClick, delay }: { title: string, icon: string, color: string, onClick: () => void, delay: number }) => (
    <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay }}
        onClick={onClick}
        className="relative h-32 rounded-[1.5rem] bg-slate-800/50 border border-white/5 overflow-hidden group active:scale-95 transition-transform"
    >
        {/* Hover Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 transition-opacity`} />

        {/* Glow Blob */}
        <div className={`absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br ${color} blur-[40px] opacity-40`} />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="text-4xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">{icon}</span>
            <span className="text-sm font-bold text-white/90">{title}</span>
        </div>
    </motion.button>
);
