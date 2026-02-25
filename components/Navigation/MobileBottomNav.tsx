
import React, { useState } from 'react';
import { HeartHandshake, Rocket, Swords, UserCheck, Menu, X, LogOut, Brain, Search, Globe, ShoppingBag, Zap, Layers, Clapperboard, Palette, CircleHelp } from 'lucide-react';
import { ViewState } from '@/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface MobileNavProps {
    currentView: ViewState;
    onNavigate: (view: ViewState) => void;
    onLogout: () => void;
    userRole: string;
}

export const MobileBottomNav: React.FC<MobileNavProps> = ({ currentView, onNavigate, onLogout, userRole }) => {
    const [isOpen, setIsOpen] = useState(false);

    const mainItems = [
        { id: ViewState.DASHBOARD, icon: HeartHandshake, label: 'Base' },
        { id: ViewState.TASK_CONTROL, icon: Rocket, label: 'Misiones' },
        { id: ViewState.ARENA, icon: Swords, label: 'Arena' },
        { id: ViewState.PROGRESS, icon: UserCheck, label: 'Perfil' },
    ];

    const menuItems = [
        { id: ViewState.WORD_PROBLEMS, icon: Brain, label: 'Mate' },
        { id: ViewState.SPARK_CHAT, icon: Clapperboard, label: 'Chispa' },
        { id: ViewState.RESEARCH_CENTER, icon: Search, label: 'Research' },
        { id: ViewState.BUDDY_LEARN, icon: Globe, label: 'Idiomas' },
        { id: ViewState.ARTS_TUTOR, icon: Palette, label: 'Arte' },
        { id: ViewState.REWARDS, icon: ShoppingBag, label: 'Tienda' },
        { id: ViewState.NOTEBOOK_LIBRARY, icon: Layers, label: 'Cuadernos' },

    ];

    return (
        <>
            {/* Floating Navigation Bar */}
            <div className="md:hidden fixed bottom-6 left-4 right-4 h-16 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 flex items-center justify-between px-2">
                {mainItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${isActive
                                ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 -translate-y-4 border-4 border-slate-900'
                                : 'text-slate-400 hover:text-white active:scale-95'
                                }`}
                        >
                            <item.icon className={`w-6 h-6 ${isActive ? 'animate-bounce-subtle' : ''}`} />
                        </button>
                    );
                })}

                {/* More Menu Trigger */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <button className="flex flex-col items-center justify-center w-14 h-14 rounded-full text-slate-400 hover:text-white active:scale-95 transition-all">
                            <Menu className="w-6 h-6" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-[2rem] border-slate-700 bg-slate-900/95 backdrop-blur-xl p-6 pb-24 text-white">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">Menú Rápido</h3>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400">
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onNavigate(item.id);
                                        setIsOpen(false);
                                    }}
                                    className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-cyan-500/50 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-cyan-400">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-300">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 border-t border-slate-700 pt-6">
                            <Button
                                variant="destructive"
                                className="w-full h-12 rounded-xl"
                                onClick={onLogout}
                            >
                                <LogOut className="w-5 h-5 mr-2" />
                                Cerrar Sesión
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
};
