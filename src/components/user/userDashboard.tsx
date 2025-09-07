import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../stores/authStore";
import { LogOut, Car, Search, Menu, X } from "lucide-react";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const fullName = user?.name || "User"; // ✅ ensure full name is used

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <h1 className="text-xl sm:text-2xl font-bold text-blue-600">
            SafariShare 🚗
          </h1>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden p-2 rounded-lg border text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Hi,</p>
              <p className="font-medium text-blue-600 text-sm sm:text-base">
                {fullName}{" "}
                <span className="text-gray-500 font-normal">
                  {user?.email}
                </span>
              </p>
            </div>

            {user?.role !== "driver" && (
              <Link
                to="/upgrade"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
              >
                Upgrade
              </Link>
            )}

            <button
              onClick={() => logout()}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t bg-white px-4 pb-4 animate-fade-in">
            <div className="flex items-center justify-between pt-3">
              <div className="font-medium text-gray-700">
                <br />
                <span className="text-xs text-gray-500">{user?.email}</span>
              </div>
              <button
                onClick={() => logout()}
                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
            {user?.role !== "driver" && (
              <Link
                to="/upgrade"
                onClick={closeMenu}
                className="block mt-3 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium"
              >
                Upgrade to Driver
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid gap-5 sm:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-3">
          <Link
            to="/rides"
            className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center text-center"
            onClick={closeMenu}
          >
            <Search size={40} className="mb-3 text-blue-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Explore Rides
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Find rides that match your route.
            </p>
          </Link>

          <Link
            to="/bookings"
            className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center text-center"
            onClick={closeMenu}
          >
            <Car size={40} className="mb-3 text-purple-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              My Bookings
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Track and manage your rides.
            </p>
          </Link>

          {/* Placeholder card */}
          <div className="hidden md:flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-sm">
            More coming soon
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
