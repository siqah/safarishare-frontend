import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { getErrorMessage } from '../lib/errors';

type Item = { _id: string; title: string; message: string; createdAt?: string };

const NotificationsPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('api/notifications');
        setItems(res.data.notifications || []);
      } catch (e: unknown) {
        setError(getErrorMessage(e, 'Failed to load'));
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
