import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, token, newPassword } = req.body;

  try {
    // 1. SOLICITAR RECUPERACIÓN (Mandar Email)
    if (action === 'request') {
        // Verificar si usuario existe
        const { rows } = await sql`SELECT id FROM users WHERE email = ${email}`;
        if (rows.length === 0) {
            // Por seguridad, no decimos si existe o no, simulamos éxito
            return res.status(200).json({ message: 'Si el email existe, se han enviado instrucciones.' });
        }

        // Generar token simple
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expires = new Date(Date.now() + 3600000); // 1 hora

        // Guardar en DB
        await sql`
            UPDATE users 
            SET reset_token = ${resetToken}, reset_token_expires = ${expires.toISOString()}
            WHERE email = ${email}
        `;

        // Enviar Email
        const resetLink = `${req.headers.origin}/#/reset-password?token=${resetToken}&email=${email}`;
        
        await resend.emails.send({
            from: 'SinBullying <onboarding@resend.dev>',
            to: [email],
            subject: 'Restablecer contraseña - SinBullying',
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

        return res.status(200).json({ message: 'Email enviado' });
    }

    // 2. EJECUTAR RESET (Cambiar contraseña)
    if (action === 'reset') {
        if (!token || !newPassword || !email) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        // Verificar token y expiración
        const { rows } = await sql`
            SELECT id FROM users 
            WHERE email = ${email} 
            AND reset_token = ${token} 
            AND reset_token_expires > NOW()
        `;

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        // Encriptar nueva password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Actualizar y borrar token
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