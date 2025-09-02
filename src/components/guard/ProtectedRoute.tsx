import { Navigate } from "react-router-dom";
import useAuth from "../../stores/authStore";
import { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}
