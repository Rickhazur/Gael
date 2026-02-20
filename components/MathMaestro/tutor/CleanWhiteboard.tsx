import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface WhiteboardRef {
    getImage: () => string | null;
    clear: () => void;
    drawImage: (url: string) => void;
    drawText: (text: string, highlights?: { text: string; color?: string }[]) => void;
    drawDivisionStep: (dividend: string, divisor: string, quotient: string, product?: string, remainder?: string, highlight?: string, style?: 'us' | 'latin', columnIndex?: number, visualData?: any) => void;
    drawGeometry: (shape: string, params: any) => void;
    drawFraction: (dataOrNum: any, denominator?: number, type?: string) => void;
    drawFractionEquation: (visualData: any) => void;
    drawDataPlot: (data: number[]) => void;
    drawVerticalOp: (n1: string | string[], n2?: string, result?: string | string[], operator?: string, carry?: string, highlight?: string, borrows?: any[], helpers?: any[], visualData?: any) => void;
    drawBase10Blocks: (value: number) => void;
    drawMultiplicationGroups: (numGroups: number, itemsPerGroup: number, itemType?: string) => void;
    drawDecomposition: (n1: number, factors1: number[], n2: number, factors2: number[]) => void;
    drawAlgebra: (equation: string, variable: string, phase: string, highlight?: string) => void;
    drawCoordinateGrid: (points: { x: number; y: number; label?: string }[], currentPoint?: { x: number; y: number }, phase?: string) => void;
    drawSolutionSteps: (steps: string[], currentStepIndex?: number) => void;
    triggerCelebration: (type?: 'stars' | 'confetti' | 'bubbles') => void;
    setShowGrid: (show: boolean) => void;
    setupDragAndDrop: (bgUrl: string, items: { id: string, imgUrl: string, count: number }[]) => void;
    drawProportionTable: (a1: string, b1: string, a2: string, b2: string, unitA: string, unitB: string, highlight?: string) => void;
}

export const CleanWhiteboard = forwardRef<WhiteboardRef, any>((props, ref) => {


    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const isDrawing = useRef(false);
    const activePointerId = useRef<number | null>(null);
    const lastX = useRef(0);
    const lastY = useRef(0);
    const animationRef = useRef<number | null>(null);
    const isAnimatingRef = useRef<boolean>(false);
    const timeouts = useRef<NodeJS.Timeout[]>([]);
    const particles = useRef<any[]>([]);
    const lastRenderTime = useRef<number>(0);
    const showGrid = useRef<boolean>(false); // Tablero en blanco (sin cuadrícula)

    const drawTextContent = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, text: string, highlights: { text: string; color?: string }[] = [], skipClear = false) => {
        if (!text || !String(text).trim()) return 0;

        const dpr = window.devicePixelRatio || 1;
        const cW = canvas.width / dpr, cH = canvas.height / dpr;

        if (!skipClear) {
            ctx.clearRect(0, 0, cW, cH);
        }

        const baseFontSize = cW < 500 ? 28 : 40;
        ctx.font = `bold ${baseFontSize}px 'Comic Sans MS', cursive, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const colorMap: Record<string, { fill: string; shadow: string }> = {
            blue: { fill: "#3b82f6", shadow: "rgba(59, 130, 246, 0.4)" },
            green: { fill: "#22c55e", shadow: "rgba(34, 197, 94, 0.4)" },
            gold: { fill: "#f59e0b", shadow: "rgba(245, 158, 11, 0.4)" },
            orange: { fill: "#f97316", shadow: "rgba(249, 115, 22, 0.4)" },
            purple: { fill: "#a855f7", shadow: "rgba(168, 85, 247, 0.4)" },
            red: { fill: "#ef4444", shadow: "rgba(239, 68, 68, 0.4)" },
            default: { fill: "#f59e0b", shadow: "rgba(245, 158, 11, 0.4)" }
        };

        const maxWidth = cW * 0.85;
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) currentLine += " " + word;
            else { lines.push(currentLine); currentLine = word; }
        }
        lines.push(currentLine);

        const lineHeight = baseFontSize * 1.6;
        const totalHeight = lines.length * lineHeight;

        if (totalHeight > cH * 0.9 && !skipClear) {
            const newHeight = totalHeight + 200;
            canvas.style.height = `${newHeight}px`;
            canvas.height = newHeight * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            ctx.font = `bold ${baseFontSize}px 'Comic Sans MS', cursive, sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
        }

        let startY = (totalHeight > cH * 0.8)
            ? 80
            : (canvas.height / (dpr * (skipClear ? 1 : 1)) - totalHeight) / (skipClear ? 4 : 2) + (lineHeight / 2);

        if (skipClear) startY = 60; // Start at top for combined views

        lines.forEach((line, idx) => {
            const y = startY + (idx * lineHeight);
            const lineWidth = ctx.measureText(line).width;
            let currentX = (cW - lineWidth) / 2;
            const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const highlightTexts = highlights.filter(h => h.text).map(h => escapeRegExp(h.text));

            if (highlightTexts.length === 0) {
                ctx.fillStyle = "#1e293b";
                ctx.fillText(line, currentX, y);
                return;
            }
            const regex = new RegExp(`(${highlightTexts.join('|')})`, 'gi');
            const parts = line.split(regex);
            const fractionRegex = /(\d+\/\d+)/g;
            const subParts = line.split(regex);

            subParts.forEach(part => {
                if (!part) return;

                // Further split by fractions if not already a highlight
                const hlMatch = highlights.find(h => h.text && h.text.toLowerCase() === part.toLowerCase());

                if (hlMatch) {
                    const colors = colorMap[hlMatch.color || 'default'] || colorMap.default;
                    ctx.save();
                    ctx.fillStyle = colors.fill;
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = colors.shadow;

                    // Even highlights can contain fractions
                    if (part.includes('/')) {
                        const fracs = part.split(/(\d+\/\d+)/g);
                        fracs.forEach(fp => {
                            if (/\d+\/\d+/.test(fp)) {
                                currentX = drawMiniFrac(ctx, fp, currentX, y, baseFontSize, colors.fill);
                            } else {
                                ctx.fillText(fp, currentX, y);
                                currentX += ctx.measureText(fp).width;
                            }
                        });
                    } else {
                        ctx.fillText(part, currentX, y);
                        currentX += ctx.measureText(part).width;
                    }
                    ctx.restore();
                } else {
                    // Not a highlight, check for fractions
                    const fracs = part.split(/(\d+\/\d+)/g);
                    fracs.forEach(fp => {
                        if (/\d+\/\d+/.test(fp)) {
                            currentX = drawMiniFrac(ctx, fp, currentX, y, baseFontSize, "#1e293b");
                        } else {
                            ctx.fillStyle = "#1e293b";
                            ctx.fillText(fp, currentX, y);
                            currentX += ctx.measureText(fp).width;
                        }
                    });
                }
            });
        });

        function drawMiniFrac(ctx: CanvasRenderingContext2D, fracStr: string, x: number, y: number, baseSize: number, color: string) {
            const [n, d] = fracStr.split('/');
            const scale = 0.65;
            const miniFontSize = baseSize * scale;
            ctx.save();
            ctx.font = `bold ${miniFontSize}px 'Comic Sans MS', cursive, sans-serif`;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';

            const nW = ctx.measureText(n).width;
            const dW = ctx.measureText(d).width;
            const fracW = Math.max(nW, dW) + 10;
            const cX = x + fracW / 2;

            // Num
            ctx.fillText(n, cX, y - miniFontSize * 0.5);
            // Den
            ctx.fillText(d, cX, y + miniFontSize * 0.5);
            // Line
            ctx.beginPath();
            ctx.moveTo(x + 2, y);
            ctx.lineTo(x + fracW - 2, y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
            return x + fracW;
        }

        return totalHeight + startY;
    };

    const drawTextImpl = (text: string, highlights: { text: string; color?: string }[] = []) => {
        const ctx = contextRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;
        stopAnimation();
        drawTextContent(ctx, canvas, text, highlights);
    };

    // Helper to stop ongoing animations
    const stopAnimation = () => {
        isAnimatingRef.current = false;
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        timeouts.current.forEach(clearTimeout);
        timeouts.current = [];
    };

    const setupCanvas = (minHeight?: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const parent = canvas.parentElement;
        const rect = parent ? parent.getBoundingClientRect() : canvas.getBoundingClientRect();

        const safeWidth = rect.width > 0 ? rect.width : (window.innerWidth > 0 ? window.innerWidth : 800);
        const baseHeight = rect.height > 0 ? rect.height : (window.innerHeight > 0 ? window.innerHeight * 0.6 : 800);
        const targetHeight = Math.max(baseHeight, minHeight || 0);

        // --- CONTENT PRESERVATION ---
        // Create temp canvas to store current drawings
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
            tempCtx.drawImage(canvas, 0, 0);
        }

        // Resize the actual canvas
        canvas.width = safeWidth * dpr;
        canvas.height = targetHeight * dpr;
        canvas.style.width = `${safeWidth}px`;
        canvas.style.height = `${targetHeight}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#1e40af'; // Darker blue for better visibility
            ctx.lineWidth = 6; // Thicker line for easier mouse drawing
            ctx.shadowBlur = 0.5;
            ctx.shadowColor = 'rgba(29, 78, 216, 0.5)';
            contextRef.current = ctx;
            ctx.globalCompositeOperation = 'source-over';

            // --- DRAW GRID IF ENABLED ---
            if (showGrid.current) {
                drawGrid(ctx, safeWidth, targetHeight);
            }

            // --- RESTORE CONTENT ---
            // Draw stored content back, scaling if necessary to maintain fit
            // For vertical math, we usually want it to stay centered or pinned.
            // Let's just draw it back at 0,0 for now.
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Use raw pixels for the copy-back
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.restore();
        }
    };

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = '#f1f5f9'; // Very subtle slate-100
        ctx.lineWidth = 1;

        const gridSize = 40;

        // Vertical lines
        for (let x = 0; x <= width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }

        // Horizontal lines
        for (let y = 0; y <= height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }

        ctx.stroke();
        ctx.restore();
    };

    // Initialize Canvas
    useEffect(() => {
        setupCanvas();

        // Main animation loop for particles
        const mainLoop = (time: number) => {
            if (canvasRef.current && contextRef.current) {
                updateParticles(time);
            }
            animationRef.current = requestAnimationFrame(mainLoop);
        };
        animationRef.current = requestAnimationFrame(mainLoop);

        // Resize Observer to handle container changes (e.g. sidebar opening)
        const parent = canvasRef.current?.parentElement;
        const resizeObserver = new ResizeObserver(() => {
            setupCanvas();
        });

        if (parent) {
            resizeObserver.observe(parent);
        }

        const handleResize = () => setupCanvas();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (parent) resizeObserver.unobserve(parent);
            resizeObserver.disconnect();
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    // --- PARTICLE SYSTEM ---
    const updateParticles = (time: number) => {
        const ctx = contextRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas || particles.current.length === 0) return;

        // We use a separate "overlay" canvas or just draw top-most?
        // To avoid clearing the math, we'll draw dots that fade away.
        // Actually, without a "background cache", we can't easily animate particles 
        // without clearing the whole canvas. 
        // BUT we can use the "Magic Ink" trick: draw the particle, then it stays there as a small dot, 
        // OR we just don't animate them and they are static sparks.
        // Let's make them briefly "Glow" and then disappear by drawing over them with White if they are on the grid?
        // NO, that's too complex. Let's just have them stay as "Digital Dust" for now or till next clear.
        // ACTUALLY, the best way is to have the triggerCelebration use the temp loop.
    };

    const createExplosion = (x: number, y: number, color: string, count: number = 20) => {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            particles.current.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.01 + Math.random() * 0.02,
                color,
                size: 2 + Math.random() * 4
            });
        }
    };

    // --- ANIMATION HELPERS ---

    // Typewriter effect for text
    // Typewriter effect for text
    const animateText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, color: string = "#1e293b") => {
        ctx.font = font;
        ctx.fillStyle = color;

        let i = 0;
        const speed = 2; // Frames per char
        let frame = 0;

        const loop = () => {
            if (i < text.length) {
                if (frame % speed === 0) {
                    const char = text.charAt(i);
                    const prevWidth = ctx.measureText(text.substring(0, i)).width;
                    ctx.fillText(char, x + prevWidth, y);
                    i++;
                }
                frame++;
                animationRef.current = requestAnimationFrame(loop);
            }
        };
        animationRef.current = requestAnimationFrame(loop);
    };

    // Progressive Line drawing
    const animateLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
        const totalDist = Math.hypot(x2 - x1, y2 - y1);
        const duration = 200 + (totalDist * 0.5); // Dynamic duration based on length
        const startTime = performance.now();

        const loop = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Add some "hand-shake" jitter to the path
            const jitter = (1 - progress) * Math.sin(progress * 20) * 1.5;

            const curX = x1 + (x2 - x1) * progress + jitter;
            const curY = y1 + (y2 - y1) * progress + jitter;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            // We use a quadratic curve for smoother looking hand-drawn lines if drawing long segments
            // But for simple animation, lineTo is fine if called frequently.
            ctx.lineTo(curX, curY);
            ctx.lineWidth = 3 + Math.sin(progress * Math.PI) * 1; // Subtle thickness variation
            ctx.stroke();

            if (progress < 1) {
                requestAnimationFrame(loop);
            }
        };
        requestAnimationFrame(loop);
    };

    // --- DRAG & DROP STATE ---
    const isInteractive = useRef(false);
    const sceneItems = useRef<any[]>([]); // { id, x, y, w, h, img, isDragging, dragOffsetX, dragOffsetY }
    const sceneBg = useRef<HTMLImageElement | null>(null);
    const interactRaf = useRef<number | null>(null);

    // --- INTERACTION (Pointer Events: mouse + touch + pen) ---

    // RENDER LOOP FOR INTERACTIVE MODE
    const renderInteractiveScene = () => {
        if (!isInteractive.current || !canvasRef.current || !contextRef.current) return;
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Draw Background
        if (sceneBg.current) {
            const img = sceneBg.current;
            // Scale "cover" or "contain"? Let's do Contain to see the whole scene
            const scale = Math.min(width / img.width, height / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
        } else {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
        }

        // Draw Items
        // Draw non-dragging first, then dragging on top
        const sortedItems = [...sceneItems.current].sort((a, b) => (a.isDragging ? 1 : 0) - (b.isDragging ? 1 : 0));

        sortedItems.forEach(item => {
            if (item.img) {
                if (item.isDragging) {
                    ctx.save();
                    ctx.shadowColor = 'rgba(0,0,0,0.3)';
                    ctx.shadowBlur = 10;
                    ctx.scale(1.1, 1.1); // Pop effect
                    // Adjust position for scale
                    ctx.drawImage(item.img, item.x / 1.1 - (item.w * 0.05), item.y / 1.1 - (item.h * 0.05), item.w, item.h);
                    ctx.restore();
                } else {
                    ctx.drawImage(item.img, item.x, item.y, item.w, item.h);
                }
            }
        });

        interactRaf.current = requestAnimationFrame(renderInteractiveScene);
    };

    const getPointerCoordinates = (e: PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { offsetX: 0, offsetY: 0 };
        const rect = canvas.getBoundingClientRect();
        // Logical coords (ctx is scaled by dpr, so 1 unit = 1 CSS px)
        return {
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top
        };
    };

    const startDrawing = (e: React.PointerEvent) => {
        if (!contextRef.current || activePointerId.current !== null) return;

        const { offsetX, offsetY } = getPointerCoordinates(e.nativeEvent);

        // INTERACTIVE MODE CHECK
        if (isInteractive.current) {
            // Check collision from top to bottom (reverse array)
            for (let i = sceneItems.current.length - 1; i >= 0; i--) {
                const item = sceneItems.current[i];
                if (offsetX >= item.x && offsetX <= item.x + item.w &&
                    offsetY >= item.y && offsetY <= item.y + item.h) {

                    item.isDragging = true;
                    item.dragOffsetX = offsetX - item.x;
                    item.dragOffsetY = offsetY - item.y;

                    activePointerId.current = e.pointerId;
                    (e.target as HTMLElement).setPointerCapture(e.pointerId);
                    if (e.pointerType === 'touch') e.preventDefault();
                    return; // Stop here, don't draw
                }
            }
            return; // Don't allow drawing in interactive mode (or maybe allow annotation later?)
        }

        // NORMAL DRAWING MODE
        activePointerId.current = e.pointerId;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        if (e.pointerType === 'touch' || e.pointerType === 'pen') e.preventDefault();

        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        isDrawing.current = true;
    };

    const draw = (e: React.PointerEvent) => {
        if (e.pointerId !== activePointerId.current) return;
        const { offsetX, offsetY } = getPointerCoordinates(e.nativeEvent);

        if (isInteractive.current) {
            const item = sceneItems.current.find(i => i.isDragging);
            if (item) {
                if (e.pointerType === 'touch') e.preventDefault(); // Prevent scrolling
                item.x = offsetX - item.dragOffsetX;
                item.y = offsetY - item.dragOffsetY;
                // Constraints? Inside canvas?
                // For now free movement
            }
            return;
        }

        if (!isDrawing.current || !contextRef.current || !canvasRef.current) return;
        if (e.pointerType === 'touch' || e.pointerType === 'pen') e.preventDefault();
        const ctx = contextRef.current;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = (e?: React.PointerEvent) => {
        if (e && e.pointerId !== activePointerId.current) return;

        if (isInteractive.current) {
            sceneItems.current.forEach(i => i.isDragging = false);
        } else {
            if (contextRef.current) contextRef.current.closePath();
            isDrawing.current = false;
        }

        if (e?.pointerId != null && canvasRef.current) {
            try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
        }
        activePointerId.current = null;
    };

    useImperativeHandle(ref, () => ({
        setupDragAndDrop: (bgUrl: string, items: { id: string, imgUrl: string, count: number }[]) => {
            isInteractive.current = true;
            if (interactRaf.current) cancelAnimationFrame(interactRaf.current);
            sceneItems.current = [];

            // Load BG
            const bg = new Image();
            bg.crossOrigin = "anonymous";
            bg.onload = () => { sceneBg.current = bg; };
            bg.src = bgUrl;

            // Load Items
            // Distribute them initially
            const canvas = canvasRef.current;
            const width = canvas ? canvas.width / (window.devicePixelRatio || 1) : 800;
            const height = canvas ? canvas.height : 600;

            let startX = 50;
            const startY = height - 150; // Bottom area

            items.forEach(grp => {
                const itemImg = new Image();
                itemImg.crossOrigin = "anonymous";
                itemImg.src = grp.imgUrl;
                itemImg.onload = () => {
                    // Create N copies
                    for (let i = 0; i < grp.count; i++) {
                        sceneItems.current.push({
                            id: `${grp.id}_${i}`,
                            img: itemImg,
                            x: startX + (Math.random() * 50),
                            y: startY + (Math.random() * 50),
                            w: 80, // Default size
                            h: 80,
                            isDragging: false,
                            dragOffsetX: 0,
                            dragOffsetY: 0
                        });
                        startX += 60;
                    }
                }
            });

            // Start Render Loop
            renderInteractiveScene();
        },
        triggerCelebration: (type = 'confetti') => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            // Since we don't have a persistent loop for all drawings,
            // we'll just trigger the existing confetti/star logic by briefly
            // drawing over whatever is there.
            const ctx = contextRef.current;
            if (!ctx) return;

            if (type === 'confetti') {
                // We'll use a temporary animation loop for the celebration
                let frames = 0;
                const anim = () => {
                    if (frames < 100) {
                        // We can't clear or we lose the math.
                        // So we just draw confetti on top.
                        const confettiColors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#fbbf24', '#ec4899'];
                        for (let i = 0; i < 5; i++) {
                            const x = Math.random() * (canvas.width / (window.devicePixelRatio || 1));
                            const y = Math.random() * (canvas.height / (window.devicePixelRatio || 1));
                            const size = 5 + Math.random() * 10;
                            ctx.save();
                            ctx.translate(x, y);
                            ctx.rotate(Math.random() * Math.PI);
                            ctx.fillStyle = confettiColors[Math.floor(Math.random() * confettiColors.length)];
                            ctx.fillRect(-size / 2, -size / 4, size, size / 2);
                            ctx.restore();
                        }
                        frames++;
                        requestAnimationFrame(anim);
                    }
                };
                anim();
            }
        },
        setShowGrid: (show: boolean) => {
            showGrid.current = show;
            setupCanvas();
        },
        getImage: () => {
            const canvas = canvasRef.current;
            if (!canvas) return null;
            // En móvil el canvas puede tener tamaño 0 si la pizarra estaba oculta; evitar enviar imagen vacía
            const w = canvas.width;
            const h = canvas.height;
            if (w === 0 || h === 0) return null;
            return canvas.toDataURL('image/png') || null;
        },
        clear: () => {
            isInteractive.current = false;
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            const canvas = canvasRef.current;
            const ctx = contextRef.current;
            if (canvas && ctx) {
                const dpr = window.devicePixelRatio || 1;
                ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
                // Reset canvas height to container size
                setupCanvas();
            }
        },
        drawImage: (url: string) => {
            isInteractive.current = false;
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const ctx = contextRef.current;
                const canvas = canvasRef.current;
                if (ctx && canvas) {
                    const dpr = window.devicePixelRatio || 1;
                    const cW = canvas.width / dpr, cH = canvas.height / dpr;

                    // Clear previous content to ensure clean scene
                    ctx.clearRect(0, 0, cW, cH);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, cW, cH);

                    const scale = Math.min(cW / img.width, cH / img.height) * 0.9; // Slight margin
                    const w = img.width * scale, h = img.height * scale;
                    // Draw instant for images
                    ctx.drawImage(img, (cW - w) / 2, (cH - h) / 2, w, h);
                }
            };
            img.onerror = (e) => {
                console.error("Failed to load image on whiteboard:", url, e);
            };
            img.src = url;
        },
        drawText: (text: string, highlights: { text: string; color?: string }[] = []) => {
            drawTextImpl(text, highlights);
        },

        drawGeometry: (shape, params) => {
            stopAnimation();
            const ctx = contextRef.current; const canvas = canvasRef.current;
            if (!ctx || !canvas) return;
            const dpr = window.devicePixelRatio || 1, cW = canvas.width / dpr, cH = canvas.height / dpr;

            ctx.clearRect(0, 0, cW, cH);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, cW, cH);

            // 1. Dibujar texto del problema si existe
            let offset = 0;
            if (params?.text) {
                offset = drawTextContent(ctx, canvas, params.text, params.highlights || [], true);
            }

            const cX = cW / 2;
            const cY = Math.max(cH / 2 + 50, offset + 120); // Empujar hacia abajo si hay texto
            const labels = params?.labels || [];
            const labelColors: string[] = params?.labelColors || ['#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#f59e0b'];

            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.font = "bold 32px 'Comic Sans MS'";
            ctx.textAlign = "center";

            const drawLabel = (text: string, x: number, y: number, colorIndex: number) => {
                if (!text) return;
                ctx.save();
                ctx.fillStyle = labelColors[colorIndex % labelColors.length] || '#1e293b';
                ctx.shadowBlur = 8;
                ctx.shadowColor = (labelColors[colorIndex % labelColors.length] || '#1e293b') + '80';
                ctx.fillText(text, x, y);
                ctx.restore();
            };

            const s = String(shape).toLowerCase();

            if (s.includes('circle') || s.includes('circulo')) {
                ctx.strokeStyle = '#a855f7';
                ctx.beginPath();
                ctx.arc(cX, cY, 80, 0, Math.PI * 2);
                ctx.stroke();
                if (labels[0]) drawLabel(labels[0], cX, cY + 95, 0);
            }
            else if (s.includes('rect') || s.includes('square') || s.includes('cuadr')) {
                const isSquare = s.includes('square') || s.includes('cuadr');
                const w = 240;
                const h = isSquare ? 240 : 140;
                const x = cX - w / 2;
                const y = cY - h / 2;

                // Draw Grid if it's a square division problem
                if (params?.subQuestion === 'divide_into_squares' && params?.squareSide && params?.wpParsed) {
                    const bw = params.wpParsed.base || 0;
                    const bh = params.wpParsed.height || 0;
                    const ss = params.squareSide;
                    if (bw > 0 && bh > 0 && ss > 0) {
                        const cols = Math.floor(bw / ss);
                        const rows = Math.floor(bh / ss);
                        ctx.save();
                        ctx.strokeStyle = '#3b82f640'; // Light blue grid
                        ctx.lineWidth = 1;
                        for (let i = 1; i < cols; i++) {
                            const gx = x + (i * (w / cols));
                            ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke();
                        }
                        for (let j = 1; j < rows; j++) {
                            const gy = y + (j * (h / rows));
                            ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke();
                        }
                        ctx.restore();
                    }
                }

                ctx.strokeStyle = '#3b82f6';
                ctx.beginPath(); ctx.rect(x, y, w, h); ctx.stroke();
                if (labels[0]) drawLabel(labels[0], cX, y - 15, 0);
                if (labels[1]) drawLabel(labels[1], x + w + 55, cY + 5, 1);
                if (labels[2]) drawLabel(labels[2], cX, cY + h + 45, 2);
            }
            else if (s.includes('triang')) {
                const triH = 200;
                const triBase = 220;
                const topY = cY - triH / 2;
                const botY = cY + triH / 2;
                ctx.strokeStyle = '#22c55e';
                ctx.beginPath();
                ctx.moveTo(cX, topY);
                ctx.lineTo(cX + triBase / 2, botY);
                ctx.lineTo(cX - triBase / 2, botY);
                ctx.closePath();
                ctx.stroke();
                if (labels[0]) drawLabel(labels[0], cX + triBase / 4 + 20, cY - 20, 0);
                if (labels[1]) drawLabel(labels[1], cX, botY + 40, 1);
                if (labels[2]) drawLabel(labels[2], cX, cY + 20, 2);
            }
        },

        drawFraction: (dataOrNum, den, type) => {
            stopAnimation();
            const ctx = contextRef.current; const canvas = canvasRef.current;
            if (!ctx || !canvas) return;
            const dpr = window.devicePixelRatio || 1, cW = canvas.width / dpr, cH = canvas.height / dpr;
            ctx.clearRect(0, 0, cW, cH);
            const cX = cW / 2, cY = cH / 2;

            // MCM INTRO: explicación visual para el niño (sin fracciones, imagen didáctica)
            if (typeof dataOrNum === 'object' && dataOrNum.type === 'mcm_intro') {
                const allDenoms: number[] = dataOrNum.allDenoms && Array.isArray(dataOrNum.allDenoms)
                    ? dataOrNum.allDenoms.map((d: any) => parseInt(String(d), 10) || d)
                    : [parseInt(String(dataOrNum.den1 || dataOrNum.originalOp?.d1 || 2), 10) || 2, parseInt(String(dataOrNum.den2 || dataOrNum.originalOp?.d2 || 3), 10) || 3];
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, cW, cH);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // Título
                ctx.fillStyle = '#1e293b';
                ctx.font = "bold 28px 'Outfit', sans-serif";
                ctx.fillText('¿Qué es el MCM?', cX, 50);
                ctx.font = "bold 20px 'Outfit', sans-serif";
                ctx.fillStyle = '#475569';
                ctx.fillText('Mínimo Común Múltiplo', cX, 82);
                // Dibujo: dos filas de “saltos” que se encuentran
                const boxY = 140;
                const boxH = 36;
                const colW = 44;
                const maxCols = 8;
                const product = allDenoms.reduce((a: number, b: number) => a * b, 1);
                let lcmVal = product;
                for (let k = 1; k <= product; k++) {
                    if (allDenoms.every((d: number) => k % d === 0)) { lcmVal = k; break; }
                }
                const lcm = lcmVal;
                const rowColors = ['#3b82f6', '#ef4444', '#22c55e'];
                const rowGap = 56;
                // Fila 1: múltiplos de den1
                ctx.font = "bold 16px 'Outfit'";
                for (let rowIdx = 0; rowIdx < allDenoms.length; rowIdx++) {
                    const den = allDenoms[rowIdx];
                    const color = rowColors[rowIdx % rowColors.length] ?? '#6366f1';
                    const y = boxY + rowIdx * (boxH + rowGap);
                    ctx.fillStyle = color;
                    ctx.fillText(`Saltos de ${den}:`, cX - 120, y - 28);
                    for (let i = 0; i < Math.min(maxCols, lcm / den + 1); i++) {
                        const val = den * (i + 1);
                        if (val > lcm) break;
                        const x = cX - 160 + i * colW;
                        ctx.fillStyle = val === lcm ? '#10b981' : color;
                        ctx.fillRect(x, y, 38, boxH);
                        ctx.fillStyle = '#fff';
                        ctx.fillText(String(val), x + 19, y + boxH / 2 + 1);
                    }
                }
                // Flecha / texto “se encuentran en”
                const lastRowY = boxY + (allDenoms.length - 1) * (boxH + rowGap) + boxH;
                ctx.fillStyle = '#10b981';
                ctx.font = "bold 18px 'Outfit'";
                ctx.fillText('¡Se encuentran aquí! → El MCM es el primer número en común.', cX, lastRowY + 50);
                ctx.fillStyle = '#64748b';
                ctx.font = "18px 'Outfit'";
                ctx.fillText((dataOrNum.allDenoms?.length >= 3 ? 'Es el número más pequeño que está en las tres tablas.' : 'Es el número más pequeño que está en las dos tablas.'), cX, lastRowY + 108);
                ctx.fillText('Lo usamos para sumar o restar fracciones con distinto denominador.', cX, lastRowY + 138);
                return;
            }

            // HANDLE LCM LIST VISUAL (2 or 3+ columns in same row)
            if (typeof dataOrNum === 'object' && dataOrNum.type === 'lcm_list') {
                const { lists, match, highlightMatch, originalOp, extraFracs } = dataOrNum;
                const numCols = Math.max(2, lists?.length || 2);

                // 📏 SMART HEIGHT MANAGEMENT
                const maxItems = Math.max(...(lists || []).map((l: any) => l.items?.length || 0));
                const rowH = 50;
                const reqH = 200 + (maxItems * rowH) + 100;
                const dpr = window.devicePixelRatio || 1;
                if (reqH > canvas.height / dpr) {
                    setupCanvas(reqH);
                }

                const cW_active = canvasRef.current!.width / dpr;
                const cH_active = canvasRef.current!.height / dpr;
                const ctx_active = contextRef.current!;
                ctx_active.clearRect(0, 0, cW_active, cH_active);

                // DRAW EQUATION (2 or 3 fractions in same row)
                const showN1 = dataOrNum.num1 || originalOp?.n1;
                const showD1 = dataOrNum.den1 || originalOp?.d1;
                const showN2 = dataOrNum.num2 || originalOp?.n2;
                const showD2 = dataOrNum.den2 || originalOp?.d2;
                const showOp = dataOrNum.operator || originalOp?.operator || '+';
                const colors = ['#3b82f6', '#ef4444', '#22c55e']; // blue, red, green

                if (showN1) {
                    ctx_active.save();
                    const scale = numCols >= 3 ? 0.55 : 0.7;
                    ctx_active.translate(40, 40);
                    ctx_active.scale(scale, scale);

                    const drawFrac = (n: string | number, d: string | number, x: number, dColor: string) => {
                        ctx_active.font = "bold 36px 'Outfit'";
                        ctx_active.fillStyle = "#64748b";
                        ctx_active.textAlign = "center";
                        ctx_active.fillText(String(n), x + 18, 0);
                        ctx_active.beginPath();
                        ctx_active.moveTo(x, 12);
                        ctx_active.lineTo(x + 36, 12);
                        ctx_active.strokeStyle = "#94a3b8";
                        ctx_active.lineWidth = 3;
                        ctx_active.stroke();
                        ctx_active.fillStyle = dColor;
                        ctx_active.fillText(String(d), x + 18, 48);
                    };

                    drawFrac(showN1, showD1, 0, colors[0]);
                    ctx_active.font = "bold 26px 'Outfit'";
                    ctx_active.fillStyle = "#64748b";
                    ctx_active.fillText('+', 50, 24);
                    drawFrac(showN2, showD2, 65, colors[1]);
                    if (extraFracs?.length) {
                        const ex = extraFracs[0];
                        ctx_active.fillText('+', 115, 24);
                        drawFrac(ex.n, ex.d, 130, colors[2]);
                    }
                    ctx_active.restore();
                }

                // DRAW TABLE STRUCTURE (columns adapt to lists.length)
                const colWidth = cW_active / numCols;
                const topY = 140;
                const rowHeight = 42;

                (lists || []).forEach((list: any, idx: number) => {
                    const colX = idx * colWidth;
                    const cX_col = colX + colWidth / 2;
                    const color = colors[idx % colors.length];

                    ctx_active.font = "bold 24px 'Outfit'";
                    ctx_active.fillStyle = color;
                    ctx_active.textAlign = "center";
                    ctx_active.fillText(`Múltiplos de ${list.base}`, cX_col, topY - 36);

                    const boxW = Math.min(220, colWidth - 16);

                    list.items?.forEach((val: number, vIdx: number) => {
                        const y = topY + (vIdx * rowHeight);
                        const isMatch = val === match && highlightMatch;

                        if (isMatch) {
                            ctx_active.save();
                            ctx_active.fillStyle = "rgba(239, 68, 68, 0.12)";
                            ctx_active.roundRect(cX_col - boxW / 2, y - 28, boxW, 38, 8);
                            ctx_active.fill();
                            ctx_active.strokeStyle = "#ef4444";
                            ctx_active.lineWidth = 2;
                            ctx_active.stroke();
                            ctx_active.restore();
                        }

                        ctx_active.font = isMatch ? "bold 20px 'Outfit'" : "18px 'Outfit'";
                        ctx_active.fillStyle = isMatch ? "#ef4444" : "#64748b";
                        ctx_active.textAlign = "right";
                        ctx_active.fillText(`${list.base} × ${vIdx + 1} = `, cX_col - 8, y);
                        ctx_active.font = isMatch ? "bold 24px 'Outfit'" : "bold 20px 'Outfit'";
                        ctx_active.fillStyle = isMatch ? "#ef4444" : "#1e293b";
                        ctx_active.textAlign = "left";
                        ctx_active.fillText(val.toString(), cX_col + 4, y);
                    });
                });
                return;
            }

            // HANDLE STANDARD FRACTION (Object or Args)
            let numerator = 0;
            let denominator = 0;
            let visualType = 'bar';

            if (typeof dataOrNum === 'object') {
                numerator = dataOrNum.numerator;
                denominator = dataOrNum.denominator;
                visualType = type || 'bar';
            } else {
                numerator = dataOrNum;
                denominator = den || 1;
                visualType = type || 'bar';
            }

            if (visualType === 'pie') {
                ctx.lineWidth = 4; ctx.strokeStyle = '#334155';
                ctx.beginPath(); ctx.arc(cX, cY, 120, 0, Math.PI * 2); ctx.stroke();

                let i = 0;
                const step = () => {
                    if (i < denominator) {
                        ctx.beginPath(); ctx.moveTo(cX, cY);
                        ctx.arc(cX, cY, 120, (i * 2 * Math.PI) / denominator, ((i + 1) * 2 * Math.PI) / denominator);
                        ctx.closePath();
                        ctx.fillStyle = i < numerator ? '#6366f1' : '#f8fafc';
                        ctx.fill();
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        i++;
                        setTimeout(step, 150);
                    }
                }
                step();
            } else {
                // FRACTION BAR (Nano Banana Pro Style)
                // SAFETY: Cap denominator to 12 to prevent "Brain Slow" infinite loops/crashes with large numbers (e.g. 50000)
                if (denominator > 12) {
                    ctx.fillStyle = "#1e293b";
                    ctx.font = "bold 80px 'Comic Sans MS'";
                    ctx.textAlign = "center";
                    ctx.fillText(`${numerator}`, cX, cY - 40);
                    ctx.fillRect(cX - 100, cY, 200, 6);
                    ctx.fillText(`${denominator}`, cX, cY + 80);
                    return;
                }

                const barW = Math.min(600, cW * 0.8);
                const barH = 100;
                const startX = cX - barW / 2;
                const startY = cY - barH / 2;
                const partW = barW / denominator;

                // Main Drop Shadow
                ctx.fillStyle = "rgba(0,0,0,0.05)";
                ctx.fillRect(startX + 8, startY + 8, barW, barH);

                // Border
                ctx.strokeStyle = "#1e293b";
                ctx.lineWidth = 4;
                ctx.strokeRect(startX, startY, barW, barH);

                // Fill Parts
                for (let i = 0; i < denominator; i++) {
                    const px = startX + (i * partW);

                    // Vibrant Blue for Shaded, Clean White for empty
                    ctx.fillStyle = i < numerator ? "#3b82f6" : "#ffffff";
                    ctx.fillRect(px, startY, partW, barH);

                    // Divider
                    ctx.beginPath();
                    ctx.moveTo(px, startY);
                    ctx.lineTo(px, startY + barH);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "#1e293b";
                    ctx.stroke();

                    // SMART LABELS (Prevent "Crazy" redundant labels)
                    // Only label the first shaded segment and first empty segment to show unit value
                    const shouldLabel = (i === 0) || (i === numerator);
                    if (partW > 50 && shouldLabel) {
                        ctx.fillStyle = i < numerator ? "rgba(255,255,255,0.9)" : "#64748b";
                        ctx.font = "bold 18px 'Comic Sans MS'";
                        ctx.textAlign = "center";
                        ctx.fillText(`1/${denominator}`, px + partW / 2, startY + barH / 2 + 6);
                    }
                }

                // Final Glow/Reflection
                ctx.fillStyle = "rgba(255,255,255,0.15)";
                ctx.fillRect(startX, startY, barW, barH / 2);

                // Main Label below
                ctx.fillStyle = "#1e293b";
                ctx.font = "bold 56px 'Comic Sans MS'";
                ctx.textAlign = "center";
                ctx.fillText(`${numerator}/${denominator}`, cX, startY + barH + 80);
            }
        },
        drawFractionEquation: (visualData) => {
            stopAnimation();
            const ctx = contextRef.current; const canvas = canvasRef.current;
            if (!ctx || !canvas) return;
            const dpr = window.devicePixelRatio || 1, cW = canvas.width / dpr, cH = canvas.height / dpr;
            ctx.clearRect(0, 0, cW, cH);
            const cX = cW / 2, cY = cH / 2;

            const { num1, den1, num2, den2, operator, result, highlight, originalOp, isVertical } = visualData;

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Determine Colors based on equality
            // Same Denom -> Purple (#8b5cf6)
            // Diff Denom -> Green (#10b981) + Blue (#3b82f6)
            // If den1/den2 are undefined (e.g. result step), we fallback
            const d1Val = den1 ? den1.toString() : '';
            const d2Val = den2 ? den2.toString() : '';
            const sameDenom = d1Val === d2Val;

            const drawFrac = (n: string | number | undefined, d: string | number | undefined, x: number, y: number, isHighlighted = false, position?: 'left' | 'right' | 'result') => {
                if (n === undefined || d === undefined) return;

                // 🎨 HIGHLIGHT GLOW
                if (isHighlighted) {
                    ctx.save();
                    ctx.fillStyle = "rgba(59, 130, 246, 0.08)";
                    ctx.beginPath();
                    ctx.roundRect(x - 60, y - 100, 120, 200, 15);
                    ctx.fill();
                    ctx.restore();
                }

                // Determine Denominator Color
                let dColor = '#1e293b'; // Default
                if (position === 'left') dColor = sameDenom ? '#8b5cf6' : '#3b82f6';
                if (position === 'right') dColor = sameDenom ? '#8b5cf6' : '#ef4444';
                if (position === 'result') dColor = sameDenom ? '#8b5cf6' : '#f59e0b';

                ctx.font = 'bold 52px "Comic Sans MS"';
                ctx.fillStyle = '#1e293b';
                ctx.fillText(n.toString(), x, y - 45);

                ctx.beginPath();
                ctx.moveTo(x - 40, y);
                ctx.lineTo(x + 40, y);
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#1e293b';
                ctx.stroke();

                ctx.fillStyle = dColor;
                ctx.fillText(d.toString(), x, y + 45);
            };



            console.log("DrawFractionEquation: Rendering Horizontal");

            // DRAW ORIGINAL OPERATION (Persistent Context)
            if (originalOp) {
                const { n1, d1, n2, d2, operator: op } = originalOp;
                ctx.save();
                ctx.translate(60, 60); // Top Left Corner
                ctx.scale(0.8, 0.8);

                // Fraction 1
                ctx.font = "bold 40px 'Comic Sans MS'"; ctx.fillStyle = "#64748b"; ctx.textAlign = "center";
                ctx.fillText(n1.toString(), 25, 0);
                ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(50, 15); ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 3; ctx.stroke();
                ctx.fillStyle = "#3b82f6"; // Denom 1 -> Blue
                ctx.fillText(d1.toString(), 25, 55);

                // Operator
                ctx.font = "bold 30px 'Comic Sans MS'";
                ctx.fillText(op === '×' ? '×' : op, 75, 25);

                // Fraction 2
                ctx.font = "bold 40px 'Comic Sans MS'"; ctx.fillStyle = "#64748b";
                ctx.fillText(n2.toString(), 125, 0);
                ctx.beginPath(); ctx.moveTo(100, 15); ctx.lineTo(150, 15); ctx.stroke();
                ctx.fillStyle = "#ef4444"; // Denom 2 -> Red
                ctx.fillText(d2.toString(), 125, 55);

                ctx.restore();
            }


            // ... (previous code)

            // Function to draw curved arrow
            const drawCurve = (x1: number, y1: number, x2: number, y2: number, text: string | null = null, color: string = "#3b82f6") => {
                ctx.beginPath();
                const midX = (x1 + x2) / 2;
                // Control point higher for top, lower for bottom? 
                // Let's assume generic "jump" arc
                const cy = y1 - 40;

                ctx.moveTo(x1, y1);
                ctx.quadraticCurveTo(midX, cy, x2, y2);
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.setLineDash([5, 5]); // Dashed for "process"
                ctx.stroke();
                ctx.setLineDash([]);

                // Arrowhead
                // text
                if (text) {
                    ctx.fillStyle = color;
                    ctx.font = 'bold 24px "Comic Sans MS"';
                    ctx.textAlign = 'center';
                    // Draw text at peak of curve
                    ctx.fillText(text, midX, cy - 10);
                }
            };

            // Custom Layout for Conversion (→)
            if (operator === '→') {
                const cX_adj = cX;

                // Pulsing Effect for highlighted elements
                const time = Date.now() / 500;
                const scale = 1 + Math.sin(time) * 0.05; // Gentle pulse

                drawFrac(num1, den1, cX_adj - 180, cY, highlight === 'num1' || highlight === 'den1');

                ctx.font = 'bold 60px "Comic Sans MS"';
                ctx.fillStyle = '#94a3b8';
                ctx.fillText('→', cX_adj, cY);

                // 🪄 Pedagogical Hint: Show "x ?" or "x 3" above the arrow
                const multiplierHint = visualData.multiplier ? `× ${visualData.multiplier}` : "× ?";

                // Draw Pedagogical Arcs based on phase
                if (highlight === 'den1' || highlight === 'num1') {
                    const isTop = highlight === 'num1';
                    const arcColor = isTop ? "#ef4444" : "#3b82f6";
                    const yOff = isTop ? -50 : 50;
                    const curveY = yOff * 1.5;

                    // Draw Arc connecting parts
                    ctx.beginPath();
                    ctx.moveTo(cX_adj - 150, cY + yOff); // From Num1/Den1
                    ctx.quadraticCurveTo(cX_adj, cY + yOff + curveY, cX_adj + 150, cY + yOff); // To Num2/Den2
                    ctx.strokeStyle = arcColor;
                    ctx.lineWidth = 4;
                    ctx.stroke();

                    // Animated Bubble for logic
                    ctx.shadowColor = arcColor;
                    ctx.shadowBlur = 15;
                    ctx.fillStyle = "white";
                    ctx.beginPath();
                    ctx.arc(cX_adj, cY + yOff + curveY, 35, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    ctx.fillStyle = arcColor;
                    ctx.font = "bold 30px 'Comic Sans MS'";
                    ctx.fillText(multiplierHint, cX_adj, cY + yOff + curveY);
                }

                if (result) {
                    const parts = result.split('/');
                    if (parts.length === 2) {
                        const nPart = (parts[0] == null || String(parts[0]) === 'undefined') ? '?' : String(parts[0]);
                        const dPart = (parts[1] == null || String(parts[1]) === 'undefined') ? '?' : String(parts[1]);
                        if (result.includes('?')) {
                            ctx.save();
                            ctx.translate(cX_adj + 180, cY);
                            ctx.scale(scale, scale);
                            ctx.translate(-(cX_adj + 180), -cY);
                        }
                        drawFrac(nPart, dPart, cX_adj + 180, cY, highlight === 'done' || highlight === 'all');
                        if (result.includes('?')) ctx.restore();
                    }
                }

                // (Recursion removed to fix scope error)
                return;
            }

            // Calculate spacing (Standard Horizontal Layout)
            const spacing = 160; // Increased spacing for cleaner look
            const eqY = cY;

            // Op 1
            drawFrac(num1, den1, cX - spacing * 1.5, eqY, highlight === 'num1' || highlight === 'den1', 'left');

            // Operator
            if (operator) {
                ctx.font = 'bold 54px "Comic Sans MS"'; // Slightly larger
                ctx.fillStyle = '#000000'; // Pure Black
                ctx.fillText(operator === '*' ? '×' : operator, cX - spacing * 0.7, eqY);
            }

            // Op 2
            drawFrac(num2, den2, cX, eqY, highlight === 'num2' || highlight === 'den2', 'right');

            // Equality
            ctx.font = 'bold 48px "Comic Sans MS"';
            ctx.fillStyle = '#64748b';
            ctx.fillText('=', cX + spacing * 0.7, eqY);

            // Result
            if (result && result !== '?') {
                const parts = result.split('/');
                if (parts.length === 2) {
                    const nPart = (parts[0] == null || String(parts[0]) === 'undefined') ? '?' : String(parts[0]);
                    const dPart = (parts[1] == null || String(parts[1]) === 'undefined') ? '?' : String(parts[1]);
                    drawFrac(nPart, dPart, cX + spacing * 1.5, eqY, highlight === 'done', 'result');
                } else {
                    ctx.font = 'bold 64px "Comic Sans MS"';
                    ctx.fillStyle = highlight === 'done' ? '#3b82f6' : '#1e293b';
                    const safeResult = (result == null || String(result) === 'undefined') ? '?' : String(result);
                    ctx.fillText(safeResult, cX + spacing * 1.5, eqY);
                }
            } else {
                ctx.font = 'bold 64px "Comic Sans MS"';
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText('?', cX + spacing * 1.5, eqY);
            }

            // Title
            ctx.font = 'bold 24px "Comic Sans MS"';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('Operación con Fracciones', cX, 40);
        },
        drawDataPlot: (data) => {
            // ... existing logic but animate bar height
        },
        drawBase10Blocks: (value: number) => {
            stopAnimation();
            const ctx = contextRef.current;
            const canvas = canvasRef.current;
            if (!ctx || !canvas) return;
            const dpr = window.devicePixelRatio || 1;
            const cW = canvas.width / dpr, cH = canvas.height / dpr;
            ctx.clearRect(0, 0, cW, cH);

            // Determine Mode: Decimal vs Integer
            // If it has a fractional part, treat as Decimal Mode (Rod=1, Cube=0.1)
            const isDecimal = value % 1 !== 0;

            let rodsCount = 0;
            let cubesCount = 0;

            if (isDecimal) {
                rodsCount = Math.floor(value);
                // Fix floating point precision issues (e.g. 0.1 + 0.2)
                cubesCount = Math.round((value - rodsCount) * 10);
            } else {
                rodsCount = Math.floor(value / 10);
                cubesCount = value % 10;
            }

            // 1. Draw Title
            ctx.font = "bold 40px 'Comic Sans MS'";
            ctx.fillStyle = "#334155";
            ctx.textAlign = "center";
            const title = `Representando: ${value}`;
            ctx.fillText(title, cW / 2, 60);

            if (isDecimal) {
                ctx.font = "italic 24px 'Comic Sans MS'";
                ctx.fillStyle = "#64748b";
                ctx.fillText("(Barra = 1 | Cubo = 0.1)", cW / 2, 95);
            }

            // Center the whole group
            const spacing = 15;
            const barW = 40, barH = 200; // 10 units of 20px
            const cubeSize = 30; // Slightly smaller to look cute

            // Calculate total width approx
            const totalW = (rodsCount * (barW + spacing)) + 60 + (Math.ceil(cubesCount / 5) * (cubeSize + 10));
            const startX = (cW - totalW) / 2;
            const startY = (cH - barH) / 2 + 30;

            // Helper to draw a 3D block
            const draw3DBlock = (x: number, y: number, w: number, h: number, baseColor: string, hiColor: string, shColor: string) => {
                // Base Fill
                ctx.fillStyle = baseColor;
                ctx.fillRect(x, y, w, h);

                // Bevel Top/Left (Highlight)
                ctx.beginPath();
                ctx.moveTo(x + w, y);
                ctx.lineTo(x, y);
                ctx.lineTo(x, y + h);
                ctx.lineWidth = 4;
                ctx.lineCap = "butt";
                ctx.strokeStyle = hiColor;
                ctx.stroke();

                // Bevel Bottom/Right (Shadow)
                ctx.beginPath();
                ctx.moveTo(x + w, y);
                ctx.lineTo(x + w, y + h);
                ctx.lineTo(x, y + h);
                ctx.lineWidth = 4;
                ctx.lineCap = "butt";
                ctx.strokeStyle = shColor;
                ctx.stroke();

                // Crisp Black Border (Cartoon Style)
                ctx.strokeStyle = "rgba(0,0,0,0.3)";
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, w, h);
            };

            // Draw Rods (Tens OR Ones in decimal mode)
            let currentX = startX;
            for (let i = 0; i < rodsCount; i++) {
                draw3DBlock(currentX, startY, barW, barH, "#3b82f6", "#93c5fd", "#1e40af");

                // Draw internal lines (Ten segments)
                ctx.strokeStyle = "#1e40af";
                ctx.lineWidth = 1;
                for (let k = 1; k < 10; k++) {
                    const ly = startY + (k * (barH / 10));
                    ctx.beginPath();
                    ctx.moveTo(currentX + 4, ly);
                    ctx.lineTo(currentX + barW - 4, ly);
                    ctx.stroke();
                }
                currentX += barW + spacing;
            }

            // Draw Cubes (Ones OR Tenths in decimal mode)
            if (cubesCount > 0) {
                currentX += 40; // Gap between tens and ones

                for (let i = 0; i < cubesCount; i++) {
                    const col = Math.floor(i / 5);
                    const row = i % 5;
                    // Stack from bottom up (row 0 is bottom)
                    const x = currentX + (col * (cubeSize + 10));
                    const y = (startY + barH) - ((row + 1) * (cubeSize + 5)); // Align bottom with bars

                    draw3DBlock(x, y, cubeSize, cubeSize, "#fbbf24", "#fde68a", "#b45309");

                    // Little stud center (Lego style!)
                    ctx.fillStyle = "#d97706";
                    ctx.beginPath();
                    ctx.arc(x + cubeSize / 2, y + cubeSize / 2, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        },
        drawVerticalOp: (n1: string | string[], n2?: string, result?: string | string[], operator?: string, carry?: string, highlight?: string, borrows?: any[], helpers?: any[], visualData?: any) => {
            if (operator === '÷' || operator === '/') {
                stopAnimation();
                const ctx = contextRef.current;
                const canvas = canvasRef.current;
                if (!ctx || !canvas) return;
                const dpr = window.devicePixelRatio || 1;
                // Use current dimensions
                const cW = canvas.width / dpr;
                const cH = canvas.height / dpr;

                // Clear
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);
                ctx.clearRect(0, 0, cW, cH);

                // Setup Font
                const fontSize = 110;
                ctx.font = `bold ${fontSize}px 'Comic Sans MS'`;

                const dividend = Array.isArray(n1) ? n1.join('') : String(n1);
                const divisor = n2 || "";

                // Measure
                const divW = ctx.measureText(dividend).width;
                const dvrW = ctx.measureText(divisor).width;
                const bracketW = 30;
                const totalW = divW + bracketW + dvrW;

                // Scale to fit
                const availW = cW * 0.9;
                const scale = totalW > availW ? availW / totalW : 1;

                // Center coordinates (considering scale)
                // Effective width/height in scaled space
                const effW = cW / scale;
                const effH = cH / scale;

                // Center coordinates
                const startX = (effW - totalW) / 2;
                const startY = effH / 2;

                // Apply Transform
                ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);

                // 1. Draw Divisor (Left) - Pink
                ctx.fillStyle = "#ec4899";
                ctx.textBaseline = 'middle';
                ctx.fillText(divisor, startX, startY);

                // 2. Draw Bracket )
                const bracketX = startX + dvrW + 5;
                ctx.beginPath();
                ctx.strokeStyle = "#475569"; // Slate for the structure
                ctx.lineWidth = 4;
                ctx.lineCap = "round";

                // Curved )
                const topCurve = startY - (fontSize * 0.5);
                const botCurve = startY + (fontSize * 0.5);
                ctx.moveTo(bracketX + 10, topCurve);
                ctx.bezierCurveTo(bracketX, topCurve, bracketX, botCurve, bracketX + 10, botCurve);
                ctx.stroke();

                // 3. Draw Top Bar (Over Dividend)
                const barStartX = bracketX + 10;
                ctx.beginPath();
                ctx.moveTo(barStartX, topCurve);
                ctx.lineTo(barStartX + divW + 20, topCurve);
                ctx.stroke();

                // 4. Draw Dividend (Right/Under) - Blue
                ctx.fillStyle = "#3b82f6";
                ctx.fillText(dividend, barStartX + 10, startY);

                return;
            }
            stopAnimation();
            const ctx = contextRef.current;
            const canvas = canvasRef.current;
            if (!ctx || !canvas) return;

            // 1. Setup Data
            let ops: string[] = [];
            if (Array.isArray(n1)) ops = n1.map(s => String(s ?? ""));
            else ops = [String(n1 ?? ""), String(n2 ?? "")].filter(s => s.length > 0);

            let baseFontSize = 100;
            const digitWidth = 60;
            const rowHeight = 140;

            // Calculate Metrics ONCE
            let maxLeft = 0;
            let maxRight = 0;
            const getParts = (s: string) => {
                if (!s) return { l: "", r: "" };
                const parts = String(s).split('.');
                return { l: parts[0] || "", r: parts[1] || "" };
            };

            const resultsRaw = Array.isArray(result) ? result : [result];
            const allLines = [...ops, ...resultsRaw.map(s => String(s ?? ""))].filter(s => s.length > 0);

            allLines.forEach(s => {
                const { l, r } = getParts(s);
                maxLeft = Math.max(maxLeft, l.length);
                maxRight = Math.max(maxRight, r.length);
            });

            const hasCarry = !!carry || (visualData?.carry && String(visualData.carry).length > 0);
            const totalContentWidth = (maxLeft + maxRight) * digitWidth + 150;
            const resultsCount = resultsRaw.filter(s => String(s ?? "").length > 0).length;

            // INCREASED HEIGHT BUDGET: 
            // Rows for operands + space for line + rows for results + space for carry + buffer
            const totalRows = Math.max(ops.length + resultsCount + (hasCarry ? 1.5 : 0), 2);
            const totalContentHeight = (totalRows * rowHeight) + 150;
            const colors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899'];

            // Resize canvas IMMEDIATELY if operation is expanding
            const dprForCalc = window.devicePixelRatio || 1;
            const currentCanvasH = canvas.height / dprForCalc;
            if (totalContentHeight > currentCanvasH) {
                setupCanvas(totalContentHeight + 100);
            }

            // 2. Animation Loop
            isAnimatingRef.current = true;
            const animate = () => {
                if (!isAnimatingRef.current) return;

                const ctx = contextRef.current;
                const canvas = canvasRef.current;
                if (!ctx || !canvas) return;

                const dpr = window.devicePixelRatio || 1;
                const w = canvas.width / dpr;
                const h = canvas.height / dpr;

                if (w <= 0 || h <= 0) {
                    animationRef.current = requestAnimationFrame(animate);
                    return;
                }

                // Reset Context
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);
                ctx.clearRect(0, 0, w, h);

                // 🎨 PURE WHITEBOARD THEME
                if (showGrid.current) {
                    drawGrid(ctx, w, h);
                } else {
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, w, h);
                }

                // Scaling & Centering: Use the actual available height
                const availW = Math.max(w * 0.95, 100);
                const availH = Math.max(h * 0.95, 100);
                const scaleX = totalContentWidth > availW ? availW / totalContentWidth : 1;
                const scaleY = totalContentHeight > availH ? availH / totalContentHeight : 1;
                const scale = Math.max(Math.min(scaleX, scaleY, 1), 0.1);

                ctx.save();
                ctx.translate(w / 2, h / 2);
                ctx.scale(scale, scale);

                const startX = -totalContentWidth / 2 + 50;
                // CENTER THE CONTENT vertically relative to its own total height
                const startY = -totalContentHeight / 2 + (hasCarry ? rowHeight * 1.2 : 50) + 80;
                const gridX = startX + 100 + (maxLeft * digitWidth);

                const activeHD = visualData?.highlightDigit;
                const activeMD = visualData?.multiplierDigit;

                ctx.font = `bold ${baseFontSize}px 'Comic Sans MS', sans-serif`;
                ctx.textBaseline = 'middle';

                // 🎨 KID-FRIENDLY THEME (Colores por valor posicional)
                const placeValueColors = ["#10b981", "#3b82f6", "#ef4444", "#a855f7", "#f59e0b", "#06b6d4"];
                const highlightColor = "#f97316"; // Socratic Orange
                const pulse = 1 + Math.sin(Date.now() / 200) * 0.12;

                // 🔦 COLUMN HIGHLIGHT PILLAR (Before numbers)
                if (highlight && highlight.startsWith('c')) {
                    const colValue = parseInt(highlight.substring(1));
                    let pillarX = 0;
                    if (colValue >= 0) {
                        pillarX = gridX - (colValue * digitWidth) - digitWidth;
                    } else {
                        // Decimal columns (tenths = -1, hundredths = -2, ...)
                        pillarX = gridX + (Math.abs(colValue + 1) * digitWidth);
                    }

                    ctx.save();
                    ctx.fillStyle = "rgba(249, 115, 22, 0.15)"; // Soft Socratic Orange
                    ctx.beginPath();
                    // Draw a vertical pillar covering operands and result
                    ctx.roundRect(pillarX + 5, startY - 80, digitWidth - 10, (ops.length + resultsCount + 1) * rowHeight, 15);
                    ctx.fill();
                    ctx.strokeStyle = "rgba(249, 115, 22, 0.4)";
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    ctx.restore();
                }

                // Draw Operands
                ops.forEach((op, idx) => {
                    const y = startY + (idx * rowHeight);
                    const { l, r } = getParts(op);

                    // 1. Integers
                    for (let i = 0; i < l.length; i++) {
                        const char = l[l.length - 1 - i];
                        const cx = gridX - (i * digitWidth) - (digitWidth / 2);

                        // 🔍 Check Borrowing for this digit
                        const borrowEntry = (borrows || visualData?.borrows || []).find((b: any) => b.colIndex === i);

                        const isFocused = (highlight === `c${i}`) || (idx === 0 && activeHD?.col === i) ||
                            (idx === 1 && activeMD?.col === i);

                        ctx.fillStyle = isFocused ? highlightColor : (placeValueColors[i % placeValueColors.length]);

                        ctx.save();
                        ctx.shadowBlur = isFocused ? 15 : 4;
                        ctx.shadowColor = ctx.fillStyle as string;

                        if (operator === "×" && isFocused) {
                            // 🫁 BREATHING ANIMATION for Multiplier digits
                            ctx.save();
                            ctx.translate(cx, y);
                            ctx.scale(pulse, pulse);
                            const metrics = ctx.measureText(char);
                            ctx.fillText(char, -metrics.width / 2, 0);
                            ctx.restore();
                        } else if (idx === 0 && borrowEntry) {
                            // Struck-through digit
                            ctx.fillStyle = "#64748b";
                            ctx.fillText(char, cx - (ctx.measureText(char).width / 2), y);

                            // Red Slash (Keep red for correction visibility but thinner)
                            ctx.strokeStyle = "#ef4444";
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.moveTo(cx - 15, y + 15);
                            ctx.lineTo(cx + 15, y - 15);
                            ctx.stroke();

                            // New Value
                            ctx.fillStyle = "#2563eb";
                            ctx.shadowColor = "rgba(37, 99, 235, 0.4)";
                            ctx.font = `bold ${baseFontSize * 0.7}px 'Comic Sans MS', sans-serif`;
                            ctx.fillText(borrowEntry.newValue, cx - (ctx.measureText(borrowEntry.newValue).width / 2), y - 60);

                            ctx.font = `bold ${baseFontSize}px 'Comic Sans MS', sans-serif`;
                        } else {
                            ctx.fillText(char, cx - (ctx.measureText(char).width / 2), y);
                        }
                        ctx.restore();
                    }

                    // 2. Dot & Decimals
                    const isDecimalFocus = (highlight === 'decimals' || (highlight === 'points' && idx <= 1));
                    if (r.length > 0 || op.includes('.')) {
                        ctx.fillStyle = isDecimalFocus ? highlightColor : "#000000";
                        // Draw dot
                        ctx.fillText('.', gridX, y);
                        for (let i = 0; i < r.length; i++) {
                            const char = r[i];
                            const cx = gridX + (i * digitWidth) + (digitWidth / 2);

                            // Pulse decimals in "mult_count" phase or focal column
                            const isFocused = (highlight === `c${-(i + 1)}`);
                            ctx.fillStyle = (isDecimalFocus || isFocused) ? highlightColor : (placeValueColors[(i + 3) % placeValueColors.length]);
                            ctx.fillText(char, cx + 15 - (ctx.measureText(char).width / 2), y);
                        }
                    }
                });

                const lineY = startY + ((ops.length - 1) * rowHeight) + (rowHeight * 0.6);

                // Operator & Line
                if (ops.length > 0) {
                    const opRowIdx = ops.length > 1 ? ops.length - 1 : 0;
                    const opY = startY + (opRowIdx * rowHeight);
                    const opX = gridX - (maxLeft * digitWidth) - 110;

                    ctx.save();
                    ctx.translate(opX, opY);
                    ctx.fillStyle = "#000000";
                    ctx.font = `bold ${baseFontSize}px sans-serif`;
                    ctx.fillText(operator || "+", -ctx.measureText(operator || "+").width / 2, 8);
                    ctx.restore();

                    ctx.lineWidth = 4;
                    ctx.strokeStyle = "#000000";
                    ctx.beginPath();
                    ctx.moveTo(gridX - (maxLeft * digitWidth) - 140, lineY);
                    ctx.lineTo(gridX + 100, lineY);
                    ctx.stroke();
                }

                // 🎯 Result
                if (result) {
                    const resultsArray = Array.isArray(result) ? result : [result];

                    // MULTIPLICATION SUM LINE & SIGN
                    if (operator === "×" && resultsArray.length > 1) {
                        const isDone = highlight === "done";
                        const numPartials = isDone ? resultsArray.length - 1 : resultsArray.length;

                        // Draw + sign next to the last partial product row
                        const plusX = gridX - (maxLeft * digitWidth) - 110;
                        const plusY = lineY + ((numPartials - 0.5) * rowHeight);
                        ctx.save();
                        ctx.fillStyle = "#22c55e"; // Vibrant Green
                        ctx.font = `bold ${baseFontSize}px 'Comic Sans MS', sans-serif`;
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = "rgba(34, 197, 94, 0.4)";
                        ctx.fillText("+", plusX, plusY);
                        ctx.restore();

                        // Draw second horizontal line
                        const secondLineY = lineY + (numPartials * rowHeight);
                        ctx.lineWidth = 5;
                        ctx.strokeStyle = "#1e293b";
                        ctx.beginPath();
                        ctx.moveTo(gridX - (maxLeft * digitWidth) - 140, secondLineY);
                        ctx.lineTo(gridX + 100, secondLineY);
                        ctx.stroke();
                    }

                    resultsArray.forEach((resLine, resIdx) => {
                        if (!resLine) return;
                        const resY = lineY + (resIdx * rowHeight) + (rowHeight * 0.5);

                        const { l, r } = getParts(resLine);
                        for (let i = 0; i < l.length; i++) {
                            const char = l[l.length - 1 - i];
                            const cx = gridX - (i * digitWidth) - (digitWidth / 2);

                            // 🌈 COLORED RESULTS with life (Shadow)
                            const isFocused = (highlight === `c${i}`);
                            ctx.fillStyle = isFocused ? highlightColor : placeValueColors[i % placeValueColors.length];
                            ctx.save();
                            ctx.shadowBlur = isFocused ? 15 : 8;
                            ctx.shadowColor = ctx.fillStyle as string;

                            if (isFocused) {
                                ctx.save();
                                ctx.translate(cx, resY);
                                ctx.scale(pulse, pulse);
                                ctx.fillText(char, -ctx.measureText(char).width / 2, 0);
                                ctx.restore();
                            } else {
                                ctx.fillText(char, cx - (ctx.measureText(char).width / 2), resY);
                            }
                            ctx.restore();
                        }
                        if (r.length > 0) {
                            ctx.fillStyle = "#1e293b";
                            ctx.fillText('.', gridX, resY);
                            for (let i = 0; i < r.length; i++) {
                                const char = r[i];
                                const cx = gridX + (i * digitWidth) + (digitWidth / 2);
                                const isFocused = (highlight === `c${-(i + 1)}`);
                                ctx.fillStyle = isFocused ? highlightColor : placeValueColors[(i + 3) % placeValueColors.length];
                                ctx.save();
                                ctx.shadowBlur = isFocused ? 15 : 4;
                                ctx.shadowColor = ctx.fillStyle as string;

                                if (isFocused) {
                                    ctx.save();
                                    ctx.translate(cx + 15, resY);
                                    ctx.scale(pulse, pulse);
                                    ctx.fillText(char, -ctx.measureText(char).width / 2, 0);
                                    ctx.restore();
                                } else {
                                    ctx.fillText(char, cx + 15 - (ctx.measureText(char).width / 2), resY);
                                }
                                ctx.restore();
                            }
                        }
                    });
                }

                // ☁️ CARRY CLOUD (Only for Addition/Multiplication)
                if (carry && operator !== "-") {
                    let cloudX = gridX - (1 * digitWidth) - (digitWidth / 2); // Default: ones place

                    if (highlight && highlight.startsWith('c')) {
                        const colValue = parseInt(highlight.substring(1));
                        if (colValue >= 0) {
                            cloudX = gridX - (colValue * digitWidth) - (digitWidth / 2);
                        } else {
                            // Decimal columns (tenths = -1, hundredths = -2, ...)
                            cloudX = gridX + (Math.abs(colValue + 1) * digitWidth) + (digitWidth / 2);
                        }
                    } else {
                        const nextCol = (activeHD?.col !== undefined) ? activeHD.col + 1 : 1;
                        cloudX = gridX - (nextCol * digitWidth) - (digitWidth / 2);
                    }
                    const cloudY = startY - rowHeight * 1.0 + Math.sin(Date.now() / 400) * 8;

                    ctx.save();
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetY = 2;
                    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
                    ctx.fillStyle = "#ffffff";
                    ctx.strokeStyle = "#3b82f6";
                    ctx.lineWidth = 2;

                    const drawCloudPath = (x: number, y: number, r: number) => {
                        ctx.beginPath();
                        ctx.arc(x, y, r, 0, Math.PI * 2);
                        ctx.arc(x - r * 0.8, y + r * 0.2, r * 0.7, 0, Math.PI * 2);
                        ctx.arc(x + r * 0.8, y + r * 0.2, r * 0.7, 0, Math.PI * 2);
                        ctx.arc(x - r * 0.4, y - r * 0.6, r * 0.8, 0, Math.PI * 2);
                        ctx.arc(x + r * 0.4, y - r * 0.6, r * 0.8, 0, Math.PI * 2);
                        ctx.lineWidth = 6;
                        ctx.stroke();
                        ctx.fill();
                    };

                    drawCloudPath(cloudX, cloudY, 32);

                    ctx.shadowBlur = 0;
                    ctx.fillStyle = "#1e3a8a";
                    ctx.font = `bold ${baseFontSize * 0.8}px 'Comic Sans MS', sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(String(carry), cloudX, cloudY + 2);
                    ctx.restore();
                }

                // ✨ MAGIC BORROW ANIMATION (The "Traveling 1")
                const activeBorrowCol = activeHD?.col;
                if (operator === "-" && activeBorrowCol !== undefined) {
                    const borrowEntry = (borrows || visualData?.borrows || []).find((b: any) => b.colIndex === activeBorrowCol + 1);
                    if (borrowEntry) {
                        const elapsed = Date.now() - startTime;
                        const duration = 1200; // 1.2s travel
                        const progress = Math.min(elapsed / duration, 1);

                        const startX_B = gridX - ((activeBorrowCol + 1) * digitWidth) - (digitWidth / 2);
                        const targetX_B = gridX - (activeBorrowCol * digitWidth) - (digitWidth / 2);
                        const startY_B = startY - 70;
                        const targetY_B = startY - 40;

                        // Arch
                        const cpX = (startX_B + targetX_B) / 2;
                        const cpY = startY_B - 120;

                        const t = progress;
                        const xt = (1 - t) * (1 - t) * startX_B + 2 * (1 - t) * t * cpX + t * t * targetX_B;
                        const yt = (1 - t) * (1 - t) * startY_B + 2 * (1 - t) * t * cpY + t * t * targetY_B;

                        if (progress < 1) {
                            ctx.save();
                            ctx.shadowBlur = 20;
                            ctx.shadowColor = "#f59e0b";
                            ctx.fillStyle = "#f59e0b";
                            ctx.font = `bold ${baseFontSize * 1.1}px 'Comic Sans MS', sans-serif`;
                            ctx.fillText("1", xt - ctx.measureText("1").width / 2, yt);

                            // Particles Trail
                            if (Math.random() > 0.6) {
                                particles.current.push({
                                    x: xt, y: yt,
                                    vx: (Math.random() - 0.5) * 3,
                                    vy: (Math.random() - 0.5) * 3,
                                    life: 1,
                                    color: "#fbbf24",
                                    size: Math.random() * 5 + 3
                                });
                            }
                            ctx.restore();
                        } else if (progress >= 1 && elapsed < duration + 300) {
                            // Impact burst
                            if (elapsed < duration + 40) {
                                createExplosion(targetX_B, targetY_B, "#fbbf24", 20);
                            }
                        }
                    }
                }

                ctx.restore(); // Restore scale/translate
                updateParticles(Date.now());
                animationRef.current = requestAnimationFrame(animate);
            };

            const startTime = Date.now();
            animate();
        },









        drawDivisionStep: (dividend: string, divisor: string, quotient: string, product?: string, remainder?: string, highlight?: string, style: 'us' | 'latin' = 'latin', columnIndex?: number, visualData?: any) => {
            stopAnimation();
            const ctx = contextRef.current; const canvas = canvasRef.current;
            if (!ctx || !canvas) return;
            const dpr = window.devicePixelRatio || 1, cW = canvas.width / dpr, cH = canvas.height / dpr;

            const { history: subHistory = [], tempVal } = visualData || {};
            const hist = Array.isArray(subHistory) ? subHistory : [];

            // 1. Setup for Measurement
            let fontSize = 110;
            ctx.font = `bold ${fontSize}px 'Comic Sans MS'`;

            // Proportional row Height
            let rowHeight_base = fontSize * 1.35;

            const totalRowsCount = 4 + (hist.length * 2) + (product ? 1 : 0) + (remainder ? 1 : 0);
            const requiredH = totalRowsCount * rowHeight_base + 150;

            // Resize canvas if operation is very long
            const currentCanvasH = canvas.height / dpr;
            if (requiredH > currentCanvasH) {
                setupCanvas(requiredH);
            }

            const currentCH = canvas.height / dpr;
            const parent = canvas.parentElement;
            const visibleH = parent ? parent.clientHeight : 800;

            const divW_raw = ctx.measureText(dividend).width;
            const dvrW_raw = ctx.measureText(divisor).width;
            const totalW_raw = divW_raw + dvrW_raw + 150;

            // 3. Smart Scale
            const maxW = cW * 0.95;
            const maxH = currentCH * 0.95;

            const wScale = totalW_raw > maxW ? maxW / totalW_raw : 1;
            const hScale = requiredH > maxH ? maxH / requiredH : 1;
            const finalScale = Math.min(wScale, hScale);

            if (finalScale < 1) {
                fontSize = Math.floor(fontSize * finalScale);
            }

            ctx.clearRect(0, 0, cW, currentCH);
            ctx.font = `bold ${fontSize}px 'Comic Sans MS'`;
            const rowHeight = fontSize * 1.35;

            // 🎯 PURE CENTERING LOGIC
            const divW = ctx.measureText(dividend).width;
            const dvrW = ctx.measureText(divisor).width;
            const bracketW = Math.max(80 * finalScale, fontSize * 0.7);
            const totalOpW = divW + dvrW + bracketW;

            // Vertical Metrics
            const totalContentH = (totalRowsCount * rowHeight);
            const startY = (currentCH - totalContentH) / 2 + (style === 'us' ? fontSize * 2 : fontSize);
            const startX = (cW - totalOpW) / 2;
            const cx = cW / 2;

            // 🌈 KID-FRIENDLY COLORS
            const colors = {
                dividend: '#3b82f6', // Blue
                divisor: '#ec4899',  // Pink
                quotient: '#10b981', // Green
                remainder: '#f59e0b', // Yellow/Orange
                subtraction: '#ef4444', // Red
                default: '#1e293b'
            };

            // Helper to draw Highlight
            const drawHighlightBox = (x: number, y: number, w: number, h: number, label?: string) => {
                ctx.save();
                ctx.fillStyle = "rgba(244, 63, 94, 0.15)";
                ctx.strokeStyle = "#f43f5e";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.roundRect(x - 10, y - h, w + 20, h + 20, 10);
                ctx.fill();
                ctx.stroke();
                if (label) {
                    ctx.font = "bold 16px 'Outfit'";
                    ctx.fillStyle = "#f43f5e";
                    ctx.fillText(label, x + w / 2 - 20, y - h - 10);
                }
                ctx.restore();
            };

            if (style === 'latin') {
                // --- LATIN LAYOUT: Dividend | Divisor ---
                // Rule: Vertical line between Div/Div. Horizontal line UNDER Divisor. Quotient UNDER that.

                // 1. Draw Dividend (Left)
                if (highlight === 'dividend') drawHighlightBox(startX, startY, divW, fontSize, "Dividendo");
                ctx.fillStyle = highlight === 'dividend' ? "#f43f5e" : colors.dividend;
                ctx.font = `bold ${fontSize}px 'Comic Sans MS'`;
                ctx.fillText(dividend, startX, startY);

                // 2. Draw Bracket L-Shape
                const bracketX = startX + divW + 20; // Added clear margin
                ctx.beginPath();
                ctx.lineWidth = 6;
                ctx.strokeStyle = "#1e293b";
                ctx.lineCap = "round";

                // Vertical line (Starting from top of numbers down to baseline + extra height)
                const vLineTop = startY - fontSize + 5;
                const vLineBot = startY + fontSize * 1.2; // Longer vertical line
                ctx.moveTo(bracketX, vLineTop);
                ctx.lineTo(bracketX, vLineBot);

                // Horizontal line (Calculated width based on divisor or quotient)
                const totalQW_val = ctx.measureText(quotient).width;
                const horizontalW = Math.max(dvrW, totalQW_val) + 40;
                ctx.moveTo(bracketX, startY + 15);
                ctx.lineTo(bracketX + horizontalW, startY + 15);
                ctx.stroke();

                // 3. Draw Divisor (Right of vertical, Above horizontal)
                const dvrX = bracketX + 20;
                if (highlight === 'divisor') drawHighlightBox(dvrX, startY, dvrW, fontSize, "Divisor");
                ctx.fillStyle = highlight === 'divisor' ? "#f43f5e" : colors.divisor;
                ctx.fillText(divisor, dvrX, startY);

                // 4. Draw Quotient (Strictly UNDER Horizontal Line)
                if (quotient && quotient.trim() && quotient.trim() !== '_') {
                    const qChars = quotient.split('');
                    const qTotalW = ctx.measureText(quotient).width;

                    const qStartX = dvrX; // Align with divisor start
                    const qY = startY + fontSize + 15; // Adjusted spacing
                    let curX = qStartX;

                    qChars.forEach((char, idx) => {
                        const charW = ctx.measureText(char).width;
                        // Match US Style Logic: Highlight the last digit if 'quotient' is active
                        // This guides the user to the "new" digit they just added/need to add
                        const isTarget = highlight === 'quotient' && idx === qChars.length - 1;

                        if (isTarget) {
                            drawHighlightBox(curX, qY, charW, fontSize, "Cociente");
                        }

                        ctx.fillStyle = isTarget ? "#f43f5e" : colors.quotient;
                        ctx.fillText(char, curX, qY);
                        curX += charW;
                    });
                }

                // 5. DRAW HISTORY (Long Division Staircase)
                const rowHeight = fontSize + 35;
                const hist = Array.isArray(subHistory) ? subHistory : [];

                hist.forEach((h: any, idx: number) => {
                    const hProdY = startY + (idx * 2 + 1) * rowHeight;
                    const hRemY = startY + (idx * 2 + 2) * rowHeight;

                    const targetX = startX + ctx.measureText(dividend.substring(0, h.columnIndex + 1)).width;
                    const hProdW = ctx.measureText(h.product).width;
                    const hRemW = ctx.measureText(h.remainder).width;

                    const hProdX = targetX - hProdW;
                    let hRemX = targetX - hRemW;

                    // Draw previous product
                    ctx.fillStyle = "#1e293b";
                    ctx.fillText(h.product, hProdX, hProdY);
                    ctx.fillRect(hProdX - 5, hProdY + 10, hProdW + 10, 4);

                    // Draw previous remainder
                    ctx.fillStyle = colors.remainder;
                    ctx.fillText(h.remainder, hRemX, hRemY);
                    // Draw "brought down" digit: next digit from dividend, or in decimal phase a "0" after the remainder
                    const nextCol = h.columnIndex + 1;
                    const laterStepUsesNextCol = hist.some((hh: any, i: number) => i > idx && hh.columnIndex === nextCol) || columnIndex === nextCol;
                    const isDecimalPhase = columnIndex !== undefined && columnIndex >= dividend.length;
                    const isLastRow = idx === hist.length - 1;
                    if (laterStepUsesNextCol) {
                        const gap = 4;
                        hRemX += hRemW + gap;
                        ctx.fillStyle = colors.remainder;
                        if (isDecimalPhase && isLastRow && nextCol >= dividend.length) {
                            ctx.fillText("0", hRemX, hRemY);
                        } else if (nextCol < dividend.length) {
                            const broughtDown = dividend[nextCol];
                            ctx.fillText(broughtDown, hRemX, hRemY);
                        }
                    }
                });

                // 6. Current Product / Remainder
                const nextIdx = hist.length;
                if (product && product.trim()) {
                    const pY = startY + (nextIdx * 2 + 1) * rowHeight;
                    const pW = ctx.measureText(product).width;
                    let pX = startX;
                    if (columnIndex !== undefined) {
                        // FIX: Handle Decimal Alignment (Virtual Zeros)
                        let measureStr = dividend.substring(0, columnIndex + 1);
                        if (columnIndex >= dividend.length) {
                            const extra = columnIndex - dividend.length + 1;
                            measureStr = dividend + "0".repeat(extra);
                        }
                        const targetX = startX + ctx.measureText(measureStr).width;
                        pX = targetX - pW;
                    }

                    if (highlight === 'product') drawHighlightBox(pX, pY, pW, fontSize);
                    ctx.fillStyle = "#1e293b";
                    ctx.fillText(product, pX, pY);
                    ctx.fillRect(pX - 5, pY + 10, pW + 10, 4);
                    // Label: "cociente × divisor = producto" so the student sees why the number below appears
                    const digit = tempVal?.digit;
                    if (digit != null && divisor) {
                        const fmtDivisor = divisor.replace(',', '.');
                        const label = `${digit} × ${fmtDivisor} = ${product}`;
                        const smallFont = Math.max(14, Math.floor(fontSize * 0.22));
                        ctx.font = `${smallFont}px 'Comic Sans MS'`;
                        ctx.fillStyle = "#64748b";
                        const labelW = ctx.measureText(label).width;
                        ctx.fillText(label, pX + (pW - labelW) / 2, pY - 20);
                        ctx.font = `bold ${fontSize}px 'Comic Sans MS'`;
                    }
                }
                if (remainder && remainder.trim()) {
                    // Cuando la división termina (done), no dibujar residuo abajo; que termine arriba.
                    if (highlight === 'done') {
                        // no dibujar fila de residuo
                    } else {
                        const isNewRem = highlight === 'remainder' || nextIdx === 0;

                        // 🛡️ GUARD: Don't draw "starting" remainders if no work (product) has been done yet.
                        // This fixes the "unnecessary orange twelve" at the start of division.
                        if (nextIdx === 0 && (!product || !product.trim()) && highlight !== 'remainder') {
                            return;
                        }

                        const rY = isNewRem
                            ? startY + (nextIdx * 2 + 2) * rowHeight
                            : startY + (nextIdx * 2) * rowHeight;
                        const rW = ctx.measureText(remainder).width;
                        let rX = startX;
                        if (columnIndex !== undefined) {
                            // FIX: Handle Decimal Alignment (Virtual Zeros)
                            let measureStr = dividend.substring(0, columnIndex + 1);
                            if (columnIndex >= dividend.length) {
                                const extra = columnIndex - dividend.length + 1;
                                measureStr = dividend + "0".repeat(extra);
                            }
                            const targetX = startX + ctx.measureText(measureStr).width;
                            rX = targetX - rW;
                        }
                        if (highlight === 'remainder') {
                            drawHighlightBox(rX, rY, rW, fontSize, "Residuo");
                            ctx.fillStyle = highlight === 'remainder' ? "#f43f5e" : colors.remainder;
                            ctx.fillText(remainder, rX, rY);
                        }
                    }
                }

            } else {
                // --- US LAYOUT: Divisor ) Dividend ---
                // Rule: Divisor Left. Curved ) separator. Horizontal bar OVER Dividend. Quotient ON TOP of bar.

                const uStartX = startX + dvrW + bracketW;

                // 1. Draw Divisor (Left)
                const dvrX = startX;
                if (highlight === 'divisor') drawHighlightBox(dvrX, startY, dvrW, fontSize, "Divisor");
                ctx.fillStyle = highlight === 'divisor' ? "#f43f5e" : colors.divisor;
                ctx.font = `bold ${fontSize}px 'Comic Sans MS'`;
                ctx.fillText(divisor, dvrX, startY);

                // 2. Draw Bracket )
                ctx.beginPath();
                ctx.lineWidth = 4;
                ctx.lineCap = "round";
                ctx.strokeStyle = "#475569";

                const bracketTop = startY - fontSize - 5;
                const bracketBottom = startY + 10;
                const bracketX = startX + dvrW + (bracketW / 2);

                ctx.moveTo(bracketX, bracketTop);
                ctx.bezierCurveTo(bracketX - 15, bracketTop, bracketX - 15, bracketBottom, bracketX, bracketBottom);
                ctx.stroke();

                // 3. Draw Top Bar (OVER Dividend)
                ctx.beginPath();
                ctx.lineWidth = 3;
                ctx.moveTo(bracketX, bracketTop);
                ctx.lineTo(uStartX + divW + 20, bracketTop);
                ctx.stroke();

                // 4. Draw Dividend (Under Bar)
                if (highlight === 'dividend') drawHighlightBox(uStartX, startY, divW, fontSize, "Dividendo");
                ctx.fillStyle = highlight === 'dividend' ? "#f43f5e" : colors.dividend;
                ctx.fillText(dividend, uStartX, startY);

                // 5. Draw Quotient (ABOVE Bar)
                if (quotient && quotient.trim() && quotient.trim() !== '_') {
                    const qChars = quotient.split('');
                    const qY = startY - fontSize - 15; // Above bar

                    qChars.forEach((char, idx) => {
                        if (char === ' ' || char === '_') return;

                        // Rule: The last digit of the quotient string should ideally align with the current columnIndex, 
                        // BUT historically, the n-th digit of quotient aligns with the n-th working column of dividend.
                        // For US style: quotient digits go ABOVE the bar, aligned with dividend columns.

                        // Quotient "176" for dividend "12345": "1" over "2", "7" over "3", "6" over "4".
                        // When columnIndex is undefined (e.g. after "no sé" persistence): align last digit above
                        // the rightmost digit of the first working part (dividend.length - 1 for single digit).
                        let targetCol = 0;
                        if (columnIndex !== undefined) {
                            targetCol = columnIndex - (qChars.length - 1 - idx);
                        } else {
                            // Fallback: first quotient digit typically goes above last digit of first "take"
                            // e.g. 115÷15: 7 goes above the 5 (index 2), not above the 1
                            targetCol = Math.min(idx + dividend.length - qChars.length, dividend.length - 1);
                            if (targetCol < 0) targetCol = idx;
                        }

                        if (targetCol >= 0 && targetCol < dividend.length) {
                            const prevWidth = ctx.measureText(dividend.substring(0, targetCol)).width;
                            const digitWidth = ctx.measureText(dividend[targetCol]).width;
                            const charWidth = ctx.measureText(char).width;
                            const qDigitX = uStartX + prevWidth + (digitWidth - charWidth) / 2;

                            if (highlight === 'quotient' && idx === qChars.length - 1) {
                                drawHighlightBox(qDigitX, qY, charWidth, fontSize, "Cociente");
                            }

                            ctx.fillStyle = (highlight === 'quotient' && idx === qChars.length - 1) ? "#f43f5e" : colors.quotient;
                            ctx.fillText(char, qDigitX, qY);
                        }
                    });
                }

                // 6. DRAW HISTORY (US Style)
                const rowHeight = fontSize + 35;
                const hist = Array.isArray(subHistory) ? subHistory : [];

                hist.forEach((h: any, idx: number) => {
                    const hProdY = startY + (idx * 2 + 1) * rowHeight;
                    const hRemY = startY + (idx * 2 + 2) * rowHeight;

                    const targetX = uStartX + ctx.measureText(dividend.substring(0, h.columnIndex + 1)).width;
                    const hProdW = ctx.measureText(h.product).width;
                    const hRemW = ctx.measureText(h.remainder).width;

                    const hProdX = targetX - hProdW;
                    let hRemX = targetX - hRemW;

                    // Draw product
                    ctx.fillStyle = "#1e293b";
                    ctx.fillText(h.product, hProdX, hProdY);

                    // Product line should be length of product digits
                    ctx.fillRect(hProdX - 2, hProdY + 10, hProdW + 4, 3);

                    // Draw remainder
                    ctx.fillStyle = colors.remainder;
                    ctx.fillText(h.remainder, hRemX, hRemY);
                    // Draw "brought down" digit: next digit from dividend, or in decimal phase a "0" after the remainder
                    const nextCol = h.columnIndex + 1;
                    const laterStepUsesNextCol = hist.some((hh: any, i: number) => i > idx && hh.columnIndex === nextCol) || columnIndex === nextCol;
                    const isDecimalPhase = columnIndex !== undefined && columnIndex >= dividend.length;
                    const isLastRow = idx === hist.length - 1;
                    if (laterStepUsesNextCol) {
                        const gap = 4;
                        hRemX += hRemW + gap;
                        ctx.fillStyle = colors.remainder;
                        if (isDecimalPhase && isLastRow && nextCol >= dividend.length) {
                            ctx.fillText("0", hRemX, hRemY);
                        } else if (nextCol < dividend.length) {
                            const broughtDown = dividend[nextCol];
                            ctx.fillText(broughtDown, hRemX, hRemY);
                        }
                    }
                });

                // 7. Current Product / Remainder
                const nextIdx = hist.length;
                if (product && product.trim()) {
                    const pY = startY + (nextIdx * 2 + 1) * rowHeight;
                    const pW = ctx.measureText(product).width;
                    let pX = uStartX;
                    if (columnIndex !== undefined) {
                        const targetX = uStartX + ctx.measureText(dividend.substring(0, columnIndex + 1)).width;
                        pX = targetX - pW;
                    }

                    if (highlight === 'product') {
                        drawHighlightBox(pX, pY, pW, fontSize);
                        ctx.fillStyle = "#1e293b";
                        ctx.fillText(product, pX, pY);
                        ctx.fillRect(pX - 5, pY + 10, pW + 10, 4);
                        const digit = tempVal?.digit;
                        if (digit != null && divisor) {
                            const fmtDivisor = divisor.replace(',', '.');
                            const label = `${digit} × ${fmtDivisor} = ${product}`;
                            const smallFont = Math.max(14, Math.floor(fontSize * 0.22));
                            ctx.font = `${smallFont}px 'Comic Sans MS'`;
                            ctx.fillStyle = "#64748b";
                            const labelW = ctx.measureText(label).width;
                            ctx.fillText(label, pX + (pW - labelW) / 2, pY - 20);
                            ctx.font = `bold ${fontSize}px 'Comic Sans MS'`;
                        }
                    } else {
                        ctx.fillStyle = "#1e293b";
                        ctx.fillText(product, pX, pY);
                        ctx.fillRect(pX - 5, pY + 10, pW + 10, 4);
                    }
                }
                if (remainder && remainder.trim()) {
                    // 🛡️ Cuando la división termina (done), no dibujar residuo abajo; que termine arriba.
                    if (highlight === 'done') {
                        // no dibujar fila de residuo
                    } else {
                        const isNewRem = highlight === 'remainder' || nextIdx === 0;

                        if (nextIdx === 0 && (!product || !product.trim()) && highlight !== 'remainder') {
                            return;
                        }

                        const rY = isNewRem
                            ? startY + (nextIdx * 2 + 2) * rowHeight
                            : startY + (nextIdx * 2) * rowHeight;
                        const rW = ctx.measureText(remainder).width;
                        let rX = uStartX;
                        if (columnIndex !== undefined) {
                            const targetX = uStartX + ctx.measureText(dividend.substring(0, columnIndex + 1)).width;
                            rX = targetX - rW;
                        }
                        if (highlight === 'remainder') drawHighlightBox(rX, rY, rW, fontSize, "Residuo");
                        ctx.fillStyle = highlight === 'remainder' ? "#f43f5e" : colors.remainder;
                        ctx.fillText(remainder, rX, rY);
                    }
                }
            }
        },
        drawMultiplicationGroups: (numGroups: number, itemsPerGroup: number, itemType: string = "🍎") => {
            stopAnimation();
            const ctx = contextRef.current;
            const canvas = canvasRef.current;
            if (!ctx || !canvas) return;
            const dpr = window.devicePixelRatio || 1;
            const cW = canvas.width / dpr, cH = canvas.height / dpr;
            ctx.clearRect(0, 0, cW, cH);

            // Title
            ctx.fillStyle = "#1e293b";
            ctx.font = "bold 32px 'Comic Sans MS'";
            ctx.textAlign = "center";
            ctx.fillText(`${numGroups} grupos de ${itemsPerGroup}`, cW / 2, 50);

            const colors = ["#fee2e2", "#f0fdf4", "#eff6ff", "#fefce8", "#faf5ff"];
            const padding = 60;
            const availableW = cW - (padding * 2);

            // Layout (single row if few groups, multi-row if many)
            const rows = numGroups > 4 ? 2 : 1;
            const cols = Math.ceil(numGroups / rows);
            const slotW = availableW / cols;
            const slotH = (cH - 100) / rows;

            for (let i = 0; i < numGroups; i++) {
                const r = Math.floor(i / cols);
                const c = i % cols;
                const centerX = padding + (c * slotW) + (slotW / 2);
                const centerY = 120 + (r * slotH) + (slotH / 2);
                const radius = Math.min(slotW, slotH) * 0.4;

                // Draw Container (Circle)
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fillStyle = colors[i % colors.length];
                ctx.fill();
                ctx.strokeStyle = "#94a3b8";
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);

                // Draw Items inside
                ctx.font = `${radius * 0.4}px serif`;
                const itemSpacing = radius * 0.6;
                for (let j = 0; j < itemsPerGroup; j++) {
                    const angle = (j / itemsPerGroup) * Math.PI * 2;
                    const ix = centerX + Math.cos(angle) * (radius * 0.5);
                    const iy = centerY + Math.sin(angle) * (radius * 0.5);
                    ctx.fillText(itemType, ix, iy + (radius * 0.1));
                }
            }
        },
        drawDecomposition: (n1: number, factors1: number[], n2: number, factors2: number[]) => {
            stopAnimation();
            const ctx = contextRef.current; const canvas = canvasRef.current;
            if (!ctx || !canvas) return;
            const dpr = window.devicePixelRatio || 1, cW = canvas.width / dpr, cH = canvas.height / dpr;
            ctx.clearRect(0, 0, cW, cH);

            // --- HEADER: NANO BANANA PRO TECHNOLOGY ---
            ctx.fillStyle = "#fefce8"; // Banana Yellow tint
            ctx.fillRect(0, 0, cW, 80);

            ctx.fillStyle = "#854d0e";
            ctx.font = "bold 26px 'Comic Sans MS'";
            ctx.textAlign = "center";
            ctx.fillText("Descomposición en Factores Primos", cW / 2, 50);

            const drawFactorsBlock = (num: number, factors: number[], x: number) => {
                const startY = 160;
                // Main Number Box
                ctx.fillStyle = "#eff6ff";
                ctx.strokeStyle = "#3b82f6";
                ctx.lineWidth = 4;
                ctx.beginPath();
                if (typeof (ctx as any).roundRect === 'function') {
                    (ctx as any).roundRect(x - 60, startY - 40, 120, 80, 15);
                } else {
                    ctx.rect(x - 60, startY - 40, 120, 80);
                }
                ctx.stroke();
                ctx.fill();

                ctx.fillStyle = "#1e3a8a";
                ctx.font = "bold 42px 'Comic Sans MS'";
                ctx.fillText(num.toString(), x, startY + 15);

                // Factors
                factors.forEach((f, idx) => {
                    const fx = x + (idx - (factors.length - 1) / 2) * 85;
                    const fy = startY + 140;

                    // Tech Line
                    ctx.beginPath();
                    ctx.moveTo(x, startY + 40);
                    ctx.lineTo(fx, fy - 15);
                    ctx.strokeStyle = "#94a3b8";
                    ctx.setLineDash([5, 5]);
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Factor Circle
                    ctx.beginPath();
                    ctx.arc(fx, fy + 25, 30, 0, Math.PI * 2);
                    ctx.fillStyle = "#f0fdf4";
                    ctx.fill();
                    ctx.strokeStyle = "#22c55e";
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    ctx.fillStyle = "#166534";
                    ctx.font = "bold 28px 'Comic Sans MS'";
                    ctx.fillText(f.toString(), fx, fy + 35);
                });
            };

            drawFactorsBlock(n1, factors1, cW * 0.3);
            drawFactorsBlock(n2, factors2, cW * 0.7);

            // Tech Footer
            ctx.fillStyle = "#6366f1";
            ctx.font = "italic 22px 'Comic Sans MS'";
            ctx.fillText("Decomposition Matrix complete. Calculating LCD...", cW / 2, cH - 40);
        },

        drawAlgebra: (equation: string, variable: string, phase: string, highlight?: string) => {
            stopAnimation();
            const ctx = contextRef.current; const canvas = canvasRef.current;
            if (!ctx || !canvas) return;
            const dpr = window.devicePixelRatio || 1, cW = canvas.width / dpr, cH = canvas.height / dpr;
            ctx.clearRect(0, 0, cW, cH);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, cW, cH);

            const cX = cW / 2;
            const cY = cH / 2;

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Title
            ctx.fillStyle = '#1e293b';
            ctx.font = "bold 32px 'Outfit', sans-serif";
            ctx.fillText('Álgebra: Ecuación Lineal', cX, 60);

            // Display Equation
            const eqFontSize = 72;
            ctx.font = `bold ${eqFontSize}px 'Comic Sans MS', cursive`;

            // Equation part decomposition for highlighting
            // Simple: "x + 5 = 10"
            const parts = equation.split(' ');
            let totalW = 0;
            const partsData = parts.map(p => {
                const w = ctx.measureText(p + " ").width;
                const data = { text: p, w };
                totalW += w;
                return data;
            });

            let currentX = cX - totalW / 2;
            partsData.forEach(p => {
                const isVariable = p.text.toLowerCase().includes(variable.toLowerCase());
                const isHighlight = highlight && p.text.includes(highlight);

                if (isHighlight) {
                    ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
                    ctx.fillRect(currentX - 5, cY - eqFontSize / 2, p.w, eqFontSize);
                    ctx.fillStyle = '#f43f5e';
                } else if (isVariable) {
                    ctx.fillStyle = '#3b82f6';
                } else {
                    ctx.fillStyle = '#1e293b';
                }

                ctx.fillText(p.text, currentX + p.w / 2, cY);
                currentX += p.w;
            });

            // Help text
            ctx.font = "24px 'Outfit'";
            ctx.fillStyle = '#64748b';
            let help = "Encuentra el valor de la variable.";
            if (phase === 'algebra_step') help = "¡Hagamos lo mismo en ambos lados!";
            if (phase === 'algebra_final') help = "¡Variable despejada!";
            ctx.fillText(help, cX, cH - 80);
        },

        drawCoordinateGrid: (points: { x: number; y: number; label?: string }[], currentPoint?: { x: number; y: number }, phase?: string) => {
            stopAnimation();
            const ctx = contextRef.current; const canvas = canvasRef.current;
            if (!ctx || !canvas) return;
            const dpr = window.devicePixelRatio || 1, cW = canvas.width / dpr, cH = canvas.height / dpr;
            ctx.clearRect(0, 0, cW, cH);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, cW, cH);

            const cX = cW / 2;
            const cY = cH / 2;
            const size = Math.min(cW, cH) * 0.8;
            const gridCells = 10;
            const step = size / gridCells;

            // Draw Grid Lines
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            for (let i = -5; i <= 5; i++) {
                // Vertical
                ctx.beginPath();
                ctx.moveTo(cX + i * step, cY - size / 2);
                ctx.lineTo(cX + i * step, cY + size / 2);
                ctx.stroke();
                // Horizontal
                ctx.beginPath();
                ctx.moveTo(cX - size / 2, cY + i * step);
                ctx.lineTo(cX + size / 2, cY + i * step);
                ctx.stroke();
            }

            // Draw Main Axes
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 3;
            // X-Axis
            ctx.beginPath();
            ctx.moveTo(cX - size / 2 - 20, cY);
            ctx.lineTo(cX + size / 2 + 20, cY);
            ctx.stroke();
            // Y-Axis
            ctx.beginPath();
            ctx.moveTo(cX, cY - size / 2 - 20);
            ctx.lineTo(cX, cY + size / 2 + 20);
            ctx.stroke();

            // Labels
            ctx.fillStyle = '#475569';
            ctx.font = "bold 16px 'Outfit'";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = -5; i <= 5; i++) {
                if (i === 0) continue;
                ctx.fillText(i.toString(), cX + i * step, cY + 20);
                ctx.fillText((-i).toString(), cX - 25, cY + i * step);
            }
            ctx.font = "bold 20px 'Outfit'";
            ctx.fillText("X", cX + size / 2 + 35, cY);
            ctx.fillText("Y", cX, cY - size / 2 - 35);

            // Draw Saved Points
            points.forEach(p => {
                const px = cX + p.x * step;
                const py = cY - p.y * step;
                ctx.beginPath();
                ctx.arc(px, py, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#3b82f6';
                ctx.fill();
                if (p.label) {
                    ctx.fillStyle = '#1e3a8a';
                    ctx.font = "bold 14px 'Outfit'";
                    ctx.fillText(p.label, px + 15, py - 10);
                }
            });

            // Draw Current/Target Point
            if (currentPoint) {
                const tx = cX + currentPoint.x * step;
                const ty = cY - currentPoint.y * step;

                if (phase === 'coords_plot') {
                    // Blink effect or ghost point
                    ctx.beginPath();
                    ctx.arc(tx, ty, 8, 0, Math.PI * 2);
                    ctx.strokeStyle = '#f43f5e';
                    ctx.setLineDash([4, 4]);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    ctx.fillStyle = '#f43f5e';
                    ctx.font = "bold 18px 'Outfit'";
                    ctx.fillText(`¿Dónde está (${currentPoint.x}, ${currentPoint.y})?`, cX, 40);
                } else if (phase === 'coords_done') {
                    ctx.beginPath();
                    ctx.arc(tx, ty, 8, 0, Math.PI * 2);
                    ctx.fillStyle = '#10b981';
                    ctx.fill();
                    ctx.fillText(`¡Punto localizado!`, cX, 40);
                }
            }
        },

        drawProportionTable: (a1: string, b1: string, a2: string, b2: string, unitA: string, unitB: string, highlight?: string) => {
            stopAnimation();
            const ctx = contextRef.current; const canvas = canvasRef.current;
            if (!ctx || !canvas) return;
            const dpr = window.devicePixelRatio || 1, cW = canvas.width / dpr, cH = canvas.height / dpr;
            ctx.clearRect(0, 0, cW, cH);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, cW, cH);

            const cX = cW / 2;
            const cY = cH / 2;

            // Title
            ctx.fillStyle = "#1e293b";
            ctx.font = "bold 34px 'Outfit', sans-serif";
            ctx.textAlign = 'center';
            ctx.fillText("Proporcionalidad (Regla de Tres)", cX, 70);

            // Table Settings
            const cellW = 180;
            const cellH = 100;
            const tableX = cX - cellW;
            const tableY = cY - 80;

            // Header labels
            ctx.font = "bold 24px 'Outfit'";
            ctx.fillStyle = "#64748b";
            ctx.fillText(unitA, tableX + cellW / 2, tableY - 30);
            ctx.fillText(unitB, tableX + cellW * 1.5, tableY - 30);

            // Draw Table Grid
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 2;
            ctx.strokeRect(tableX, tableY, cellW * 2, cellH * 2);
            ctx.beginPath();
            ctx.moveTo(cX, tableY);
            ctx.lineTo(cX, tableY + cellH * 2);
            ctx.moveTo(tableX, tableY + cellH);
            ctx.lineTo(tableX + cellW * 2, tableY + cellH);
            ctx.stroke();

            // Arrows or Relation lines
            ctx.beginPath();
            ctx.moveTo(tableX + cellW / 2 + 50, tableY + cellH / 2);
            ctx.lineTo(tableX + cellW * 1.5 - 50, tableY + cellH / 2);
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 3;
            ctx.stroke();

            // Values
            const values = [
                { val: a1, x: tableX + cellW / 2, y: tableY + cellH / 2, id: 'a1' },
                { val: b1, x: tableX + cellW * 1.5, y: tableY + cellH / 2, id: 'b1' },
                { val: a2, x: tableX + cellW / 2, y: tableY + cellH * 1.5, id: 'a2' },
                { val: b2 || '?', x: tableX + cellW * 1.5, y: tableY + cellH * 1.5, id: 'b2' }
            ];

            values.forEach(v => {
                const isHighlight = highlight === v.id;
                ctx.fillStyle = isHighlight ? '#ef4444' : (v.id === 'b2' ? '#f59e0b' : '#1e293b');
                ctx.font = `bold ${isHighlight ? 54 : 48}px 'Comic Sans MS'`;
                ctx.fillText(v.val, v.x, v.y + 15);
            });

            // Instructions
            ctx.font = "24px 'Outfit'";
            ctx.fillStyle = "#475569";
            const help = b2 ? "¡Problema resuelto!" : "¿Cuál es el valor desconocido?";
            ctx.fillText(help, cX, cH - 70);
        },

        drawSolutionSteps: (steps: string[], currentStepIndex = -1) => {
            stopAnimation();
            const ctx = contextRef.current;
            const canvas = canvasRef.current;
            if (!ctx || !canvas) return;
            const dpr = window.devicePixelRatio || 1;
            const cW = canvas.width / dpr, cH = canvas.height / dpr;

            // Responsive Mobile Scaling
            const isMobile = cW < 500;
            const headerH = isMobile ? 60 : 80;
            const headerFont = isMobile ? 24 : 32;
            const baseFont = isMobile ? 22 : 32;
            const activeFont = isMobile ? 26 : 36;
            const startX = isMobile ? 20 : 60;
            const startY = isMobile ? 100 : 140;
            const lineHeight = isMobile ? 50 : 70;

            // Clear Canvas
            ctx.clearRect(0, 0, cW, cH);

            // Draw Header
            ctx.fillStyle = "#f0fdf4";
            ctx.fillRect(0, 0, cW, headerH);
            ctx.fillStyle = "#15803d";
            ctx.font = `bold ${headerFont}px 'Comic Sans MS'`;
            ctx.textAlign = "center";
            ctx.fillText("✨ Solución Paso a Paso ✨", cW / 2, headerH / 2 + 8);

            // Draw Steps
            ctx.textAlign = "left";

            steps.forEach((step, index) => {
                const y = startY + (index * lineHeight);
                const isCurrent = index === currentStepIndex;

                // Highlight box for current step
                if (isCurrent) {
                    ctx.fillStyle = "rgba(34, 197, 94, 0.1)";
                    ctx.strokeStyle = "#22c55e";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    const w = cW - (startX * 2) + 20;
                    const h = lineHeight * 0.9;
                    const hx = startX - 10;
                    const hy = y - (lineHeight * 0.65);

                    // Safety check for roundRect (not supported in all contexts/older browsers)
                    if (typeof (ctx as any).roundRect === 'function') {
                        (ctx as any).roundRect(hx, hy, w, h, 10);
                    } else {
                        ctx.rect(hx, hy, w, h);
                    }
                    ctx.fill();
                    ctx.stroke();
                }

                ctx.font = isCurrent ? `bold ${activeFont}px 'Comic Sans MS'` : `${baseFont}px 'Comic Sans MS'`;
                ctx.fillStyle = isCurrent ? "#15803d" : "#334155";

                // If it's the final answer (emoji check)
                if (step.includes('✅') || step.includes('Respuesta')) {
                    ctx.fillStyle = "#16a34a";
                    ctx.font = `bold ${activeFont + 4}px 'Comic Sans MS'`;
                }

                ctx.fillText(step, startX, y);
            });
        }
    }));

    return (
        <canvas
            ref={canvasRef}
            role="img"
            aria-label="Pizarra matemática para resolver operaciones paso a paso. Dibuja o usa las operaciones guiadas."
            className="w-full h-full cursor-crosshair touch-none"
            style={{
                backgroundColor: '#ffffff',
                touchAction: 'none'
            }}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            onPointerCancel={stopDrawing}
        />
    );
});
