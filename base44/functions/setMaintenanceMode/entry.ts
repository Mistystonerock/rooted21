import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.email !== 'misty.stonerock88@gmail.com' && user?.role !== 'founder') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const value = body.maintenanceMode === true ? 'true' : 'false';
    const settings = await base44.asServiceRole.entities.AppSetting.filter({ key: 'maintenance_mode' }, '', 1);
    let setting;

    if (settings[0]) {
      setting = await base44.asServiceRole.entities.AppSetting.update(settings[0].id, { value, updated_by: user.email });
    } else {
      setting = await base44.asServiceRole.entities.AppSetting.create({ key: 'maintenance_mode', value, updated_by: user.email });
    }

    return Response.json({ maintenanceMode: setting.value === 'true' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});