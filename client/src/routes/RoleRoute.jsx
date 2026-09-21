import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function RoleRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

export default RoleRoute;
