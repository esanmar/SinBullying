
import { Storage } from '@google-cloud/storage';

// Nota: La librería de Google Cloud requiere Node.js, no Edge Runtime.
// Por eso eliminamos la config 'runtime: edge'.

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(req.url);
    // Sanitizamos el nombre del archivo para evitar problemas en GCS
    const originalName = url.searchParams.get('filename') || 'file';
    const timestamp = Date.now();
    const filename = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Validación básica de tamaño (4.5MB límite para proteger función serverless y evitar timeouts)
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 4.5 * 1024 * 1024) {
         return new Response(JSON.stringify({ error: 'El archivo es demasiado grande (Max 4.5MB)' }), { status: 413 });
    }

    // Verificar credenciales
    if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_BUCKET_NAME) {
        throw new Error("Faltan credenciales de Google Cloud en variables de entorno");
    }

    // Inicializar cliente GCS
    const storage = new Storage({
      projectId: process.env.GOOGLE_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // Vercel a veces escapa los saltos de línea en variables de entorno, esto lo corrige:
        private_key: process.env.GOOGLE_PRIVATE_KEY.split(String.raw`\n`).join('\n'),
      },
    });

    const bucketName = process.env.GOOGLE_BUCKET_NAME;
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filename);

    // Convertir el stream del Request a Buffer para subirlo
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir archivo
    await file.save(buffer, {
        metadata: {
            contentType: req.headers.get('content-type') || 'application/octet-stream',
        },
        resumable: false 
    });

    // Hacer público el archivo (Opcional: Si prefieres seguridad total, usa signed URLs, 
    // pero para este dashboard simplificado usamos acceso público de lectura)
    await file.makePublic();

    // Construir URL pública
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
