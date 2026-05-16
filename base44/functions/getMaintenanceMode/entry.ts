import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const settings = await base44.asServiceRole.entities.AppSetting.filter({ key: 'maintenance_mode' }, '', 1);
    const setting = settings[0];
    return Response.json({ maintenanceMode: setting ? setting.value === 'true' : true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});