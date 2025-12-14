import { sql } from '@vercel/postgres';
import nodemailer from 'nodemailer';

// Configuración de Brevo SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com', // Host explícito
  port: 587, // Puerto explícito
  secure: false, // false para puerto 587 (STARTTLS)
  auth: {
    user: process.env.BREVO_USER, // Se leerá de las variables de entorno
    pass: process.env.BREVO_API_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, code } = req.body;

  if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
  }

  try {
    // --- 1. SOLICITAR CÓDIGO (REQUEST) ---
    if (action === 'request') {
        // Generar código de 6 dígitos
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutos

        // Guardar en DB (Eliminamos anteriores para ese email para no ensuciar)
        await sql`DELETE FROM otp_codes WHERE email = ${email}`;
        await sql`
            INSERT INTO otp_codes (email, code, expires_at)
            VALUES (${email}, ${generatedCode}, ${expiresAt.toISOString()})
        `;

        // Enviar Email con Brevo
        // Nota: El remitente usará el identificador SMTP si no se especifica SENDER_EMAIL
        const sender = process.env.SENDER_EMAIL || process.env.BREVO_USER;
        
        await transporter.sendMail({
            from: `"SinBullying Seguridad" <${sender}>`,
            to: email,
            subject: 'Tu código de verificación - SinBullying',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #2563eb; text-align: center;">Verificación de Identidad</h2>
                    <p style="text-align: center; color: #4b5563;">Usa el siguiente código para completar tu reporte. Es válido por 10 minutos.</p>
                    <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e3a8a;">${generatedCode}</span>
                    </div>
                    <p style="text-align: center; font-size: 12px; color: #9ca3af;">Si no has solicitado este código, ignora este mensaje.</p>
                </div>
            `
        });

        return res.status(200).json({ message: 'Código enviado correctamente' });
    }

    // --- 2. VERIFICAR CÓDIGO (VERIFY) ---
    if (action === 'verify') {
        if (!code) return res.status(400).json({ error: 'Código requerido' });

        // Buscar código válido
        const { rows } = await sql`
            SELECT id FROM otp_codes 
            WHERE email = ${email} 
            AND code = ${code} 
            AND expires_at > NOW()
        `;

        if (rows.length > 0) {
            // Código válido: Lo borramos para que no se use dos veces
            await sql`DELETE FROM otp_codes WHERE id = ${rows[0].id}`;
            return res.status(200).json({ valid: true });
        } else {
            return res.status(400).json({ error: 'Código inválido o expirado' });
        }
    }

    return res.status(400).json({ error: 'Acción desconocida' });

  } catch (error) {
    console.error("OTP Error:", error);
    return res.status(500).json({ error: error.message });
  }
}