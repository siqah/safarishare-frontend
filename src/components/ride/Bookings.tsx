import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import useAuth from '../../stores/authStore';
import { getErrorMessage } from '../../lib/errors';
import RideChat from '../messaging/RideChat';

interface Booking {
  _id: string;
  seatsBooked: number;
  status: string;
  createdAt: string;
  ride: {
    _id: string;
    startLocation: string;
    destination: string;
    departureTime: string;
    price: number;
    driver?: { name: string; email: string };
  };
}

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [chatRideId, setChatRideId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if(user?.role !== 'user') return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await api.get('api/ride/bookings');
      setBookings(res.data.bookings || []);
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to load bookings'));
    } finally { setLoading(false); }
  }, [user?.role]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const cancelBooking = async (id: string) => {
    setError(''); setSuccess('');
    try {
      await api.post(`api/ride/cancel/${id}`);
      setSuccess('Booking cancelled');
      setBookings(b => b.map(x => x._id === id ? { ...x, status: 'cancelled' } : x));
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Cancel failed'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">My Bookings</h1>
          <p className="text-sm text-gray-500">Manage your reserved seats.</p>
        </div>
        <button onClick={fetchBookings} disabled={loading} className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">Refresh</button>
      </div>
      {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</div>}
      {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{success}</div>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Departure</th>
              <th className="px-4 py-3 text-center">Seats</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>}
            {!loading && bookings.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No bookings yet.</td></tr>}
            {!loading && bookings.map(b => (
              <tr key={b._id} className="hover:bg-indigo-50/40">
                <td className="px-4 py-3 font-medium text-gray-800">{b.ride.startLocation} → {b.ride.destination}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(b.ride.departureTime).toLocaleString()}</td>
                <td className="px-4 py-3 text-center text-gray-700">{b.seatsBooked}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">${(b.ride.price * b.seatsBooked).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${b.status === 'booked' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'}`}>{b.status}</span>
                </td>
                <td className="px-4 py-3 flex gap-2 justify-end">
                  {b.status === 'booked' && (
                    <>
                      <button
                        onClick={() => setChatRideId(b.ride._id)}
                        className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                      >
                        Chat
                      </button>
                      <button
                        onClick={() => cancelBooking(b._id)}
                        className="rounded bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    {chatRideId && (
      <RideChat
        rideId={chatRideId}
        onClose={() => setChatRideId(null)}
      />
    )}
    </div>
  );
};

export default Bookings;