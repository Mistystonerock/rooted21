import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { C } from "@/lib/rooted-constants";

export default function FamilyStabilityTrendChart({ data }) {
  return (
    <section className="rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
      <div className="mb-3">
        <p className="font-serif text-lg font-bold" style={{ color: C.darkGreen }}>Family stability trends</p>
        <p className="text-xs" style={{ color: C.mutedText }}>Communication tone and visitation consistency over time.</p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,61,40,0.15)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.mutedText }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: C.mutedText }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="toneScore" name="Tone score" stroke="#6b9d6e" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="visitationConsistency" name="Visitation consistency" stroke="#a67c52" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="stabilityScore" name="Stability score" stroke="#5a3d28" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}