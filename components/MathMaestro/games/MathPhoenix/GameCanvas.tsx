
import { useEffect, useRef, memo } from 'react';
import { Egg, Phoenix, Player, GameDimensions } from './types/game';

interface GameCanvasProps {
    eggs: Egg[];
    phoenix: Phoenix;
    player: Player;
    dimensions: GameDimensions;
    onPlayerMove: (x: number) => void;
    className?: string; // Add optional className
}

// Star background
interface Star {
    x: number;
    y: number;
    size: number;
    speed: number;
    brightness: number;
}

const GameCanvas = memo(({ eggs, phoenix, player, dimensions, onPlayerMove, className }: GameCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);

    // Initialize stars
    useEffect(() => {
        starsRef.current = Array.from({ length: 100 }, () => ({
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.1,
            brightness: Math.random(),
        }));
    }, [dimensions]);

    // Draw game
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);

        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.5, '#0f1629');
        gradient.addColorStop(1, '#1a0a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);

        // Draw and update stars
        starsRef.current.forEach(star => {
            const twinkle = Math.sin(Date.now() * 0.002 + star.brightness * 10) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.7})`;
            ctx.fill();

            // Move stars down slowly
            star.y += star.speed;
            if (star.y > dimensions.height) {
                star.y = 0;
                star.x = Math.random() * dimensions.width;
            }
        });

        // Draw Phoenix (bird)
        const drawPhoenix = () => {
            ctx.save();
            ctx.translate(phoenix.x, phoenix.y);

            // Wing animation
            const wingFlap = Math.sin(phoenix.wingPhase) * 15;

            // Body glow
            const bodyGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
            bodyGlow.addColorStop(0, 'rgba(255, 100, 50, 0.8)');
            bodyGlow.addColorStop(0.5, 'rgba(255, 50, 0, 0.4)');
            bodyGlow.addColorStop(1, 'rgba(255, 50, 0, 0)');
            ctx.fillStyle = bodyGlow;
            ctx.beginPath();
            ctx.arc(0, 0, 50, 0, Math.PI * 2);
            ctx.fill();

            // Left wing
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.quadraticCurveTo(-40, -10 + wingFlap, -50, 10 + wingFlap);
            ctx.quadraticCurveTo(-35, 15, -10, 10);
            ctx.fill();

            // Right wing
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.quadraticCurveTo(40, -10 + wingFlap, 50, 10 + wingFlap);
            ctx.quadraticCurveTo(35, 15, 10, 10);
            ctx.fill();

            // Body
            ctx.fillStyle = '#ff4500';
            ctx.beginPath();
            ctx.ellipse(0, 5, 20, 25, 0, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath();
            ctx.arc(0, -15, 15, 0, Math.PI * 2);
            ctx.fill();

            // Beak
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(-5, -5);
            ctx.lineTo(5, -5);
            ctx.closePath();
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-6, -18, 4, 0, Math.PI * 2);
            ctx.arc(6, -18, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-5, -18, 2, 0, Math.PI * 2);
            ctx.arc(7, -18, 2, 0, Math.PI * 2);
            ctx.fill();

            // Tail feathers
            ctx.fillStyle = '#ff4500';
            ctx.beginPath();
            ctx.moveTo(-5, 25);
            ctx.quadraticCurveTo(-15, 45, -10, 55);
            ctx.quadraticCurveTo(0, 50, 0, 40);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(5, 25);
            ctx.quadraticCurveTo(15, 45, 10, 55);
            ctx.quadraticCurveTo(0, 50, 0, 40);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(0, 28);
            ctx.quadraticCurveTo(0, 50, 0, 60);
            ctx.quadraticCurveTo(-3, 55, -5, 50);
            ctx.quadraticCurveTo(0, 45, 5, 50);
            ctx.quadraticCurveTo(3, 55, 0, 60);
            ctx.fill();

            ctx.restore();
        };

        // Draw eggs
        const drawEgg = (egg: Egg) => {
            ctx.save();
            ctx.translate(egg.x, egg.y);
            ctx.rotate((egg.rotation * Math.PI) / 180);

            // Egg glow
            const eggColor = egg.isCorrect ? '#22c55e' : '#f59e0b';
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
            glowGradient.addColorStop(0, egg.isCorrect ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)');
            glowGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, 40, 0, Math.PI * 2);
            ctx.fill();

            // Egg shape
            ctx.fillStyle = '#fff8e1';
            ctx.beginPath();
            ctx.ellipse(0, 0, 22, 28, 0, 0, Math.PI * 2);
            ctx.fill();

            // Egg highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.ellipse(-6, -8, 6, 10, -0.3, 0, Math.PI * 2);
            ctx.fill();

            // Egg border glow
            ctx.strokeStyle = eggColor;
            ctx.lineWidth = 3;
            ctx.shadowColor = eggColor;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.ellipse(0, 0, 22, 28, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Number on egg
            ctx.fillStyle = '#1a1a2e';
            ctx.font = 'bold 18px Orbitron';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(egg.value.toString(), 0, 2);

            ctx.restore();
        };

        // Draw player (basket/ship)
        const drawPlayer = () => {
            ctx.save();
            ctx.translate(player.x, dimensions.playerY);

            // Ship glow
            const shipGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
            shipGlow.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
            shipGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = shipGlow;
            ctx.beginPath();
            ctx.arc(0, 0, 60, 0, Math.PI * 2);
            ctx.fill();

            // Main hull
            ctx.fillStyle = '#1e3a5f';
            ctx.beginPath();
            ctx.moveTo(-40, 10);
            ctx.lineTo(-35, -15);
            ctx.lineTo(35, -15);
            ctx.lineTo(40, 10);
            ctx.quadraticCurveTo(0, 25, -40, 10);
            ctx.fill();

            // Hull highlight
            ctx.fillStyle = '#2d5a87';
            ctx.beginPath();
            ctx.moveTo(-30, -10);
            ctx.lineTo(-25, -20);
            ctx.lineTo(25, -20);
            ctx.lineTo(30, -10);
            ctx.closePath();
            ctx.fill();

            // Cockpit
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.ellipse(0, -5, 15, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Cockpit glass
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.ellipse(-4, -8, 5, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Side thrusters
            ctx.fillStyle = '#ff6b35';
            ctx.shadowColor = '#ff6b35';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.ellipse(-35, 5, 4, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(35, 5, 4, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Neon trim
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(-40, 10);
            ctx.lineTo(-35, -15);
            ctx.lineTo(35, -15);
            ctx.lineTo(40, 10);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.restore();
        };

        // Draw all elements
        drawPhoenix();
        eggs.forEach(drawEgg);
        drawPlayer();
    }, [eggs, phoenix, player, dimensions]);

    // Handle touch/mouse input
    const handleInteraction = (clientX: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left) * (dimensions.width / rect.width);
        onPlayerMove(x);
    };

    return (
        <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className={className || "rounded-lg neon-border touch-none"}
            onMouseMove={(e) => handleInteraction(e.clientX)}
            onTouchMove={(e) => {
                e.preventDefault();
                handleInteraction(e.touches[0].clientX);
            }}
        />
    );
});

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;
