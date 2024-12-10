import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Adjust this import based on your project structure

function useAuthStatusUsers() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isApproved, setIsApproved] = useState(null);
  const [emailVerified, setEmailVerified] = useState(null); // Track email verification status
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCheckingStatus(true);

      if (user) {
        setIsAuthenticated(true);
        setEmailVerified(user.emailVerified); // Update email verification status

        // Fetch approval status from Firestore (e.g., "users" collection)
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Check if the `status` field is "approved"
          setIsApproved(docSnap.data().status === "approved");
        } else {
          setIsApproved(false); // Handle case where no user doc is found
        }
      } else {
        setIsAuthenticated(false);
        setEmailVerified(false); // Reset emailVerified if not authenticated
        setIsApproved(false);
      }

      setCheckingStatus(false);
    });

    return () => unsubscribe();
  }, []);

  return { isAuthenticated, isApproved, emailVerified, checkingStatus };
}

export default useAuthStatusUsers;
