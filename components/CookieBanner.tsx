import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('sinbullying_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('sinbullying_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50 animate-fade-in-up">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-300">
          <p>
            Utilizamos cookies esenciales y almacenamiento local para garantizar que obtenga la mejor experiencia y mantener su sesión segura. 
            No utilizamos cookies de rastreo publicitario. 
            <Link to="/privacy" className="text-brand-400 hover:text-brand-300 underline ml-1">
              Leer Política de Privacidad
            </Link>.
          </p>
        </div>
        <button 
          onClick={handleAccept}
          className="whitespace-nowrap bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-medium text-sm transition"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;