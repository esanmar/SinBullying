export type Role = 'student' | 'admin';

export type CaseStatus = 'pendiente' | 'revision' | 'resuelto';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
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
}

export interface DashboardStats {
  total: number;
  pending: number;
  resolved: number;
  recent: number;
}