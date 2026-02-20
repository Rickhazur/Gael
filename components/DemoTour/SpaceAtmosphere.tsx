import React from 'react';

export function SpaceAtmosphere() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0"
            style={{
                maskImage: 'radial-gradient(ellipse at center, transparent 35%, black 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 35%, black 70%)'
            }}
        >
            <style>{`
                @keyframes float-asteroid-demo {
                    0% { transform: translate(-100px, -100px) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translate(120%, 120%) rotate(360deg); opacity: 0; }
                }
                @keyframes comet-pass-demo {
                    0% { transform: translate(150%, -150%) rotate(225deg); opacity: 0; }
                    20% { opacity: 1; }
                    100% { transform: translate(-150%, 150%) rotate(225deg); opacity: 0; }
                }
                .asteroid-container-demo {
                    position: absolute;
                    pointer-events: none;
                    filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.8));
                }
                .comet-demo {
                    position: absolute;
                    width: 200px;
                    height: 2px;
                    background: linear-gradient(90deg, rgba(255,255,255,0), #fff, rgba(255,255,255,0));
                    box-shadow: 0 0 15px 2px rgba(56, 189, 248, 0.6);
                    border-radius: 100%;
                    z-index: 1;
                    mix-blend-mode: screen; 
                }
                .comet-demo::after {
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 6px;
                    height: 6px;
                    background: #fff;
                    border-radius: 50%;
                    box-shadow: 0 0 10px 4px rgba(56, 189, 248, 0.9);
                }
             `}</style>

            <svg width="0" height="0">
                <defs>
                    <radialGradient id="asteroidGrad3D" cx="40%" cy="40%" r="70%">
                        <stop offset="0%" stopColor="#94a3b8" />
                        <stop offset="50%" stopColor="#475569" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </radialGradient>
                </defs>
            </svg>

            {/* Asteroid 1 (Large) */}
            <div className="asteroid-container-demo" style={{ top: '10%', left: '5%', animation: 'float-asteroid-demo 45s linear infinite', animationDelay: '0s', opacity: 1, width: '80px' }}>
                <svg viewBox="0 0 100 100">
                    <path d="M50 5 C80 0 95 25 90 50 C85 85 60 95 40 90 C15 85 5 60 10 30 C15 10 30 5 50 5 Z" fill="url(#asteroidGrad3D)" stroke="#1e293b" strokeWidth="1" />
                    <circle cx="30" cy="40" r="8" fill="rgba(0,0,0,0.4)" />
                    <circle cx="60" cy="70" r="12" fill="rgba(0,0,0,0.3)" />
                </svg>
            </div>

            {/* Asteroid 2 (Small) */}
            <div className="asteroid-container-demo" style={{ top: '60%', left: '-10%', animation: 'float-asteroid-demo 35s linear infinite', animationDelay: '-15s', width: '40px' }}>
                <svg viewBox="0 0 100 100">
                    <path d="M30 10 C60 0 90 20 95 50 C90 90 40 95 20 80 C0 60 10 20 30 10 Z" fill="url(#asteroidGrad3D)" />
                </svg>
            </div>

            {/* Comets */}
            <div className="comet-demo" style={{ top: '20%', right: '10%', animation: 'comet-pass-demo 12s ease-in-out infinite', animationDelay: '3s' }} />
            <div className="comet-demo" style={{ top: '60%', right: '40%', animation: 'comet-pass-demo 18s ease-in-out infinite', animationDelay: '9s', width: '150px' }} />
        </div>
    );
}
