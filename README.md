# Plataforma de Reporte de Bullying (SinBullying)

Una plataforma de código abierto para que centros educativos gestionen reportes de acoso escolar de forma segura.

![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green)
![Coste](https://img.shields.io/badge/Coste-100%25_Gratis-blue)

## ⚙️ Configuración Rápida en Vercel

Para que el envío de correos funcione con los datos de Brevo que tienes, debes configurar las siguientes **Variables de Entorno** en tu proyecto de Vercel (Settings -> Environment Variables):

| Variable | Valor a introducir | Descripción |
|----------|-------------------|-------------|
| `BREVO_USER` | `9e04ca001@smtp-brevo.com` | Tu identificador de usuario SMTP |
| `BREVO_API_KEY` | `mmomAWZF6Qzsk` | Tu contraseña SMTP (¡No la compartas!) |
| `ADMIN_EMAIL` | *(Tu email)* | El email para entrar como administrador |
| `ADMIN_PASSWORD` | *(Tu contraseña)* | La contraseña para el administrador |

> **Nota:** La plataforma usará automáticamente `smtp-relay.brevo.com` y el puerto `587` basándose en esta configuración.

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