import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Guards a route based on user roles.
 * If the user does not have the required role, redirects to /home.
 */
const RoleGuard = ({ requiredRole, children }) => {
  const roles = useSelector((state) => state.auth.roles);

  if (!roles || !roles.includes(requiredRole)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default RoleGuard;
