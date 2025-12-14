import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // GET
    if (req.method === 'GET') {
      const { logsForCaseId } = req.query;

      // Sub-request: Fetch Logs for a specific case
      if (logsForCaseId) {
          const { rows } = await sql`
            SELECT * FROM case_audit_logs 
            WHERE case_id = ${logsForCaseId} 
            ORDER BY timestamp DESC
          `;
          const logs = rows.map(r => ({
              id: r.id,
              caseId: r.case_id,
              changedBy: r.changed_by,
              field: r.field,
              oldValue: r.old_value,
              newValue: r.new_value,
              timestamp: r.timestamp
          }));
          return res.status(200).json(logs);
      }

      // Standard request: List all cases
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
        studentNotes: r.student_notes,
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

    // PUT: Update case (Handles Status, Assignment, Actions, Notes AND Full Edit)
    if (req.method === 'PUT') {
      const data = req.body;
      const caseId = data.id;

      if (!caseId) return res.status(400).json({ error: "Falta ID del caso" });

      // -- Flujos Específicos (Sin log detallado o log simple) --

      if (data.status) {
        await sql`
          UPDATE cases 
          SET status = ${data.status}, admin_notes = ${data.adminNotes || null}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${caseId}
        `;
        // Log cambio estado (opcional, simplificado aquí)
        if (data.modifierUser) {
           await sql`INSERT INTO case_audit_logs (case_id, changed_by, field, new_value) VALUES (${caseId}, ${data.modifierUser}, 'Estado', ${data.status})`;
        }
      }

      if (data.assignedTechnicianId !== undefined) {
         const techId = data.assignedTechnicianId === '' ? null : data.assignedTechnicianId;
         await sql`
          UPDATE cases 
          SET assigned_technician_id = ${techId}, status = 'revision', updated_at = CURRENT_TIMESTAMP
          WHERE id = ${caseId}
        `;
      }

      if (data.technicianActions !== undefined) {
          await sql`UPDATE cases SET technician_actions = ${data.technicianActions}, updated_at = CURRENT_TIMESTAMP WHERE id = ${caseId}`;
      }

      if (data.studentNotes !== undefined) {
          await sql`UPDATE cases SET student_notes = ${data.studentNotes}, updated_at = CURRENT_TIMESTAMP WHERE id = ${caseId}`;
      }

      // -- Flujo de EDICIÓN COMPLETA (Trazabilidad) --
      if (data.fullEdit && data.modifierUser) {
          // 1. Obtener estado actual
          const currentResult = await sql`SELECT * FROM cases WHERE id = ${caseId}`;
          if (currentResult.rows.length === 0) return res.status(404).json({error: "Caso no encontrado"});
          const current = currentResult.rows[0];

          // 2. Definir campos editables
          const fieldsToCheck = [
              { key: 'description', dbKey: 'description', label: 'Descripción' },
              { key: 'location', dbKey: 'location', label: 'Ubicación' },
              { key: 'dateOfIncident', dbKey: 'date_of_incident', label: 'Fecha Incidente' },
              { key: 'involvedPeople', dbKey: 'involved_people', label: 'Implicados' },
              { key: 'contactEmail', dbKey: 'contact_email', label: 'Email Contacto' },
              { key: 'contactPhone', dbKey: 'contact_phone', label: 'Teléfono Contacto' }
          ];

          // 3. Comparar y guardar logs
          for (const field of fieldsToCheck) {
              const newValue = data[field.key];
              const oldValue = current[field.dbKey];

              // Comparamos strings para evitar falsos positivos
              if (newValue !== undefined && String(newValue).trim() !== String(oldValue).trim()) {
                  await sql`
                      INSERT INTO case_audit_logs (case_id, changed_by, field, old_value, new_value)
                      VALUES (${caseId}, ${data.modifierUser}, ${field.label}, ${oldValue}, ${newValue})
                  `;
              }
          }

          // 4. Actualizar registro
          await sql`
              UPDATE cases SET
                  description = ${data.description},
                  location = ${data.location},
                  date_of_incident = ${data.dateOfIncident},
                  involved_people = ${data.involvedPeople},
                  contact_email = ${data.contactEmail},
                  contact_phone = ${data.contactPhone},
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ${caseId}
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