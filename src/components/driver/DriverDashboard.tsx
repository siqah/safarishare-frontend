import React, { useEffect, useState } from "react";
import useAuth from "../../stores/authStore";
import { LogOut, Car, DollarSign, Clock, CheckCircle } from "lucide-react";

interface Ride {
  id: string;
  pickup: string;
  dropoff: string;
  time: string;
  fare: number;
  status: "pending" | "ongoing" | "completed";
}

// Temporary mock rides
const mockRides: Ride[] = [
  { id: "R-1001", pickup: "Downtown", dropoff: "Airport", time: "08:30", fare: 24.5, status: "completed" },
  { id: "R-1002", pickup: "Mall", dropoff: "Stadium", time: "09:15", fare: 13.2, status: "completed" },
  { id: "R-1003", pickup: "University", dropoff: "Library", time: "10:05", fare: 7.8, status: "pending" }
];

const DriverDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [online, setOnline] = useState(false);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const t = setTimeout(() => {
      setRides(mockRides);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const earningsToday = rides.filter(r => r.status === "completed").reduce((sum, r) => sum + r.fare, 0);
  const nextRide = rides.find(r => r.status === "pending");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center bg-white shadow-md rounded-xl p-4 mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Driver Dashboard 🚘</h1>
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700">
            Hi, {user?.name || "Driver"} <br />
            <span className="text-xs text-green-600 font-semibold">Driver</span>
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition shadow-sm"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Status" value={online ? "Online" : "Offline"} color={online ? "text-green-600" : "text-gray-600"} icon={<Car />} />
        <StatCard label="Completed Rides" value={rides.filter(r => r.status === "completed").length} icon={<CheckCircle />} />
        <StatCard label="Earnings (Today)" value={`$${earningsToday.toFixed(2)}`} icon={<DollarSign />} />
        <StatCard label="Pending Rides" value={rides.filter(r => r.status === "pending").length} icon={<Clock />} />
      </section>

      {/* Next Ride */}
      <section className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Next Ride</h2>
        {loading && <div>Loading...</div>}
        {!loading && !nextRide && <div className="text-gray-500">No pending rides.</div>}
        {!loading && nextRide && (
          <div className="space-y-2">
            <p><strong>ID:</strong> {nextRide.id}</p>
            <p><strong>Pickup:</strong> {nextRide.pickup}</p>
            <p><strong>Dropoff:</strong> {nextRide.dropoff}</p>
            <p><strong>Time:</strong> {nextRide.time}</p>
            <p><strong>Fare:</strong> ${nextRide.fare.toFixed(2)}</p>
            <button
              onClick={() =>
                setRides(rs =>
                  rs.map(r => r.id === nextRide.id ? { ...r, status: "ongoing" } : r)
                )
              }
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
            >
              Accept Ride
            </button>
          </div>
        )}
      </section>

      {/* Recent Rides */}
      <section className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Rides</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Pickup</th>
                <th className="p-3">Dropoff</th>
                <th className="p-3">Time</th>
                <th className="p-3">Fare</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rides.map(r => (
                <tr key={r.id} className="border-b">
                  <td className="p-3">{r.id}</td>
                  <td className="p-3">{r.pickup}</td>
                  <td className="p-3">{r.dropoff}</td>
                  <td className="p-3">{r.time}</td>
                  <td className="p-3">${r.fare.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!rides.length && !loading && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">
                    No rides yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ label, value, icon, color = "text-gray-800" }: { label: string; value: string | number; icon: React.ReactNode; color?: string }) => (
  <div className="bg-white p-5 rounded-xl shadow-md flex items-center gap-4">
    <div className="text-blue-600">{icon}</div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-xl font-semibold ${color}`}>{value}</div>
    </div>
  </div>
);

function statusBadge(status: Ride["status"]): string {
  switch (status) {
    case "pending":
      return "bg-orange-100 text-orange-700";
    case "ongoing":
      return "bg-blue-100 text-blue-700";
    case "completed":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default DriverDashboard;
