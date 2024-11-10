import { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // Make sure `app` is your Firebase app instance

const useSlugExists = (slug) => {
  const [exists, setExists] = useState(null); // null = loading, true = found, false = not found

  useEffect(() => {
    const checkSlugExists = async () => {
      try {
        // Define the collection and query with Firestore modular syntax
        const projectRef = collection(db, 'global-sections');
        const slugQuery = query(projectRef, where('slug', '==', slug));
        
        // Execute the query
        const snapshot = await getDocs(slugQuery);
        setExists(!snapshot.empty); // true if the slug exists, false otherwise
      } catch (error) {
        console.error('Error checking slug:', error);
        setExists(false); // Assume not found if there's an error
      }
    };

    if (slug) {
      checkSlugExists();
    }
  }, [slug, db]);

  return exists;
};

export default useSlugExists;
