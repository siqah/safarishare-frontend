import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Menu, X } from 'lucide-react';
import useAuth from '../../stores/authStore';
import { connectSocket, disconnectSocket } from '../../lib/socket';
import NotificationBell from '../Notification/NotificationBell';

const Header: React.FC = () => {
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      connectSocket(user as any);
    } else {
      disconnectSocket();
    }
  }, [user]);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const dashboardPath = user?.role === 'driver' ? '/driver-dashboard' : '/dashboard';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={user ? dashboardPath : '/'} className="flex items-center space-x-2 cursor-pointer">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SafariShare</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Link to="/register" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md">Register</Link>
                <Link to="/login" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md">Login</Link>
              </>
            ) : (
              <>
                <Link to={dashboardPath} className={`text-sm font-medium px-3 py-2 rounded-md ${isActive(dashboardPath) ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}>Dashboard</Link>
                <Link to="/rides" className={`text-sm font-medium px-3 py-2 rounded-md ${isActive('/rides') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}>Search Rides</Link>
                <NotificationBell />
              </>
            )}
          </nav>

          {/* Mobile menu toggle (always visible on mobile) */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            onClick={() => setShowMobileMenu(s => !s)}
            aria-label="Toggle menu"
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {(
              <div className="space-y-2">
                <Link to="/register" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500">Register</Link>
                <Link to="/login" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500">Login</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
