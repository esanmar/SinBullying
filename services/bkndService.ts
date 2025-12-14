import { BullyingCase, User, Role, CaseStatus, Evidence } from '../types';

const CURRENT_USER_KEY = 'sinbullying_current_user';
const OTPS_KEY = 'sinbullying_otps'; // Aún usamos localStorage para validar el código, pero el envío es real.

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

export const login = async (email: string, role: Role, password?: string): Promise<User> => {
  // 1. Admin Login (Server-side check of Env Var)
  if (role === 'admin') {
     try {
        const adminUser = await api('auth', 'POST', { email, role: 'admin', password });
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
        return adminUser;
     } catch (e: any) {
        console.error(e);
        throw new Error(e.message || "Credenciales de Administrador incorrectas");
     }
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
    // Usamos Vercel Blob vía API Route
    const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
    });

    if (!response.ok) throw new Error('Error subiendo archivo');

    const blob = await response.json();

    return {
        id: blob.url, // Usamos URL como ID en este caso simple
        fileName: file.name,
        fileType: file.type,
        url: blob.url
    };
};

export const createCase = async (data: Omit<BullyingCase, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<BullyingCase> => {
    const newCase = await api('cases', 'POST', data);
    
    // Notificar al Admin (Opcional: En una app real, esto se haría en el backend para no bloquear)
    // Usamos un email genérico de admin o obtenemos el del primer admin
    try {
        await api('email', 'POST', {
            type: 'new_case',
            to: 'admin_email_demo@example.com', // Reemplazar con variable de entorno en backend idealmente
            data: {
                location: data.location,
                description: data.description,
                date: data.dateOfIncident,
                url: window.location.origin // URL base de la app
            }
        });
    } catch (e) {
        console.warn("No se pudo enviar notificación al admin:", e);
    }

    return newCase;
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
// REAL 2FA VIA EMAIL
// ==========================================

export const sendVerificationCode = async (email: string): Promise<boolean> => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 1. Guardar código localmente (temporal para validación)
  const otps = JSON.parse(localStorage.getItem(OTPS_KEY) || '{}');
  otps[email] = code;
  localStorage.setItem(OTPS_KEY, JSON.stringify(otps));

  // 2. Enviar email real
  try {
      await api('email', 'POST', {
          type: 'otp',
          to: email,
          data: { code }
      });
      return true;
  } catch (e) {
      console.error(e);
      // Fallback para desarrollo si no hay API Key configurada
      alert("Error enviando email (¿Falta API Key?). Revisa la consola para ver el código en modo dev.");
      console.log(`[DEV MODE] OTP para ${email}: ${code}`);
      return false;
  }
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