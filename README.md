# Plataforma de Reporte de Bullying (SinBullying)

Una plataforma de código abierto para que centros educativos gestionen reportes de acoso escolar de forma segura.

![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green)
![Coste](https://img.shields.io/badge/Coste-100%25_Gratis-blue)

## 💰 ¿Cuánto cuesta?
Este proyecto está diseñado para funcionar **gratis** con las capas gratuitas de los proveedores:
- **Vercel Hobby Plan:** Alojamiento web y Base de Datos (Postgres).
- **Google Cloud Free Tier:** 5GB de almacenamiento para fotos/vídeos.
- **Resend Free Tier:** 3000 emails/mes para notificaciones.

## ✨ Características

- **Panel de Estudiante:** Reporte anónimo/identificado, subida de pruebas y chat WhatsApp.
- **Panel de Administración:** Gestión de casos, asignación de técnicos y estadísticas.
- **Alertas:** Email inmediato al administrador al recibir un reporte.
- **Seguridad:** Verificación por código (OTP) y roles de usuario.

---

## 🚀 Guía de Despliegue (Paso a Paso)

### 1. Preparar Google Cloud (Para las fotos)
Necesitas esto para guardar las evidencias que suban los alumnos.
1. Ve a [Google Cloud Console](https://console.cloud.google.com/) y crea un proyecto nuevo.
2. En el menú, busca **Cloud Storage** > **Buckets** y crea uno (ej. `mi-escuela-bullying`).
   - **Importante:** Desmarca "Enforce public access prevention" y en permisos añade a `allUsers` con rol `Storage Object Viewer` (para que las fotos se vean en el panel).
3. Ve a **IAM y administración** > **Cuentas de servicio**.
   - Crea una cuenta nueva (ej. `uploader`).
   - Dale el rol: `Administrador de objetos de almacenamiento`.
   - Entra en la cuenta creada, pestaña **Claves**, crea una **Clave JSON** y descárgala.

### 2. Preparar Email (Resend)
Para que te lleguen los avisos.
1. Regístrate en [Resend.com](https://resend.com).
2. Crea una **API Key**.
3. (Opcional) Verifica tu dominio. Si no lo haces, los emails solo llegarán a tu propia dirección de correo registrada.

### 3. Desplegar en Vercel
Haz clic en el botón. Te pedirá que inicies sesión con GitHub.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbknd-io%2Fsinbullying-template&env=GOOGLE_PROJECT_ID,GOOGLE_CLIENT_EMAIL,GOOGLE_PRIVATE_KEY,GOOGLE_BUCKET_NAME,RESEND_API_KEY,ADMIN_EMAIL&envDescription=Credenciales+necesarias&project-name=sinbullying-app&repository-name=sinbullying-app&stores=[{"type":"postgres"}])

Durante el proceso, Vercel te pedirá las variables. Rellénalas con los datos de los pasos 1 y 2:
- `GOOGLE_PRIVATE_KEY`: Copia todo el contenido del archivo JSON (incluyendo `-----BEGIN PRIVATE KEY...`).
- `ADMIN_EMAIL`: El email donde quieres recibir los avisos.

**Importante:** Cuando Vercel te pregunte por la Base de Datos (Postgres), acepta crearla.

### 4. Configuración Final
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
Hecho con ❤️ usando React, Tailwind, Vercel Postgres & Google Cloud.