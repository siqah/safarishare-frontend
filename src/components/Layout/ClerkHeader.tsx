import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, MessageSquare, Bell, Menu, X } from 'lucide-react';
import { 
  SignedIn, 
  SignedOut, 
  UserButton
} from '@clerk/clerk-react';

const Header: React.FC = () => {
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

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
            
            <SignedIn>
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
            </SignedIn>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <SignedIn>
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

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
                <Bell className="w-5 h-5" />
                {/* TODO: Add notification count badge */}
              </button>

              {/* User Button from Clerk */}
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center space-x-4">
                <Link
                  to="/sign-in"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Sign in
                </Link>
                <Link
                  to="/sign-up"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <SignedIn>
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
          </SignedIn>
        )}
      </div>
    </header>
  );
};

export default Header;
