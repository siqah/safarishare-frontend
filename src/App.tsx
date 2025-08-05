import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import Layout from './components/Layout/Layout';
import { ProtectedRoute, PublicOnlyRoute } from './components/Auth/AuthGuard';
import { useAuthStore } from './stores/authStore';
import Home from './pages/Home';
import RideSearch from './components/Rides/RideSearch';
import OfferRide from './components/Rides/OfferRide';
import MyRides from './pages/MyRides';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import BookingRequests from './components/Bookings/BookingRequests';
import MyBookings from './components/Bookings/MyBookings';

// Import Clerk auth pages
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';

function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const { syncWithClerk } = useAuthStore();

  // Sync with Clerk when authentication state changes
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && clerkUser) {
        console.log('🔄 App: Syncing with Clerk user');
        syncWithClerk(clerkUser);
      } else if (!isSignedIn) {
        console.log('🔄 App: Clearing user data (signed out)');
        syncWithClerk(null);
      }
    }
  }, [isLoaded, isSignedIn, clerkUser, syncWithClerk]);

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
          
          {/* Protected routes */}
          <Route 
            path="offer" 
            element={
              <ProtectedRoute>
                <OfferRide />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="my-rides" 
            element={
              <ProtectedRoute>
                <MyRides />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <Profile />
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
            path="booking-requests" 
            element={
              <ProtectedRoute>
                <BookingRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="my-bookings" 
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        {/* Dashboard route - redirect to my-rides for authenticated users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute fallback="/sign-in">
              <Navigate to="/my-rides" replace />
            </ProtectedRoute>
          }
        />
        
        {/* Legacy home route redirect */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Navigate to="/my-rides" replace />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all - redirect based on auth status */}
        <Route
          path="*"
          element={
            <>
              <SignedIn>
                <Navigate to="/my-rides" replace />
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