import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

const RECORD_IDS = [
  "6a4733788a477dc440243498",
  "6a4734b17c2485459988c6dd",
  "6a4734c2900ccb0e225b66dc",
  "6a4734c2eebbac7302c70bfc",
  "6a4734c6af594ea40fd814d0",
  "6a47353fdc10c4d0f207db07",
  "6a47361c9981ba6da95c4b14",
  "6a4736dc09899251ea9ab97a",
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || (user.role !== "admin" && user.role !== "founder")) {
      return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const ts = new Date().toISOString();
    const deleted_ids = [];
    const errors = [];

    for (const id of RECORD_IDS) {
      try {
        await base44.asServiceRole.entities.SOSIncident.update(id, {
          is_deleted: true,
          deleted_at: ts,
          deleted_by: "system_cleanup",
        });
        deleted_ids.push(id);
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }

    return Response.json({
      success: true,
      deleted_count: deleted_ids.length,
      deleted_ids,
      errors,
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});