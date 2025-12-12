import { put } from '@vercel/blob';

export const config = {
  runtime: 'nodejs',
};

// Tipos MIME permitidos para evidencias
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'application/pdf'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Obtener nombre del archivo desde query params
    const url = new URL(req.url);
    const originalName = url.searchParams.get('filename') || 'file';
    const contentType = req.headers.get('content-type') || 'application/octet-stream';

    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return new Response(JSON.stringify({ 
        error: 'Tipo de archivo no permitido. Solo se permiten imágenes, videos y PDFs.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar tamaño del archivo
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ 
        error: `El archivo es demasiado grande. Máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }), { 
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar que existe el token de Blob
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN no está configurado');
    }

    // Sanitizar nombre del archivo
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `evidence/${timestamp}-${sanitizedName}`;

    // Subir a Vercel Blob
    const blob = await put(filename, req.body, {
      access: 'public',
      contentType: contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return new Response(JSON.stringify({ 
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: blob.size
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Error al subir el archivo' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
