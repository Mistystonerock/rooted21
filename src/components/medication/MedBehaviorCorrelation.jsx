import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { Info } from "lucide-react";

const SLOTS = ["morning", "midday", "afternoon", "evening", "night"];
const SLOT_LABELS = { morning: "Morning", midday: "Midday", afternoon: "Afternoon", evening: "Evening", night: "Night" };
const MOOD_SEVERITY = { calm: 0, sad: 1, anxious: 2, angry: 3, dysregulated: 4 };

export default function MedBehaviorCorrelation({ user, childName }) {
  const [doses, setDoses] = useState([]);
  const [behaviorLogs, setBehaviorLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.MedicationDoseLog.filter({ parent_email: user.email, ...(childName ? { child_name: childName } : {}) }, "-administered_date", 200),
      base44.entities.BehaviorLog.list("-entry_date", 200),
    ]).then(([d, b]) => {
      setDoses(d);
      setBehaviorLogs(b);
      setLoading(false);
    });
  }, [user, childName]);

  if (loading) return <div style={{ textAlign: "center", padding: 24, color: C.mutedText, fontSize: 13 }}>Loading correlation data...</div>;

  // Build correlation: for each time slot, count behavior logs on days a dose was given in that slot
  const slotData = SLOTS.map(slot => {
    const doseDates = new Set(
      doses.filter(d => d.time_of_day_slot === slot && d.given).map(d => d.administered_date)
    );
    const logsOnDoseDays = behaviorLogs.filter(b => doseDates.has(b.entry_date));
    const avgSeverity = logsOnDoseDays.length > 0
      ? logsOnDoseDays.reduce((sum, b) => sum + (MOOD_SEVERITY[b.child_mood] ?? 2), 0) / logsOnDoseDays.length
      : 0;
    return {
      slot: SLOT_LABELS[slot],
      behaviorEvents: logsOnDoseDays.length,
      avgSeverity: Math.round(avgSeverity * 10) / 10,
      doseDays: doseDates.size,
    };
  });

  const maxEvents = Math.max(...slotData.map(s => s.behaviorEvents), 1);

  // Skipped doses
  const skippedCount = doses.filter(d => !d.given).length;
  const totalDoses = doses.length;

  // Top behavioral spike slot
  const topSlot = [...slotData].sort((a, b) => b.behaviorEvents - a.behaviorEvents)[0];

  return (
    <div style={{ background: C.darkGreen, borderRadius: 20, padding: 20, border: `1.5px solid rgba(201,151,58,0.3)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <p style={{ fontWeight: 800, fontSize: 14, color: C.cream }}>📊 Medication × Behavior Correlation</p>
      </div>
      <p style={{ fontSize: 11, color: C.mutedText, marginBottom: 18 }}>
        Behavior events on days a dose was given, by time-of-day slot
      </p>

      {doses.length === 0 ? (
        <p style={{ color: C.mutedText, fontSize: 13, textAlign: "center", padding: "20px 0" }}>
          Log some doses to see correlations appear here.
        </p>
      ) : (
        <>
          {/* Summary chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ background: "rgba(201,151,58,0.15)", border: `1px solid ${C.gold}`, borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: C.gold }}>
              {totalDoses} doses logged
            </div>
            <div style={{ background: "rgba(184,76,42,0.15)", border: "1px solid #B84C2A", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#F08060" }}>
              {skippedCount} skipped
            </div>
            {topSlot?.behaviorEvents > 0 && (
              <div style={{ background: "rgba(26,107,58,0.2)", border: `1px solid ${C.midGreen}`, borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: C.lightGreen }}>
                Peak spike: {topSlot.slot}
              </div>
            )}
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={slotData} barCategoryGap="30%">
              <XAxis dataKey="slot" tick={{ fill: C.mutedText, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: C.darkGreen, border: `1px solid ${C.gold}`, borderRadius: 10, color: C.cream, fontSize: 11 }}
                formatter={(val, name) => [val, name === "behaviorEvents" ? "Behavior Events" : "Avg Severity"]}
              />
              <Bar dataKey="behaviorEvents" name="Behavior Events" radius={[6, 6, 0, 0]}>
                {slotData.map((entry, i) => (
                  <Cell key={i} fill={entry.behaviorEvents === maxEvents && maxEvents > 0 ? "#B84C2A" : C.midGreen} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Table breakdown */}
          <div style={{ marginTop: 16, borderTop: `1px solid rgba(255,255,255,0.1)`, paddingTop: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.mutedText, marginBottom: 10, letterSpacing: "0.1em" }}>BREAKDOWN BY SLOT</p>
            {slotData.map(row => (
              <div key={row.slot} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 12, color: C.cream, fontWeight: 600 }}>{row.slot}</span>
                <div style={{ display: "flex", gap: 16, fontSize: 11, color: C.mutedText }}>
                  <span>{row.doseDays} dose days</span>
                  <span style={{ color: row.behaviorEvents > 0 ? "#F08060" : C.lightGreen, fontWeight: 700 }}>{row.behaviorEvents} behavior events</span>
                  <span>severity {row.avgSeverity}/4</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, background: "rgba(201,151,58,0.1)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8 }}>
            <Info size={14} color={C.gold} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: C.mutedText, lineHeight: 1.5 }}>
              Share this chart with your child's prescriber to discuss timing adjustments. Highlighted bars (red) indicate the window with the most behavioral activity on dose days.
            </p>
          </div>
        </>
      )}
    </div>
  );
}