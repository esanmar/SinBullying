import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getCurrentUser, login, logout, registerUser, requestPasswordReset, resetPassword } from './services/bkndService';
import { User, Role } from './types';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookieBanner from './components/CookieBanner';
import { Shield, LogOut } from './components/Icons';

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

// --- LOGIN & REGISTER COMPONENT ---
const AuthScreen = ({ onLogin }: { onLogin: (u: User) => void }) => {
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-brand-600 p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SinBullying</h1>
          <p className="text-brand-100">
             {isForgotPassword ? 'Recuperar Contraseña' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          
          {/* Role Selector (Always visible unless forgot password) */}
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
                    Estudiante
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
                    Técnico
                </button>
                <button
                    type="button"
                    disabled={!isLogin} // Admin can't register here
                    onClick={() => setRole('admin')}
                    className={`py-2 px-1 rounded-lg border-2 text-sm font-medium transition ${
                    role === 'admin' 
                    ? 'border-brand-500 bg-brand-50 text-brand-700' 
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    } ${!isLogin ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Admin
                </button>
                </div>
            </div>
          )}

          {!isLogin && !isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input 
                    type="text" required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-brand-500"
                    value={name} onChange={e => setName(e.target.value)}
                />
              </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required
              placeholder="nombre@ejemplo.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-brand-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {!isForgotPassword && (
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-brand-500"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
             </div>
          )}

          {/* Privacy Checkbox for Registration */}
          {!isLogin && !isForgotPassword && (
              <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="privacy"
                      type="checkbox"
                      required
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-brand-300"
                      checked={acceptedTerms}
                      onChange={e => setAcceptedTerms(e.target.checked)}
                    />
                  </div>
                  <label htmlFor="privacy" className="ml-2 text-xs text-gray-600">
                      Acepto la <Link to="/privacy" target="_blank" className="text-brand-600 hover:underline">Política de Privacidad</Link> y el tratamiento de mis datos para la gestión del reporte.
                  </label>
              </div>
          )}
            
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
          {successMsg && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">{successMsg}</div>}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-600 text-white font-bold py-3 rounded-lg hover:bg-brand-700 transition shadow-lg disabled:opacity-70"
          >
            {isLoading ? 'Procesando...' : isForgotPassword ? 'Enviar enlace' : isLogin ? 'Entrar' : 'Registrarse'}
          </button>

          {/* Footer Links */}
          <div className="flex flex-col items-center space-y-2 mt-4 text-sm">
              {!isForgotPassword && (
                  <button type="button" onClick={() => { setIsForgotPassword(true); resetForm(); }} className="text-brand-600 hover:underline">
                      ¿Olvidaste tu contraseña?
                  </button>
              )}
              
              {isForgotPassword ? (
                  <button type="button" onClick={() => { setIsForgotPassword(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">
                      Volver al inicio
                  </button>
              ) : (
                role !== 'admin' && (
                    <button type="button" onClick={() => { setIsLogin(!isLogin); resetForm(); }} className="text-gray-500 hover:text-gray-700">
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                    </button>
                )
              )}
          </div>
          
          <div className="pt-4 mt-4 border-t border-gray-100 text-center">
             <Link to="/privacy" className="text-xs text-gray-400 hover:text-gray-600">Política de Privacidad</Link>
          </div>

        </form>
      </div>
    </div>
  );
};

// --- LAYOUT ---
const DashboardLayout = ({ children, user, onLogout }: { children?: React.ReactNode, user: User, onLogout: () => void }) => {
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
              <span className="text-sm text-gray-500 hidden sm:block">Hola, {user.name}</span>
              <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wide ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                  user.role === 'technician' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                {user.role === 'admin' ? 'Admin' : user.role === 'technician' ? 'Técnico' : 'Estudiante'}
              </span>
              <button 
                onClick={onLogout}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                title="Cerrar Sesión"
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
  );
};

export default App;