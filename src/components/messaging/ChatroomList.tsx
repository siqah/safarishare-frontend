import React, { useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../stores/authStore';
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
  onSelect?: (args: { rideId: string; passengerId?: string }) => void;
}

const ChatroomList: React.FC<ChatroomListProps> = ({ className = '', onSelect }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const isDriver = user?.role === 'driver';

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('api/messages/conversations');
      setItems(res.data.conversations || []);
    } catch (e: any) {
      // If endpoint not found in deployed backend, show empty list without error
      if (e?.response?.status === 404) {
        setItems([]);
        setError('');
      } else {
        // eslint-disable-next-line no-console
        console.error('Load conversations error:', e?.response?.data || e);
        setError('Failed to load conversations');
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Real-time updates: refresh on new message (lightweight approach)
  useEffect(() => {
    const handler = (payload: { rideId?: string; sender?: string; recipient?: string; body?: string; createdAt?: string }) => {
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
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter(c => {
      if (unreadOnly && (c.unread || 0) <= 0) return false;
      if (!term) return true;
      const rideText = `${c.ride?.startLocation || ''} ${c.ride?.destination || ''} ${c.rideId}`.toLowerCase();
      const peerText = `${c.peer?.name || ''} ${c.peer?.email || ''} ${c.peer?.id || ''}`.toLowerCase();
      const lastText = `${c.lastMessage?.body || ''}`.toLowerCase();
      return rideText.includes(term) || peerText.includes(term) || lastText.includes(term);
    });
  }, [items, q, unreadOnly]);

  const empty = !loading && filtered.length === 0;

  const openChat = (rideId: string, passengerId?: string) => {
    onSelect?.({ rideId, passengerId });
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-3 p-3 border-b bg-white">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by ride, peer, message..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} />
          Unread
        </label>
        <button onClick={load} disabled={loading} className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">Refresh</button>
      </div>
      {error && <div className="px-3 py-2 text-sm text-rose-600 bg-rose-50 border-b border-rose-200">{error}</div>}
      <div className="flex-1 overflow-y-auto">
        {loading && <div className="px-4 py-6 text-center text-gray-500">Loading…</div>}
        {empty && <div className="px-4 py-10 text-center text-gray-500">No conversations yet.</div>}
        {!loading && filtered.map((c, idx) => (
          <button
            key={`${c.rideId}-${c.peer?.id || idx}`}
            onClick={() => openChat(c.rideId, isDriver ? c.peer?.id : undefined)}
            className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-indigo-50/60 border-b"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-gray-800 truncate">{c.peer?.name || c.peer?.email || c.peer?.id || 'Chat'}</div>
                {c.unread > 0 && (
                  <span className="shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">{c.unread}</span>
                )}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {c.ride?.startLocation && c.ride?.destination ? (
                  <span>{c.ride.startLocation} → {c.ride.destination}</span>
                ) : (
                  <span>{c.rideId}</span>
                )}
                {c.ride?.departureTime && (
                  <span> • {new Date(c.ride.departureTime).toLocaleString()}</span>
                )}
              </div>
              <div className="mt-0.5 text-sm text-gray-600 truncate">{c.lastMessage?.body || '—'}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatroomList;
