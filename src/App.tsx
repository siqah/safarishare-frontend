import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import RideSearch from './components/Rides/RideSearch';
import OfferRide from './components/Rides/OfferRide';
import MyRides from './pages/MyRides';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import BookingRequests from './components/Bookings/BookingRequests';
import MyBookings from './components/Bookings/MyBookings';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<RideSearch />} />
          <Route 
            path="offer" 
            element={isAuthenticated ? <OfferRide /> : <Navigate to="/login" />} 
          />
          <Route 
            path="my-rides" 
            element={isAuthenticated ? <MyRides /> : <Navigate to="/login" />} 
          />
          <Route 
            path="profile" 
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="messages" 
            element={isAuthenticated ? <Messages /> : <Navigate to="/login" />} 
          />
          <Route path="/booking-requests" element={<BookingRequests />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;