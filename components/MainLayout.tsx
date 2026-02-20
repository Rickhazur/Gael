import { DemoTourButton } from './DemoTour/DemoTourButton';

import { DemoOverlay } from './DemoTour/DemoOverlay';

import { useDemoTour } from '@/context/DemoTourContext';

import { useEffect, lazy, Suspense } from 'react';

import React from 'react';

import { useLearning } from '@/context/LearningContext';

import { useGamification } from '@/context/GamificationContext';

import { ViewState } from '@/types';

import Sidebar from '@/components/Sidebar';

import AdminSidebar from '@/components/Admin/AdminSidebar';

import AdminDashboard from '@/components/Admin/AdminDashboard';

import GuardiansManagement from '@/components/Admin/GuardiansManagement';

import PaymentsManagement from '@/components/Admin/PaymentsManagement';

import TutorSessions from '@/components/Admin/TutorSessions';

import NovaStore from '@/components/Admin/NovaStore';

import { NovaCampus } from '@/components/Campus/NovaCampus';

import SmartTutorPrimary from '@/components/SmartTutorPrimary/PrimaryTutor';



// Retry logic for dynamic imports (fixes "Failed to fetch dynamically imported module" on mobile/slow networks)

const isMobile = () => typeof window !== 'undefined' && (window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

const lazyWithRetry = (importFn: () => Promise<{ default: React.ComponentType<any> }>) =>

    lazy(async () => {

        let lastErr: unknown;

        const mobile = isMobile();

        const maxAttempts = mobile ? 6 : 4;

        const delayMs = mobile ? 1200 : 800;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {

            try {

                return await importFn();

            } catch (e) {

                lastErr = e;

                if (attempt < maxAttempts - 1) await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));

            }

        }

        throw lastErr;

    });



// 🚀 LAZY LOADED COMPONENTS - Performance Optimization (MathTutor uses retry for mobile reliability)

const MathTutor = lazyWithRetry(() => import('@/pages/MathTutor'));

const ResearchCenter = lazyWithRetry(() => import('@/components/report-buddy-main1/src/pages/Index'));

const ArtsTutor = lazyWithRetry(() => import('@/components/Arts/ArtsTutor'));

const EnglishTutor_mod = lazyWithRetry(() => import('@/pages/EnglishTutor_mod'));

const SpanishTutor_mod = lazyWithRetry(() => import('@/pages/SpanishTutor_mod'));

const LanguageCenterHub = lazyWithRetry(() => import('@/components/LanguageCenter/LanguageCenterHub').then((m) => ({ default: m.LanguageCenterHub })));

const LabDev = lazyWithRetry(() => import('@/components/LabDev'));

const NotebookLibrary = lazyWithRetry(() => import('@/components/Notebook/NotebookLibrary').then((m) => ({ default: m.NotebookLibrary })));

const SparkChat = lazyWithRetry(() => import('@/components/Spark/SparkChat').then((m) => ({ default: m.SparkChat })));
const NovaBank = lazyWithRetry(() => import('@/components/LanguageCenter/NovaBank').then((m) => ({ default: m.NovaBank })));



import { PrizeStore } from '@/components/Store/PrizeStore';

import { X, ShoppingBag } from 'lucide-react';

import { MissionsLog } from '@/components/Missions/MissionsLog';

import { TaskControlCenter } from '@/components/Missions/TaskControlCenter';

import { AvatarSelector } from '@/components/Gamification/AvatarSelector';

import { AccessoryPositioner } from '@/components/Gamification/AccessoryPositioner';

import { useAvatar } from '@/context/AvatarContext';

import { ArenaLobby } from '@/components/Arena/ArenaLobby';

import { ParentDashboard } from '@/components/Parent/ParentDashboard';

import { GuardianGuard } from '@/components/GuardianGuard';

import ForcePasswordChangeModal from '@/components/ForcePasswordChangeModal';

import { Toaster } from "@/components/ui/toaster";

import { Toaster as Sonner } from "@/components/ui/sonner";

import { GoogleClassroomSync } from '@/components/GoogleClassroom/GoogleClassroomSync';

import { MoodleSync } from '@/components/GoogleClassroom/MoodleSync';

import { SubjectProgressDashboard } from '@/components/GoogleClassroom/SubjectProgressDashboard';

import { HallOfFame } from '@/components/Gamification/HallOfFame';

import Progress from '@/components/Progress';

import Flashcards from '@/components/Flashcards';

import { SubscriptionPage } from '@/components/Subscription/SubscriptionPage';

import { MetricsDashboard } from '@/components/Gamification/MetricsDashboard';

import { PetWidget } from '@/components/Pet/PetWidget';

import { PetPanel } from '@/components/Pet/PetPanel';

import { usePetContext } from '@/context/PetContext';

// Word Problems Components
import { WordProblemHub, SimpleWordProblemSolver } from '@/components/WordProblems';
import { WordProblemDemo } from '@/components/WordProblems';



// Loading Component for Lazy Imports

const ComponentLoader = () => (

    <div className="flex items-center justify-center h-screen bg-gray-50">

        <div className="text-center">

            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>

            <p className="text-slate-600 font-medium animate-pulse">Cargando módulo...</p>

        </div>

    </div>

);



interface MainLayoutProps {

    isAuthenticated: boolean;

    userRole: 'STUDENT' | 'ADMIN' | 'PARENT';

    defaultMode?: 'STUDENT' | 'ADMIN' | 'PARENT';

    currentView: ViewState;

    setCurrentView: (view: ViewState) => void;

    handleLogout: () => void;

    userName: string;

    userId: string;

    mustChangePassword: boolean;

    setMustChangePassword: (val: boolean) => void;

    gradeLevel: number;

    setGradeLevel: (grade: number) => void;

}



import { MobileBottomNav } from '@/components/Navigation/MobileBottomNav';



export const MainLayout: React.FC<MainLayoutProps> = ({

    isAuthenticated,

    userRole,

    currentView,

    setCurrentView,

    handleLogout,

    userName,

    userId,

    mustChangePassword,

    setMustChangePassword,

    gradeLevel,

    setGradeLevel

}) => {

    const { language, setLanguage, setImmersionMode } = useLearning();

    const { currentAvatar, isLoading, setAvatar } = useAvatar();



    // Piloto no bilingüe: forzar modo estándar en la misma sesión (sin recargar)

    useEffect(() => {

        if (userId === 'test-pilot-quinto') {

            setImmersionMode('standard');

        }

    }, [userId, setImmersionMode]);



    // Piloto Andrés: forzar avatar de 5° (Andrés Simple) para que no se muestre el conejo por defecto

    useEffect(() => {

        if (userId === 'test-pilot-quinto' && currentAvatar !== 'g5_boy_1') {

            setAvatar('g5_boy_1');

        }

    }, [userId, currentAvatar, setAvatar]);

    const { isPetPanelOpen, setIsPetPanelOpen, hasPet, setGradeLevel: setPetGradeLevel } = usePetContext();



    // Map bilingual to 'es' for components that don't support it yet

    const effectiveLanguage = language === 'bilingual' ? 'es' : language;



    // Sync grade level with Pet Context

    useEffect(() => {

        if (gradeLevel) {

            setPetGradeLevel(gradeLevel);

        }

    }, [gradeLevel, setPetGradeLevel]);



    // Demo Tour: Auto-navigate when step changes

    const { tourState, getCurrentStepData } = useDemoTour();



    useEffect(() => {

        if (tourState.isActive) {

            const currentStep = getCurrentStepData();

            if (currentStep && currentStep.view) {

                setCurrentView(currentStep.view);

            }

        }

    }, [tourState.currentStep, tourState.isActive]);



    // Prevent premature Avatar Selection while loading profile

    if (isAuthenticated && userRole === 'STUDENT') {

        // Only show loader if we don't have a cached avatar yet

        if (isLoading && !currentAvatar) {

            return (

                <div className="h-screen flex flex-col items-center justify-center bg-gray-50">

                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>

                    <p className="text-slate-500 font-medium animate-pulse">Cargando perfil de estudiante...</p>

                </div>

            );

        }



        // If we finished loading and still have no avatar, force selection

        // EXCEPTION: luna (Demo User) skips avatar selection

        if (!isLoading && !currentAvatar && userName !== 'luna') {

            return <AvatarSelector grade={gradeLevel} />;

        }

    }





    // ... (Inside MainLayout)



    // Determine if user is luna (Restricted Demo User)

    const isLuna = userName === 'luna';



    return (

        <div className={`flex min-h-screen bg-gray-50 overflow-hidden relative 

            ${isLuna ? 'grayscale-[0.05]' : ''}`}>



            {isAuthenticated && userRole === 'STUDENT' && (

                <GuardianGuard studentName={userName} />

            )}



            {isAuthenticated && mustChangePassword && (

                <div className="pointer-events-auto">

                    <ForcePasswordChangeModal

                        userId={userId}

                        onSuccess={() => setMustChangePassword(false)}

                        language={language}

                    />

                </div>

            )}



            {userRole === 'ADMIN' ? (

                <AdminSidebar

                    currentView={currentView}

                    onViewChange={setCurrentView}

                    onLogout={handleLogout}

                    userName={userName}

                />

            ) : (

                <Sidebar

                    currentView={currentView}

                    onViewChange={setCurrentView}

                    onLogout={handleLogout}

                    userName={userName}

                    userRole={userRole}

                    language={language}

                    setLanguage={setLanguage}

                />

            )}



            {/* Main Content Area */}

            <main className={`flex-1 relative overflow-y-auto overflow-x-hidden bg-gray-50 transition-all duration-300

                ${[ViewState.MATH_TUTOR, ViewState.RESEARCH_CENTER, ViewState.BUDDY_LEARN, ViewState.AI_CONSULTANT, ViewState.ARTS_TUTOR, ViewState.DASHBOARD, ViewState.SPARK_CHAT, ViewState.WORD_PROBLEMS, ViewState.WORD_PROBLEMS_DEMO, ViewState.LANGUAGE_CENTER, ViewState.SPANISH_TUTOR, ViewState.NOVA_BANK].includes(currentView)

                    ? 'p-0 h-screen pb-0' /* Immersive Modes: No padding */

                    : 'p-4 lg:p-8 pb-32 md:pb-8' /* Standard Modes: Has padding + bottom space for mobile nav */

                }

            `}>



                {/* Mobile Navigation (Only visible on small screens and non-immersive views) */}

                {!['ADMIN'].includes(userRole) && (

                    <div className={`${[ViewState.MATH_TUTOR, ViewState.RESEARCH_CENTER, ViewState.BUDDY_LEARN, ViewState.AI_CONSULTANT, ViewState.ARTS_TUTOR, ViewState.SPARK_CHAT, ViewState.WORD_PROBLEMS, ViewState.WORD_PROBLEMS_DEMO, ViewState.LANGUAGE_CENTER, ViewState.SPANISH_TUTOR, ViewState.NOVA_BANK].includes(currentView) ? 'hidden' : 'block'}`}>

                        <MobileBottomNav

                            currentView={currentView}

                            onNavigate={setCurrentView}

                            onLogout={handleLogout}

                            userRole={userRole}

                        />

                    </div>

                )}

                {![ViewState.MATH_TUTOR, ViewState.RESEARCH_CENTER, ViewState.BUDDY_LEARN, ViewState.AI_CONSULTANT, ViewState.ARTS_TUTOR, ViewState.SPARK_CHAT, ViewState.WORD_PROBLEMS, ViewState.WORD_PROBLEMS_DEMO, ViewState.LANGUAGE_CENTER, ViewState.SPANISH_TUTOR, ViewState.NOVA_BANK].includes(currentView) && (

                    <h1 className="text-2xl font-bold mb-4">Bienvenido, {userName}</h1>

                )}



                {/* Routing Logic */}

                {currentView === ViewState.DASHBOARD && (

                    userRole === 'ADMIN' ? <AdminDashboard /> :

                        userRole === 'PARENT' ? <ParentDashboard parentId={userId} language={effectiveLanguage} /> :

                            <NovaCampus

                                key="nova-city-final"

                                onNavigate={setCurrentView}

                                language={language}

                                userName={userName}

                                showFullCampus={getCurrentStepData()?.autoData?.showFullCampus}

                                onOpenPetPanel={() => setIsPetPanelOpen(true)}

                            />

                )}



                {currentView === ViewState.AI_CONSULTANT && <SmartTutorPrimary onNavigate={setCurrentView} gradeLevel={gradeLevel} setGradeLevel={setGradeLevel} />}

                {currentView === ViewState.MATH_TUTOR && (

                    <Suspense fallback={<ComponentLoader />}>

                        <MathTutor gradeLevel={gradeLevel} userName={userName} userId={userId} onNavigate={setCurrentView} />

                    </Suspense>

                )}

                {currentView === ViewState.RESEARCH_CENTER && (

                    <Suspense fallback={<ComponentLoader />}>

                        <ResearchCenter gradeLevel={gradeLevel} />

                    </Suspense>

                )}

                {currentView === ViewState.ARTS_TUTOR && (

                    <Suspense fallback={<ComponentLoader />}>

                        <ArtsTutor gradeLevel={gradeLevel} />

                    </Suspense>

                )}

                {currentView === ViewState.LANGUAGE_CENTER && (

                    <Suspense fallback={<ComponentLoader />}>

                        <LanguageCenterHub onNavigate={setCurrentView} language={effectiveLanguage} />

                    </Suspense>

                )}

                {currentView === ViewState.BUDDY_LEARN && (

                    <Suspense fallback={<ComponentLoader />}>

                        <EnglishTutor_mod onNavigate={setCurrentView} />

                    </Suspense>

                )}

                {currentView === ViewState.SPANISH_TUTOR && (

                    <Suspense fallback={<ComponentLoader />}>

                        <SpanishTutor_mod />

                    </Suspense>

                )}

                {currentView === ViewState.SPARK_CHAT && (

                    <Suspense fallback={<ComponentLoader />}>

                        <SparkChat />

                    </Suspense>

                )}

                {currentView === ViewState.NOVA_BANK && (
                    <Suspense fallback={<ComponentLoader />}>
                        <NovaBank />
                    </Suspense>
                )}

                {currentView === ViewState.LAB_DEV && (

                    <Suspense fallback={<ComponentLoader />}>

                        <LabDev onNavigate={setCurrentView} gradeLevel={gradeLevel} setGradeLevel={setGradeLevel} language={effectiveLanguage} setLanguage={setLanguage} />

                    </Suspense>

                )}

                {currentView === ViewState.WORD_PROBLEMS && (
                    <div className="w-full h-full">
                        <WordProblemHub />
                    </div>
                )}

                {currentView === ViewState.WORD_PROBLEMS_DEMO && (

                    <div className="w-full h-full">

                        <WordProblemDemo />

                    </div>

                )}

                {currentView === ViewState.REWARDS && (

                    <div className="fixed inset-0 z-[100] overflow-hidden bg-white">

                        <PrizeStore language={effectiveLanguage as any} />

                        <button

                            onClick={() => setCurrentView(ViewState.DASHBOARD)}

                            className="absolute top-6 right-6 z-[110] p-2 bg-slate-900/5 hover:bg-slate-900/10 rounded-full transition-colors"

                        >

                            <X className="w-8 h-8 text-slate-800" />

                        </button>

                    </div>

                )}

                {currentView === ViewState.CURRICULUM && <MissionsLog language={effectiveLanguage} gradeLevel={gradeLevel || 3} onNavigate={setCurrentView} />}

                {currentView === ViewState.ARENA && <ArenaLobby language={effectiveLanguage} grade={(gradeLevel || 3) as any} userId={userId} onNavigate={setCurrentView} />}

                {currentView === ViewState.PARENT_DASHBOARD && <ParentDashboard parentId={userId} language={effectiveLanguage} />}

                {currentView === ViewState.TASK_CONTROL && (

                    <TaskControlCenter

                        onNavigate={setCurrentView}

                        userId={userId}

                        language={language === 'bilingual' ? 'es' : language}

                        demoData={tourState.isActive && (tourState.currentStep === 3 || tourState.currentStep === 7) ? { showExampleMission: tourState.currentStep === 3, showResearchMission: tourState.currentStep === 7 } : null}

                    />

                )}

                {currentView === ViewState.GOOGLE_CLASSROOM && (

                    <div className="space-y-8">

                        <GoogleClassroomSync />

                        <SubjectProgressDashboard />

                    </div>

                )}

                {currentView === ViewState.MOODLE_SYNC && (

                    <MoodleSync language={language === 'bilingual' ? 'es' : language} />

                )}

                {currentView === ViewState.FLASHCARDS && (

                    <Flashcards

                        userId={userId}

                        userName={userName}

                        language={language === 'en' ? 'en' : 'es'}

                        demoData={tourState.isActive && tourState.currentStep === 6 ? getCurrentStepData()?.autoData : null}

                    />

                )}

                {currentView === ViewState.SUBSCRIPTION && <SubscriptionPage userName={userName} onClose={() => setCurrentView(ViewState.DASHBOARD)} />}

                {currentView === ViewState.NOTEBOOK_LIBRARY && (

                    <Suspense fallback={<ComponentLoader />}>

                        <NotebookLibrary

                            key={tourState.isActive ? `notebook-demo-${tourState.currentStep}` : 'notebook'}

                            language={effectiveLanguage}

                            demoData={tourState.isActive ? getCurrentStepData()?.autoData : null}

                        />

                    </Suspense>

                )}



                {currentView === ViewState.PROGRESS && (

                    userRole === 'STUDENT' ? (

                        <HallOfFame

                            userId={userId}

                            userName={userName}

                            language={language === 'bilingual' ? 'es' : language}

                            onNavigate={setCurrentView}

                            showAdoptSection={false}

                        />

                    ) : (

                        <Progress onNavigate={setCurrentView} onMenuConfigUpdate={() => { }} userRole={userRole} userId={userId} userName={userName} />

                    )

                )}



                {currentView === ViewState.METRICS && (

                    <MetricsDashboard userId={userId} language={effectiveLanguage as any} />

                )}



                {/* Admin Views */}

                {currentView === ViewState.GUARDIANS && <GuardiansManagement />}

                {currentView === ViewState.PAYMENTS && <PaymentsManagement />}

                {currentView === ViewState.STORE && <NovaStore />}

                {currentView === ViewState.T_SESSIONS && <TutorSessions />}

                {currentView === ViewState.ACCESSORY_POSITIONER && <AccessoryPositioner />}

            </main>

            <Toaster />

            <DemoOverlay />

            <DemoTourButton />



            {/* Virtual Pet Widget - Fixed Position (Hidden during Demo or in Math) */}

            {userRole === 'STUDENT' && !tourState.isActive && currentView !== ViewState.MATH_TUTOR && currentView !== ViewState.SPARK_CHAT && (

                <div className="fixed bottom-20 md:bottom-6 right-4 z-40">

                    <PetWidget onClick={() => setIsPetPanelOpen(true)} />

                </div>

            )}



            {/* Pet Panel Modal */}

            <PetPanel isOpen={isPetPanelOpen} onClose={() => setIsPetPanelOpen(false)} />

        </div>

    );

};

