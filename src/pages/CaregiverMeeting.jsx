import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Video, Copy, Check, ExternalLink, LinkIcon, LogOut } from "lucide-react";

const CONNECTOR_ID = "6a45d8f357feb3849b4a49fe";

export default function CaregiverMeeting() {
  const [user, setUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [meetingUri, setMeetingUri] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const checkConnection = async () => {
    try {
      // A create call succeeds only when the user is connected.
      const res = await base44.functions.invoke("createCaregiverMeetLink", {});
      if (res.data?.meetingUri) {
        setMeetingUri(res.data.meetingUri);
        setConnected(true);
        return;
      }
      setConnected(true);
    } catch {
      setConnected(false);
    }
  };

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        try {
          await base44.functions.invoke("createCaregiverMeetLink", {});
          setConnected(true);
        } catch {
          setConnected(false);
        }
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async () => {
    setError("");
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, "_blank");
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        checkConnection();
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    setConnected(false);
    setMeetingUri("");
  };

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    setMeetingUri("");
    try {
      const res = await base44.functions.invoke("createCaregiverMeetLink", {});
      if (res.data?.meetingUri) {
        setMeetingUri(res.data.meetingUri);
        setConnected(true);
      } else {
        setError(res.data?.error || "Could not generate a meeting link.");
      }
    } catch {
      setError("Please connect your Google account first.");
      setConnected(false);
    }
    setCreating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="🎥 Caregiver Meeting" backTo="/dashboard" />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="🎥 Caregiver Meeting" backTo="/dashboard" />
        <div className="max-w-[520px] mx-auto px-4 py-10 text-center">
          <p className="text-sm mb-4" style={{ color: C.darkText }}>Please sign in to generate a meeting link.</p>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="py-3 px-6 rounded-xl font-bold text-sm"
            style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="🎥 Caregiver Meeting" subtitle="Video meeting links via Google Meet" backTo="/dashboard" />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">
        <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl p-2.5" style={{ background: C.cream }}>
              <Video size={20} color={C.darkGreen} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: C.darkText }}>Google Meet for caregivers</p>
              <p className="text-xs" style={{ color: C.mutedText }}>
                {connected ? "Your Google account is connected" : "Connect your Google account to create meeting links"}
              </p>
            </div>
          </div>

          {!connected ? (
            <button
              onClick={handleConnect}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
            >
              <LinkIcon size={16} /> Connect Google account
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: creating ? "wait" : "pointer", opacity: creating ? 0.7 : 1 }}
              >
                {creating ? "Generating…" : (<><Video size={16} /> Generate meeting link</>)}
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                style={{ background: "transparent", color: C.mutedText, border: `1px solid ${C.cream}`, cursor: "pointer" }}
              >
                <LogOut size={13} /> Disconnect Google account
              </button>
            </div>
          )}

          {error && (
            <p className="text-xs mt-3" style={{ color: "#b45309" }}>{error}</p>
          )}
        </div>

        {meetingUri && (
          <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>MEETING LINK</p>
            <p className="text-sm font-bold break-all mb-3" style={{ color: C.darkGreen }}>{meetingUri}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopy}
                className="py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={meetingUri}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}
              >
                <ExternalLink size={15} /> Join
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}