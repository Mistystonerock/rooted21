import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function isCourtRelated(text) {
  return /court|hearing|review|custody|case plan|deadline|filing|appearance/i.test(text || '');
}

function courtMetadataNote(metadata = {}) {
  const parts = [];
  if (metadata.case_number || metadata.primary_case_number) parts.push(`Case #: ${metadata.case_number || metadata.primary_case_number}`);
  if (metadata.judge_name || metadata.primary_judge_name) parts.push(`Judge/Magistrate: ${metadata.judge_name || metadata.primary_judge_name}`);
  if (metadata.court_name) parts.push(`Court: ${metadata.court_name}`);
  if (metadata.hearing_type) parts.push(`Hearing: ${metadata.hearing_type}`);
  return parts.join(' · ');
}

function normalizeEventType(item, fallbackTitle) {
  const text = `${item?.event_type || ''} ${item?.title || ''} ${fallbackTitle || ''} ${item?.hearing_type || ''}`;
  if (isCourtRelated(text)) return 'court_date';
  if (/iep|school/i.test(text)) return 'school_meeting';
  if (/therapy|counsel/i.test(text)) return 'therapy';
  if (/medication|medical/i.test(text)) return 'appointment';
  return 'appointment';
}

function daysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${date}T12:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const documentId = payload.document_id;
    const documentTitle = payload.document_title || 'Scanned document';
    const childName = payload.child_name || '';
    const calendarItems = Array.isArray(payload.calendar_items) ? payload.calendar_items : [];
    const deadlines = Array.isArray(payload.deadlines) ? payload.deadlines : [];
    const keyDates = Array.isArray(payload.key_dates) ? payload.key_dates : [];
    const courtDates = Array.isArray(payload.court_dates) ? payload.court_dates : [];
    const courtMetadata = payload.court_metadata || {};

    const candidates = [];

    for (const item of courtDates) {
      if (!item?.date) continue;
      const metadataNote = courtMetadataNote({ ...courtMetadata, ...item });
      candidates.push({
        title: item.hearing_type || courtMetadata.hearing_type || `${documentTitle} court date`,
        event_type: 'court_date',
        date: item.date,
        time: item.time || '',
        location: item.location || item.courtroom || courtMetadata.court_name || '',
        notes: [metadataNote, item.notes, `OCR extracted from ${documentTitle}`].filter(Boolean).join('\n'),
      });
    }

    for (const item of calendarItems) {
      if (!item?.date) continue;
      candidates.push({
        title: item.title || item.requirement || `${documentTitle} deadline`,
        event_type: normalizeEventType(item, documentTitle),
        date: item.date,
        time: item.time || '',
        location: item.location || '',
        notes: [courtMetadataNote(courtMetadata), item.notes || item.requirement || `Extracted from ${documentTitle}`].filter(Boolean).join('\n'),
      });
    }

    for (const item of deadlines) {
      if (!item?.due_date) continue;
      candidates.push({
        title: item.task || `${documentTitle} deadline`,
        event_type: isCourtRelated(item.task || documentTitle) ? 'court_date' : 'appointment',
        date: item.due_date,
        time: '',
        location: '',
        notes: [courtMetadataNote(courtMetadata), `Deadline extracted from ${documentTitle}`].filter(Boolean).join('\n'),
      });
    }

    if (candidates.length === 0) {
      for (const date of keyDates) {
        if (!date) continue;
        candidates.push({
          title: `${documentTitle} date`,
          event_type: isCourtRelated(documentTitle) ? 'court_date' : 'appointment',
          date,
          time: '',
          location: '',
          notes: `Key date extracted from ${documentTitle}`,
        });
      }
    }

    const unique = [];
    const seen = new Set();
    for (const item of candidates) {
      const key = `${item.title}|${item.date}|${item.time}`.toLowerCase();
      if (!item.date || seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
    }

    const createdEvents = [];
    for (const item of unique) {
      const event = await base44.entities.CareCalendarEvent.create({
        ...item,
        status: 'pending',
        recurrence: 'none',
        child_name: childName,
        family_email: user.email,
        added_by_email: user.email,
        added_by_name: user.full_name || user.email,
        source_type: 'document_scan',
        source_id: documentId,
      });
      createdEvents.push(event);

      const days = daysUntil(item.date);
      if (days >= 0 && days <= 30 && item.event_type === 'court_date') {
        await base44.entities.Notification.create({
          user_email: user.email,
          type: 'court_reminder',
          title: days === 0 ? 'Court date is today' : `Court reminder: ${days} day${days === 1 ? '' : 's'} away`,
          body: `${item.title} is scheduled for ${item.date}${item.time ? ` at ${item.time}` : ''}. It has been added to your family calendar.`,
          sensitive: true,
          delivery_channel: 'push',
          related_entity: 'CareCalendarEvent',
          related_id: event.id,
          related_link: '/care-calendar',
          read: false,
        });
      }
    }

    return Response.json({ success: true, events_created: createdEvents.length, events: createdEvents });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});