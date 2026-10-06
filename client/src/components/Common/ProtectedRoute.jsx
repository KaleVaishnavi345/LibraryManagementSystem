import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Reusable dynamic route guard.
 * Checks authentication token and authorization role on every navigation.
 */
function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(role);
    if (!hasRole) {
      // If an admin attempts student routes, or vice versa, redirect appropriately
      if (role === "admin") {
        return <Navigate to="/admin" replace />;
      }
      return <Navigate to="/welcome" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
