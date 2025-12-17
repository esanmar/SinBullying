import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getCurrentUser, login, logout, registerUser, requestPasswordReset, resetPassword } from './services/bkndService';
import { User, Role } from './types';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookieBanner from './components/CookieBanner';
import { Shield, LogOut, Users, FileText, CheckCircle, AlertTriangle, Briefcase, UserIcon, GitHub } from './components/Icons';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';

// --- PASSWORD RESET COMPONENT ---
const ResetPasswordScreen = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [msg, setMsg] = useState('');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass !== confirmPass) {
            setMsg("Las contraseñas no coinciden");
            return;
        }
        if (!token || !email) {
            setMsg("Enlace inválido");
            return;
        }

        setStatus('loading');
        try {
            await resetPassword(email, token, newPass);
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (e: any) {
            setStatus('error');
            setMsg(e.message || "Error al restablecer");
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <h2 className="text-2xl text-green-600 font-bold mb-4">¡Contraseña Actualizada!</h2>
                    <p>Redirigiendo al login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <form onSubmit={handleReset} className="bg-white p-8 rounded-lg shadow w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Nueva Contraseña</h2>
                {msg && <p className="mb-4 text-red-500 text-sm">{msg}</p>}
                <input 
                    type="password" placeholder="Nueva contraseña" required 
                    className="w-full border p-2 rounded mb-4"
                    value={newPass} onChange={e => setNewPass(e.target.value)}
                />
                <input 
                    type="password" placeholder="Confirmar contraseña" required 
                    className="w-full border p-2 rounded mb-6"
                    value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                />
                <button 
                    disabled={status === 'loading'}
                    className="w-full bg-brand-600 text-white py-2 rounded font-bold"
                >
                    {status === 'loading' ? 'Guardando...' : 'Cambiar Contraseña'}
                </button>
            </form>
        </div>
    );
};

// --- FEATURE CARD COMPONENT ---
const FeatureSection = ({ title, icon, items }: { title: string, icon: React.ReactNode, items: string[] }) => (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 h-full">
        <div className="flex items-center mb-4">
            <div className="bg-white/20 p-2 rounded-lg mr-3 text-white">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <ul className="space-y-2">
            {items.map((item, idx) => (
                <li key={idx} className="text-brand-100 text-sm flex items-start">
                    <span className="mr-2 mt-1 text-xs">•</span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

// --- LOGIN & LANDING COMPONENT ---
const AuthScreen = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const { t, language, setLanguage } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only for register
  const [role, setRole] = useState<Role>('student');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const resetForm = () => {
      setError('');
      setSuccessMsg('');
      setPassword('');
      setName('');
      setAcceptedTerms(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isForgotPassword) {
          await requestPasswordReset(email);
          setSuccessMsg("Si el email existe, recibirás un enlace para recuperar tu contraseña.");
          setIsLoading(false);
          return;
      }

      if (isLogin) {
          const user = await login(email, role, password);
          onLogin(user);
      } else {
          // Register
          if (role === 'admin') throw new Error("No puedes registrarte como Admin.");
          if (!acceptedTerms) throw new Error("Debes aceptar la política de privacidad.");
          
          await registerUser({
              email, password, name, role
          });
          
          setSuccessMsg("Cuenta creada correctamente. Por favor inicia sesión.");
          setIsLogin(true);
          setPassword('');
      }
    } catch (e: any) {
      setError(e.message || "Error en la operación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      
      {/* LEFT COLUMN: LANDING INFO */}
      <div className="lg:w-7/12 bg-brand-600 p-8 lg:p-12 xl:p-16 flex flex-col order-2 lg:order-1 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-white/20 p-3 rounded-full backdrop-blur-md">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">{t('landingTitle')}</h1>
                        </div>
                        <h2 className="text-xl text-brand-100 font-light leading-relaxed max-w-2xl">
                            {t('landingSubtitle')}
                        </h2>
                    </div>
                    <div className="flex space-x-2 shrink-0">
                        <button onClick={() => setLanguage('es')} className={`px-2 py-1 text-xs rounded font-medium ${language === 'es' ? 'bg-white text-brand-600 shadow' : 'bg-brand-700 text-white/80 hover:bg-brand-500'}`}>ES</button>
                        <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-xs rounded font-medium ${language === 'en' ? 'bg-white text-brand-600 shadow' : 'bg-brand-700 text-white/80 hover:bg-brand-500'}`}>EN</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-12">
                    <FeatureSection 
                        title={t('featStudent')}
                        icon={<UserIcon className="w-5 h-5"/>}
                        items={[
                            t('featStudent_1'),
                            t('featStudent_3'),
                            t('featStudent_2')
                        ]} 
                    />
                    <FeatureSection 
                        title={t('featTech')}
                        icon={<Briefcase className="w-5 h-5"/>}
                        items={[
                            t('featTech_1'),
                            t('featTech_3'),
                            t('featTech_4')
                        ]} 
                    />
                    <FeatureSection 
                        title={t('featAdmin')}
                        icon={<Users className="w-5 h-5"/>}
                        items={[
                            t('featAdmin_1'),
                            t('featAdmin_3'),
                            t('featAdmin_5')
                        ]} 
                    />
                    <FeatureSection 
                        title={t('featPrivacy')}
                        icon={<CheckCircle className="w-5 h-5"/>}
                        items={[
                            t('featPrivacy_1'),
                            t('featPrivacy_2'),
                            t('featPrivacy_4')
                        ]} 
                    />
                </div>

                {/* APP PREVIEW SCREENSHOTS */}
                <div className="relative max-w-2xl mx-auto mt-6 hidden sm:block group">
                    {/* Desktop Mockup */}
                    <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-gray-800 bg-gray-800 transform -rotate-2 group-hover:rotate-0 transition duration-700 ease-out z-10">
                        <div className="h-6 bg-gray-900 border-b border-gray-700 flex items-center space-x-1.5 px-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                        {/* 
                            ATENCIÓN: Estas imágenes deben estar en la carpeta 'public' del proyecto.
                            El usuario debe renombrar sus archivos a 'desktop-preview.png' y 'mobile-preview.png'
                            o cambiar estos paths.
                        */}
                        <img 
                            src="/desktop-preview.png" 
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/800x500/1e293b/FFF?text=Desktop+Preview';
                            }}
                            alt="SinBullying Desktop Dashboard" 
                            className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition"
                        />
                    </div>

                    {/* Mobile Mockup Overlay */}
                    <div className="absolute -bottom-8 -right-8 w-[28%] rounded-[2rem] border-[6px] border-gray-900 bg-gray-900 shadow-2xl transform rotate-3 group-hover:rotate-0 transition duration-700 delay-100 ease-out z-20 overflow-hidden">
                        <div className="h-full w-full bg-white rounded-[1.5rem] overflow-hidden relative">
                             {/* Notch simulation */}
                             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-4 bg-gray-900 rounded-b-lg z-30"></div>
                             <img 
                                src="/mobile-preview.png" 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x600/1e293b/FFF?text=Mobile';
                                }}
                                alt="SinBullying Mobile View" 
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-16 pt-6 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center text-brand-200 text-xs sm:text-sm">
                <p>© {new Date().getFullYear()} SinBullying Platform. Open Source.</p>
                <div className="flex items-center space-x-6 mt-4 sm:mt-0">
                    <Link to="/privacy" className="hover:text-white underline transition">Política de Privacidad</Link>
                    <a href="https://github.com/esanmar/SinBullying" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-white transition group" title="Ver código en GitHub">
                        <GitHub className="w-4 h-4 mr-2 opacity-80 group-hover:opacity-100" />
                        <span className="font-semibold">GitHub Repo</span>
                    </a>
                </div>
            </div>
        </div>
      </div>

      {/* RIGHT COLUMN: AUTH FORM */}
      <div className="lg:w-5/12 bg-white flex flex-col items-center justify-center p-6 lg:p-12 order-1 lg:order-2 shadow-2xl z-20 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:hidden mb-8">
                 <div className="mx-auto bg-brand-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-white" />
                 </div>
                 <h1 className="text-3xl font-bold text-gray-900">SinBullying</h1>
                 <p className="text-gray-500 mt-2">Plataforma de Convivencia Escolar</p>
            </div>

            <div className="bg-white p-2">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                    {isForgotPassword ? 'Recuperar Cuenta' : isLogin ? t('welcome') : t('createAccount')}
                </h2>
                <p className="text-center text-gray-500 text-sm mb-8">
                    {isForgotPassword ? 'Ingresa tu email para recibir instrucciones' : isLogin ? t('loginSubtitle') : t('registerSubtitle')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Role Selector */}
                    {!isForgotPassword && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Soy...</label>
                            <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setRole('student')}
                                className={`py-2 px-1 rounded-lg border-2 text-sm font-medium transition ${
                                role === 'student' 
                                ? 'border-brand-500 bg-brand-50 text-brand-700' 
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                {t('roleStudent')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('technician')}
                                className={`py-2 px-1 rounded-lg border-2 text-sm font-medium transition ${
                                role === 'technician' 
                                ? 'border-brand-500 bg-brand-50 text-brand-700' 
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                {t('roleTechnician')}
                            </button>
                            <button
                                type="button"
                                disabled={!isLogin} 
                                onClick={() => setRole('admin')}
                                className={`py-2 px-1 rounded-lg border-2 text-sm font-medium transition ${
                                role === 'admin' 
                                ? 'border-brand-500 bg-brand-50 text-brand-700' 
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                } ${!isLogin ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {t('roleAdmin')}
                            </button>
                            </div>
                        </div>
                    )}

                    {!isLogin && !isForgotPassword && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
                            <input 
                                type="text" required
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                                value={name} onChange={e => setName(e.target.value)}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                        <input 
                        type="email" 
                        required
                        placeholder="nombre@ejemplo.com"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    {!isForgotPassword && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
                                {isLogin && (
                                    <button type="button" onClick={() => { setIsForgotPassword(true); resetForm(); }} className="text-xs text-brand-600 hover:underline">
                                        {t('forgotPass')}
                                    </button>
                                )}
                            </div>
                            <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Privacy Checkbox */}
                    {!isLogin && !isForgotPassword && (
                        <div className="flex items-start bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center h-5">
                                <input
                                id="privacy"
                                type="checkbox"
                                required
                                className="w-4 h-4 border border-gray-300 rounded bg-white focus:ring-3 focus:ring-brand-300"
                                checked={acceptedTerms}
                                onChange={e => setAcceptedTerms(e.target.checked)}
                                />
                            </div>
                            <label htmlFor="privacy" className="ml-2 text-xs text-gray-600">
                                {t('privacyCheck')}
                            </label>
                        </div>
                    )}
                        
                    {error && <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-start"><AlertTriangle className="w-5 h-5 mr-2 shrink-0"/>{error}</div>}
                    {successMsg && <div className="p-4 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 flex items-start"><CheckCircle className="w-5 h-5 mr-2 shrink-0"/>{successMsg}</div>}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-brand-600 text-white font-bold py-3 rounded-lg hover:bg-brand-700 transition shadow-lg hover:shadow-xl disabled:opacity-70 transform active:scale-95"
                    >
                        {isLoading ? 'Procesando...' : isForgotPassword ? 'Enviar Enlace de Recuperación' : isLogin ? t('btnLogin') : t('btnRegister')}
                    </button>

                    <div className="pt-4 text-center">
                        {isForgotPassword ? (
                            <button type="button" onClick={() => { setIsForgotPassword(false); resetForm(); }} className="text-sm text-gray-500 hover:text-gray-800 font-medium">
                                ← Volver al inicio de sesión
                            </button>
                        ) : (
                            role !== 'admin' && (
                                <button type="button" onClick={() => { setIsLogin(!isLogin); resetForm(); }} className="text-sm text-gray-600 hover:text-brand-600">
                                    {isLogin ? (
                                        <span>¿No tienes cuenta? <span className="font-bold text-brand-600">Regístrate gratis</span></span>
                                    ) : (
                                        <span>¿Ya tienes cuenta? <span className="font-bold text-brand-600">{t('btnLogin')}</span></span>
                                    )}
                                </button>
                            )
                        )}
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- LAYOUT ---
const DashboardLayout = ({ children, user, onLogout }: { children?: React.ReactNode, user: User, onLogout: () => void }) => {
  const { t, language, setLanguage } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Shield className="h-8 w-8 text-brand-600 mr-2" />
                <span className="font-bold text-xl text-gray-900 hidden sm:block">SinBullying</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 hidden sm:block">{t('hello')}, {user.name}</span>
              <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wide ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                  user.role === 'technician' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                {user.role === 'admin' ? t('roleAdmin') : user.role === 'technician' ? t('roleTechnician') : t('roleStudent')}
              </span>
              <div className="flex space-x-1 border-l pl-4 ml-2">
                 <button onClick={() => setLanguage('es')} className={`px-2 py-1 text-xs rounded ${language === 'es' ? 'bg-brand-600 text-white' : 'text-gray-500'}`}>ES</button>
                 <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-xs rounded ${language === 'en' ? 'bg-brand-600 text-white' : 'text-gray-500'}`}>EN</button>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                title={t('logout')}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (isInitializing) return <div className="h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <LanguageProvider>
      <HashRouter>
        <CookieBanner />
        <Routes>
          <Route path="/login" element={!user ? <AuthScreen onLogin={handleLogin} /> : <Navigate to="/" />} />
          
          {/* Reset Password Route */}
          <Route path="/reset-password" element={<ResetPasswordScreen />} />
          
          {/* Privacy Route */}
          <Route path="/privacy" element={<PrivacyPolicy />} />

          <Route path="/" element={
            user ? (
              <DashboardLayout user={user} onLogout={handleLogout}>
                {user.role === 'admin' ? <AdminDashboard /> : 
                user.role === 'technician' ? <TechnicianDashboard user={user} /> :
                <StudentDashboard user={user} />}
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          } />
        </Routes>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;