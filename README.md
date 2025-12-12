# Plataforma de Reporte de Bullying (SinBullying)

Una plataforma de código abierto diseñada para que centros educativos puedan recibir reportes de acoso escolar de forma segura, anónima y eficiente.

## ✨ Características

- **Panel de Estudiante:** Reporte anónimo o identificado, subida de pruebas (fotos/videos) y chat directo vía WhatsApp con orientadores.
- **Panel de Administración:** Gestión de casos (Kanban), asignación de técnicos y estadísticas.
- **Notificaciones por Email:** Alerta inmediata al administrador cuando se crea un caso (vía Resend).
- **Seguridad:** Verificación de identidad mediante código y roles protegidos.
- **Almacenamiento:** Uso de Google Cloud Storage para mayor capacidad gratuita.

## 🚀 Despliegue Rápido en Vercel

### Paso 1: Configurar Google Cloud Storage (Fotos)
1. Crea un proyecto en [Google Cloud](https://console.cloud.google.com/).
2. Crea un **Bucket** público.
3. Crea una **Service Account** y descarga el JSON de claves.

### Paso 2: Configurar Resend (Emails)
1. Regístrate gratis en [Resend.com](https://resend.com).
2. Crea una **API Key**.
3. Verifica tu dominio (o usa el dominio de prueba para enviarte emails solo a ti mismo).

### Paso 3: Desplegar la Web

Haz clic en el botón de abajo. Vercel te pedirá las claves.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbknd-io%2Fsinbullying-template&env=GOOGLE_PROJECT_ID,GOOGLE_CLIENT_EMAIL,GOOGLE_PRIVATE_KEY,GOOGLE_BUCKET_NAME,RESEND_API_KEY,ADMIN_EMAIL&envDescription=Credenciales+Google+Cloud,+Resend+Email+y+Email+Admin&project-name=sinbullying-app&repository-name=sinbullying-app&stores=[{"type":"postgres"}])

**Variables de Entorno necesarias:**
- `GOOGLE_PROJECT_ID`: ID del proyecto Google.
- `GOOGLE_CLIENT_EMAIL`: Email del service account.
- `GOOGLE_PRIVATE_KEY`: La clave privada del JSON (copiar todo).
- `GOOGLE_BUCKET_NAME`: Nombre del bucket.
- `RESEND_API_KEY`: Tu clave API de Resend.
- `ADMIN_EMAIL`: El correo donde quieres recibir las alertas de nuevos casos.

### Paso 4: Inicializar Base de Datos
1. Una vez desplegado, ve a: `https://tu-proyecto.vercel.app/api/setup`
2. ¡Listo!

## 🛠 Desarrollo Local

1. `npm install`
2. Crea `.env.local` con todas las variables.
3. `npm start`

## Tecnologías

- Frontend: React + Vite + TailwindCSS
- Backend: Vercel Functions + Resend
- DB: Vercel Postgres
- Storage: Google Cloud Storage

---
Licencia MIT