import React, { useState, useEffect } from 'react';
import { createCase, uploadFile, getCasesByStudent, sendVerificationCode, verifyOTP, getTechnicians, updateCaseStudentNotes, updateUserProfile, updateCaseFullDetails, getCaseLogs } from '../services/bkndService';
import { Upload, CheckCircle, AlertTriangle, FileText, Calendar, MessageCircle, UserIcon, Edit } from './Icons';
import { User, Evidence, BullyingCase, CaseLog } from '../types';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

interface Props {
  user: User;
}

const StudentDashboard: React.FC<Props> = ({ user }) => {
  const { t } = useLanguage();
  // State for Tabs
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'profile'>('new');
  
  // State for New Case
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<Evidence[]>([]);
  const [verificationStep, setVerificationStep] = useState<'form' | 'code'>('form');
  const [userEnteredCode, setUserEnteredCode] = useState('');

  // State for History
  const [myCases, setMyCases] = useState<BullyingCase[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [selectedCase, setSelectedCase] = useState<BullyingCase | null>(null);
  
  // State for Case Editing & Logs (Traceability)
  const [isEditingCase, setIsEditingCase] = useState(false);
  const [editCaseForm, setEditCaseForm] = useState<Partial<BullyingCase>>({});
  const [logs, setLogs] = useState<CaseLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // State for Student Notes
  const [studentNotes, setStudentNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // State for Profile Edit
  const [profileData, setProfileData] = useState({ 
      name: user.name, 
      lastName: user.lastName || '', 
      phone: user.phone || '', 
      password: '' 
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    dateOfIncident: new Date().toISOString().split('T')[0],
    location: '',
    involvedPeople: '',
    contactEmail: user.email || '',
    contactPhone: ''
  });

  // Fetch Cases when History tab is active
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, user.id]);

  // Fetch Logs when a case is selected
  useEffect(() => {
      if (selectedCase) {
          setStudentNotes(selectedCase.studentNotes || '');
          setLoadingLogs(true);
          getCaseLogs(selectedCase.id).then(data => {
              setLogs(data);
              setLoadingLogs(false);
          });
      }
  }, [selectedCase]);

  // Sync profile data when user changes
  useEffect(() => {
      setProfileData({ 
        name: user.name, 
        lastName: user.lastName || '', 
        phone: user.phone || '', 
        password: '' 
      });
  }, [user]);

  const fetchHistory = async () => {
    const data = await getCasesByStudent(user.id);
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setMyCases(data);
    const techs = await getTechnicians();
    setTechnicians(techs);
  };

  // --- IMAGE COMPRESSION UTILS ---
  const compressImage = async (file: File): Promise<File> => {
    // Si no es imagen o es un GIF (que no queremos estropear la animación), devolvemos el original
    if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target?.result as string; };
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
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
            
            // Comprimimos a JPEG con calidad 0.6 (balance ideal peso/calidad)
            canvas.toBlob((blob) => {
                if (!blob) { resolve(file); return; }
                resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg', lastModified: Date.now() }));
            }, 'image/jpeg', 0.6);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      if (evidenceFiles.length + filesArray.length > 3) { 
          alert("Máximo 3 archivos permitidos."); 
          return; 
      }
      
      setUploading(true);
      try {
        const processedFiles = await Promise.all(
            filesArray.map(async (f: File) => {
                // Comprimimos si es imagen
                const compressed = await compressImage(f);
                
                // Verificamos tamaño post-compresión (Límite final de 4MB por archivo para el servidor)
                if (compressed.size > 4 * 1024 * 1024) {
                    throw new Error(`El archivo ${f.name} sigue siendo demasiado grande incluso tras comprimirlo.`);
                }
                return compressed;
            })
        );
        
        const uploaded = await Promise.all(processedFiles.map(f => uploadFile(f)));
        setEvidenceFiles(prev => [...prev, ...uploaded]);
      } catch (error: any) { 
          alert(error.message || "Error al procesar los archivos."); 
      } finally { 
          setUploading(false); 
          e.target.value = ''; 
      }
    }
  };

  const initiateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.location || !formData.contactEmail || !formData.contactPhone) {
        alert("Rellena los campos obligatorios."); return;
    }
    setLoading(true);
    try {
      const sent = await sendVerificationCode(formData.contactEmail);
      if (sent) setVerificationStep('code');
      else alert("Error al enviar código. Revisa tu email.");
    } catch (error) { alert("Error de conexión."); } finally { setLoading(false); }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isValid = await verifyOTP(formData.contactEmail, userEnteredCode);
      if (!isValid) { alert("Código incorrecto."); setLoading(false); return; }
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
    } catch (error) { alert("Hubo un error al enviar el reporte."); } finally { setLoading(false); }
  };

  // --- CASE EDITING & NOTES ---

  const handleSaveNotes = async () => {
      if (!selectedCase) return;
      setSavingNotes(true);
      try {
          await updateCaseStudentNotes(selectedCase.id, studentNotes);
          const updated = {...selectedCase, studentNotes};
          setSelectedCase(updated);
          setMyCases(prev => prev.map(c => c.id === updated.id ? updated : c));
          alert("Notas guardadas.");
      } catch (e) { alert("Error al guardar notas."); } finally { setSavingNotes(false); }
  };

  const startEditingCase = () => {
    if (!selectedCase) return;
    setEditCaseForm({
        description: selectedCase.description,
        location: selectedCase.location,
        dateOfIncident: selectedCase.dateOfIncident,
        involvedPeople: selectedCase.involvedPeople,
        contactPhone: selectedCase.contactPhone
    });
    setIsEditingCase(true);
  };

  const saveCaseEdits = async () => {
    if (!selectedCase) return;
    try {
        const modifier = `Estudiante: ${user.name}`;
        await updateCaseFullDetails(selectedCase.id, editCaseForm, modifier);
        
        // Update local
        const updatedCase = { ...selectedCase, ...editCaseForm };
        setSelectedCase(updatedCase);
        setMyCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
        
        // Refresh logs
        const newLogs = await getCaseLogs(updatedCase.id);
        setLogs(newLogs);

        setIsEditingCase(false);
        alert("Reporte actualizado correctamente.");
    } catch (e) {
        alert("Error al actualizar reporte.");
    }
  };

  // --- PROFILE UPDATE ---

  const handleProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setSavingProfile(true);
      try {
          await updateUserProfile(user.id, profileData);
          alert("Perfil actualizado correctamente.");
          setProfileData(prev => ({...prev, password: ''})); // Clear pass field
      } catch (e: any) {
          alert(e.message || "Error al actualizar perfil.");
      } finally {
          setSavingProfile(false);
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('reportSuccess')}</h2>
        <p className="text-gray-600 mb-6">{t('reportSuccessMsg')}</p>
        <button 
          onClick={() => {
            setSuccess(false);
            setFormData({ description: '', dateOfIncident: new Date().toISOString().split('T')[0], location: '', involvedPeople: '', contactEmail: user.email || '', contactPhone: '' });
            setEvidenceFiles([]);
            setActiveTab('history');
          }}
          className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition"
        >
          {t('myReports')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto tabs-nav">
        <button onClick={() => { setActiveTab('new'); setSelectedCase(null); }} className={`py-2 px-4 whitespace-nowrap font-medium text-sm focus:outline-none ${activeTab === 'new' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}>{t('newReport')}</button>
        <button onClick={() => setActiveTab('history')} className={`py-2 px-4 whitespace-nowrap font-medium text-sm focus:outline-none ${activeTab === 'history' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}>{t('myReports')}</button>
        <button onClick={() => { setActiveTab('profile'); setSelectedCase(null); }} className={`py-2 px-4 whitespace-nowrap font-medium text-sm focus:outline-none ${activeTab === 'profile' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}>{t('myProfile')}</button>
      </div>

      {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <UserIcon className="w-6 h-6 mr-2 text-brand-600" /> {t('myProfile')}
              </h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
                          <input required type="text" className="w-full border rounded p-2" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                          <input type="text" className="w-full border rounded p-2" value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} />
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
                      <input type="tel" className="w-full border rounded p-2" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña (Opcional)</label>
                      <input type="password" placeholder="Dejar en blanco para no cambiar" className="w-full border rounded p-2" value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} />
                  </div>
                  <div className="pt-2">
                      <button type="submit" disabled={savingProfile} className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50">
                          {savingProfile ? 'Guardando...' : 'Actualizar Perfil'}
                      </button>
                  </div>
              </form>
          </div>
      )}

      {activeTab === 'new' && (
          <>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                <div className="flex">
                <div className="flex-shrink-0"><AlertTriangle className="h-5 w-5 text-yellow-400" /></div>
                <div className="ml-3"><p className="text-sm text-yellow-700">Tu reporte es seguro y confidencial.</p></div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-brand-600 px-6 py-4"><h2 className="text-xl font-bold text-white">{t('incidentDetails')}</h2></div>
                
                {verificationStep === 'form' ? (
                    <form onSubmit={initiateVerification} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('whatHappened')} *</label>
                        <textarea required rows={4} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('date')} *</label><input type="date" required className="w-full border rounded-lg p-3 outline-none" value={formData.dateOfIncident} onChange={e => setFormData({...formData, dateOfIncident: e.target.value})}/></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('location')} *</label><input type="text" required className="w-full border rounded-lg p-3 outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}/></div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">{t('contactPrivate')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-xs font-medium text-gray-500 mb-1">{t('email')} *</label><input type="email" required className="w-full border rounded-lg p-2 text-sm" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})}/></div>
                            <div><label className="block text-xs font-medium text-gray-500 mb-1">{t('phone')} *</label><input type="tel" required className="w-full border rounded-lg p-2 text-sm" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})}/></div>
                        </div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('involved')}</label><input type="text" className="w-full border rounded-lg p-3 outline-none" value={formData.involvedPeople} onChange={e => setFormData({...formData, involvedPeople: e.target.value})}/></div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('evidence')}</label>
                        <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer relative ${uploading ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        {uploading ? <p className="text-sm text-brand-600 font-medium italic">Procesando y optimizando archivos...</p> : <><input type="file" multiple accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} /><Upload className="w-8 h-8 text-gray-400 mb-2" /><p className="text-sm text-gray-500">{t('uploadHint')}</p></>}
                        </div>
                        {evidenceFiles.length > 0 && <div className="mt-4 grid grid-cols-4 gap-2">{evidenceFiles.map((file, idx) => <div key={idx} className="bg-gray-100 border p-2 rounded text-xs truncate">{file.fileName}</div>)}</div>}
                    </div>
                    <div className="pt-4"><button type="submit" disabled={loading || uploading} className="w-full py-3 px-4 rounded-lg text-white font-medium bg-brand-600 hover:bg-brand-700 disabled:opacity-50">{loading ? 'Procesando...' : 'Continuar a Verificación'}</button></div>
                    </form>
                ) : (
                    <form onSubmit={handleFinalSubmit} className="p-8 text-center space-y-6">
                        <h3 className="text-xl font-bold">{t('verifyStep')}</h3>
                        <p className="text-gray-500">{t('verifySent')} {formData.contactEmail}</p>
                        <input type="text" placeholder="000000" className="w-48 text-center text-2xl tracking-widest border-2 rounded-lg p-2 outline-none" maxLength={6} value={userEnteredCode} onChange={(e) => setUserEnteredCode(e.target.value)}/>
                        <div className="flex space-x-3 justify-center"><button type="button" onClick={() => setVerificationStep('form')} className="px-6 py-2 border rounded-lg">Volver</button><button type="submit" disabled={loading} className="px-6 py-2 bg-brand-600 text-white rounded-lg">{t('verifyBtn')}</button></div>
                    </form>
                )}
            </div>
          </>
      )}

      {activeTab === 'history' && (
          <div className="space-y-4">
              {!selectedCase ? (
                  myCases.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No has enviado ningún reporte todavía.</p>
                    </div>
                  ) : (
                    myCases.map(c => (
                        <div key={c.id} onClick={() => { setSelectedCase(c); setIsEditingCase(false); }} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${c.status === 'resuelto' ? 'bg-green-100 text-green-700' : c.status === 'revision' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{t(`status_${c.status}` as any)}</span>
                                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
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
                          <button onClick={() => setSelectedCase(null)} className="text-sm text-gray-500 hover:text-gray-700 font-medium">&larr; Volver a la lista</button>
                          
                          <div className="flex items-center space-x-3">
                             <span className="text-sm text-gray-400">#{selectedCase.id.substring(0,8)}</span>
                             {!isEditingCase ? (
                                 <button onClick={startEditingCase} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 flex items-center">
                                     <Edit className="w-3 h-3 mr-1" /> Editar Reporte
                                 </button>
                             ) : (
                                 <div className="flex space-x-2">
                                     <button onClick={() => setIsEditingCase(false)} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Cancelar</button>
                                     <button onClick={saveCaseEdits} className="px-2 py-1 bg-brand-600 text-white text-xs rounded">Guardar</button>
                                 </div>
                             )}
                          </div>
                      </div>

                      <div className="p-6 space-y-6">
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-bold text-gray-800">{t('incidentDetails')}</h2>
                                <span className={`px-3 py-1 rounded text-sm uppercase font-bold ${selectedCase.status === 'resuelto' ? 'bg-green-100 text-green-700' : selectedCase.status === 'revision' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{t(`status_${selectedCase.status}` as any)}</span>
                            </div>

                            {isEditingCase ? (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                                    <h3 className="font-bold text-blue-800 text-sm">Editar Información</h3>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">{t('whatHappened')}</label>
                                        <textarea className="w-full p-2 border rounded h-24" value={editCaseForm.description || ''} onChange={e => setEditCaseForm({...editCaseForm, description: e.target.value})}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-gray-500">{t('date')}</label><input type="date" className="w-full p-2 border rounded" value={editCaseForm.dateOfIncident || ''} onChange={e => setEditCaseForm({...editCaseForm, dateOfIncident: e.target.value})}/></div>
                                        <div><label className="text-xs font-bold text-gray-500">{t('location')}</label><input className="w-full p-2 border rounded" value={editCaseForm.location || ''} onChange={e => setEditCaseForm({...editCaseForm, location: e.target.value})}/></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-gray-500">{t('involved')}</label><input className="w-full p-2 border rounded" value={editCaseForm.involvedPeople || ''} onChange={e => setEditCaseForm({...editCaseForm, involvedPeople: e.target.value})}/></div>
                                        <div><label className="text-xs font-bold text-gray-500">{t('phone')}</label><input className="w-full p-2 border rounded" value={editCaseForm.contactPhone || ''} onChange={e => setEditCaseForm({...editCaseForm, contactPhone: e.target.value})}/></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-800 leading-relaxed">{selectedCase.description}</p>
                                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> {selectedCase.dateOfIncident}</span>
                                        <span className="flex items-center"><AlertTriangle className="w-4 h-4 mr-1"/> {selectedCase.location}</span>
                                        {selectedCase.involvedPeople && <span className="flex items-center"><UserIcon className="w-4 h-4 mr-1"/> {selectedCase.involvedPeople}</span>}
                                    </div>
                                </div>
                            )}

                            {/* Tech Contact */}
                            {selectedCase.assignedTechnicianId && (() => {
                                const tech = technicians.find(t => t.id === selectedCase.assignedTechnicianId);
                                if (tech && tech.phone) return (
                                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-green-800">Técnico Asignado: {tech.name}</p>
                                            <p className="text-xs text-green-600">Puedes contactar por WhatsApp para seguimiento.</p>
                                        </div>
                                        <a href={getWhatsAppLink(tech.phone, selectedCase.id)} target="_blank" className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"><MessageCircle className="w-6 h-6"/></a>
                                    </div>
                                );
                            })()}

                            {/* STUDENT NOTES */}
                            <div className="border-t pt-6">
                                <h3 className="font-bold text-gray-800 mb-2">Mis Notas / Ampliación</h3>
                                <p className="text-xs text-gray-500 mb-3">Notas visibles para el técnico.</p>
                                <textarea className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Añade información adicional..." value={studentNotes} onChange={(e) => setStudentNotes(e.target.value)} />
                                <div className="mt-2 flex justify-end"><button onClick={handleSaveNotes} disabled={savingNotes} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50">{savingNotes ? 'Guardando...' : 'Guardar Notas'}</button></div>
                            </div>

                            {/* AUDIT LOG (Traceability) */}
                            <div className="border-t border-gray-200 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t('auditTitle')}</h4>
                                <div className="space-y-3">
                                    {loadingLogs ? <p className="text-xs text-gray-400">Cargando...</p> : 
                                     logs.length === 0 ? <p className="text-xs text-gray-400 italic">No hay modificaciones registradas.</p> : 
                                     logs.map(log => (
                                         <div key={log.id} className="text-xs flex items-start space-x-2 p-2 bg-gray-50 rounded">
                                             <div className="text-gray-400 min-w-[110px]">{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                             <div>
                                                 <span className="font-bold text-gray-700">{log.changedBy}</span> cambió <span className="font-medium text-brand-600">{log.field}</span>.
                                                 {log.oldValue && log.newValue && <div className="mt-1 text-gray-500 pl-2 border-l-2 border-gray-300"><span className="line-through opacity-70 block truncate max-w-xs">{log.oldValue}</span><span className="block text-green-700">{log.newValue}</span></div>}
                                             </div>
                                         </div>
                                     ))
                                    }
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

export default StudentDashboard;