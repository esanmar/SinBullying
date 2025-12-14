# Plataforma de Reporte de Bullying (SinBullying)

Una plataforma de código abierto para que centros educativos gestionen reportes de acoso escolar de forma segura.

![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green)
![Coste](https://img.shields.io/badge/Coste-100%25_Gratis-blue)

## ⚙️ Configuración Rápida en Vercel

Para que el envío de correos funcione, necesitas estas variables en Vercel.

**IMPORTANTE:** El `BREVO_USER` suele ser un código (ej: 9e04ca...), pero para enviar correos necesitas usar una dirección de email real verificada en tu cuenta de Brevo. Por defecto la app intentará usar `ADMIN_EMAIL` como remitente, pero puedes forzar otro con `SENDER_EMAIL`.

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `BREVO_USER` | Tu identificador de usuario SMTP | `9e04ca001@smtp-brevo.com` |
| `BREVO_API_KEY` | Tu contraseña SMTP | `mmomAWZF6Qzsk` |
| `ADMIN_EMAIL` | Email del administrador (y remitente por defecto) | `director@colegio.com` |
| `ADMIN_PASSWORD` | Contraseña para el panel admin | `SuperSecreto123` |
| `SENDER_EMAIL` | *(Opcional)* Email remitente verificado en Brevo | `no-reply@colegio.com` |

---

## 🚀 Despliegue (Instalación)

1. Sube los archivos de este proyecto a tu cuenta de GitHub.
2. Ve a [Vercel](https://vercel.com), crea un "New Project" e importa el repositorio.
3. Añade las variables de entorno indicadas arriba.
4. Una vez desplegado, ve a la pestaña **Storage** en Vercel y conecta una base de datos **Postgres** y un **Blob** (ambos gratuitos).
5. Abre en tu navegador `https://TU-PROYECTO.vercel.app/api/setup` para crear las tablas automáticamente.

---

## ✨ Características

- **Panel de Estudiante:** Reporte anónimo/identificado, subida de pruebas y chat WhatsApp.
- **Panel de Administración:** Gestión de casos, asignación de técnicos y estadísticas.
- **Seguridad:** Verificación por código (OTP) seguro en base de datos.

Hecho con ❤️ para ayudar a crear espacios seguros.