import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, CheckCircle2, Mic, MicOff, TrendingUp } from "lucide-react";
import PrivacyBadge from "@/components/rooted/PrivacyBadge";
import WinCelebration from "@/components/rooted/WinCelebration";
import ChildSelector from "@/components/children/ChildSelector";
import { filterRecordsForChild, withChildLink } from "@/lib/child-selection";

const EMOJIS = { 1: "😟", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };
const LABELS = { 1: "Very Dysregulated", 2: "Somewhat Struggling", 3: "Neutral", 4: "Calm", 5: "Very Calm & Regulated" };
const CAL_MSGS = {
  7: "7 days in a row! You're building real change.",
  14: "Two weeks strong! Your consistency is powerful.",
  30: "30 days! You are a ROOTED parent. Incredible.",
};

function RangeSlider({ value, onChange, color }) {
  return (
    <input
      type="range"
      min="1"
      max="5"
      value={value}
      onChange={e => onChange(parseInt(e.target.value))}
      className="w-full rounded-lg appearance-none"
      style={{
        height: 10,
        background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - 1) / 4) * 100}%, #e8dcc8 ${((value - 1) / 4) * 100}%, #e8dcc8 100%)`,
        accentColor: color,
        cursor: "pointer",
      }}
    />
  );
}

export default function DailyCheckIn() {
  const [user, setUser] = useState(null);
  const [childRegulation, setChildRegulation] = useState(3);
  const [parentCalm, setParentCalm] = useState(3);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [allCheckins, setAllCheckins] = useState([]);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [celebrateMsg, setCelebrateMsg] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported] = useState(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const recognitionRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const checkins = await base44.entities.CheckIn.list("-created_date", 200);
      setAllCheckins(checkins);
      setRecentCheckins(checkins);
    });
  }, []);

  useEffect(() => {
    setRecentCheckins(filterRecordsForChild(allCheckins, selectedChild).slice(0, 30));
  }, [allCheckins, selectedChild]);

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    let finalT = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalT += e.results[i][0].transcript + " ";
        else interim = e.results[i][0].transcript;
      }
      setNote(finalT + interim);
    };
    rec.onerror = rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const optimistic = withChildLink({ id: `opt-${Date.now()}`, child_regulation: childRegulation, parent_calm: parentCalm, note: note || null, created_date: new Date().toISOString() }, selectedChild);
    setAllCheckins(prev => [optimistic, ...prev].slice(0, 200));
    setSaved(true);
    setNote("");
    setTimeout(() => setSaved(false), 2500);

    await base44.entities.CheckIn.create(withChildLink({ child_regulation: childRegulation, parent_calm: parentCalm, note: optimistic.note }, selectedChild));
    const updated = await base44.entities.CheckIn.list("-created_date", 200);
    setAllCheckins(updated);
    setSaving(false);

    // Check streaks
    const streak = updated.length;
    const msg = CAL_MSGS[streak];
    if (msg) { setCelebrateMsg(msg); setCelebrate(true); }
  }

  const streak = recentCheckins.length;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <WinCelebration show={celebrate} message={celebrateMsg} onDone={() => setCelebrate(false)} />

      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen, paddingTop: "max(16px, env(safe-area-inset-top))" }}>
        <Link to="/dashboard" className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ width: 44, height: 44, background: "#ffffff18" }}>
          <ChevronLeft size={20} color={C.cream} />
        </Link>
        <div className="flex-1">
          <p className="font-serif font-bold text-xl" style={{ color: C.cream }}>Daily Check-In</p>
          <p className="text-sm" style={{ color: C.lightGreen }}>How's your child today?</p>
        </div>
        {streak > 0 && (
          <div className="flex flex-col items-center px-3 py-1.5 rounded-xl" style={{ background: "rgba(201,151,58,0.2)", border: "1px solid rgba(201,151,58,0.4)" }}>
            <p className="text-base font-black" style={{ color: "#f0c86a" }}>🔥{streak}</p>
            <p className="text-[9px] font-bold" style={{ color: "#c9973a" }}>STREAK</p>
          </div>
        )}
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-5">

        <ChildSelector selectedChild={selectedChild} onChange={setSelectedChild} />

        {/* Privacy badge */}
        <PrivacyBadge />

        {/* Success */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: `${C.midGreen}20`, border: `1.5px solid ${C.midGreen}` }}
            >
              <CheckCircle2 size={22} color={C.midGreen} />
              <div>
                <p className="text-base font-bold" style={{ color: C.midGreen }}>Check-in saved! ✨</p>
                <p className="text-sm" style={{ color: C.midGreen }}>Your data is logged in Analytics</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Child Regulation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl p-6"
          style={{ background: C.white, border: `1px solid ${C.cream}` }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-serif font-bold text-xl" style={{ color: C.darkGreen }}>Child's Regulation</p>
              <p className="text-sm mt-1" style={{ color: C.mutedText }}>How regulated is your child right now?</p>
            </div>
            <motion.div
              key={childRegulation}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              className="text-5xl"
            >
              {EMOJIS[childRegulation]}
            </motion.div>
          </div>

          <RangeSlider value={childRegulation} onChange={setChildRegulation} color="#F4A77A" />

          <p className="text-base font-bold text-center mt-4" style={{ color: C.darkGreen }}>
            {LABELS[childRegulation]}
          </p>
          <div className="flex justify-between mt-2">
            {[1,2,3,4,5].map(n => (
              <p key={n} className="text-xs font-bold w-8 text-center" style={{ color: n === childRegulation ? C.brown : C.mutedText }}>{n}</p>
            ))}
          </div>
        </motion.div>

        {/* Parent Calm */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6"
          style={{ background: C.white, border: `1px solid ${C.cream}` }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-serif font-bold text-xl" style={{ color: C.darkGreen }}>Your Calm Level</p>
              <p className="text-sm mt-1" style={{ color: C.mutedText }}>How calm are you feeling right now?</p>
            </div>
            <motion.div key={parentCalm} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="text-5xl">
              {EMOJIS[parentCalm]}
            </motion.div>
          </div>

          <RangeSlider value={parentCalm} onChange={setParentCalm} color={C.midGreen} />

          <p className="text-base font-bold text-center mt-4" style={{ color: C.darkGreen }}>
            {LABELS[parentCalm]}
          </p>
          <div className="flex justify-between mt-2">
            {[1,2,3,4,5].map(n => (
              <p key={n} className="text-xs font-bold w-8 text-center" style={{ color: n === parentCalm ? C.midGreen : C.mutedText }}>{n}</p>
            ))}
          </div>
        </motion.div>

        {/* Note with voice */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-6"
          style={{ background: C.white, border: `1px solid ${C.cream}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <label className="text-base font-bold" style={{ color: C.darkGreen }}>Add a Note</label>
            {speechSupported && (
              <button
                onClick={toggleListening}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm"
                style={{
                  background: listening ? C.gold : C.cream,
                  color: listening ? "#fff" : C.darkGreen,
                  border: "none",
                  cursor: "pointer",
                  animation: listening ? "breathe 1.5s ease-in-out infinite" : "none",
                }}
              >
                {listening ? <MicOff size={15} /> : <Mic size={15} />}
                {listening ? "Stop" : "Speak"}
              </button>
            )}
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={listening ? "🎙️ Listening… speak now" : "What happened today? Any patterns? (optional)"}
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-base resize-none"
            style={{
              border: `1.5px solid ${listening ? C.gold : C.cream}`,
              background: listening ? "rgba(201,151,58,0.06)" : C.offWhite,
              transition: "border-color 0.2s",
            }}
          />
        </motion.div>

        {/* Save button with bounce */}
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          className="w-full py-5 rounded-2xl font-bold text-lg transition-all"
          style={{
            background: saving ? "#5a8a6a" : C.darkGreen,
            color: C.cream,
            border: "none",
            cursor: "pointer",
            boxShadow: saving ? "none" : "0 4px 20px rgba(10,61,32,0.3)",
          }}
        >
          {saving ? "Saving…" : "✅ Save Check-In"}
        </motion.button>

        {/* Recent check-ins */}
        {recentCheckins.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-serif font-bold text-lg" style={{ color: C.darkGreen }}>Recent Check-Ins</p>
              <Link to="/progress" className="text-sm font-bold flex items-center gap-1" style={{ color: C.midGreen, textDecoration: "none" }}>
                <TrendingUp size={14} /> View trends
              </Link>
            </div>
            <div className="space-y-2">
              {recentCheckins.slice(0, 5).map((c, i) => {
                const d = new Date(c.created_date);
                const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl p-4 flex items-center justify-between"
                    style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{EMOJIS[c.child_regulation]}</span>
                      <div>
                        <p className="text-sm font-bold" style={{ color: C.darkGreen }}>
                          Child: {c.child_regulation}/5 &nbsp;·&nbsp; You: {c.parent_calm}/5
                        </p>
                        <p className="text-xs" style={{ color: C.mutedText }}>{dateStr}</p>
                      </div>
                    </div>
                    <span className="text-2xl">{EMOJIS[c.parent_calm]}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <div className="pb-10" />
      </div>
    </div>
  );
}