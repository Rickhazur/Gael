import React, { useState, useEffect, Suspense } from 'react';
import { supabase, isOffline, loginWithSupabase, logoutSupabase } from './services/supabase';
import { ViewState, UserLevel, Language } from './types';
import ResetPasswordPage from './components/ResetPasswordPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Contexts
import { LearningProvider } from '@/context/LearningContext';
import { GamificationProvider } from '@/context/GamificationContext';
import { AchievementProvider } from '@/context/AchievementContext';
import { AvatarProvider } from '@/context/AvatarContext';
import { DemoTourProvider } from '@/context/DemoTourContext';
import { PetProvider } from '@/context/PetContext';

// Components - eagerly loaded (small / always visible)
import SplashScreen from './components/SplashScreen';

// Components - lazy loaded (only needed after specific navigation)
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
const MainLayout = React.lazy(() => import('./components/MainLayout').then(m => ({ default: m.MainLayout })));
const ICFESLayout = React.lazy(() => import('./components/icfes/ICFESLayout').then(m => ({ default: m.ICFESLayout })));
const ICFESDashboard = React.lazy(() => import('./components/icfes/ICFESDashboard').then(m => ({ default: m.ICFESDashboard })));
const ExamSimulator = React.lazy(() => import('./components/icfes/ExamSimulator').then(m => ({ default: m.ExamSimulator })));
const IngestQuestions = React.lazy(() => import('./components/icfes/admin/IngestQuestions').then(m => ({ default: m.IngestQuestions })));
const ICFESResults = React.lazy(() => import('./components/icfes/ICFESResults').then(m => ({ default: m.ICFESResults })));
const GoogleClassroomSync = React.lazy(() => import('./components/GoogleClassroom/GoogleClassroomSync').then(m => ({ default: m.GoogleClassroomSync })));
const AvatarSelection = React.lazy(() => import('./components/Gamification/AvatarSelection').then(m => ({ default: m.AvatarSelection })));

const queryClient = new QueryClient();

const App: React.FC = () => {  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTourOpen, setTourOpen] = useState(false);
  const [isTestingCenterOpen, setTestingCenterOpen] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [isMockSession, setIsMockSession] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<'STUDENT' | 'ADMIN' | 'PARENT'>('STUDENT');
  const [userLevel, setUserLevel] = useState<UserLevel>('primary');
  const [gradeLevel, setGradeLevel] = useState<number>(3);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Login Form State
  const [loginMode, setLoginMode] = useState<'STUDENT' | 'ADMIN' | 'PARENT'>('STUDENT');
  const [showLogin, setShowLogin] = useState(false);

  // View State
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [appMode, setAppMode] = useState<'ELEMENTARY' | 'ICFES'>('ELEMENTARY');
  /** Primer ingreso del niño: no tiene avatar elegido; mostrar pantalla de selección. */
  const [showAvatarOnboarding, setShowAvatarOnboarding] = useState(false);
  const [icfesView, setIcfesView] = useState<'DASHBOARD' | 'SIMULATION' | 'INGEST' | 'RESULTS' | 'STUDY'>('DASHBOARD');
  const [simulationResults, setSimulationResults] = useState<any>(null);

  // Check for Google Classroom Callback URL
  useEffect(() => {
    if (window.location.pathname.includes('/api/google/callback')) {
      setCurrentView(ViewState.GOOGLE_CLASSROOM);
    }
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam && Object.values(ViewState).includes(viewParam as ViewState)) {
      setCurrentView(viewParam as ViewState);
      setShowLogin(true);
    }

    // Detect password recovery from URL hash (Supabase appends #type=recovery&access_token=...)
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      console.log('🔑 Password recovery detected from URL hash');
      setShowPasswordReset(true);
    }
  }, []);

  // Initialize Web Vitals & Error Logging & Audio Preload (Mobile Glitch Fix)
  useEffect(() => {
    import('./utils/webVitals').then(({ initWebVitals }) => initWebVitals());
    import('./utils/errorLogger').then(() => console.log('✅ Error logging initialized'));

    // Preload critical demo audio on mobile to prevent glitches
    if (typeof window !== 'undefined' && (window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
      const audio = new Audio('/audio/tour/nova_s0_account.mp3');
      audio.preload = 'auto';
      audio.load();

      // Also preload the second step which is heavy
      const audio2 = new Audio('/audio/tour/nova_s1_welcome.mp3');
      audio2.preload = 'auto';
      audio2.load();
    }
  }, []);

  // Check Session on Mount
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const handleSession = async (session: any) => {
      if (!session?.user) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const user = session.user;
      let role: string = user.user_metadata?.role || 'STUDENT';
      const userEmail = user.email?.toLowerCase().trim();

      // 🔑 ADMIN BYPASS: Identify admin by email BEFORE any DB queries
      const isAdminUser = userEmail === 'rickhazur@gmail.com';
      if (isAdminUser) {
        role = 'ADMIN';
      }

      try {
        if (!supabase) {
          // Offline mode: still allow admin by email
          if (isAdminUser) {
            setIsAuthenticated(true);
            setUserId(user.id);
            setUserName(user.user_metadata?.name || 'Admin');
            setUserRole('ADMIN');
            setCurrentView(ViewState.DASHBOARD);
          }
          setIsLoading(false);
          return;
        }

        // Fetch profile - handle errors gracefully
        let profile: any = null;
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role, name, grade_level, avatar, account_status')
            .eq('id', user.id)
            .maybeSingle();

          if (error) {
            console.warn('Profile fetch warning:', error.message);
            // For admin, continue even if profile fetch fails (RLS might block)
          } else {
            profile = data;
          }
        } catch (profileErr) {
          console.warn('Profile fetch exception:', profileErr);
          // Continue for admin even if profile fetch completely fails
        }

        if (profile?.role) {
          role = profile.role;
          if (profile.name) setUserName(profile.name);
        }

        // Re-assert admin role after profile fetch (in case profile had different role)
        if (isAdminUser) {
          role = 'ADMIN';
        }

        // 🔑 If user is in password recovery mode, skip status checks and don't auto-login
        if (showPasswordReset) {
          console.log('🔑 Password recovery mode active — skipping session handling');
          setIsLoading(false);
          return;
        }

        if (!(window as any).isRegisteringInProgress) {
          // 🛡️ SECURITY CHECK: Si la cuenta está pendiente o rechazada, cerrar sesión.
          // Admin ALWAYS bypasses this check.
          if (role !== 'ADMIN') {
            const effectiveStatus = profile?.account_status || 'pending';
            if (effectiveStatus === 'pending' || effectiveStatus === 'rejected') {
              console.warn(`Access denied for user ${user.id}: status is ${effectiveStatus}`);
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setIsLoading(false);
              return;
            }
          }
        } else {
          // Estamos registrando, no auto-loguear al usuario para evitar raza de condiciones.
          return;
        }

        // Limpiar datos demo para que no aparezcan en cuenta real (ej. luna)
        if (session?.user?.id === 'demo-local-luna' || localStorage.getItem('nova_user_name') === 'luna') {
          localStorage.removeItem('nova_gamification');
        }
        localStorage.removeItem('nova_demo_mode');

        const displayName = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || '';
        if (displayName) localStorage.setItem('nova_user_name', displayName);

        // Si llegamos aquí, la cuenta es válida
        setIsAuthenticated(true);
        setUserId(user.id);
        setUserName(displayName);

        if (role === 'STUDENT' && profile?.grade_level) setGradeLevel(profile.grade_level);

        // Niño sin avatar (primer ingreso): mostrar pantalla para elegir avatar
        if (role === 'STUDENT' && !(profile as any)?.avatar) setShowAvatarOnboarding(true);
        else setShowAvatarOnboarding(false);

        setUserRole(role as 'STUDENT' | 'ADMIN' | 'PARENT');
      } catch (error) {
        console.error("Error in handleSession:", error);
        // 🔑 Si es admin y hay error, aún permitir acceso
        if (isAdminUser) {
          setIsAuthenticated(true);
          setUserId(user.id);
          setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Admin');
          setUserRole('ADMIN');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Race between getSession and timeout
    let getSessionResolved = false;
    const getSessionPromise = supabase.auth.getSession().then(result => {
      console.log('✅ Supabase session resolved');
      getSessionResolved = true;
      return result;
    });

    const sessionTimeout = new Promise<{ data: { session: null } }>((resolve) =>
      setTimeout(() => {
        if (!getSessionResolved) {
          console.warn('⚠️ Supabase session timeout (5s)');
          resolve({ data: { session: null } });
        }
      }, 5000)
    );

    Promise.race([getSessionPromise, sessionTimeout]).then(({ data }) => {
      if (!data.session && !getSessionResolved) {
        console.error('🛑 Critical: Session check stuck. Force resetting auth state.');
        supabase?.auth.signOut().catch(() => { });
      }
      handleSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event);

      // 🔑 Intercept PASSWORD_RECOVERY event to show password change UI
      if (event === 'PASSWORD_RECOVERY') {
        console.log('🔑 PASSWORD_RECOVERY event received — showing reset page');
        setShowPasswordReset(true);
        setIsLoading(false);
        return; // Don't process as normal session
      }

      handleSession(session);
    });

    // Safety timeout: si la carga tarda más de 2.5s, salimos del splash SÍ O SÍ
    // Usamos un flag para no re-ejecutar si ya salimos
    const safetyTimer = setTimeout(() => {
      console.log('🛡️ Safety timeout triggered - Forcing splash exit');
      setIsLoading(false);
    }, 2500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []); // Solo al montar

  // Login Handler
  const handleLogin = async (data: any, mode: 'STUDENT' | 'ADMIN' | 'PARENT') => {
    const email = (data?.email ?? '').toString().trim().toLowerCase();
    const password = (data?.password ?? '').toString().trim();

    try {
      // 🚀 DEMO MODE BYPASS: luna
      if (mode === 'STUDENT' && (data.email === 'sofia.demo@novaschola.com' || data.email === 'luna.demo@novaschola.com')) {
        setIsAuthenticated(true);
        setUserId('demo-local-luna');
        setUserName('luna');
        setUserRole('STUDENT');
        setGradeLevel(5); // Luna es de quinto grado
        localStorage.setItem('nova_user_name', 'luna');
        localStorage.setItem('nova_student_grade', '5');
        // Asignar 99,999 coins a luna demo
        localStorage.setItem('nova_gamification', JSON.stringify({ coins: 99999, xp: 0, level: 5 }));
        window.dispatchEvent(new CustomEvent('nova_gamification_updated'));
        window.dispatchEvent(new CustomEvent('nova_avatar_sync'));
        setCurrentView(ViewState.DASHBOARD);
        return;
      }

      // 🚀 TEST MODE BYPASS: SuperQuinto Test Pilot (presentación grado quinto)
      if (mode === 'STUDENT' && data.email === 'piloto.quinto@novaschola.com') {
        setIsAuthenticated(true);
        setUserId('test-pilot-quinto');
        setUserName('Andrés (Test Pilot)');
        setUserRole('STUDENT');
        setGradeLevel(5);
        localStorage.setItem('nova_user_name', 'Andrés (Test Pilot)');
        localStorage.setItem('nova_student_grade', '5');
        localStorage.setItem('nova_immersion_mode', 'standard'); // Piloto no bilingüe: interfaz en español, enseñanza en ambos idiomas

        // Avatar de Andrés (5°): g5_boy_1 "Andrés (Simple)"
        localStorage.setItem('nova_avatar_id', 'g5_boy_1');

        // Initial gamification state for the test (many coins so Andrés can buy in Tienda Nova)
        const testGamification = {
          coins: 99999, // For GamificationContext
          novaCoins: 99999, // For useGamification hook
          xp: 1200,
          level: 5
        };
        localStorage.setItem('nova_gamification', JSON.stringify(testGamification));
        localStorage.setItem('nova_math_gamification', JSON.stringify(testGamification));
        window.dispatchEvent(new CustomEvent('nova_gamification_updated'));
        window.dispatchEvent(new CustomEvent('nova_math_gamification_updated'));
        window.dispatchEvent(new CustomEvent('nova_avatar_sync'));

        setCurrentView(ViewState.DASHBOARD);
        return;
      }

      // 🚀 TEST MODE BYPASS: Pilot Test for Grade 6 (Presentation for Grade 6)
      if (mode === 'STUDENT' && (email === 'piloto.sexto@novaschola.com' || email === 'piloto.sexto@novashola.com')) {
        setIsAuthenticated(true);
        setUserId('test-pilot-sexto');
        setUserName('Diego (Test Pilot)');
        setUserRole('STUDENT');
        setGradeLevel(6);
        localStorage.setItem('nova_user_name', 'Diego (Test Pilot)');
        localStorage.setItem('nova_student_grade', '6');
        localStorage.setItem('nova_immersion_mode', 'standard');

        // For Grade 6 pilot, we want them to pick their avatar
        setShowAvatarOnboarding(true);

        const testGamification = {
          coins: 99999,
          novaCoins: 99999,
          xp: 2500,
          level: 6
        };
        localStorage.setItem('nova_gamification', JSON.stringify(testGamification));
        localStorage.setItem('nova_math_gamification', JSON.stringify(testGamification));
        window.dispatchEvent(new CustomEvent('nova_gamification_updated'));
        window.dispatchEvent(new CustomEvent('nova_math_gamification_updated'));
        window.dispatchEvent(new CustomEvent('nova_avatar_sync'));

        setCurrentView(ViewState.DASHBOARD);
        return;
      }

      // 🚀 TEST MODE BYPASS: Padre de Andrés (panel de padres sin Supabase)
      // Acepta en pestaña Padres o si pone correo/contraseña de padre en cualquier pestaña
      // Contraseña correcta: padre2024; también aceptamos 2024 por si la escriben corta
      if (
        (mode === 'PARENT' || email === 'padre.andres@novaschola.com') &&
        email === 'padre.andres@novaschola.com' &&
        (password === 'padre2024' || password === '2024')
      ) {
        setIsAuthenticated(true);
        setUserId('test-pilot-parent');
        setUserName('Padre de Andrés');
        setUserRole('PARENT');
        setCurrentView(ViewState.PARENT_DASHBOARD);
        return;
      }

      // 🚀 Modo sin Supabase: acceso demo para desarrollo/pruebas locales
      if (isOffline && mode === 'STUDENT') {
        const demoStudents: [string, string][] = [
          ['linatrendy72@gmail.com', 'lunalinda'],
          ['estudiante@demo.local', 'demo'],
        ];
        const isDemo = demoStudents.some(([e, p]) => email === e && password === p);
        if (isDemo) {
          setIsAuthenticated(true);
          setUserId('demo-local-luna');
          setUserName(email === 'linatrendy72@gmail.com' ? 'Luna' : 'Estudiante Demo');
          setUserRole('STUDENT');
          setGradeLevel(5);
          localStorage.setItem('nova_user_name', email === 'linatrendy72@gmail.com' ? 'Luna' : 'Estudiante Demo');
          localStorage.setItem('nova_student_grade', '5');
          const testGamification = { coins: 99999, xp: 1200, level: 5 };
          localStorage.setItem('nova_gamification', JSON.stringify(testGamification));
          window.dispatchEvent(new CustomEvent('nova_gamification_updated'));
          window.dispatchEvent(new CustomEvent('nova_avatar_sync'));
          setCurrentView(ViewState.DASHBOARD);
          return;
        }
      }

      const userData = await loginWithSupabase(data.email, data.password, mode);
      if (userData) {
        setIsAuthenticated(true);
        setUserId(userData.uid);
        setUserName(userData.name);
        // Rol desde perfil (BD), no desde la pestaña del login, para que admin siempre vea panel admin
        const role = (userData.role as 'STUDENT' | 'ADMIN' | 'PARENT') || mode;
        setUserRole(role);
        setUserLevel(userData.level as UserLevel || 'primary');
        if (role === 'STUDENT') setGradeLevel(userData.gradeLevel || 3);
        setMustChangePassword(userData.mustChangePassword || false);

        if (role === 'PARENT') setCurrentView(ViewState.PARENT_DASHBOARD);
        else setCurrentView(ViewState.DASHBOARD);
      }
    } catch (error: any) {
      alert(error.message || 'Login fallido. Verifica tus credenciales.');
    }
  };

  // Logout Handler: siempre actualizar la UI primero para que "Cerrar sesión" responda aunque Supabase falle o se cuelgue
  const handleLogout = async () => {
    setIsAuthenticated(false);
    setUserId('');
    setUserName('');
    setUserRole('STUDENT');
    setCurrentView(ViewState.DASHBOARD);

    // Purgar exhaustivamente la memoria del navegador para evitar logins pasados atascados
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('nova_') || key.startsWith('sb-'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();

    try {
      await Promise.race([
        logoutSupabase(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]);
    } catch (_) {
      // Ignorar timeouts
    }

    // Forzar una recarga completa limpia (Hard Reload) para destruir los contextos y estados persistentes
    window.location.href = '/';
  };

  const isGoogleCallbackURL = window.location.pathname.includes('/api/google/callback') ||
    window.location.search.includes('code=') ||
    window.location.hash.includes('access_token=');

  return (
    <QueryClientProvider client={queryClient}>
      <DemoTourProvider userName={userName}>
        <GamificationProvider>
          <AchievementProvider>
            <AvatarProvider>
              <PetProvider>
                <LearningProvider>
                  <TooltipProvider>
                    <Suspense fallback={<SplashScreen />}>
                      {isGoogleCallbackURL ? (
                        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                          <div className="w-full h-full flex items-center justify-center">
                            <GoogleClassroomSync />
                          </div>
                        </div>
                      ) : showPasswordReset ? (
                        <ResetPasswordPage
                          onSuccess={() => {
                            setShowPasswordReset(false);
                            setIsAuthenticated(false);
                            window.history.replaceState(null, '', window.location.pathname);
                            supabase?.auth.signOut().catch(() => { });
                            window.location.href = '/';
                          }}
                          onCancel={() => {
                            setShowPasswordReset(false);
                            setIsAuthenticated(false);
                            window.history.replaceState(null, '', window.location.pathname);
                            supabase?.auth.signOut().catch(() => { });
                            window.location.href = '/';
                          }}
                        />
                      ) : (
                        <>
                          {isLoading ? (
                            <SplashScreen />
                          ) : !isAuthenticated && !showLogin ? (
                            <LandingPage
                              onLogin={(mode) => {
                                setShowLogin(true);
                                setLoginMode(mode);
                              }}
                            />
                          ) : !isAuthenticated && showLogin ? (
                            <LoginPage
                              onLogin={handleLogin}
                              onBack={() => setShowLogin(false)}
                              defaultMode={loginMode}
                            />
                          ) : appMode === 'ICFES' ? (
                            <ICFESLayout
                              onExit={() => {
                                setAppMode('ELEMENTARY');
                                setCurrentView(ViewState.DASHBOARD);
                              }}
                              currentView={icfesView}
                              onNavigate={(v: any) => setIcfesView(v)}
                            >
                              {icfesView === 'DASHBOARD' && (
                                <ICFESDashboard
                                  onStartSim={() => setIcfesView('SIMULATION')}
                                  onOpenIngest={() => setIcfesView('INGEST')}
                                />
                              )}
                              {icfesView === 'SIMULATION' && (
                                <ExamSimulator
                                  onExit={() => setIcfesView('DASHBOARD')}
                                  onComplete={(results: unknown) => {
                                    setSimulationResults(results);
                                    setIcfesView('RESULTS');
                                  }}
                                />
                              )}
                              {icfesView === 'INGEST' && <IngestQuestions />}
                              {icfesView === 'RESULTS' && simulationResults && (
                                <ICFESResults
                                  results={simulationResults}
                                  onRetry={() => setIcfesView('SIMULATION')}
                                  onHome={() => setIcfesView('DASHBOARD')}
                                />
                              )}
                              {icfesView === 'STUDY' && <div className="p-8 text-center text-slate-500">Material de Estudio (Próximamente)</div>}
                            </ICFESLayout>
                          ) : isAuthenticated && userRole === 'STUDENT' && showAvatarOnboarding ? (
                            <AvatarSelection
                              initialGrade={gradeLevel}
                              onComplete={() => setShowAvatarOnboarding(false)}
                            />
                          ) : (
                            <MainLayout
                              isAuthenticated={isAuthenticated}
                              userRole={userRole}
                              currentView={currentView}
                              setCurrentView={setCurrentView}
                              handleLogout={handleLogout}
                              userName={userName}
                              userId={userId}
                              mustChangePassword={mustChangePassword}
                              setMustChangePassword={setMustChangePassword}
                              gradeLevel={gradeLevel}
                              setGradeLevel={setGradeLevel}
                            />
                          )}
                        </>
                      )}
                    </Suspense>
                  </TooltipProvider>
                  <Toaster />
                </LearningProvider>
              </PetProvider>
            </AvatarProvider>
          </AchievementProvider>
        </GamificationProvider>
      </DemoTourProvider>
    </QueryClientProvider>
  );
}

export default App;
