import { addDays, differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

export function generateVerificationId() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `R21-${stamp}-${random}`;
}

export async function hashRecord(record) {
  const payload = JSON.stringify(record, Object.keys(record).sort());
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function formatDate(value) {
  const date = value ? parseISO(value) : null;
  return date && isValid(date) ? format(date, "MMM d, yyyy") : "Not set";
}

export function deadlineStatus(dateValue) {
  if (!dateValue) return { label: "Missing date", tone: "muted", days: null };
  const days = differenceInCalendarDays(parseISO(dateValue), new Date());
  if (days < 0) return { label: `${Math.abs(days)} days overdue`, tone: "danger", days };
  if (days === 0) return { label: "Due today", tone: "warning", days };
  if (days <= 7) return { label: `${days} days left`, tone: "warning", days };
  return { label: `${days} days left`, tone: "good", days };
}

export function buildCourtDeadlines(caseSnapshot) {
  if (!caseSnapshot) return [];
  const filing = caseSnapshot.filing_date ? parseISO(caseSnapshot.filing_date) : null;
  const removal = caseSnapshot.removal_date ? parseISO(caseSnapshot.removal_date) : null;

  return [
    { title: "Court hearing countdown", date: caseSnapshot.next_hearing_date, source: "Next hearing date" },
    { title: "72-hour shelter care reminder", date: removal && isValid(removal) ? format(addDays(removal, 3), "yyyy-MM-dd") : "", source: "Removal date + 72 hours" },
    { title: "30-day adjudication reminder", date: filing && isValid(filing) ? format(addDays(filing, 30), "yyyy-MM-dd") : "", source: "Filing date + 30 days" },
    { title: "90-day review hearing reminder", date: filing && isValid(filing) ? format(addDays(filing, 90), "yyyy-MM-dd") : "", source: "Filing date + 90 days" }
  ];
}

export function completionPercent(items = []) {
  if (!items.length) return 0;
  return Math.round((items.filter(item => item.completed).length / items.length) * 100);
}