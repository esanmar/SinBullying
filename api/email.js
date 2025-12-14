import nodemailer from 'nodemailer';

// Configuración de Brevo SMTP
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

    if (type === 'new_case') {
        const sender = process.env.SENDER_EMAIL || process.env.BREVO_USER;
        
        await transporter.sendMail({
            from: `"SinBullying Alertas" <${sender}>`,
            to: to,
            subject: '🚨 NUEVO REPORTE DE BULLYING',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Nuevo Incidente Registrado</h2>
                    <p><strong>Ubicación:</strong> ${data.location}</p>
                    <p><strong>Fecha:</strong> ${data.date}</p>
                    <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <strong>Descripción:</strong><br/>
                        ${data.description.substring(0, 300)}...
                    </div>
                    <br/>
                    <a href="${data.url}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Acceder a la Plataforma</a>
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