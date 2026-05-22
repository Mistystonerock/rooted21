import { AlertTriangle } from "lucide-react";
import { COURT_PACKET_DISCLAIMER } from "@/lib/court-packet-data";

export default function CourtPacketDisclaimer() {
  return (
    <section className="rounded-3xl border p-4 text-xs leading-6" style={{ background: "#fff7ed", borderColor: "#fed7aa", color: "#9a3412" }}>
      <p className="mb-2 flex items-center gap-2 font-black"><AlertTriangle size={16} /> Legal safety notice</p>
      {COURT_PACKET_DISCLAIMER}
    </section>
  );
}