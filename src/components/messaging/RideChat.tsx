import React, { useEffect, useRef, useState, useCallback } from 'react';
import api from '../../lib/api';
import { socket } from '../../lib/socket';
import useAuth from '../../stores/authStore';
import { ArrowLeft } from 'lucide-react';
import RideLiveMap from '../Map/RideLiveMap';

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
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null);
  const [shareLoc, setShareLoc] = useState(false);
  const geoWatchId = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);

  const loadMessages = useCallback(async (pg: number) => {
    if (!rideId) return;
    setLoading(true);
    try {
  const res = await api.get(`api/messages/ride/${rideId}`, {
        params: {
          page: pg,
          limit: PAGE_SIZE,
          peer: user?.role === 'driver' ? (activePassengerId || '') : undefined,
        },
      });
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

  // Scroll to bottom on initial load and when message count changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

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

  // Join ride room and listen to live driver location updates
  useEffect(() => {
    if (!rideId) return;
    socket.emit('ride:join', { rideId });
    const onLoc = (p: any) => {
      if (p?.rideId !== rideId) return;
      if (typeof p.lat === 'number' && typeof p.lng === 'number') {
        setDriverPos({ lat: p.lat, lng: p.lng });
      }
    };
    socket.on('ride:location', onLoc);
    return () => {
      socket.emit('ride:leave', { rideId });
      socket.off('ride:location', onLoc);
    };
  }, [rideId]);

  // Driver: share own location to the ride room
  useEffect(() => {
    if (!shareLoc) {
      if (geoWatchId.current !== null) {
        navigator.geolocation.clearWatch(geoWatchId.current);
        geoWatchId.current = null;
      }
      return;
    }
    if (!('geolocation' in navigator)) {
      // eslint-disable-next-line no-alert
      alert('Geolocation not supported on this device');
      setShareLoc(false);
      return;
    }
    geoWatchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, speed } = pos.coords;
        socket.emit('ride:location', { rideId, lat, lng, speed });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => {
      if (geoWatchId.current !== null) {
        navigator.geolocation.clearWatch(geoWatchId.current);
        geoWatchId.current = null;
      }
    };
  }, [shareLoc, rideId]);

  useEffect(() => {
    if (!rideId || !user) return;
    const unreadFromOther = messages.some(m => m.recipient === user.id);
    if (unreadFromOther) {
      api.post(`api/messages/ride/${rideId}/read`, {
        peer: user.role === 'driver' ? activePassengerId : undefined,
      }).catch(() => {});
    }
  }, [messages, rideId, user, activePassengerId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    // For driver: must have a passenger selected
    if (user?.role === 'driver' && !activePassengerId) return;
    try {
  const payload = { body: input.trim(), passengerId: activePassengerId || passengerId };
      // eslint-disable-next-line no-console
      console.log('Sending message payload', payload);
      await api.post(`api/messages/ride/${rideId}`, payload);
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
    <div className="flex flex-col md:flex-row h-full bg-white">
      <div className="px-3 py-2 border-b md:border-b-0 md:border-r flex items-center gap-3 md:w-[360px]">
        {onClose && (
          <button onClick={onClose} className="md:hidden inline-flex items-center justify-center rounded p-1 hover:bg-gray-100" aria-label="Back">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}
        <h3 className="font-semibold text-sm">Ride Chat</h3>
        <div className="ml-auto flex items-center gap-3">
          {user?.role === 'driver' && participants.length > 0 && (
            <select
              value={activePassengerId || ''}
              onChange={e => setActivePassengerId(e.target.value || undefined)}
              className="text-xs border rounded px-1 py-1"
            >
              <option value="">Select passenger…</option>
              {participants.map((p, idx) => (
                <option key={p.id || `${idx}-${p.email}` } value={p.id}>{p.name || p.email || p.id}</option>
              ))}
            </select>
          )}
          {user?.role === 'driver' && (
            <label className="inline-flex items-center gap-2 text-xs text-gray-700">
              <input type="checkbox" checked={shareLoc} onChange={e => setShareLoc(e.target.checked)} />
              Share live location
            </label>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm" onScroll={handleScroll}>
        {loading && !messages.length && <div className="text-gray-400">Loading…</div>}
        {canLoadMore && (
          <div className="text-center text-[11px] text-gray-400 pb-2">Scroll up to load older…</div>
        )}
        {user?.role === 'driver' && participants.length > 0 && !activePassengerId && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            Select a passenger from the dropdown above to start chatting.
          </div>
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
      <div className="p-3 border-t md:border-t-0 md:border-l md:w-[360px]">
        <div className="text-xs text-gray-500 mb-2">Live driver location</div>
        <RideLiveMap rideId={rideId} driverPosition={driverPos} height={220} />
      </div>
      <div className="p-3 border-t flex gap-2 md:absolute md:bottom-0 md:left-[360px] md:right-0 md:border-t">
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
  );
};

export default RideChat;
