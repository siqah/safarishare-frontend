import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, MessageSquare, Bell, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { socketService } from '../../lib/socket';

const Header: React.FC = () => {
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      socketService.connect(user._id);
     
    } else {
      socketService.disconnect();
    }
  }, [user, user?._id]);

  useEffect(() => {
    setShowNotifications(false);
    setShowMobileMenu(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const dashboardPath = user?.isDriver ? '/driver/dashboard' : '/rider/dashboard';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={user ? dashboardPath : '/'} className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SafariShare</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link to="/search" className={`${isActive('/search') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} px-3 py-2 text-sm font-medium rounded-md transition-colors`}>
              Search Rides
            </Link>
            {user && (
              <>
                {user.isDriver ? (
                  <>
                    <Link to="/offer" className={`${isActive('/offer') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} px-3 py-2 text-sm font-medium rounded-md transition-colors`}>
                      Offer a Ride
                    </Link>
                    <Link to="/my-rides" className={`${isActive('/my-rides') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} px-3 py-2 text-sm font-medium rounded-md transition-colors`}>
                      My Rides
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/my-bookings" className={`${isActive('/my-bookings') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} px-3 py-2 text-sm font-medium rounded-md transition-colors`}>
                      My Bookings
                    </Link>
                  </>
                )}
                <Link to="/settings" className={`${isActive('/settings') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} px-3 py-2 text-sm font-medium rounded-md transition-colors`}>
                  Settings
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/messages" className={`${isActive('/messages') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'} p-2 transition-colors`}>
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <div className="relative">
                  <button className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors" onClick={() => setShowNotifications((s) => !s)} aria-haspopup="menu" aria-expanded={showNotifications}>
                    <Bell className="w-5 h-5" />
                  
                  </button>
                </div>
                <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-gray-500 hover:text-blue-600 transition-colors">
                  {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Home
                </Link>
              </div>
            )}
          </div>
        </div>

        {showMobileMenu && user && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link to="/search" onClick={() => setShowMobileMenu(false)} className={`${isActive('/search') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} block px-3 py-2 text-sm font-medium rounded-md`}>
                Search Rides
              </Link>
              {user.isDriver ? (
                <>
                  <Link to="/offer" onClick={() => setShowMobileMenu(false)} className={`${isActive('/offer') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} block px-3 py-2 text-sm font-medium rounded-md`}>
                    Offer a Ride
                  </Link>
                  <Link to="/my-rides" onClick={() => setShowMobileMenu(false)} className={`${isActive('/my-rides') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} block px-3 py-2 text-sm font-medium rounded-md`}>
                    My Rides
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/my-bookings" onClick={() => setShowMobileMenu(false)} className={`${isActive('/my-bookings') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} block px-3 py-2 text-sm font-medium rounded-md`}>
                    My Bookings
                  </Link>
                </>
              )}
              <Link to="/messages" onClick={() => setShowMobileMenu(false)} className={`${isActive('/messages') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} block px-3 py-2 text-sm font-medium rounded-md`}>
                Messages
              </Link>
              <Link to={user.isDriver ? '/driver/profile' : '/rider/profile'} onClick={() => setShowMobileMenu(false)} className={`${isActive('/profile') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} block px-3 py-2 text-sm font-medium rounded-md`}>
                Profile
              </Link>
              <Link to="/settings" onClick={() => setShowMobileMenu(false)} className={`${isActive('/settings') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} block px-3 py-2 text-sm font-medium rounded-md`}>
                Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
