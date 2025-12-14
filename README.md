# 🛡️ Plataforma de Reporte de Bullying (SinBullying)

**SinBullying** es una plataforma web integral, segura y de código abierto diseñada para que centros educativos gestionen incidencias de acoso escolar. Facilita la comunicación entre estudiantes y el equipo de orientación, garantizando la privacidad y la trazabilidad de cada caso.

![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green)
![Estado](https://img.shields.io/badge/Estado-Producción-blue)
![Tech](https://img.shields.io/badge/Tech-React_Node_Postgres-indigo)

---

## 🌟 Funcionalidades Implementadas

### 👤 Rol: Estudiante
*   **Reporte de Casos**: Formulario intuitivo para describir incidentes, ubicación y fecha.
*   **Evidencias Multimedia**: Subida de imágenes (con compresión automática) y documentos PDF (hasta 3 archivos).
*   **Verificación de Seguridad (OTP)**: Sistema de doble factor mediante correo electrónico para validar la identidad del reportante antes de enviar el caso.
*   **Gestión de Historial**: Visualización de todos los reportes realizados y su estado actual (Pendiente, En Revisión, Resuelto).
*   **Edición y Trazabilidad**: Posibilidad de editar los detalles de un caso ya creado. El sistema guarda un registro (log) de qué cambió y cuándo.
*   **Notas Privadas**: Espacio para añadir notas o ampliaciones al caso visibles para los técnicos.
*   **Gestión de Perfil**: Edición de datos personales (Nombre, Teléfono) y cambio de contraseña.

### 🛠️ Rol: Técnico / Orientador
*   **Dashboard de Gestión**: Vista dual para ver "Mis Casos Asignados" y la "Bolsa de Casos" pendientes.
*   **Auto-asignación**: Capacidad de tomar casos de la bolsa general.
*   **Bitácora de Acciones**: Editor de texto enriquecido para registrar intervenciones (llamadas a padres, reuniones, medidas disciplinarias).
*   **Comunicación Rápida**: Enlaces directos a WhatsApp para contactar con el estudiante si ha proporcionado teléfono.
*   **Auditoría Completa**: Visualización del historial de cambios (Audit Logs) para ver quién modificó el caso y qué datos cambiaron.

### 👑 Rol: Administrador
*   **Visión Global**: Estadísticas en tiempo real (Casos totales, pendientes, resueltos).
*   **Gestión de Usuarios**: Altas, bajas y edición de Técnicos/Orientadores.
*   **Supervisión de Casos**: Capacidad de editar cualquier dato de cualquier caso, reasignar técnicos o cambiar estados.
*   **Notificaciones**: Recepción de correos electrónicos automáticos cuando se crea un nuevo caso.

### 🔒 Seguridad y Privacidad
*   **RGPD**: Banner de Cookies y Política de Privacidad integrada con check de aceptación obligatorio.
*   **Autenticación**: Login seguro y recuperación de contraseña vía email con tokens de un solo uso.
*   **Audit Logs (Trazabilidad)**: Sistema inmutable que registra cambios críticos en la base de datos (quién cambió qué, valor anterior y nuevo).

---

## 🚀 Guía de Despliegue Paso a Paso

Esta aplicación está diseñada para desplegarse gratuitamente en **Vercel** usando sus servicios de base de datos.

### Paso 1: Configuración de Email (Brevo)
Para enviar códigos de verificación (OTP) y notificaciones, necesitas un servicio SMTP. Usaremos Brevo (gratis 300 emails/día).

1.  Regístrate en [Brevo.com](https://www.brevo.com).
2.  Verifica tu cuenta y tu email.
3.  Ve a **Nombre > SMTP & API > Claves SMTP**.
4.  Genera una nueva clave SMTP.
    *   Copia el **Usuario** (ej: `tu_correo@smtp-brevo.com`).
    *   Copia la **Contraseña** (ej: `xsmtp-jw8...`).
5.  En **Senders & IP**, asegúrate de tener un email verificado (será el `SENDER_EMAIL`).

### Paso 2: Código Fuente (GitHub)
1.  Crea un repositorio en tu cuenta de GitHub.
2.  Sube todos los archivos de este proyecto al repositorio.

### Paso 3: Despliegue en Vercel
1.  Crea una cuenta en [Vercel.com](https://vercel.com).
2.  Haz clic en **"Add New..." > "Project"**.
3.  Importa tu repositorio de GitHub.
4.  En la configuración del proyecto ("Configure Project"), despliega la sección **Environment Variables** y añade las siguientes:

| Variable | Descripción | Valor Ejemplo |
|----------|-------------|---------------|
| `BREVO_USER` | Usuario SMTP de Brevo | `tu_user@smtp-brevo.com` |
| `BREVO_API_KEY` | Clave SMTP generada | `xsmtp-....` |
| `ADMIN_EMAIL` | Email para el login Admin | `director@escuela.com` |
| `ADMIN_PASSWORD` | Contraseña del Admin | `Admin1234Secure` |
| `SENDER_EMAIL` | Email verificado en Brevo (remitente) | `no-reply@escuela.com` |

5.  Haz clic en **Deploy**.

### Paso 4: Base de Datos y Almacenamiento
Una vez desplegado el proyecto (puede dar error la primera vez por falta de DB), ve al panel de control de tu proyecto en Vercel:

1.  Ve a la pestaña **Storage**.
2.  Haz clic en **Connect Store** y selecciona **Postgres**.
    *   Dale un nombre y selecciona la región más cercana.
    *   Vercel añadirá automáticamente las variables de entorno de la base de datos (`POSTGRES_URL`, etc.).
3.  Haz clic en **Connect Store** nuevamente y selecciona **Blob**.
    *   Esto se usará para subir las imágenes de evidencia.
    *   Vercel añadirá la variable `BLOB_READ_WRITE_TOKEN`.
4.  Ve a la pestaña **Deployments**, busca el último deployment y haz clic en **Redeploy** (para que coja las nuevas variables de la DB).

### Paso 5: Inicialización
Una vez que el proyecto esté activo (verde):

1.  Abre tu navegador y visita: `https://TU-PROYECTO.vercel.app/api/setup`
2.  Deberías ver un mensaje JSON confirmando que las tablas (`users`, `cases`, `otp_codes`, `case_audit_logs`) se han creado correctamente.

¡Listo! Ya puedes acceder a la aplicación.

---

## 📝 Uso Inicial

1.  Entra como **Administrador** usando el `ADMIN_EMAIL` y `ADMIN_PASSWORD` que configuraste.
2.  Ve a la pestaña "Equipo Técnico" y crea cuentas para tus orientadores/psicólogos.
3.  Comparte la URL con los estudiantes para que puedan registrarse o reportar casos.
