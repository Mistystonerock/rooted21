import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Plus, Calendar } from "lucide-react";
import BehaviorLogForm from "@/components/behavior/BehaviorLogForm";
import BehaviorLogCard from "@/components/behavior/BehaviorLogCard";

export default function BehaviorLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadLogs();
  }, [selectedDate]);

  async function loadLogs() {
    setLoading(true);
    const allLogs = await base44.entities.BehaviorLog.list("-created_date", 100);
    setLogs(allLogs);
    setLoading(false);
  }

  const moodCounts = {
    calm: logs.filter(l => l.child_mood === 'calm').length,
    sad: logs.filter(l => l.child_mood === 'sad').length,
    anxious: logs.filter(l => l.child_mood === 'anxious').length,
    angry: logs.filter(l => l.child_mood === 'angry').length,
    dysregulated: logs.filter(l => l.child_mood === 'dysregulated').length,
  };

  const moodEmojis = { calm: '😊', sad: '😢', anxious: '😰', angry: '😠', dysregulated: '🌪️' };
  const moodColors = { calm: C.midGreen, sad: '#4A90E2', anxious: '#F39C12', angry: '#E74C3C', dysregulated: '#8B4513' };

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Behavior Daily Logs</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Track patterns and triggers</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold"
          style={{ background: C.gold, border: "none", color: C.darkGreen, cursor: "pointer" }}
        >
          <Plus size={13} /> Add Entry
        </button>
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        {/* Form */}
        {showForm && (
          <BehaviorLogForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              loadLogs();
            }}
          />
        )}

        {/* Mood summary */}
        {logs.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>Mood Patterns</p>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(moodCounts).map(([mood, count]) => (
                <div key={mood} className="text-center rounded-lg p-2.5" style={{ background: `${moodColors[mood]}12`, border: `1px solid ${moodColors[mood]}30` }}>
                  <p className="text-lg mb-0.5">{moodEmojis[mood]}</p>
                  <p className="text-base font-bold" style={{ color: C.darkGreen }}>{count}</p>
                  <p className="text-[10px] capitalize" style={{ color: C.mutedText }}>{mood}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && logs.length === 0 && (
          <div className="text-center py-12 rounded-2xl" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
            <Calendar size={32} color={C.cream} className="mx-auto mb-2" />
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No behavior logs yet</p>
            <p className="text-xs mt-1 mb-3" style={{ color: C.mutedText }}>Start tracking behavior patterns to identify triggers and trends.</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-xs font-bold px-4 py-2 rounded-lg border-none"
              style={{ background: C.darkGreen, color: C.white, cursor: "pointer" }}
            >
              + Create First Entry
            </button>
          </div>
        )}

        {/* Logs list */}
        {logs.length > 0 && (
          <div className="space-y-3">
            {logs.map(log => (
              <BehaviorLogCard key={log.id} log={log} />
            ))}
          </div>
        )}

        <div className="pb-6" />
      </div>
    </div>
  );
}