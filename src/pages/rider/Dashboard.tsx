import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import BecomeDriverButton from '../../components/Driver/BecomeDriverButton';

const RiderDashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Rider Dashboard</h1>
        <p className="text-gray-600">Welcome {user?.firstName}! Find and manage your rides.</p>
      </div>

      {/* Become a Driver CTA and application flow (shows status if already applied) */}
      <div className="mb-6">
        <BecomeDriverButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/search" className="p-6 border rounded-lg hover:shadow">
          <h2 className="font-semibold mb-2">Search Rides</h2>
          <p className="text-gray-600 text-sm">Look for available rides to join.</p>
        </Link>
        <Link to="/my-bookings" className="p-6 border rounded-lg hover:shadow">
          <h2 className="font-semibold mb-2">My Bookings</h2>
          <p className="text-gray-600 text-sm">Manage your ride bookings and requests.</p>
        </Link>
        <Link to="/rider/profile" className="p-6 border rounded-lg hover:shadow">
          <h2 className="font-semibold mb-2">Rider Profile</h2>
          <p className="text-gray-600 text-sm">Update your profile and preferences.</p>
        </Link>
        <Link to="/messages" className="p-6 border rounded-lg hover:shadow">
          <h2 className="font-semibold mb-2">Messages</h2>
          <p className="text-gray-600 text-sm">Chat with drivers and riders.</p>
        </Link>
      </div>
    </div>
  );
};

export default RiderDashboard;
