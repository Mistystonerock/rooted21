import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, MessageSquare, Calendar, Bell, Check } from "lucide-react";

export default function Notifications() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const notifs = await base44.entities.Notification.filter(
        { user_email: u.email },
        "-created_date",
        100
      );
      setNotifications(notifs);
      setLoading(false);
    });

    // Subscribe to real-time notification updates
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === "create") {
        setNotifications((prev) => [event.data, ...prev]);
      } else if (event.type === "update") {
        setNotifications((prev) =>
          prev.map((n) => (n.id === event.id ? event.data : n))
        );
      }
    });

    return unsubscribe;
  }, []);

  async function handleMarkAsRead(id) {
    await base44.entities.Notification.update(id, { read: true });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  async function handleMarkAllAsRead() {
    const unread = notifications.filter((n) => !n.read);
    for (const notif of unread) {
      await base44.entities.Notification.update(notif.id, { read: true });
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageSquare size={16} color={C.darkGreen} />;
      case "appointment":
        return <Calendar size={16} color={C.brown} />;
      default:
        return <Bell size={16} color={C.midGreen} />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "message":
        return C.midGreen;
      case "appointment":
        return C.brown;
      default:
        return C.gold;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard" className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
          <ChevronLeft size={18} color={C.cream} />
        </Link>
        <Bell size={16} color={C.gold} />
        <div className="flex-1">
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Notifications</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>
            {unreadCount > 0 ? `${unreadCount} new` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-bold px-2 py-1 rounded-lg"
            style={{ background: "#ffffff18", color: C.lightGreen, border: "none", cursor: "pointer" }}
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-4">
        {notifications.length === 0 ? (
          <div className="rounded-2xl p-8 text-center mt-8" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
            <Bell size={32} color={C.mutedText} className="mx-auto mb-3" />
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No notifications yet</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>
              You'll see updates here when messages or appointments arrive
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => {
                  if (!notif.read) handleMarkAsRead(notif.id);
                  if (notif.related_link) window.location.href = notif.related_link;
                }}
                className="w-full text-left rounded-2xl p-4 transition-all hover:shadow-md"
                style={{
                  background: notif.read ? C.offWhite : C.white,
                  border: `1px solid ${notif.read ? C.cream : getColor(notif.type)}`,
                  cursor: "pointer",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ background: `${getColor(notif.type)}20` }}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: getColor(notif.type) }}
                        />
                      )}
                    </div>
                    <p className="text-xs" style={{ color: C.mutedText }}>
                      {notif.body}
                    </p>
                    <p className="text-[9px] mt-1" style={{ color: C.mutedText }}>
                      {new Date(notif.created_date).toLocaleDateString()} at{" "}
                      {new Date(notif.created_date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {notif.read && (
                    <Check size={14} color={C.mutedText} className="flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="pb-6" />
      </div>
    </div>
  );
}