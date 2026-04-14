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

// Nova ICFES - New primary app
import { ICFESApp } from './components/icfes/ICFESApp';

// Legacy Components (kept for admin access)
import LoginPage from './components/LoginPage';
const MainLayout = React.lazy(() => import('./components/MainLayout').then(m => ({ default: m.MainLayout })));
const GoogleClassroomSync = React.lazy(() => import('./components/GoogleClassroom/GoogleClassroomSync').then(m => ({ default: m.GoogleClassroomSync })));
const AvatarSelection = React.lazy(() => import('./components/Gamification/AvatarSelection').then(m => ({ default: m.AvatarSelection })));
import { WelcomeGael } from './components/WelcomeGael';

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
  const [appMode, setAppMode] = useState<'ELEMENTARY'>('ELEMENTARY');
  /** Primer ingreso del niño: no tiene avatar elegido; mostrar pantalla de selección. */
  const [showAvatarOnboarding, setShowAvatarOnboarding] = useState(false);
  const [icfesView, setIcfesView] = useState<'DASHBOARD' | 'SIMULATION' | 'INGEST' | 'RESULTS' | 'STUDY'>('DASHBOARD');
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [showDannaWelcome, setShowDannaWelcome] = useState(false);

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
        // Force Mateo avatar for Admin to allow testing all accessories
        localStorage.setItem('nova_avatar_id', 'g5_boy_2');
        localStorage.setItem('nova_student_grade', '0'); // Universal

        // Grant massive coins and XP for testing the whole store
        const adminGamification = {
          coins: 999999,
          savingsBalance: 999999,
          xp: 15000,
          level: 10,
          novaCoins: 999999
        };
        localStorage.setItem('nova_gamification', JSON.stringify(adminGamification));
        localStorage.setItem('nova_math_gamification', JSON.stringify(adminGamification));

        // Signal contexts to re-sync if needed
        window.dispatchEvent(new CustomEvent('nova_gamification_updated'));
        window.dispatchEvent(new CustomEvent('nova_avatar_sync'));
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
      // 🚨 EMERGENCY BYPASS: Admin (Rickhazur)
      if ((email === 'rickhazur@gmail.com' || email === 'admin') && 
          (password === 'Gael2024*' || password === 'admin')) {
        console.log('🛡️ Admin Bypass Triggered');
        setIsAuthenticated(true);
        setUserId('admin-bypass-uid');
        setUserName('Rickhazur (Admin)');
        setUserRole('ADMIN');
        setCurrentView(ViewState.DASHBOARD);
        setShowLogin(false); // Cierra el modal de login
        return;
      }

      // 👶 ACCESO ESPECIAL: Danna Sofia Corredor (Gael)
      if (email === 'dannasofiacorredor25@gmail.com' && password === 'Gael2024*') {
        const isFirstLogin = !localStorage.getItem('danna_initial_login_done');
        setIsAuthenticated(true);
        setUserId('danna-gael-user');
        setUserName('Danna Sofia');
        setUserRole('STUDENT');
        setGradeLevel(11); // Supongamos grado 11 para validación
        
        if (isFirstLogin) {
          setShowDannaWelcome(true);
          setMustChangePassword(true);
          localStorage.setItem('danna_initial_login_done', 'true');
        }
        
        localStorage.setItem('nova_user_name', 'Danna Sofia');
        localStorage.setItem('nova_student_grade', '11');
        setCurrentView(ViewState.DASHBOARD);
        return;
      }

      // Hardcoded backdoors (demo, pilot) logically removed for security.

      // Hardcoded parent tester removed.

      // 🚀 Modo sin Supabase: Local demo removed for security.

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

  // Google callback detection — explicitly exclude Supabase password recovery URLs
  const isPasswordRecoveryURL = window.location.hash.includes('type=recovery');
  const isGoogleCallbackURL = !isPasswordRecoveryURL && (
    window.location.pathname.includes('/api/google/callback') ||
    window.location.search.includes('code=') ||
    window.location.hash.includes('access_token=')
  );

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
                      {showPasswordReset ? (
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
                      ) : isGoogleCallbackURL ? (
                        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                          <div className="w-full h-full flex items-center justify-center">
                            <GoogleClassroomSync />
                          </div>
                        </div>
                      ) : (
                        <>

                          {isLoading ? (
                            <SplashScreen />
                          ) : isAuthenticated && userRole === 'ADMIN' ? (
                            /* Admin users get the legacy MainLayout */
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
                          ) : showLogin ? (
                            /* Legacy login (admin access) */
                            <LoginPage
                              onLogin={handleLogin}
                              onBack={() => setShowLogin(false)}
                              defaultMode={loginMode}
                            />
                          ) : (
                            /* Primary Experience: Nova ICFES */
                            <ICFESApp
                              isAuthenticated={isAuthenticated}
                              userName={userName}
                              userId={userId}
                              onLogin={(mode: string) => {
                                setShowLogin(true);
                                setLoginMode(mode as 'STUDENT' | 'ADMIN' | 'PARENT');
                              }}
                              onLogout={handleLogout}
                            />
                          )}

                          {showDannaWelcome && <WelcomeGael onClose={() => {
                                setShowDannaWelcome(false);
                                if (mustChangePassword) setShowPasswordReset(true);
                            }} />}
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
