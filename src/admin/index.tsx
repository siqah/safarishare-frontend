import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/Layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';

const AdminApp: React.FC = () => {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="rides" element={<div className="text-center py-12"><h2 className="text-xl font-semibold text-gray-900">Rides Management</h2><p className="text-gray-600 mt-2">Coming Soon</p></div>} />
        <Route path="bookings" element={<div className="text-center py-12"><h2 className="text-xl font-semibold text-gray-900">Bookings Management</h2><p className="text-gray-600 mt-2">Coming Soon</p></div>} />
        <Route path="messages" element={<div className="text-center py-12"><h2 className="text-xl font-semibold text-gray-900">Messages Management</h2><p className="text-gray-600 mt-2">Coming Soon</p></div>} />
        <Route path="settings" element={<div className="text-center py-12"><h2 className="text-xl font-semibold text-gray-900">Settings</h2><p className="text-gray-600 mt-2">Coming Soon</p></div>} />
      </Route>
      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminApp;
