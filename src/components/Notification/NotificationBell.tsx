import React, { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
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

const NotificationBell: React.FC = () => {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const unread = useMemo(() => items.filter(i => !i.isRead).length, [items]);

  const fetchAll = async () => {
    if (!token) return;
    try {
      const res = await api.get('api/notifications');
      setItems(res.data.notifications || []);
    } catch {
      // noop
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.post(`api/notifications/${id}/read`);
      setItems(prev => prev.map(i => (i._id === id ? { ...i, isRead: true } : i)));
    } catch {
      // noop
    }
  };

  const markAll = async () => {
    try {
      await api.post('api/notifications/read-all');
      setItems(prev => prev.map(i => ({ ...i, isRead: true })));
    } catch {
      // noop
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!user) return;
    const handler = (payload: any) => {
      setItems(prev => [
        {
          _id: payload.id,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          isRead: false,
          createdAt: payload.createdAt || new Date().toISOString(),
        } as NotificationItem,
        ...prev,
      ]);
    };
    socket.on('notification', handler);
    return () => { socket.off('notification', handler); };
  }, [user]);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <span className="text-sm font-semibold">Notifications</span>
            {items.length > 0 && (
              <button className="text-xs text-blue-600 hover:underline" onClick={markAll}>Mark all read</button>
            )}
          </div>
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
                  </div>
                  {!n.isRead && (
                    <button onClick={() => markRead(n._id)} className="text-xs text-blue-600 hover:underline">Mark read</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
