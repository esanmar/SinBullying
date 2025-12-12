import { BullyingCase, User, Role, CaseStatus, Evidence } from '../types';

const CURRENT_USER_KEY = 'sinbullying_current_user';
const OTPS_KEY = 'sinbullying_otps';

// Helpers para llamadas API
const api = async (endpoint: string, method: string = 'GET', body?: any) => {
    const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`/api/${endpoint}`, options);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error en la petición');
    }
    return res.json();
};

// ==========================================
// AUTH & USERS
// ==========================================

export const login = async (email: string, role: Role): Promise<User> => {
  // 1. Admin Hardcoded (Seguridad básica para plantilla)
  if (role === 'admin') {
     if (!email.includes('admin')) {
        throw new Error("Solo correos admin permitidos");
     }
     const adminUser: User = { id: 'admin_master', name: 'Administrador', email, role: 'admin' };
     localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
     return adminUser;
  }

  // 2. Technicians (API Call)
  if (role === 'technician') {
      try {
          const users = await api('users?role=technician');
          const tech = users.find((u: User) => u.email === email);
          
          if (!tech) throw new Error("Técnico no encontrado");
          
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(tech));
          return tech;
      } catch (e) {
          throw new Error("Error verificando técnico");
      }
  }

  // 3. Students (Local)
  const studentUser: User = {
    id: `student_${email.replace(/[^a-zA-Z0-9]/g, '')}`,
    name: 'Estudiante',
    email,
    role: 'student'
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(studentUser));
  return studentUser;
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const createTechnician = async (data: Omit<User, 'id' | 'role'>): Promise<User> => {
    return api('users', 'POST', { ...data, role: 'technician' });
};

export const getTechnicians = async (): Promise<User[]> => {
    return api('users?role=technician');
};

// ==========================================
// CASES & EVIDENCE
// ==========================================

export const uploadFile = async (file: File): Promise<Evidence> => {
    // Usamos Vercel Blob Storage vía API Route
    const response = await fetch(`/api/upload-blob?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
            'Content-Type': file.type,
        },
        body: file,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(error.error || 'Error subiendo archivo');
    }

    const blob = await response.json();

    return {
        id: blob.pathname || blob.url,
        fileName: file.name,
        fileType: file.type,
        url: blob.url
    };
};

export const createCase = async (data: Omit<BullyingCase, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<BullyingCase> => {
    return api('cases', 'POST', data);
};

export const getCases = async (): Promise<BullyingCase[]> => {
    return api('cases');
};

export const getCasesByStudent = async (studentId: string): Promise<BullyingCase[]> => {
    // Filtramos en cliente para simplificar la API, o pasamos query params
    const all = await api('cases');
    return all.filter((c: BullyingCase) => c.studentId === studentId);
};

export const getCasesByTechnician = async (technicianId: string): Promise<BullyingCase[]> => {
    const all = await api('cases');
    return all.filter((c: BullyingCase) => c.assignedTechnicianId === technicianId);
};

export const updateCaseStatus = async (id: string, status: CaseStatus, notes?: string): Promise<BullyingCase> => {
    return api(`cases`, 'PUT', { id, status, adminNotes: notes });
};

export const assignCaseToTechnician = async (caseId: string, technicianId: string | null): Promise<void> => {
    return api(`cases`, 'PUT', { id: caseId, assignedTechnicianId: technicianId });
};

// ==========================================
// MOCKED 2FA (Client Side for Demo)
// ==========================================

export const sendVerificationCode = async (email: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const otps = JSON.parse(localStorage.getItem(OTPS_KEY) || '{}');
  otps[email] = code;
  localStorage.setItem(OTPS_KEY, JSON.stringify(otps));
  console.log(`[SYSTEM] OTP para ${email}: ${code}`);
  return true;
};

export const verifyOTP = async (email: string, code: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const otps = JSON.parse(localStorage.getItem(OTPS_KEY) || '{}');
  if (otps[email] === code) {
    delete otps[email];
    localStorage.setItem(OTPS_KEY, JSON.stringify(otps));
    return true;
  }
  return false;
};