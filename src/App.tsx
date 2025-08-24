import React, { useEffect } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import RideSearch from './components/Rides/RideSearch';
import OfferRide from './components/Rides/OfferRide';
import MyRides from './pages/MyRides';
import Messages from './pages/Messages';
import BookingRequests from './components/Bookings/BookingRequests';
import MyBookings from './components/Bookings/MyBookings';
import Settings from './pages/Settings';
import { useAuthStore } from './stores/authStore';
import { setAuthTokenGetter } from './lib/api';
import AdminApp from './admin';
import AuthGuard from './components/Auth/AuthGuard';
import SelectRole from './pages/auth/SelectRole';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';

// Get the publishable key from environment variables
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error('Missing Clerk publishable key');
}

function AppRoutes() {
  const { user, syncWithClerk } = useAuthStore();
  const { getToken } = useAuth();

  useEffect(() => {
    // Set up API token getter
    if (getToken) {
      setAuthTokenGetter(() => getToken());
    }
    
    // Sync with backend
    syncWithClerk();
  }, [syncWithClerk, getToken]);

  const RequireUser = ({ children }: { children: JSX.Element }) => {
    return <AuthGuard>{children}</AuthGuard>;
  };

  const DriverOnly = ({ children }: { children: JSX.Element }) => {
    return (
      <AuthGuard requiredRole="driver">
        {children}
      </AuthGuard>
    );
  };

  const RiderOnly = ({ children }: { children: JSX.Element }) => {
    return (
      <AuthGuard requiredRole="rider">
        {children}
      </AuthGuard>
    );
  };

  const AdminOnly = ({ children }: { children: JSX.Element }) => {
    return (
      <AuthGuard requiredRole="admin">
        {children}
      </AuthGuard>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/select-role" element={<RequireUser><SelectRole /></RequireUser>} />

        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminOnly><AdminApp /></AdminOnly>} />

        <Route path="/" element={<Layout />}> 
          <Route index element={<Home />} />
          <Route path="search" element={<RideSearch />} />

          <Route path="rider/dashboard" element={<RiderOnly><div><Home /></div></RiderOnly>} />
          <Route path="rider/profile" element={<RiderOnly><div><Settings /></div></RiderOnly>} />

          <Route path="driver/dashboard" element={<DriverOnly><div><Home /></div></DriverOnly>} />
          <Route path="driver/profile" element={<DriverOnly><div><Settings /></div></DriverOnly>} />
          <Route path="offer" element={<DriverOnly><OfferRide /></DriverOnly>} />
          <Route path="my-rides" element={<DriverOnly><MyRides /></DriverOnly>} />

          <Route path="profile" element={<RequireUser><Navigate to={user?.isDriver ? "/driver/profile" : "/rider/profile"} replace /></RequireUser>} />
          <Route path="messages" element={<RequireUser><Messages /></RequireUser>} />
          <Route path="settings" element={<RequireUser><Settings /></RequireUser>} />
          <Route path="booking-requests" element={<DriverOnly><BookingRequests /></DriverOnly>} />
          <Route path="my-bookings" element={<RiderOnly><MyBookings /></RiderOnly>} />
        </Route>

        <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
        <Route path="/rider" element={<Navigate to="/rider/dashboard" replace />} />

        <Route path="/dashboard" element={
          <RequireUser>
            {user?.isDriver ? (
              <Navigate to="/driver/dashboard" replace />
            ) : (
              <Navigate to="/rider/dashboard" replace />
            )}
          </RequireUser>
        } />

        <Route path="/home" element={<RequireUser><Navigate to="/dashboard" replace /></RequireUser>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AppRoutes />
    </ClerkProvider>
  );
}

export default App;