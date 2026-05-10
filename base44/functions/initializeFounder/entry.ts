import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const FOUNDER_EMAIL = "misty.stonerock88@gmail.com";

    // If this is the founder, ensure they have founder role
    if (user.email.toLowerCase() === FOUNDER_EMAIL.toLowerCase() && user.role !== "founder") {
      await base44.auth.updateMe({ role: "founder" });
      return Response.json({ success: true, message: "Founder role assigned", is_founder: true });
    }

    return Response.json({ 
      success: true, 
      is_founder: user.email.toLowerCase() === FOUNDER_EMAIL.toLowerCase(),
      role: user.role 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});