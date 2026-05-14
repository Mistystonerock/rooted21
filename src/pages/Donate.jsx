import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, Loader2, Sparkles } from "lucide-react";

const BG = "#faf6f1";
const CARD = "#ffffff";
const GREEN = "#6b9d6e";
const DARK = "#5a3d28";
const MUTED = "#8b6f54";
const BORDER = "rgba(120,85,60,0.22)";
const AMOUNTS = [5, 10, 25, 50, 100];

const IMPACT = [
  "$5 — Keeps one family connected to the app for a month",
  "$10 — Provides one parent access to a full parenting class",
  "$25 — Funds one family's complete 21-lesson curriculum",
  "$50 — Supports one anger management group session",
  "$100 — Sponsors one family's full year of access and support",
];

const OTHER_WAYS = [
  {
    icon: "📋",
    title: "Grant Partnership",
    text: "Is your organization or foundation interested in supporting Rooted 21? We welcome grant partnerships that align with our mission of family stabilization and trauma-informed care.",
    button: "Contact Us About Grants",
    href: "mailto:misty.stonerock88@gmail.com?subject=Grant%20Partnership%20for%20Rooted%2021",
  },
  {
    icon: "🤝",
    title: "Corporate Sponsorship",
    text: "Partner with Rooted 21 to support families in your community. Sponsorships help fund free classes, app development, and resource expansion.",
    button: "Become a Sponsor",
    href: "mailto:misty.stonerock88@gmail.com?subject=Corporate%20Sponsorship%20for%20Rooted%2021",
  },
  {
    icon: "💚",
    title: "Volunteer",
    text: "Share your skills and time to help Rooted 21 grow. We welcome volunteers in areas including facilitation, technology, outreach, and advocacy.",
    button: "Apply to Volunteer",
    href: "mailto:misty.stonerock88@gmail.com?subject=Volunteer%20Application%20for%20Rooted%2021",
  },
];

export default function Donate() {
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState("one_time");
  const [donor, setDonor] = useState({ firstName: "", lastName: "", email: "", honorMemory: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedAmount = useMemo(() => Number(customAmount || amount || 0), [amount, customAmount]);
  const donated = new URLSearchParams(window.location.search).get("donation") === "success";

  async function handleDonate() {
    if (!selectedAmount || selectedAmount < 1) {
      setError("Please choose or enter a donation amount.");
      return;
    }
    if (!donor.firstName.trim() || !donor.lastName.trim() || !donor.email.trim()) {
      setError("Please enter your first name, last name, and email address.");
      return;
    }

    setLoading(true);
    setError("");
    const response = await base44.functions.invoke("createDonationCheckout", {
      amount: selectedAmount,
      donationType,
      donorEmail: donor.email.trim(),
      donorFirstName: donor.firstName.trim(),
      donorLastName: donor.lastName.trim(),
      honorMemory: donor.honorMemory.trim(),
      successUrl: `${window.location.origin}/donate?donation=success`,
      cancelUrl: `${window.location.origin}/donate?donation=cancelled`,
    });
    window.location.href = response.data.url;
  }

  if (donated) {
    return (
      <main className="min-h-screen px-4 py-10" style={{ background: BG, color: DARK }}>
        <div className="max-w-[720px] mx-auto rounded-3xl p-8 text-center" style={{ background: CARD, border: `1.5px solid ${BORDER}` }}>
          <div className="text-4xl mb-4">🌿</div>
          <h1 className="font-serif font-bold text-3xl leading-tight">Thank You From the Bottom of Our Hearts 🌿</h1>
          <p className="mt-5 text-base leading-relaxed" style={{ color: MUTED }}>
            Your generosity means a parent somewhere will have the tools they need to show up differently for their child. You just helped break a cycle. That matters more than you know.
          </p>
          <p className="mt-6 font-serif font-bold text-lg">Misty Stonerock</p>
          <p className="text-sm" style={{ color: MUTED }}>Founder, Rooted 21 Parenting Network Inc.</p>
          <p className="mt-6 text-xs leading-relaxed" style={{ color: MUTED }}>
            A tax receipt has been sent to your email. Rooted 21 Parenting Network Inc. is a 501(c)(3) nonprofit organization — pending IRS approval.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: BG, color: DARK }}>
      <div className="max-w-[860px] mx-auto space-y-6">
        <header className="text-center py-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em]" style={{ color: GREEN }}>Rooted 21 Parenting Network Inc.</p>
          <h1 className="font-serif font-bold text-4xl mt-3 leading-tight">Make a Difference Today 🌿</h1>
          <p className="mt-3 text-base" style={{ color: MUTED }}>Every dollar you give goes directly to supporting families in crisis.</p>
        </header>

        <section className="rounded-3xl p-5 sm:p-7" style={{ background: CARD, border: `1.5px solid ${BORDER}` }}>
          <h2 className="font-serif font-bold text-2xl mb-4">Choose Your Gift Amount</h2>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {AMOUNTS.map(value => (
              <button
                key={value}
                onClick={() => { setAmount(value); setCustomAmount(""); }}
                className="rounded-2xl py-3 font-extrabold"
                style={{ border: `1.5px solid ${amount === value && !customAmount ? GREEN : BORDER}`, background: amount === value && !customAmount ? `${GREEN}18` : CARD, color: amount === value && !customAmount ? GREEN : DARK }}
              >
                ${value}
              </button>
            ))}
            <input
              type="number"
              min="1"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              placeholder="Custom"
              className="col-span-2 sm:col-span-1 rounded-2xl px-3 py-3 font-bold border outline-none"
              style={{ borderColor: customAmount ? GREEN : BORDER, background: CARD }}
            />
          </div>

          <div className="mt-5 rounded-2xl p-4" style={{ background: "#F0F6F0", border: `1px solid ${GREEN}35` }}>
            <p className="font-bold mb-2">What your gift does:</p>
            <ul className="space-y-1 text-sm leading-relaxed" style={{ color: MUTED }}>
              {IMPACT.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="rounded-3xl p-5 sm:p-7" style={{ background: CARD, border: `1.5px solid ${BORDER}` }}>
          <h2 className="font-serif font-bold text-2xl mb-4">Donation Type</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setDonationType("one_time")} className="rounded-2xl py-3 font-extrabold" style={{ border: `1.5px solid ${donationType === "one_time" ? GREEN : BORDER}`, background: donationType === "one_time" ? `${GREEN}18` : CARD, color: donationType === "one_time" ? GREEN : DARK }}>One Time Gift</button>
            <button onClick={() => setDonationType("monthly")} className="rounded-2xl py-3 font-extrabold" style={{ border: `1.5px solid ${donationType === "monthly" ? GREEN : BORDER}`, background: donationType === "monthly" ? `${GREEN}18` : CARD, color: donationType === "monthly" ? GREEN : DARK }}>Monthly Giving</button>
          </div>
          {donationType === "monthly" && (
            <p className="mt-4 text-sm leading-relaxed" style={{ color: MUTED }}>
              Monthly donors are the backbone of Rooted 21. Your recurring gift means we can plan ahead, serve more families, and never turn anyone away.
            </p>
          )}
        </section>

        <section className="rounded-3xl p-5 sm:p-7" style={{ background: CARD, border: `1.5px solid ${BORDER}` }}>
          <h2 className="font-serif font-bold text-2xl mb-4">Donor Information Form</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="First Name" value={donor.firstName} onChange={value => setDonor(d => ({ ...d, firstName: value }))} />
            <Input label="Last Name" value={donor.lastName} onChange={value => setDonor(d => ({ ...d, lastName: value }))} />
            <Input label="Email Address" type="email" value={donor.email} onChange={value => setDonor(d => ({ ...d, email: value }))} />
            <Input label="In honor or memory of (optional)" value={donor.honorMemory} onChange={value => setDonor(d => ({ ...d, honorMemory: value }))} />
          </div>
        </section>

        <section className="rounded-3xl p-5 sm:p-7" style={{ background: CARD, border: `1.5px solid ${BORDER}` }}>
          <h2 className="font-serif font-bold text-2xl mb-3">Payment</h2>
          <p className="text-sm mb-4" style={{ color: MUTED }}>Connect to Stripe for secure payment processing.</p>
          {error && <p className="rounded-xl p-3 text-sm font-bold mb-3" style={{ background: "#FDECEC", color: "#C0392B" }}>{error}</p>}
          <button onClick={handleDonate} disabled={loading} className="w-full rounded-2xl py-4 font-extrabold flex items-center justify-center gap-2" style={{ background: loading ? `${GREEN}80` : GREEN, color: "#fff", border: "none" }}>
            {loading ? <><Loader2 size={17} className="animate-spin" /> Opening secure Stripe checkout…</> : <><Sparkles size={17} /> Continue to Secure Payment</>}
          </button>
          <div className="grid sm:grid-cols-3 gap-2 mt-4 text-sm font-bold" style={{ color: MUTED }}>
            <p>🔒 Secure and encrypted payment</p>
            <p>✅ Receipt sent to your email automatically</p>
            <p>💚 Cancel monthly giving anytime</p>
          </div>
        </section>

        <section>
          <h2 className="font-serif font-bold text-2xl mb-4 text-center">Other Ways to Give</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {OTHER_WAYS.map(card => (
              <div key={card.title} className="rounded-3xl p-5 flex flex-col" style={{ background: CARD, border: `1.5px solid ${BORDER}` }}>
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-serif font-bold text-xl">{card.title}</h3>
                <p className="text-sm leading-relaxed mt-2 flex-1" style={{ color: MUTED }}>{card.text}</p>
                <a href={card.href} className="mt-4 rounded-2xl py-3 px-4 text-sm font-extrabold text-center" style={{ background: GREEN, color: "#fff", textDecoration: "none" }}>{card.button}</a>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center text-xs leading-relaxed py-8" style={{ color: "#8a8a8a" }}>
          Rooted 21 Parenting Network Inc. — Chillicothe, Ross County, Ohio — rooted21parenting.com — misty.stonerock88@gmail.com — 501(c)(3) Pending — No family is ever charged for access to Rooted 21.
        </footer>
      </div>
    </main>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-xs font-bold block mb-1" style={{ color: MUTED }}>{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-2xl px-4 py-3 border outline-none" style={{ borderColor: BORDER, background: BG }} />
    </label>
  );
}