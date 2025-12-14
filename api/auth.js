import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, role, password } = req.body;

  try {
    // --- 1. ADMIN (Variables de Entorno) ---
    if (role === 'admin') {
      const validAdminEmail = process.env.ADMIN_EMAIL;
      const validAdminPassword = process.env.ADMIN_PASSWORD;

      if (!validAdminEmail || !validAdminPassword) {
        return res.status(500).json({ error: "Error de configuración del servidor (Admin)." });
      }

      if (
        email.trim().toLowerCase() === validAdminEmail.trim().toLowerCase() && 
        password === validAdminPassword
      ) {
        return res.status(200).json({
          id: 'admin_master',
          name: 'Administrador',
          email: email,
          role: 'admin'
        });
      } else {
        return res.status(403).json({ error: "Credenciales de Administrador incorrectas." });
      }
    }

    // --- 2. USERS (Technician & Student) ---
    if (role === 'technician' || role === 'student') {
        // Buscar usuario en DB
        const { rows } = await sql`SELECT * FROM users WHERE email = ${email} AND role = ${role}`;
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado o rol incorrecto." });
        }

        const user = rows[0];

        // Verificar contraseña
        if (!user.password) {
             // Caso legacy o registro incompleto
             return res.status(403).json({ error: "Este usuario no tiene contraseña configurada. Solicita un reset." });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(403).json({ error: "Contraseña incorrecta." });
        }

        return res.status(200).json({
            id: user.id,
            name: user.name,
            lastName: user.last_name,
            email: user.email,
            role: user.role,
            center: user.center,
            phone: user.phone
        });
    }

    return res.status(400).json({ error: "Rol no soportado" });

  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(500).json({ error: error.message });
  }
}