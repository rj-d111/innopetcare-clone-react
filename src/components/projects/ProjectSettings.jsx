import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaCommentAlt,
  FaQuestionCircle,
  FaUserShield,
  FaFileContract,
} from "react-icons/fa";
import { MdOutlineReport } from "react-icons/md";
import { FaShieldHalved } from "react-icons/fa6";
import { VscFeedback } from "react-icons/vsc";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";

export default function ProjectSettings() {
  const { slug } = useParams();
  const db = getFirestore();
  const [ownerDetails, setOwnerDetails] = useState(null);
  const headerColor = ownerDetails?.headerColor || '#F59E0B';
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


          setOwnerDetails(ownerData);
        }
      } catch (error) {
        console.error("Error fetching owner details:", error);
      }
    };

    if (slug) {
      fetchOwnerDetails();
    }
  }, [slug, db]);

  return (
    <div className="md:min-h-[calc(100vh-64px)] flex justify-center">
      <div className="container mx-auto p-5">
        <h1 className="text-5xl font-bold my-6 pb-6 text-gray-800">
          Settings
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-3 text-center">
          {/* Privacy Settings Link */}
          <Link
            to="privacy-settings"
            className="p-6 rounded-lg shadow hover:shadow-lg transition"
            style={{
              backgroundColor: `rgba(${parseInt(headerColor.slice(1, 3), 16)}, ${parseInt(headerColor.slice(3, 5), 16)}, ${parseInt(headerColor.slice(5, 7), 16)}, 0.1)`
            }}
          >
            <FaShieldHalved
              size={40}
              style={{ color: headerColor }}
              className="mb-2 mx-auto"
            />
            <p className="text-gray-700 font-semibold">Privacy Settings</p>
            <p>Change Login Information and Password</p>
          </Link>
  
          {/* Send Feedback Link */}
          <Link
            to="user-feedback"
            className="p-6 rounded-lg shadow hover:shadow-lg transition"
            style={{
              backgroundColor: `rgba(${parseInt(headerColor.slice(1, 3), 16)}, ${parseInt(headerColor.slice(3, 5), 16)}, ${parseInt(headerColor.slice(5, 7), 16)}, 0.1)`
            }}
          >
            <VscFeedback
              size={40}
              style={{ color: headerColor }}
              className="mb-2 mx-auto"
            />
            <p className="text-gray-700 font-semibold">Send Feedback</p>
            <p>Give feedback about your experience</p>
          </Link>
  
          {/* Send Report Link */}
          <Link
            to="send-report"
            className="p-6 rounded-lg shadow hover:shadow-lg transition"
            style={{
              backgroundColor: `rgba(${parseInt(headerColor.slice(1, 3), 16)}, ${parseInt(headerColor.slice(3, 5), 16)}, ${parseInt(headerColor.slice(5, 7), 16)}, 0.1)`
            }}
          >
            <MdOutlineReport
              size={40}
              style={{ color: headerColor }}
              className="mb-2 mx-auto"
            />
            <p className="text-gray-700 font-semibold">Send Report</p>
            <p>Found something that doesn't seem right?</p>
          </Link>
        </div>
      </div>
    </div>
  );
  
}
