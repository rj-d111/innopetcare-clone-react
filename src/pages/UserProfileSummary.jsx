import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebase'; // Adjust the path to your firebase config file
import { LuPencil } from "react-icons/lu";

export default function UserProfileSummary() {
  const [userData, setUserData] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          setUserData(userDocSnapshot.data());
        }
      }
    };
    fetchUserData();
  }, [auth]);

  const profileImage = userData?.profileImage || "https://innopetcare.com/_services/unknown_user.jpg";

  return (
    <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-yellow-100 overflow-y-auto">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center w-full max-w-xs">
        <div className="avatar">
          <div className="w-24 rounded-full">
            <img src={profileImage} alt="Profile" />
          </div>
        </div>
        <h2 className="text-xl font-semibold mt-4">{userData?.name || auth.currentUser.displayName || 'User Name'}</h2>
        <Link to="/profile/edit" className="btn btn-sm btn-outline mt-2">
          <LuPencil /> Edit Profile
        </Link>
        <div className="mt-4">
          <p className="text-gray-600 font-semibold">Contact no.:</p>
          <p>{userData?.phone || 'N/A'}</p>
          <p className="text-gray-600 font-semibold mt-2">Email:</p>
          <p>{userData?.email || auth.currentUser.email || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
