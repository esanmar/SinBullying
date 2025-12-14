import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
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
        technicianActions: r.technician_actions,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      return res.status(200).json(cases);
    }

    // POST: Create new case
    if (req.method === 'POST') {
      const data = req.body;
      
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

      return res.status(201).json({ ...data, ...newCase });
    }

    // PUT: Update case (status, assignment, or actions)
    if (req.method === 'PUT') {
      const data = req.body;
      
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

      // Nuevo: Actualizar acciones del técnico
      if (data.technicianActions !== undefined) {
          await sql`
            UPDATE cases
            SET technician_actions = ${data.technicianActions}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${data.id}
          `;
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}