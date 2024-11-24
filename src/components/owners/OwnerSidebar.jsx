import { doc, getDoc, getFirestore } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const Sidebar = ({ projectType }) => {
  const { id } = useParams(); // useParams must be inside the component
  const [isEnabled, setIsEnabled] = useState(true);
  const db = getFirestore();
  useEffect(() => {
    const fetchAdoptSection = async () => {
      try {
        const adoptSectionRef = doc(db, "adopt-sections", id);
        const adoptSectionSnap = await getDoc(adoptSectionRef);

        if (adoptSectionSnap.exists()) {
          const adoptSectionData = adoptSectionSnap.data();
          setIsEnabled(adoptSectionData.isEnabled); // Use correct property key
        } else {
          console.warn("Adopt section not found.");
        }
      } catch (error) {
        console.error("Error fetching adopt section:", error);
      }
    };

    fetchAdoptSection();
  }, [id, db]);

  return (
    <aside className="w-1/4 h-[calc(100vh-64px)] bg-blue-800 text-white p-4 print:hidden">
      <h2 className="text-lg font-semibold mb-4">Navigation</h2>
      <ul className="h-[calc(100vh-128px)] overflow-y-auto">
        <li>
          <Link
            to={`/${id}/dashboard`}
            className="block py-2 px-4 rounded hover:bg-blue-700"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to={`/${id}/messages`}
            className="block py-2 px-4 rounded hover:bg-blue-700"
          >
            Connected Care Center
          </Link>
        </li>
        {isEnabled && (
          <li>
            <Link
              to={`/${id}/adoptions`}
              className="block py-2 px-4 rounded hover:bg-blue-700"
            >
              Pet Adoption
            </Link>
          </li>
        )}
        {projectType === "Veterinary Site" ? (
          <>
            <li>
              <Link
                to={`/${id}/pending`}
                className="block py-2 px-4 rounded hover:bg-blue-700"
              >
                User Account Requests
              </Link>
            </li>
            <li>
              <Link
                to={`/${id}/schedule`}
                className="block py-2 px-4 rounded hover:bg-blue-700"
              >
                Veterinary Schedule
              </Link>
            </li>
            <li>
              <Link
                to={`/${id}/pet-records`}
                className="block py-2 px-4 rounded hover:bg-blue-700"
              >
                Pet Health Records
              </Link>
            </li>
            <li>
              <Link
                to={`/${id}/pet-owners`}
                className="block py-2 px-4 rounded hover:bg-blue-700"
              >
                Pet Owners
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                to={`/${id}/animal-schedule`}
                className="block py-2 px-4 rounded hover:bg-blue-700"
              >
                Animal Schedule
              </Link>
            </li>
            <li>
              <Link
                to={`/${id}/users`}
                className="block py-2 px-4 rounded hover:bg-blue-700"
              >
                Users
              </Link>
            </li>
          </>
        )}
        <li>
          <Link
            to={`/${id}/feedback`}
            className="block py-2 px-4 rounded hover:bg-blue-700"
          >
            User Feedback
          </Link>
        </li>
        <li>
          <Link
            to={`/${id}/report`}
            className="block py-2 px-4 rounded hover:bg-blue-700"
          >
            Send Report
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
