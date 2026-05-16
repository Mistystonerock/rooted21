import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Heart, Shield, Sparkles } from "lucide-react";

const BG = "#faf6f1";
const CARD = "#ffffff";
const DARK = "#5a3d28";
const MUTED = "#8b6f54";
const GREEN = "#6b9d6e";
const CREAM = "#f5ede2";
const GOLD = "#a67c52";

function RatingButtons({ value, onChange, label }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold" style={{ color: DARK }}>{label}</p>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className="rounded-2xl py-3 text-sm font-black"
            style={{
              background: value === num ? GREEN : CREAM,
              color: value === num ? "#ffffff" : DARK,
              border: "none",
            }}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px]" style={{ color: MUTED }}>
        <span>Low</span><span>Steady</span>
      </div>
    </div>
  );
}

export default function RequiredOnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [child, setChild] = useState({ first_name: "", age: "", strengths: "", concerns: "" });
  const [children, setChildren] = useState([]);
  const [checkIn, setCheckIn] = useState({ child_regulation: 3, parent_calm: 3, note: "" });
  const [error, setError] = useState("");

  function isBlankChild(childData) {
    return !childData.first_name.trim() && !childData.age && !childData.strengths.trim() && !childData.concerns.trim();
  }

  function validateChild(childData) {
    return childData.first_name.trim() && childData.age;
  }

  function addChildToList() {
    if (!validateChild(child)) {
      setError("Please enter your child's name and age before adding them.");
      return false;
    }
    setChildren(prev => [...prev, { ...child, id: Date.now() }]);
    setChild({ first_name: "", age: "", strengths: "", concerns: "" });
    setError("");
    return true;
  }

  async function saveChildrenAndContinue() {
    let childrenToSave = [...children];
    if (!isBlankChild(child)) {
      if (!validateChild(child)) {
        setError("Please enter your child's name and age before continuing.");
        return;
      }
      childrenToSave = [...childrenToSave, { ...child, id: Date.now() }];
    }
    if (childrenToSave.length === 0) {
      setError("Please add at least one child before continuing.");
      return;
    }
    setSaving(true);
    setError("");
    await Promise.all(childrenToSave.map(childData => base44.entities.ChildProfile.create({
      child_uid: `child_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      first_name: childData.first_name.trim(),
      age: Number(childData.age),
      strengths: childData.strengths.trim(),
      concerns: childData.concerns.trim(),
      photo_emoji: "🌱",
    })));
    setSaving(false);
    setStep(3);
  }

  async function saveCheckIn() {
    setSaving(true);
    await base44.entities.CheckIn.create(checkIn);
    setSaving(false);
    setStep(4);
  }

  async function finish(nextPath = "/dashboard") {
    setSaving(true);
    await base44.auth.updateMe({ onboarding_completed: true, has_viewed_app: true });
    setSaving(false);
    if (onComplete) onComplete();
    window.location.href = nextPath;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: BG }}>
      <div className="w-full max-w-lg rounded-[2rem] p-5 shadow-xl" style={{ background: CARD, border: `1.5px solid ${CREAM}` }}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.18em]" style={{ color: MUTED }}>ROOTED 21 SETUP</p>
            <p className="font-serif text-xl font-bold" style={{ color: DARK }}>Step {step} of 5</p>
          </div>
          <div className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: CREAM, color: DARK }}>
            {Math.round((step / 5) * 100)}%
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl" style={{ background: CREAM }}>
              <Sparkles size={30} color={GOLD} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold" style={{ color: DARK }}>Welcome to Rooted 21.</h1>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>
                Let us help you get set up in just a few minutes.
              </p>
            </div>
            <Button onClick={() => setStep(2)} className="w-full rounded-2xl py-6 text-base font-bold" style={{ background: GREEN }}>
              Get Started
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h1 className="font-serif text-2xl font-bold" style={{ color: DARK }}>Tell us about your children</h1>
              <p className="mt-2 text-sm" style={{ color: MUTED }}>Add each child so Rooted 21 can personalize support for your family.</p>
              <p className="mt-2 text-xs font-bold" style={{ color: GREEN }}>{children.length} child{children.length === 1 ? "" : "ren"} added</p>
            </div>

            {children.length > 0 && (
              <div className="space-y-2 rounded-2xl p-3" style={{ background: CREAM }}>
                {children.map(childData => (
                  <div key={childData.id} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
                    <div>
                      <p className="text-sm font-bold" style={{ color: DARK }}>{childData.first_name}</p>
                      <p className="text-xs" style={{ color: MUTED }}>Age {childData.age}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setChildren(prev => prev.filter(item => item.id !== childData.id))}
                      className="rounded-lg px-2 text-xs font-bold"
                      style={{ background: "#FEF3F2", color: "#B42318", border: "none" }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <>
              <Input placeholder="Child's first name" value={child.first_name} onChange={e => setChild({ ...child, first_name: e.target.value })} />
              <Input type="number" min="0" placeholder="Child's age" value={child.age} onChange={e => setChild({ ...child, age: e.target.value })} />
              <Textarea placeholder="Strengths, gifts, or things they love" value={child.strengths} onChange={e => setChild({ ...child, strengths: e.target.value })} />
              <Textarea placeholder="Relevant needs, supports, or concerns" value={child.concerns} onChange={e => setChild({ ...child, concerns: e.target.value })} />
            </>

            {error && <p className="text-sm font-bold" style={{ color: "#B42318" }}>{error}</p>}

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="outline" onClick={addChildToList} disabled={saving} className="rounded-2xl py-5 font-bold">
                Add Another Child
              </Button>
              <Button onClick={saveChildrenAndContinue} disabled={saving} className="rounded-2xl py-5 font-bold" style={{ background: GREEN }}>
                {saving ? "Saving…" : "Continue"}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: CREAM }}>
              <Heart size={20} color={GREEN} className="mt-0.5" />
              <p className="text-sm leading-relaxed" style={{ color: DARK }}>
                A daily check-in helps you notice patterns between your child’s regulation and your own calm. Small tracking can reveal what is helping.
              </p>
            </div>
            <RatingButtons label="Child regulation today" value={checkIn.child_regulation} onChange={v => setCheckIn({ ...checkIn, child_regulation: v })} />
            <RatingButtons label="Your calm level today" value={checkIn.parent_calm} onChange={v => setCheckIn({ ...checkIn, parent_calm: v })} />
            <Textarea placeholder="Optional note about today" value={checkIn.note} onChange={e => setCheckIn({ ...checkIn, note: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setStep(4)} className="rounded-2xl py-5 font-bold">Skip for now</Button>
              <Button onClick={saveCheckIn} disabled={saving} className="rounded-2xl py-5 font-bold" style={{ background: GREEN }}>{saving ? "Saving…" : "Save Check-In"}</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl" style={{ background: CREAM }}>
              <Shield size={30} color={GREEN} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold" style={{ color: DARK }}>Safety Plan</h1>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>
                Set up your Safety Plan now so you have it ready when you need it.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button onClick={() => finish("/safety-plan")} disabled={saving} className="rounded-2xl py-6 font-bold" style={{ background: GREEN }}>Set Up Now</Button>
              <Button variant="outline" onClick={() => setStep(5)} className="rounded-2xl py-6 font-bold">I will do this later</Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl" style={{ background: "#EAF4EA" }}>
              <CheckCircle2 size={32} color={GREEN} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold" style={{ color: DARK }}>You’re all set.</h1>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>
                Congratulations — your Rooted 21 setup is ready. You can update these details anytime.
              </p>
            </div>
            <Button onClick={() => finish("/dashboard")} disabled={saving} className="w-full rounded-2xl py-6 text-base font-bold" style={{ background: GREEN }}>
              {saving ? "Finishing…" : "Go to Dashboard"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}