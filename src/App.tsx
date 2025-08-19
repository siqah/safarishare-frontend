import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
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

function App() {
  const { user } = useAuthStore();

  useEffect(() => {
    // no-op placeholder for any init
  }, []);

  const RequireUser = ({ children }: { children: JSX.Element }) => {
    if (!user) return <Navigate to="/" replace />;
    return children;
  };

  const DriverOnly = ({ children }: { children: JSX.Element }) => {
    if (!user) return <Navigate to="/" replace />;
    if (!user.isDriver) return <Navigate to="/rider/dashboard" replace />;
    return children;
  };

  const RiderOnly = ({ children }: { children: JSX.Element }) => {
    if (!user) return <Navigate to="/" replace />;
    if (user.isDriver) return <Navigate to="/driver/dashboard" replace />;
    return children;
  };

  return (
    <Router>
      <Routes>
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

export default App;