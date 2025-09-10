import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import useAuth from '../../stores/authStore';
import { socket } from '../../lib/socket';

interface NotificationItem {
  _id: string;
  type: 'booking' | 'cancellation' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  ride?: string;
  booking?: string;
}

type NotificationPayload = {
  id: string;
  type: 'booking' | 'cancellation' | 'system';
  title: string;
  message: string;
  createdAt?: string;
  rideId?: string;
  bookingId?: string;
};

type CountPayload = { unread: number };

const NotificationBell: React.FC = () => {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const computedUnread = useMemo(() => items.filter(i => !i.isRead).length, [items]);

  const fetchAll = async (reset = true, pageOverride?: number) => {
    if (!token) return;
    try {
      const p = reset ? 1 : (pageOverride ?? page);
      const res = await api.get('api/notifications', { params: { page: p, limit: 20 } });
      const list: NotificationItem[] = res.data.notifications || [];
      if (reset) {
        setItems(list);
        setPage(1);
      } else {
        setItems(prev => [...prev, ...list]);
      }
      if (typeof res.data.unread === 'number') setUnread(res.data.unread);
      const total = res.data.total || 0;
      const currentCount = (reset ? list.length : items.length + list.length);
      setHasMore(currentCount < total);
    } catch {
      /* ignore fetch errors */
    }
  };

  const onScroll = () => {
    const el = listRef.current;
    if (!el || loadingMore || !hasMore) return;
    const threshold = 60; // px from bottom
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
      const next = page + 1;
      setLoadingMore(true);
      setPage(next);
      fetchAll(false, next).finally(() => setLoadingMore(false));
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.post(`api/notifications/${id}/read`);
      setItems(prev => prev.map(i => (i._id === id ? { ...i, isRead: true } : i)));
      setUnread(u => Math.max(0, u - 1));
    } catch {
      /* failed to mark notification as read, ignore */
    }
  };

  const markAll = async () => {
    try {
      await api.post('api/notifications/read-all');
      setItems(prev => prev.map(i => ({ ...i, isRead: true })));
      setUnread(0);
    } catch {
      // noop
    }
  };

  const deleteOne = async (id: string) => {
    try {
      await api.delete(`api/notifications/${id}`);
      const removed = items.find(i => i._id === id);
      setItems(prev => prev.filter(i => i._id !== id));
      if (removed && !removed.isRead) setUnread(u => Math.max(0, u - 1));
    } catch {
      /* ignore delete errors */
    }
  };

  const clearRead = async () => {
    try {
      await api.delete('api/notifications');
      setItems(prev => prev.filter(i => !i.isRead));
      // unread unaffected; server emits count if changed elsewhere
    } catch {
      /* ignore clear errors */
    }
  /* failed to clear read notifications, ignore */
  };

  useEffect(() => {
    if (!token) return;
    fetchAll(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!user) return;
    const handler = (payload: NotificationPayload) => {
      console.log('Received notification:', payload);
      setItems(prev => [
        {
          _id: payload.id,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          isRead: false,
          createdAt: payload.createdAt || new Date().toISOString(),
          ride: payload.rideId,
          booking: payload.bookingId,
        } as NotificationItem,
        ...prev,
      ]);
      setUnread(u => u + 1);

      try {
        if (typeof Notification !== 'undefined') {
          if (Notification.permission === 'granted') {
            new Notification(payload.title || 'Notification', { body: payload.message });
          }
        }
      } catch {
        /* ignore Notification API errors */
      }
      setToast({ title: payload.title || 'Notification', message: payload.message });
      setTimeout(() => setToast(null), 3500);
    };
    socket.on('notification', handler);

    const countHandler = (payload: CountPayload) => {
      console.log('Received notification count:', payload);
      if (typeof payload?.unread === 'number') setUnread(payload.unread);
    };
    socket.on('notification:count', countHandler);

    return () => {
      socket.off('notification', handler);
      socket.off('notification:count', countHandler);
    };
  }, [user]);

  useEffect(() => {
    const getCount = async () => {
      if (!token) return;
      try {
        const res = await api.get('api/notifications/unread-count');
        if (typeof res.data.unread === 'number') setUnread(res.data.unread);
      } catch {
        /* ignore count fetch errors */
      }
    };
    getCount();
  }, [token]);

  // Update document title with unread count (max between server and local computed)
  useEffect(() => {
    const base = 'SafariShare';
    const u = Math.max(unread, computedUnread);
    if (u > 0) document.title = `(${u}) ${base}`;
    else document.title = base;
  }, [unread, computedUnread]);

  if (!user) return null;

  const badgeCount = Math.max(unread, computedUnread);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center">
            {badgeCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <span className="text-sm font-semibold">Notifications</span>
            {items.length > 0 && (
              <div className="flex items-center gap-2">
                <button className="text-xs text-blue-600 hover:underline" onClick={markAll}>Mark all read</button>
                <button className="text-xs text-rose-600 hover:underline" onClick={clearRead}>Clear read</button>
              </div>
            )}
          </div>
          <div ref={listRef} onScroll={onScroll} className="max-h-80 overflow-auto">
          <ul className="divide-y divide-gray-100">
            {items.length === 0 && (
              <li className="p-4 text-sm text-gray-500">No notifications</li>
            )}
            {items.map((n) => (
              <li key={n._id} className="p-3 hover:bg-gray-50">
                <div className="flex items-start gap-2">
                  <div className={`mt-1 h-2 w-2 rounded-full ${n.isRead ? 'bg-gray-300' : 'bg-blue-600'}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{n.title}</div>
                    <div className="text-xs text-gray-600">{n.message}</div>
                    <div className="mt-1 text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                    <div className="mt-2 text-[11px]">
                      {n.ride && (
                        <Link to={`/rides?focus=${n.ride}`} className="text-blue-600 hover:underline">View ride</Link>
                      )}
                      {n.booking && (
                        <span className="ml-2 text-gray-400">•</span>
                      )}
                      {n.booking && (
                        <Link to={`/bookings?focus=${n.booking}`} className="ml-2 text-blue-600 hover:underline">View booking</Link>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {!n.isRead && (
                      <button onClick={() => markRead(n._id)} className="text-xs text-blue-600 hover:underline">Mark read</button>
                    )}
                    <button onClick={() => deleteOne(n._id)} className="text-[11px] text-rose-600 hover:underline">Delete</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {loadingMore && (
            <div className="border-t border-gray-100 p-2 text-center text-[11px] text-gray-500">Loading…</div>
          )}
          </div>

          {toast && (
            <div className="fixed bottom-4 right-4 z-[60] max-w-sm rounded-lg border border-gray-200 bg-white shadow-lg p-3">
              <div className="text-sm font-semibold text-gray-900">{toast.title}</div>
              <div className="text-xs text-gray-600">{toast.message}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
