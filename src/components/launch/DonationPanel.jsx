import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, Loader2, Sparkles } from "lucide-react";

const GREEN = "#6b9d6e";
const GOLD = "#a67c52";
const TEXT = "#5a3d28";
const MUTED = "#8b6f54";
const CARD = "#ffffff";
const BORDER = "rgba(120,85,60,0.2)";
const AMOUNTS = [10, 25, 50, 100];

export default function DonationPanel() {
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedAmount = Number(customAmount || amount);

  async function handleDonate() {
    if (!selectedAmount || selectedAmount < 1 || loading) return;
    setLoading(true);
    const response = await base44.functions.invoke("createDonationCheckout", {
      amount: selectedAmount,
      donorEmail: email.trim() || undefined,
      successUrl: `${window.location.origin}/?donation=success`,
      cancelUrl: `${window.location.origin}/?donation=cancelled`,
    });
    window.location.href = response.data.url;
  }

  return (
    <section style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 22, padding: "24px 18px", marginBottom: 28, boxShadow: "0 10px 30px rgba(90,61,40,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: `${GREEN}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Heart size={20} color={GREEN} fill={GREEN} />
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: GREEN, textTransform: "uppercase" }}>Support the mission</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 800, fontSize: 24, color: TEXT, lineHeight: 1.15 }}>Help Rooted 21 grow</h2>
        </div>
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.7, color: MUTED, marginBottom: 16 }}>
        Your gift helps build a safer, calmer place for parents walking through court dates, case plans, trauma behaviors, reunification, adoption, and the moments when they feel completely alone.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
        {AMOUNTS.map(value => (
          <button
            key={value}
            onClick={() => { setAmount(value); setCustomAmount(""); }}
            style={{ padding: "10px 0", borderRadius: 12, border: `1.5px solid ${amount === value && !customAmount ? GREEN : BORDER}`, background: amount === value && !customAmount ? `${GREEN}18` : "#fff", color: amount === value && !customAmount ? GREEN : TEXT, fontWeight: 900, cursor: "pointer" }}
          >
            ${value}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
        <input
          type="number"
          min="1"
          value={customAmount}
          onChange={e => setCustomAmount(e.target.value)}
          placeholder="Custom amount"
          style={{ width: "100%", border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, boxSizing: "border-box" }}
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email for receipt (optional)"
          style={{ width: "100%", border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, boxSizing: "border-box" }}
        />
      </div>

      <button
        onClick={handleDonate}
        disabled={loading || !selectedAmount || selectedAmount < 1}
        style={{ width: "100%", marginTop: 14, padding: "15px", background: loading ? `${GREEN}70` : GREEN, border: "none", borderRadius: 14, color: "#fff", fontWeight: 900, fontSize: 14, cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        {loading ? <><Loader2 size={15} className="animate-spin" /> Opening secure checkout…</> : <><Sparkles size={15} /> Donate ${selectedAmount || amount} to the mission</>}
      </button>

      <p style={{ textAlign: "center", fontSize: 11, color: GOLD, marginTop: 10, fontWeight: 700 }}>
        Every dollar helps make support more reachable for families who need it most.
      </p>
    </section>
  );
}