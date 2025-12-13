
import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
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
