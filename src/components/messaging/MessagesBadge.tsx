import React, { useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import { socket } from '../../lib/socket';

const MessagesBadge: React.FC = () => {
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnread = async () => {
    setLoading(true);
    try {
      const res = await api.get('api/messages/conversations');
      const list = res.data?.conversations || [];
      const total = list.reduce((sum: number, c: any) => sum + (Number(c?.unread) || 0), 0);
      setUnread(total);
    } catch (err: any) {
      // If endpoint not found in deployed backend, treat as 0 unread
      if (err?.response?.status === 404) {
        setUnread(0);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUnread(); }, []);

  useEffect(() => {
    const onNew = () => fetchUnread();
    socket.on('message:new', onNew);
    return () => { socket.off('message:new', onNew); };
  }, []);

  const content = useMemo(() => unread > 99 ? '99+' : unread, [unread]);

  if (loading && unread === 0) return null;
  if (unread <= 0) return null;

  return (
    <span className="ml-1 inline-flex items-center justify-center rounded-full bg-amber-600 text-white text-[10px] px-1.5 min-w-4 h-4">
      {content}
    </span>
  );
};

export default MessagesBadge;
