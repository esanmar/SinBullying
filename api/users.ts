import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export default async function handler(req: any, res: any) {
  try {
    // GET: List users (para admin, filtrando por rol)
    if (req.method === 'GET') {
      const { role } = req.query;
      
      let result;
      if (role) {
        result = await sql`SELECT id, name, last_name, email, role, phone, center, created_at FROM users WHERE role = ${role} ORDER BY created_at DESC`;
      } else {
        result = await sql`SELECT id, name, last_name, email, role, phone, center, created_at FROM users ORDER BY created_at DESC`;
      }
      
      const users = result.rows.map(u => ({
          id: u.id,
          name: u.name,
          lastName: u.last_name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          center: u.center
      }));

      return res.status(200).json(users);
    }

    // POST: Register User (Technician or Student)
    if (req.method === 'POST') {
      const data = req.body;
      
      // Validaciones básicas
      if (!data.email || !data.password || !data.name) {
          return res.status(400).json({ error: "Faltan datos obligatorios (email, password, nombre)" });
      }

      // Validar si ya existe
      const existing = await sql`SELECT id FROM users WHERE email = ${data.email}`;
      if (existing.rows.length > 0) {
          return res.status(409).json({ error: "El email ya está registrado." });
      }

      const role = data.role || 'technician';
      
      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      
      const { rows } = await sql`
        INSERT INTO users (name, last_name, email, password, role, phone, center)
        VALUES (${data.name}, ${data.lastName}, ${data.email}, ${hashedPassword}, ${role}, ${data.phone}, ${data.center})
        RETURNING id, name, last_name, email, role, phone, center;
      `;
      
      const u = rows[0];
      const newUser = {
          id: u.id,
          name: u.name,
          lastName: u.last_name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          center: u.center
      };

      return res.status(201).json(newUser);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}