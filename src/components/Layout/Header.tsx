import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, } from 'lucide-react';
import  useAuth  from '../../stores/authStore';
import { socketService } from '../../lib/socket';

const Header: React.FC = () => {
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socketService.connect(user._id);
     
    } else {
      socketService.disconnect();
    }
  }, [user, user?._id]);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const dashboardPath = user?.isDriver ? '/driver/dashboard' : '/rider/dashboard';

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
          <nav className="hidden md:flex items-center space-x-4">
              <button className="text-xl font-bold text-gray-900 bg-blue-600 p-2 rounded-md cursor-pointer">
                <Link to={"/register"}>Register</Link>
              </button>
              <button className="text-xl font-bold text-gray-900 bg-blue-600 p-2 rounded-md cursor-pointer">
                <Link to={"/login"}>Login</Link>
              </button>
          </nav>
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
