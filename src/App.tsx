import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
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

const AppRoutes = () => {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth(); // ✅ restore session on refresh
  }, [checkAuth])
  return (
    <Router>
      <Routes>
        {" "}
        <Route path="login" element={<Login />}></Route>
        <Route path="register" element={<Register />}></Route>
        <Route path="upgrade" element={<UpgradeToDriver />}></Route>
        <Route path="driver-dashboard" element={<DriverDashboard />}></Route>
        <Route path="create-ride" element={<CreateRideForm />}></Route>
        <Route path="rides" element={<AvailableRides />}></Route>
        <Route path="bookings" element={<Bookings />}></Route>
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        ></Route>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
};

function App() {
  return <AppRoutes />;
}

export default App;
