import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // To extract the slug from the URL
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'; // Import Firestore methods
import { db } from '../../firebase'; // Import your Firebase Firestore instance
import Spinner from '../Spinner';

export default function ProjectAdoption() {
  const pathname = window.location.href;
  const parts = pathname.split("sites/");
  var slug;

  // Check if there's a part after "sites/"
  if (parts.length > 1) {
    slug = parts[1].split("/")[0]; // Get only the first part after "/"
  }
  console.log(slug);

  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectIdAndPets = async () => {
      try {
        // Step 1: Get the projectId from the global-sections table using the slug
        const globalSectionsQuery = query(
          collection(db, 'global-sections'),
          where('slug', '==', slug)
        );
        const globalSectionsSnapshot = await getDocs(globalSectionsQuery);

        if (!globalSectionsSnapshot.empty) {
          const globalSection = globalSectionsSnapshot.docs[0].data();
          const projectId = globalSection.projectId;

          // Step 2: Fetch pets from the adoptions table with the matching projectId
          const adoptionsQuery = query(
            collection(db, 'adoptions'),
            where('projectId', '==', projectId)
          );
          const adoptionsSnapshot = await getDocs(adoptionsQuery);
          
          console.log(adoptionsQuery);
          // Step 3: Map the adoptions data to the pet objects for display
          const pets = adoptionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() // This includes petName, species, image, etc.
          }));

          setFilteredPets(pets);
        }
      } catch (error) {
        console.error('Error fetching projectId or pets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectIdAndPets();
  }, [slug]); // This will run when the slug changes

  // Filtering pets based on category (Dogs, Cats, All)
  const filteredPetsByCategory = activeCategory === 'All'
    ? filteredPets
    : filteredPets.filter(pet => pet.species.toLowerCase() === activeCategory.toLowerCase());

  if (loading) {
    return <Spinner />;
  }

  return (
    <section className="bg-cover bg-center" style={{ backgroundImage: "url('your-background-image-url')" }}>
      <div className="bg-black bg-opacity-50 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-white text-4xl font-bold mb-2">Adopt, don’t shop</h1>
          <p className="text-white text-lg mb-6">These loving pets need a new home.</p>

          <div className="flex justify-center space-x-4 mb-8">
            <button
              className={`px-6 py-2 font-semibold rounded ${activeCategory === 'All' ? 'bg-red-600 text-white' : 'bg-white text-black'}`}
              onClick={() => setActiveCategory('All')}
            >
              ALL
            </button>
            <button
              className={`px-6 py-2 font-semibold rounded ${activeCategory === 'Cats' ? 'bg-red-600 text-white' : 'bg-white text-black'}`}
              onClick={() => setActiveCategory('Cats')}
            >
              CATS
            </button>
            <button
              className={`px-6 py-2 font-semibold rounded ${activeCategory === 'Dogs' ? 'bg-red-600 text-white' : 'bg-white text-black'}`}
              onClick={() => setActiveCategory('Dogs')}
            >
              DOGS
            </button>
          </div>

          {/* Display the pets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {filteredPetsByCategory.map((pet, index) => (
              <div key={index} className="bg-white p-4 rounded shadow-lg">
                <img
                  src={pet.image}
                  alt={pet.petName}
                  className="rounded-full w-32 h-32 mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold text-center text-red-600 mb-2">{pet.petName}</h2>
                <button
                  onClick={() => window.location.href = `/sites/${slug}/adopt-pet/${pet.id}`}
                  className="w-full py-2 bg-red-600 text-white font-semibold rounded"
                >
                  Learn about me
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
