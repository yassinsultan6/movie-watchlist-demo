import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * PrivateRoute — protects routes by authentication and optional role check.
 * Props:
 *   requiredRole: 'admin' | 'user' | undefined
 *     - undefined: any authenticated user can access
 *     - 'admin':   only admins can access
 *     - 'user':    both users and admins can access (admin inherits user perms)
 */
const PrivateRoute = ({ requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const role = user?.role || 'user';
    // Admin inherits all roles
    const hasAccess = role === 'admin' || role === requiredRole;
    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;

