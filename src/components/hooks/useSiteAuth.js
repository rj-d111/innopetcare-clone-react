import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

const useSiteAuth = () => {
  const { slug } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'clients', user.uid);
          const userDoc = await getDoc(userDocRef);

          // Check if the user is authenticated for the current slug
          if (userDoc.exists() && userDoc.data().projectId === slug) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  return { isAuthenticated, loading };
};

export default useSiteAuth;
