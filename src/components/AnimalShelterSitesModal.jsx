import React, { useState, useEffect } from "react"; // Ensure useState and useEffect are imported
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Ensure Firebase is properly initialized
import { IoMdClose } from "react-icons/io";

export default function AnimalShelterSitesModal({ isOpen, closeModal }) {
  const [animalShelterSites, setAnimalShelterSites] = useState([]);

  // Fetch Animal Shelter Sites when modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchSites();
    }
  }, [isOpen]);

  const fetchSites = async () => {
    try {
      const projectsQuery = query(
        collection(db, "projects"),
        where("status", "==", "active"),
        where("type", "==", "Animal Shelter Site")
      );
      const projectSnapshot = await getDocs(projectsQuery);
      const projectIds = projectSnapshot.docs.map((doc) => doc.id);

      const globalSectionsQuery = query(
        collection(db, "global-sections"),
        where("projectId", "in", projectIds)
      );

      const globalSectionsSnapshot = await getDocs(globalSectionsQuery);
      const sitesData = globalSectionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAnimalShelterSites(sitesData);
    } catch (error) {
      console.error("Error fetching animal shelter sites: ", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg w-96 max-w-full">
        <div className="p-5">
          <p className="flex justify-end">
            <IoMdClose onClick={closeModal} className="cursor-pointer" />
          </p>
          <h2 className="text-xl font-semibold mb-4">Animal Shelter Sites</h2>
          <ul>
            {animalShelterSites.length > 0 ? (
              animalShelterSites.map((site) => (
                <li key={site.id} className="mb-4 flex items-center space-x-4">
                  <img
                    src={site.image}
                    alt={site.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <span>{site.name}</span>
                </li>
              ))
            ) : (
              <p>No active animal shelter sites found.</p>
            )}
          </ul>
          <button
            onClick={closeModal}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
