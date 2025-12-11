import React, { useEffect, useState } from 'react';
import { getCases, updateCaseStatus } from '../services/bkndService';
import { BullyingCase, CaseStatus } from '../types';
import { FileText, CheckCircle, AlertTriangle, Calendar, Filter, UserIcon } from './Icons';

const AdminDashboard: React.FC = () => {
  const [cases, setCases] = useState<BullyingCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<BullyingCase | null>(null);
  const [filter, setFilter] = useState<CaseStatus | 'all'>('all');

  const fetchCases = async () => {
    setLoading(true);
    const data = await getCases();
    // Sort by date desc
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setCases(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: CaseStatus) => {
    // Optimistic update for UI responsiveness
    if (selectedCase && selectedCase.id === id) {
        setSelectedCase({...selectedCase, status: newStatus});
    }
    
    // Update list locally to avoid full refetch flicker
    setCases(prev => prev.map(c => c.id === id ? {...c, status: newStatus} : c));

    try {
        await updateCaseStatus(id, newStatus);
    } catch (error) {
        alert("Error actualizando estado");
        fetchCases(); // Revert on error
    }
  };

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
    resolved: cases.filter(c => c.status === 'resuelto').length
  };

  return (
    <div className="space-y-6">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
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
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* List Column */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Casos Recientes</h3>
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
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                            <UserIcon className="w-3 h-3 mr-1" />
                            {c.contactEmail ? 'Contacto disponible' : 'Anónimo'}
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
                        
                        {selectedCase.adminNotes && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-yellow-800 mb-1">Notas Administrativas</h4>
                                <p className="text-sm text-yellow-900">{selectedCase.adminNotes}</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50">
                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                        <FileText className="w-12 h-12 text-gray-300" />
                    </div>
                    <p className="font-medium">Selecciona un caso para ver los detalles</p>
                    <p className="text-sm text-gray-400 mt-1">Podrás gestionar el estado y ver evidencias</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;