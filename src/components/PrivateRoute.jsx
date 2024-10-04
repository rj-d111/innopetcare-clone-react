import React from "react";
import { Outlet, Navigate } from "react-router";
import useAuthStatus from "./hooks/useAuthStatus";
import Spinner from "./Spinner";
import { useLocation } from "react-router-dom";

export default function PrivateRoute({ allowedRoles }) {
  const { loggedIn, checkingStatus, userRole } = useAuthStatus();
  const location = useLocation();
  
  if (checkingStatus) {
    return <Spinner />;
  }

  // // Check if the user is logged in and if they have an allowed role for the requested route
  // if (!loggedIn || (allowedRoles && !allowedRoles.includes(userRole))) {
  //   // Redirect to the appropriate login page based on the location
  //   if (location.pathname.includes("admin")) {
  //     return <Navigate to="/admin" />;
  //   }
  //   if (location.pathname.includes("sites")) {
  //     const siteSlug = location.pathname.split("/")[2]; // Get the site slug
  //     return <Navigate to={`/sites/${siteSlug}/login`} />;
  //   }
  //   return <Navigate to="/login" />;
  // }

  return <Outlet />;
}
