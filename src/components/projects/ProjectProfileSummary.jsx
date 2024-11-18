import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { db } from "../../firebase"; // Adjust the path to your firebase config file
import { LuPencil } from "react-icons/lu";

export default function ProjectProfileSummary() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userUid = user.uid;
        const userDocRef = doc(db, "clients", userUid);

        try {
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            setUserData(userData);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, []);
  const {slug} = useParams();
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

  
  const auth = getAuth();

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-68px)] md:min-h-[calc(100vh-72px)]"
    style={{
      backgroundColor: `rgba(${parseInt(headerColor.slice(1, 3), 16)}, ${parseInt(headerColor.slice(3, 5), 16)}, ${parseInt(headerColor.slice(5, 7), 16)}, 0.1)`
    }}
    >
      <div className="bg-white shadow-lg rounded-lg p-8 text-center w-full max-w-xs">
        <div className="flex justify-center mb-4">
          {userData?.profileImage ? (
            <div className="avatar relative w-24 h-24">
              <img
                src={userData.profileImage}
                alt="Profile"
                className="rounded-full object-cover w-full h-full"
                style={{ aspectRatio: "1 / 1" }}
              />
            </div>
          ) : (
            <div className="avatar placeholder">
              <div className="bg-yellow-500 text-white rounded-full w-24 h-24 flex items-center justify-center">
                <span className="text-5xl">👤</span>
              </div>
            </div>
          )}
        </div>
        <h2 className="text-xl font-semibold mt-4">
          {userData?.name || auth?.currentUser.displayName || "User Name"}
        </h2>
        <Link to="edit" className="btn btn-sm btn-outline mt-2">
          <LuPencil />
          Edit Profile
        </Link>
        <div className="mt-4">
          <p className="text-gray-600 font-semibold">Contact no.:</p>
          <p>{userData?.phone || "N/A"}</p>
          <p className="text-gray-600 font-semibold mt-2">Email:</p>
          <p>{userData?.email || auth?.currentUser.email || "N/A"}</p>
        </div>
      </div>
    </div>
  );
  
}
