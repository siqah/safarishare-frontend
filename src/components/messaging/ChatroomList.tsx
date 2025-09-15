import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../stores/authStore';
import RideChat from './RideChat';
import { socket } from '../../lib/socket';

export interface ConversationItem {
  rideId: string;
  peer?: { id: string; name?: string; email?: string };
  lastMessage?: { id: string; sender: string; body: string; createdAt: string };
  ride?: { id: string; startLocation?: string; destination?: string; departureTime?: string };
  unread: number;
}

interface ChatroomListProps {
  className?: string;
  onOpenChat?: (args: { rideId: string; passengerId?: string }) => void;
}

const ChatroomList: React.FC<ChatroomListProps> = ({ className = '', onOpenChat }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [active, setActive] = useState<{ rideId: string; passengerId?: string } | null>(null);

  const isDriver = user?.role === 'driver';

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('api/messages/conversations');
      setItems(res.data.conversations || []);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Load conversations error:', e?.response?.data || e);
      setError('Failed to load conversations');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Real-time updates: refresh on new message (lightweight approach)
  useEffect(() => {
    const handler = (payload: { rideId?: string; sender?: string; recipient?: string; body?: string; createdAt?: string }) => {
      if (active) return; // let chat handle
      if (!payload?.rideId) { load(); return; }
      setItems(prev => {
        const idx = prev.findIndex(c => c.rideId === payload.rideId);
        if (idx === -1) { load(); return prev; }
        const next = [...prev];
        const row = next[idx];
        const lastMessage = {
          id: 'temp',
          sender: payload.sender || '',
          body: payload.body || row.lastMessage?.body || '',
          createdAt: payload.createdAt || new Date().toISOString(),
        };
        const unread = (row.unread || 0) + 1; // naive bump; server truth will correct on next refresh
        next[idx] = { ...row, lastMessage, unread };
        // Move updated row to top
        next.splice(idx, 1);
        return [{ ...row, lastMessage, unread }, ...next];
      });
    };
    socket.on('message:new', handler);
    return () => { socket.off('message:new', handler); };
  }, [active]);

  const empty = !loading && items.length === 0;

  const openChat = (rideId: string, passengerId?: string) => {
    if (onOpenChat) onOpenChat({ rideId, passengerId });
    setActive({ rideId, passengerId });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          <p className="text-sm text-gray-500">Recent chatrooms with drivers and passengers</p>
        </div>
        <button onClick={load} disabled={loading} className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">Refresh</button>
      </div>

      {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-3">Ride</th>
              <th className="px-4 py-3">Peer</th>
              <th className="px-4 py-3">Last message</th>
              <th className="px-4 py-3 text-right">Unread</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading…</td></tr>}
            {empty && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No conversations yet.</td></tr>}
            {!loading && items.map((c, idx) => (
              <tr key={`${c.rideId}-${c.peer?.id || idx}`} className="hover:bg-indigo-50/40">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {c.ride?.startLocation && c.ride?.destination ? (
                    <div>
                      <div>{c.ride.startLocation} → {c.ride.destination}</div>
                      {c.ride.departureTime && (
                        <div className="text-xs text-gray-500">{new Date(c.ride.departureTime).toLocaleString()}</div>
                      )}
                    </div>
                  ) : (
                    c.rideId
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">{c.peer?.name || c.peer?.email || c.peer?.id || '-'}</td>
                <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{c.lastMessage?.body || '-'}</td>
                <td className="px-4 py-3 text-right">
                  {c.unread > 0 ? (
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">{c.unread}</span>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openChat(c.rideId, isDriver ? c.peer?.id : undefined)}
                    className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                  >
                    Open Chat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {active && (
        <RideChat rideId={active.rideId} passengerId={active.passengerId} onClose={() => { setActive(null); load(); }} />
      )}
    </div>
  );
};

export default ChatroomList;
