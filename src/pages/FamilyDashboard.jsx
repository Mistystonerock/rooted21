import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, LayoutGrid, MessageCircle, Calendar } from "lucide-react";
import TreeLogo from "@/components/rooted/TreeLogo";
import FamilyCalendar from "@/components/family/FamilyCalendar";
import MessagingInbox from "@/components/family/MessagingInbox";

const TABS = [
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "messages", label: "Messages", icon: MessageCircle },
];

export default function FamilyDashboard() {
  const [user, setUser] = useState(null);
  const [child, setChild] = useState(null);
  const [team, setTeam] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("calendar");

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const [children, assignments, evts] = await Promise.all([
        base44.entities.ChildProfile.list("-created_date", 1),
        base44.entities.AssignedFamily.filter({ family_email: u.email }, "-created_date", 50),
        base44.entities.FamilyEvent.filter({ family_email: u.email }, "date", 100),
      ]);
      setChild(children[0] || null);
      setTeam(assignments);
      setEvents(evts);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  const upcomingCount = events.filter(e => new Date(e.date) >= new Date(new Date().toDateString())).length;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <TreeLogo size={28} />
        <div className="flex-1 min-w-0">
          <p className="font-serif font-bold text-sm leading-none" style={{ color: C.cream }}>
            Family Dashboard
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: C.lightGreen }}>
            {child?.first_name ? `${child.first_name}'s Family` : user?.full_name || "My Family"} · {team.length} professional{team.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link to="/dashboard">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#ffffff18" }}>
            <LayoutGrid size={15} color={C.cream} />
          </div>
        </Link>
      </div>

      {/* Summary strip */}
      <div className="flex gap-0 border-b" style={{ background: C.white, borderColor: C.cream }}>
        <div className="flex-1 px-4 py-2.5 text-center border-r" style={{ borderColor: C.cream }}>
          <p className="text-lg font-extrabold leading-none" style={{ color: C.darkGreen }}>{upcomingCount}</p>
          <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>Upcoming events</p>
        </div>
        <div className="flex-1 px-4 py-2.5 text-center border-r" style={{ borderColor: C.cream }}>
          <p className="text-lg font-extrabold leading-none" style={{ color: C.midGreen }}>{team.length}</p>
          <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>Professionals</p>
        </div>
        <div className="flex-1 px-4 py-2.5 text-center">
          <p className="text-lg font-extrabold leading-none" style={{ color: C.brown }}>
            {events.filter(e => e.event_type === "court_date" && new Date(e.date) >= new Date(new Date().toDateString())).length}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>Court dates</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex sticky top-[60px] z-10" style={{ background: C.white, borderBottom: `1px solid ${C.cream}` }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-all"
              style={{
                background: "transparent",
                border: "none",
                borderBottom: tab === t.id ? `2.5px solid ${C.darkGreen}` : "2.5px solid transparent",
                color: tab === t.id ? C.darkGreen : C.mutedText,
                cursor: "pointer",
              }}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="max-w-[600px] mx-auto px-4 py-5">
        {tab === "calendar" && (
          <FamilyCalendar
            events={events}
            familyEmail={user?.email}
            currentUser={user}
            senderRole="Parent"
            onEventAdded={evt => setEvents(prev => [...prev, evt])}
            onEventDeleted={id => setEvents(prev => prev.filter(e => e.id !== id))}
          />
        )}

        {tab === "messages" && (
          <MessagingInbox
            team={team}
            currentUser={user}
            senderRole="Parent"
          />
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}