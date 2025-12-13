# Plataforma de Reporte de Bullying (SinBullying)

Una plataforma de código abierto para que centros educativos gestionen reportes de acoso escolar de forma segura.

![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green)
![Coste](https://img.shields.io/badge/Coste-100%25_Gratis-blue)

## 💰 ¿Cuánto cuesta?
Este proyecto está diseñado para funcionar **gratis** con las capas gratuitas de los proveedores:
- **Vercel Hobby Plan:** Alojamiento web y Base de Datos (Postgres).
- **Google Cloud Free Tier:** 5GB de almacenamiento para fotos/vídeos.

### 📦 Nota sobre el almacenamiento (¡Importante!)
Al instalar en Vercel, verás que la base de datos (Neon Postgres) tiene un límite de **0.5 GB**.
**No te preocupes, es espacio de sobra:**
1.  **Base de Datos (0.5 GB):** Aquí solo se guarda **texto** (nombres, descripciones, fechas). En este espacio caben cientos de miles de reportes.
2.  **Google Cloud (5 GB):** Las fotos y evidencias **NO** ocupan espacio en la base de datos; se guardan automáticamente en Google Cloud Storage, que tiene un límite mucho mayor.

---

## ✨ Características

- **Panel de Estudiante:** Reporte anónimo/identificado, subida de pruebas y chat WhatsApp.
- **Panel de Administración:** Gestión de casos, asignación de técnicos y estadísticas.
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

### 2. Desplegar en Vercel

Tienes dos opciones. La más segura para que coja tu código actual es la **Opción A**.

**Opción A: Importar desde Vercel (Recomendado)**
1. Sube este código a tu repositorio de GitHub.
2. Entra en [Vercel.com](https://vercel.com), dale a **"Add New Project"** e importa tu repositorio.
3. Añade las variables de entorno de Google Cloud (`GOOGLE_PRIVATE_KEY`, etc) cuando te lo pida.
4. Una vez creado el proyecto, ve a la pestaña **Storage**, selecciona **Postgres** y dale a **Create** para conectar la base de datos.

**Opción B: Usar el Botón de Despliegue**
Si prefieres usar el botón, **primero debes editar este README** y cambiar `TU_USUARIO/TU_REPOSITORIO` en el enlace de abajo por la URL real de tu repositorio en GitHub.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTU_USUARIO%2FTU_REPOSITORIO&env=GOOGLE_PROJECT_ID,GOOGLE_CLIENT_EMAIL,GOOGLE_PRIVATE_KEY,GOOGLE_BUCKET_NAME&envDescription=Credenciales+Google+Cloud&project-name=sinbullying-app&repository-name=sinbullying-app&stores=[{"type":"postgres"}])

Durante el proceso rellenarás:
- `GOOGLE_PRIVATE_KEY`: Copia todo el contenido del archivo JSON.
- `GOOGLE_CLIENT_EMAIL`: El email del service account.
- `GOOGLE_PROJECT_ID`: El ID de tu proyecto.
- `GOOGLE_BUCKET_NAME`: El nombre de tu bucket.

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
Hecho con ❤️ usando React, Tailwind, Vercel Postgres & Google Cloud.