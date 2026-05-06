import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Require login
export const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-slate-400">Memuat...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Require specific role(s)
export const RoleRoute = ({ roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-slate-400">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};
