import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
    type?: 'card' | 'list' | 'text' | 'avatar' | 'notebook' | 'full-page';
    count?: number;
    className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    type = 'card',
    count = 1,
    className = ''
}) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className={`bg-white rounded-2xl p-6 shadow-md ${className}`}>
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                            <div className="h-32 bg-slate-200 rounded"></div>
                            <div className="flex gap-2">
                                <div className="h-8 bg-slate-200 rounded flex-1"></div>
                                <div className="h-8 bg-slate-200 rounded flex-1"></div>
                            </div>
                        </div>
                    </div>
                );

            case 'list':
                return (
                    <div className={`space-y-3 ${className}`}>
                        {[...Array(count)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="animate-pulse flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'text':
                return (
                    <div className={`space-y-2 ${className}`}>
                        <div className="animate-pulse space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                        </div>
                    </div>
                );

            case 'avatar':
                return (
                    <div className={`flex items-center gap-4 ${className}`}>
                        <div className="animate-pulse flex items-center gap-4">
                            <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-32"></div>
                                <div className="h-3 bg-slate-200 rounded w-24"></div>
                            </div>
                        </div>
                    </div>
                );

            case 'notebook':
                return (
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
                        {[...Array(count)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-white rounded-2xl p-6 shadow-lg">
                                <div className="animate-pulse h-full flex flex-col">
                                    <div className="w-16 h-16 bg-slate-200 rounded-xl mb-4"></div>
                                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                                    <div className="flex-1"></div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'full-page':
                return (
                    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center ${className}`}>
                        <div className="text-center">
                            <motion.div
                                className="w-24 h-24 mx-auto mb-6"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 180, 360]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <div className="w-full h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-80"></div>
                            </motion.div>
                            <h2 className="text-2xl font-bold text-slate-700 mb-2">
                                Cargando tu aventura...
                            </h2>
                            <p className="text-slate-500">
                                Preparando todo para ti ✨
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return <>{renderSkeleton()}</>;
};

// Componente de Loading con mensaje personalizado
interface LoadingMessageProps {
    message?: string;
    submessage?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({
    message = 'Cargando...',
    submessage,
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-16 h-16',
        lg: 'w-24 h-24'
    };

    const textSizes = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl'
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <motion.div
                className={`${sizeClasses[size]} mb-4`}
                animate={{
                    rotate: 360
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                <div className="w-full h-full rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
            </motion.div>
            <h3 className={`${textSizes[size]} font-bold text-slate-700 mb-2`}>
                {message}
            </h3>
            {submessage && (
                <p className="text-slate-500 text-center max-w-md">
                    {submessage}
                </p>
            )}
        </div>
    );
};

// Loading específico para generación de imágenes
export const ImageGenerationLoading: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <motion.div
                className="relative w-32 h-32 mb-6"
                animate={{
                    rotate: [0, 360]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 opacity-30 blur-xl"></div>
                <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center text-4xl">
                    🎨
                </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">
                Generando tu imagen educativa...
            </h3>
            <p className="text-slate-500 text-center max-w-md">
                Nuestra IA está creando una ilustración perfecta para ayudarte a aprender
            </p>
            <div className="mt-6 flex gap-2">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-3 h-3 bg-indigo-500 rounded-full"
                        animate={{
                            y: [0, -10, 0]
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
