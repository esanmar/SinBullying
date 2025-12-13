import { put } from '@vercel/blob';

// Desactivamos el body parser para que el stream del archivo llegue intacto a la función
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obtenemos el nombre del archivo de los query params
    const filename = req.query.filename || 'file';

    // Subimos el archivo directamente pasando el objeto 'req' (que es un stream en Node.js)
    const blob = await put(filename, req, {
      access: 'public',
    });

    return res.status(200).json(blob);

  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ error: error.message });
  }
}