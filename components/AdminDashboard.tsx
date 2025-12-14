import React, { useEffect, useState } from 'react';
import { getCases, updateCaseStatus, getTechnicians, createTechnician, assignCaseToTechnician, updateTechnician, deleteTechnician } from '../services/bkndService';
import { BullyingCase, CaseStatus, User } from '../types';
import { FileText, CheckCircle, AlertTriangle, Calendar, Filter, UserIcon, Users, UserPlus, Briefcase, Edit, Trash } from './Icons';

type Tab = 'cases' | 'technicians';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('cases');
  const [cases, setCases] = useState<BullyingCase[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Case State
  const [selectedCase, setSelectedCase] = useState<BullyingCase | null>(null);
  const [filter, setFilter] = useState<CaseStatus | 'all'>('all');

  // Technician Form State
  const [showTechForm, setShowTechForm] = useState(false);
  const [editingTechId, setEditingTechId] = useState<string | null>(null);
  const [techData, setTechData] = useState({ name: '', lastName: '', email: '', phone: '', center: '', password: '' });

  const fetchData = async () => {
    setLoading(true);
    const [casesData, techsData] = await Promise.all([getCases(), getTechnicians()]);
    
    casesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setCases(casesData);
    setTechnicians(techsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACTIONS ---

  const handleStatusUpdate = async (id: string, newStatus: CaseStatus) => {
    if (selectedCase && selectedCase.id === id) {
        setSelectedCase({...selectedCase, status: newStatus});
    }
    setCases(prev => prev.map(c => c.id === id ? {...c, status: newStatus} : c));
    try {
        await updateCaseStatus(id, newStatus);
    } catch (error) {
        alert("Error actualizando estado");
        fetchData();
    }
  };

  const handleAssignTechnician = async (caseId: string, techId: string) => {
      const technicianId = techId === '' ? null : techId;
      try {
          await assignCaseToTechnician(caseId, technicianId);
          // Actualizar estado local
          setCases(prev => prev.map(c => c.id === caseId ? {...c, assignedTechnicianId: technicianId} : c));
          if (selectedCase?.id === caseId) {
              setSelectedCase(prev => prev ? {...prev, assignedTechnicianId: technicianId} : null);
          }
      } catch (e) {
          alert("Error al asignar técnico");
      }
  };

  // --- TECHNICIAN MANAGEMENT ---

  const openNewTechForm = () => {
      setTechData({ name: '', lastName: '', email: '', phone: '', center: '', password: '' });
      setEditingTechId(null);
      setShowTechForm(true);
  };

  const openEditTechForm = (tech: User) => {
      setTechData({
          name: tech.name,
          lastName: tech.lastName || '',
          email: tech.email,
          phone: tech.phone || '',
          center: tech.center || '',
          password: '' // Don't fill password on edit for security
      });
      setEditingTechId(tech.id);
      setShowTechForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTechSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (editingTechId) {
              // Update
              await updateTechnician(editingTechId, techData);
              alert("Técnico actualizado correctamente");
          } else {
              // Create
              if (!techData.password) {
                  alert("La contraseña es obligatoria para nuevos usuarios");
                  return;
              }
              await createTechnician(techData);
              alert("Técnico creado correctamente");
          }
          
          // Refresh list and close form
          const updatedTechs = await getTechnicians();
          setTechnicians(updatedTechs);
          setShowTechForm(false);
          setTechData({ name: '', lastName: '', email: '', phone: '', center: '', password: '' });
      } catch (error: any) {
          alert(error.message || "Error guardando técnico");
      }
  };

  const handleDeleteTechnician = async (id: string) => {
      if (!window.confirm("¿Estás seguro de que quieres eliminar este técnico? Los casos asignados volverán a estar pendientes.")) {
          return;
      }
      try {
          await deleteTechnician(id);
          setTechnicians(prev => prev.filter(t => t.id !== id));
          // Refresh cases to show unassigned status immediately if needed, or update locally
          setCases(prev => prev.map(c => c.assignedTechnicianId === id ? {...c, assignedTechnicianId: null, status: 'pendiente'} : c));
      } catch (e) {
          alert("Error eliminando técnico");
      }
  };

  // --- HELPERS ---

  const filteredCases = filter === 'all' ? cases : cases.filter(c => c.status === filter);

  const getStatusColor = (status: CaseStatus) => {
    switch(status) {
        case 'pendiente': return 'bg-red-100 text-red-800';
        case 'revision': return 'bg-yellow-100 text-yellow-800';
        case 'resuelto': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: cases.length,
    pending: cases.filter(c => c.status === 'pendiente').length,
    resolved: cases.filter(c => c.status === 'resuelto').length,
    techs: technicians.length
  };

  return (
    <div className="space-y-6">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('cases')}>
          <p className="text-gray-500 text-xs uppercase font-semibold">Total Casos</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
          <p className="text-red-500 text-xs uppercase font-semibold">Pendientes</p>
          <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-green-500 text-xs uppercase font-semibold">Resueltos</p>
          <p className="text-2xl font-bold text-gray-800">{stats.resolved}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('technicians')}>
          <p className="text-blue-500 text-xs uppercase font-semibold">Técnicos</p>
          <p className="text-2xl font-bold text-gray-800">{stats.techs}</p>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('cases')}
            className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'cases' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500'}`}
          >
              <FileText className="w-4 h-4"/> <span>Gestión de Casos</span>
          </button>
          <button 
            onClick={() => setActiveTab('technicians')}
            className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'technicians' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500'}`}
          >
              <Users className="w-4 h-4"/> <span>Equipo Técnico</span>
          </button>
      </div>

      {activeTab === 'cases' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* List Column */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Casos</h3>
                <div className="relative">
                    <select 
                        className="text-sm border-gray-300 rounded-md p-1 pr-6 bg-white outline-none focus:ring-1 focus:ring-brand-500"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                    >
                        <option value="all">Todos</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="revision">En Revisión</option>
                        <option value="resuelto">Resueltos</option>
                    </select>
                </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {loading ? (
                    <div className="text-center p-4 text-gray-500">Cargando...</div>
                ) : filteredCases.length === 0 ? (
                    <div className="text-center p-8 text-gray-400">No hay casos.</div>
                ) : (
                    filteredCases.map(c => (
                        <div 
                            key={c.id}
                            onClick={() => setSelectedCase(c)}
                            className={`p-3 rounded-lg border cursor-pointer transition hover:shadow-md ${selectedCase?.id === c.id ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-gray-100 bg-white'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${getStatusColor(c.status)}`}>
                                    {c.status}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{c.description}</p>
                            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                <span className="flex items-center"><UserIcon className="w-3 h-3 mr-1" /> {c.contactEmail ? 'Contacto' : 'Anónimo'}</span>
                                {c.assignedTechnicianId && <span className="bg-blue-50 text-blue-600 px-1 rounded flex items-center"><Briefcase className="w-3 h-3 mr-1"/>Asignado</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>
            </div>

            {/* Detail Column */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 h-[600px] overflow-y-auto">
                {selectedCase ? (
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-4 mb-4 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-1">Caso #{selectedCase.id}</h2>
                                <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
                                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> {selectedCase.dateOfIncident}</span>
                                    <span className="flex items-center"><AlertTriangle className="w-4 h-4 mr-1"/> {selectedCase.location}</span>
                                </div>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                                {selectedCase.status !== 'resuelto' && (
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedCase.id, 'resuelto')}
                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 shadow-sm transition"
                                    >
                                        Marcar Resuelto
                                    </button>
                                )}
                                {selectedCase.status === 'pendiente' && (
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedCase.id, 'revision')}
                                        className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 shadow-sm transition"
                                    >
                                        Iniciar Revisión
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            
                            {/* Technician Assignment */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Briefcase className="w-5 h-5 text-gray-500 mr-2" />
                                        <h4 className="text-sm font-bold text-gray-700">Asignación de Técnico</h4>
                                    </div>
                                    <select 
                                        className="text-sm border-gray-300 border rounded-md p-2 w-64 focus:ring-brand-500 focus:border-brand-500"
                                        value={selectedCase.assignedTechnicianId || ""}
                                        onChange={(e) => handleAssignTechnician(selectedCase.id, e.target.value)}
                                    >
                                        <option value="">-- Sin Asignar --</option>
                                        {technicians.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} {t.lastName} ({t.center || 'Sin centro'})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Contact Info Section */}
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

                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Descripción</h4>
                                <p className="text-gray-800 bg-gray-50 p-4 rounded-lg leading-relaxed border border-gray-100">
                                    {selectedCase.description}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Implicados</h4>
                                <p className="text-gray-800">{selectedCase.involvedPeople || "No especificado"}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Evidencias Adjuntas</h4>
                                {selectedCase.evidence && selectedCase.evidence.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {selectedCase.evidence.map((ev, idx) => (
                                            <div key={idx} className="border rounded-lg p-2 bg-gray-50 hover:bg-gray-100 transition">
                                                {ev.fileType.includes('image') ? (
                                                    <img src={ev.url} alt="evidencia" className="rounded w-full h-32 object-cover mb-2"/>
                                                ) : (
                                                    <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded mb-2">
                                                        <FileText className="text-gray-400" />
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-500 truncate font-medium">{ev.fileName}</p>
                                                <a href={ev.url} download={ev.fileName} className="text-xs text-brand-600 hover:underline block mt-1">Descargar</a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic text-sm border-l-2 border-gray-300 pl-3">Sin evidencias adjuntas.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50">
                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                            <FileText className="w-12 h-12 text-gray-300" />
                        </div>
                        <p className="font-medium">Selecciona un caso para ver los detalles</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {activeTab === 'technicians' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">Listado de Técnicos</h3>
                  <button 
                    onClick={openNewTechForm}
                    className="flex items-center space-x-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition"
                  >
                      <UserPlus className="w-5 h-5" /> <span>Alta Técnico</span>
                  </button>
              </div>

              {showTechForm && (
                  <div className="p-6 bg-gray-50 border-b animate-fade-in">
                      <form onSubmit={handleTechSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                          <h4 className="md:col-span-2 font-semibold text-gray-700 mb-2">
                              {editingTechId ? 'Editar Técnico' : 'Nuevo Técnico'}
                          </h4>
                          
                          <input 
                            required
                            placeholder="Nombre"
                            className="p-2 border rounded"
                            value={techData.name}
                            onChange={e => setTechData({...techData, name: e.target.value})}
                          />
                          <input 
                            placeholder="Apellidos"
                            className="p-2 border rounded"
                            value={techData.lastName}
                            onChange={e => setTechData({...techData, lastName: e.target.value})}
                          />
                          <input 
                            required
                            type="email"
                            placeholder="Email (Obligatorio)"
                            className="p-2 border rounded"
                            value={techData.email}
                            onChange={e => setTechData({...techData, email: e.target.value})}
                          />
                          <input 
                            placeholder="Teléfono"
                            className="p-2 border rounded"
                            value={techData.phone}
                            onChange={e => setTechData({...techData, phone: e.target.value})}
                          />
                          <input 
                            placeholder="Centro"
                            className="p-2 border rounded"
                            value={techData.center}
                            onChange={e => setTechData({...techData, center: e.target.value})}
                          />
                           <div className="md:col-span-2">
                                <label className="text-xs text-gray-500 mb-1 block">
                                    {editingTechId ? 'Contraseña (Dejar en blanco para no cambiar)' : 'Contraseña *'}
                                </label>
                                <input 
                                    type="password"
                                    required={!editingTechId}
                                    placeholder={editingTechId ? "••••••••" : "Contraseña segura"}
                                    className="p-2 border rounded w-full"
                                    value={techData.password}
                                    onChange={e => setTechData({...techData, password: e.target.value})}
                                />
                          </div>

                          <div className="md:col-span-2 flex justify-end space-x-2 mt-2">
                              <button type="button" onClick={() => setShowTechForm(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-200 rounded">Cancelar</button>
                              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700">
                                  {editingTechId ? 'Actualizar' : 'Guardar'}
                              </button>
                          </div>
                      </form>
                  </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">Contacto</th>
                            <th className="px-6 py-3">Centro</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {technicians.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No hay técnicos registrados.</td>
                            </tr>
                        ) : (
                            technicians.map(t => {
                                const activeCases = cases.filter(c => c.assignedTechnicianId === t.id && c.status !== 'resuelto').length;
                                const totalCases = cases.filter(c => c.assignedTechnicianId === t.id).length;
                                return (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{t.name} {t.lastName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>{t.email}</div>
                                            <div className="text-xs text-gray-500">{t.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{t.center || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {activeCases} Activos / {totalCases} Totales
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button 
                                                    onClick={() => openEditTechForm(t)}
                                                    className="p-1 text-gray-400 hover:text-brand-600 transition"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteTechnician(t.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition"
                                                    title="Eliminar"
                                                >
                                                    <Trash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
              </div>
          </div>
      )}

    </div>
  );
};

export default AdminDashboard;