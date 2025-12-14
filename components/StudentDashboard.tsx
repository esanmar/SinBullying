import React, { useState, useEffect } from 'react';
import { createCase, uploadFile, getCasesByStudent, sendVerificationCode, verifyOTP, getTechnicians, updateCaseStudentNotes } from '../services/bkndService';
import { Upload, CheckCircle, AlertTriangle, FileText, Calendar, MessageCircle, UserIcon } from './Icons';
import { User, Evidence, BullyingCase } from '../types';
import { Link } from 'react-router-dom';

interface Props {
  user: User;
}

const StudentDashboard: React.FC<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<Evidence[]>([]);
  
  // 2FA State
  const [verificationStep, setVerificationStep] = useState<'form' | 'code'>('form');
  const [userEnteredCode, setUserEnteredCode] = useState('');

  // History State
  const [myCases, setMyCases] = useState<BullyingCase[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  
  // Detail & Notes State
  const [selectedCase, setSelectedCase] = useState<BullyingCase | null>(null);
  const [studentNotes, setStudentNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

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
      fetchHistory();
    }
  }, [activeTab, user.id]);

  const fetchHistory = async () => {
    const data = await getCasesByStudent(user.id);
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setMyCases(data);
    const techs = await getTechnicians();
    setTechnicians(techs);
  };

  // Sync notes when selecting a case
  useEffect(() => {
      if (selectedCase) {
          setStudentNotes(selectedCase.studentNotes || '');
      }
  }, [selectedCase]);

  // --- IMAGE COMPRESSION UTILS ---
  const compressImage = async (file: File): Promise<File> => {
    // Si no es imagen o es muy pequeña, devolver original
    if (!file.type.startsWith('image/') || file.size < 300 * 1024) return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Max dimensions (HD 720p equivalent is usually enough for evidence)
            const MAX_WIDTH = 1280; 
            const MAX_HEIGHT = 1280;
            
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            
            ctx?.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(file); // Fallback
                    return;
                }
                const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve(compressedFile);
            }, 'image/jpeg', 0.7); // 70% Quality
        };
        
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      if (evidenceFiles.length + filesArray.length > 3) {
          alert("Para asegurar el rendimiento, máximo 3 archivos por reporte.");
          return;
      }

      setUploading(true);
      try {
        const processedFiles = await Promise.all(
            filesArray.map(async (f: File) => {
                if (f.size > 4.5 * 1024 * 1024) {
                    throw new Error(`El archivo ${f.name} es demasiado grande (Max 4.5MB)`);
                }
                return await compressImage(f);
            })
        );

        const uploaded = await Promise.all(processedFiles.map(f => uploadFile(f)));
        setEvidenceFiles(prev => [...prev, ...uploaded]);
      } catch (error: any) {
        console.error("Upload failed", error);
        alert(error.message || "Error al subir archivo. Verifica el tamaño.");
      } finally {
        setUploading(false);
        e.target.value = '';
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
      const sent = await sendVerificationCode(formData.contactEmail);
      if (sent) {
        setVerificationStep('code');
      } else {
        alert("Error al enviar el código. Verifica que el email sea correcto.");
      }
    } catch (error) {
      alert("Error de conexión.");
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
        alert("Código incorrecto o expirado.");
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
      alert("Hubo un error al enviar el reporte.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
      if (!selectedCase) return;
      setSavingNotes(true);
      try {
          await updateCaseStudentNotes(selectedCase.id, studentNotes);
          // Update local state
          const updated = {...selectedCase, studentNotes};
          setSelectedCase(updated);
          setMyCases(prev => prev.map(c => c.id === updated.id ? updated : c));
          alert("Tus notas han sido guardadas.");
      } catch (e) {
          alert("Error al guardar notas.");
      } finally {
          setSavingNotes(false);
      }
  };

  const getWhatsAppLink = (phone: string, caseId: string) => {
    const cleanPhone = phone.replace(/\D/g, ''); 
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
          Gracias por tu valentía. El administrador ha sido notificado.
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
            onClick={() => { setActiveTab('new'); setSelectedCase(null); }}
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
                    Tu reporte es seguro y confidencial.
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
                        className="w-full border-gray-300 border rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                        <input
                            type="date" required
                            className="w-full border-gray-300 border rounded-lg p-3 outline-none"
                            value={formData.dateOfIncident}
                            onChange={e => setFormData({...formData, dateOfIncident: e.target.value})}
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lugar *</label>
                        <input
                            type="text" required
                            className="w-full border-gray-300 border rounded-lg p-3 outline-none"
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
                                    type="email" required
                                    className="w-full border-gray-300 border rounded-lg p-2 text-sm outline-none"
                                    value={formData.contactEmail}
                                    onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono *</label>
                                <input
                                    type="tel" required
                                    className="w-full border-gray-300 border rounded-lg p-2 text-sm outline-none"
                                    value={formData.contactPhone}
                                    onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Personas involucradas</label>
                        <input
                        type="text"
                        className="w-full border-gray-300 border rounded-lg p-3 outline-none"
                        value={formData.involvedPeople}
                        onChange={e => setFormData({...formData, involvedPeople: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Evidencias</label>
                        <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition cursor-pointer relative ${uploading ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        {uploading ? (
                            <p className="text-sm text-brand-600 font-medium">Subiendo...</p>
                        ) : (
                            <>
                                <input type="file" multiple accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Toca para subir archivos</p>
                            </>
                        )}
                        </div>
                        {evidenceFiles.length > 0 && (
                        <div className="mt-4 grid grid-cols-4 gap-2">
                            {evidenceFiles.map((file, idx) => (
                            <div key={idx} className="bg-gray-100 border p-2 rounded text-xs truncate">{file.fileName}</div>
                            ))}
                        </div>
                        )}
                    </div>
                    <div className="pt-4">
                        <p className="text-xs text-center text-gray-400 mb-2">
                            Al enviar este reporte, aceptas nuestra <Link to="/privacy" target="_blank" className="underline hover:text-gray-600">política de privacidad</Link>.
                        </p>
                        <button type="submit" disabled={loading || uploading} className="w-full py-3 px-4 rounded-lg text-white font-medium bg-brand-600 hover:bg-brand-700 disabled:opacity-50">
                        {loading ? 'Procesando...' : 'Continuar a Verificación'}
                        </button>
                    </div>
                    </form>
                ) : (
                    <form onSubmit={handleFinalSubmit} className="p-8 text-center space-y-6">
                        <h3 className="text-xl font-bold">Verificación de Seguridad</h3>
                        <p className="text-gray-500">Código enviado a {formData.contactEmail}</p>
                        <input 
                            type="text" placeholder="000000"
                            className="w-48 text-center text-2xl tracking-widest border-2 rounded-lg p-2 outline-none"
                            maxLength={6}
                            value={userEnteredCode}
                            onChange={(e) => setUserEnteredCode(e.target.value)}
                        />
                        <div className="flex space-x-3 justify-center">
                            <button type="button" onClick={() => setVerificationStep('form')} className="px-6 py-2 border rounded-lg">Volver</button>
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-brand-600 text-white rounded-lg">Verificar</button>
                        </div>
                    </form>
                )}
            </div>
          </>
      ) : (
          <div className="space-y-4">
              {/* LIST VIEW vs DETAIL VIEW */}
              {!selectedCase ? (
                  myCases.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No has enviado ningún reporte todavía.</p>
                    </div>
                  ) : (
                    myCases.map(c => (
                        <div 
                            key={c.id} 
                            onClick={() => setSelectedCase(c)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition flex flex-col md:flex-row justify-between md:items-center gap-4"
                        >
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
                                <p className="font-medium text-gray-800 line-clamp-1">{c.description}</p>
                            </div>
                            <div className="text-sm text-brand-600 font-medium">Ver Detalles &rarr;</div>
                        </div>
                    ))
                  )
              ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                          <button onClick={() => setSelectedCase(null)} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                             &larr; Volver a la lista
                          </button>
                          <span className="text-sm text-gray-400">Caso #{selectedCase.id.substring(0,8)}</span>
                      </div>
                      <div className="p-6 space-y-6">
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-bold text-gray-800">Detalles del Caso</h2>
                                <span className={`px-3 py-1 rounded text-sm uppercase font-bold ${
                                    selectedCase.status === 'resuelto' ? 'bg-green-100 text-green-700' :
                                    selectedCase.status === 'revision' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {selectedCase.status}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-800 leading-relaxed">{selectedCase.description}</p>
                                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> {selectedCase.dateOfIncident}</span>
                                    <span className="flex items-center"><AlertTriangle className="w-4 h-4 mr-1"/> {selectedCase.location}</span>
                                    {selectedCase.involvedPeople && <span className="flex items-center"><UserIcon className="w-4 h-4 mr-1"/> {selectedCase.involvedPeople}</span>}
                                </div>
                            </div>

                            {/* Tech Contact */}
                            {selectedCase.assignedTechnicianId && (() => {
                                const tech = technicians.find(t => t.id === selectedCase.assignedTechnicianId);
                                if (tech && tech.phone) return (
                                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-green-800">Técnico Asignado: {tech.name}</p>
                                            <p className="text-xs text-green-600">Puedes contactar por WhatsApp para seguimiento.</p>
                                        </div>
                                        <a href={getWhatsAppLink(tech.phone, selectedCase.id)} target="_blank" className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700">
                                            <MessageCircle className="w-6 h-6"/>
                                        </a>
                                    </div>
                                );
                            })()}

                            {/* STUDENT NOTES SECTION */}
                            <div className="border-t pt-6">
                                <h3 className="font-bold text-gray-800 mb-2">Mis Notas / Ampliación</h3>
                                <p className="text-xs text-gray-500 mb-3">Si necesitas añadir información adicional o recordar detalles, escríbelos aquí. El técnico podrá verlos.</p>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="Escribe aquí notas adicionales..."
                                    value={studentNotes}
                                    onChange={(e) => setStudentNotes(e.target.value)}
                                />
                                <div className="mt-2 flex justify-end">
                                    <button 
                                        onClick={handleSaveNotes}
                                        disabled={savingNotes}
                                        className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                                    >
                                        {savingNotes ? 'Guardando...' : 'Guardar Notas'}
                                    </button>
                                </div>
                            </div>
                      </div>
                  </div>
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