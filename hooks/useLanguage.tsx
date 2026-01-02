
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

const dictionary = {
  es: {
    // Auth & Landing
    welcome: 'Bienvenido de nuevo',
    createAccount: 'Crear Cuenta',
    loginSubtitle: 'Ingresa tus credenciales para acceder',
    registerSubtitle: 'Completa el formulario para registrarte',
    roleStudent: 'Estudiante',
    roleTechnician: 'Técnico',
    roleAdmin: 'Admin',
    name: 'Nombre Completo',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    forgotPass: '¿Olvidaste tu contraseña?',
    privacyCheck: 'He leído y acepto la Política de Privacidad',
    btnLogin: 'Iniciar Sesión',
    btnRegister: 'Crear Cuenta',
    landingTitle: 'SinBullying',
    landingSubtitle: 'Plataforma integral para la gestión segura, privada y trazable de la convivencia escolar. Conectamos estudiantes con orientadores para crear espacios seguros.',
    
    // Landing Features Detailed
    featStudent: 'Para Estudiantes',
    featStudent_1: 'Reporte de casos seguro y confidencial.',
    featStudent_2: 'Subida de evidencias (Fotos/PDF) comprimidas.',
    featStudent_3: 'Seguridad reforzada con verificación 2FA (Email).',
    featStudent_4: 'Gestión de perfil y seguimiento de estado.',
    featStudent_5: 'Notas privadas para ampliar información.',

    featTech: 'Para Técnicos',
    featTech_1: 'Panel de gestión de casos centralizado.',
    featTech_2: 'Bolsa de casos y auto-asignación.',
    featTech_3: 'Integración directa con WhatsApp.',
    featTech_4: 'Bitácora de acciones y notas de intervención.',
    featTech_5: 'Edición de reportes y seguimiento.',

    featAdmin: 'Administración',
    featAdmin_1: 'Visión global y estadísticas en tiempo real.',
    featAdmin_2: 'Gestión de usuarios y permisos.',
    featAdmin_3: 'Trazabilidad total (Audit Logs) de cambios.',
    featAdmin_4: 'Supervisión y reasignación de casos.',
    featAdmin_5: 'Notificaciones automáticas por email.',

    featPrivacy: 'Privacidad y Seguridad',
    featPrivacy_1: 'Cumplimiento con RGPD y Protección de Datos.',
    featPrivacy_2: 'Encriptación de contraseñas.',
    featPrivacy_3: 'Verificación de identidad anti-spam.',
    featPrivacy_4: 'Historial inmutable de modificaciones.',
    featPrivacy_5: 'Entorno seguro HTTPS.',
    
    // Dashboard Common
    logout: 'Cerrar Sesión',
    hello: 'Hola',
    
    // Student Dashboard
    newReport: 'Nuevo Reporte',
    myReports: 'Mis Reportes',
    myProfile: 'Mi Perfil',
    incidentDetails: 'Detalles del Incidente',
    whatHappened: '¿Qué sucedió?',
    date: 'Fecha',
    location: 'Lugar',
    contactPrivate: 'Datos de Contacto (Privado)',
    phone: 'Teléfono',
    involved: 'Personas involucradas',
    evidence: 'Evidencias',
    uploadHint: 'Toca para subir archivos',
    verifyStep: 'Verificación de Seguridad',
    verifySent: 'Código enviado a',
    verifyBtn: 'Verificar',
    sendReport: 'Enviar Reporte',
    reportSuccess: '¡Reporte Enviado!',
    reportSuccessMsg: 'Gracias por tu valentía. El administrador ha sido notificado.',
    
    // Admin/Technician
    statsTotal: 'Total Casos',
    statsPending: 'Pendientes',
    statsResolved: 'Resueltos',
    statsTechs: 'Técnicos',
    tabCases: 'Gestión de Casos',
    tabTeam: 'Equipo Técnico',
    filterAll: 'Todos',
    filterPending: 'Pendientes',
    filterRevision: 'En Revisión',
    filterResolved: 'Resueltos',
    assignTech: 'Asignación de Técnico',
    unassigned: '-- Sin Asignar --',
    descTitle: 'Descripción',
    detailsTitle: 'Detalles',
    actionsTitle: 'Acciones del Técnico',
    auditTitle: 'Historial de Cambios (Trazabilidad)',
    printReport: 'Imprimir / PDF',
    
    // Status
    status_pendiente: 'Pendiente',
    status_revision: 'En Revisión',
    status_resuelto: 'Resuelto',
  },
  en: {
    // Auth & Landing
    welcome: 'Welcome back',
    createAccount: 'Create Account',
    loginSubtitle: 'Enter your credentials to access',
    registerSubtitle: 'Fill the form to register',
    roleStudent: 'Student',
    roleTechnician: 'Technician',
    roleAdmin: 'Admin',
    name: 'Full Name',
    email: 'Email Address',
    password: 'Password',
    forgotPass: 'Forgot password?',
    privacyCheck: 'I have read and accept the Privacy Policy',
    btnLogin: 'Login',
    btnRegister: 'Sign Up',
    landingTitle: 'NoBullying',
    landingSubtitle: 'Comprehensive platform for secure, private, and traceable school coexistence management. We connect students with counselors to create safe spaces.',
    
    // Landing Features Detailed
    featStudent: 'For Students',
    featStudent_1: 'Secure and confidential case reporting.',
    featStudent_2: 'Upload compressed evidence (Photos/PDF).',
    featStudent_3: 'Reinforced security with 2FA verification (Email).',
    featStudent_4: 'Profile management and status tracking.',
    featStudent_5: 'Private notes for additional information.',

    featTech: 'For Technicians',
    featTech_1: 'Centralized case management dashboard.',
    featTech_2: 'Case pool and self-assignment.',
    featTech_3: 'Direct integration with WhatsApp.',
    featTech_4: 'Action logs and intervention notes.',
    featTech_5: 'Report editing and follow-up.',

    featAdmin: 'Administration',
    featAdmin_1: 'Global vision and real-time statistics.',
    featAdmin_2: 'User and permission management.',
    featAdmin_3: 'Total traceability (Audit Logs) of changes.',
    featAdmin_4: 'Supervision and reassignment of cases.',
    featAdmin_5: 'Automatic email notifications.',

    featPrivacy: 'Privacy & Security',
    featPrivacy_1: 'GDPR compliance and Data Protection.',
    featPrivacy_2: 'Password encryption.',
    featPrivacy_3: 'Anti-spam identity verification.',
    featPrivacy_4: 'Immutable modification history.',
    featPrivacy_5: 'Secure HTTPS environment.',

    // Dashboard Common
    logout: 'Logout',
    hello: 'Hello',

    // Student Dashboard
    newReport: 'New Report',
    myReports: 'My Reports',
    myProfile: 'My Profile',
    incidentDetails: 'Incident Details',
    whatHappened: 'What happened?',
    date: 'Date',
    location: 'Location',
    contactPrivate: 'Contact Info (Private)',
    phone: 'Phone',
    involved: 'Involved People',
    evidence: 'Evidence',
    uploadHint: 'Click to upload files',
    verifyStep: 'Security Verification',
    verifySent: 'Code sent to',
    verifyBtn: 'Verify',
    sendReport: 'Submit Report',
    reportSuccess: 'Report Sent!',
    reportSuccessMsg: 'Thank you for your courage. The administrator has been notified.',

    // Admin/Technician
    statsTotal: 'Total Cases',
    statsPending: 'Pending',
    statsResolved: 'Resolved',
    statsTechs: 'Technicians',
    tabCases: 'Case Management',
    tabTeam: 'Technical Team',
    filterAll: 'All',
    filterPending: 'Pending',
    filterRevision: 'In Review',
    filterResolved: 'Resolved',
    assignTech: 'Technician Assignment',
    unassigned: '-- Unassigned --',
    descTitle: 'Description',
    detailsTitle: 'Details',
    actionsTitle: 'Technician Actions',
    auditTitle: 'Audit Logs (Traceability)',
    printReport: 'Print / PDF',

    // Status
    status_pendiente: 'Pending',
    status_revision: 'In Review',
    status_resuelto: 'Resolved',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof dictionary.es) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Fix: Making children optional to resolve the TypeScript error in App.tsx: 
// "Property 'children' is missing in type '{}' but required in type '{ children: ReactNode; }'"
export const LanguageProvider = ({ children }: { children?: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: keyof typeof dictionary.es) => {
    return dictionary[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
