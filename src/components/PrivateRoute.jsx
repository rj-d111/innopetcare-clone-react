import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import useAuthStatus from "./hooks/useAuthStatus";
import Spinner from "./Spinner";

export default function PrivateRoute({ allowedRoles }) {
  const { loggedIn, checkingStatus, userRole } = useAuthStatus();
  const location = useLocation();

 
  if (checkingStatus) {
    return <Spinner />;
  }

  // Check if user is logged in and has an allowed role
  if (loggedIn && allowedRoles.includes(userRole)) {
    return <Outlet />;
  }

  // Redirect based on the requested path
  if (location.pathname.startsWith("/admin")) {
    return <Navigate to="/admin/login" />;
  }
  return <Navigate to="/login" />;
}
