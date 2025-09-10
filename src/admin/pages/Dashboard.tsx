import React, { useEffect, useState } from 'react';
import { Users, Car, Calendar, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../lib/api';

interface Stats {
  totalUsers: number;
  totalRiders: number;
  totalDrivers: number;
  totalRides: number;
  totalBookings: number;
  totalMessages: number;
  activeRides: number;
  pendingBookings: number;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  change?: number;
  changeType?: 'increase' | 'decrease';
}> = ({ title, value, icon: Icon, change, changeType }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        {change !== undefined && (
          <div className={`flex items-center mt-2 text-sm ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {change}%
          </div>
        )}
      </div>
      <Icon className="w-8 h-8 text-blue-500" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
      setRecentUsers(response.data.recentUsers);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to SafariShare Admin Dashboard</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            change={12}
            changeType="increase"
          />
          <StatCard
            title="Active Rides"
            value={stats.activeRides}
            icon={Car}
            change={8}
            changeType="increase"
          />
          <StatCard
            title="Pending Bookings"
            value={stats.pendingBookings}
            icon={Calendar}
            change={5}
            changeType="decrease"
          />
          <StatCard
            title="Total Messages"
            value={stats.totalMessages}
            icon={MessageSquare}
            change={23}
            changeType="increase"
          />
        </div>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Riders</span>
                <span className="font-semibold">{stats.totalRiders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Drivers</span>
                <span className="font-semibold">{stats.totalDrivers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Rides</span>
                <span className="font-semibold">{stats.totalRides}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Bookings</span>
                <span className="font-semibold">{stats.totalBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Rides</span>
                <span className="font-semibold">{stats.activeRides}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Bookings</span>
                <span className="font-semibold">{stats.pendingBookings}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
