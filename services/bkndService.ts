import { BullyingCase, User, Role, CaseStatus, Evidence } from '../types';

// CONSTANTS FOR LOCAL STORAGE KEYS
const USERS_KEY = 'sinbullying_users';
const CASES_KEY = 'sinbullying_cases';
const CURRENT_USER_KEY = 'sinbullying_current_user';
const OTPS_KEY = 'sinbullying_otps';

// ==========================================
// CONFIGURACIÓN DEL ADMINISTRADOR
// ==========================================
// Define aquí el email del único administrador autorizado.
// El sistema intentará buscar variables de entorno primero, o usará el valor por defecto.
const getAdminEmail = () => {
  try {
    // Soporte para Create React App / Webpack
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env?.REACT_APP_ADMIN_EMAIL) {
      // @ts-ignore
      return process.env.REACT_APP_ADMIN_EMAIL;
    }
    // Soporte para Vite
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_EMAIL) {
      // @ts-ignore
      return import.meta.env.VITE_ADMIN_EMAIL;
    }
  } catch (e) {
    // Ignorar errores de acceso a variables en entornos restringidos
  }
  
  // --- VALOR POR DEFECTO (Cámbialo aquí si no usas variables de entorno) ---
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
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
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
};

initMockData();

// --- AUTH SERVICE ---

export const login = async (email: string, role: Role): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // SINGLE ADMIN CHECK
  if (role === 'admin') {
    if (email.toLowerCase() !== ENV_ADMIN_EMAIL.toLowerCase()) {
      throw new Error(`Acceso denegado. Solo el administrador autorizado (${ENV_ADMIN_EMAIL}) puede ingresar.`);
    }
  }

  const user: User = {
    id: role === 'admin' ? 'admin_1' : `student_${Math.random().toString(36).substr(2, 5)}`,
    name: role === 'admin' ? 'Administrador' : 'Estudiante',
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

// --- OTP / 2FA SERVICE (MOCKED) ---

export const sendVerificationCode = async (email: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate sending email delay
  
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  
  // Store OTP in localStorage (simulating DB/Redis)
  const otps = JSON.parse(localStorage.getItem(OTPS_KEY) || '{}');
  otps[email] = code;
  localStorage.setItem(OTPS_KEY, JSON.stringify(otps));

  // LOG FOR DEVELOPER (Replace with real email service trigger)
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
    // Consume code (delete after use)
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
  };

  const cases = await getCases();
  cases.unshift(newCase);
  localStorage.setItem(CASES_KEY, JSON.stringify(cases));

  // Simulate Email Notification
  console.log(`[EMAIL SERVICE] Sending email to ${ENV_ADMIN_EMAIL}: New Case #${newCase.id} created.`);
  
  return newCase;
};

export const getCases = async (): Promise<BullyingCase[]> => {
  const stored = localStorage.getItem(CASES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getCasesByStudent = async (studentId: string): Promise<BullyingCase[]> => {
    const allCases = await getCases();
    // In a real DB we would query by ID. 
    // Here we filter. Since demo uses random IDs for students on login unless persisted, 
    // strictly speaking this might be empty on reload if user ID changes.
    // For this demo, we assume the session is active.
    return allCases.filter(c => c.studentId === studentId);
};

export const updateCaseStatus = async (id: string, status: CaseStatus, notes?: string): Promise<BullyingCase> => {
  await new Promise(resolve => setTimeout(resolve, 200)); // Faster response
  
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

// --- FILE UPLOAD MOCK ---
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