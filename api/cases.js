
import { sql } from '@vercel/postgres';
import { Resend } from 'resend';

// Inicializamos Resend fuera del handler para reutilizar la conexión si es posible
// Se usará solo si existe la API KEY
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req) {
  try {
    // GET: List all cases
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM cases ORDER BY created_at DESC`;
      
      const cases = rows.map(r => ({
        id: r.id,
        studentId: r.student_id,
        description: r.description,
        dateOfIncident: r.date_of_incident,
        location: r.location,
        involvedPeople: r.involved_people,
        contactEmail: r.contact_email,
        contactPhone: r.contact_phone,
        status: r.status,
        adminNotes: r.admin_notes,
        assignedTechnicianId: r.assigned_technician_id,
        evidence: r.evidence_json || [],
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      return new Response(JSON.stringify(cases), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST: Create new case
    if (req.method === 'POST') {
      const data = await req.json();
      
      const { rows } = await sql`
        INSERT INTO cases (
          student_id, description, date_of_incident, location, 
          involved_people, contact_email, contact_phone, evidence_json
        ) VALUES (
          ${data.studentId}, ${data.description}, ${data.dateOfIncident}, ${data.location},
          ${data.involvedPeople}, ${data.contactEmail}, ${data.contactPhone}, ${JSON.stringify(data.evidence)}
        ) RETURNING id, created_at, status;
      `;

      const newCase = rows[0];

      // --- EMAIL NOTIFICATION LOGIC ---
      if (resend && process.env.ADMIN_EMAIL) {
          try {
            await resend.emails.send({
              from: 'SinBullying Alertas <onboarding@resend.dev>', // Usa onboarding@resend.dev si no tienes dominio propio verificado
              to: process.env.ADMIN_EMAIL,
              subject: `🚨 Nuevo Reporte de Bullying #${newCase.id.slice(0, 8)}`,
              html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                  <h2 style="color: #d32f2f;">Nuevo Caso Reportado</h2>
                  <p>Se ha registrado un nuevo incidente en la plataforma.</p>
                  
                  <ul style="background: #f9f9f9; padding: 15px; list-style: none;">
                    <li><strong>ID:</strong> ${newCase.id}</li>
                    <li><strong>Fecha Incidente:</strong> ${data.dateOfIncident}</li>
                    <li><strong>Ubicación:</strong> ${data.location}</li>
                    <li><strong>Descripción:</strong> ${data.description.substring(0, 100)}...</li>
                  </ul>

                  <a href="https://${req.headers.get('host')}/#/login" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
                    Ver en Panel de Admin
                  </a>
                </div>
              `
            });
            console.log("Email de alerta enviado a admin");
          } catch (emailError) {
            console.error("Error enviando email Resend:", emailError);
            // No fallamos el request si falla el email, solo lo logueamos
          }
      }

      return new Response(JSON.stringify({ ...data, ...newCase }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PUT: Update case (status or assignment)
    if (req.method === 'PUT') {
      const data = await req.json();
      
      if (data.status) {
        await sql`
          UPDATE cases 
          SET status = ${data.status}, admin_notes = ${data.adminNotes || null}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${data.id}
        `;
      }

      if (data.assignedTechnicianId !== undefined) {
         const techId = data.assignedTechnicianId === '' ? null : data.assignedTechnicianId;
         await sql`
          UPDATE cases 
          SET assigned_technician_id = ${techId}, status = 'revision', updated_at = CURRENT_TIMESTAMP
          WHERE id = ${data.id}
        `;
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
