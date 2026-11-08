import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ roles = [] }) {
  const { auth } = useAuth();

  if (!auth?.token) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(auth?.user?.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
