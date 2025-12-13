import { Resend } from 'resend';

export const config = {
  runtime: 'edge',
};

// Inicializar Resend con la clave de entorno
// NOTA: Si no hay clave, fallará, lo cual es correcto para alertar al desarrollador.
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { type, to, data } = await req.json();

    // Validar configuración básica
    if (!process.env.RESEND_API_KEY) {
        throw new Error("Falta la variable RESEND_API_KEY en Vercel");
    }

    // Configuración del remitente
    // NOTA: Para pruebas sin dominio propio, usar 'onboarding@resend.dev'
    // y solo se puede enviar al email con el que te registraste en Resend.
    // Para producción, verifica tu dominio en Resend.
    const FROM_EMAIL = 'SinBullying <onboarding@resend.dev>'; 

    let subject = '';
    let html = '';

    if (type === 'otp') {
        subject = 'Tu código de verificación - SinBullying';
        html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Verificación de Identidad</h1>
                <p>Estás a punto de enviar un reporte. Usa el siguiente código para verificar que este es tu email:</p>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e3a8a;">${data.code}</span>
                </div>
                <p style="color: #6b7280; font-size: 12px;">Si no has solicitado esto, ignora este mensaje.</p>
            </div>
        `;
    } else if (type === 'new_case') {
        subject = '🚨 NUEVO REPORTE DE BULLYING';
        html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Se ha registrado un nuevo incidente</h2>
                <p><strong>Ubicación:</strong> ${data.location}</p>
                <p><strong>Descripción:</strong> ${data.description.substring(0, 100)}...</p>
                <p><strong>Fecha:</strong> ${data.date}</p>
                <br/>
                <a href="${data.url}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Caso Completo</a>
            </div>
        `;
    }

    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(emailData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Email Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}