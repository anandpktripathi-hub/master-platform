import React, { useEffect, useState } from "react";
import { notificationsApi, UserNotificationDto } from "../lib/api";

export default function NotificationCenterPage() {
  const [items, setItems] = useState<UserNotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await notificationsApi.getMyNotifications();
        if (!mounted) return;
        setItems(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Failed to load notifications");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Notification Center</h1>
          <p className="text-sm text-slate-400">
            Central feed of in-app notifications generated from CRM activity and other modules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="px-3 py-1 text-xs rounded bg-teal-600 text-white hover:bg-teal-500"
            >
              Mark all read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {loading && <div className="text-slate-400">Loading…</div>}
      {!loading && error && <div className="text-red-400 text-sm">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="text-slate-500 text-sm">No notifications yet.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="mt-4 border border-slate-800 rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">Title</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">Message</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">Event</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">When</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((n) => {
                const id = n.id || (n as any)._id || `${n.eventKey}-${n.createdAt}`;
                return (
                  <tr key={id} className={n.read ? "bg-transparent" : "bg-slate-900/40"}>
                    <td className="px-4 py-2 align-top text-slate-100">{n.title}</td>
                    <td className="px-4 py-2 align-top text-slate-300 max-w-md">
                      <div className="whitespace-pre-wrap break-words">{n.message}</div>
                      {n.linkUrl && (
                        <a
                          href={n.linkUrl}
                          className="mt-1 inline-flex text-xs text-teal-400 hover:text-teal-300"
                        >
                          Open related page
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top text-[11px] text-slate-400">{n.eventKey}</td>
                    <td className="px-4 py-2 align-top text-[11px] text-slate-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 align-top text-[11px] text-slate-400">
                      {n.read ? "Read" : "Unread"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
