import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Layout from './components/Layout/Layout';
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
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        
        {/* Legacy redirects for old bookmarks */}
        <Route path="/login" element={<Navigate to="/sign-in" replace />} />
        <Route path="/register" element={<Navigate to="/sign-up" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/sign-in" replace />} />
        <Route path="/reset-password" element={<Navigate to="/sign-in" replace />} />
        
        {/* App routes with layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<RideSearch />} />
          
          {/* Protected routes */}
          <Route 
            path="offer" 
            element={
              <SignedIn>
                <OfferRide />
              </SignedIn>
            } 
          />
          <Route 
            path="my-rides" 
            element={
              <SignedIn>
                <MyRides />
              </SignedIn>
            } 
          />
          <Route 
            path="profile" 
            element={
              <SignedIn>
                <Profile />
              </SignedIn>
            } 
          />
          <Route 
            path="messages" 
            element={
              <SignedIn>
                <Messages />
              </SignedIn>
            } 
          />
          <Route 
            path="booking-requests" 
            element={
              <SignedIn>
                <BookingRequests />
              </SignedIn>
            } 
          />
          <Route 
            path="my-bookings" 
            element={
              <SignedIn>
                <MyBookings />
              </SignedIn>
            } 
          />
        </Route>
        
        {/* Dashboard route - redirect to my-rides for authenticated users */}
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <Navigate to="/my-rides" replace />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        
        {/* Legacy home route redirect */}
        <Route
          path="/home"
          element={<Navigate to="/my-rides" replace />}
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