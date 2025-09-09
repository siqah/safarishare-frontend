import { useEffect, useState, useMemo } from "react";
import api from "../../lib/api";
import useAuth from "../../stores/authStore";

interface Ride {
  _id: string;
  startLocation: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  price: number;
  status: string;
}

const statusStyles: Record<string, string> = {
  active:
    "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
  completed:
    "bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30",
  canceled:
    "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30",
  default:
    "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-500/30"
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="p-3">
        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
      </td>
    ))}
  </tr>
);

const MyRides = () => {
  const { user, token } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRides = async () => {
    if (!token || user?.role !== "driver") return;
    try {
      setError("");
      setLoading(true);
      const res = await api.get("api/ride/myRides");
      setRides(res.data.rides || []);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load rides");
    } finally {
      setLoading(false);
    }
  };

  const cancelRide = async (id: string) => {
    if (!token) return;
    try {
      await api.put(`/api/ride/${id}/cancel`);
      setRides(prev =>
        prev.map(r => (r._id === id ? { ...r, status: "canceled" } : r))
      );
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to cancel ride");
    }
  };

  useEffect(() => {
    fetchRides();
  }, [token, user?.role]);

  const hasRides = useMemo(() => rides.length > 0, [rides]);

  if (user?.role !== "driver")
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300">
        Not a driver.
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-100">
            My Rides
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage and monitor your published rides.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchRides}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-indigo-600 to-indigo-500 px-3 py-2 text-sm font-medium text-white shadow hover:from-indigo-500 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 dark:from-indigo-500 dark:to-indigo-400"
          >
            <svg
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582M20 20v-5h-.581M5.5 9A7.5 7.5 0 0 1 19 11.25M18.5 15A7.5 7.5 0 0 1 5 12.75"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-700/50 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Departure</th>
                <th className="px-4 py-3 text-center">Seats</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading &&
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

              {!loading && !hasRides && !error && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No rides yet. Publish a ride to get started.
                  </td>
                </tr>
              )}

              {!loading &&
                hasRides &&
                rides.map(r => {
                  const style =
                    statusStyles[r.status] || statusStyles.default;
                  return (
                    <tr
                      key={r._id}
                      className="group bg-white hover:bg-indigo-50/50 dark:bg-transparent dark:hover:bg-indigo-500/5"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                        {r.startLocation}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                        {r.destination}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {new Date(r.departureTime).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-200">
                        {r.availableSeats}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                        <span className="text-gray-500">KES</span>
                        {r.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize shadow-sm ${style}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              r.status === "active"
                                ? "bg-emerald-500"
                                : r.status === "completed"
                                ? "bg-sky-500"
                                : r.status === "canceled"
                                ? "bg-rose-500"
                                : "bg-gray-400"
                            }`}
                          />
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.status === "active" && (
                          <button
                            onClick={() => cancelRide(r._id)}
                            className="rounded-md bg-rose-500 px-3 py-1 text-xs font-medium text-white hover:bg-rose-600"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {!loading && hasRides && (
          <div className="flex justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-400">
            <span>Total rides: {rides.length}</span>
            <span>
              Updated{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRides;
