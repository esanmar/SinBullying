export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, role } = req.body;

  try {
    if (role === 'admin') {
      // 1. Recuperar la variable de entorno de Vercel
      const validAdminEmail = process.env.ADMIN_EMAIL;

      // 2. Verificar que la variable existe
      if (!validAdminEmail) {
        return res.status(500).json({ 
          error: "Error de configuración: ADMIN_EMAIL no está definido en Vercel." 
        });
      }

      // 3. Comparar el email recibido con la variable de entorno
      // (Soportamos mayúsculas/minúsculas y espacios accidentales)
      if (email.trim().toLowerCase() === validAdminEmail.trim().toLowerCase()) {
        return res.status(200).json({
          id: 'admin_master',
          name: 'Administrador',
          email: email,
          role: 'admin'
        });
      } else {
        return res.status(403).json({ 
          error: "Acceso denegado: Este correo no es el administrador." 
        });
      }
    }

    return res.status(400).json({ error: "Rol no soportado en este endpoint" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}