import { BullyingCase, User, Role, CaseStatus, Evidence } from '../types';

// CONSTANTS FOR LOCAL STORAGE KEYS
const USERS_KEY = 'sinbullying_users';
const CASES_KEY = 'sinbullying_cases';
const CURRENT_USER_KEY = 'sinbullying_current_user';
const OTPS_KEY = 'sinbullying_otps';
const TECHNICIANS_KEY = 'sinbullying_technicians';

// ==========================================
// CONFIGURACIÓN DEL ADMINISTRADOR
// ==========================================
const getAdminEmail = () => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env?.REACT_APP_ADMIN_EMAIL) {
      // @ts-ignore
      return process.env.REACT_APP_ADMIN_EMAIL;
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_EMAIL) {
      // @ts-ignore
      return import.meta.env.VITE_ADMIN_EMAIL;
    }
  } catch (e) {}
  return 'admin@sinbullying.edu';
};

const ENV_ADMIN_EMAIL = getAdminEmail();
// ==========================================


// Initialize Mock Data if empty
const initMockData = () => {
  if (!localStorage.getItem(CASES_KEY)) {
    const mockCases: BullyingCase[] = [
      {
        id: '1',
        studentId: 'user_1',
        description: 'Me empujaron en el pasillo cerca de la cafetería y tiraron mis libros.',
        dateOfIncident: '2023-10-25',
        location: 'Pasillo Principal',
        involvedPeople: 'Grupo de 3 chicos de 4º B',
        status: 'pendiente',
        contactEmail: 'student1@school.edu',
        contactPhone: '600123456',
        evidence: [],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: '2',
        studentId: 'user_2',
        description: 'Insultos constantes en la clase de educación física.',
        dateOfIncident: '2023-10-20',
        location: 'Gimnasio',
        involvedPeople: 'Juan P.',
        status: 'resuelto',
        contactEmail: 'student2@school.edu',
        contactPhone: '600987654',
        evidence: [],
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        adminNotes: 'Se habló con los padres y el alumno. Situación controlada.',
      }
    ];
    localStorage.setItem(CASES_KEY, JSON.stringify(mockCases));
  }

  // Init mock technician if empty for testing
  if (!localStorage.getItem(TECHNICIANS_KEY)) {
     const mockTech: User = {
         id: 'tech_1',
         name: 'Carlos',
         lastName: 'García',
         email: 'tecnico@sinbullying.edu',
         role: 'technician',
         phone: '666777888',
         center: 'IES Central'
     };
     localStorage.setItem(TECHNICIANS_KEY, JSON.stringify([mockTech]));
  }
};

initMockData();

// --- TECHNICIAN SERVICE ---

export const createTechnician = async (data: Omit<User, 'id' | 'role'>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const technicians = await getTechnicians();
    
    if (technicians.some(t => t.email === data.email)) {
        throw new Error("El email ya está registrado como técnico.");
    }

    const newTech: User = {
        ...data,
        id: `tech_${Math.random().toString(36).substr(2, 9)}`,
        role: 'technician'
    };

    technicians.push(newTech);
    localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));
    return newTech;
};

export const getTechnicians = async (): Promise<User[]> => {
    const stored = localStorage.getItem(TECHNICIANS_KEY);
    return stored ? JSON.parse(stored) : [];
};

// --- AUTH SERVICE ---

export const login = async (email: string, role: Role): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 600));

  if (role === 'admin') {
    if (email.toLowerCase() !== ENV_ADMIN_EMAIL.toLowerCase()) {
      throw new Error(`Acceso denegado. Solo el administrador autorizado (${ENV_ADMIN_EMAIL}) puede ingresar.`);
    }
    const adminUser: User = { id: 'admin_1', name: 'Administrador', email, role };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
    return adminUser;
  }

  if (role === 'technician') {
      const technicians = await getTechnicians();
      const tech = technicians.find(t => t.email.toLowerCase() === email.toLowerCase());
      if (!tech) {
          throw new Error("No existe un técnico registrado con este email. Contacte al administrador.");
      }
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(tech));
      return tech;
  }

  // Students (Mock login allows any email)
  const user: User = {
    id: `student_${Math.random().toString(36).substr(2, 5)}`,
    name: 'Estudiante',
    email,
    role
  };
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

// --- DATA SERVICE ---
// ... (Previous existing functions)

// --- OTP / 2FA SERVICE (MOCKED) ---

export const sendVerificationCode = async (email: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const otps = JSON.parse(localStorage.getItem(OTPS_KEY) || '{}');
  otps[email] = code;
  localStorage.setItem(OTPS_KEY, JSON.stringify(otps));
  console.group("📧 SERVICIO DE CORREO (SIMULACIÓN)");
  console.log(`Para: ${email}`);
  console.log(`Asunto: Código de verificación SinBullying`);
  console.log(`Cuerpo: Tu código de verificación es: ${code}`);
  console.groupEnd();
  return true;
};

export const verifyOTP = async (email: string, code: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const otps = JSON.parse(localStorage.getItem(OTPS_KEY) || '{}');
  const storedCode = otps[email];
  if (storedCode && storedCode === code) {
    delete otps[email];
    localStorage.setItem(OTPS_KEY, JSON.stringify(otps));
    return true;
  }
  return false;
};

// --- DATA SERVICE ---

export const createCase = async (data: Omit<BullyingCase, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<BullyingCase> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const newCase: BullyingCase = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    status: 'pendiente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTechnicianId: null 
  };
  const cases = await getCases();
  cases.unshift(newCase);
  localStorage.setItem(CASES_KEY, JSON.stringify(cases));
  console.log(`[EMAIL SERVICE] Sending email to ${ENV_ADMIN_EMAIL}: New Case #${newCase.id} created.`);
  return newCase;
};

export const getCases = async (): Promise<BullyingCase[]> => {
  const stored = localStorage.getItem(CASES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getCasesByStudent = async (studentId: string): Promise<BullyingCase[]> => {
    const allCases = await getCases();
    return allCases.filter(c => c.studentId === studentId);
};

export const getCasesByTechnician = async (technicianId: string): Promise<BullyingCase[]> => {
    const allCases = await getCases();
    return allCases.filter(c => c.assignedTechnicianId === technicianId);
};

export const updateCaseStatus = async (id: string, status: CaseStatus, notes?: string): Promise<BullyingCase> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const cases = await getCases();
  const index = cases.findIndex(c => c.id === id);
  if (index === -1) throw new Error("Case not found");
  const updatedCase = {
    ...cases[index],
    status,
    adminNotes: notes || cases[index].adminNotes,
    updatedAt: new Date().toISOString()
  };
  cases[index] = updatedCase;
  localStorage.setItem(CASES_KEY, JSON.stringify(cases));
  return updatedCase;
};

export const assignCaseToTechnician = async (caseId: string, technicianId: string | null): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const cases = await getCases();
    const index = cases.findIndex(c => c.id === caseId);
    if (index === -1) throw new Error("Case not found");

    cases[index].assignedTechnicianId = technicianId;
    cases[index].updatedAt = new Date().toISOString();
    
    // Si se asigna y estaba pendiente, pasar a revisión automáticamente
    if (technicianId && cases[index].status === 'pendiente') {
        cases[index].status = 'revision';
    }

    localStorage.setItem(CASES_KEY, JSON.stringify(cases));
};

export const uploadFile = async (file: File): Promise<Evidence> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        fileType: file.type,
        url: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  });
};