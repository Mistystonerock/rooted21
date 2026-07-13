import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let comingSoonMode = false;
    let maintenanceMode = false;

    try {
      const settings = await base44.asServiceRole.entities.AppSetting.filter({ key: "maintenance_mode" });
      if (settings.length > 0) {
        const val = JSON.parse(settings[0].value || "{}");
        comingSoonMode = val.comingSoonMode !== false;
        maintenanceMode = val.maintenanceMode === true;
      }
    } catch (_e) {
      // AppSetting entity may not exist yet; fall back to defaults.
    }

    return Response.json({ comingSoonMode, maintenanceMode });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});