import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import Layout from './components/Layout/Layout';
import { ProtectedRoute, PublicOnlyRoute, DriverRoute, RiderRoute } from './components/Auth/AuthGuard';
import { useAuthStore } from './stores/authStore';
import Home from './pages/Home';
import RideSearch from './components/Rides/RideSearch';
import OfferRide from './components/Rides/OfferRide';
import MyRides from './pages/MyRides';
import Messages from './pages/Messages';
import BookingRequests from './components/Bookings/BookingRequests';
import MyBookings from './components/Bookings/MyBookings';
import Settings from './pages/Settings';

// Import Clerk auth pages
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import RiderDashboard from './pages/rider/Dashboard';
import DriverDashboard from './pages/driver/Dashboard';
import DriverProfile from './pages/driver/Profile';
import RiderProfile from './pages/rider/Profile';

function App() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { syncWithClerk, user } = useAuthStore();

  // Sync with Clerk when authentication state changes
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && clerkUser) {
        console.log('🔄 App: Syncing with Clerk user');
        syncWithClerk(clerkUser, () => getToken());
      } else if (!isSignedIn) {
        console.log('🔄 App: Clearing user data (signed out)');
        syncWithClerk(null);
      }
    }
  }, [isLoaded, isSignedIn, clerkUser, syncWithClerk, getToken]);

  // Show loading screen while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SafariShare...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public-only routes (redirect if signed in) */}
        <Route 
          path="/sign-in/*" 
          element={
            <PublicOnlyRoute>
              <SignInPage />
            </PublicOnlyRoute>
          } 
        />
        <Route 
          path="/sign-up/*" 
          element={
            <PublicOnlyRoute>
              <SignUpPage />
            </PublicOnlyRoute>
          } 
        />

        {/* Legacy redirects for old bookmarks */}
        <Route path="/login" element={<Navigate to="/sign-in" replace />} />
        <Route path="/register" element={<Navigate to="/sign-up" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/sign-in" replace />} />
        <Route path="/reset-password" element={<Navigate to="/sign-in" replace />} />
        
        {/* App routes with layout */}
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<Home />} />
          <Route path="search" element={<RideSearch />} />
          
          {/* Rider routes */}
          <Route 
            path="rider/dashboard" 
            element={
              <RiderRoute>
                <RiderDashboard />
              </RiderRoute>
            } 
          />
          <Route 
            path="rider/profile" 
            element={
              <RiderRoute>
                <RiderProfile />
              </RiderRoute>
            } 
          />

          {/* Driver routes */}
          <Route 
            path="driver/dashboard" 
            element={
              <DriverRoute>
                <DriverDashboard />
              </DriverRoute>
            } 
          />
          <Route 
            path="driver/profile" 
            element={
              <DriverRoute>
                <DriverProfile />
              </DriverRoute>
            } 
          />
          <Route 
            path="offer" 
            element={
              <DriverRoute>
                <OfferRide />
              </DriverRoute>
            } 
          />
          <Route 
            path="my-rides" 
            element={
              <DriverRoute>
                <MyRides />
              </DriverRoute>
            } 
          />

          {/* Shared protected routes */}
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <Navigate to={user?.isDriver ? "/driver/profile" : "/rider/profile"} replace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="messages" 
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="booking-requests" 
            element={
              <DriverRoute>
                <BookingRequests />
              </DriverRoute>
            } 
          />
          <Route 
            path="my-bookings" 
            element={
              <RiderRoute>
                <MyBookings />
              </RiderRoute>
            } 
          />
        </Route>
        
        {/* Redirect bare role paths to dashboards to avoid 404s */}
        <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
        <Route path="/rider" element={<Navigate to="/rider/dashboard" replace />} />
        
        {/* Dashboard route - redirect based on role (no role selection) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute fallback="/sign-in">
              {user?.isDriver ? (
                <Navigate to="/driver/dashboard" replace />
              ) : (
                <Navigate to="/rider/dashboard" replace />
              )}
            </ProtectedRoute>
          }
        />
        
        {/* Legacy home route redirect */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all - redirect based on auth status */}
        <Route
          path="*"
          element={
            <>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
              <SignedOut>
                <Navigate to="/" replace />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;