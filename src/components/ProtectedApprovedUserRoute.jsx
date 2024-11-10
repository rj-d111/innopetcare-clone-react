import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStatus from "../components/hooks/useAuthStatusUsers";
import Spinner from "../components/Spinner";

function ProtectedApprovedUserRoute({ children }) {
  const { isAuthenticated, isApproved, checkingStatus } = useAuthStatus();
  const location = useLocation();

  if (checkingStatus) {
    return <Spinner />; // Show loading indicator while checking status
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isApproved) {
    return <Navigate to="/approval" replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedApprovedUserRoute;
