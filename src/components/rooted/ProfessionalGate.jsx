import { useEffect, useState } from "react";
import MandatoryReporterModal, { hasMandatoryReporterAck } from "@/components/legal/MandatoryReporterModal";

const PROFESSIONAL_ROLES = ["therapist", "counselor", "caseworker", "casa", "gal", "attorney", "school_counselor", "judge", "professional", "behavioral_health_worker", "behavioral_health_provider", "treatment_team_member", "peer_support_specialist", "ohiorise_care_coordinator", "recovery_coach"];

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