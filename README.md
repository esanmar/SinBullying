# Plataforma de Reporte de Bullying (SinBullying)

Una plataforma de código abierto para que centros educativos gestionen reportes de acoso escolar de forma segura.

![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green)
![Coste](https://img.shields.io/badge/Coste-100%25_Gratis-blue)

## 💰 ¿Cuánto cuesta?
Este proyecto está diseñado para funcionar **gratis** con el plan Hobby de Vercel:
- **Alojamiento y Base de Datos:** Vercel Postgres.
- **Almacenamiento de archivos:** Vercel Blob (250MB gratis).
- **Correos Electrónicos:** Resend (3000 emails/mes gratis).

---

## ✨ Características

- **Panel de Estudiante:** Reporte anónimo/identificado, subida de pruebas y chat WhatsApp.
- **Panel de Administración:** Gestión de casos, asignación de técnicos y estadísticas.
- **Seguridad:** Verificación por código (OTP) enviado al email real.

---

## 🚀 Guía de Despliegue (¡Muy Fácil!)

### 1. Preparar Email (Resend)
Para que lleguen los códigos de verificación, necesitas una API Key.
1. Crea una cuenta gratis en [Resend.com](https://resend.com).
2. Ve a **API Keys** y crea una nueva (copia la clave `re_123...`).
3. (Opcional) Si tienes un dominio propio, verifícalo en Resend. Si no, solo podrás enviar correos de prueba a tu propio email de registro.

### 2. Desplegar en Vercel

Tienes dos opciones. La más segura para que coja tu código actual es la **Opción A**.

**Opción A: Importar desde Vercel (Recomendado)**
1. Sube este código a tu repositorio de GitHub.
2. Entra en [Vercel.com](https://vercel.com), dale a **"Add New Project"** e importa tu repositorio.
3. Añade la variable de entorno:
   - `RESEND_API_KEY`: Pega la clave que obtuviste en el paso 1.
4. Una vez creado el proyecto:
   - Ve a la pestaña **Storage**.
   - Conecta una base de datos **Postgres** (Dale a "Create").
   - Conecta un almacenamiento **Blob** (Dale a "Create").

**Opción B: Usar el Botón de Despliegue**
Si prefieres usar el botón, **primero debes editar este README** y cambiar `TU_USUARIO/TU_REPOSITORIO` en el enlace de abajo por la URL real de tu repositorio en GitHub.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTU_USUARIO%2FTU_REPOSITORIO&project-name=sinbullying-app&repository-name=sinbullying-app&env=RESEND_API_KEY&envDescription=API%20Key%20de%20Resend%20para%20emails&stores=[{"type":"postgres"},{"type":"blob"}])

### 3. Configuración Final
Una vez que la web esté online (tendrás una URL tipo `sinbullying-app.vercel.app`):

1. Abre en tu navegador: `https://TU-WEB.vercel.app/api/setup`
   - Esto creará las tablas en la base de datos. Deberías ver: `{"message":"Tablas creadas correctamente"}`.
   
2. ¡Listo! Ya puedes entrar.
   - Ve a `https://TU-WEB.vercel.app/#/login`
   - Entra como Admin usando cualquier correo que contenga la palabra "admin" (ej. `director_admin@escuela.edu`).

---

## 🛠 Desarrollo Local (Programadores)

1. Clona el repo.
2. `npm install`
3. Instala Vercel CLI: `npm i -g vercel`
4. Vincula el proyecto: `vercel link`
5. Descarga las variables de entorno: `vercel env pull .env.local`
6. `npm run dev`

---
Hecho con ❤️ usando React, Tailwind, Vercel Postgres, Vercel Blob & Resend.