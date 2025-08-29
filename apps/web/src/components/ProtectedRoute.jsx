import { useAuth } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const userRole = user.role?.toLowerCase();
  const hasAccess = allowedRoles.length === 0 || allowedRoles.some(role => role.toLowerCase() === userRole);
  
  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
