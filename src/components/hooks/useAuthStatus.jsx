import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchUserRole } from "./utils"; // Ensure this path is correct

export const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [userRole, setUserRole] = useState(null); 

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setLoggedIn(true);
          const role = await fetchUserRole(user); // Fetch the user role from Firestore
          setUserRole(role || null); // Set the user role or null if undefined
        } else {
          setLoggedIn(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole(null);
      } finally {
        setCheckingStatus(false);
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  return { loggedIn, checkingStatus, userRole };
};

export default useAuthStatus;
