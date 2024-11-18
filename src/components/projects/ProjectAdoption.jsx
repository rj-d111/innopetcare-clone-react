import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaSearch } from 'react-icons/fa';
import { MdViewList, MdViewModule } from 'react-icons/md';
import Spinner from '../Spinner';
import Footer from '../Footer';
import ProjectFooter from './ProjectFooter';

export default function ProjectAdoption() {
  const pathname = window.location.href;
  const parts = pathname.split("sites/");
  let slug = parts.length > 1 ? parts[1].split("/")[0] : '';

  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      try {
        // Fetch the projectId using the slug
        const globalSectionsQuery = query(
          collection(db, 'global-sections'),
          where('slug', '==', slug)
        );
        const globalSectionsSnapshot = await getDocs(globalSectionsQuery);
  
        if (!globalSectionsSnapshot.empty) {
          const projectId = globalSectionsSnapshot.docs[0].id;
  
          // Fetch all pets for the projectId
          const adoptionsQuery = query(
            collection(db, 'adoptions'),
            where('projectId', '==', projectId)
          );
  
          const adoptionsSnapshot = await getDocs(adoptionsQuery);
          const pets = adoptionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          // Filter out pets that have `isArchive` set to true
          const filteredPets = pets.filter(
            pet => !pet.isArchive || pet.isArchive === false
          );
  
          setFilteredPets(filteredPets);
        }
      } catch (error) {
        console.error('Error fetching projectId or pets:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPets();
  }, [slug]);
  

// Map button labels to the actual species values in your database
const categoryMapping = {
  All: 'all',
  Cats: 'cat',
  Dogs: 'dog',
  Others: 'others'
};

// Filter pets by category (Cats, Dogs, Others, All) and search query
const filteredPetsByCategory = filteredPets.filter(pet => {
  const species = pet.species?.toLowerCase().trim();
  const selectedCategory = categoryMapping[activeCategory];

  const categoryMatch =
    selectedCategory === 'all' ||
    (species === selectedCategory) ||
    (selectedCategory === 'others' && !['cat', 'dog'].includes(species));

  const searchMatch = searchQuery === '' || pet.petName.toLowerCase().includes(searchQuery.toLowerCase());

  return categoryMatch && searchMatch;
});



  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="bg-gray-600 md:min-h-[calc(100vh-64px)]">
        <div className="mx-auto text-center p-10">
          <h1 className="text-white text-4xl font-bold mb-2">Adopt, don’t shop</h1>
          <p className="text-white text-lg mb-6">These loving pets need a new home.</p>

          {/* Filters and Search Bar */}
          <div className="flex justify-between items-center mb-8">
            {/* Category Buttons */}
            <div className="flex space-x-4">
              {['All', 'Cats', 'Dogs', 'Others'].map((category) => (
                <button
                  key={category}
                  className={`px-6 py-2 font-semibold rounded ${activeCategory === category ? 'bg-red-600 text-white' : 'bg-white text-black'}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Search Bar and View Toggle */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  className="input input-bordered w-72"
                  placeholder="Search pets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="absolute right-0 top-0 bottom-0 bg-red-600 text-white px-4 rounded-r">
                  <FaSearch />
                </button>
              </div>

              {/* View Toggle Button */}
              <button
                className="btn text-white bg-red-600 px-4 py-2 rounded"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <MdViewList size={24} /> : <MdViewModule size={24} />}
              </button>
            </div>
          </div>

          {/* Display Pets */}
{filteredPetsByCategory.length > 0 ? (
  <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-6'}`}>
    {filteredPetsByCategory.map((pet) => (
      <div key={pet.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-between">
        <img
          src={pet.image}
          alt={pet.petName}
          className="w-full h-48 object-cover rounded-t-lg mb-4"
        />
        <h2 className="text-xl font-semibold text-center text-red-600 mb-4">{pet.petName}</h2>
        <button
          onClick={() => window.location.href = `/sites/${slug}/adopt-pet/${pet.id}`}
          className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
        >
          Learn about me
        </button>
      </div>
    ))}
  </div>
) : (
  // No search results message
  <div className="text-white text-center mt-10">
    <p className="text-2xl font-semibold">No pets found matching your search criteria.</p>
  </div>
)}

        </div>
      </div>
      <ProjectFooter />
    </>
  );
}
