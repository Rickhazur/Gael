
import React from 'react';
import { AVAILABLE_GRADES } from '@/constants';

interface GradeSelectorProps {
    selectedGrade: number;
    onSelect: (grade: number) => void;
    variant: 'mobile' | 'desktop';
}

export const GradeSelector: React.FC<GradeSelectorProps> = ({ selectedGrade, onSelect, variant }) => {
    const isMobile = variant === 'mobile';

    return (
        <div className={`grid grid-cols-4 ${isMobile ? 'gap-1.5' : 'gap-2'}`}>
            {AVAILABLE_GRADES.map((g) => (
                <button
                    key={g}
                    type="button"
                    onClick={() => onSelect(g)}
                    className={`
                        font-bold transition-all transform active:scale-95 flex items-center justify-center
                        ${isMobile ? 'h-10 rounded-lg text-sm' : 'h-12 rounded-2xl text-base'}
                        ${selectedGrade === g
                            ? (isMobile
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-200')
                            : (isMobile
                                ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                                : 'bg-stone-50 text-stone-400 border border-stone-100 hover:border-indigo-300 hover:text-indigo-500 hover:bg-white')
                        }
                    `}
                >
                    {g}°
                </button>
            ))}
        </div>
    );
};
