import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const DriverDashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <p className="text-gray-600">Welcome {user?.firstName}! Manage your rides.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/offer" className="p-6 border rounded-lg hover:shadow">
          <h2 className="font-semibold mb-2">Offer a Ride</h2>
          <p className="text-gray-600 text-sm">Create a new ride offer for riders to join.</p>
        </Link>
        <Link to="/my-rides" className="p-6 border rounded-lg hover:shadow">
          <h2 className="font-semibold mb-2">My Rides</h2>
          <p className="text-gray-600 text-sm">View and manage your offered rides.</p>
        </Link>
        <Link to="/booking-requests" className="p-6 border rounded-lg hover:shadow">
          <h2 className="font-semibold mb-2">Booking Requests</h2>
          <p className="text-gray-600 text-sm">Approve or reject booking requests.</p>
        </Link>
        <Link to="/driver/profile" className="p-6 border rounded-lg hover:shadow">
          <h2 className="font-semibold mb-2">Driver Profile</h2>
          <p className="text-gray-600 text-sm">Update your driver details and preferences.</p>
        </Link>
      </div>
    </div>
  );
};

export default DriverDashboard;
