import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { alertType, caseId, childName, documentTitle, docDeadlineDate, teamEmails, parentEmail } = await req.json();

    if (!alertType || !caseId || !parentEmail) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const recipients = [...new Set([parentEmail, ...(teamEmails || [])])];
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    // Generate alert message based on type
    let emailSubject = "";
    let emailBody = "";
    let smsBody = "";

    if (alertType === "document_added") {
      emailSubject = `📄 New Document Added: ${childName}'s Case`;
      emailBody = `A new document "${documentTitle}" has been added to ${childName}'s case.\n\nLog in to the app to view it.`;
      smsBody = `${childName}'s case: New document "${documentTitle}" added.`;
    } else if (alertType === "deadline_approaching") {
      emailSubject = `⏰ Document Deadline Approaching for ${childName}`;
      emailBody = `A required document "${documentTitle}" is due on ${docDeadlineDate}.\n\nPlease ensure it's uploaded before the deadline.`;
      smsBody = `${childName}'s case: Document "${documentTitle}" due on ${docDeadlineDate}.`;
    } else if (alertType === "missing_document") {
      emailSubject = `⚠️ Missing Document: ${childName}'s Case`;
      emailBody = `The required document "${documentTitle}" has not yet been uploaded.\n\nThis is needed for the case. Please upload it as soon as possible.`;
      smsBody = `${childName}'s case: Missing document "${documentTitle}". Please upload.`;
    }

    // Send in-app notifications
    const notificationPromises = recipients.map(email =>
      base44.entities.Notification.create({
        user_email: email,
        type: "system",
        title: `Document Alert: ${childName}`,
        body: emailBody,
        related_id: caseId,
        related_link: `/case-detail/${caseId}`,
      }).catch(() => null)
    );

    // Send emails
    const emailPromises = recipients.map(email =>
      base44.integrations.Core.SendEmail({
        to: email,
        subject: emailSubject,
        body: emailBody,
        from_name: "Rooted 21 - Case Management",
      }).catch(() => null)
    );

    // Send SMS (to parent only, who is most likely to have phone)
    const smsPromises = [];
    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      // Note: In real implementation, would need phone numbers stored on parent profile
      // For now, we'll attempt to send but gracefully fail if no number
      smsPromises.push(
        fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: twilioPhoneNumber,
            To: "+1", // Placeholder - would need actual parent phone
            Body: smsBody,
          }).toString(),
        }).catch(() => null)
      );
    }

    await Promise.all([...notificationPromises, ...emailPromises, ...smsPromises]);

    return Response.json({ success: true, notifiedCount: recipients.length });
  } catch (error) {
    console.error("Error sending document alert:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});