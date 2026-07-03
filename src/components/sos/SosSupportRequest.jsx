import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { activateQuickExit } from "@/lib/survivorMode";
import { Send, CheckCircle2, MapPin, MapPinOff, Loader2, Phone, Users, Plus, X } from "lucide-react";

function QuickExitButton() {
  return (
    <button
      type="button"
      onClick={() => activateQuickExit()}
      className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-black"
      style={{ background: `${C.darkGreen}12`, color: C.darkGreen, border: `1.5px solid ${C.darkGreen}40`, cursor: "pointer" }}
      aria-label="Quick exit to a safe screen"
    >
      <X size={15} /> Quick exit
    </button>
  );
}

const URGENCY = [
  { value: "low", label: "Low", hint: "I need support soon", color: C.midGreen },
  { value: "medium", label: "Medium", hint: "I need help today", color: C.gold },
  { value: "high", label: "High", hint: "I need help now", color: "#C0392B" },
  { value: "critical", label: "Critical", hint: "Urgent — I'm in crisis", color: "#96281B" },
];

function getGpsCoordinates() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export default function SosSupportRequest() {
  const [urgency, setUrgency] = useState("");
  const [message, setMessage] = useState("");
  const [shareLocation, setShareLocation] = useState(true);
  const [manualLocation, setManualLocation] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState("");
  const [hasContacts, setHasContacts] = useState(null);
  const [proceedWithoutContacts, setProceedWithoutContacts] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        const contacts = await base44.entities.SupportContact.filter({
          user_id: u.id,
          active: true,
          can_receive_sos_alerts: true,
          is_deleted: false,
        }, "", 1);
        setHasContacts(contacts.length > 0);
      } catch {
        setHasContacts(false);
      }
    })();
  }, []);

  async function handleSend() {
    if (!urgency) {
      setError("Please choose an urgency level first.");
      return;
    }
    setError("");
    setSending(true);

    let gps = null;
    if (shareLocation) {
      setStatus("Getting your location…");
      gps = await getGpsCoordinates();
    }

    setStatus("Sending to your support team…");
    try {
      const response = await base44.functions.invoke("sendSosSupportMessage", {
        message: message.trim() || null,
        urgency_level: urgency,
        gps_coordinates: gps,
        manual_location: manualLocation.trim() || null,
        location_shared: shareLocation && !!gps,
      });
      if (response.data?.success) {
        setConfirmation(response.data);
      } else {
        setError(response.data?.error || "Could not send your request. If you are in danger, call 911.");
      }
    } catch (e) {
      setError(e.message || "Could not send your request. If you are in danger, call 911.");
    } finally {
      setSending(false);
      setStatus("");
    }
  }

  function reset() {
    setConfirmation(null);
    setUrgency("");
    setMessage("");
    setManualLocation("");
    setShareLocation(true);
    setError("");
  }

  // ── Confirmation screen ──
  if (confirmation) {
    const cr = confirmation.crisis_resources || {};
    return (
      <section className="rounded-3xl p-5 shadow-lg" style={{ background: "#fff", border: `2px solid ${C.midGreen}` }}>
        <QuickExitButton />
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.midGreen }}>
          <CheckCircle2 size={32} color="#fff" />
        </div>
        <h2 className="text-center font-serif text-2xl font-black" style={{ color: C.darkGreen }}>Request sent</h2>
        <p className="mt-2 text-center text-sm leading-relaxed" style={{ color: C.mutedText }}>{confirmation.confirmation_message}</p>

        {(confirmation.notified_count > 0 || confirmation.failed_count > 0) && (
          <div className="mt-3 rounded-2xl p-3 text-center" style={{ background: `${C.midGreen}15`, border: `1px solid ${C.midGreen}40` }}>
            <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
              {confirmation.notified_count || 0} contact{confirmation.notified_count === 1 ? "" : "s"} notified
              {confirmation.failed_count > 0 ? ` · ${confirmation.failed_count} delivery attempt${confirmation.failed_count === 1 ? "" : "s"} failed` : ""}
            </p>
          </div>
        )}

        <div className="mt-4 space-y-2 rounded-2xl p-4" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <p className="text-xs font-black" style={{ color: "#B84C2A" }}>Immediate crisis resources</p>
          <a href={`tel:${cr.emergency || "911"}`} className="flex items-center gap-2 text-sm font-bold no-underline" style={{ color: "#B84C2A" }}><Phone size={15} /> Call {cr.emergency || "911"}</a>
          <a href={`tel:${cr.crisis_lifeline || "988"}`} className="flex items-center gap-2 text-sm font-bold no-underline" style={{ color: "#B84C2A" }}><Phone size={15} /> Call or text {cr.crisis_lifeline || "988"}</a>
          <p className="text-xs font-bold" style={{ color: "#B84C2A" }}>{cr.crisis_text_line || "Text HOME to 741741"}</p>
        </div>

        <button type="button" onClick={reset} className="mt-4 w-full rounded-2xl py-3 text-sm font-black" style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
          Done
        </button>
      </section>
    );
  }

  // ── No support contacts fallback ──
  if (hasContacts === false && !proceedWithoutContacts) {
    return (
      <section className="rounded-3xl p-5 shadow-lg" style={{ background: "#fff", border: `2px solid ${C.gold}` }}>
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.gold }}>
          <Users size={30} color="#fff" />
        </div>
        <h2 className="text-center font-serif text-xl font-black" style={{ color: C.darkGreen }}>No support contacts yet</h2>
        <p className="mt-2 text-center text-sm leading-relaxed" style={{ color: C.mutedText }}>
          You do not have support contacts set up yet. Your SOS will still be saved, and emergency resources will still be shown.
        </p>
        <Link to="/support-contacts" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black no-underline shadow-lg"
          style={{ background: C.darkGreen, color: "#fff" }}>
          <Plus size={20} /> Add Support Contact
        </Link>
        <button type="button" onClick={() => setProceedWithoutContacts(true)}
          className="mt-3 w-full rounded-2xl py-3.5 text-sm font-black"
          style={{ background: "#fff", color: C.darkGreen, border: `2px solid ${C.darkGreen}`, cursor: "pointer" }}>
          Send SOS Without Contacts
        </button>
      </section>
    );
  }

  // ── Request form ──
  return (
    <section className="rounded-3xl p-5 shadow-lg" style={{ background: "#fff", border: `2px solid ${C.midGreen}40` }}>
      <QuickExitButton />
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
        <Send size={30} color="#fff" />
      </div>
      <h2 className="text-center font-serif text-2xl font-black" style={{ color: C.darkGreen }}>Alert my support team</h2>
      <p className="mt-2 text-center text-sm leading-relaxed" style={{ color: C.mutedText }}>Sends a private in-app alert to your approved support team.</p>

      <div className="mt-5">
        <p className="mb-2 text-[11px] font-black" style={{ color: C.mutedText }}>HOW URGENT IS THIS?</p>
        <div className="grid grid-cols-2 gap-2">
          {URGENCY.map((u) => {
            const selected = urgency === u.value;
            return (
              <button
                key={u.value}
                type="button"
                onClick={() => setUrgency(u.value)}
                className="rounded-2xl px-3 py-3 text-left"
                style={{
                  background: selected ? u.color : "#fff",
                  border: `2px solid ${selected ? u.color : C.cream}`,
                  cursor: "pointer",
                }}
              >
                <span className="block text-sm font-black" style={{ color: selected ? "#fff" : C.darkGreen }}>{u.label}</span>
                <span className="block text-[11px] font-bold" style={{ color: selected ? "rgba(255,255,255,0.9)" : C.mutedText }}>{u.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-[11px] font-black" style={{ color: C.mutedText }}>WHAT'S HAPPENING? (optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Share anything that helps your team respond…"
          className="w-full resize-none rounded-2xl px-3 py-2.5 text-sm outline-none"
          style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
        />
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-[11px] font-black" style={{ color: C.mutedText }}>LOCATION</p>
        <button
          type="button"
          onClick={() => setShareLocation(true)}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left"
          style={{ background: shareLocation ? `${C.midGreen}20` : "#fff", border: `2px solid ${shareLocation ? C.midGreen : C.cream}`, cursor: "pointer" }}
        >
          <MapPin size={18} color={C.darkGreen} />
          <span className="text-sm font-bold" style={{ color: C.darkGreen }}>Share my current location</span>
        </button>
        <button
          type="button"
          onClick={() => setShareLocation(false)}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left"
          style={{ background: !shareLocation ? `${C.midGreen}20` : "#fff", border: `2px solid ${!shareLocation ? C.midGreen : C.cream}`, cursor: "pointer" }}
        >
          <MapPinOff size={18} color={C.darkGreen} />
          <span className="text-sm font-bold" style={{ color: C.darkGreen }}>I cannot share my location</span>
        </button>
        {!shareLocation && (
          <input
            value={manualLocation}
            onChange={(e) => setManualLocation(e.target.value)}
            placeholder="Type a location or landmark (optional)"
            className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
          />
        )}
      </div>

      {error && <p className="mt-3 text-center text-xs font-bold" style={{ color: "#C0392B" }}>{error}</p>}

      <button
        type="button"
        onClick={handleSend}
        disabled={sending}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black shadow-lg"
        style={{ background: sending ? C.cream : C.darkGreen, color: sending ? C.darkGreen : "#fff", border: "none", cursor: sending ? "default" : "pointer" }}
      >
        {sending ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
        {sending ? (status || "Sending…") : "Send SOS Support Request"}
      </button>

      <Link to="/support-contacts" className="mt-3 inline-flex text-xs font-bold underline" style={{ color: C.darkGreen }}>Manage my safe support contacts</Link>
    </section>
  );
}