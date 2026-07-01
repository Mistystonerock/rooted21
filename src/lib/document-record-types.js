export const DOCUMENT_RECORD_TYPES = [
  { value: "parent_record", label: "Parent Record", description: "Caregiver notes, forms, and parent-owned records" },
  { value: "child_record", label: "Child Record", description: "Child-specific information and care records" },
  { value: "school_record", label: "School Record", description: "IEP, 504, attendance, school communication, and education records" },
  { value: "medical_record", label: "Medical Record", description: "Medical care, appointment, medication, and provider records" },
  { value: "court_record", label: "Court Record", description: "Court orders, filings, legal notices, and case documents" },
  { value: "behavioral_health_record", label: "Behavioral Health Record", description: "Therapy, counseling, behavioral health, and protected treatment records" },
];

export const DOCUMENT_RECORD_TYPE_LABELS = DOCUMENT_RECORD_TYPES.reduce((labels, item) => {
  labels[item.value] = item.label;
  return labels;
}, {});

export function suggestDocumentRecordType(category) {
  if (["court_order", "legal", "case_plan"].includes(category)) return "court_record";
  if (["iep", "school"].includes(category)) return "school_record";
  if (["medical"].includes(category)) return "medical_record";
  if (["behavioral_health", "therapy", "substance_use"].includes(category)) return "behavioral_health_record";
  if (["visitation", "safety_plan"].includes(category)) return "child_record";
  return "parent_record";
}