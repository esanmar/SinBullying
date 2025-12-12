# Plataforma de Reporte de Bullying (SinBullying) v2.0

Una plataforma de código abierto, mejorada y optimizada para que centros educativos gestionen reportes de acoso escolar de forma segura, gratuita y escalable.

![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green)
![Coste](https://img.shields.io/badge/Coste-100%25_Gratis-blue)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)
![Storage](https://img.shields.io/badge/Storage-10GB_Blob-orange)

---

## Principales Mejoras (Versión 2.0)

Esta versión ha sido reestructurada para ofrecer un mejor rendimiento, mayor seguridad y una configuración más sencilla, cumpliendo con los requisitos de fácil despliegue y 10GB de almacenamiento.

| Característica | Versión Anterior (1.0) | Nueva Versión (2.0) |
| :--- | :--- | :--- |
| **Almacenamiento** | Google Cloud Storage (5GB) | **Vercel Blob (10GB Gratis)** |
| **Configuración** | Manual y compleja (GCS JSON) | **Simplificada (1-Click Vercel)** |
| **Rendimiento** | Tailwind CSS (CDN) | **Tailwind CSS (Compilado)** |
| **Carga de Archivos** | Límite de 4.5MB | **Límite de 10MB + Compresión** |
| **Seguridad** | Básica | **Headers de Seguridad + CORS** |
| **Carga de App** | Carga completa inicial | **Lazy Loading (Carga diferida)** |
| **Documentación** | Básica | **Completa y detallada** |

---

## 💰 ¿Cuánto cuesta?

Este proyecto está diseñado para funcionar **100% gratis** utilizando las capas gratuitas de Vercel:

- **Vercel Hobby Plan:**
  - **Alojamiento Web:** Despliegue global en la Edge Network.
  - **Base de Datos:** Vercel Postgres (hasta 256MB).
  - **Almacenamiento de Archivos:** **Vercel Blob (10GB)** para fotos y vídeos.
- **Resend Free Tier:** 3,000 emails/mes para notificaciones.

---

## ✨ Características

- **Panel de Estudiante:** Reporte anónimo o identificado, subida de pruebas (fotos, vídeos, PDF) y chat directo por WhatsApp.
- **Panel de Administración:** Gestión centralizada de casos, asignación a técnicos y estadísticas clave.
- **Panel de Técnico:** Seguimiento de los casos asignados.
- **Alertas por Email:** Notificación inmediata al administrador al recibir un nuevo reporte.
- **Seguridad Mejorada:** Verificación de roles, headers de seguridad y validación de datos.
- **Optimización:** Compresión automática de imágenes para ahorrar espacio y acelerar la carga.

---

## 🚀 Guía de Despliegue Rápido (Paso a Paso)

Desplegar tu propia plataforma SinBullying es ahora más fácil que nunca.

### 1. Preparar Email (Resend)

Necesitas una cuenta de Resend para que el sistema envíe las alertas por email cuando se crea un nuevo caso.

1.  Regístrate gratis en [Resend.com](https://resend.com).
2.  Ve a la sección **API Keys** y crea una nueva clave. Cópiala para usarla más adelante.
3.  (Opcional pero recomendado) Verifica tu dominio para que los emails no lleguen como spam. Si no lo haces, los emails solo llegarán a tu propia dirección de correo.

### 2. Desplegar en Vercel (1-Click)

Haz clic en el botón de abajo. Vercel clonará el repositorio en tu cuenta de GitHub y comenzará el proceso de despliegue.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fesanmar%2FSinBullying&env=RESEND_API_KEY,ADMIN_EMAIL&envDescription=Credenciales+necesarias+para+las+notificaciones+por+email.&project-name=sinbullying-app&repository-name=sinbullying-app&stores=[{"type":"postgres"},{"type":"blob"}])

Durante el proceso, Vercel te pedirá:

1.  **Crear un Repositorio Git:** Dale un nombre a tu nuevo repositorio (ej. `mi-plataforma-bullying`).
2.  **Configurar el Proyecto:**
    -   **Variables de Entorno:** Pega la `RESEND_API_KEY` que creaste y define el `ADMIN_EMAIL` donde quieres recibir los avisos.
    -   **Añadir Bases de Datos:** Vercel detectará que el proyecto necesita una base de datos Postgres y un almacenamiento Blob. **Acepta crear ambos**. Vercel los configurará y enlazará automáticamente.

3.  **Desplegar:** Haz clic en el botón **Deploy**. El proceso tardará unos minutos.

### 3. Configuración Final

Una vez que la web esté online (tendrás una URL como `sinbullying-app.vercel.app`):

1.  Abre en tu navegador la siguiente URL para crear las tablas en la base de datos:
    `https://TU-NUEVA-WEB.vercel.app/api/setup`
    -   Deberías ver un mensaje: `{"message":"Tablas creadas correctamente"}`.

2.  **¡Listo! Ya puedes usar la plataforma.**
    -   Ve a `https://TU-NUEVA-WEB.vercel.app/#/login`.
    -   Para entrar como administrador, usa cualquier correo que contenga la palabra `admin` (ej. `director_admin@escuela.edu`).

---

## 🛠 Desarrollo Local (Para Programadores)

Si quieres modificar el código o contribuir:

1.  Clona tu repositorio bifurcado: `git clone https://github.com/TU_USUARIO/sinbullying-app.git`
2.  Instala las dependencias: `npm install`
3.  Instala la CLI de Vercel: `npm i -g vercel`
4.  Vincula tu proyecto de Vercel: `vercel link`
5.  Descarga las variables de entorno locales: `vercel env pull .env.local`
6.  Inicia el servidor de desarrollo: `npm run dev`

La aplicación estará disponible en `http://localhost:3000`.

---

Hecho con ❤️ usando React, TypeScript, Tailwind, Vite, Vercel Postgres y Vercel Blob.
