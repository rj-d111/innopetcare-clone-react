// useClientApprovalStatus.js
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useParams } from "react-router-dom";

const useClientApprovalStatus = () => {
  const { slug } = useParams();
  const [isApproved, setIsApproved] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAuthenticatedForSlug, setIsAuthenticatedForSlug] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoggedIn(true);
        try {
          // Fetch the document with the matching slug in the `global-sections` collection
          const globalSectionsRef = collection(db, "global-sections");
          const slugQuery = query(globalSectionsRef, where("slug", "==", slug));
          const slugSnapshot = await getDocs(slugQuery);

          if (!slugSnapshot.empty) {
            const slugDoc = slugSnapshot.docs[0];
            const slugUid = slugDoc.id; // Use the document ID of the slug

            const userDocRef = doc(db, "clients", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserRole("clients");
              setIsApproved(userData.status === "approved");

              // Compare userData.projectId with the UID of the slug document
              if (userData.projectId === slugUid) {
                setIsAuthenticatedForSlug(true);
              } else {
                // If the user’s projectId doesn’t match the slug’s UID, sign them out
                await auth.signOut();
                setIsAuthenticatedForSlug(false);
                setIsApproved(false);
                setUserRole(null);
                setLoggedIn(false);
                console.log("should log out");
                return; // Exit early
              }
            }
          } else {
            console.error("Slug not found in global-sections");
            setIsAuthenticatedForSlug(false);
          }
        } catch (error) {
          console.error("Error fetching user or slug data:", error);
          setIsAuthenticatedForSlug(false);
        }
      } else {
        setLoggedIn(false);
        setIsAuthenticatedForSlug(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  return { isApproved, userRole, loading, loggedIn, isAuthenticatedForSlug, auth };
};

export default useClientApprovalStatus;
