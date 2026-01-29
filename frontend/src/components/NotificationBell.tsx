import React, { useEffect, useState } from "react";
import { notificationsApi, UserNotificationDto } from "../lib/api";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<UserNotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationsApi.getMyNotifications();
      setItems(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load so badge is populated as soon as nav renders
    void load();
  }, []);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && items.length === 0 && !loading) {
      void load();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore; user can retry later
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative flex items-center gap-2 px-3 py-1 rounded-full text-xs topbar-btn focus:outline-none"
        aria-haspopup="true"
        aria-expanded={open}
     >
        <span className="material-icons" style={{ fontSize: 18 }}>
          notifications
        </span>
        <span className="hidden md:inline">Notifications</span>
        {unreadCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] px-1.5 py-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md shadow-lg bg-[#020617] border border-slate-700 z-40">
          <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Notification Center</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-teal-400 hover:text-teal-300"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto text-xs">
            {loading && (
              <div className="px-3 py-3 text-slate-400">Loading…</div>
            )}
            {!loading && error && (
              <div className="px-3 py-3 text-red-400">{error}</div>
            )}
            {!loading && !error && items.length === 0 && (
              <div className="px-3 py-3 text-slate-500">No notifications yet.</div>
            )}
            {!loading && !error &&
              items.map((n) => {
                const id = n.id || (n as any)._id || `${n.eventKey}-${n.createdAt}`;
                return (
                  <div
                    key={id}
                    className={`px-3 py-2 border-b border-slate-800 last:border-b-0 ${
                      n.read ? "bg-transparent" : "bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-slate-100 truncate">{n.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-2">
                          {n.message}
                        </div>
                      </div>
                      {!n.read && (
                        <span className="ml-2 h-2 w-2 rounded-full bg-teal-400" />
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                      {n.linkUrl && (
                        <a
                          href={n.linkUrl}
                          className="text-teal-400 hover:text-teal-300"
                        >
                          Open
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
