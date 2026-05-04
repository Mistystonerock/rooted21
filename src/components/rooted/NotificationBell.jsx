import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const notifs = await base44.entities.Notification.filter(
        { user_email: u.email, read: false },
        "-created_date"
      );
      setUnreadCount(notifs.length);
    });

    // Subscribe to real-time updates
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === "create" && event.data.user_email === user?.email && !event.data.read) {
        setUnreadCount((prev) => prev + 1);
      } else if (event.type === "update" && event.data.user_email === user?.email) {
        if (event.data.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    });

    return unsubscribe;
  }, [user?.email]);

  return (
    <Link
      to="/notifications"
      className="relative rounded-lg p-2 transition-all hover:opacity-70"
      style={{ background: "transparent", border: "none", textDecoration: "none" }}
    >
      <Bell size={18} color={C.lightGreen} />
      {unreadCount > 0 && (
        <span
          className="absolute top-0 right-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: "#B84C2A", color: C.white }}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}