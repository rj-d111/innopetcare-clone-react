import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

// GuestRoute Component
function GuestRoute({ children }) {
  const auth = getAuth();
  const navigate = useNavigate();
  const user = auth.currentUser;

  // Redirect logged-in users to the home page
  useEffect(() => {
    if (user) {
      navigate("/"); // Redirect logged-in users to home
    }
  }, [user, navigate]);

  // If no user is logged in, render the children (guest content)
  return !user ? children : null;
}

export default GuestRoute;
