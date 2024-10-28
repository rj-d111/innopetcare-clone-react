import { Navigate, Outlet } from "react-router-dom";

function ProtectedApprovedUserRoute({ isAuthenticated, isApproved, children }) {
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  // Redirect to approval if authenticated but not approved
  if (isAuthenticated && !isApproved) {
    return <Navigate to="/approval" />;
  }
  // Render the protected component if approved
  return children ? children : <Outlet />;
}

export default ProtectedApprovedUserRoute;