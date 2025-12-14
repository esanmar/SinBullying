import React from 'react';
import { Shield } from './Icons';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-brand-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center text-white">
            <Shield className="w-6 h-6 mr-2" />
            <h1 className="text-xl font-bold">Política de Privacidad y Protección de Datos</h1>
          </div>
          <Link to="/" className="text-brand-100 hover:text-white text-sm">Volver al inicio</Link>
        </div>
        
        <div className="p-8 text-gray-700 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Introducción</h2>
            <p>
              En <strong>SinBullying</strong>, nos tomamos muy en serio la privacidad y seguridad de los estudiantes y el personal. 
              Esta política describe cómo recopilamos, usamos y protegemos la información personal proporcionada a través de nuestra plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Datos que Recopilamos</h2>
            <p>Para gestionar los reportes de acoso escolar, podemos recopilar los siguientes datos:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Datos de Identificación:</strong> Nombre, apellidos (en caso de registro).</li>
              <li><strong>Datos de Contacto:</strong> Correo electrónico, número de teléfono.</li>
              <li><strong>Datos del Incidente:</strong> Descripción de los hechos, ubicación, fecha, personas implicadas.</li>
              <li><strong>Evidencias:</strong> Imágenes, documentos o archivos adjuntos proporcionados voluntariamente.</li>
              <li><strong>Datos Técnicos:</strong> Cookies técnicas y almacenamiento local para mantener la sesión segura.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Finalidad del Tratamiento</h2>
            <p>Los datos se utilizan exclusivamente para:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Registrar y dar seguimiento a incidencias de acoso escolar.</li>
              <li>Facilitar la comunicación entre el estudiante y el equipo de orientación/técnico.</li>
              <li>Garantizar la seguridad y convivencia en el entorno educativo.</li>
              <li>Verificar la identidad del reportante mediante códigos de seguridad (OTP) para evitar reportes falsos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Seguridad de los Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas (encriptación de contraseñas, conexiones seguras HTTPS, verificación en dos pasos) 
              para proteger sus datos contra el acceso no autorizado, la alteración o la destrucción.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Confidencialidad</h2>
            <p>
              La información reportada es estrictamente confidencial. Solo tendrán acceso a ella el <strong>Administrador del Centro</strong> 
              y los <strong>Técnicos/Orientadores</strong> asignados al caso para su resolución. No compartimos datos con terceros salvo obligación legal.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">6. Sus Derechos</h2>
            <p>
              Como usuario, tiene derecho a acceder, rectificar o solicitar la eliminación de sus datos personales. 
              Para ejercer estos derechos, póngase en contacto con la administración del centro a través de la plataforma.
            </p>
          </section>
          
          <div className="pt-6 border-t border-gray-100">
             <p className="text-xs text-gray-500">Última actualización: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;