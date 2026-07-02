import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CONNECTOR_ID = "6a45d8f357feb3849b4a49fe";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    const response = await fetch('https://meet.googleapis.com/v2/spaces', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    if (!response.ok) {
      return Response.json({ error: data.error?.message || 'Failed to create Meet link' }, { status: response.status });
    }

    return Response.json({ meetingUri: data.meetingUri, meetingCode: data.meetingCode, name: data.name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});