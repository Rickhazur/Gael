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
                @keyframes float-asteroid {
                    0% { transform: translate(-100px, -100px) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translate(120%, 120%) rotate(360deg); opacity: 0; }
                }
                @keyframes comet-pass {
                    0% { transform: translate(150%, -150%) rotate(225deg); opacity: 0; }
                    20% { opacity: 1; }
                    100% { transform: translate(-150%, 150%) rotate(225deg); opacity: 0; }
                }
                .asteroid-container {
                    position: absolute;
                    pointer-events: none;
                    filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.8));
                }
                .comet {
                    position: absolute;
                    width: 200px;
                    height: 2px;
                    background: linear-gradient(90deg, rgba(255,255,255,0), #fff, rgba(255,255,255,0));
                    box-shadow: 0 0 15px 2px rgba(56, 189, 248, 0.6);
                    border-radius: 100%;
                    z-index: 1;
                    mix-blend-mode: screen; 
                }
                .comet::after {
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

            {/* Asteroid 1 (Large - Detailed with craters) */}
            <div className="asteroid-container" style={{ top: '10%', left: '5%', animation: 'float-asteroid 45s linear infinite', animationDelay: '0s', opacity: 1, width: '80px' }}>
                <svg viewBox="0 0 100 100">
                    <path d="M50 5 C80 0 95 25 90 50 C85 85 60 95 40 90 C15 85 5 60 10 30 C15 10 30 5 50 5 Z" fill="url(#asteroidGrad3D)" stroke="#1e293b" strokeWidth="1" />
                    <circle cx="30" cy="40" r="8" fill="rgba(0,0,0,0.4)" />
                    <circle cx="60" cy="70" r="12" fill="rgba(0,0,0,0.3)" />
                    <ellipse cx="70" cy="30" rx="5" ry="8" fill="rgba(0,0,0,0.5)" transform="rotate(20 70 30)" />
                </svg>
            </div>

            {/* Asteroid 2 (Small with crater) */}
            <div className="asteroid-container" style={{ top: '60%', left: '-10%', animation: 'float-asteroid 35s linear infinite', animationDelay: '-15s', width: '40px' }}>
                <svg viewBox="0 0 100 100">
                    <path d="M30 10 C60 0 90 20 95 50 C90 90 40 95 20 80 C0 60 10 20 30 10 Z" fill="url(#asteroidGrad3D)" />
                    <circle cx="50" cy="50" r="10" fill="rgba(0,0,0,0.5)" />
                </svg>
            </div>

            {/* Asteroid 3 (Medium - Top Right) */}
            <div className="asteroid-container" style={{ top: '-10%', left: '70%', animation: 'float-asteroid 50s linear infinite', animationDelay: '-5s', width: '60px' }}>
                <svg viewBox="0 0 100 100">
                    <path d="M40 0 C70 10 90 30 85 70 C80 95 40 90 20 80 C5 60 15 10 40 0 Z" fill="url(#asteroidGrad3D)" />
                    <ellipse cx="60" cy="40" rx="15" ry="10" fill="rgba(0,0,0,0.4)" />
                </svg>
            </div>

            {/* Asteroid 4 (Distant - Blurred) */}
            <div className="asteroid-container" style={{ top: '20%', right: '-10%', animation: 'float-asteroid 60s linear infinite', animationDelay: '-25s', width: '100px', filter: 'blur(1px) drop-shadow(2px 4px 6px rgba(0,0,0,0.8))' }}>
                <svg viewBox="0 0 100 100">
                    <path d="M40 5 C80 0 95 40 80 80 C60 100 20 90 10 60 C0 30 20 5 40 5 Z" fill="url(#asteroidGrad3D)" />
                    <circle cx="40" cy="50" r="20" fill="rgba(0,0,0,0.2)" />
                </svg>
            </div>

            {/* Asteroid 5 (Tiny - Fast) */}
            <div className="asteroid-container" style={{ top: '50%', right: '-15%', animation: 'float-asteroid 40s linear infinite', animationDelay: '-10s', width: '30px' }}>
                <svg viewBox="0 0 100 100">
                    <path d="M20 10 C50 0 80 30 90 60 C95 90 50 95 10 80 C0 50 5 20 20 10 Z" fill="url(#asteroidGrad3D)" />
                </svg>
            </div>

            {/* Asteroid 6 (Bottom Left) */}
            <div className="asteroid-container" style={{ top: '70%', left: '2%', animation: 'float-asteroid 55s linear infinite', animationDelay: '-30s', width: '50px' }}>
                <svg viewBox="0 0 100 100">
                    <path d="M35 5 C65 10 85 35 80 65 C70 90 30 95 15 75 C5 55 10 15 35 5 Z" fill="url(#asteroidGrad3D)" />
                    <circle cx="45" cy="45" r="12" fill="rgba(0,0,0,0.35)" />
                </svg>
            </div>

            {/* Comets */}
            <div className="comet" style={{ top: '20%', right: '10%', animation: 'comet-pass 12s ease-in-out infinite', animationDelay: '3s' }} />
            <div className="comet" style={{ top: '60%', right: '40%', animation: 'comet-pass 18s ease-in-out infinite', animationDelay: '9s', width: '150px' }} />
        </div>
    );
}
