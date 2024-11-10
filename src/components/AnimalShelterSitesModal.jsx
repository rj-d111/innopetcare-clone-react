import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { IoMdClose } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { MdViewModule, MdViewList } from "react-icons/md";
import { Link } from "react-router-dom";

export default function AnimalShelterSitesModal({ isOpen, closeModal, headerColor }) {
  const [animalShelterSites, setAnimalShelterSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    if (isOpen) {
      fetchSites();
    }
  }, [isOpen]);

  const fetchSites = async () => {
    setLoading(true);
    try {
      // Fetch only active animal shelter sites
      const projectSnapshots = await getDocs(
        query(
          collection(db, "projects"),
          where("status", "==", "active"),
          where("type", "==", "Animal Shelter Site")
        )
      );

      // Fetch global sections for each project and map by projectId
      const globalSectionsSnap = await getDocs(collection(db, "global-sections"));
      const globalSections = {};
      globalSectionsSnap.docs.forEach((doc) => {
        globalSections[doc.id] = doc.data();
      });

      // Map data for animal shelter sites
      const shelters = projectSnapshots.docs.map((docSnap) => {
        const projectId = docSnap.id;
        const project = docSnap.data();
        const globalSection = globalSections[projectId];

        return globalSection
          ? {
              name: globalSection.name,
              image: globalSection.image,
              slug: globalSection.slug,
              address: globalSection.address,
              type: project.type,
            }
          : null;
      }).filter(site => site !== null);

      setAnimalShelterSites(shelters);
    } catch (error) {
      console.error("Error fetching animal shelter sites:", error);
    } finally {
      setLoading(false);
    }
  };
  

  // Filter the animal shelter sites based on the search query
  const filteredSites = animalShelterSites.filter((site) =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-[600px] max-w-full mx-4 max-h-[90vh] overflow-y-auto relative z-50">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Animal Shelter Sites</h2>
            <IoMdClose onClick={closeModal} className="cursor-pointer text-xl" />
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="join">
              <input
                className="input input-bordered join-item"
                placeholder="Search animal shelter"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn join-itemrounded-r-full"
                       style={{
                        background: headerColor,
                        color: "#ffffff",
                      }}
              >
                <FaSearch />
              </button>
            </div>

            {/* Toggle Button for List/Grid View */}
            <button
              className="btn text-white px-4 py-2 rounded"
              style={{
                background: headerColor,
              }}
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? (
                <MdViewList size={24} />
              ) : (
                <MdViewModule size={24} />
              )}
            </button>
          </div>

          {loading ? (
            <div className="flex w-full flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="skeleton h-16 w-16 shrink-0 rounded-full bg-gray-300 animate-pulse"></div>
                <div className="flex flex-col gap-4">
                  <div className="skeleton h-4 w-96 bg-gray-300 animate-pulse"></div>
                  <div className="skeleton h-4 w-2/3 bg-gray-300 animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "overflow-y-auto max-h-[70vh]"}>
              {filteredSites.length > 0 ? (
                filteredSites.map((site) => (
                  <div
                    key={site.id}
                    className={`border-b pb-4 mb-4 ${viewMode === "grid" ? "text-center" : "flex justify-between items-center"
                      }`}
                  >
                    {viewMode === "grid" ? (
                      // Grid View Layout
                      <div>
                        <img
                          src={site.image}
                          alt={site.name}
                          className="w-24 h-24 rounded-full mx-auto mb-2"
                        />
                        <div className="text-lg font-semibold">{site.name}</div>
                        <div className="text-sm text-gray-600">{site.address}</div>
                        <Link
                          to={`/sites/${site.slug}`}
                          className="inline-block mt-2 text-white py-1 px-3 rounded-lg  transition"
                          onClick={closeModal}
                          style={{
                            background: headerColor,
                          }}
                  
                        >
                          Visit Site
                        </Link>
                      </div>
                    ) : (
                      // List View Layout
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-4">
                          <img
                            src={site.image}
                            alt={site.name}
                            className="w-16 h-16 rounded-full"
                          />
                          <div>
                            <div className="text-lg font-semibold">{site.name}</div>
                            <div className="text-sm text-gray-600">{site.address}</div>
                          </div>
                        </div>
                        <Link
                          to={`/sites/${site.slug}`}
                          className=" text-white py-1 px-3 rounded-lg  transition"
                          onClick={closeModal}
                          style={{
                            background: headerColor,
                          }}
                        >
                          Visit Site
                        </Link>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center">
                  No active animal shelter sites found.
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
