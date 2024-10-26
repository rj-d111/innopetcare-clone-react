import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Assume your firebase config is imported from this file
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa"; // Make sure you import the search icon
import Spinner from "../components/Spinner";

export default function ContentListingPage() {
  const [veterinarySites, setVeterinarySites] = useState([]);
  const [animalShelters, setAnimalShelters] = useState([]);
  const [filterType, setFilterType] = useState("all"); // Filter for types
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch the active projects and their related data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Set loading to true before fetching
        setLoading(true);

        // Query for active projects
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, where("status", "==", "active"));
        const projectSnapshots = await getDocs(q);

        const vetSites = [];
        const shelters = [];

        for (const docSnap of projectSnapshots.docs) {
          const project = docSnap.data();
          const projectId = docSnap.id;

          // Fetch related data from 'global-sections' and 'contact-info'
          const globalSectionsSnap = await getDocs(
            query(collection(db, "global-sections"), where("projectId", "==", projectId))
          );
          const contactInfoSnap = await getDocs(
            query(collection(db, "contact-info"), where("projectId", "==", projectId))
          );

          const globalSection = globalSectionsSnap.docs[0]?.data();
          const contactInfo = contactInfoSnap.docs[0]?.data();

          if (globalSection && contactInfo) {
            const projectData = {
              name: globalSection.name,
              image: globalSection.image,
              slug: globalSection.slug,
              address: contactInfo.address,
              type: project.type,
            };

            if (project.type === "Veterinary Site") {
              vetSites.push(projectData);
            } else if (project.type === "Animal Shelter Site") {
              shelters.push(projectData);
            }
          }
        }

        setVeterinarySites(vetSites);
        setAnimalShelters(shelters);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        // Set loading to false after fetching
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filtered data based on type and search query
  const filteredVeterinarySites = veterinarySites.filter((site) => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    return (
      (filterType === "all" || site.type === filterType) &&
      (site.name.toLowerCase().includes(lowerSearchQuery) ||
        site.address.toLowerCase().includes(lowerSearchQuery))
    );
  });

  const filteredAnimalShelters = animalShelters.filter((shelter) => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    return (
      (filterType === "all" || shelter.type === filterType) &&
      (shelter.name.toLowerCase().includes(lowerSearchQuery) ||
        shelter.address.toLowerCase().includes(lowerSearchQuery))
    );
  });

  return (
    <div className="mt-10 md:m-10 space-y-5 flex flex-col">
      {/* Loading Spinner */}
      {loading ? (
        <Spinner /> // Display the Spinner while loading
      ) : (
        <>
          {/* Flex container for filter buttons and search bar */}
          <div className="flex justify-between items-center mb-5">
            <button className="py-2 px-10 rounded-full font-medium select-none border text-yellow-800 dark:text-white bg-white dark:bg-yellow-800 transition-colors hover:border-yellow-900 hover:bg-yellow-900 hover:text-white dark:hover:text-white">
              <Link to="/"> ⪻ Back</Link>
            </button>
            {/* Filter buttons for Project Type */}
            <div className="flex space-x-2">
              <button
                className={`btn join-item ${filterType === "all" ? "btn-active" : ""}`}
                onClick={() => setFilterType("all")}
              >
                All
              </button>
              <button
                className={`btn join-item ${filterType === "Veterinary Site" ? "btn-active" : ""}`}
                onClick={() => setFilterType("Veterinary Site")}
              >
                Veterinary Site
              </button>
              <button
                className={`btn join-item ${filterType === "Animal Shelter Site" ? "btn-active" : ""}`}
                onClick={() => setFilterType("Animal Shelter Site")}
              >
                Animal Shelter Site
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center">
              <input
                className="input input-bordered join-item w-60"
                placeholder="Search by name or address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn join-item rounded-l-none">
                <FaSearch />
              </button>
            </div>
          </div>

          {/* Veterinary Clinics Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {filteredVeterinarySites.map((site) => (
              <div key={site.slug} className="w-full text-center max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col items-center p-10">
                  <img className="w-24 h-24 mb-3 shadow-lg" alt={site.name} src={site.image} />
                  <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">{site.name}</h5>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{site.address}</span>
                  <div className="flex mt-4 md:mt-6">
                    <Link
                      to={`/sites/${site.slug}`}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Visit Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Animal Shelter Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {filteredAnimalShelters.map((shelter) => (
              <div key={shelter.slug} className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col items-center p-10">
                  <img className="w-24 h-24 mb-3 shadow-lg" alt={shelter.name} src={shelter.image} />
                  <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">{shelter.name}</h5>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{shelter.address}</span>
                  <div className="flex mt-4 md:mt-6">
                    <Link
                      to={`/sites/${shelter.slug}`}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Visit Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
