export type Role = 'student' | 'admin' | 'technician';

export type CaseStatus = 'pendiente' | 'revision' | 'resuelto';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  // Campos adicionales para técnicos
  lastName?: string;
  phone?: string;
  center?: string;
}

export interface Evidence {
  id: string;
  fileName: string;
  fileType: string;
  url: string; // Base64 or URL
}

export interface BullyingCase {
  id: string;
  studentId: string; // Anonymous ID or User ID
  description: string;
  dateOfIncident: string;
  location: string;
  involvedPeople: string;
  contactEmail?: string;
  contactPhone?: string;
  status: CaseStatus;
  evidence: Evidence[];
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  assignedTechnicianId?: string | null; // Nuevo campo para asignación
  technicianActions?: string; // HTML content from WYSIWYG
  studentNotes?: string; // Nuevo campo para notas del estudiante
}

export interface DashboardStats {
  total: number;
  pending: number;
  resolved: number;
  recent: number;
  technicians?: number;
}