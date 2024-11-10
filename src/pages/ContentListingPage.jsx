import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import Spinner from "../components/Spinner";

export default function ContentListingPage() {
  const [veterinarySites, setVeterinarySites] = useState([]);
  const [animalShelters, setAnimalShelters] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // Use Promise.all to fetch both collections in parallel
        const [projectSnapshots, globalSectionsSnap] = await Promise.all([
          getDocs(query(collection(db, "projects"), where("status", "==", "active"))),
          getDocs(collection(db, "global-sections")),
        ]);

        // Map global-sections by projectId
        const globalSections = {};
        globalSectionsSnap.docs.forEach((doc) => {
          globalSections[doc.id] = doc.data();
        });

        // Organize projects
        const vetSites = [];
        const shelters = [];

        projectSnapshots.docs.forEach((docSnap) => {
          const project = docSnap.data();
          const projectId = docSnap.id;
          const globalSection = globalSections[projectId];

          if (globalSection) {
            const projectData = {
              name: globalSection.name,
              image: globalSection.image,
              slug: globalSection.slug,
              address: globalSection.address,
              type: project.type,
            };

            // Categorize by project type
            if (project.type === "Veterinary Site") {
              vetSites.push(projectData);
            } else if (project.type === "Animal Shelter Site") {
              shelters.push(projectData);
            }
          }
        });

        // Update state with organized data
        setVeterinarySites(vetSites);
        setAnimalShelters(shelters);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);


  const filteredVeterinarySites = veterinarySites.filter((site) => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    return (
      (filterType === "all" || filterType === "Veterinary Site") &&
      (site.name.toLowerCase().includes(lowerSearchQuery) ||
        site.address.toLowerCase().includes(lowerSearchQuery))
    );
  });

  const filteredAnimalShelters = animalShelters.filter((shelter) => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    return (
      (filterType === "all" || filterType === "Animal Shelter Site") &&
      (shelter.name.toLowerCase().includes(lowerSearchQuery) ||
        shelter.address.toLowerCase().includes(lowerSearchQuery))
    );
  });

  const noResultsFound =
    !loading &&
    filteredVeterinarySites.length === 0 &&
    filteredAnimalShelters.length === 0;

  return (
    <div className="mt-10 md:m-10 space-y-5 flex flex-col">
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:justify-between items-center mb-5 space-y-4 md:space-y-0">
            <div className="w-full md:w-auto">
              <Link
                to="/"
                className="py-2 px-10 rounded-full font-medium select-none border text-yellow-800 bg-white transition-colors hover:border-yellow-900 hover:bg-yellow-900 hover:text-white"
              >
                ⪻ Back
              </Link>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-2 w-full md:w-auto">
              <button
                className={`btn join-item ${filterType === "all" ? "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white" : ""}`}
                onClick={() => setFilterType("all")}
              >
                All
              </button>
              <button
                className={`btn join-item ${filterType === "Veterinary Site" ? "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white" : ""}`}
                onClick={() => setFilterType("Veterinary Site")}
              >
                Veterinary Site
              </button>
              <button
                className={`btn join-item ${filterType === "Animal Shelter Site" ? "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white" : ""}`}
                onClick={() => setFilterType("Animal Shelter Site")}
              >
                Animal Shelter Site
              </button>
            </div>

            <div className="flex items-center w-full md:w-auto">
              <input
                className="input input-bordered w-full md:w-60 border-2 border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:border-blue-400"
                placeholder="Search by name or address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn rounded-r-lg px-4 py-2 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white">
                <FaSearch />
              </button>
            </div>
          </div>

          {noResultsFound ? (
            <p className="text-gray-500 text-center">No results found.</p>
          ) : (
            <>
              {/* Veterinary Clinics Section */}
              {filteredVeterinarySites.length > 0 && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                  {filteredVeterinarySites.map((site) => (
                    <div
                      key={site.slug}
                      className="w-full text-center max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg"
                    >
                      <div className="flex flex-col items-center p-10">
                        <img
                          className="w-24 h-24 mb-3 shadow-lg rounded-full"
                          alt={site.name}
                          src={site.image}
                        />
                        <h5 className="mb-1 text-xl font-medium text-gray-900 text-center">
                          {site.name}
                        </h5>
                        <span className="text-sm text-gray-500 text-center">
                          {site.address}
                        </span>
                        <div className="flex mt-4 md:mt-6">
                          <Link
                            to={`/sites/${site.slug}`}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-yellow-700 rounded-lg hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
                          >
                            Visit Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Animal Shelter Section */}
              {filteredAnimalShelters.length > 0 && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                  {filteredAnimalShelters.map((shelter) => (
                    <div
                      key={shelter.slug}
                      className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg"
                    >
                      <div className="flex flex-col items-center p-10">
                        <img
                          className="w-24 h-24 mb-3 shadow-lg rounded-full"
                          alt={shelter.name}
                          src={shelter.image}
                        />
                        <h5 className="mb-1 text-xl font-medium text-gray-900 text-center">
                          {shelter.name}
                        </h5>
                        <span className="text-sm text-gray-500 text-center">
                          {shelter.address}
                        </span>
                        <div className="flex mt-4 md:mt-6">
                          <Link
                            to={`/sites/${shelter.slug}`}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-yellow-700 rounded-lg hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
                          >
                            Visit Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
