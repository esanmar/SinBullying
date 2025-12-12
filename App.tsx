import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser, login, logout } from './services/bkndService';
import { User, Role } from './types';
import { Shield, LogOut } from './components/Icons';

// Lazy loading de componentes pesados
const StudentDashboard = lazy(() => import('./components/StudentDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const TechnicianDashboard = lazy(() => import('./components/TechnicianDashboard'));

// Componente de carga
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
);

// --- LOGIN COMPONENT ---
const LoginScreen = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const user = await login(email, role);
      onLogin(user);
    } catch (e: any) {
      setError(e.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SinBullying</h1>
          <p className="text-brand-100">Plataforma segura contra el bullying</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              required
              placeholder="tu@escuela.edu"
              className="input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Usuario
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['student', 'technician', 'admin'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  disabled={isLoading}
                  className={`py-2 px-1 rounded-lg border-2 text-sm font-medium transition ${
                    role === r
                      ? 'border-brand-500 bg-brand-50 text-brand-700' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {r === 'student' ? 'Estudiante' : r === 'technician' ? 'Técnico' : 'Admin'}
                </button>
              ))}
            </div>
          </div>
            
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 animate-fade-in">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
      <p className="mt-8 text-center text-gray-500 text-sm">
        Plataforma de código abierto · Versión 2.0
      </p>
    </div>
  );
};

// --- LAYOUT ---
const DashboardLayout = ({ 
  children, 
  user, 
  onLogout 
}: { 
  children?: React.ReactNode;
  user: User;
  onLogout: () => void;
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-brand-600 mr-2" />
              <span className="font-bold text-xl text-gray-900 hidden sm:block">
                SinBullying
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 hidden sm:block">
                Hola, {user.name}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wide ${
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
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
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

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <LoginScreen onLogin={handleLogin} /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/" 
          element={
            user ? (
              <DashboardLayout user={user} onLogout={handleLogout}>
                {user.role === 'admin' ? (
                  <AdminDashboard />
                ) : user.role === 'technician' ? (
                  <TechnicianDashboard user={user} />
                ) : (
                  <StudentDashboard user={user} />
                )}
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
