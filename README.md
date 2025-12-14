# Plataforma de Reporte de Bullying (SinBullying)

Una plataforma de código abierto para que centros educativos gestionen reportes de acoso escolar de forma segura.

![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green)
![Coste](https://img.shields.io/badge/Coste-100%25_Gratis-blue)

## 💰 ¿Cuánto cuesta?
Este proyecto está diseñado para funcionar **gratis** con las capas gratuitas de los proveedores:
- **Vercel Plan Hobby:** Alojamiento, Base de Datos y Almacenamiento (Gratis para siempre para uso personal/no comercial).
- **Resend:** Envío de correos (3000/mes gratis).

---

## ✨ Características

- **Panel de Estudiante:** Reporte anónimo/identificado, subida de pruebas y chat WhatsApp.
- **Panel de Administración:** Gestión de casos, asignación de técnicos y estadísticas.
- **Seguridad:** Verificación por código (OTP) enviado al email real.

---

## 📝 Paso 1: Crear Cuentas (Prerrequisitos)

Antes de instalar nada, necesitas tener acceso a estas dos herramientas gratuitas.

### 1. Crear cuenta en Vercel (El alojamiento)
Vercel es donde "vive" tu página web.
1. Ve a [vercel.com/signup](https://vercel.com/signup).
2. Selecciona **"Hobby"** (es la opción gratuita).
3. Escribe tu nombre y elige **"Continue with GitHub"**.
   - *Si no tienes GitHub, créate uno en [github.com](https://github.com) primero. Es necesario para guardar tu código.*
4. Sigue los pasos de verificación telefónica si te lo piden.

### 2. Obtener la API Key de Resend (Para los emails)
Resend es el servicio que envía los códigos de seguridad a los alumnos.
1. Ve a [resend.com](https://resend.com) y regístrate (puedes usar tu GitHub o Google).
2. Una vez dentro, en el menú lateral izquierdo, haz clic en **API Keys**.
3. Haz clic en el botón negro **"Create API Key"**.
4. En "Name", pon el nombre de tu escuela o proyecto (ej. `SinBullying`).
5. Deja "Permission" en "Full Access" y dale a **Add**.
6. **¡IMPORTANTE!** Copia la clave que aparece (empieza por `re_...`).
   - *Guárdala en un bloc de notas ahora mismo. Solo se muestra una vez.*

---

## 🚀 Paso 2: Despliegue (Instalación)

Elige **una** de las dos opciones siguientes.

### Opción A: Importar desde Vercel (Recomendada)
Esta opción es la que menos fallos da.

1. Sube los archivos de este proyecto a tu propia cuenta de GitHub (crea un repositorio nuevo y sube los archivos).
2. Ve a tu panel de Vercel ([vercel.com/dashboard](https://vercel.com/dashboard)).
3. Haz clic en el botón negro **"Add New..."** -> **"Project"**.
4. Verás tu repositorio de GitHub en la lista. Dale a **"Import"**.
5. En la sección **Environment Variables**, añade **DOS** variables:
   - **Key:** `RESEND_API_KEY` | **Value:** (Tu clave `re_...` de Resend).
   - **Key:** `ADMIN_EMAIL`    | **Value:** (El correo del director/admin, ej: `director@escuela.com`).
6. Dale a **Deploy**.
7. Una vez termine, ve a la pestaña **Storage** de tu proyecto en Vercel:
   - Dale a "Connect Store" -> "Postgres" -> "Create New".
   - Dale a "Connect Store" -> "Blob" -> "Create New".

### Opción B: Usar el Botón de Despliegue Rápido
**Nota:** Para que este botón funcione, debes estar viendo este archivo **desde tu propio repositorio** en GitHub, o editar el enlace manualmente.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTU_USUARIO%2FTU_REPOSITORIO&project-name=sinbullying-app&repository-name=sinbullying-app&env=RESEND_API_KEY,ADMIN_EMAIL&envDescription=La%20clave%20de%20Resend%20y%20el%20email%20del%20Administrador&stores=[{"type":"postgres"},{"type":"blob"}])

*Si usas el botón, recuerda cambiar `TU_USUARIO/TU_REPOSITORIO` en la URL del navegador si falla.*

---

## ⚙️ Paso 3: Configuración Final
Una vez que la web esté online (tendrás una URL tipo `sinbullying-app.vercel.app`):

1. **Crear las tablas:**
   - Abre en tu navegador: `https://TU-WEB.vercel.app/api/setup`
   - Debes ver el mensaje: `{"message":"Tablas creadas correctamente"}`.

2. **Entrar como Admin:**
   - Ve a `https://TU-WEB.vercel.app/#/login`
   - Entra como Admin usando **EXACTAMENTE** el email que pusiste en la variable `ADMIN_EMAIL`.

3. **Restricción de Resend (Modo Prueba):**
   - Si no has verificado un dominio propio en Resend (cuesta dinero o requiere conocimientos técnicos), Resend solo enviará emails a la dirección de correo con la que te registraste.
   - **Para probar la app:** Cuando hagas un reporte como alumno, usa **tu propio email** (el de la cuenta de Resend) en el campo "Contacto". Así recibirás el código OTP.

---
Hecho con ❤️ para ayudar a crear espacios seguros.