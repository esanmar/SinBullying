# Configuración de Vercel Blob Storage

## ¿Qué es Vercel Blob Storage?

Vercel Blob Storage es un servicio de almacenamiento de archivos integrado en Vercel que permite almacenar y servir archivos estáticos de forma rápida y segura.

### Ventajas sobre Google Cloud Storage

| Característica | Vercel Blob | Google Cloud Storage |
|---------------|-------------|---------------------|
| **Almacenamiento Gratis** | 10GB | 5GB |
| **Configuración** | 1 click | Compleja (JSON, service account) |
| **Variables de Entorno** | 1 (token) | 4 (project, email, key, bucket) |
| **Integración** | Nativa con Vercel | Requiere SDK externo |
| **CDN** | Edge Network incluido | Requiere configuración |

---

## Pasos para Configurar Vercel Blob Storage

### 1. Crear un Blob Store en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Navega a la pestaña **Storage**
3. Haz clic en **Create Database**
4. Selecciona **Blob** como tipo de almacenamiento
5. Dale un nombre (ejemplo: `sinbullying-evidence`)
6. Haz clic en **Create**

### 2. Conectar el Blob Store al Proyecto

1. Después de crear el Blob Store, verás una opción **Connect to Project**
2. Selecciona tu proyecto `sinbullying-app`
3. Vercel automáticamente agregará la variable de entorno `BLOB_READ_WRITE_TOKEN`

### 3. Verificar la Configuración

1. Ve a **Settings** > **Environment Variables** en tu proyecto
2. Deberías ver la variable `BLOB_READ_WRITE_TOKEN` configurada
3. Esta variable está disponible en todos los entornos (Production, Preview, Development)

### 4. Desplegar los Cambios

Una vez configurado el Blob Store, simplemente despliega tu proyecto:

```bash
git add .
git commit -m "Migrar a Vercel Blob Storage"
git push origin main
```

Vercel automáticamente detectará los cambios y desplegará la nueva versión.

---

## Límites del Plan Hobby (Gratis)

- **Almacenamiento**: 10GB
- **Ancho de banda**: 100GB/mes
- **Operaciones de escritura**: 1,000,000/mes
- **Operaciones de lectura**: Ilimitadas

Para la mayoría de escuelas, estos límites son más que suficientes.

---

## Desarrollo Local

Para usar Vercel Blob en desarrollo local:

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Vincular el proyecto
vercel link

# 3. Descargar variables de entorno
vercel env pull .env.local

# 4. Iniciar servidor de desarrollo
npm run dev
```

El token `BLOB_READ_WRITE_TOKEN` se descargará automáticamente a tu archivo `.env.local`.

---

## Migración desde Google Cloud Storage

Si ya tienes archivos en Google Cloud Storage, puedes migrarlos manualmente:

1. Descarga los archivos desde tu bucket de GCS
2. Súbelos al nuevo Blob Store usando la API
3. Actualiza las URLs en la base de datos si es necesario

**Nota**: Para nuevas instalaciones, simplemente usa Vercel Blob desde el inicio.

---

## Solución de Problemas

### Error: "BLOB_READ_WRITE_TOKEN no está configurado"

**Solución**: Asegúrate de haber conectado el Blob Store al proyecto en el dashboard de Vercel.

### Error: "Token inválido"

**Solución**: Regenera el token en el dashboard de Vercel:
1. Ve a Storage > Tu Blob Store
2. Haz clic en **Settings**
3. Regenera el token

### Los archivos no se suben

**Solución**: Verifica que el endpoint `/api/upload-blob` esté funcionando:
```bash
curl -X POST https://tu-app.vercel.app/api/upload-blob?filename=test.txt \
  -H "Content-Type: text/plain" \
  -d "test content"
```

---

## Seguridad

- Los archivos se almacenan con acceso público de lectura (`access: 'public'`)
- Las URLs son únicas y difíciles de adivinar
- Solo se permiten tipos de archivo específicos (imágenes, videos, PDFs)
- Límite de 10MB por archivo para prevenir abuso
- Las operaciones de escritura requieren autenticación (token)

---

## Más Información

- [Documentación oficial de Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- [Precios de Vercel Storage](https://vercel.com/docs/storage/vercel-blob/usage-and-pricing)
