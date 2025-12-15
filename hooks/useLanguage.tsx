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
    landingSubtitle: 'Plataforma integral para la gestión segura, privada y trazable de la convivencia escolar.',
    featStudent: 'Para Estudiantes',
    featTech: 'Para Técnicos',
    featAdmin: 'Administración',
    featPrivacy: 'Privacidad y Seguridad',
    
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
    landingSubtitle: 'Comprehensive platform for secure, private, and traceable school coexistence management.',
    featStudent: 'For Students',
    featTech: 'For Technicians',
    featAdmin: 'Administration',
    featPrivacy: 'Privacy & Security',

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

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
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
