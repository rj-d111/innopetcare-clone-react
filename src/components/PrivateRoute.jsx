import React from "react";
import { Outlet, Navigate } from "react-router";
import useAuthStatus from "./hooks/useAuthStatus";
import Spinner from "./Spinner";
export default function PrivateRoute() {
  var { loggedIn, checkingStatus } = useAuthStatus();
  if (checkingStatus) {
    return <Spinner />;
  }
  return loggedIn ? <Outlet /> : <Navigate to="/login" />;
}
