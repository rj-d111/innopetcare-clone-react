// PrivateClientsRoute.js
import React from "react";
import { Outlet, Navigate, useParams } from "react-router-dom";
import useClientApprovalStatus from "../components/hooks/useClientApprovalStatus";
import Spinner from "./Spinner";

const PrivateClientsRoute = ({ allowedRoles }) => {
  const { isApproved, userRole, loading, isAuthenticatedForSlug } = useClientApprovalStatus();
  const { slug } = useParams();

  if (loading) return <Spinner />;

  // Check if user is authenticated for this site
  if (!isAuthenticatedForSlug) {
    return <Navigate to={`/sites/${slug}/login`} />;
  }

  // Check role and approval status
  if (userRole === "clients") {
    return isApproved ? <Outlet /> : <Navigate to={`/sites/${slug}/approval`} />;
  }

  return <Navigate to={`/sites/${slug}/login`} />;
};

export default PrivateClientsRoute;
