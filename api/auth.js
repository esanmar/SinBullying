export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, role, password } = req.body;

  try {
    if (role === 'admin') {
      // 1. Recuperar variables de entorno
      const validAdminEmail = process.env.ADMIN_EMAIL;
      const validAdminPassword = process.env.ADMIN_PASSWORD;

      // 2. Verificar configuración del servidor
      if (!validAdminEmail || !validAdminPassword) {
        return res.status(500).json({ 
          error: "Error de configuración: ADMIN_EMAIL o ADMIN_PASSWORD no definidos en Vercel." 
        });
      }

      // 3. Verificar Credenciales
      const isEmailValid = email.trim().toLowerCase() === validAdminEmail.trim().toLowerCase();
      // La contraseña debe coincidir exactamente (case sensitive)
      const isPasswordValid = password === validAdminPassword;

      if (isEmailValid && isPasswordValid) {
        return res.status(200).json({
          id: 'admin_master',
          name: 'Administrador',
          email: email,
          role: 'admin'
        });
      } else {
        // Retornamos un error genérico por seguridad, o específico si prefieres debug
        return res.status(403).json({ 
          error: "Credenciales incorrectas (Email o Contraseña no válidos)." 
        });
      }
    }

    return res.status(400).json({ error: "Rol no soportado en este endpoint" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}