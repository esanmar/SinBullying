import React, { useState, useEffect } from 'react';
import { createCase, uploadFile, getCasesByStudent, sendVerificationCode, verifyOTP, getTechnicians } from '../services/bkndService';
import { Upload, CheckCircle, AlertTriangle, FileText, Calendar, MessageCircle } from './Icons';
import { User, Evidence, BullyingCase } from '../types';

interface Props {
  user: User;
}

const StudentDashboard: React.FC<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<Evidence[]>([]);
  
  // 2FA State
  const [verificationStep, setVerificationStep] = useState<'form' | 'code'>('form');
  const [userEnteredCode, setUserEnteredCode] = useState('');

  // History State
  const [myCases, setMyCases] = useState<BullyingCase[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    description: '',
    dateOfIncident: new Date().toISOString().split('T')[0],
    location: '',
    involvedPeople: '',
    contactEmail: user.email || '',
    contactPhone: ''
  });

  useEffect(() => {
    if (activeTab === 'history') {
      // Fetch cases
      getCasesByStudent(user.id).then(data => {
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMyCases(data);
      });
      // Fetch technicians to resolve assignments
      getTechnicians().then(setTechnicians);
    }
  }, [activeTab, user.id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setLoading(true);
      try {
        const uploaded = await Promise.all(filesArray.map(f => uploadFile(f as File)));
        setEvidenceFiles(prev => [...prev, ...uploaded]);
      } catch (error) {
        console.error("Upload failed", error);
        alert("Error al subir archivo");
      } finally {
        setLoading(false);
      }
    }
  };

  const initiateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.location || !formData.contactEmail || !formData.contactPhone) {
        alert("Por favor rellena los campos obligatorios y de contacto.");
        return;
    }

    setLoading(true);
    try {
      await sendVerificationCode(formData.contactEmail);
      setVerificationStep('code');
    } catch (error) {
      alert("Error al enviar el código de verificación.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      const isValid = await verifyOTP(formData.contactEmail, userEnteredCode);
      
      if (!isValid) {
        alert("Código incorrecto o expirado. Por favor inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      await createCase({
        studentId: user.id,
        description: formData.description,
        dateOfIncident: formData.dateOfIncident,
        location: formData.location,
        involvedPeople: formData.involvedPeople,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        evidence: evidenceFiles
      });
      setSuccess(true);
      setVerificationStep('form');
      setUserEnteredCode('');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al enviar el reporte.");
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppLink = (phone: string, caseId: string) => {
    const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
    const message = encodeURIComponent(`Hola, soy el estudiante del caso #${caseId}. Me gustaría hablar con usted.`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg max-w-lg mx-auto mt-10 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Reporte Enviado!</h2>
        <p className="text-gray-600 mb-6">
          Gracias por tu valentía. El administrador ha sido notificado y te contactará a través de los medios proporcionados.
        </p>
        <button 
          onClick={() => {
            setSuccess(false);
            setFormData({
              description: '',
              dateOfIncident: new Date().toISOString().split('T')[0],
              location: '',
              involvedPeople: '',
              contactEmail: user.email || '',
              contactPhone: ''
            });
            setEvidenceFiles([]);
            setActiveTab('history');
          }}
          className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition"
        >
          Ver mis reportes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
            onClick={() => setActiveTab('new')}
            className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'new' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
            Nuevo Reporte
        </button>
        <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'history' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
            Mis Reportes Enviados
        </button>
      </div>

      {activeTab === 'new' ? (
          <>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                <div className="flex">
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                    Tu reporte es seguro. Necesitaremos verificar tu identidad mediante un código antes de enviar.
                    </p>
                </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-brand-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Detalles del Incidente</h2>
                </div>
                
                {verificationStep === 'form' ? (
                    <form onSubmit={initiateVerification} className="p-6 space-y-6">
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        ¿Qué sucedió? (Descripción detallada) *
                        </label>
                        <textarea
                        required
                        rows={4}
                        className="w-full border-gray-300 border rounded-lg p-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        placeholder="Describe los hechos..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha del incidente *
                        </label>
                        <input
                            type="date"
                            required
                            className="w-full border-gray-300 border rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none"
                            value={formData.dateOfIncident}
                            onChange={e => setFormData({...formData, dateOfIncident: e.target.value})}
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lugar *
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full border-gray-300 border rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none"
                            placeholder="Ej. Cafetería"
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                        />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Datos de Contacto (Privado)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border-gray-300 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    value={formData.contactEmail}
                                    onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono *</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="600 000 000"
                                    className="w-full border-gray-300 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    value={formData.contactPhone}
                                    onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        Personas involucradas (Opcional)
                        </label>
                        <input
                        type="text"
                        className="w-full border-gray-300 border rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Nombres o descripción física"
                        value={formData.involvedPeople}
                        onChange={e => setFormData({...formData, involvedPeople: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Evidencias (Capturas, Fotos)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*,.pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Toca para subir archivos</p>
                        </div>
                        
                        {evidenceFiles.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {evidenceFiles.map((file) => (
                            <div key={file.id} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-100 flex items-center justify-center">
                                {file.fileType.startsWith('image') ? (
                                <img src={file.url} alt="evidencia" className="w-full h-full object-cover" />
                                ) : (
                                <span className="text-xs text-gray-500 p-2 break-all">{file.fileName}</span>
                                )}
                            </div>
                            ))}
                        </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-medium text-lg transition shadow-md ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
                        }`}
                        >
                        {loading ? 'Procesando...' : 'Continuar a Verificación'}
                        </button>
                    </div>
                    </form>
                ) : (
                    <form onSubmit={handleFinalSubmit} className="p-8 text-center space-y-6">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Verificación de Seguridad</h3>
                            <p className="text-gray-500 mt-2">
                                Hemos enviado un código a <strong>{formData.contactEmail}</strong>.<br/>
                                <span className="text-xs text-gray-400 italic">(Demo: Revisa la consola del navegador F12)</span>
                            </p>
                            <p className="text-sm text-gray-600 mt-2">Introduce el código para finalizar el reporte.</p>
                        </div>
                        
                        <div>
                            <input 
                                type="text" 
                                placeholder="000000"
                                className="w-48 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg p-2 focus:border-brand-500 outline-none"
                                maxLength={6}
                                autoFocus
                                value={userEnteredCode}
                                onChange={(e) => setUserEnteredCode(e.target.value)}
                            />
                        </div>

                        <div className="flex space-x-3 justify-center">
                            <button 
                                type="button"
                                onClick={() => setVerificationStep('form')}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                            >
                                Volver
                            </button>
                            <button 
                                type="submit"
                                disabled={loading || userEnteredCode.length < 6}
                                className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
                            >
                                {loading ? 'Verificando...' : 'Verificar y Enviar'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
          </>
      ) : (
          <div className="space-y-4">
              {myCases.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No has enviado ningún reporte todavía.</p>
                  </div>
              ) : (
                  myCases.map(c => {
                      // Find assigned technician
                      const assignedTech = technicians.find(t => t.id === c.assignedTechnicianId);
                      
                      return (
                        <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${
                                        c.status === 'resuelto' ? 'bg-green-100 text-green-700' :
                                        c.status === 'revision' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {c.status}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="font-medium text-gray-800">{c.description.substring(0, 60)}...</p>
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {c.dateOfIncident}
                                </div>
                            </div>
                            
                            {/* WhatsApp Button - Only if tech is assigned and has phone */}
                            {assignedTech && assignedTech.phone && (
                                <a 
                                    href={getWhatsAppLink(assignedTech.phone, c.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition shadow-sm w-full md:w-auto"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="font-semibold text-sm">Chat con Técnico</span>
                                </a>
                            )}
                        </div>
                      );
                  })
              )}
          </div>
      )}
    </div>
  );
};

// Helper Icon for this component locally
const ShieldIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

export default StudentDashboard;