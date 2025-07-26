import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Car, User, MessageSquare, LogOut, Bell, CreditCard, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      setShowUserMenu(false);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    // Always navigate to home after logout attempt
    navigate('/');
  };

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'booking',
      message: 'New booking request for your ride to Boston',
      time: '5 minutes ago',
      unread: true,
    },
    {
      id: 2,
      type: 'message',
      message: 'John sent you a message about tomorrow\'s ride',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      type: 'payment',
      message: 'Payment received for ride to New York',
      time: '2 hours ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SafariShare</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/search"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/search')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Search Rides
            </Link>
            <Link
              to="/offer"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/offer')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Offer a Ride
            </Link>
            <Link
              to="/my-rides"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/my-rides')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              My Rides
            </Link>
          </nav>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                              notification.unread ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                            }`}
                          >
                            <p className={`text-sm ${notification.unread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-200">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Messages */}
              <Link
                to="/messages"
                className={`p-2 transition-colors ${
                  isActive('/messages')
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
              </Link>

              {/* Payment Settings */}
              <Link
                to="/payment-settings"
                className={`p-2 transition-colors ${
                  isActive('/payment-settings')
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <CreditCard className="w-5 h-5" />
              </Link>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=3b82f6&color=fff`}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-700">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      ⭐ {user.rating.toFixed(1)} • {user.totalRides} rides
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 mr-3" />
                      View Profile
                    </Link>
                    <Link
                      to="/payment-settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <CreditCard className="w-4 h-4 mr-3" />
                      Payment Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      {isLoading ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && user && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link
                to="/search"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/search')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Search Rides
              </Link>
              <Link
                to="/offer"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/offer')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Offer a Ride
              </Link>
              <Link
                to="/my-rides"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/my-rides')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                My Rides
              </Link>
              <Link
                to="/messages"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/messages')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Messages
              </Link>
              <Link
                to="/profile"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/profile')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Profile
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;