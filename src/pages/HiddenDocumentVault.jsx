import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Download, EyeOff, FileArchive, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { getSurvivorPin, setSurvivorPin } from "@/lib/survivorMode";
import VaultPinGate from "@/components/survivor-vault/VaultPinGate";
import VaultUploadForm from "@/components/survivor-vault/VaultUploadForm";
import VaultEvidenceCard from "@/components/survivor-vault/VaultEvidenceCard";

export default function HiddenDocumentVault() {
  const [user, setUser] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setPin(getSurvivorPin());
    base44.auth.me().then(async (me) => {
      setUser(me);
      const [vaultItems, auditLogs] = await Promise.all([
        base44.entities.SurvivorVaultEvidence.filter({ owner_email: me.email }, "-uploaded_at", 100),
        base44.entities.SurvivorVaultAuditLog.filter({ owner_email: me.email }, "-occurred_at", 50),
      ]);
      setItems(vaultItems);
      setLogs(auditLogs);
    });
  }, []);

  async function logAction(action, summary, evidenceId = "") {
    if (!user) return;
    const log = await base44.entities.SurvivorVaultAuditLog.create({
      owner_email: user.email,
      evidence_id: evidenceId,
      action,
      summary,
      occurred_at: new Date().toISOString(),
    });
    setLogs((prev) => [log, ...prev]);
  }

  function handleSetPin(value) {
    setSurvivorPin(value);
    setPin(value);
  }

  async function handleUnlock() {
    setUnlocked(true);
    await logAction("vault_opened", "Hidden document vault opened");
  }

  async function handleDownload(item) {
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: item.private_file_uri,
      expires_in: 300,
    });
    await logAction("signed_download_created", `Secure download created for ${item.disguise_name || item.title}`, item.id);
    window.open(signed_url, "_blank", "noopener,noreferrer");
  }

  async function exportManifest() {
    const manifest = {
      exported_at: new Date().toISOString(),
      notice: "Educational survivor vault export manifest. Private files require separate signed downloads.",
      record_count: items.length,
      records: items.map((item) => ({
        title: item.title,
        disguise_name: item.disguise_name,
        category: item.category,
        incident_date: item.incident_date,
        uploaded_at: item.uploaded_at,
        description: item.description,
        timeline_notes: item.timeline_notes,
        file_name: item.file_name,
      })),
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `survivor-vault-manifest-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    await logAction("secure_export", "Secure vault manifest exported");
  }

  const filteredItems = useMemo(() => {
    return filter === "all" ? items : items.filter((item) => item.category === filter);
  }, [items, filter]);

  if (!user) return <div className="min-h-screen" style={{ background: C.offWhite }} />;
  if (!unlocked) return <VaultPinGate pin={pin} onSetPin={handleSetPin} onUnlock={handleUnlock} />;

  return (
    <main className="min-h-screen pb-28" style={{ background: C.offWhite }}>
      <header className="sticky top-0 z-10 px-4 py-3" style={{ background: C.darkGreen, paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <div className="mx-auto flex max-w-[720px] items-center gap-3">
          <Link to="/sos" aria-label="Back" className="rounded-xl p-2" style={{ background: "rgba(255,255,255,0.18)" }}>
            <ChevronLeft color="#fff" />
          </Link>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.76)" }}>Hidden survivor vault</p>
            <h1 className="font-serif text-xl font-black" style={{ color: "#fff" }}>Private Evidence Vault</h1>
          </div>
          <button onClick={exportManifest} className="rounded-xl px-3 py-2 text-xs font-black" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>
            <Download size={14} className="mr-1" /> Export
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[720px] gap-4 px-4 py-5 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <section className="rounded-3xl p-4 shadow-sm" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
            <div className="flex items-start gap-3">
              <EyeOff color={C.darkGreen} />
              <div>
                <h2 className="font-serif text-lg font-black" style={{ color: C.darkGreen }}>Discreet & encrypted</h2>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Files are stored privately and accessed only through temporary signed downloads. Records and logs are append-only.</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-black" style={{ color: C.darkGreen }}>
              <div className="rounded-xl p-3" style={{ background: C.offWhite }}><ShieldCheck size={16} className="mx-auto mb-1" /> PIN</div>
              <div className="rounded-xl p-3" style={{ background: C.offWhite }}><FileArchive size={16} className="mx-auto mb-1" /> {items.length} items</div>
            </div>
          </section>
          <VaultUploadForm user={user} onCreated={(created) => setItems((prev) => [created, ...prev])} />
        </div>

        <div className="space-y-4">
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="w-full rounded-2xl px-3 py-3 text-sm font-bold" style={{ border: `1px solid ${C.cream}`, background: "#fff" }}>
            <option value="all">All vault items</option>
            <option value="screenshot">Screenshots</option>
            <option value="photo">Photos</option>
            <option value="police_report">Police reports</option>
            <option value="threatening_message">Threatening messages</option>
            <option value="custody_paperwork">Custody paperwork</option>
            <option value="journal">Journals</option>
            <option value="medical_document">Medical documents</option>
            <option value="evidence_timeline">Evidence timelines</option>
          </select>

          {filteredItems.map((item) => <VaultEvidenceCard key={item.id} item={item} onDownload={handleDownload} />)}
          {filteredItems.length === 0 && (
            <div className="rounded-3xl p-6 text-center text-sm font-bold" style={{ background: "#fff", color: C.mutedText, border: `1px solid ${C.cream}` }}>
              No vault items yet.
            </div>
          )}

          <section className="rounded-3xl p-4 shadow-sm" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
            <h2 className="mb-3 font-serif text-lg font-black" style={{ color: C.darkGreen }}>Append-only log</h2>
            <div className="space-y-2">
              {logs.slice(0, 8).map((log) => (
                <p key={log.id} className="rounded-xl p-3 text-xs" style={{ background: C.offWhite, color: C.mutedText }}>
                  <strong>{new Date(log.occurred_at).toLocaleString()}:</strong> {log.summary}
                </p>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}