import React from 'react';
import { useAvatar } from '../../context/AvatarContext';
import { useGamification } from '../../context/GamificationContext';
import { AVATARS, ACCESSORIES, Accessory } from './data/avatars';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AvatarDisplay muestra el avatar del usuario y, por defecto, los accesorios equipados
 * desde la Tienda Nova (contexto). Lo que el usuario compra y equipa en la tienda se
 * muestra en toda la app (Campus, Arena, Sidebar, Misiones, etc.). Solo se usa
 * accessoriesOverride en casos concretos (Probador Virtual, avatar de otro jugador).
 */
export type AccessoryOffsetValues = { x: number; y: number; scale: number; rotate?: number; skewX?: number; skewY?: number; neck?: number; shoulders?: number; sleeves?: number };

interface AvatarDisplayProps {
    avatarId?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showBackground?: boolean;
    className?: string;
    forceNoAccessories?: boolean;
    isCurrentUser?: boolean;
    /** Solo para casos especiales (Probador, otro jugador). Por defecto se usan los accesorios del contexto (Tienda Nova). */
    accessoriesOverride?: Record<string, string>;
    /** Override offsets por accesorio (ej. en Probador Virtual para vista previa en vivo). Clave = accessory id. */
    accessoryOffsetsOverride?: Record<string, AccessoryOffsetValues>;
    /** Muestra el nombre del niño debajo del avatar (si está en el perfil). */
    showName?: boolean;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
    avatarId,
    size = 'md',
    showBackground = true,
    className,
    forceNoAccessories = false,
    isCurrentUser = false,
    accessoriesOverride,
    accessoryOffsetsOverride,
    showName = false
}) => {
    const { currentAvatar, studentName, equippedAccessories: localAccessories, accessoryOffsets, grade } = useAvatar();
    const { level } = useGamification();

    const activeId = avatarId || currentAvatar;
    const equippedAccessories = accessoriesOverride || localAccessories;

    const avatarData = AVATARS.find(a => a.id === activeId) || AVATARS[0];
    if (!avatarData) return null;

    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-24 h-24',
        lg: 'w-48 h-48',
        xl: 'w-64 h-64',
    };
    // Font-size proporcional al tamaño del avatar para que los accesorios (em) escalen correctamente en perfil/sidebar
    const containerFontSize = size === 'sm' ? '3px' : size === 'md' ? '6px' : size === 'lg' ? '12px' : '16px';

    const getBiotopoStyle = () => {
        switch (grade) {
            case 1: return 'from-teal-400 via-emerald-500 to-green-600';
            case 2: return 'from-amber-400 via-orange-500 to-red-600';
            case 3: return 'from-sky-400 via-blue-500 to-indigo-700';
            case 4: return 'from-slate-600 via-indigo-800 to-slate-950';
            case 5: return 'from-fuchsia-500 via-purple-600 to-pink-700';
            default: return 'from-slate-200 to-slate-500';
        }
    };

    const getLevelGlow = () => {
        if (level < 5) return 'shadow-[0_0_60px_rgba(168,162,158,0.5)] opacity-60';
        if (level < 10) return 'shadow-[0_0_70px_rgba(148,163,184,0.6)] opacity-70';
        if (level < 20) return 'shadow-[0_0_90px_rgba(251,191,36,0.7)] opacity-80';
        if (level < 40) return 'shadow-[0_0_120px_rgba(34,211,238,0.9)] opacity-90';
        return 'shadow-[0_0_180px_rgba(168,85,247,1)] opacity-100 animate-pulse';
    };

    // Only show items that actually exist in the current catalog and if not forced to hide accessories
    const equippedItems = Object.values(equippedAccessories)
        .map(id => ACCESSORIES.find(a => a.id === id))
        .filter((a): a is Accessory => !!a && !forceNoAccessories);

    const hasLegendary = equippedItems.some(i => i?.rarity === 'legendary' || i?.rarity === 'epic');

    const renderAccessoryItem = (item: Accessory, isBackLayer: boolean) => {
        if (!item) return null;

        const isSmall = size === 'sm' || size === 'md';
        let yPos = '50%';
        let sizeClass = isSmall ? 'text-[1.8em]' : 'text-[2.5em]';
        let rotate = 0;
        let z = isBackLayer ? 5 : 40;

        // 1. BASE DEFAULT POSITION (FINE-TUNED FOR PERFECT FIT)
        let left = '50%';
        if (item.type === 'hand') left = '88%';
        if (item.type === 'back') left = '88%';
        if (item.type === 'pet') left = '12%';

        switch (item.type) {
            case 'head':
                yPos = '12%';
                sizeClass = isSmall ? 'text-[0.4em]' : 'text-[1.4em]';
                break;
            case 'face':
            case 'glasses':
                yPos = '28%';
                sizeClass = isSmall ? 'text-[0.2em]' : 'text-[0.55em]';
                if (!isBackLayer) z = 50;
                break;
            case 'torso':
                const isSticker = item.id.includes('sticker') || item.id.includes('medal');
                const isJersey = item.id.includes('jersey') || item.id.includes('tshirt');

                if (isJersey) {
                    yPos = '42%';
                    if (!isBackLayer) z = 25;
                } else {
                    yPos = isSticker ? '38%' : '52%';
                    sizeClass = isSmall ? (isSticker ? 'text-[0.4em]' : 'text-[0.45em]') : (isSticker ? 'text-[0.95em]' : 'text-[1.2em]');
                    if (!isBackLayer) z = 45;
                }
                rotate = isSticker ? -2 : 0;
                break;
            case 'legs':
                yPos = '88%';
                sizeClass = isSmall ? 'text-[1.8em]' : 'text-[5.0em]';
                if (!isBackLayer) z = 20;
                break;
            case 'socks':
                yPos = '84%';
                sizeClass = isSmall ? 'text-[0.6em]' : 'text-[1.7em]';
                if (!isBackLayer) z = 15;
                break;
            case 'feet':
                yPos = '92%';
                sizeClass = isSmall ? 'text-[0.5em]' : 'text-[1.4em]';
                if (!isBackLayer) z = 10;
                break;
            case 'hand':
                yPos = '60%';
                sizeClass = isSmall ? 'text-[0.25em]' : 'text-[0.8em]';
                rotate = 15;
                break;
            case 'back':
                yPos = '30%';
                sizeClass = isSmall ? 'text-[0.25em]' : 'text-[0.8em]';
                rotate = -8;
                if (!isBackLayer) z = 5;
                break;
            case 'pet':
                yPos = '76%';
                sizeClass = isSmall ? 'text-[0.25em]' : 'text-[0.8em]';
                break;
            case 'effect':
                yPos = '50%';
                sizeClass = isSmall ? 'text-[1.0em] opacity-40 blur-[1px]' : 'text-[4.0em] opacity-30 blur-[4px]';
                z = 0;
                break;
            case 'watch':
                yPos = '66%';
                sizeClass = isSmall ? 'text-[0.25em]' : 'text-[0.75em]';
                if (left === '50%') {
                    const isRightHand = item.id.includes('elite') || item.id.includes('right') || item.id.includes('phantom') || item.id.includes('quantum') || item.icon.includes('/');
                    left = isRightHand ? '24%' : '76%';
                }
                if (!isBackLayer) z = 48;
                break;
            default:
                yPos = '50%';
                sizeClass = isSmall ? 'text-[0.5em]' : 'text-[0.8em]';
        }

        const preset = avatarData.offsets?.[item.type] || { x: 0, y: 0, scale: 1, rotate: 0 };
        const custom = (accessoryOffsetsOverride?.[item.id] ?? accessoryOffsets[item.id]) || { x: 0, y: 0, scale: 1, rotate: 0, neck: 22, shoulders: 0, sleeves: 0 };

        const isPopUp = item.id.includes('popup') || item.id.includes('spider_pop');
        const isSticker = item.type === 'torso' && (item.id.includes('sticker') || item.id.includes('medal') || isPopUp);
        const isJersey = item.id.includes('jersey') || item.id.includes('tshirt');
        const isShorts = item.type === 'legs';
        const isSocks = item.type === 'socks';
        const isCleats = item.type === 'feet';
        const isFace = item.type === 'face';
        const isHead = item.type === 'head';
        const isHand = item.type === 'hand';
        const isBack = item.type === 'back';
        const isPet = item.type === 'pet';
        const isWatch = item.type === 'watch';
        const isGlasses = item.type === 'glasses';

        const baseWidth = isJersey ? (isSmall ? '9em' : '16.5em') :
            isShorts ? (isSmall ? '4em' : '8em') :
                isSocks ? (isSmall ? '1.3em' : '2.6em') :
                    isCleats ? (isSmall ? '1.3em' : '2.6em') :
                        (isFace || isGlasses) ? (isSmall ? '1.2em' : '2.5em') :
                            isHead ? (isSmall ? '1.5em' : '3.5em') :
                                isHand ? (isSmall ? '1.0em' : '2.5em') :
                                    isBack ? (isSmall ? '2.0em' : '4.5em') :
                                        isPet ? (isSmall ? '1.5em' : '3.5em') :
                                            isWatch ? (isSmall ? '0.8em' : '1.6em') :
                                                isSticker ? (isSmall ? '1.2em' : '2.4em') : 'auto';

        const rotDeg = (custom as AccessoryOffsetValues).rotate ?? 0;
        const iconToUse = isBackLayer ? item.backIcon : item.icon;
        if (!iconToUse) return null;

        return (
            <motion.div
                key={`${item.id}-${isBackLayer ? 'back' : 'front'}`}
                initial={{ scale: 0, opacity: 0, rotate: (preset.rotate || 0) + rotDeg + rotate - 15, skewX: 0, skewY: 0 }}
                animate={{
                    scale: preset.scale * custom.scale,
                    opacity: 1,
                    rotate: (preset.rotate || 0) + rotDeg + rotate,
                    skewX: (custom as AccessoryOffsetValues).skewX || 0,
                    skewY: (custom as AccessoryOffsetValues).skewY || 0,
                    x: `calc(-50% + ${preset.x + custom.x}%)`,
                    y: `calc(-50% + ${preset.y + custom.y}%)`
                }}
                exit={{ scale: 0, opacity: 0 }}
                className={cn(
                    "absolute pointer-events-none select-none flex items-center justify-center",
                    !isBackLayer && isSticker && "bg-white rounded-full overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.15)] border-2 border-white/50 ring-1 ring-black/5",
                    !isBackLayer && isPopUp && "rounded-2xl border-b-[6px] border-r-[6px] border-slate-200/80 shadow-[0_15px_30px_rgba(0,0,0,0.25)] bg-gradient-to-br from-white to-slate-50 scale-110 z-50 animate-bounce-subtle",
                    !isBackLayer && isWatch && item.icon.includes('/') && "drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]"
                )}
                style={{
                    top: yPos,
                    left: left,
                    zIndex: z,
                    fontSize: '1em',
                    width: baseWidth,
                    height: baseWidth === 'auto' ? 'auto' : (isJersey ? (isSmall ? '11em' : '20em') : baseWidth),
                }}
            >
                <span className={cn("block transform-gpu w-full h-full flex items-center justify-center", !isSticker && !isJersey && !isShorts && !isSocks && !isCleats && !isFace && !isGlasses && !isHead && !isHand && !isBack && !isPet && !isWatch && sizeClass)}>
                    {iconToUse.startsWith('/') || iconToUse.startsWith('http') ? (
                        <img
                            src={iconToUse}
                            className={cn(
                                "object-contain",
                                isSticker ? "w-full h-full scale-110" : "w-full h-full",
                                isJersey && (isSmall ? "scale-[1.15] translate-y-[-4%]" :
                                    (item.id.includes('messi') ? "scale-[0.55] translate-y-[17%] -translate-x-[2%]" :
                                        ((item.id.includes('nova_official') || item.id.includes('nova_premium') || item.id.includes('retro') || item.id.includes('spiderman') || item.id.includes('diamond') || item.id.includes('black'))
                                            ? "scale-[1.28] translate-y-[-5%] brightness-[1.05]"
                                            : (item.id.includes('velocidad') ? "scale-[1.12] translate-y-[-1%] brightness-[1.05]" : (item.id.includes('nova') ? "scale-[1.15] translate-y-[-3%] brightness-110" : "scale-[1.12] translate-y-[-4%]"))))
                                ),
                                isShorts && "scale-90 translate-y-1",
                                isSocks && "scale-90 translate-y-2",
                                isCleats && "scale-90 translate-y-1",
                                (isFace || isHead) && "scale-100"
                            )}
                            style={{
                                ...(isJersey || isWatch ? {
                                    filter: item.id.includes('nova_gold')
                                        ? 'sepia(1) saturate(3) hue-rotate(10deg) brightness(0.9) contrast(1.2)'
                                        : (item.id.includes('nova_neon')
                                            ? 'hue-rotate(280deg) saturate(2) contrast(1.1) brightness(1.2)'
                                            : (item.id.includes('velocidad')
                                                ? 'url(#blackToAlpha)'
                                                : (item.id.includes('nova_premium') || item.id.includes('retro') || item.id.includes('spiderman') || item.id.includes('black')
                                                    ? 'url(#premiumJerseyFilter)'
                                                    : (iconToUse.toLowerCase().endsWith('.jpg') || iconToUse.toLowerCase().endsWith('.png') || item.id.includes('pro') || isWatch ? 'url(#blackToAlpha)' : 'url(#whiteToAlphaJersey)')))),
                                    clipPath: (isWatch && (item.id.includes('elite') || item.id.includes('phantom') || item.id.includes('quantum')))
                                        ? 'inset(20% 25% 20% 25% round 50%)'
                                        : (
                                            (custom.shoulders || custom.sleeves)
                                                ? `polygon(${0 + (custom.shoulders || 0)}% 0%, ${100 - (custom.shoulders || 0)}% 0%, ${100 - (custom.sleeves || 0)}% 35%, ${100 - (custom.sleeves || 0)}% 100%, ${0 + (custom.sleeves || 0)}% 100%, ${0 + (custom.sleeves || 0)}% 35%)`
                                                : (item.id.includes('messi') ? 'inset(2% 12% 0 12%)' : (item.id.includes('velocidad') ? 'polygon(10% 0%, 90% 0%, 100% 25%, 100% 100%, 0% 100%, 0% 25%)' : 'inset(14% 2% 0 2%)'))
                                        ),
                                    maskImage: (isJersey && !isBackLayer)
                                        ? `radial-gradient(ellipse at 50% -10%, transparent ${(custom.neck || 22) - 5}%, black ${custom.neck || 22}%, black 85%, transparent 100%)`
                                        : (isWatch || item.id.includes('nova')) ? 'radial-gradient(circle at center, black 65%, transparent 100%)' : 'none',
                                    WebkitMaskImage: (isJersey && !isBackLayer)
                                        ? `radial-gradient(ellipse at 50% -10%, transparent ${(custom.neck || 22) - 5}%, black ${custom.neck || 22}%, black 85%, transparent 100%)`
                                        : (isWatch || item.id.includes('nova')) ? 'radial-gradient(circle at center, black 65%, transparent 100%)' : 'none',
                                    objectFit: 'cover',
                                    objectPosition: 'top center',
                                } : (isShorts || isSocks || isCleats ? { filter: (iconToUse.toLowerCase().endsWith('.jpg') || item.id.includes('shorts')) ? 'url(#blackToAlpha)' : 'url(#whiteToAlpha)' } : {})),
                            }}
                        />
                    ) : (
                        item.icon
                    )}

                    {!isBackLayer && isWatch && item.icon.includes('/') && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none mix-blend-overlay z-[60]" />
                    )}
                    {!isBackLayer && isWatch && item.icon.includes('/') && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-[61] opacity-60" />
                    )}
                </span>
            </motion.div>
        );
    };

    return (
        <motion.div
            key={`${activeId}-${JSON.stringify(equippedAccessories)}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn("flex flex-col items-center", className)}
        >
            <div className={cn("relative flex items-center justify-center", sizeClasses[size])} style={{ fontSize: containerFontSize }}>
                {/* Filtro suave para el avatar (imagen de antes); filtro fuerte solo para camisetas */}
                <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                    <filter id="whiteToAlpha" colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values="
                        1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        -1.5 -1.5 -1.5 4.5 -0.1
                    " />
                        <feMorphology operator="erode" radius="0.5" />
                    </filter>
                    {/* Elite Jersey Filter: Kills BOTH white and light grey backgrounds while keeping colors punchy */}
                    <filter id="premiumJerseyFilter" colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values="
                        1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        -6 -6 -6 0 15
                    " />
                    </filter>
                    {/* Solo quitar fondo blanco de la camiseta; dejar colores de la prenda al 100% opacos */}
                    <filter id="whiteToAlphaJersey" colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values="
                        1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        -1.2 -1.2 -1.2 0 3.2
                    " />
                    </filter>
                    {/* Killer filter for BLACK backgrounds: Kills absolute black and dark grey artifacts */}
                    <filter id="blackToAlpha" colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values="
                        1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        12 12 12 0 -2
                    " />
                    </filter>
                    {/* Extra Clean: Combined approach for difficult JPG backgrounds */}
                    <filter id="extraCleanJersey" colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values="
                        1.1 0 0 0 0
                        0 1.1 0 0 0
                        0 0 1.1 0 0
                        -2 -2 -2 0 5.4
                    " />
                    </filter>
                </svg>

                <motion.div
                    className="relative w-full h-full flex items-center justify-center isolate"
                >
                    {/* MAGICAL AURA BACKGROUND - MASSIVE AND RADIANT */}
                    {showBackground && (
                        <div className={cn(
                            "absolute w-[120%] h-[120%] rounded-full blur-[50px] opacity-80 bg-gradient-to-br transition-all duration-1000",
                            getBiotopoStyle(),
                            getLevelGlow()
                        )}
                            style={{ zIndex: 0 }}
                        />
                    )}

                    {/* Guardian effect removed as per request */}

                    {/* CHARACTER LAYER - ULTIMATE BLENDING */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                        {/* BACK LAYER ACCESSORIES (Back of collars, back of watches) */}
                        <AnimatePresence>
                            {equippedItems.map(item => renderAccessoryItem(item, true))}
                        </AnimatePresence>

                        <div
                            className="relative w-full h-full flex items-center justify-center"
                            style={{
                                maskImage: 'radial-gradient(circle, black 60%, transparent 95%)',
                                WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 95%)',
                                zIndex: 10
                            }}
                        >
                            <img
                                src={avatarData.baseImage}
                                alt={avatarData.name}
                                className="w-full h-full object-cover"
                                style={{
                                    position: 'relative',
                                    zIndex: 10,
                                    filter: 'url(#whiteToAlpha) contrast(1.05) brightness(1.05)'
                                }}
                                draggable={false}
                            />
                        </div>

                        {/* FRONT LAYER ACCESSORIES */}
                        <AnimatePresence>
                            {equippedItems.map(item => renderAccessoryItem(item, false))}
                        </AnimatePresence>
                    </div>

                </motion.div>

                {/* YOU BADGE - Hidden for small HUD */}
                {isCurrentUser && size !== 'sm' && (
                    <div className={cn(
                        "absolute bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-lg shadow-xl border border-white/50 z-[70] flex items-center gap-1.5",
                        "bottom-[-5%] right-[-5%] text-[10px] px-3 py-1.5"
                    )}>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        TÚ
                    </div>
                )}
            </div>
            {showName && studentName && (
                <span className="mt-1 text-xs font-bold text-slate-700 truncate max-w-full text-center" title={studentName}>
                    {studentName}
                </span>
            )}
        </motion.div>
    );
};
