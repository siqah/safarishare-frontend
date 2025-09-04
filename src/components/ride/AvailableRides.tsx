import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import useAuth from '../../stores/authStore';

interface Ride {
    _id: string;
    startLocation: string;
    destination: string;
    departureTime: string;
    availableSeats: number;
    price: number;
    driver?: { name: string; email: string };
}

const AvailableRides = () => {
    const { user } = useAuth();
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filters, setFilters] = useState({
        startLocation: '',
        destination: '',
        date: '',
        minSeats: '1'
    });
    const [bookingSeats, setBookingSeats] = useState<Record<string, number>>({});

    const fetchRides = useCallback(async (applyFilters = false) => {
        if (user?.role !== 'user') return;
        setLoading(true); setError(''); setSuccess('');
        try {
            let params: any = {};
            if (applyFilters) {
                Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
            }
            const res = await api.get('/ride/available-rides', { params });
            setRides(res.data.rides || []);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to load rides');
        } finally {
            setLoading(false);
        }
    }, [filters, user?.role]);

    useEffect(() => { fetchRides(false); }, [fetchRides]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const bookRide = async (rideId: string) => {
        setError(''); setSuccess('');
        try {
            const seats = bookingSeats[rideId] || 1;
            await api.post(`/ride/book/${rideId}`, { seats });
            setSuccess('Ride booked successfully');
            setRides(r =>
                r.map(x =>
                    x._id === rideId ? { ...x, availableSeats: x.availableSeats - seats } : x
                )
            );
        } catch (e: any) {
            setError(e.response?.data?.message || 'Booking failed');
        }
    };

    return (
        <div className="min-h-[70vh] w-full bg-gradient-to-b from-white via-white to-blue-50 px-4 py-6 md:py-10">
            <div className="mx-auto max-w-7xl space-y-8">
                <header className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-blue-800 md:text-3xl">
                        Find a Ride
                    </h1>
                    <p className="text-sm text-blue-600">
                        Search, filter, and reserve available seats.
                    </p>
                </header>

                <form
                    onSubmit={e => {
                        e.preventDefault();
                        fetchRides(true);
                    }}
                    className="grid gap-4 rounded-xl border border-blue-100 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-5"
                >
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium uppercase tracking-wide text-blue-700">
                            From
                        </label>
                        <input
                            name="startLocation"
                            value={filters.startLocation}
                            onChange={handleChange}
                            placeholder="Origin"
                            className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-blue-900 placeholder-blue-300 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium uppercase tracking-wide text-blue-700">
                            To
                        </label>
                        <input
                            name="destination"
                            value={filters.destination}
                            onChange={handleChange}
                            placeholder="Destination"
                            className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-blue-900 placeholder-blue-300 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium uppercase tracking-wide text-blue-700">
                            Date
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={filters.date}
                            onChange={handleChange}
                            className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-blue-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium uppercase tracking-wide text-blue-700">
                                Min Seats
                            </label>
                            <input
                                type="number"
                                min={1}
                                name="minSeats"
                                value={filters.minSeats}
                                onChange={handleChange}
                                className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-blue-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    <div className="flex items-end">
                        <button
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

                {(error || success) && (
                    <div className="space-y-3">
                        {error && (
                            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-600">
                                <span>{success}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] border-collapse text-sm">
                            <thead className="bg-blue-50 text-left text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                                <tr>
                                    <th className="px-4 py-3">From</th>
                                    <th className="px-4 py-3">To</th>
                                    <th className="px-4 py-3">Departure</th>
                                    <th className="px-4 py-3 text-center">Seats</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                    <th className="px-4 py-3">Driver</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-100">
                                {!loading && rides.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-blue-500">
                                            No rides match your search.
                                        </td>
                                    </tr>
                                )}
                                {loading && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-blue-500">
                                            Loading...
                                        </td>
                                    </tr>
                                )}
                                {!loading &&
                                    rides.map(r => (
                                        <tr
                                            key={r._id}
                                            className="transition hover:bg-blue-50/60"
                                        >
                                            <td className="px-4 py-3 font-medium text-blue-900">
                                                {r.startLocation}
                                            </td>
                                            <td className="px-4 py-3 text-blue-800">{r.destination}</td>
                                            <td className="px-4 py-3 text-blue-700">
                                                {new Date(r.departureTime).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-center text-blue-800">
                                                {r.availableSeats}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-blue-900">
                                                ${r.price.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-blue-700">
                                                {r.driver?.name || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={r.availableSeats}
                                                        value={bookingSeats[r._id] || 1}
                                                        onChange={e =>
                                                            setBookingSeats(b => ({
                                                                ...b,
                                                                [r._id]: parseInt(e.target.value)
                                                            }))
                                                        }
                                                        className="w-16 rounded-md border border-blue-200 bg-white px-2 py-1 text-xs text-blue-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                                                    />
                                                    <button
                                                        disabled={r.availableSeats === 0}
                                                        onClick={() => bookRide(r._id)}
                                                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        Book
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                    {rides.length > 0 && !loading && (
                        <div className="flex flex-col gap-2 border-t border-blue-100 bg-blue-50/40 px-4 py-3 text-[11px] text-blue-600 md:flex-row md:items-center md:justify-between">
                            <p>
                                Showing {rides.length} ride{rides.length !== 1 && 's'}
                            </p>
                            <button
                                onClick={() => {
                                    setFilters({ startLocation: '', destination: '', date: '', minSeats: '1' });
                                    fetchRides(false);
                                }}
                                className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900"
                            >
                                Reset filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AvailableRides;
