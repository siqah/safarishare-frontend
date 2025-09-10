import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./pages/Dashboard";
import DriverDashboard from "./components/driver/DriverDashboard";
import UpgradeToDriver  from "./components/driver/upgradeToDriver";
import ProtectedRoute from "./components/guard/ProtectedRoute";
import CreateRideForm from "./components/driver/CreateRideForm";
import AvailableRides from "./components/ride/AvailableRides";
import Bookings from "./components/ride/Bookings";
import { useAuth } from "./stores/authStore";
import { connectSocket, disconnectSocket } from "./lib/socket";

const AppRoutes = () => {
  const { checkAuth, user } = useAuth();


  useEffect(() => {
    checkAuth(); // ✅ restore session on refresh
  }, [checkAuth])
  // Ensure socket connects even if Header is not mounted yet
  useEffect(() => {
    if (user) connectSocket(user as unknown as { id?: string; _id?: string; role?: string });
    else disconnectSocket();
  }, [user]);
  return (
    <Router>
      <Routes>
        <Route path="login" element={<Login />}></Route>
        <Route path="register" element={<Register />}></Route>

        {/* Wrap main app under Layout so Header (NotificationBell) is present */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="upgrade" element={<UpgradeToDriver />} />
          <Route path="driver-dashboard" element={<DriverDashboard />} />
          <Route path="create-ride" element={<CreateRideForm />} />
          <Route path="rides" element={<AvailableRides />} />
          <Route path="bookings" element={<Bookings />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
};

function App() {
  return <AppRoutes />;
}

export default App;
