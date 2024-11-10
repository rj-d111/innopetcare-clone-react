import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import InnoPetCareLogo from "../../assets/png/innopetcare-black.png"; // Adjust this path as needed

export default function ProjectFooter() {
  const [ownerDetails, setOwnerDetails] = useState(null);
  const { slug } = useParams();
  const db = getFirestore();
  const [projectId, setProjectId] = useState("");
  const [isAnimalShelter, setAnimalShelter] = useState(false);

  // Fetch owner details from Firestore
  useEffect(() => {
    const fetchOwnerDetails = async () => {
      try {
        const globalSectionsQuery = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const globalSectionsSnapshot = await getDocs(globalSectionsQuery);

        if (!globalSectionsSnapshot.empty) {
          const globalSectionDoc = globalSectionsSnapshot.docs[0];
          const ownerData = globalSectionDoc.data();

          // Set owner details and projectId
          setOwnerDetails(ownerData);
          setProjectId(globalSectionDoc.id); // Set the project ID

          // Fetch project type using the fetched projectId
          await fetchProjectType(projectId);
        }
      } catch (error) {
        console.error("Error fetching owner details:", error);
      }
    };

    if (slug) {
      fetchOwnerDetails();
    }
  }, [slug, db]);

  const CurrentYear = () => new Date().getFullYear();

  const fetchProjectType = async (projectId) => {
    try {
      const projectDocRef = doc(db, "projects", projectId);
      const projectDoc = await getDoc(projectDocRef);

      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        if (projectData.type === "Animal Shelter Site") {
          setAnimalShelter(true);
        }
      }
    } catch (error) {
      console.error("Error fetching project type:", error);
    }
  };

  return (
    <footer className="bg-gray-100 py-10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1: Owner Details */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left md:px-10">
          {ownerDetails ? (
            <>
              {ownerDetails.image && (
                <img
                  src={ownerDetails.image}
                  alt={ownerDetails.name}
                  className="h-20 mb-4 object-cover"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">
                {ownerDetails.name || "Owner Name"}
              </h3>
              <p className="text-gray-600">
                {ownerDetails.address || "Owner Address"}
              </p>
            </>
          ) : (
            <p className="text-gray-600">Loading...</p>
          )}
        </div>

        {/* Column 2: Navigation Links */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="font-semibold mb-4">Navigation</h3>
          <ul className="space-y-2">
            <li>
              <Link
                to={`/sites/${slug}`}
                className="text-gray-600 hover:underline"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to={`/sites/${slug}/about`}
                className="text-gray-600 hover:underline"
              >
                About Us
              </Link>
            </li>
            {!isAnimalShelter && (
              <li>
                <Link
                  to={`/sites/${slug}/services`}
                  className="text-gray-600 hover:underline"
                >
                  Services
                </Link>
              </li>
            )}

            {isAnimalShelter && (
              <>
                <li>
                  <Link
                    to={`/sites/${slug}/volunteer`}
                    className="text-gray-600 hover:underline"
                  >
                    Volunteer
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/sites/${slug}/donate`}
                    className="text-gray-600 hover:underline"
                  >
                    Donate
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link
                to={`/sites/${slug}/appointments`}
                className="text-gray-600 hover:underline"
              >
                Appointments
              </Link>
            </li>
            <li>
              <Link
                to={`/sites/${slug}/contact`}
                className="text-gray-600 hover:underline"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                to={`/sites/${slug}/adopt-pet`}
                className="text-gray-600 hover:underline"
              >
                Adopt Pets
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: InnoPetCare Logo and Description */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left md:px-10">
          <img src={InnoPetCareLogo} alt="InnoPetCare" className="h-12 mb-4" />
          <p className="text-gray-600">
            InnoPetCare is a content management system (CMS) designed for
            veterinary clinics and animal shelters to manage their online
            presence.
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-8 border-t border-gray-300 pt-4 text-center">
        <p className="text-gray-600">
          &copy; {CurrentYear()} InnoPetCare, All Rights Reserved
        </p>
        <p className="text-gray-600">
          <Link
                    to={`/sites/${slug}/terms-and-conditions`}
                    className="text-gray-600 hover:underline"
          >
            Terms and Conditions
          </Link>
          <span className="px-3">|</span>
          <Link to={`/sites/${slug}/privacy-policy`} className="text-gray-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </footer>
  );
}
