import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { CheckCircle2, Circle, Flame, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import MobileHeader from "@/components/mobile/MobileHeader";

const HABITS = [
  { id: "regulate_first", emoji: "🧘", label: "Regulate myself first", desc: "Before responding to my child, I paused and checked my own state." },
  { id: "connection_moment", emoji: "💛", label: "Connection before correction", desc: "I had at least one warm connecting moment before redirecting behavior." },
  { id: "pace_curiosity", emoji: "🔍", label: "PACE: Got curious", desc: "I asked 'I wonder why...' instead of reacting to behavior." },
  { id: "felt_safety", emoji: "🏡", label: "Built felt safety", desc: "I used predictable routines or calm voice to help my child feel safe." },
  { id: "life_value", emoji: "🗣️", label: "Used life value language", desc: "I named a value (trustworthy, kind, responsible) instead of labeling behavior." },
  { id: "sensory_check", emoji: "🎯", label: "Checked HALT signals", desc: "I checked if my child was Hungry, Anxious, Lonely, or Tired before reacting." },
  { id: "repair", emoji: "🌈", label: "Repaired if needed", desc: "If I lost my cool, I circled back and repaired the relationship." },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getDayLabel(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1);
}

function getDayNum(dateStr) {
  return parseInt(dateStr.slice(8, 10));
}

export default function WeeklyHabits() {
  // checkedMap: { [dateKey]: Set of habit ids }
  const [checkedMap, setCheckedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const today = todayKey();
  const last30 = getLast30Days();

  useEffect(() => {
    base44.entities.Goal.filter({ created_by: undefined }).catch(() => []);
    // Use ParentJournal entity to store habit check-off data keyed by date
    // We'll store as notes field = JSON stringified habit ids checked
    base44.entities.ParentJournal.list("-created_date", 60).then(entries => {
      const map = {};
      entries.forEach(entry => {
        if (entry.entry_date && entry.what_i_learned) {
          try {
            const ids = JSON.parse(entry.what_i_learned);
            if (Array.isArray(ids)) {
              map[entry.entry_date] = new Set(ids);
            }
          } catch {}
        }
      });
      setCheckedMap(map);
      setLoading(false);
    });
  }, []);

  const todayChecked = checkedMap[today] || new Set();
  const todayCount = todayChecked.size;
  const totalHabits = HABITS.length;

  async function toggleHabit(habitId) {
    const current = new Set(checkedMap[today] || []);
    if (current.has(habitId)) {
      current.delete(habitId);
    } else {
      current.add(habitId);
    }

    // Save or update today's entry
    const entries = await base44.entities.ParentJournal.filter({ entry_date: today });
    const habitData = JSON.stringify([...current]);
    if (entries.length > 0) {
      await base44.entities.ParentJournal.update(entries[0].id, { what_i_learned: habitData });
    } else {
      await base44.entities.ParentJournal.create({ entry_date: today, what_i_learned: habitData });
    }

    setCheckedMap(prev => ({ ...prev, [today]: current }));
  }

  // Calculate streak: consecutive days with at least 1 habit checked, ending today
  function calcStreak() {
    let streak = 0;
    const days = getLast30Days().reverse(); // most recent first
    for (const day of days) {
      const checked = checkedMap[day];
      if (checked && checked.size > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  const streak = calcStreak();
  const pct = Math.round((todayCount / totalHabits) * 100);

  // For calendar: color by % complete
  function dayColor(dateStr) {
    const checked = checkedMap[dateStr];
    if (!checked || checked.size === 0) return C.cream;
    const ratio = checked.size / totalHabits;
    if (ratio >= 1) return C.midGreen;
    if (ratio >= 0.5) return "#A7C9A7";
    return "#D4E8D4";
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Weekly Habits" subtitle="Daily TBRI® practice tracker" backTo="/dashboard" />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-5">

        {/* Streak banner */}
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: C.darkGreen }}>
          <div className="flex items-center gap-2">
            <Flame size={28} color={streak > 0 ? "#F97316" : C.lightGreen} />
            <div>
              <p className="text-3xl font-extrabold leading-none" style={{ color: C.cream }}>{streak}</p>
              <p className="text-[10px] font-bold" style={{ color: C.lightGreen }}>DAY STREAK</p>
            </div>
          </div>
          <div className="flex-1 ml-2">
            <p className="text-xs font-bold mb-1" style={{ color: C.cream }}>
              {streak === 0 ? "Start your streak today!" : streak === 1 ? "Great start — keep it going!" : `${streak} days strong — amazing!`}
            </p>
            <p className="text-[10px]" style={{ color: C.lightGreen }}>Check off at least 1 habit each day to maintain your streak.</p>
          </div>
        </div>

        {/* Today's progress ring */}
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke={C.cream} strokeWidth="6" />
              <circle
                cx="32" cy="32" r="26"
                fill="none"
                stroke={pct === 100 ? C.midGreen : C.gold}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
                transform="rotate(-90 32 32)"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm font-extrabold" style={{ color: C.darkGreen }}>{todayCount}/{totalHabits}</p>
            </div>
          </div>
          <div>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Today's Habits</p>
            <p className="text-xs mt-0.5" style={{ color: C.mutedText }}>
              {pct === 100 ? "🌟 All habits complete! Incredible day." : `${totalHabits - todayCount} habit${totalHabits - todayCount !== 1 ? "s" : ""} remaining`}
            </p>
          </div>
        </div>

        {/* Habit checklist */}
        <div>
          <p className="text-[10px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>TODAY'S TBRI® HABITS</p>
          <div className="space-y-2">
            {HABITS.map(habit => {
              const checked = todayChecked.has(habit.id);
              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className="w-full text-left flex items-start gap-3 rounded-xl p-3.5 transition-all"
                  style={{
                    background: checked ? "#EAF4EA" : C.white,
                    border: `1.5px solid ${checked ? C.midGreen : C.cream}`,
                    cursor: "pointer",
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {checked
                      ? <CheckCircle2 size={20} color={C.midGreen} />
                      : <Circle size={20} color={C.cream} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: checked ? C.midGreen : C.darkGreen }}>
                      {habit.emoji} {habit.label}
                    </p>
                    <p className="text-[11px] mt-0.5 leading-snug" style={{ color: C.mutedText }}>{habit.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 30-day streak calendar */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>30-Day Habit Calendar</p>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
            {/* Day labels */}
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <div key={i} className="text-center text-[9px] font-bold pb-0.5" style={{ color: C.mutedText }}>{d}</div>
            ))}
            {/* Empty cells to align first day */}
            {(() => {
              const firstDay = new Date(last30[0] + "T12:00:00").getDay();
              return Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />);
            })()}
            {last30.map(dateStr => {
              const isToday = dateStr === today;
              const bg = dayColor(dateStr);
              const checked = checkedMap[dateStr];
              const full = checked && checked.size === totalHabits;
              return (
                <div
                  key={dateStr}
                  title={dateStr}
                  className="aspect-square rounded-md flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: bg,
                    color: (bg === C.cream) ? C.mutedText : C.darkGreen,
                    border: isToday ? `2px solid ${C.darkGreen}` : "2px solid transparent",
                    fontSize: "9px",
                  }}
                >
                  {full ? "✓" : getDayNum(dateStr)}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {[
              { color: C.cream, label: "No habits" },
              { color: "#D4E8D4", label: "1–3 habits" },
              { color: "#A7C9A7", label: "4–5 habits" },
              { color: C.midGreen, label: "All 7 ✓" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
                <span className="text-[9px]" style={{ color: C.mutedText }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Encouragement */}
        <div className="rounded-xl p-3.5 text-center" style={{ background: C.cream }}>
          <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
            "Small consistent actions build big change. Every check-off matters."
          </p>
          <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>— Rooted 21 Parenting Network</p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}