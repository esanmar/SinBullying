import nodemailer from 'nodemailer';

// Configuración de Brevo SMTP (Reutilizable)
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

  try {
    const { type, to, data } = req.body;

    // Solo manejamos notificaciones de casos aquí ahora
    // La lógica de OTP se movió a api/otp.js para mayor seguridad

    if (type === 'new_case') {
        await transporter.sendMail({
            from: `"SinBullying Alertas" <${process.env.BREVO_USER}>`,
            to: to,
            subject: '🚨 NUEVO REPORTE DE BULLYING',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2 style="color: #dc2626;">Se ha registrado un nuevo incidente</h2>
                    <p><strong>Ubicación:</strong> ${data.location}</p>
                    <p><strong>Descripción:</strong> ${data.description.substring(0, 150)}...</p>
                    <p><strong>Fecha:</strong> ${data.date}</p>
                    <br/>
                    <a href="${data.url}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acceder a la Plataforma</a>
                </div>
            `
        });
        return res.status(200).json({ success: true });
    }

    return res.status(200).json({ message: 'Tipo de email no manejado o deprecado' });

  } catch (error) {
    console.error("Email Error:", error);
    return res.status(500).json({ error: error.message });
  }
}