import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Header from './ClerkHeader';
import Footer from './Footer';
import AuthStatus from '../Debug/AuthStatus';
import { useAuthStore } from '../../stores/authStore';

const Layout: React.FC = () => {
  const { user: clerkUser } = useUser();
  const { syncWithClerk } = useAuthStore();

  // Sync with Clerk when user data is available
  useEffect(() => {
    if (clerkUser) {
      console.log('📱 Layout: Triggering Clerk sync...');
      syncWithClerk(clerkUser);
    }
  }, [clerkUser, syncWithClerk]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AuthStatus />
    </div>
  );
};

export default Layout;