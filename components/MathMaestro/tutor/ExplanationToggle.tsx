import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface ExplanationToggleProps {
    showDetailed: boolean;
    onToggle: () => void;
    className?: string;
}

export const ExplanationToggle: React.FC<ExplanationToggleProps> = ({
    showDetailed,
    onToggle,
    className = ''
}) => {
    return (
        <motion.button
            onClick={onToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${className}`}
            style={{
                background: showDetailed
                    ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                    : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                color: 'white',
                boxShadow: showDetailed
                    ? '0 4px 15px rgba(168, 85, 247, 0.4)'
                    : '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {showDetailed ? (
                <>
                    <Eye className="w-5 h-5" />
                    <span>Explicación Detallada</span>
                    <motion.div
                        className="ml-1 w-2 h-2 rounded-full bg-green-300"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    />
                </>
            ) : (
                <>
                    <EyeOff className="w-5 h-5" />
                    <span>Modo Compacto</span>
                </>
            )}
        </motion.button>
    );
};
