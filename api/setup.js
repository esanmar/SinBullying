
import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    // 1. Crear Tabla de Usuarios (Técnicos)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        last_name TEXT,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'technician')),
        phone TEXT,
        center TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Crear Tabla de Casos
    await sql`
      CREATE TABLE IF NOT EXISTS cases (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        student_id TEXT NOT NULL,
        description TEXT NOT NULL,
        date_of_incident TEXT,
        location TEXT,
        involved_people TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        status TEXT DEFAULT 'pendiente',
        admin_notes TEXT,
        assigned_technician_id UUID REFERENCES users(id),
        evidence_json JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return new Response(JSON.stringify({ message: 'Tablas creadas correctamente' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
