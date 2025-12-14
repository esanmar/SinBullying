# Plataforma de Reporte de Bullying (SinBullying)

Una plataforma de código abierto para que centros educativos gestionen reportes de acoso escolar de forma segura.

![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green)
![Coste](https://img.shields.io/badge/Coste-100%25_Gratis-blue)

## 💰 ¿Cuánto cuesta?
Este proyecto está diseñado para funcionar **gratis** con las capas gratuitas de los proveedores:
- **Vercel Plan Hobby:** Alojamiento, Base de Datos y Almacenamiento (Gratis para siempre).
- **Brevo (Antes Sendinblue):** Envío de correos (300/día gratis), mucho más sencillo de configurar.

---

## ✨ Características

- **Panel de Estudiante:** Reporte anónimo/identificado, subida de pruebas y chat WhatsApp.
- **Panel de Administración:** Gestión de casos, asignación de técnicos y estadísticas.
- **Seguridad:** Verificación por código (OTP) seguro en base de datos.

---

## 📝 Paso 1: Crear Cuentas (Prerrequisitos)

### 1. Crear cuenta en Vercel
1. Ve a [vercel.com/signup](https://vercel.com/signup).
2. Selecciona **"Hobby"**.
3. Escribe tu nombre y elige **"Continue with GitHub"**.

### 2. Obtener la Clave SMTP de Brevo
Brevo es el servicio de email.
1. Ve a [brevo.com](https://www.brevo.com/es/) y crea una cuenta gratuita.
2. Arriba a la derecha, haz clic en tu nombre -> **SMTP & API**.
3. Ve a la pestaña **Claves SMTP** (No API Keys).
4. Haz clic en **Generar una nueva clave SMTP**.
5. Copia esa clave. Necesitarás:
   - Tu email de login de Brevo (ej: `admin@colegio.com`).
   - La clave que acabas de copiar.

---

## 🚀 Paso 2: Despliegue (Instalación)

1. Sube los archivos de este proyecto a tu propia cuenta de GitHub.
2. Ve a tu panel de Vercel y crea un **Nuevo Proyecto** importando ese repositorio.
3. En la sección **Environment Variables**, añade estas 4 variables:
   - **`BREVO_USER`**: Tu email de login en Brevo.
   - **`BREVO_API_KEY`**: La clave SMTP que copiaste en el paso anterior.
   - **`ADMIN_EMAIL`**: El correo del director/admin para entrar a la app.
   - **`ADMIN_PASSWORD`**: Una contraseña segura para el admin.

4. Dale a **Deploy**.
5. Una vez termine, ve a la pestaña **Storage** de tu proyecto en Vercel:
   - Dale a "Connect Store" -> "Postgres" -> "Create New".
   - Dale a "Connect Store" -> "Blob" -> "Create New".

---

## ⚙️ Paso 3: Configuración Final
Una vez que la web esté online:

1. **Crear las tablas:**
   - Abre en tu navegador: `https://TU-WEB.vercel.app/api/setup`
   - Debes ver el mensaje de éxito confirmando la creación de tablas y sistema OTP.

2. **Entrar como Admin:**
   - Ve a `https://TU-WEB.vercel.app/#/login`
   - Selecciona el rol **Admin**.

Hecho con ❤️ para ayudar a crear espacios seguros.