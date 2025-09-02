// src/pages/Dashboard.tsx
import useAuth from "../stores/authStore";
import { LogOut, Car, Users } from "lucide-react";
import DriverDashboard from "../components/driver/DriverDashboard";
import { UpgradeToDriver } from "../components/driver/upgradeToDriver";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Top Navbar */}
      <header className="flex justify-between items-center bg-white shadow-md rounded-xl p-4 mb-6">
        <h1 className="text-2xl font-bold text-blue-600">SafariShare 🚗</h1>
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700">
            Hi, {user?.name || "User"}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {user?.role === "user" ? <UpgradeToDriver /> : <DriverDashboard />}

        {/* Card 1 */}
        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Car className="text-blue-600" size={28} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Create a Ride</h2>
              <p className="text-gray-500 text-sm">
                Offer a ride and share your carpool with others.
              </p>
            </div>
          </div>
          <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
            + New Ride
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="text-green-600" size={28} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Join a Ride</h2>
              <p className="text-gray-500 text-sm">
                Find available rides and book your seat.
              </p>
            </div>
          </div>
          <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition">
            Browse Rides
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="text-purple-600" size={28} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">My Rides</h2>
              <p className="text-gray-500 text-sm">
                View rides you created or joined.
              </p>
            </div>
          </div>
          <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition">
            View Rides
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
