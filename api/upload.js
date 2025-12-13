import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const filename = url.searchParams.get('filename') || 'file';

    // Vercel Blob hace el proceso extremadamente sencillo.
    // 'put' sube el stream directamente y devuelve la URL pública.
    // 'access: public' permite que las imágenes se vean en el dashboard.
    const blob = await put(filename, req.body, {
      access: 'public',
    });

    return new Response(JSON.stringify(blob), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}