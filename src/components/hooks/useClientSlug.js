import { useState, useEffect } from "react";
import { db } from "../../firebase"; // Update with your Firebase configuration
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const useClientSlug = () => {
  const auth = getAuth();
  const [slug, setSlug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticatedForSlug, setIsAuthenticatedForSlug] = useState(false);

  useEffect(() => {
    const fetchSlug = async () => {
      setLoading(true); // Ensure loading state is reset on each fetch
      try {
        // Get current user
        const currentUser = auth.currentUser;

        if (!currentUser) {
          setIsAuthenticatedForSlug(false);
          setSlug(null);
          setLoading(false);
          return;
        }

        const uid = currentUser.uid;

        // Check the clients collection for the user by uid
        const clientsQuery = query(
            collection(db, "clients"),
            where("__name__", "==", uid) // `__name__` corresponds to the document ID
          );
          
          const clientSnapshot = await getDocs(clientsQuery);
          
          if (clientSnapshot.empty) {
            console.warn("No matching client document found for UID:", uid);
            setIsAuthenticatedForSlug(false);
            setSlug(null);
            setLoading(false);
            return;
          }
          

        // Assuming there's only one client document per user
        const clientDoc = clientSnapshot.docs[0];
        const { projectId } = clientDoc.data();

        if (!projectId) {
          setIsAuthenticatedForSlug(false);
          setSlug(null);
          setLoading(false);
          return;
        }

        // Find the slug from the global-sections collection using projectId
        const globalSectionDoc = await getDoc(doc(db, "global-sections", projectId));

        if (!globalSectionDoc.exists()) {
          setIsAuthenticatedForSlug(false);
          setSlug(null);
          setLoading(false);
          return;
        }

        const { slug: projectSlug } = globalSectionDoc.data();
        setSlug(projectSlug);
        setIsAuthenticatedForSlug(true);
      } catch (error) {
        console.error("Error fetching slug:", error);
        setIsAuthenticatedForSlug(false);
        setSlug(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSlug();
  }, []); // Fetch only on mount

  return { slug, isAuthenticatedForSlug, loading };
};

export default useClientSlug;
