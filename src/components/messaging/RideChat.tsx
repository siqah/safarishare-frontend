import React, { useEffect, useRef, useState, useCallback } from 'react';
import api from '../../lib/api';
import { socket } from '../../lib/socket';
import useAuth from '../../stores/authStore';

interface ChatMessage {
  id: string;
  rideId: string;
  sender: string;
  recipient: string;
  body: string;
  createdAt: string;
}

interface Participant {
  id: string;
  name?: string;
  email?: string;
}

interface Props {
  rideId: string;
  passengerId?: string; // required if driver initiates
  onClose?: () => void;
}

const PAGE_SIZE = 30;

const RideChat: React.FC<Props> = ({ rideId, passengerId, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activePassengerId, setActivePassengerId] = useState<string | undefined>(passengerId);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);

  const loadMessages = useCallback(async (pg: number) => {
    if (!rideId) return;
    setLoading(true);
    try {
  const res = await api.get(`api/messages/ride/${rideId}`, { params: { page: pg, limit: PAGE_SIZE } });
      const { messages: list, total: t } = res.data;
      setTotal(t);
      const normalized: ChatMessage[] = (list || []).map((m: any) => ({
        id: m.id || m._id || `${rideId}-${m.sender}-${m.createdAt}`,
        rideId: m.rideId || rideId,
        sender: typeof m.sender === 'object' ? (m.sender._id || m.sender.id || String(m.sender)) : String(m.sender),
        recipient: typeof m.recipient === 'object' ? (m.recipient._id || m.recipient.id || String(m.recipient)) : String(m.recipient),
        body: m.body,
        createdAt: m.createdAt,
      }));
      if (pg === 1) setMessages(normalized);
      else setMessages(prev => [...normalized, ...prev]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Load messages failed', e);
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
    }
  }, [rideId]);

  useEffect(() => { loadMessages(1); }, [loadMessages]);

  // Fetch participants if user is driver
  useEffect(() => {
    if (!user || user.role !== 'driver') return;
    api.get(`api/messages/ride/${rideId}/participants`).then(res => {
      setParticipants(res.data.participants || []);
    }).catch(() => {/* ignore */});
  }, [user, rideId]);

  useEffect(() => {
    const handler = (m: any) => {
      if (m.rideId !== rideId) return;
      const normalized: ChatMessage = {
        id: m.id || m._id || `${rideId}-${m.sender}-${m.createdAt}`,
        rideId: m.rideId || rideId,
        sender: typeof m.sender === 'object' ? (m.sender._id || m.sender.id || String(m.sender)) : String(m.sender),
        recipient: typeof m.recipient === 'object' ? (m.recipient._id || m.recipient.id || String(m.recipient)) : String(m.recipient),
        body: m.body,
        createdAt: m.createdAt,
      };
      setMessages(prev => {
        if (prev.some(x => x.id === normalized.id)) return prev; // avoid duplicates
        return [...prev, normalized];
      });
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    };
    socket.on('message:new', handler);
    return () => { socket.off('message:new', handler); };
  }, [rideId]);

  useEffect(() => {
    if (!rideId || !user) return;
  const unreadFromOther = messages.some(m => m.recipient === user.id);
    if (unreadFromOther) {
  api.post(`api/messages/ride/${rideId}/read`).catch(() => {});
    }
  }, [messages, rideId, user]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    // For driver: must have a passenger selected
    if (user?.role === 'driver' && !activePassengerId) return;
    try {
  await api.post(`api/messages/ride/${rideId}`, { body: input.trim(), passengerId: activePassengerId || passengerId });
      setInput('');
    } catch {
      // ignore
    }
  };

  const canLoadMore = total !== null && messages.length < total;

  const handleScroll: React.UIEventHandler<HTMLDivElement> = e => {
    const el = e.currentTarget;
    if (el.scrollTop < 60 && canLoadMore && !loadingMoreRef.current) {
      loadingMoreRef.current = true;
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md h-[520px] flex flex-col rounded shadow">
        <div className="px-4 py-2 border-b flex items-center justify-between gap-3">
          <h3 className="font-semibold text-sm">Ride Chat</h3>
          {user?.role === 'driver' && participants.length > 0 && (
            <select
              value={activePassengerId || ''}
              onChange={e => setActivePassengerId(e.target.value || undefined)}
              className="text-xs border rounded px-1 py-0.5"
            >
              <option value="">Select passenger…</option>
              {participants.map(p => (
                <option key={p.id} value={p.id}>{p.name || p.email || p.id}</option>
              ))}
            </select>
          )}
          {onClose && <button onClick={onClose} className="text-xs text-gray-500">Close</button>}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm" onScroll={handleScroll}>
          {loading && !messages.length && <div className="text-gray-400">Loading…</div>}
          {canLoadMore && (
            <div className="text-center text-[11px] text-gray-400 pb-2">Scroll up to load older…</div>
          )}
          {messages.map(m => {
            const mine = user && m.sender === user.id;
            return (
              <div key={m.id} className={`max-w-[80%] rounded px-3 py-2 ${mine ? 'ml-auto bg-indigo-600 text-white' : 'mr-auto bg-gray-100 text-gray-800'}`}>
                <div>{m.body}</div>
                <div className="mt-1 text-[10px] opacity-70">{new Date(m.createdAt).toLocaleTimeString()}</div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="p-3 border-t flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), sendMessage())}
            className="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} disabled={!input.trim() || (user?.role === 'driver' && !activePassengerId)} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">Send</button>
        </div>
      </div>
    </div>
  );
};

export default RideChat;
