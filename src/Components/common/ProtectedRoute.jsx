import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, token } = useAuth();

  // If no token, redirect to appropriate login
  if (!token) {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    return <Navigate to={isAdminRoute ? "/admin/login" : "/login"} replace />;
  }

  // If we have a token but user data hasn't loaded yet, show loading or wait
  // For now, if we have a token but no user object, it's a broken session
  if (!user && token) {
    return <div className="flex items-center justify-center min-h-screen">Loading user session...</div>;
  }

  // If allowedRoles is defined, check if user has permission
  if (allowedRoles && user) {
    if (!allowedRoles.includes(user.role)) {
      console.warn(`Access denied for role: ${user.role}. Allowed: ${allowedRoles}`);
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
