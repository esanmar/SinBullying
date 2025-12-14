import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_API_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, token, newPassword } = req.body;

  try {
    // 1. SOLICITAR RECUPERACIÓN
    if (action === 'request') {
        const { rows } = await sql`SELECT id FROM users WHERE email = ${email}`;
        
        // Si el usuario existe, procesamos
        if (rows.length > 0) {
            const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const expires = new Date(Date.now() + 3600000); // 1 hora

            await sql`
                UPDATE users 
                SET reset_token = ${resetToken}, reset_token_expires = ${expires.toISOString()}
                WHERE email = ${email}
            `;

            const resetLink = `${req.headers.origin}/#/reset-password?token=${resetToken}&email=${email}`;
            
            await transporter.sendMail({
                from: `"SinBullying Soporte" <${process.env.BREVO_USER}>`,
                to: email,
                subject: 'Restablecer contraseña',
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>Recuperación de Contraseña</h2>
                        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón:</p>
                        <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
                            Restablecer Contraseña
                        </a>
                        <p style="margin-top: 20px; font-size: 12px; color: #666;">Este enlace expira en 1 hora.</p>
                    </div>
                `
            });
        }
        
        // Siempre devolvemos éxito por seguridad (user enumeration prevention)
        return res.status(200).json({ message: 'Instrucciones enviadas si el email existe.' });
    }

    // 2. EJECUTAR RESET
    if (action === 'reset') {
        if (!token || !newPassword || !email) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        const { rows } = await sql`
            SELECT id FROM users 
            WHERE email = ${email} 
            AND reset_token = ${token} 
            AND reset_token_expires > NOW()
        `;

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await sql`
            UPDATE users 
            SET password = ${hashedPassword}, reset_token = NULL, reset_token_expires = NULL
            WHERE id = ${rows[0].id}
        `;

        return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Acción desconocida' });

  } catch (error) {
    console.error("Password Reset Error:", error);
    return res.status(500).json({ error: error.message });
  }
}