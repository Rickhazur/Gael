
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AVATARS, ACCESSORIES, Avatar, Accessory } from '../components/Gamification/data/avatars';
type AvatarId = string;
import { useGamification } from './GamificationContext';
import { toast } from '@/hooks/use-toast';
import { supabase, buyAccessorySecure, saveAvatarSetup, subscribeToProfile } from '../services/supabase';

/** Multa en monedas si el niño cambia de avatar en la Tienda Nova. El avatar es permanente; cambiarlo es caro. */
export const AVATAR_CHANGE_PENALTY_COINS = 120;

interface AvatarContextType {
    userId: string | null;
    currentAvatar: AvatarId | null;
    studentName: string; // Nombre del niño (del perfil), acompaña al avatar siempre
    isLoading: boolean;
    ownedAccessories: string[]; // IDs
    deletedCatalogItems: string[]; // IDs of items removed from the store forever
    /** Accesorios equipados (Tienda Nova). Se persisten en localStorage y Supabase; el avatar los muestra en toda la app. */
    equippedAccessories: Record<string, string>; // type -> ID
    accessoryOffsets: Record<string, { x: number, y: number, scale: number, rotate?: number, skewX?: number, skewY?: number, neck?: number, shoulders?: number, sleeves?: number }>; // accessoryId -> offsets
    grade: number; // Student Grade Level
    setAvatar: (id: AvatarId) => void;
    buyAccessory: (item: Accessory) => void;
    equipAccessory: (item: Accessory) => void;
    unequipAccessory: (type: string) => void;
    updateAccessoryOffset: (accessoryId: string, x: number, y: number, scale: number, rotate?: number, skewX?: number, skewY?: number, neck?: number, shoulders?: number, sleeves?: number) => void;
    isOwned: (id: string) => boolean;
    deleteAccessory: (id: string) => void;
    hideFromCatalog: (id: string) => void;
    userRole: string | null;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const AvatarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { coins, spendCoins } = useGamification();
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [studentName, setStudentName] = useState<string>('');

    // Persist in localStorage
    const [currentAvatar, setCurrentAvatarState] = useState<AvatarId | null>(() => {
        return (localStorage.getItem('nova_avatar_id') as AvatarId) || null;
    });

    const [grade, setGrade] = useState<number>(() => {
        const saved = localStorage.getItem('nova_student_grade');
        return saved ? parseInt(saved) : 1;
    });

    const [ownedAccessories, setOwnedAccessories] = useState<string[]>(() => {
        const saved = localStorage.getItem('nova_avatar_inventory');
        return saved ? JSON.parse(saved) : [];
    });

    const [deletedCatalogItems, setDeletedCatalogItems] = useState<string[]>(() => {
        const saved = localStorage.getItem('nova_deleted_catalog_items');
        return saved ? JSON.parse(saved) : [];
    });

    // Accesorios equipados: lo que el usuario lleva puesto (Tienda Nova). Se muestra en AvatarDisplay en toda la app.
    const [equippedAccessories, setEquippedAccessories] = useState<Record<string, string>>(() => {
        const saved = localStorage.getItem('nova_avatar_equipped');
        return saved ? JSON.parse(saved) : {};
    });

    const [accessoryOffsets, setAccessoryOffsets] = useState<Record<string, { x: number, y: number, scale: number, rotate?: number, skewX?: number, skewY?: number, neck?: number, shoulders?: number, sleeves?: number }>>(() => {
        const saved = localStorage.getItem('nova_avatar_offsets');
        return saved ? JSON.parse(saved) : {};
    });

    // Sync with Supabase (Load & Subscribe)
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const initSession = async () => {
            if (!supabase) { setIsLoading(false); return; }

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                // 1. Initial Fetch with Safety Fallback
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('avatar, owned_accessories, equipped_accessories, grade_level, accessory_offsets, name, role')
                        .eq('id', user.id)
                        .single();

                    if (!error && data) {
                        if (data.avatar) setCurrentAvatarState(data.avatar as AvatarId);
                        const profileName = (data as any).name;
                        setStudentName(profileName || user.user_metadata?.name || user.email?.split('@')[0] || '');
                        if ((data as any).grade_level) {
                            setGrade((data as any).grade_level);
                            localStorage.setItem('nova_student_grade', (data as any).grade_level.toString());
                        }
                        if (data.owned_accessories) setOwnedAccessories(data.owned_accessories);
                        if (data.equipped_accessories) setEquippedAccessories(data.equipped_accessories);
                        if (data.accessory_offsets) setAccessoryOffsets(data.accessory_offsets as any);
                        if (data.role) setUserRole(data.role);

                        // 1b. Fetch Global Exclusions
                        try {
                            const { data: globalExData } = await supabase
                                .from('profiles')
                                .select('owned_accessories')
                                .eq('id', '00000000-0000-0000-0000-000000000000')
                                .maybeSingle();
                            if (globalExData?.owned_accessories) {
                                setDeletedCatalogItems(prev => {
                                    const combined = Array.from(new Set([...prev, ...(globalExData.owned_accessories as string[])]));
                                    return combined;
                                });
                            }
                        } catch (e) {
                            console.warn("Global exclusions fetch failed:", e);
                        }
                    } else if (error) {
                        // Fallback: Column might not exist yet
                        const { data: fallbackData } = await supabase
                            .from('profiles')
                            .select('avatar, owned_accessories, equipped_accessories, grade_level, name')
                            .eq('id', user.id)
                            .single();

                        if (fallbackData) {
                            if (fallbackData.avatar) setCurrentAvatarState(fallbackData.avatar as AvatarId);
                            const profileName = (fallbackData as any).name;
                            setStudentName(profileName || user.user_metadata?.name || user.email?.split('@')[0] || '');
                            if (fallbackData.owned_accessories) setOwnedAccessories(fallbackData.owned_accessories);
                            if (fallbackData.equipped_accessories) setEquippedAccessories(fallbackData.equipped_accessories);
                            if ((fallbackData as any).grade_level) {
                                setGrade((fallbackData as any).grade_level);
                                localStorage.setItem('nova_student_grade', (fallbackData as any).grade_level.toString());
                            }
                            if ((fallbackData as any).role) setUserRole((fallbackData as any).role);
                        }
                    }
                } catch (e) {
                    console.error("Profile load error:", e);
                }
                setIsLoading(false);

                // 2. Real-time Subscription
                unsubscribe = subscribeToProfile(user.id, (payload) => {
                    console.log("Avatar/Profile Update:", payload);
                    const newData = payload.new || payload;
                    if (newData) {
                        if (newData.avatar) setCurrentAvatarState(newData.avatar as AvatarId);
                        if (newData.name) setStudentName(newData.name);
                        if (newData.grade_level) {
                            setGrade(newData.grade_level);
                            localStorage.setItem('nova_student_grade', newData.grade_level.toString());
                        }
                        if (newData.owned_accessories) setOwnedAccessories(newData.owned_accessories);
                        if (newData.equipped_accessories) setEquippedAccessories(newData.equipped_accessories);
                        if (newData.accessory_offsets) setAccessoryOffsets(newData.accessory_offsets as any);
                        if (newData.role) setUserRole(newData.role);
                    }
                });
            } else {
                // No Supabase user (e.g. test pilot): sync grade and name from localStorage
                const savedGrade = localStorage.getItem('nova_student_grade');
                if (savedGrade) {
                    const g = parseInt(savedGrade, 10);
                    if (g >= 1 && g <= 5) setGrade(g);
                }
                const savedName = localStorage.getItem('nova_user_name');
                if (savedName) setStudentName(savedName);

                // Manual check for test pilot mode
                const isAndres = savedName === 'Andrés (Test Pilot)' || localStorage.getItem('nova_avatar_id') === 'g5_boy_1';
                if (isAndres) setUserId('test-pilot-quinto');

                setIsLoading(false);
            }
        };

        initSession();

        // Re-sincronizar cuando cambie la sesión (login/logout) para evitar nombre demo en cuenta real
        let authSub: any;
        if (supabase) {
            const { data } = supabase.auth.onAuthStateChange((_event, session) => {
                if (session?.user) initSession();
                else if (!session) setStudentName('');
            });
            authSub = data.subscription;
        }

        return () => {
            if (unsubscribe) unsubscribe();
            authSub?.unsubscribe?.();
        };
    }, []);

    // Demo tour - Shop: simular compra de gafas y equipar en el avatar con offset perfecto para g5_girl_1
    useEffect(() => {
        const DEMO_GLASSES_ID = 'acc_glasses_cyber_visor_frame'; // Gafas con imagen real (glass_simple.png)
        const DEMO_GLASSES_OFFSET = { x: 0, y: -12, scale: 1.1, rotate: 0 }; // Baja las gafas (y negativo = abajo) para cuadrar sobre los ojos
        const onDemoShopGlasses = () => {
            setOwnedAccessories((prev) => {
                if (prev.includes(DEMO_GLASSES_ID)) return prev;
                const next = [...prev, DEMO_GLASSES_ID];
                localStorage.setItem('nova_avatar_inventory', JSON.stringify(next));
                return next;
            });
            setEquippedAccessories((prev) => {
                const next = { ...prev, face: DEMO_GLASSES_ID };
                localStorage.setItem('nova_avatar_equipped', JSON.stringify(next));
                window.dispatchEvent(new CustomEvent('nova_avatar_equipped_updated'));
                return next;
            });
            setAccessoryOffsets((prev) => {
                const next = { ...prev, [DEMO_GLASSES_ID]: DEMO_GLASSES_OFFSET };
                localStorage.setItem('nova_avatar_offsets', JSON.stringify(next));
                window.dispatchEvent(new CustomEvent('nova_avatar_offsets_updated'));
                return next;
            });
        };
        window.addEventListener('nova-demo-shop-glasses', onDemoShopGlasses as EventListener);
        return () => window.removeEventListener('nova-demo-shop-glasses', onDemoShopGlasses as EventListener);
    }, []);

    // Demo tour: usar avatar de quinto grado (niña) cuando inicia el demo. Sin gafas al inicio para que se vea el cambio.
    useEffect(() => {
        const onDemoAvatarSet = (e: CustomEvent<{ avatarId: string; grade?: number }>) => {
            const id = e.detail?.avatarId;
            if (id) {
                setCurrentAvatarState(id);
                localStorage.setItem('nova_avatar_id', id);
            }
            if (e.detail?.grade != null) {
                setGrade(e.detail.grade);
                localStorage.setItem('nova_student_grade', String(e.detail.grade));
            }
            // Quitar gafas al inicio del demo para que la audiencia vea el cambio cuando compre en la tienda
            setEquippedAccessories((prev) => {
                const next = { ...prev };
                delete next.face;
                localStorage.setItem('nova_avatar_equipped', JSON.stringify(next));
                window.dispatchEvent(new CustomEvent('nova_avatar_equipped_updated'));
                return next;
            });
        };
        window.addEventListener('nova-demo-avatar-set', onDemoAvatarSet as EventListener);
        return () => window.removeEventListener('nova-demo-avatar-set', onDemoAvatarSet as EventListener);
    }, []);

    // Demo termina: quitar gafas y offset para que al reiniciar el demo, luna empiece sin gafas
    useEffect(() => {
        const onDemoEnd = () => {
            setEquippedAccessories((prev) => {
                const next = { ...prev };
                delete next.face;
                localStorage.setItem('nova_avatar_equipped', JSON.stringify(next));
                window.dispatchEvent(new CustomEvent('nova_avatar_equipped_updated'));
                return next;
            });
            setAccessoryOffsets((prev) => {
                const next = { ...prev };
                delete next['acc_glasses_cyber_visor_frame'];
                localStorage.setItem('nova_avatar_offsets', JSON.stringify(next));
                window.dispatchEvent(new CustomEvent('nova_avatar_offsets_updated'));
                return next;
            });
        };
        window.addEventListener('nova-demo-end', onDemoEnd as EventListener);
        return () => window.removeEventListener('nova-demo-end', onDemoEnd as EventListener);
    }, []);

    // Cuando App quita la camiseta del piloto (u otro cambio externo a equipped), re-sincronizar desde localStorage
    useEffect(() => {
        const onEquippedUpdated = () => {
            const saved = localStorage.getItem('nova_avatar_equipped');
            if (saved) {
                try {
                    setEquippedAccessories(JSON.parse(saved));
                } catch (_) { }
            }
        };
        window.addEventListener('nova_avatar_equipped_updated', onEquippedUpdated);
        return () => window.removeEventListener('nova_avatar_equipped_updated', onEquippedUpdated);
    }, []);

    // Re-sincronizar offsets desde localStorage cuando se guardan (ej. Probador Virtual) para que perfil/sidebar actualicen
    useEffect(() => {
        const onOffsetsUpdated = () => {
            const saved = localStorage.getItem('nova_avatar_offsets');
            if (saved) {
                try {
                    setAccessoryOffsets(JSON.parse(saved));
                } catch (_) { }
            }
        };
        window.addEventListener('nova_avatar_offsets_updated', onOffsetsUpdated);
        return () => window.removeEventListener('nova_avatar_offsets_updated', onOffsetsUpdated);
    }, []);

    // Helper to save everything insecurely via RPC (Reliable)
    const saveStateToCloud = async (newAvatar: string, newEquipped: any, newOffsets?: any) => {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Updated to also save offsets if provided
            await supabase.from('profiles').update({
                avatar: newAvatar,
                equipped_accessories: newEquipped,
                accessory_offsets: newOffsets || accessoryOffsets
            }).eq('id', user.id);
        }
    };

    // Sync state when pilot mode changes (triggered by App.tsx)
    useEffect(() => {
        const onSync = () => {
            const savedAvatar = localStorage.getItem('nova_avatar_id');
            const savedAcc = localStorage.getItem('nova_avatar_equipped');
            const savedOffsets = localStorage.getItem('nova_avatar_offsets') || localStorage.getItem('nova_accessory_offsets');
            const savedName = localStorage.getItem('nova_user_name');
            const savedGrade = localStorage.getItem('nova_student_grade');

            if (savedAvatar) setCurrentAvatarState(savedAvatar as AvatarId);
            if (savedAcc) setEquippedAccessories(JSON.parse(savedAcc));
            if (savedOffsets) setAccessoryOffsets(JSON.parse(savedOffsets));
            if (savedName) setStudentName(savedName);
            if (savedGrade) setGrade(parseInt(savedGrade, 10));
        };
        window.addEventListener('nova_avatar_sync', onSync);
        return () => window.removeEventListener('nova_avatar_sync', onSync);
    }, []);

    const setAvatar = (id: AvatarId) => {
        const isChange = currentAvatar !== null && currentAvatar !== id;
        if (isChange) {
            const ok = spendCoins(AVATAR_CHANGE_PENALTY_COINS, 'Multa por cambio de avatar', false);
            if (!ok) {
                toast({
                    title: 'Cambio de avatar',
                    description: `Tu avatar es permanente. Solo puedes cambiarlo en la Tienda Nova y cuesta ${AVATAR_CHANGE_PENALTY_COINS} monedas. No tienes suficientes. ¡Sigue aprendiendo!`,
                    variant: 'destructive',
                });
                return;
            }
            toast({
                title: 'Avatar cambiado',
                description: `Se descontaron ${AVATAR_CHANGE_PENALTY_COINS} monedas en la Tienda Nova. Tu nuevo avatar te acompañará desde ahora.`,
            });
        }
        setCurrentAvatarState(id);
        localStorage.setItem('nova_avatar_id', id);
        saveStateToCloud(id, equippedAccessories);
    };

    const buyAccessory = async (item: Accessory) => {
        if (ownedAccessories.includes(item.id)) return;

        // Use Secure RPC Transaction
        if (supabase) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const result = await buyAccessorySecure(user.id, item.id, item.cost);

                if (result && result.success) {
                    spendCoins(item.cost, item.name, false);
                    setOwnedAccessories(prev => {
                        const newer = [...prev, item.id];
                        localStorage.setItem('nova_avatar_inventory', JSON.stringify(newer));
                        return newer;
                    });
                    toast({ title: "¡Compra Exitosa!", description: `Has comprado ${item.name}`, duration: 3000 });
                } else {
                    console.warn("RPC Failed, trying Direct Update Fallback...", result?.message);
                    try {
                        const { data: econ } = await supabase.from('economy').select('coins').eq('user_id', user.id).single();
                        if (!econ || econ.coins < item.cost) {
                            toast({ title: "Fondos Insuficientes", description: "No tienes suficientes monedas.", variant: "destructive" });
                            return;
                        }
                        spendCoins(item.cost, item.name, false);
                        setOwnedAccessories(prev => {
                            const newer = [...prev, item.id];
                            localStorage.setItem('nova_avatar_inventory', JSON.stringify(newer));
                            return newer;
                        });
                        toast({ title: "¡Compra Exitosa!", description: `Has comprado ${item.name} (Modo Directo)`, duration: 3000 });
                    } catch (fallbackError: any) {
                        console.error("Critical Buy Error:", fallbackError);
                        toast({ title: "Error en la compra", description: "No se pudo procesar la compra. Intenta recargar.", variant: "destructive" });
                    }
                }
            }
            // Offline Fallback
            if (spendCoins(item.cost, item.name, false)) { // Local only
                setOwnedAccessories(prev => {
                    const newer = [...prev, item.id];
                    localStorage.setItem('nova_avatar_inventory', JSON.stringify(newer));
                    return newer;
                });
                toast({ title: "Modo Offline", description: "Compra guardada localmente.", duration: 3000 });
            }
        }
    };

    /** Al equipar un accesorio (Tienda Nova) se guarda en estado, localStorage y Supabase; el avatar lo mostrará en toda la app. */
    const equipAccessory = (item: Accessory) => {
        // We remove the check ownedAccessories.includes(item.id) because it causes race conditions
        // during purchase. The shop already handles item existence.

        const newEquipped = { ...equippedAccessories, [item.type]: item.id };
        setEquippedAccessories(newEquipped);
        localStorage.setItem('nova_avatar_equipped', JSON.stringify(newEquipped));

        if (currentAvatar) {
            saveStateToCloud(currentAvatar, newEquipped);
        }
    };

    const unequipAccessory = (type: string) => {
        const newEquipped = { ...equippedAccessories };
        delete newEquipped[type];
        setEquippedAccessories(newEquipped);
        localStorage.setItem('nova_avatar_equipped', JSON.stringify(newEquipped));

        if (currentAvatar) {
            saveStateToCloud(currentAvatar, newEquipped);
        }
    };

    const updateAccessoryOffset = (accessoryId: string, x: number, y: number, scale: number, rotate: number = 0, skewX: number = 0, skewY: number = 0, neck: number = 22, shoulders: number = 0, sleeves: number = 0) => {
        const newOffsets = { ...accessoryOffsets, [accessoryId]: { x, y, scale, rotate, skewX, skewY, neck, shoulders, sleeves } };
        setAccessoryOffsets(newOffsets);
        localStorage.setItem('nova_avatar_offsets', JSON.stringify(newOffsets));
        window.dispatchEvent(new CustomEvent('nova_avatar_offsets_updated'));

        if (currentAvatar) {
            saveStateToCloud(currentAvatar, equippedAccessories, newOffsets);
        }
    };

    const isOwned = (id: string) => ownedAccessories.includes(id);

    const deleteAccessory = async (id: string) => {
        const item = ACCESSORIES.find(a => a.id === id);
        const itemName = item ? item.name : id;

        // confirmation for the kid
        const ok = window.confirm(`¿Estás seguro de que quieres eliminar "${itemName}" de tu baúl? Esta acción no se puede deshacer y no se devolverán las monedas.`);
        if (!ok) return;

        // 1. Update Inventory State
        const newerInventory = ownedAccessories.filter(accId => accId !== id);
        setOwnedAccessories(newerInventory);
        localStorage.setItem('nova_avatar_inventory', JSON.stringify(newerInventory));

        // 2. If equipped, unequip
        const typeToRemove = Object.entries(equippedAccessories).find(([_, equippedId]) => equippedId === id)?.[0];
        if (typeToRemove) {
            const newEquipped = { ...equippedAccessories };
            delete newEquipped[typeToRemove];
            setEquippedAccessories(newEquipped);
            localStorage.setItem('nova_avatar_equipped', JSON.stringify(newEquipped));

            if (currentAvatar) {
                saveStateToCloud(currentAvatar, newEquipped);
            }
        }

        // 3. Update Supabase
        if (supabase) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({
                    owned_accessories: newerInventory
                }).eq('id', user.id);
            }
        }

        toast({
            title: "Item eliminado",
            description: `${itemName} ha sido eliminado de tu colección.`,
        });
    };

    const hideFromCatalog = async (id: string) => {
        // Confirmation for global delete if admin
        let isGlobal = false;
        if (userRole === 'ADMIN') {
            isGlobal = window.confirm(`¿Quieres eliminar "${id}" de la tienda para TODOS los estudiantes de manera definitiva?`);
        }

        setDeletedCatalogItems(prev => {
            const next = [...prev, id];
            localStorage.setItem('nova_deleted_catalog_items', JSON.stringify(next));
            return next;
        });

        if (isGlobal && supabase) {
            try {
                // Fetch current global list
                const { data: globalRow } = await supabase
                    .from('profiles')
                    .select('owned_accessories')
                    .eq('id', '00000000-0000-0000-0000-000000000000')
                    .maybeSingle();

                const currentExclusions = (globalRow?.owned_accessories as string[]) || [];
                if (!currentExclusions.includes(id)) {
                    await supabase.from('profiles').upsert({
                        id: '00000000-0000-0000-0000-000000000000',
                        owned_accessories: [...currentExclusions, id],
                        name: 'GLOBAL_CATALOG_CONFIG'
                    }, { onConflict: 'id' });
                }
            } catch (e) {
                console.error("Global exclusion failed:", e);
            }
        }

        toast({
            title: isGlobal ? "Eliminado Globalmente" : "Artículo removido",
            description: isGlobal
                ? "Este accesorio ha sido removido de la Tienda Nova para todos los usuarios."
                : "Este accesorio ha sido removido de tu vista de la Tienda Nova.",
        });
    };

    return (
        <AvatarContext.Provider value={{
            userId,
            currentAvatar,
            studentName,
            isLoading,
            ownedAccessories,
            deletedCatalogItems,
            equippedAccessories,
            accessoryOffsets,
            grade,
            setAvatar,
            buyAccessory,
            equipAccessory,
            unequipAccessory,
            updateAccessoryOffset,
            isOwned,
            deleteAccessory,
            hideFromCatalog,
            userRole
        }}>
            {children}
        </AvatarContext.Provider>
    );
};

export const useAvatar = () => {
    const context = useContext(AvatarContext);
    if (context === undefined) {
        throw new Error('useAvatar must be used within an AvatarProvider');
    }
    return context;
};
