# Guía de Configuración SMTP para Emails

## ¿Por qué SMTP en lugar de Resend?

**Ventajas de usar SMTP directo:**

✅ **Sin dependencias externas** - No necesitas crear cuenta en servicios de terceros  
✅ **Gratis** - Usa tu email existente (Gmail, Outlook, etc.)  
✅ **Control total** - Usas tu propio servidor de correo  
✅ **Sin límites de API** - No hay restricciones de terceros  
✅ **Más privacidad** - Los emails no pasan por servicios externos  

---

## Opciones de Configuración SMTP

### Opción 1: Gmail (Recomendado para Pruebas)

**Ventajas:**
- Fácil de configurar
- Gratis
- Confiable

**Limitaciones:**
- Máximo 500 emails/día
- Requiere contraseña de aplicación

#### Pasos para Gmail:

1. **Activar Verificación en 2 Pasos:**
   - Ve a https://myaccount.google.com/security
   - Activa "Verificación en dos pasos"

2. **Crear Contraseña de Aplicación:**
   - Ve a https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Escribe "SinBullying"
   - Haz clic en "Generar"
   - **Copia la contraseña de 16 caracteres** (ejemplo: `abcd efgh ijkl mnop`)

3. **Configurar Variables en Vercel:**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop
   SMTP_FROM="SinBullying Alertas" <tu-email@gmail.com>
   ADMIN_EMAIL=director@escuela.edu
   ```

---

### Opción 2: Outlook / Hotmail

**Ventajas:**
- Fácil de configurar
- Gratis
- Buena deliverability

**Limitaciones:**
- Máximo 300 emails/día

#### Configuración para Outlook:

```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@outlook.com
SMTP_PASS=tu-contraseña-normal
SMTP_FROM="SinBullying Alertas" <tu-email@outlook.com>
ADMIN_EMAIL=director@escuela.edu
```

**Nota:** Outlook permite usar tu contraseña normal, no requiere contraseña de aplicación.

---

### Opción 3: Yahoo Mail

#### Configuración para Yahoo:

1. **Crear Contraseña de Aplicación:**
   - Ve a https://login.yahoo.com/account/security
   - Genera una contraseña de aplicación

2. **Variables:**
   ```
   SMTP_HOST=smtp.mail.yahoo.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=tu-email@yahoo.com
   SMTP_PASS=contraseña-de-aplicacion
   SMTP_FROM="SinBullying Alertas" <tu-email@yahoo.com>
   ADMIN_EMAIL=director@escuela.edu
   ```

---

### Opción 4: Servidor SMTP Propio

Si tu escuela tiene su propio servidor de correo:

```
SMTP_HOST=mail.tuescuela.edu
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=reportes@tuescuela.edu
SMTP_PASS=contraseña-del-servidor
SMTP_FROM="SinBullying Alertas" <reportes@tuescuela.edu>
ADMIN_EMAIL=director@tuescuela.edu
```

**Contacta con tu departamento de IT** para obtener:
- Servidor SMTP
- Puerto
- Credenciales

---

### Opción 5: Servicios SMTP Gratuitos

Otros servicios SMTP gratuitos que puedes usar:

| Servicio | Host | Puerto | Límite Gratis |
|----------|------|--------|---------------|
| **SendGrid** | smtp.sendgrid.net | 587 | 100 emails/día |
| **Mailgun** | smtp.mailgun.org | 587 | 100 emails/día |
| **Brevo (Sendinblue)** | smtp-relay.brevo.com | 587 | 300 emails/día |
| **Elastic Email** | smtp.elasticemail.com | 2525 | 100 emails/día |

---

## Configurar en Vercel

### Durante el Despliegue:

Vercel te pedirá las variables de entorno. Añade:

1. `SMTP_HOST`
2. `SMTP_PORT`
3. `SMTP_SECURE`
4. `SMTP_USER`
5. `SMTP_PASS`
6. `SMTP_FROM` (opcional)
7. `ADMIN_EMAIL`

### Después del Despliegue:

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. **Settings** > **Environment Variables**
3. Haz clic en **Add New** para cada variable
4. Marca todas las opciones: Production, Preview, Development
5. Haz clic en **Save**
6. **Redespliega** el proyecto

---

## Probar la Configuración

### 1. Verificar Variables

En Vercel Dashboard > Settings > Environment Variables, deberías ver:

- ✅ `SMTP_HOST`
- ✅ `SMTP_PORT`
- ✅ `SMTP_SECURE`
- ✅ `SMTP_USER`
- ✅ `SMTP_PASS`
- ✅ `ADMIN_EMAIL`

### 2. Crear un Reporte de Prueba

1. Ve a tu aplicación desplegada
2. Inicia sesión como estudiante
3. Crea un reporte de prueba
4. Verifica que llegue el email a `ADMIN_EMAIL`

### 3. Revisar Logs

Si no llega el email:

1. Ve a Vercel Dashboard > Deployments
2. Haz clic en tu último despliegue
3. Ve a **Functions** > `api/cases`
4. Busca errores en los logs

---

## Solución de Problemas

### Error: "Invalid login"

**Causa:** Credenciales incorrectas.

**Solución:**
- Verifica `SMTP_USER` y `SMTP_PASS`
- Para Gmail, asegúrate de usar contraseña de aplicación
- Para Outlook, verifica tu contraseña normal

### Error: "Connection timeout"

**Causa:** Puerto o host incorrectos.

**Solución:**
- Verifica `SMTP_HOST` y `SMTP_PORT`
- Prueba con puerto 465 y `SMTP_SECURE=true`

### Error: "Self-signed certificate"

**Causa:** Problemas con SSL/TLS.

**Solución:**
- Cambia `SMTP_SECURE` a `false`
- Usa puerto 587 en lugar de 465

### Los emails llegan a spam

**Solución:**
- Usa un email verificado en `SMTP_FROM`
- Configura SPF y DKIM en tu dominio (avanzado)
- Pide al administrador que añada tu email a la lista blanca

---

## Seguridad

### Mejores Prácticas:

✅ **Nunca** compartas tus contraseñas de aplicación  
✅ **Nunca** subas las contraseñas a Git  
✅ Usa contraseñas de aplicación en lugar de contraseñas normales  
✅ Revoca las contraseñas de aplicación si dejas de usar el servicio  
✅ Usa un email dedicado para la aplicación (ej: `reportes@escuela.edu`)  

---

## Comparación: SMTP vs Resend

| Aspecto | SMTP (nodemailer) | Resend |
|---------|-------------------|--------|
| **Costo** | Gratis | Gratis hasta 3,000 emails/mes |
| **Configuración** | 6 variables | 1 variable (API key) |
| **Dependencias** | Sin servicios externos | Requiere cuenta en Resend |
| **Límites** | Según proveedor (500-3000/día) | 3,000/mes gratis |
| **Privacidad** | Total (tu servidor) | Pasa por Resend |
| **Deliverability** | Depende del proveedor | Muy buena |
| **Soporte** | Depende del proveedor | Soporte de Resend |

**Recomendación:** 
- Para **escuelas pequeñas** (< 50 reportes/mes): **SMTP con Gmail/Outlook**
- Para **escuelas grandes** (> 100 reportes/mes): Considera Resend o servidor SMTP propio

---

## Ejemplo Completo: Gmail

```bash
# En Vercel Dashboard > Settings > Environment Variables

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=reportes.escuela@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM="SinBullying - Escuela XYZ" <reportes.escuela@gmail.com>
ADMIN_EMAIL=director@escuela.edu
```

---

## Recursos Adicionales

- [Documentación de Nodemailer](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Outlook SMTP Settings](https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353)

---

**Con esta configuración, puedes enviar emails sin depender de servicios externos como Resend.** ✅
