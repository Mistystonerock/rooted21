import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import EmergencyTools from "@/components/anger-management/EmergencyTools";
import AngerToolkit from "@/components/anger-management/AngerToolkit";
import GroupsDirectory from "@/components/anger-management/GroupsDirectory";
import StreakTracker from "@/components/anger-management/StreakTracker";
import CrisisStrip from "@/components/anger-management/CrisisStrip";
import ClassAndGroupMaterials from "@/components/classes/ClassAndGroupMaterials";

export default function AngerManagementHub() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("emergency");

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => setUser(null));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite, paddingBottom: 80 }}>
      {/* Header */}
      <MobileHeader
        title="Anger Management"
        subtitle="Tools to stay calm and in control"
        backTo="/dashboard"
      />

      {/* Intro Banner */}
      <div className="px-4 py-4 space-y-2">
        <p className="text-xs leading-relaxed" style={{ color: C.darkGreen }}>
          Anger is not bad. It's information. When you learn to manage it, you protect your kids, your relationships, and your peace.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 sticky top-[64px] z-10 px-4 border-b" style={{ borderColor: C.cream }}>
        {[
          { id: "emergency", label: "🚨 Emergency" },
          { id: "toolkit", label: "🛠️ Toolkit" },
          { id: "materials", label: "📄 Materials" },
          { id: "streak", label: "🔥 Streak" },
          { id: "groups", label: "👥 Groups" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-3 px-2 text-xs font-bold border-b-2 transition-colors text-center"
            style={{
              borderColor: activeTab === tab.id ? C.darkGreen : "transparent",
              color: activeTab === tab.id ? C.darkGreen : C.mutedText,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-5 space-y-6">
        {/* Emergency Tab */}
        {activeTab === "emergency" && (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: C.mutedText }}>
              These tools work RIGHT NOW. Pick one and use it for 5–10 minutes.
            </p>
            <EmergencyTools />
          </div>
        )}

        {/* Toolkit Tab */}
        {activeTab === "toolkit" && (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: C.mutedText }}>
              Build your anger management toolkit over time. The more you practice, the faster you'll react.
            </p>
            <AngerToolkit />
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === "materials" && (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: C.mutedText }}>
              Download practical worksheets and handouts for anger management groups.
            </p>
            <ClassAndGroupMaterials category="anger" />
          </div>
        )}

        {/* Streak Tab */}
        {activeTab === "streak" && (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: C.mutedText }}>
              Every day you don't escalate is a victory. Track your progress here.
            </p>
            <StreakTracker />
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === "groups" && (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: C.mutedText }}>
              You're not alone. Join a group of parents working on the same thing.
            </p>
            <GroupsDirectory />
          </div>
        )}
      </div>

      {/* Crisis Strip */}
      <CrisisStrip />
    </div>
  );
}