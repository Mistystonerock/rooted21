import { useState } from "react";
import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Calendar, Video, Clock, Users, ExternalLink, Bell } from "lucide-react";

const UPCOMING_CLASSES = [
  {
    id: 1,
    title: "Parenting for Positive Self Worth",
    abbr: "PPSW",
    date: "Friday, June 6, 2025",
    time: "TBD",
    instructor: "Rooted 21 Certified Facilitator",
    description:
      "A live group session focused on building positive self-worth in both parents and children. This is a facilitated class — no curriculum materials will be distributed. Come ready to learn, share, and grow.",
    spots: "Open enrollment",
    joinUrl: null, // Will be updated with Teams/Zoom link
    color: C.darkGreen,
  },
  {
    id: 2,
    title: "Making Sense of Your Worth Training",
    abbr: "MSOYW",
    date: "Friday, June 6, 2025",
    time: "TBD",
    instructor: "Rooted 21 Certified Facilitator",
    description:
      "A live training session on understanding and rebuilding your sense of worth as a caregiver. Facilitated class — no materials distributed. All parents and caregivers welcome.",
    spots: "Open enrollment",
    joinUrl: null, // Will be updated with Teams/Zoom link
    color: C.brown,
  },
];

function ClassCard({ cls }) {
  const [interested, setInterested] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${C.cream}` }}
    >
      {/* Header */}
      <div className="px-4 py-3" style={{ background: cls.color }}>
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-extrabold tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: "#ffffff22", color: "#fff" }}
          >
            {cls.abbr}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#ffffff22", color: "#fff" }}
          >
            LIVE CLASS
          </span>
        </div>
        <p className="font-serif font-bold text-sm mt-2" style={{ color: "#fff" }}>
          {cls.title}
        </p>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3" style={{ background: "#fff" }}>
        {/* Date & Time */}
        <div className="flex items-center gap-2">
          <Calendar size={14} color={C.midGreen} />
          <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{cls.date}</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} color={C.gold} />
          <p className="text-xs" style={{ color: C.mutedText }}>{cls.time} · Time TBA — check back soon</p>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} color={C.brown} />
          <p className="text-xs" style={{ color: C.mutedText }}>{cls.spots}</p>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>
          {cls.description}
        </p>

        {/* Join / Notify buttons */}
        {cls.joinUrl ? (
          <a
            href={cls.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
            style={{ background: cls.color, color: "#fff", textDecoration: "none" }}
          >
            <Video size={15} />
            Join Live Class
            <ExternalLink size={12} />
          </a>
        ) : (
          <button
            onClick={() => setInterested(!interested)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: interested ? C.midGreen : C.cream,
              color: interested ? "#fff" : C.darkGreen,
              border: "none",
              cursor: "pointer",
            }}
          >
            <Bell size={14} />
            {interested ? "✓ You'll be notified when link is ready" : "Notify Me When Link is Available"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function LiveClasses() {
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Live Classes"
        subtitle="Join a parenting class or group"
        backTo="/dashboard"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-5">

        {/* Hero */}
        <div className="rounded-2xl p-5 text-center" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">🎓</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>
            Live Parenting Classes
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Join live, facilitated parenting classes taught by a certified Rooted 21 facilitator. Classes meet virtually via Teams or Zoom — link provided before each session.
          </p>
        </div>

        {/* Notice */}
        <div
          className="rounded-xl p-3.5 flex items-start gap-3"
          style={{ background: "#F0F6F0", border: `1px solid ${C.midGreen}` }}
        >
          <span className="text-base flex-shrink-0">📋</span>
          <p className="text-[11px] leading-relaxed" style={{ color: C.darkGreen }}>
            <strong>Please note:</strong> These are facilitated group classes. No training materials, handouts, or curriculum documents will be shared or distributed. All learning happens live during the session.
          </p>
        </div>

        {/* Upcoming classes */}
        <div>
          <p className="text-[10px] font-extrabold tracking-wider mb-3" style={{ color: C.mutedText }}>
            UPCOMING CLASSES — JUNE 2025
          </p>
          <div className="space-y-4">
            {UPCOMING_CLASSES.map(cls => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>How It Works</p>
          {[
            ["📅", "Classes are held virtually on Fridays"],
            ["🔗", "A Teams or Zoom link will be shared before each class"],
            ["👥", "Open to all parents and caregivers in the Rooted 21 community"],
            ["🎓", "Taught by a certified facilitator — come ready to participate"],
            ["🔒", "No materials are distributed — learning happens live in the group"],
          ].map(([emoji, text]) => (
            <div key={text} className="flex items-start gap-3">
              <span className="text-base flex-shrink-0">{emoji}</span>
              <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Questions */}
        <div className="rounded-xl p-3.5 text-center" style={{ background: C.cream }}>
          <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Questions about upcoming classes?</p>
          <p className="text-[11px] mt-1" style={{ color: C.mutedText }}>
            Contact us at{" "}
            <a href="mailto:mstonerock@rooted21parenting.com" style={{ color: C.midGreen, fontWeight: "bold" }}>
              mstonerock@rooted21parenting.com
            </a>
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}