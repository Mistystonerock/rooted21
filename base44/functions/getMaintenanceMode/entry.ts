import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    // Public endpoint — called during app boot before auth is resolved.
    // comingSoonMode: false = app is live and open for public signup/login.
    // maintenanceMode: false = no maintenance banner.
    return Response.json({
      comingSoonMode: false,
      maintenanceMode: false
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});