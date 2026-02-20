import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/services/supabase';
import { PET_SPECIES } from '@/data/petsData';

interface MiniPetProps {
    userId: string;
    isCelebrating?: boolean;
}

export const MiniPet: React.FC<MiniPetProps> = ({ userId, isCelebrating }) => {
    const [pet, setPet] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPet = async () => {
            if (!supabase || !userId) return;
            const { data } = await supabase
                .from('student_pets')
                .select('*')
                .eq('student_id', userId)
                .maybeSingle();

            if (data) setPet(data);
            setIsLoading(false);
        };
        fetchPet();
    }, [userId]);

    const currentStage = useMemo(() => {
        if (!pet) return null;
        const species = PET_SPECIES.find(s => s.type === pet.type);
        if (!species) return null;
        return [...species.stages].reverse().find(s => pet.level >= s.level) || species.stages[0];
    }, [pet]);

    if (isLoading || !pet || !currentStage) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{
                opacity: 1,
                scale: isCelebrating ? [1, 1.2, 1] : 1,
                y: isCelebrating ? [0, -30, 0] : 0
            }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex flex-col items-center gap-1 group"
        >
            <motion.div
                animate={{
                    y: isCelebrating ? 0 : [0, -5, 0],
                    rotate: isCelebrating ? [0, 360] : [0, -2, 2, 0]
                }}
                transition={{
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    rotate: isCelebrating ? { duration: 0.5 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative"
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-xl group-hover:bg-indigo-400/40 transition-colors" />

                <img
                    src={currentStage.image}
                    alt={pet.name}
                    className="w-16 h-16 object-contain relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform"
                />
            </motion.div>

            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/50 px-2 py-0.5 rounded-full border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                {pet.name}
            </span>
        </motion.div>
    );
};
