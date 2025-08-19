import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { setApiUserId } from '../../lib/api';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuthStore();
  const [userIdInput, setUserIdInput] = useState('');

  const handleLoadUser = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userIdInput.trim()) return;
    setApiUserId(userIdInput.trim());
    await fetchUser();
    setUserIdInput('');
    navigate('/dashboard');
  };

  const handleLogout = () => {
    // Clear the API header and store user
    setApiUserId(null);
    useAuthStore.setState({ user: null });
    navigate('/');
  };

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">SafariShare</span>
          </Link>

          <nav className="ml-6 hidden md:flex items-center space-x-4">
            <Link to="/search" className="text-sm text-gray-700 hover:text-gray-900">Search</Link>
            {user?.isDriver && (
              <>
                <Link to="/offer" className="text-sm text-gray-700 hover:text-gray-900">Offer</Link>
                <Link to="/my-rides" className="text-sm text-gray-700 hover:text-gray-900">My Rides</Link>
                <Link to="/booking-requests" className="text-sm text-gray-700 hover:text-gray-900">Requests</Link>
              </>
            )}
            {!!user && !user.isDriver && (
              <Link to="/my-bookings" className="text-sm text-gray-700 hover:text-gray-900">My Bookings</Link>
            )}
            {user && (
              <Link to="/messages" className="text-sm text-gray-700 hover:text-gray-900">Messages</Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-gray-700">
                {user.firstName} {user.lastName} {user.isDriver ? '(Driver)' : '(Rider)'}
              </span>
              <Link to="/settings" className="text-sm text-gray-700 hover:text-gray-900">Settings</Link>
              <button onClick={handleLogout} className="text-sm text-gray-700 hover:text-gray-900">Logout</button>
            </>
          ) : (
            <form onSubmit={handleLoadUser} className="flex items-center space-x-2">
              <input
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder="Enter User ID"
                className="h-9 px-3 py-1 border rounded-md text-sm"
              />
              <button type="submit" className="h-9 px-3 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700">
                Load User
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
