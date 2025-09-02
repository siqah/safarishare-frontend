// src/pages/Dashboard.tsx
import useAuth from "../stores/authStore";
import DriverDashboard from "../components/driver/DriverDashboard";
import UserDashboard from "../components/user/userDashboard";

const Dashboard = () => {
  const { user} = useAuth();

  return (
      <div>
        {user?.role === "driver" ? (
          <DriverDashboard />
        ) : (
          <>
            {/* Top Navbar */}
            <UserDashboard />
          
          </>
        )}
      </div>
  );
};

export default Dashboard;
