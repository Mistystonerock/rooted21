export const COURT_PACKET_DISCLAIMER = "Rooted 21 provides general information, organization tools, and links to official court resources. Rooted 21 does not provide legal advice and does not replace an attorney, court clerk, magistrate, judge, caseworker, advocate, or legal aid provider. Court rules and forms can vary by county and state. Always confirm requirements with the official court, an attorney, or legal aid before filing.";

export const COURT_PACKET_CATEGORIES = [
  "Shared Parenting", "Emergency Custody / Ex Parte", "Full Custody", "Custody Modification", "Visitation / Parenting Time Change", "Child Support", "Protection Order", "Civil Protection Order", "Domestic Violence Protection Order", "Juvenile Court Support", "Probate / Guardianship", "Kinship Caregiver Support", "Foster / Caregiver Court Support", "Record Sealing / Expungement", "Name Change", "Divorce / Dissolution Support", "Contempt / Enforcing a Court Order", "School / IEP Court-Related Documentation", "CPS Case Plan / Court Preparation", "Family Treatment Court Support", "Juvenile Treatment Court Support", "Reentry / Criminal Record Support", "Housing Court / Eviction Support", "Benefits Appeal Support", "General Court Meeting Preparation"
];

const common = {
  warning: "This is general education and organization support only. Ask the court clerk, legal aid, or an attorney what is required before filing.",
  forms: ["Ask the correct court clerk where the official forms are located", "Check Ohio Legal Help and Supreme Court of Ohio forms when applicable", "Confirm county-specific forms before filing"],
  documents: ["Current court orders", "Notices or hearing letters", "Communication logs", "Timeline of important events", "Proof of service or attendance when applicable"],
  questions: ["Which court handles this issue?", "Are there local forms or local rules?", "Is there a filing fee or fee waiver?", "How does service/notice work?", "What should I bring to the hearing?"],
  checklist: ["Confirm court and form source", "Gather documents", "Write down deadlines", "Prepare questions", "Save copies in Document Vault", "Add court dates to reminders"],
};

export const COURT_PACKETS = COURT_PACKET_CATEGORIES.map((title) => ({
  title,
  slug: title.toLowerCase().replaceAll(" / ", "-").replaceAll(" ", "-").replaceAll("/", "-").replaceAll(".", ""),
  usedFor: `${title} paperwork or hearing preparation may involve court-specific forms, deadlines, documents, and questions for the clerk or legal aid.`,
  ...common,
  fees: "Fees vary by court. Ask about a fee waiver, poverty affidavit, or filing-fee assistance if cost is a barrier.",
  service: "Many filings require proper service or notice. Ask the clerk or legal aid what applies before filing.",
  hearing: ["Bring copies of filed forms", "Bring court orders and proof documents", "Write down key dates", "Prepare calm questions", "Arrive early or log in early for virtual hearings"],
  evidence: ["Court orders", "Messages", "School records", "Medical or safety documents if relevant", "Attendance or service records", "Photos/screenshots only if safe and allowed"],
  emergency: title.includes("Protection") || title.includes("Emergency") || title.includes("Domestic Violence"),
}));

function setPacket(title, updates) {
  const packet = COURT_PACKETS.find(item => item.title === title);
  if (packet) Object.assign(packet, updates);
}

setPacket("Shared Parenting", {
  usedFor: "Organizing a shared parenting plan, parenting schedule, decision-making, transportation, holidays, school breaks, and communication expectations.",
  documents: ["Proposed parenting schedule", "School break/holiday plan", "Transportation plan", "Communication plan", "Child support information", "Existing orders if any"],
  checklist: ["Write schedule ideas", "List school breaks and holidays", "Plan transportation", "Organize decision-making notes", "Gather child support documents", "Prepare court questions"]
});

setPacket("Emergency Custody / Ex Parte", {
  warning: "If a child is in immediate danger, call 911 or contact the proper child protection or emergency services. Rooted 21 does not replace emergency services, CPS, law enforcement, or an attorney.",
  documents: ["Safety timeline", "Police reports if applicable", "Medical records if applicable", "School reports if applicable", "Witness names/contact information", "Court filing checklist", "Follow-up hearing date"],
  checklist: ["Call emergency services if there is immediate danger", "Document dates and facts", "Gather safety records", "Ask legal aid/court about emergency process", "Track follow-up hearing", "Confirm service/notice rules"],
  emergency: true
});

setPacket("Full Custody", { documents: ["Current order", "School/medical records", "Parenting concerns", "Safety concerns", "Communication log", "Visitation history", "Child support information"], checklist: ["Upload current order", "Gather school/medical records", "Organize safety concerns", "Print communication log", "Prepare hearing notes"] });
setPacket("Visitation / Parenting Time Change", { documents: ["Current order", "What changed", "Missed visits log", "Safety concerns", "Transportation concerns", "Communication log", "Proposed schedule worksheet"] });
setPacket("Child Support", { documents: ["Income documents", "Employment information", "Existing support order", "Payment records", "Parenting time/custody documents"], questions: ["Which child support agency handles this?", "What income documents are needed?", "How do modification requests work?", "How can I get payment records?"] });
setPacket("Protection Order", { warning: "Safety first. If you are in immediate danger, call 911. Consider using Quick Exit and local domestic violence resources. Do not store unsafe information if someone monitors your device.", documents: ["Incident timeline", "Evidence checklist", "Children’s safety concerns", "Police reports if applicable", "Medical records if safe", "Hearing preparation notes"], emergency: true });
setPacket("Civil Protection Order", { emergency: true });
setPacket("Domestic Violence Protection Order", { warning: "Safety first. If you are in immediate danger, call 911. Use a safer device if yours may be monitored. Rooted 21 does not replace an advocate, attorney, or emergency services.", emergency: true });
setPacket("Record Sealing / Expungement", { usedFor: "Organizing case numbers, dates, costs, and official resources. Rules can be complicated and change over time. Rooted 21 does not determine eligibility.", documents: ["Case numbers", "Conviction or dismissal dates", "Fines/costs information", "County court search results", "Legal aid notes"], questions: ["Am I eligible under current law?", "Which court has my record?", "Are all fines/costs resolved?", "Is a hearing required?"] });
setPacket("Probate / Guardianship", { documents: ["Kinship/caregiver documentation", "Child relationship documents", "Caregiver affidavit if applicable", "Safety concerns", "Probate court notices", "Hearing checklist"] });
setPacket("CPS Case Plan / Court Preparation", { documents: ["Case plan", "Court dates", "Services checklist", "Visitation log", "Drug screen log if applicable", "Treatment attendance", "Parenting class log", "Housing/employment progress", "Communication log"] });
setPacket("Family Treatment Court Support", { documents: ["Treatment attendance", "Recovery meeting log", "Drug screen log if applicable", "Parenting class progress", "Housing/employment progress", "Court date reminders"], usedFor: "Organizing progress, treatment, recovery, parenting, housing, employment, and court reminders. Progress is still progress." });
setPacket("Juvenile Treatment Court Support", { documents: ["Probation requirements", "School attendance", "Treatment appointments", "Community service", "Court dates", "Mentor notes", "Goals", "Behavior progress", "Family support plan"] });

export const COURT_DOCUMENT_FOLDERS = ["Custody", "Shared Parenting", "Emergency Custody", "Protection Order", "Child Support", "Visitation", "CPS Case", "Family Treatment Court", "Juvenile Court", "Probate / Guardianship", "Expungement", "School / IEP", "Housing Court", "Legal Aid"];

export const COURT_REMINDER_TYPES = ["filing deadline", "court date", "hearing date", "service deadline", "document due date", "attorney appointment", "legal aid appointment", "child support appointment", "CPS meeting", "school meeting", "treatment court date", "probation appointment", "parenting class", "drug screen if applicable", "visitation date"];

export const OFFICIAL_COURT_RESOURCES = [
  { name: "Ross County Probate and Juvenile Court", court_type: "Juvenile / Probate", county: "Ross", state: "OH", website: "https://www.rossprobatejuvenile.com/", phone: "Needs verification", address: "2 N. Paint St., Chillicothe, OH 45601", form_links: ["https://www.rossprobatejuvenile.com/"], verified_at: "2026-05-22", verification_status: "verified" },
  { name: "Ross County Clerk of Courts", court_type: "Common Pleas / Clerk", county: "Ross", state: "OH", website: "https://www.rosscountyohio.gov/clerk/", phone: "(740) 702-3010", address: "2 N. Paint St., Suite B, Chillicothe, OH 45601", form_links: ["https://www.rosscountyohio.gov/clerk/"], verified_at: "2026-05-22", verification_status: "verified" },
  { name: "Ross County Common Pleas Court", court_type: "Common Pleas", county: "Ross", state: "OH", website: "https://www.rosscountycommonpleas.org/", phone: "Needs verification", address: "Chillicothe, OH", form_links: ["https://www.rosscountycommonpleas.org/"], verified_at: "2026-05-22", verification_status: "verified" },
  { name: "Chillicothe Municipal Court", court_type: "Municipal", county: "Ross", state: "OH", website: "https://www.chillicothemunicipalcourt.org/", phone: "(740) 773-3515", address: "95 E. Main St., Chillicothe, OH 45601", form_links: ["https://www.chillicothemunicipalcourt.org/"], verified_at: "2026-05-22", verification_status: "verified" },
  { name: "Supreme Court of Ohio — Protection Order Forms", court_type: "State forms", county: "Statewide", state: "OH", website: "https://www.supremecourt.ohio.gov/forms/all-forms/protection-order/2", phone: "", address: "", form_links: ["https://www.supremecourt.ohio.gov/forms/all-forms/protection-order/2"], verified_at: "2026-05-22", verification_status: "verified" },
  { name: "Supreme Court of Ohio — Domestic Relations and Juvenile Forms", court_type: "State forms", county: "Statewide", state: "OH", website: "https://www.supremecourt.ohio.gov/forms/all-forms/domestic-relations-and-juvenile-standardized/1", phone: "", address: "", form_links: ["https://www.supremecourt.ohio.gov/forms/all-forms/domestic-relations-and-juvenile-standardized/1"], verified_at: "2026-05-22", verification_status: "verified" },
  { name: "Ohio Legal Help", court_type: "Legal aid information", county: "Statewide", state: "OH", website: "https://www.ohiolegalhelp.org/", phone: "", address: "", form_links: ["https://www.ohiolegalhelp.org/"], verified_at: "2026-05-22", verification_status: "verified" },
  { name: "Legal Aid of Southeast and Central Ohio", court_type: "Legal Aid", county: "Ross / Regional", state: "OH", website: "https://www.lasco.org/", phone: "614.221.7201", address: "Regional legal aid provider", form_links: ["https://www.lasco.org/"], verified_at: "2026-05-22", verification_status: "verified" }
];

export const QUESTIONNAIRE_STEPS = [
  { key: "topic", question: "What is the main issue you are trying to organize?", options: ["Custody or parenting time", "Protection or safety", "CPS or treatment court", "Records, housing, benefits, or other"] },
  { key: "urgency", question: "How urgent does this feel?", options: ["Immediate safety concern", "Upcoming court date", "Planning ahead", "Not sure"] },
  { key: "order", question: "Is there already a court order or case plan?", options: ["Yes", "No", "I’m not sure", "I need help finding it"] }
];

export function packetSuggestions(answers) {
  const topic = answers.topic || "";
  const urgency = answers.urgency || "";
  if (urgency.includes("Immediate") || topic.includes("Protection")) return ["Emergency Custody / Ex Parte", "Protection Order", "Domestic Violence Protection Order", "Family Safety Crisis Plan"];
  if (topic.includes("Custody")) return ["Shared Parenting", "Full Custody", "Custody Modification", "Visitation / Parenting Time Change", "Child Support"];
  if (topic.includes("CPS")) return ["CPS Case Plan / Court Preparation", "Family Treatment Court Support", "Juvenile Treatment Court Support"];
  return ["Record Sealing / Expungement", "Housing Court / Eviction Support", "Benefits Appeal Support", "General Court Meeting Preparation"];
}