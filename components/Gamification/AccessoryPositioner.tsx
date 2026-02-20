import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AVATARS, ACCESSORIES, Avatar, Accessory, AccessoryType } from './data/avatars';
import { AvatarDisplay } from './AvatarDisplay';
import { ChevronLeft, ChevronRight, RotateCw, ZoomIn, ZoomOut, Save, Download } from 'lucide-react';

interface AccessoryOffset {
    x: number;
    y: number;
    scale: number;
    rotate: number;
}

export const AccessoryPositioner: React.FC = () => {
    const [selectedAvatarId, setSelectedAvatarId] = useState(AVATARS[0].id);
    const [selectedAccessoryId, setSelectedAccessoryId] = useState<string | null>(null);
    const [offsets, setOffsets] = useState<Record<string, Partial<Record<AccessoryType, AccessoryOffset>>>>({});
    const [currentType, setCurrentType] = useState<AccessoryType>('face');

    const selectedAvatar = AVATARS.find(a => a.id === selectedAvatarId) || AVATARS[0];
    const selectedAccessory = selectedAccessoryId ? ACCESSORIES.find(a => a.id === selectedAccessoryId) : null;

    const getOffset = (avatarId: string, type: AccessoryType): AccessoryOffset => {
        return offsets[avatarId]?.[type] || { x: 0, y: 0, scale: 1, rotate: 0 };
    };

    const updateOffset = (field: keyof AccessoryOffset, value: number) => {
        if (!selectedAccessory) return;

        const avatarOffsets = offsets[selectedAvatarId] || {};
        const currentOffset = avatarOffsets[selectedAccessory.type] || { x: 0, y: 0, scale: 1, rotate: 0 };

        setOffsets({
            ...offsets,
            [selectedAvatarId]: {
                ...avatarOffsets,
                [selectedAccessory.type]: {
                    ...currentOffset,
                    [field]: value
                }
            }
        });
    };

    const exportOffsets = () => {
        const exportData = Object.entries(offsets).map(([avatarId, avatarOffsets]) => {
            return {
                avatarId,
                offsets: avatarOffsets
            };
        });

        const code = `// Generated offsets - Copy this to avatars.ts\n${exportData.map(({ avatarId, offsets: avatarOffsets }) => {
            const avatar = AVATARS.find(a => a.id === avatarId);
            return `// ${avatar?.name || avatarId}\noffsets: ${JSON.stringify(avatarOffsets, null, 4)}`;
        }).join(',\n\n')}`;

        console.log(code);
        navigator.clipboard.writeText(code);
        alert('Offsets copiados al portapapeles! Pégalos en avatars.ts');
    };

    const currentOffset = selectedAccessory ? getOffset(selectedAvatarId, selectedAccessory.type) : { x: 0, y: 0, scale: 1, rotate: 0 };

    const accessoriesByType = ACCESSORIES.filter(a => a.type === currentType);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-black text-white">
                            ✨ Posicionador de Accesorios
                        </h1>
                        <button
                            onClick={exportOffsets}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:scale-105 transition-transform"
                        >
                            <Download className="w-5 h-5" />
                            Exportar Offsets
                        </button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* LEFT: Avatar Preview */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-white/10">
                                <h2 className="text-xl font-bold text-white mb-4">Vista Previa</h2>
                                <div className="flex items-center justify-center h-96 bg-slate-950/50 rounded-xl">
                                    <AvatarDisplay
                                        avatarId={selectedAvatarId}
                                        size="xl"
                                        accessoriesOverride={selectedAccessory ? { [selectedAccessory.type]: selectedAccessory.id } : {}}
                                    />
                                </div>
                            </div>

                            {/* Avatar Selector */}
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4">Seleccionar Avatar</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {AVATARS.map(avatar => (
                                        <button
                                            key={avatar.id}
                                            onClick={() => setSelectedAvatarId(avatar.id)}
                                            className={`p-3 rounded-xl transition-all ${selectedAvatarId === avatar.id
                                                ? 'bg-purple-500 ring-4 ring-purple-300'
                                                : 'bg-slate-700/50 hover:bg-slate-600/50'
                                                }`}
                                        >
                                            <AvatarDisplay
                                                avatarId={avatar.id}
                                                size="sm"
                                                forceNoAccessories
                                                showBackground={false}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Controls */}
                        <div className="space-y-6">
                            {/* Type Selector */}
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4">Tipo de Accesorio</h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {(['head', 'face', 'torso', 'legs', 'feet'] as AccessoryType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setCurrentType(type)}
                                            className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${currentType === type
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Accessory Selector */}
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4">Seleccionar Accesorio</h3>
                                <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                                    {accessoriesByType.map(accessory => (
                                        <button
                                            key={accessory.id}
                                            onClick={() => setSelectedAccessoryId(accessory.id)}
                                            className={`p-3 rounded-xl transition-all ${selectedAccessoryId === accessory.id
                                                ? 'bg-purple-500 ring-4 ring-purple-300'
                                                : 'bg-slate-700/50 hover:bg-slate-600/50'
                                                }`}
                                        >
                                            <div className="text-3xl">
                                                {accessory.icon.startsWith('/') ? (
                                                    <img src={accessory.icon} className="w-full h-full object-contain" />
                                                ) : (
                                                    accessory.icon
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Position Controls */}
                            {selectedAccessory && (
                                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4">Ajustar Posición</h3>
                                    <div className="space-y-4">
                                        {/* X Position */}
                                        <div>
                                            <label className="text-sm font-bold text-slate-300 mb-2 flex items-center justify-between">
                                                <span>Posición X</span>
                                                <span className="text-purple-400">{currentOffset.x}%</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="-150"
                                                max="150"
                                                step="1"
                                                value={currentOffset.x}
                                                onChange={(e) => updateOffset('x', Number(e.target.value))}
                                                className="w-full"
                                            />
                                        </div>

                                        {/* Y Position */}
                                        <div>
                                            <label className="text-sm font-bold text-slate-300 mb-2 flex items-center justify-between">
                                                <span>Posición Y</span>
                                                <span className="text-purple-400">{currentOffset.y}%</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="-150"
                                                max="150"
                                                step="1"
                                                value={currentOffset.y}
                                                onChange={(e) => updateOffset('y', Number(e.target.value))}
                                                className="w-full"
                                            />
                                        </div>

                                        {/* Scale */}
                                        <div>
                                            <label className="text-sm font-bold text-slate-300 mb-2 flex items-center justify-between">
                                                <span>Escala</span>
                                                <span className="text-purple-400">{currentOffset.scale.toFixed(2)}x</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="2"
                                                step="0.05"
                                                value={currentOffset.scale}
                                                onChange={(e) => updateOffset('scale', Number(e.target.value))}
                                                className="w-full"
                                            />
                                        </div>

                                        {/* Rotation */}
                                        <div>
                                            <label className="text-sm font-bold text-slate-300 mb-2 flex items-center justify-between">
                                                <span>Rotación</span>
                                                <span className="text-purple-400">{currentOffset.rotate}°</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="-45"
                                                max="45"
                                                step="1"
                                                value={currentOffset.rotate}
                                                onChange={(e) => updateOffset('rotate', Number(e.target.value))}
                                                className="w-full"
                                            />
                                        </div>

                                        {/* Reset Button */}
                                        <button
                                            onClick={() => {
                                                if (!selectedAccessory) return;
                                                const avatarOffsets = offsets[selectedAvatarId] || {};
                                                setOffsets({
                                                    ...offsets,
                                                    [selectedAvatarId]: {
                                                        ...avatarOffsets,
                                                        [selectedAccessory.type]: { x: 0, y: 0, scale: 1, rotate: 0 }
                                                    }
                                                });
                                            }}
                                            className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-lg transition-colors"
                                        >
                                            Resetear
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
