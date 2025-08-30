import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import AdminApp from './admin';

interface AppUser {
  isDriver?: boolean;
  role?: 'admin' | 'driver' | 'rider';
}
const user: AppUser | null = { isDriver: false, role: 'rider' };



const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          <Route path="rider/dashboard" element={<Home />} />
            <Route path="rider/profile" element={<Settings />} />

          <Route path="driver/dashboard" element={<Home />} />
          <Route path="driver/profile" element={<Settings />} />

          <Route
            path="profile"
            element={
              <Navigate to={user?.isDriver ? '/driver/profile' : '/rider/profile'} replace />
            }
          />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
        <Route path="/rider" element={<Navigate to="/rider/dashboard" replace />} />

        <Route
          path="/dashboard"
            element={
            user?.isDriver ? (
              <Navigate to="/driver/dashboard" replace />
            ) : (
              <Navigate to="/rider/dashboard" replace />
            )
          }
        />

        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return <AppRoutes />;
}

export default App;
