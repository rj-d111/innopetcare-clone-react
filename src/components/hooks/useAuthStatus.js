import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function useAuthStatus() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoggedIn(true);
        try {
          // Check if user is in the tech-admin collection
          const techAdminDocRef = doc(db, "tech-admin", user.uid);
          const techAdminDocSnapshot = await getDoc(techAdminDocRef);

          if (techAdminDocSnapshot.exists()) {
            setUserRole("tech-admin");
          } else {
            setUserRole("user"); // Set to user if not a tech-admin
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole(null);
        }
      } else {
        setLoggedIn(false);
        setUserRole(null);
      }
      setCheckingStatus(false);
    });

    return () => unsubscribe();
  }, []);

  return { loggedIn, userRole, checkingStatus };
}
