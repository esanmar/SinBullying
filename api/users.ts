import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    // GET: List users (optionally filter by role)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const role = url.searchParams.get('role');
      
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

      return new Response(JSON.stringify(users), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST: Create user (Technician)
    if (req.method === 'POST') {
      const data = await req.json();
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

      return new Response(JSON.stringify(newUser), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}