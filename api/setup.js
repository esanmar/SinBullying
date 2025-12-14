import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // 1. Tabla de Usuarios
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        last_name TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'technician')),
        phone TEXT,
        center TEXT,
        reset_token TEXT,
        reset_token_expires TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;`;
    } catch (e) { console.log("Migración users: columnas ya existen"); }

    // 2. Tabla de Casos
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
        technician_actions TEXT, 
        student_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Intentar añadir la columnas nuevas si la tabla ya existía
    try {
        await sql`ALTER TABLE cases ADD COLUMN IF NOT EXISTS technician_actions TEXT;`;
        await sql`ALTER TABLE cases ADD COLUMN IF NOT EXISTS student_notes TEXT;`;
    } catch (e) { console.log("Migración cases: columnas extra ya existen"); }


    // 3. Tabla de Códigos OTP (Para verificación segura)
    await sql`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`DELETE FROM otp_codes WHERE expires_at < NOW()`;

    // 4. Tabla de Trazabilidad (Logs de Cambios)
    await sql`
      CREATE TABLE IF NOT EXISTS case_audit_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        case_id UUID REFERENCES cases(id),
        changed_by TEXT NOT NULL,
        field TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return res.status(200).json({ message: 'Base de datos actualizada con tabla de logs.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}