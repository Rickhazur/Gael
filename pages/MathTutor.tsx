import React, { useState, useEffect } from 'react';
import { MathTutorBoard } from '@/components/MathMaestro/tutor/MathTutorBoard';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoTour } from '@/context/DemoTourContext';
import { ViewState } from '@/types';

const MathTutor = ({ gradeLevel, userName, userId, onNavigate }: { gradeLevel: number; userName?: string; userId?: string; onNavigate?: (view: ViewState) => void }) => {
  const { tourState } = useDemoTour();
  const [showIntro, setShowIntro] = useState(!tourState.isActive);

  useEffect(() => {
    if (tourState.isActive) {
      setShowIntro(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4500); // Animation duration
    return () => clearTimeout(timer);
  }, [tourState.isActive]);

  return (
    <>
      <AnimatePresence mode='wait'>
        {showIntro && (
          <motion.div
            key="math-intro"
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 0.8 }}
          >
            {/* 1. Matrix Background Stream (Subtle) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-[-100px] text-cyan-500 font-mono text-xl font-bold opacity-0"
                  style={{ left: `${Math.random() * 100}%` }}
                  animate={{
                    y: ['0vh', '120vh'],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: Math.random() * 2 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "linear"
                  }}
                >
                  {Math.floor(Math.random() * 10)} {['+', '-', 'x', '÷'][Math.floor(Math.random() * 4)]} {Math.floor(Math.random() * 100)}
                </motion.div>
              ))}
            </div>

            {/* 2. The 3D Cube Container */}
            <div className="relative">
              {/* Rotating Rings */}
              <motion.div
                className="absolute inset-0 border-4 border-cyan-500/30 rounded-full w-64 h-64 -left-20 -top-20"
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 border-2 border-purple-500/30 rounded-full w-80 h-80 -left-28 -top-28"
                animate={{ rotate: -360, scale: [1, 0.9, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />

              {/* Central Glowing Cube (Conceptual Representation) */}
              <motion.div
                className="relative w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.8)] flex items-center justify-center z-10"
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1.5, 0.5, 50], // Explodes at the end
                  rotate: [0, 360, 720, 1080],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{ duration: 4, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }}
              >
                <span className="text-4xl font-black text-white">π</span>
              </motion.div>

              {/* Flying Numbers Ejecting from Cube */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute top-0 left-0 text-white font-bold text-2xl"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: [0, (Math.random() - 0.5) * 400],
                    y: [0, (Math.random() - 0.5) * 400],
                    scale: [0, 1.5],
                    rotate: Math.random() * 360
                  }}
                  transition={{
                    delay: 1,
                    duration: 2,
                    ease: "easeOut"
                  }}
                >
                  {['123', '45', '78', '+', '-', '%'][i % 6]}
                </motion.div>
              ))}
            </div>

            {/* 3. Text Announcement */}
            <motion.h2
              className="absolute bottom-20 text-3xl font-black text-white tracking-widest uppercase font-mono"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, letterSpacing: "10px" }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Iniciando Sistema Matemático...
            </motion.h2>

          </motion.div>
        )}
      </AnimatePresence>

      {!showIntro && (
        <motion.div
          className="w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <MathTutorBoard initialGrade={gradeLevel} userName={userName} userId={userId} onNavigate={onNavigate} />
        </motion.div>
      )}
    </>
  );
};

export default MathTutor;
