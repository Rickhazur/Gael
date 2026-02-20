import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, ShoppingBag, Check, Lock, Fingerprint, ShieldCheck, LockKeyholeOpen } from "lucide-react";
import { useRewards } from "@/hooks/useRewards_mod";
import { useNovaSound } from "@/hooks/useNovaSound";
import { useAvatar } from "@/context/AvatarContext";
import { ACCESSORIES } from "@/components/Gamification/data/avatars";
import { toast } from "sonner";

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  category: 'avatar' | 'theme' | 'powerup' | 'badge' | 'accessory';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const storeItems: StoreItem[] = [
  // Avatars
  { id: 'avatar_astronaut', name: 'Astronaut', description: 'A space explorer', price: 50, emoji: '👨‍🚀', category: 'avatar', rarity: 'common' },
  { id: 'avatar_wizard', name: 'Wizard', description: 'Master of magic', price: 100, emoji: '🧙', category: 'avatar', rarity: 'rare' },
  { id: 'avatar_dragon', name: 'Dragon', description: 'Super rare golden dragon!', price: 300, emoji: '🐉', category: 'avatar', rarity: 'legendary' },
  { id: 'avatar_unicorn', name: 'Unicorn', description: 'Magical and special', price: 200, emoji: '🦄', category: 'avatar', rarity: 'epic' },

  // Themes
  { id: 'theme_space', name: 'Space Theme', description: 'Space background', price: 80, emoji: '🌌', category: 'theme', rarity: 'common' },
  { id: 'theme_ocean', name: 'Ocean Theme', description: 'Underwater background', price: 80, emoji: '🌊', category: 'theme', rarity: 'common' },
  { id: 'theme_rainbow', name: 'Rainbow Theme', description: 'All the colors!', price: 150, emoji: '🌈', category: 'theme', rarity: 'rare' },

  // Power-ups
  { id: 'powerup_hint', name: 'Hints Pack', description: '5 free hints', price: 30, emoji: '💡', category: 'powerup', rarity: 'common' },
  { id: 'powerup_timer', name: '+30 Seconds', description: 'More time in games', price: 40, emoji: '⏱️', category: 'powerup', rarity: 'common' },
  { id: 'powerup_double', name: 'Coins x2', description: 'Double coins for 1 game', price: 100, emoji: '✨', category: 'powerup', rarity: 'rare' },

  // Badges
  { id: 'badge_star', name: 'Star Badge', description: 'Shine on your profile', price: 120, emoji: '⭐', category: 'badge', rarity: 'rare' },
  { id: 'badge_crown', name: 'Royal Crown', description: 'Only for champions', price: 500, emoji: '👑', category: 'badge', rarity: 'legendary' },

  // --- Real Jerseys from Avatars.ts (Integrated) ---
  { id: 'acc_jersey_colombia_pro', name: '¡NUEVA! Colombia Pro #10', description: 'Edición Flat Pro - Ajuste Perfecto', price: 3000, emoji: '👕', category: 'accessory', rarity: 'legendary' },
  { id: 'acc_jersey_colombia_james', name: 'Colombia #7', description: 'James Rodriguez Edition', price: 1500, emoji: '👕', category: 'accessory', rarity: 'legendary' },
  { id: 'acc_jersey_bayern_lucho', name: 'Bayern - Lucho #7', description: 'Luis Díaz Edition', price: 2500, emoji: '👕', category: 'accessory', rarity: 'legendary' },
  { id: 'acc_shorts_bayern', name: 'Shorts Bayern', description: 'Red match gear', price: 1200, emoji: '🩳', category: 'accessory', rarity: 'rare' },
  { id: 'acc_jersey_argentina_messi', name: 'Argentina #10', description: 'Lionel Messi Edition', price: 1500, emoji: '👕', category: 'accessory', rarity: 'legendary' },
  { id: 'acc_jersey_madrid', name: 'Real Madrid #10', description: 'Mbappé Edition', price: 1200, emoji: '👕', category: 'accessory', rarity: 'epic' },
  { id: 'acc_jersey_barca', name: 'Barcelona #10', description: 'Lamine Yamal Edition', price: 1200, emoji: '👕', category: 'accessory', rarity: 'epic' },
  { id: 'acc_jersey_axolotl', name: 'Axolotl T-Shirt', description: 'Kawaii Pink Shirt', price: 400, emoji: '👕', category: 'accessory', rarity: 'rare' },
  { id: 'acc_jersey_space', name: 'Galaxy T-Shirt', description: 'Cosmic style', price: 500, emoji: '👕', category: 'accessory', rarity: 'rare' },
  { id: 'acc_cap_lightning', name: 'Flash Cap', description: 'Super fast hat', price: 250, emoji: '🧢', category: 'accessory', rarity: 'common' },
  { id: 'acc_glasses_cyber_neon', name: 'Cyber Visor', description: 'Neon glasses', price: 800, emoji: '🕶️', category: 'accessory', rarity: 'epic' },
];

const rarityColors: Record<string, string> = {
  common: 'border-muted bg-muted/30',
  rare: 'border-primary/50 bg-primary/10',
  epic: 'border-accent/50 bg-accent/10',
  legendary: 'border-warning/50 bg-warning/10',
};

const rarityLabels: Record<string, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

interface NovaStoreProps {
  onClose: () => void;
}

const NovaStore_mod = ({ onClose }: NovaStoreProps) => {
  const { balance, purchaseItem, refreshBalance } = useRewards();
  const { buyAccessory, ownedAccessories, equipAccessory } = useAvatar();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);

  // Entrance Animation States
  const [hasEntered, setHasEntered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { playStoreOpen, playClick } = useNovaSound(); // Audio Hook

  // Sync balance
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const categories = [
    { id: 'all', name: 'Todos', emoji: '🎁' },
    { id: 'accessory', name: 'Camisetas', emoji: '👕' },
    { id: 'avatar', name: 'Avatars', emoji: '👤' },
    { id: 'theme', name: 'Themes', emoji: '🎨' },
    { id: 'powerup', name: 'Power-ups', emoji: '⚡' },
    { id: 'badge', name: 'Badges', emoji: '🏅' },
  ];

  const filteredItems = selectedCategory === 'all'
    ? storeItems
    : storeItems.filter(item => item.category === selectedCategory);

  const handlePurchase = async (item: StoreItem) => {
    // Check global owned accessories or local store items
    const isAccessory = item.category === 'accessory';
    const alreadyOwned = isAccessory
      ? ownedAccessories.includes(item.id)
      : (JSON.parse(localStorage.getItem('nova_store_purchased_mod') || '[]')).includes(item.id);

    if (alreadyOwned) {
      toast.info('You already own this item!');
      return;
    }

    if (balance < item.price) {
      toast.error('Not enough coins!');
      return;
    }

    setPurchasingItem(item.id);

    if (isAccessory) {
      // Find the real accessory object from avatars.ts
      const realAcc = ACCESSORIES.find(a => a.id === item.id);
      if (realAcc) {
        // buyAccessory handles coins deduction inside its own secure logic
        await buyAccessory(realAcc);
        // Automatically equip it for fun!
        equipAccessory(realAcc);
        setPurchasingItem(null);
        return;
      }
    }

    const result = await purchaseItem(item.price, item.id);
    setPurchasingItem(null);

    if (result.success) {
      const saved = JSON.parse(localStorage.getItem('nova_store_purchased_mod') || '[]');
      const newPurchased = [...saved, item.id];
      localStorage.setItem('nova_store_purchased_mod', JSON.stringify(newPurchased));
      toast.success(`You bought ${item.name}! ${item.emoji}`);
    } else {
      toast.error(result.message || 'Purchase failed');
    }
  };

  useEffect(() => {
    // Auto-trigger entrance animation when store opens
    const timer = setTimeout(() => {
      handleEnter();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setIsScanning(true);
    // Step 1: Biometric Scan
    setTimeout(() => {
      playStoreOpen(); // Verification sound
      setIsAuthorized(true);
      // Step 2: Open Doors
      setTimeout(() => {
        setIsOpening(true);
        // Step 3: Enter Store
        setTimeout(() => setHasEntered(true), 1500);
      }, 800);
    }, 1500);
  };

  return (
    <motion.div
      className="bg-[#f8fbff] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col w-full h-full max-h-[85vh] max-w-[95vw] sm:max-w-4xl border-4 border-slate-900/10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <AnimatePresence mode="wait">
        {!hasEntered ? (
          <motion.div
            key="entrance-overlay"
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="absolute inset-0 z-[50] flex items-center justify-center bg-slate-950 perspective-[2000px] rounded-3xl overflow-hidden"
          >
            {/* 🌌 DEEP SPACE BACKGROUND */}
            <div className="absolute inset-0 overflow-hidden opacity-40">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)]" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
            </div>

            {/* 🚪 VAULT DOORS */}
            <div className="relative w-full h-full flex overflow-hidden">
              {/* Left Wing */}
              {/* Left Wing - CRYSTAL GLASS STYLE */}
              <motion.div
                initial={{ x: 0 }}
                animate={isOpening ? { x: '-100%', rotateY: -30, opacity: 0 } : {}}
                transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
                className="flex-1 bg-gradient-to-br from-white/10 to-cyan-900/40 backdrop-blur-xl border-r border-white/20 relative z-20 flex items-center justify-end overflow-hidden shadow-[inset_-10px_0_20px_rgba(255,255,255,0.1)]"
              >
                {/* Glass Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50" />
                <div className="absolute top-0 right-0 w-[1px] h-full bg-white/30 shadow-[0_0_15px_rgba(255,255,255,0.5)]" />

                {/* Door Detail - High Tech Lines */}
                <div className="relative mr-8 space-y-4 opacity-80">
                  <div className="h-1 w-24 bg-cyan-400/50 rounded-full shadow-[0_0_10px_cyan]" />
                  <div className="h-0.5 w-36 bg-cyan-400/30 rounded-full" />
                </div>
              </motion.div>

              {/* Right Wing */}
              {/* Right Wing - CRYSTAL GLASS STYLE */}
              <motion.div
                initial={{ x: 0 }}
                animate={isOpening ? { x: '100%', rotateY: 30, opacity: 0 } : {}}
                transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
                className="flex-1 bg-gradient-to-bl from-white/10 to-cyan-900/40 backdrop-blur-xl border-l border-white/20 relative z-20 flex items-center justify-start overflow-hidden shadow-[inset_10px_0_20px_rgba(255,255,255,0.1)]"
              >
                {/* Glass Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/5 to-transparent opacity-50" />
                <div className="absolute top-0 left-0 w-[1px] h-full bg-white/30 shadow-[0_0_15px_rgba(255,255,255,0.5)]" />

                {/* Door Detail - High Tech Lines */}
                <div className="relative ml-8 space-y-4 opacity-80">
                  <div className="h-1 w-24 bg-cyan-400/50 rounded-full shadow-[0_0_10px_cyan]" />
                  <div className="h-0.5 w-36 bg-cyan-400/30 rounded-full" />
                </div>
              </motion.div>
            </div>

            {/* 📟 HUD UI */}
            {!isOpening && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none">
                <div className="relative flex items-center justify-center">
                  {/* Rotating Rings */}
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-[300px] h-[300px] border border-cyan-500/20 rounded-full border-dashed" />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute w-[240px] h-[240px] border border-cyan-500/30 rounded-full border-t-cyan-500" />

                  {/* Panel */}
                  <div className="relative bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col items-center pointer-events-auto">
                    {!isScanning && !isAuthorized ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 border border-cyan-500/50">
                          <ShoppingBag className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-widest uppercase mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">TIENDA NOVA</h2>
                        <p className="text-cyan-400/60 text-[10px] tracking-[0.2em] uppercase mb-6 animate-pulse">AUTORIZANDO ACCESO...</p>
                      </motion.div>
                    ) : isScanning && !isAuthorized ? (
                      <motion.div className="flex flex-col items-center">
                        <Fingerprint className="w-16 h-16 text-cyan-400 animate-pulse mb-4" />
                        <p className="text-cyan-400 font-bold text-xs tracking-[0.3em] animate-pulse">ESCANEANDO...</p>
                      </motion.div>
                    ) : (
                      <motion.div className="flex flex-col items-center">
                        <ShieldCheck className="w-16 h-16 text-emerald-400 mb-4" />
                        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">ACCESO CONCEDIDO</h2>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="store-content" className="flex flex-col h-full overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 p-6 pb-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <motion.div
                className="flex items-center gap-2 px-4 py-2 gradient-secondary rounded-xl"
                key={balance}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                <Star className="w-5 h-5 text-secondary-foreground fill-current" />
                <span className="font-bold text-secondary-foreground">{balance}</span>
              </motion.div>
            </div>

            {/* Title */}
            <div className="text-center mb-4 px-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                🏪 Nova Store
              </h2>
              <p className="text-sm text-muted-foreground">
                Use your coins to get awesome items!
              </p>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 px-6 scrollbar-hide shrink-0">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id
                    ? 'gradient-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Items grid */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 w-full min-h-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item, index) => {
                    const isAccessory = item.category === 'accessory';
                    const isPurchased = isAccessory
                      ? ownedAccessories.includes(item.id)
                      : (JSON.parse(localStorage.getItem('nova_store_purchased_mod') || '[]')).includes(item.id);
                    const canAfford = balance >= item.price;
                    const isPurchasing = purchasingItem === item.id;

                    return (
                      <motion.div
                        key={item.id}
                        className={`p-4 rounded-xl border-2 ${rarityColors[item.rarity]} ${isPurchased ? 'opacity-60' : ''
                          }`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                      >
                        {/* Item content */}
                        <div className="text-center mb-3">
                          <motion.span
                            className="text-4xl block mb-2"
                            whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
                          >
                            {item.emoji}
                          </motion.span>
                          <h3 className="font-bold text-foreground text-sm">{item.name}</h3>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${item.rarity === 'legendary' ? 'bg-warning/20 text-warning' :
                            item.rarity === 'epic' ? 'bg-accent/20 text-accent' :
                              item.rarity === 'rare' ? 'bg-primary/20 text-primary' :
                                'bg-muted text-muted-foreground'
                            }`}>
                            {rarityLabels[item.rarity]}
                          </span>
                        </div>

                        {/* Purchase button */}
                        <Button
                          variant={isPurchased ? 'ghost' : canAfford ? 'default' : 'ghost'}
                          size="sm"
                          className="w-full"
                          onClick={() => handlePurchase(item)}
                          disabled={isPurchased || !canAfford || isPurchasing}
                        >
                          {isPurchasing ? (
                            <motion.div
                              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                          ) : isPurchased ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Owned
                            </>
                          ) : !canAfford ? (
                            <>
                              <Lock className="w-4 h-4 mr-1" />
                              {item.price}
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4 mr-1" />
                              {item.price}
                            </>
                          )}
                        </Button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer tip */}
            <div className="shrink-0 p-3 bg-muted/30 text-center m-6 mt-0 rounded-xl">
              <p className="text-xs text-muted-foreground">
                💡 Earn more coins by playing in the Games Center
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NovaStore_mod;
