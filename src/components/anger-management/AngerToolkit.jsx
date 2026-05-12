import { useState } from "react";
import { BookOpen, Pause, MessageSquare, Heart } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const TOOLKIT_ITEMS = [
  {
    icon: "📓",
    title: "Trigger Journal",
    desc: "Document what sets you off — and patterns you notice over time",
    action: "Start journaling",
  },
  {
    icon: "⏸️",
    title: "Pause Button Exercise",
    desc: "Three power moves to interrupt the anger spiral before it escalates",
    action: "Learn the exercise",
  },
  {
    icon: "🗣️",
    title: "De-escalation Scripts",
    desc: "Exact words to calm yourself and the situation",
    action: "View scripts",
  },
  {
    icon: "🫀",
    title: "Body Scan Check-in",
    desc: "Notice where you hold anger in your body — and release it",
    action: "Start body scan",
  },
];

const PAUSE_BUTTON_MOVES = [
  {
    num: 1,
    name: "Stop the action",
    desc: "Freeze. Do not speak. Do not move closer. Physical pause first.",
  },
  {
    num: 2,
    name: "Take one intentional breath",
    desc: "Breathe in for 4, out for 4. Just one breath. That's it.",
  },
  {
    num: 3,
    name: "Choose your next move",
    desc: "Walk away. Call timeout. Ask for space. You have choices.",
  },
];

const DE_ESCALATION_SCRIPTS = [
  {
    situation: "When you feel your anger rising:",
    script: '"I notice I\'m getting frustrated. I need a moment to calm down." (Then leave.)',
  },
  {
    situation: "If the other person is upset with you:",
    script: '"I hear that you\'re upset. I want to understand, but I need us both to speak calmly. Can we take a 15-minute break?"',
  },
  {
    situation: "If you\'ve already raised your voice:",
    script: '"I\'m sorry I raised my voice. That wasn\'t okay. Can we start over? I\'m listening."',
  },
  {
    situation: "If you need to leave the situation:",
    script: '"This conversation isn\'t going well right now. I\'m going to step away. We can talk again in an hour when I\'ve cooled down."',
  },
];

export default function AngerToolkit() {
  const [activeTab, setActiveTab] = useState(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {TOOLKIT_ITEMS.map((item, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(item.title === activeTab ? null : item.title)}
            className="w-full rounded-xl p-4 text-left transition-all"
            style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{item.title}</p>
                <p className="text-xs mt-0.5" style={{ color: C.mutedText }}>{item.desc}</p>
                <p className="text-[10px] font-bold mt-2" style={{ color: C.midGreen }}>{item.action} →</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Pause Button Modal */}
      {activeTab === "Pause Button Exercise" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)" }}>
          <div className="w-full sm:max-w-[420px] rounded-t-3xl sm:rounded-2xl p-5"
            style={{ background: C.offWhite, maxHeight: "90vh", overflowY: "auto" }}>
            <p className="font-serif font-bold text-lg mb-4" style={{ color: C.darkGreen }}>Pause Button Exercise</p>
            <div className="space-y-3 mb-5">
              {PAUSE_BUTTON_MOVES.map((move) => (
                <div key={move.num} className="rounded-xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                  <div className="flex items-start gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: C.midGreen, color: C.white }}>{move.num}</span>
                    <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{move.name}</p>
                  </div>
                  <p className="text-xs ml-8" style={{ color: C.mutedText }}>{move.desc}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveTab(null)}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: C.white, border: "none", cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* De-escalation Scripts Modal */}
      {activeTab === "De-escalation Scripts" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)" }}>
          <div className="w-full sm:max-w-[420px] rounded-t-3xl sm:rounded-2xl p-5"
            style={{ background: C.offWhite, maxHeight: "90vh", overflowY: "auto" }}>
            <p className="font-serif font-bold text-lg mb-4" style={{ color: C.darkGreen }}>De-escalation Scripts</p>
            <div className="space-y-3 mb-5">
              {DE_ESCALATION_SCRIPTS.map((item, i) => (
                <div key={i} className="rounded-xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                  <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>{item.situation}</p>
                  <p className="text-xs italic" style={{ color: C.mutedText }}>{item.script}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveTab(null)}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: C.white, border: "none", cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Trigger Journal Modal */}
      {activeTab === "Trigger Journal" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)" }}>
          <div className="w-full sm:max-w-[420px] rounded-t-3xl sm:rounded-2xl p-5"
            style={{ background: C.offWhite, maxHeight: "90vh", overflowY: "auto" }}>
            <p className="font-serif font-bold text-lg mb-4" style={{ color: C.darkGreen }}>Trigger Journal</p>
            <div className="rounded-xl p-4 mb-5" style={{ background: "#EAF4EA", border: "1px solid #A5D6A7" }}>
              <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>What to track:</p>
              <ul className="text-xs space-y-1" style={{ color: C.darkGreen }}>
                <li>📌 What happened (the trigger)</li>
                <li>😤 How angry did you get (1–10)</li>
                <li>💭 What were you thinking</li>
                <li>📍 Where in your body did you feel it</li>
                <li>✅ What helped you calm down</li>
              </ul>
            </div>
            <p className="text-xs mb-5" style={{ color: C.mutedText }}>
              After 2–3 weeks, you'll see patterns. "I always get angry when X happens." Once you know your triggers, you can plan ahead.
            </p>
            <button onClick={() => setActiveTab(null)}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: C.white, border: "none", cursor: "pointer" }}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Body Scan Modal */}
      {activeTab === "Body Scan Check-in" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)" }}>
          <div className="w-full sm:max-w-[420px] rounded-t-3xl sm:rounded-2xl p-5"
            style={{ background: C.offWhite, maxHeight: "90vh", overflowY: "auto" }}>
            <p className="font-serif font-bold text-lg mb-4" style={{ color: C.darkGreen }}>Body Scan Check-in</p>
            <div className="space-y-2 mb-5 text-xs">
              <div className="rounded-lg p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="font-bold mb-1" style={{ color: C.darkGreen }}>👁️ Jaw</p>
                <p style={{ color: C.mutedText }}>Is it clenched? Try to relax it.</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="font-bold mb-1" style={{ color: C.darkGreen }}>💪 Shoulders</p>
                <p style={{ color: C.mutedText }}>Are they tense? Roll them back, then down.</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="font-bold mb-1" style={{ color: C.darkGreen }}>✊ Hands</p>
                <p style={{ color: C.mutedText }}>Are your fists clenched? Open your hands wide, then relax.</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="font-bold mb-1" style={{ color: C.darkGreen }}>🫀 Chest</p>
                <p style={{ color: C.mutedText }}>Is your breathing shallow? Try deeper, slower breaths.</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="font-bold mb-1" style={{ color: C.darkGreen }}>🦵 Legs</p>
                <p style={{ color: C.mutedText }}>Are they tense? Shake them out or stretch.</p>
              </div>
            </div>
            <button onClick={() => setActiveTab(null)}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: C.white, border: "none", cursor: "pointer" }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}