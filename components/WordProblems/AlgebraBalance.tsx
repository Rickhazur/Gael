import React from 'react';
import { motion } from 'framer-motion';

interface AlgebraBalanceProps {
    leftExpr: string;
    rightExpr: string;
}

export const AlgebraBalance: React.FC<AlgebraBalanceProps> = ({ leftExpr, rightExpr }) => {
    return (
        <div className="algebra-balance w-full h-48 bg-slate-50 rounded-2xl border-4 border-indigo-100 relative overflow-hidden mt-4 mb-4 shadow-inner flex flex-col items-center justify-center">
            <div className="absolute top-2 left-4 text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">
                Visualizador de Balanza Algebraica
            </div>

            <div className="scale-container relative w-full h-32 flex items-end justify-center">
                {/* The Base */}
                <div className="absolute bottom-4 w-4 h-16 bg-slate-200 rounded-t-lg" />
                <div className="absolute bottom-0 w-32 h-4 bg-slate-200 rounded-lg" />

                {/* The Beam */}
                <motion.div
                    className="absolute bottom-20 w-3/4 h-2 bg-slate-400 rounded-full flex justify-between items-start px-2"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 0 }} // We keep it balanced as it's an equation
                >
                    {/* Left Plate */}
                    <div className="flex flex-col items-center -mt-2">
                        <div className="w-1 h-8 bg-slate-300" />
                        <div className="bg-white border-2 border-indigo-200 shadow-md rounded-xl px-4 py-2 min-w-[100px] text-center">
                            <span className="text-xl font-bold text-indigo-600">{leftExpr}</span>
                        </div>
                    </div>

                    {/* Right Plate */}
                    <div className="flex flex-col items-center -mt-2">
                        <div className="w-1 h-8 bg-slate-300" />
                        <div className="bg-white border-2 border-indigo-200 shadow-md rounded-xl px-4 py-2 min-w-[100px] text-center">
                            <span className="text-xl font-bold text-indigo-600">{rightExpr}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Equal Sign */}
                <div className="absolute bottom-20 text-4xl font-black text-indigo-300">=</div>
            </div>

            <p className="text-[10px] font-medium text-indigo-400 mt-2 italic px-8 text-center">
                "Recuerda: lo que quites o pongas en un lado, debes hacerlo también en el otro para mantener el equilibrio."
            </p>
        </div>
    );
};
