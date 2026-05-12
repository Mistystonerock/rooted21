import { useEffect, useState } from "react";
import MandatoryReporterModal, { hasMandatoryReporterAck } from "@/components/legal/MandatoryReporterModal";

const PROFESSIONAL_ROLES = ["therapist", "caseworker", "casa", "gal", "attorney", "school_counselor", "judge", "professional"];

export default function ProfessionalGate({ user, children }) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if user has a professional role
    const isProfessional = PROFESSIONAL_ROLES.includes(user.role?.toLowerCase());
    const hasAcked = hasMandatoryReporterAck(user.email);

    if (isProfessional && !hasAcked) {
      setShowModal(true);
    }
  }, [user]);

  if (showModal && user) {
    return (
      <MandatoryReporterModal
        user={user}
        onAcknowledge={() => setShowModal(false)}
      />
    );
  }

  return children;
}