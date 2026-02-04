import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is defined, check if user has permission
  if (allowedRoles && user) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect to home if unauthorized
      // Could also redirect to a dedicated Unauthorized page
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
