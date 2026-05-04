import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Save, CheckCircle2, LockIcon } from "lucide-react";
import { format, startOfToday } from "date-fns";
import JournalEntryForm from "@/components/journal/JournalEntryForm";
import JournalEntryCard from "@/components/journal/JournalEntryCard";

const DEFAULT_ENTRY = {
  entry_date: "",
  regulation_reflection: "",
  wins_of_day: "",
  gratitude: "",
  what_i_learned: "",
  mood: "okay",
  is_private: true,
};

export default function Journal() {
  const [user, setUser] = useState(null);
  const [todayEntry, setTodayEntry] = useState(DEFAULT_ENTRY);
  const [pastEntries, setPastEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showPastEntries, setShowPastEntries] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const today = format(startOfToday(), "yyyy-MM-dd");
      
      // Load or create today's entry
      const entries = await base44.entities.ParentJournal.filter(
        { entry_date: today, created_by: u.email },
        "-created_date",
        1
      );

      if (entries.length > 0) {
        setTodayEntry(entries[0]);
      } else {
        setTodayEntry(prev => ({ ...prev, entry_date: today }));
      }

      // Load past entries (excluding today)
      const allEntries = await base44.entities.ParentJournal.filter(
        { created_by: u.email },
        "-entry_date",
        100
      );
      const past = allEntries.filter(e => e.entry_date !== today);
      setPastEntries(past);

      setLoading(false);
    });
  }, []);

  // ── UPDATE FORM ──
  function handleUpdate(updates) {
    setTodayEntry(prev => ({ ...prev, ...updates }));
    setIsSaved(false);
  }

  // ── SAVE ENTRY ──
  async function handleSave() {
    if (!todayEntry.entry_date.trim()) return;
    setSaving(true);
    const data = { ...todayEntry };
    let result;
    if (todayEntry.id) {
      result = await base44.entities.ParentJournal.update(todayEntry.id, data);
    } else {
      result = await base44.entities.ParentJournal.create(data);
      setTodayEntry(result);
    }
    setSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  }

  // ── DELETE ENTRY ──
  async function handleDelete(id) {
    await base44.entities.ParentJournal.delete(id);
    setPastEntries(prev => prev.filter(e => e.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* HEADER */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <div className="flex-1">
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Daily Reflection Journal</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Private · Just for you</p>
        </div>
        <LockIcon size={14} color={C.lightGreen} />
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-6">
        {/* TODAY'S ENTRY */}
        <div>
          <p className="text-sm font-serif font-bold mb-4" style={{ color: C.darkGreen }}>
            ✍️ Today's Entry
          </p>
          <JournalEntryForm
            entry={todayEntry}
            onUpdate={handleUpdate}
            onSave={handleSave}
            saving={saving}
            isSaved={isSaved}
          />
        </div>

        {/* PAST ENTRIES */}
        {pastEntries.length > 0 && (
          <div>
            <button
              onClick={() => setShowPastEntries(!showPastEntries)}
              className="flex items-center gap-2 mb-3"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <p className="text-sm font-serif font-bold" style={{ color: C.darkGreen }}>
                📚 Past Reflections
              </p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: C.cream, color: C.mutedText }}>
                {pastEntries.length}
              </span>
            </button>

            {showPastEntries && (
              <div className="space-y-3">
                {pastEntries.map(entry => (
                  <JournalEntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {!showPastEntries && (
              <button
                onClick={() => setShowPastEntries(true)}
                className="w-full py-3 rounded-xl text-xs font-bold"
                style={{ background: C.white, border: `1.5px dashed ${C.cream}`, color: C.mutedText, cursor: "pointer" }}
              >
                View {pastEntries.length} past reflection{pastEntries.length !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}

        {/* EMPTY STATE */}
        {pastEntries.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
            <p className="text-3xl mb-2">🌱</p>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Start your reflection journey</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>
              Each day you reflect, you grow. Your entries are private and just for you.
            </p>
          </div>
        )}

        {/* INFO BANNER */}
        <div className="rounded-xl p-4 flex gap-3" style={{ background: `${C.midGreen}12`, border: `1px solid ${C.midGreen}30` }}>
          <LockIcon size={16} color={C.midGreen} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: C.darkGreen }}>Private & Secure</p>
            <p className="text-[10px] leading-relaxed" style={{ color: C.mutedText }}>
              Your journal entries are private to you. This space is for your own reflection, growth, and care—no one else can see what you write here.
            </p>
          </div>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}