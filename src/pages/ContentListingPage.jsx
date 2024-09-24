import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Assume your firebase config is imported from this file
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function ContentListingPage() {
  const [veterinarySites, setVeterinarySites] = useState([]);
  const [animalShelters, setAnimalShelters] = useState([]);

  // Fetch the active projects and their related data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
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
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="mt-10 md:m-10 space-y-5">
      <a
        className="py-2 px-10 rounded-full font-medium select-none border text-yellow-800 dark:text-white bg-white dark:bg-yellow-800 transition-colors hover:border-yellow-900 hover:bg-yellow-900 hover:text-white dark:hover:text-white"
        href="/options"
      >
        ⪻ Back
      </a>

      {/* Veterinary Clinics Section */}
      <h1 className="text-2xl md:text-3xl text-center font-bold">
        Visit Veterinary Clinics
      </h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {veterinarySites.map((site) => (
          <button
            key={site.slug}
            className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex flex-col items-center p-10">
              <img
                className="w-24 h-24 mb-3 shadow-lg"
                alt={site.name}
                src={site.image}
              />
              <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                {site.name}
              </h5>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {site.address}
              </span>
              <div className="flex mt-4 md:mt-6">
                <Link
                  to={`/${site.slug}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Visit Now
                </Link>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Animal Shelter Section */}
      <h1 className="text-2xl md:text-3xl text-center font-bold">
        Visit Animal Shelter
      </h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {animalShelters.map((shelter) => (
          <button
            key={shelter.slug}
            className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex flex-col items-center p-10">
              <img
                className="w-24 h-24 mb-3 shadow-lg"
                alt={shelter.name}
                src={shelter.image}
              />
              <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                {shelter.name}
              </h5>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {shelter.address}
              </span>
              <div className="flex mt-4 md:mt-6">
                <Link
                  to={`/${shelter.slug}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Visit Now
                </Link>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
