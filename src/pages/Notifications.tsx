import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const NotificationsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('api/notifications');
        setItems(res.data.notifications || []);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load');
      }
    })();
  }, []);
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Notifications</h1>
      {error && <div className="text-sm text-rose-600">{error}</div>}
      <ul className="divide-y">
        {items.map(i => (
          <li key={i._id} className="py-2">
            <div className="text-sm font-medium">{i.title}</div>
            <div className="text-xs text-gray-600">{i.message}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;
