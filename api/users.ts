import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  try {
    // GET: List users (optionally filter by role)
    if (req.method === 'GET') {
      // En Node.js (Vercel), los query params ya vienen parseados en req.query
      const { role } = req.query;
      
      let result;
      if (role) {
        result = await sql`SELECT * FROM users WHERE role = ${role} ORDER BY created_at DESC`;
      } else {
        result = await sql`SELECT * FROM users ORDER BY created_at DESC`;
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

    // POST: Create user (Technician)
    if (req.method === 'POST') {
      const data = req.body;
      const role = data.role || 'technician';
      
      const { rows } = await sql`
        INSERT INTO users (name, last_name, email, role, phone, center)
        VALUES (${data.name}, ${data.lastName}, ${data.email}, ${role}, ${data.phone}, ${data.center})
        RETURNING *;
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
    return res.status(500).json({ error: error.message });
  }
}