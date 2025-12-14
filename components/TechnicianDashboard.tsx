import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import { getCases, updateCaseStatus, assignCaseToTechnician, updateCaseFullDetails, getCaseLogs } from '../services/bkndService';
import { BullyingCase, CaseStatus, User, CaseLog } from '../types';
import { FileText, Calendar, AlertTriangle, UserIcon, Briefcase, Edit } from './Icons';

// Definir helper para llamada API directa de actualización de acciones
const updateTechnicianActions = async (id: string, content: string) => {
    const res = await fetch('/api/cases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, technicianActions: content })
    });
    if (!res.ok) throw new Error("Error guardando acciones");
};

interface Props {
  user: User;
}

const TechnicianDashboard: React.FC<Props> = ({ user }) => {
  const [cases, setCases] = useState<BullyingCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<BullyingCase | null>(null);
  const [viewMode, setViewMode] = useState<'mine' | 'unassigned'>('mine');
  
  // Edit & Logs State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<BullyingCase>>({});
  const [logs, setLogs] = useState<CaseLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // State for WYSIWYG
  const [actionsContent, setActionsContent] = useState('');
  const [savingActions, setSavingActions] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
        const data = await getCases();
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCases(data);
    } catch (e) {
        console.error("Error fetching cases", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []); 

  // Sync editor content and fetch logs when selected case changes
  useEffect(() => {
      if (selectedCase) {
          setActionsContent(selectedCase.technicianActions || '');
          setLoadingLogs(true);
          getCaseLogs(selectedCase.id).then(data => {
              setLogs(data);
              setLoadingLogs(false);
          });
      }
  }, [selectedCase]);

  const handleStatusUpdate = async (id: string, newStatus: CaseStatus) => {
    if (selectedCase && selectedCase.id === id) {
        setSelectedCase({...selectedCase, status: newStatus});
    }
    setCases(prev => prev.map(c => c.id === id ? {...c, status: newStatus} : c));

    try {
        const modifier = `${user.name} (Técnico)`;
        await updateCaseStatus(id, newStatus, undefined, modifier);
    } catch (error) {
        alert("Error actualizando estado");
        fetchCases();
    }
  };

  const handleSelfAssign = async (id: string) => {
      try {
          await assignCaseToTechnician(id, user.id);
          setCases(prev => prev.map(c => c.id === id ? {...c, assignedTechnicianId: user.id, status: 'revision'} : c));
          if (selectedCase?.id === id) {
             setSelectedCase({...selectedCase, assignedTechnicianId: user.id, status: 'revision'});
          }
          alert("Caso asignado correctamente.");
          setViewMode('mine');
      } catch (e) {
          alert("Error al asignarse el caso");
      }
  };

  const handleSaveActions = async () => {
      if (!selectedCase) return;
      setSavingActions(true);
      try {
          await updateTechnicianActions(selectedCase.id, actionsContent);
          setCases(prev => prev.map(c => c.id === selectedCase.id ? {...c, technicianActions: actionsContent} : c));
          setSelectedCase({...selectedCase, technicianActions: actionsContent});
          alert("Acciones guardadas correctamente.");
      } catch (e) {
          alert("Error al guardar las acciones.");
      } finally {
          setSavingActions(false);
      }
  };

  const startEditing = () => {
    if (!selectedCase) return;
    setEditFormData({
        description: selectedCase.description,
        location: selectedCase.location,
        dateOfIncident: selectedCase.dateOfIncident,
        involvedPeople: selectedCase.involvedPeople,
        contactEmail: selectedCase.contactEmail,
        contactPhone: selectedCase.contactPhone
    });
    setIsEditing(true);
  };

  const saveEdits = async () => {
    if (!selectedCase) return;
    try {
        const modifier = `${user.name} (Técnico)`;
        await updateCaseFullDetails(selectedCase.id, editFormData, modifier);
        
        // Update local
        const updatedCase = { ...selectedCase, ...editFormData };
        setSelectedCase(updatedCase);
        setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
        
        // Refresh logs
        const newLogs = await getCaseLogs(updatedCase.id);
        setLogs(newLogs);

        setIsEditing(false);
        alert("Datos del caso actualizados.");
    } catch (e) {
        alert("Error al actualizar datos.");
    }
  };

  const getStatusColor = (status: CaseStatus) => {
    switch(status) {
        case 'pendiente': return 'bg-red-100 text-red-800';
        case 'revision': return 'bg-yellow-100 text-yellow-800';
        case 'resuelto': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const myCases = cases.filter(c => c.assignedTechnicianId === user.id);
  const unassignedCases = cases.filter(c => !c.assignedTechnicianId);
  const displayedCases = viewMode === 'mine' ? myCases : unassignedCases;

  const stats = {
    totalAssigned: myCases.length,
    active: myCases.filter(c => c.status !== 'resuelto').length,
    available: unassignedCases.length
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  return (
    <div className="space-y-6">
      
      {/* Technician Header & Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Panel del Técnico</h2>
        <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition" onClick={() => setViewMode('mine')}>
                <span className="block text-2xl font-bold text-blue-600">{stats.totalAssigned}</span>
                <span className="text-xs text-blue-500 uppercase font-semibold">Mis Casos</span>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition" onClick={() => setViewMode('unassigned')}>
                <span className="block text-2xl font-bold text-gray-600">{stats.available}</span>
                <span className="text-xs text-gray-500 uppercase font-semibold">Disponibles</span>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
                <span className="block text-2xl font-bold text-green-600">{myCases.filter(c => c.status === 'resuelto').length}</span>
                <span className="text-xs text-green-500 uppercase font-semibold">Resueltos (Míos)</span>
            </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
          <button 
            onClick={() => { setViewMode('mine'); setSelectedCase(null); }}
            className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 outline-none ${viewMode === 'mine' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <UserIcon className="w-4 h-4"/> <span>Mis Casos</span>
          </button>
          <button 
            onClick={() => { setViewMode('unassigned'); setSelectedCase(null); }}
            className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 outline-none ${viewMode === 'unassigned' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <Briefcase className="w-4 h-4"/> <span>Bolsa de Casos ({stats.available})</span>
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[750px]">
        
        {/* List Column */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">
                {viewMode === 'mine' ? 'Mis Asignaciones' : 'Casos Sin Asignar'}
            </h3>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {loading ? (
                <div className="text-center p-4 text-gray-500">Cargando...</div>
            ) : displayedCases.length === 0 ? (
                <div className="text-center p-8 text-gray-400">
                    <p>{viewMode === 'mine' ? 'No tienes casos asignados.' : 'No hay casos pendientes de asignación.'}</p>
                </div>
            ) : (
                displayedCases.map(c => (
                    <div 
                        key={c.id}
                        onClick={() => { setSelectedCase(c); setIsEditing(false); }}
                        className={`p-3 rounded-lg border cursor-pointer transition hover:shadow-md ${selectedCase?.id === c.id ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-gray-100 bg-white'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${getStatusColor(c.status)}`}>
                                {c.status}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{c.description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                           <AlertTriangle className="w-3 h-3 mr-1" />
                           {c.location}
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Detail Column */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 h-full overflow-y-auto">
            {selectedCase ? (
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-4 mb-4 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">Caso #{selectedCase.id}</h2>
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1"/> {selectedCase.dateOfIncident}
                            </div>
                        </div>
                        <div className="flex space-x-2 shrink-0">
                            {viewMode === 'unassigned' ? (
                                <button 
                                    onClick={() => handleSelfAssign(selectedCase.id)}
                                    className="px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded hover:bg-brand-700 shadow-sm transition flex items-center"
                                >
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    Asignarme este Caso
                                </button>
                            ) : (
                                <>
                                    {isEditing ? (
                                        <>
                                            <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400">Cancelar</button>
                                            <button onClick={saveEdits} className="px-3 py-1 bg-brand-600 text-white text-sm rounded hover:bg-brand-700">Guardar</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={startEditing} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition flex items-center">
                                                <Edit className="w-4 h-4 mr-1" /> Editar
                                            </button>
                                            {selectedCase.status === 'resuelto' ? (
                                                <button 
                                                    onClick={() => handleStatusUpdate(selectedCase.id, 'revision')}
                                                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 shadow-sm transition"
                                                >
                                                    Reabrir Caso
                                                </button>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(selectedCase.id, 'resuelto')}
                                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 shadow-sm transition"
                                                    >
                                                        Marcar Resuelto
                                                    </button>
                                                    {selectedCase.status !== 'revision' && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(selectedCase.id, 'revision')}
                                                            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 shadow-sm transition"
                                                        >
                                                            En Proceso
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                         
                        {isEditing ? (
                                <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="font-bold text-blue-800">Modificando Información</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Fecha</label>
                                            <input type="date" className="w-full p-2 border rounded" value={editFormData.dateOfIncident || ''} onChange={e => setEditFormData({...editFormData, dateOfIncident: e.target.value})}/>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Ubicación</label>
                                            <input className="w-full p-2 border rounded" value={editFormData.location || ''} onChange={e => setEditFormData({...editFormData, location: e.target.value})}/>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Email Contacto</label>
                                            <input className="w-full p-2 border rounded" value={editFormData.contactEmail || ''} onChange={e => setEditFormData({...editFormData, contactEmail: e.target.value})}/>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Teléfono Contacto</label>
                                            <input className="w-full p-2 border rounded" value={editFormData.contactPhone || ''} onChange={e => setEditFormData({...editFormData, contactPhone: e.target.value})}/>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-gray-500">Descripción</label>
                                            <textarea className="w-full p-2 border rounded h-24" value={editFormData.description || ''} onChange={e => setEditFormData({...editFormData, description: e.target.value})}/>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-gray-500">Implicados</label>
                                            <input className="w-full p-2 border rounded" value={editFormData.involvedPeople || ''} onChange={e => setEditFormData({...editFormData, involvedPeople: e.target.value})}/>
                                        </div>
                                    </div>
                                </div>
                        ) : (
                            <>
                                {/* Contact Info */}
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center">
                                        <UserIcon className="w-4 h-4 mr-2" /> Datos del Estudiante
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-blue-500 block text-xs uppercase">Email</span>
                                            <span className="text-gray-800 font-medium">{selectedCase.contactEmail || "No proporcionado"}</span>
                                        </div>
                                        <div>
                                            <span className="text-blue-500 block text-xs uppercase">Teléfono</span>
                                            <span className="text-gray-800 font-medium">{selectedCase.contactPhone || "No proporcionado"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Descripción</h4>
                                        <p className="text-gray-800 bg-gray-50 p-4 rounded-lg leading-relaxed border border-gray-100 h-40 overflow-y-auto">
                                            {selectedCase.description}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Detalles</h4>
                                        <div className="space-y-2">
                                            <div className="p-2 bg-gray-50 rounded border border-gray-100">
                                                <span className="block text-xs text-gray-500 uppercase">Ubicación</span>
                                                <span className="font-medium text-gray-800">{selectedCase.location}</span>
                                            </div>
                                            <div className="p-2 bg-gray-50 rounded border border-gray-100">
                                                <span className="block text-xs text-gray-500 uppercase">Implicados</span>
                                                <span className="font-medium text-gray-800">{selectedCase.involvedPeople || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                         {/* NOTAS DEL ESTUDIANTE (NUEVO) */}
                         {selectedCase.studentNotes && (
                             <div>
                                <h4 className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2">Notas del Estudiante</h4>
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-gray-800 italic">
                                    "{selectedCase.studentNotes}"
                                </div>
                             </div>
                         )}

                        {selectedCase.evidence && selectedCase.evidence.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Evidencias</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {selectedCase.evidence.map((ev, idx) => (
                                        <div key={idx} className="border rounded-lg p-2 bg-gray-50 hover:bg-gray-100 transition">
                                            <a href={ev.url} download={ev.fileName} className="block text-xs text-brand-600 hover:underline truncate text-center">
                                                {ev.fileName}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-6">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                    Registro de Acciones Realizadas
                                </h4>
                                {viewMode === 'mine' && (
                                    <button 
                                        onClick={handleSaveActions}
                                        disabled={savingActions}
                                        className="bg-brand-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition"
                                    >
                                        {savingActions ? 'Guardando...' : 'Guardar Acciones'}
                                    </button>
                                )}
                            </div>
                            
                            {viewMode === 'mine' ? (
                                <div className="bg-white">
                                    <ReactQuill 
                                        theme="snow"
                                        value={actionsContent}
                                        onChange={setActionsContent}
                                        modules={modules}
                                        className="h-40 mb-10" 
                                    />
                                    <p className="text-xs text-gray-400 mt-2">Registra aquí las llamadas, reuniones o medidas disciplinarias tomadas.</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded border border-gray-200 min-h-[100px] text-gray-600">
                                    {selectedCase.technicianActions ? (
                                        <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: selectedCase.technicianActions }} />
                                    ) : (
                                        <em className="text-gray-400">Sin acciones registradas aún.</em>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* AUDIT LOG SECTION */}
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                                Historial de Cambios (Trazabilidad)
                            </h4>
                            <div className="space-y-3">
                                {loadingLogs ? <p className="text-xs text-gray-400">Cargando historial...</p> : 
                                    logs.length === 0 ? <p className="text-xs text-gray-400 italic">No hay modificaciones registradas.</p> : 
                                    logs.map(log => (
                                        <div key={log.id} className="text-xs flex items-start space-x-2 p-2 bg-gray-50 rounded hover:bg-gray-100">
                                            <div className="text-gray-400 min-w-[120px]">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-700">{log.changedBy}</span> modificó <span className="font-medium text-brand-600">{log.field}</span>.
                                                {log.oldValue && log.newValue && (
                                                    <div className="mt-1 text-gray-500 pl-2 border-l-2 border-gray-300">
                                                        <span className="line-through opacity-70 block truncate max-w-xs">{log.oldValue}</span>
                                                        <span className="block text-green-700">{log.newValue}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50">
                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                        <FileText className="w-12 h-12 text-gray-300" />
                    </div>
                    <p className="font-medium">Selecciona un caso para gestionar</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;