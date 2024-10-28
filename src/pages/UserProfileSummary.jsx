import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebase'; // Adjust the path to your firebase config file
import { LuPencil } from "react-icons/lu";


export default function UserProfileSummary() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userUid = user.uid;
        const userQuery = query(
          collection(db, "users"),
          where("uid", "==", userUid)
        );
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          setUserData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, []);

  const auth = getAuth();

  return (
    <div className="flex justify-center items-center h-screen bg-yellow-100">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center w-full max-w-xs">
        <div className="avatar placeholder">
          <div className="bg-yellow-500 text-white rounded-full w-24 h-24 flex items-center justify-center">
            <span className="text-5xl">👤</span>
          </div>
        </div>
        <h2 className="text-xl font-semibold mt-4">{userData?.name || auth?.currentUser.displayName || 'User Name'}</h2>
        <Link to="/profile/edit" className="btn btn-sm btn-outline mt-2">
        <LuPencil />Edit Profile
        </Link>
        {/* <Link to="/help" className="btn btn-sm btn-outline mt-2">
        <LuPencil />Help Menu
        </Link>
        <Link to="/feedback" className="btn btn-sm btn-outline mt-2">
        <LuPencil />User Feedback
        </Link> */}
        <div className="mt-4">
          <p className="text-gray-600 font-semibold">Contact no.:</p>
          <p>{userData?.phone || 'N/A'}</p>
          <p className="text-gray-600 font-semibold mt-2">Email:</p>
          <p>{userData?.email || auth?.currentUser.email  || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
