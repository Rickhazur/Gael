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

const getChromaWatchFilter = (id: string, baseFilterId: string) => {
    let suffix = 'saturate(1.2)';
    if (id.includes('red')) suffix = 'hue-rotate(330deg) saturate(1.5)';
    else if (id.includes('blue')) suffix = 'hue-rotate(210deg) saturate(1.2)';
    else if (id.includes('green')) suffix = 'hue-rotate(90deg) saturate(1.5)';
    else if (id.includes('yellow')) suffix = 'hue-rotate(30deg) saturate(1.8)';
    else if (id.includes('purple')) suffix = 'hue-rotate(250deg) saturate(1.5)';
    else if (id.includes('pink')) suffix = 'hue-rotate(290deg) saturate(1.2)';
    else if (id.includes('cyan')) suffix = 'hue-rotate(150deg) saturate(1.5)';
    else if (id.includes('silver')) suffix = 'grayscale(1) brightness(1.3) contrast(1.1)';
    else if (id.includes('gold')) suffix = 'sepia(1) saturate(3) hue-rotate(10deg) brightness(1.2)';
    return `url(#${baseFilterId}) ${suffix}`;
};

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
    const filterPrefix = React.useId().replace(/:/g, '');
    const whiteToAlphaId = `whiteToAlpha-${filterPrefix}`;
    const cleanJerseyId = `cleanJersey-${filterPrefix}`;
    const extraCleanJerseyId = `extraCleanJersey-${filterPrefix}`;
    const whiteToAlphaJerseyId = `whiteToAlphaJersey-${filterPrefix}`;
    const blackToAlphaId = `blackToAlpha-${filterPrefix}`;

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
    const containerFontSize = size === 'sm' ? '4px' : size === 'md' ? '6px' : size === 'lg' ? '12px' : '16px';

    const getBiotopoStyle = () => {
        switch (grade) {
            case 1: return 'from-teal-400 via-emerald-500 to-green-600';
            case 2: return 'from-amber-400 via-orange-500 to-red-600';
            case 3: return 'from-sky-400 via-blue-500 to-indigo-700';
            case 4: return 'from-slate-600 via-indigo-800 to-slate-950';
            case 5: return 'from-fuchsia-500 via-purple-600 to-pink-700';
            case 6: return 'from-blue-400 via-indigo-500 to-violet-600';
            case 7: return 'from-pink-400 via-rose-500 to-purple-700';
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

        const isTiny = size === 'sm';
        const isSmall = size === 'sm' || size === 'md';
        const isPopUp = item.id.includes('popup') || item.id.includes('spider_pop');
        const isSticker = item.type === 'sticker' || (item.type === 'torso' && (item.id.includes('sticker') || item.id.includes('medal') || isPopUp));
        const isJersey = (item.type === 'torso' && !isSticker && !item.id.includes('scarf') && !item.id.includes('necklace') && item.icon.includes('/')) || item.id.includes('jersey') || item.id.includes('tshirt');
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

        let yPos = '50%';
        let z = isBackLayer ? 5 : 40;
        let left = '50%';
        let totalRotate = 0;
        let sizeClass = isSmall ? 'text-[1.8em]' : 'text-[2.5em]';

        switch (item.type) {
            case 'head':
                yPos = '12%';
                sizeClass = isSmall ? 'text-[1.2em]' : 'text-[3.2em]';
                break;
            case 'face':
            case 'glasses':
                yPos = '25%';
                sizeClass = isSmall ? 'text-[1.0em]' : 'text-[2.8em]';
                if (!isBackLayer) z = 50;
                break;
            case 'torso':
                if (isJersey) {
                    yPos = isTiny ? '44%' : '42%';
                    if (!isBackLayer) z = 25;
                } else {
                    yPos = '52%';
                    sizeClass = isSmall ? 'text-[0.45em]' : 'text-[1.2em]';
                    if (!isBackLayer) z = 45; // Stickers on top of jersey
                }
                break;
            case 'sticker':
                yPos = '38%';
                sizeClass = isSmall ? 'text-[0.4em]' : 'text-[0.95em]';
                if (!isBackLayer) z = 45;
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
                yPos = '55%';
                left = '75%';
                sizeClass = isSmall ? 'text-[0.6em]' : 'text-[1.8em]';
                if (!isBackLayer) z = 45;
                break;
            case 'back':
                yPos = '88%'; // Adelante en el piso
                left = isBackLayer ? '50%' : '78%'; // Front layer: en el piso al lado derecho
                sizeClass = isSmall ? 'text-[0.6em]' : 'text-[1.5em]';
                if (isBackLayer) z = 5;
                else z = 50; // En frente de todo (avatar, ropa, etc.)
                break;
            case 'pet':
                yPos = '76%';
                left = '12%';
                sizeClass = isSmall ? 'text-[0.25em]' : 'text-[0.8em]';
                break;
            case 'watch':
                yPos = '52%';
                left = (item.id.includes('elite') || item.id.includes('right')) ? '24%' : '32%';
                totalRotate = -15;
                sizeClass = isSmall ? 'text-[0.5em]' : 'text-[1.4em]';
                if (!isBackLayer) z = 45;
                break;
            default:
                yPos = '50%';
                sizeClass = isSmall ? 'text-[0.5em]' : 'text-[0.8em]';
        }

        const preset = avatarData.offsets?.[item.type] || { x: 0, y: 0, scale: 1, rotate: 0 };
        const custom = (accessoryOffsetsOverride?.[item.id] ?? accessoryOffsets[item.id]) || { x: 0, y: 0, scale: 1, rotate: 0, neck: 22, shoulders: 0, sleeves: 0 };

        const baseWidth = isJersey ? (isTiny ? '10em' : isSmall ? '13em' : '22em') :
            isShorts ? (isSmall ? '8em' : '15em') :
                isSocks ? (isSmall ? '1.3em' : '2.6em') :
                    isCleats ? (isSmall ? '1.3em' : '2.6em') :
                        (isFace || isGlasses) ? (isSmall ? '1.2em' : '2.5em') :
                            isHead ? (isSmall ? '1.5em' : '3.5em') :
                                isHand ? (isSmall ? '1.0em' : '2.5em') :
                                    isBack ? (isSmall ? '3.5em' : '6em') :
                                        isPet ? (isSmall ? '1.5em' : '3.5em') :
                                            isWatch ? (isSmall ? '0.8em' : '1.6em') :
                                                isSticker ? (isSmall ? '1.2em' : '2.4em') : 'auto';

        const customRot = (custom as AccessoryOffsetValues).rotate ?? 0;

        // --- 🚀 AUTO-BACK COLLAR LOGIC ---
        const isAutoBackCollar = isBackLayer && isJersey && !item.backIcon;

        // Determine which icon to use and if we should render in this layer
        let iconToUse: string | null = null;

        if (isBackLayer) {
            // Back layer: collars, back of jerseys, etc.
            if (isAutoBackCollar) iconToUse = item.icon;
            else if (item.backIcon) iconToUse = item.backIcon;
            // Backpacks now render in FRONT layer only (peeking out from sides)
        } else {
            // Front layer: everything, including backpacks peeking out from the side
            iconToUse = item.icon;
        }

        if (!iconToUse) return null;

        return (
            <motion.div
                key={`${item.id}-${isBackLayer ? 'back' : 'front'}`}
                initial={{ scale: 0, opacity: 0, rotate: (preset.rotate || 0) + customRot + totalRotate - 15, skewX: 0, skewY: 0 }}
                animate={{
                    scale: preset.scale * custom.scale,
                    opacity: 1,
                    rotate: (preset.rotate || 0) + customRot + totalRotate,
                    skewX: (custom as AccessoryOffsetValues).skewX || 0,
                    skewY: (custom as AccessoryOffsetValues).skewY || 0,
                    x: `calc(-50% + ${preset.x + custom.x}%)`,
                    y: `calc(-50% + ${preset.y + custom.y}%)`
                }}
                exit={{ scale: 0, opacity: 0 }}
                className={cn(
                    "absolute pointer-events-none select-none flex items-center justify-center",
                    !isBackLayer && isSticker && !isBack && "bg-white rounded-full overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.15)] border-2 border-white/50 ring-1 ring-black/5",
                    !isBackLayer && isPopUp && !isBack && "rounded-2xl border-b-[6px] border-r-[6px] border-slate-200/80 shadow-[0_15px_30px_rgba(0,0,0,0.25)] bg-gradient-to-br from-white to-slate-50 scale-110 z-50 animate-bounce-subtle",
                    !isBackLayer && isWatch && item.icon.includes('/') && "drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]"
                )}
                style={{
                    top: yPos,
                    left: left,
                    zIndex: z,
                    fontSize: '1em',
                    width: baseWidth,
                    height: baseWidth === 'auto' ? 'auto' : (isJersey ? (isTiny ? '12em' : isSmall ? '15em' : '26em') : baseWidth),
                }}
            >
                <span className={cn(
                    "block transform-gpu w-full h-full flex items-center justify-center",
                    // Use sizeClass unless it's a specialty item that handles its own sizing strictly via baseWidth
                    (!isJersey && !isShorts && !isSocks && !isCleats) && sizeClass
                )}>
                    {iconToUse.startsWith('/') || iconToUse.startsWith('http') ? (
                        <img
                            src={iconToUse}
                            className={cn(
                                isJersey ? "w-full h-full object-cover" : "w-full h-full object-contain",
                                isSticker && "scale-110",
                                isJersey && (isTiny ? "scale-[1.3] translate-y-[-2%]" :
                                    isSmall ? "scale-[1.18] translate-y-[-1%]" :
                                        "scale-[1.28] translate-y-[-4.5%] brightness-[1.1] contrast-[1.05]"
                                ),
                                isShorts && "scale-90 translate-y-1 object-contain",
                                isSocks && "scale-90 translate-y-2 object-contain",
                                isCleats && "scale-90 translate-y-1 object-contain",
                                (isFace || isHead) && "scale-100 object-contain"
                            )}
                            style={{
                                ...((isJersey || isWatch || isFace || isHead || isHand || isBack || isPet || isGlasses || isSticker) ? {
                                    filter: (isJersey || isWatch) ? (
                                        isAutoBackCollar
                                            ? 'brightness(0.6) contrast(1.2) saturate(0.8)'
                                            : (isWatch && item.id.includes('nova_chroma')
                                                ? getChromaWatchFilter(item.id, extraCleanJerseyId)
                                                : (item.id.includes('nova_gold')
                                                    ? 'sepia(1) saturate(3) hue-rotate(10deg) brightness(0.9) contrast(1.2)'
                                                    : (item.id.includes('nova_neon')
                                                        ? 'hue-rotate(280deg) saturate(2) contrast(1.1) brightness(1.2)'
                                                        : `url(#${extraCleanJerseyId})`)))
                                    ) : undefined,
                                    mixBlendMode: isBack ? 'multiply' : undefined,
                                    clipPath: isBack ? 'none'
                                        : isJersey
                                            ? (isTiny
                                                ? `polygon(
                                                35% 8%, 
                                                10% 15%,
                                                0% 22%, 
                                                -5% 60%, 
                                                15% 72%, 
                                                22% 52%, 
                                                25% 90%, 
                                                50% 95%, 
                                                75% 90%, 
                                                78% 52%, 
                                                85% 72%, 
                                                105% 60%, 
                                                100% 22%, 
                                                90% 15%,
                                                65% 8%, 
                                                58% ${isBackLayer ? '4%' : '12%'}, 
                                                50% ${isBackLayer ? '8%' : '18%'}, 
                                                42% ${isBackLayer ? '4%' : '12%'}
                                            )`
                                                : `polygon(
                                                37% 5%, 
                                                15% 10%,
                                                ${5 - (custom.shoulders || 0)}% 18%, 
                                                ${-2 - (custom.shoulders || 0)}% ${58 + (custom.sleeves || 0)}%, 
                                                18% ${70 + (custom.sleeves || 0)}%, 
                                                25% 50%, 
                                                28% 88%, 
                                                50% 92%, 
                                                72% 88%, 
                                                75% 50%, 
                                                82% ${70 + (custom.sleeves || 0)}%, 
                                                ${102 + (custom.shoulders || 0)}% ${58 + (custom.sleeves || 0)}%, 
                                                ${95 + (custom.shoulders || 0)}% 18%, 
                                                85% 10%,
                                                63% 5%, 
                                                58% ${isBackLayer ? '2%' : Math.max(6, (custom.neck || 22) - 8)}%, 
                                                50% ${isBackLayer ? (custom.neck || 22) - 2 : (custom.neck || 22)}%, 
                                                42% ${isBackLayer ? '2%' : Math.max(6, (custom.neck || 22) - 8)}%
                                            )`
                                            )
                                            : (isWatch && (item.id.includes('elite') || item.id.includes('phantom') || item.id.includes('quantum') || item.id.includes('chroma')))
                                                ? 'inset(20% 25% 20% 25% round 50%)'
                                                : (item.id.includes('messi') ? 'inset(2% 12% 0 12%)' : (item.id.includes('velocidad') ? 'polygon(10% 0%, 90% 0%, 100% 25%, 100% 100%, 0% 100%, 0% 25%)' : 'inset(14% 2% 0 2%)')),
                                    maskImage: isAutoBackCollar
                                        ? `linear-gradient(to bottom, black 0%, black ${custom.neck || 15}%, transparent ${(custom.neck || 15) + 4}%)`
                                        : isBack ? 'none'
                                            : ((isJersey && !isBackLayer)
                                                ? (isTiny
                                                    ? `radial-gradient(ellipse at 50% 0%, transparent 8%, black 14%, black 95%, transparent 100%)`
                                                    : `radial-gradient(ellipse at 50% 0%, transparent ${(custom.neck || 15) - 3}%, black ${custom.neck || 15}%, black 95%, transparent 100%)`)
                                                : (isWatch || item.id.includes('nova')) ? 'radial-gradient(circle at center, black 65%, transparent 100%)' : 'none'),
                                    WebkitMaskImage: isAutoBackCollar
                                        ? `linear-gradient(to bottom, black 0%, black ${custom.neck || 15}%, transparent ${(custom.neck || 15) + 4}%)`
                                        : isBack ? 'none'
                                            : ((isJersey && !isBackLayer)
                                                ? (isTiny
                                                    ? `radial-gradient(ellipse at 50% 0%, transparent 8%, black 14%, black 95%, transparent 100%)`
                                                    : `radial-gradient(ellipse at 50% 0%, transparent ${(custom.neck || 15) - 3}%, black ${custom.neck || 15}%, black 95%, transparent 100%)`)
                                                : (isWatch || item.id.includes('nova')) ? 'radial-gradient(circle at center, black 65%, transparent 100%)' : 'none'),
                                    objectFit: (isJersey || isWatch) ? 'cover' : 'contain',
                                    objectPosition: 'top center',
                                } : (isShorts || isSocks || isCleats ? {
                                    filter: (iconToUse.toLowerCase().endsWith('.jpg') || item.id.includes('shorts')) ? `url(#${whiteToAlphaId})` : `url(#${whiteToAlphaJerseyId})`
                                } : {}))
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
                {/* HIDDEN SVG FILTERS PARA TODOS LOS ACCESORIOS DE ESTE COMPONENTE (ÚNICOS) */}
                <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
                    {/* Filtro general The Matrix para eliminar fondo blanco del Avatar */}
                    <filter id={whiteToAlphaId} colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values="
                        1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        -100 -100 -100 0 299
                    " />
                    </filter>
                    {/* White to Alpha: Removes white/light backgrounds from images */}
                    <filter id={cleanJerseyId} colorInterpolationFilters="sRGB">
                        <feComponentTransfer>
                            <feFuncA type="table" tableValues="0 0 0 1 1" />
                        </feComponentTransfer>
                    </filter>
                    {/* Solo quitar fondo blanco de la camiseta; dejar colores de la prenda al 100% opacos */}
                    <filter id={whiteToAlphaJerseyId} colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values="
                        1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        -6 -6 -6 0 16
                    " />
                    </filter>
                    {/* Killer filter for BLACK backgrounds: Kills absolute black and dark grey artifacts */}
                    <filter id={blackToAlphaId} colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values="
                        1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        12 12 12 0 -2
                    " />
                    </filter>
                    <filter id={extraCleanJerseyId} colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values="
                            1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            -4 -4 -4 0 11.5
                        " />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="25" intercept="-22" />
                        </feComponentTransfer>
                    </filter>
                </svg>

                <motion.div
                    className="relative w-full h-full flex items-center justify-center isolate"
                >
                    {/* MAGICAL AURA BACKGROUND - MASSIVE AND RADIANT */}
                    {showBackground && (
                        <div className={cn(
                            "absolute w-[130%] h-[130%] rounded-full blur-[60px] opacity-100 bg-gradient-to-br transition-all duration-1000",
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
                                // Removing the heavy linear-gradient mask so the avatar's arms and base torso are never cut out, fixing the 'floating neck' and missing arms issue!
                                maskImage: 'none',
                                WebkitMaskImage: 'none',
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
                                    filter: `url(#${whiteToAlphaId}) contrast(1.05) brightness(1.05)`
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
