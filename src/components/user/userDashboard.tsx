import { Link } from "react-router-dom";
import useAuth from "../../stores/authStore";
import { LogOut, Car, Users, PlusCircle, Search } from "lucide-react";

const UserDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center bg-white shadow-md rounded-xl p-4 mb-6">
        <h1 className="text-2xl font-bold text-blue-600">SafariShare 🚗</h1>

        <div className="flex items-center gap-4">
          {/* Greeting */}
          <span className="font-medium text-gray-700 flex flex-col text-right">
            Hi, <span className="text-blue-600">{user?.name || "User"}</span>
            <span className="text-xs text-gray-500">
              {user?.role === "driver" ? "Driver" : "Passenger"}
            </span>
          </span>

          {/* Upgrade to Driver (only if passenger) */}
          {user?.role !== "driver" && (
            <Link
              to="/upgrade"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition shadow-sm"
            >
              Upgrade to Driver
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition shadow-sm"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-xl shadow-md text-center">
            <Users size={48} className="mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Welcome to SafariShare!
            </h2>
            <p className="text-gray-600">
              {user?.role === "driver"
                ? "Post your rides and connect with passengers."
                : "Explore rides, share your journey, and connect with drivers."}
            </p>
          </div>

          {/* Explore Rides */}
          <Link
            to="/rides"
            className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition"
          >
            <Search size={40} className="mx-auto mb-3 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Explore Rides</h3>
            <p className="text-gray-500 text-sm">
              Find rides that match your route and schedule.
            </p>
          </Link>

          {/* Post Ride (only for drivers) */}
          {user?.role === "driver" && (
            <Link
              to="/rides/create"
              className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition"
            >
              <PlusCircle size={40} className="mx-auto mb-3 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Post a Ride</h3>
              <p className="text-gray-500 text-sm">
                Share your journey and earn by offering seats.
              </p>
            </Link>
          )}

          {/* Manage Bookings */}
          <Link
            to="/bookings"
            className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition"
          >
            <Car size={40} className="mx-auto mb-3 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">My Bookings</h3>
            <p className="text-gray-500 text-sm">
              Track your confirmed rides and manage bookings.
            </p>
          </Link>
        </div>
      </main>
    </>
  );
};

export default UserDashboard;
