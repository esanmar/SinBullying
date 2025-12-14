import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { getCurrentUser, login, logout } from './services/bkndService';
import { User, Role } from './types';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import TechnicianDashboard from './components/TechnicianDashboard'; // New Import
import { Shield, LogOut } from './components/Icons';

// --- LOGIN COMPONENT ---
const LoginScreen = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Estado para la contraseña
  const [role, setRole] = useState<Role>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Pasamos password si el rol es admin
      const user = await login(email, role, role === 'admin' ? password : undefined);
      onLogin(user);
    } catch (e: any) {
      setError(e.message || "Error al iniciar sesión");
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
          <p className="text-brand-100">Plataforma segura contra el bullying</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required
              placeholder="tu@escuela.edu"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Input de Contraseña: Solo visible para Admin */}
          {role === 'admin' && (
             <div className="animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña de Administrador</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
             </div>
          )}
          
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
                onClick={() => setRole('admin')}
                className={`py-2 px-1 rounded-lg border-2 text-sm font-medium transition ${
                  role === 'admin' 
                  ? 'border-brand-500 bg-brand-50 text-brand-700' 
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
            
          {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
              </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-600 text-white font-bold py-3 rounded-lg hover:bg-brand-700 transition shadow-lg disabled:opacity-70"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
      <p className="mt-8 text-center text-gray-400 text-sm">
        Powered by bknd & Vercel
      </p>
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
              <Shield className="h-8 w-8 text-brand-600 mr-2" />
              <span className="font-bold text-xl text-gray-900 hidden sm:block">SinBullying</span>
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
      <Routes>
        <Route path="/login" element={!user ? <LoginScreen onLogin={handleLogin} /> : <Navigate to="/" />} />
        
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