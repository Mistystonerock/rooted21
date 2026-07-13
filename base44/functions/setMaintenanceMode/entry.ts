import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'founder') {
      return Response.json({ error: 'Founder access required' }, { status: 403 });
    }

    const body = await req.json();
    const { enabled, comingSoonMode: comingSoon } = body;

    let existing = [];
    try {
      existing = await base44.asServiceRole.entities.AppSetting.filter({ key: "maintenance_mode" });
    } catch (_e) {
      existing = [];
    }

    const current = existing.length > 0 ? JSON.parse(existing[0].value || "{}") : {};
    const newState = {
      maintenanceMode: typeof enabled === 'boolean' ? enabled : (current.maintenanceMode === true),
      comingSoonMode: typeof comingSoon === 'boolean' ? comingSoon : (current.comingSoonMode === true)
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.AppSetting.update(existing[0].id, {
        value: JSON.stringify(newState),
        updated_by: user.email
      });
    } else {
      await base44.asServiceRole.entities.AppSetting.create({
        key: "maintenance_mode",
        value: JSON.stringify(newState),
        updated_by: user.email
      });
    }

    return Response.json(newState);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});