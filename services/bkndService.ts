import { BullyingCase, User, Role, CaseStatus, Evidence } from '../types';

const CURRENT_USER_KEY = 'sinbullying_current_user';

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
  if (!password) {
      throw new Error("La contraseña es obligatoria");
  }

  try {
    const user = await api('auth', 'POST', { email, role, password });
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  } catch (e: any) {
    throw new Error(e.message || "Error de autenticación");
  }
};

export const registerUser = async (data: any): Promise<User> => {
    return api('users', 'POST', data);
};

export const requestPasswordReset = async (email: string): Promise<void> => {
    return api('password', 'POST', { action: 'request', email });
};

export const resetPassword = async (email: string, token: string, newPassword: string): Promise<void> => {
    return api('password', 'POST', { action: 'reset', email, token, newPassword });
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

// Admin Functions
export const createTechnician = async (data: Omit<User, 'id' | 'role'> & { password?: string }): Promise<User> => {
    return api('users', 'POST', { ...data, role: 'technician' });
};

export const updateTechnician = async (id: string, data: Partial<User>): Promise<void> => {
    return api('users', 'PUT', { id, ...data });
};

export const deleteTechnician = async (id: string): Promise<void> => {
    return api(`users?id=${id}`, 'DELETE');
};

export const getTechnicians = async (): Promise<User[]> => {
    return api('users?role=technician');
};

// ==========================================
// CASES & EVIDENCE
// ==========================================

export const uploadFile = async (file: File): Promise<Evidence> => {
    const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
    });

    if (!response.ok) throw new Error('Error subiendo archivo');
    const blob = await response.json();

    return {
        id: blob.url,
        fileName: file.name,
        fileType: file.type,
        url: blob.url
    };
};

export const createCase = async (data: Omit<BullyingCase, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<BullyingCase> => {
    const newCase = await api('cases', 'POST', data);
    
    // Notificación al admin (ahora usa Brevo en el backend)
    try {
        await api('email', 'POST', {
            type: 'new_case',
            to: 'admin_email_demo@example.com', // En backend se puede sobreescribir con env var
            data: {
                location: data.location,
                description: data.description,
                date: data.dateOfIncident,
                url: window.location.origin
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

export const updateCaseStudentNotes = async (id: string, notes: string): Promise<void> => {
    return api(`cases`, 'PUT', { id, studentNotes: notes });
};

// ==========================================
// SECURE VERIFICATION (OTP)
// ==========================================

// Pide al servidor que genere y envíe el código
export const sendVerificationCode = async (email: string): Promise<boolean> => {
  try {
      await api('otp', 'POST', {
          action: 'request',
          email: email
      });
      return true;
  } catch (e) {
      console.error(e);
      return false;
  }
};

// Envía el código introducido por el usuario para que el servidor lo valide
export const verifyOTP = async (email: string, code: string): Promise<boolean> => {
  try {
      const res = await api('otp', 'POST', {
          action: 'verify',
          email: email,
          code: code
      });
      return res.valid === true;
  } catch (e) {
      console.error(e);
      return false;
  }
};