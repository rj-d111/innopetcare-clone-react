import React from 'react';
import { MdOutlineDomainVerification } from "react-icons/md";
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth'; // Import Firebase auth
import { toast } from 'react-toastify'; // Import toast for notifications
import {db} from "../firebase"
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
export default function UserApproval() {
  const navigate = useNavigate(); // For navigation after logout

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
  
      // Update the user's lastActivityTime in Firestore
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          lastActivityTime: serverTimestamp(),
        }, { merge: true }); // Merge to avoid overwriting other fields
      }
  
      await signOut(auth);
      toast.success("Successfully logged out");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out. Please try again.");
    }
  };
  

  return (
    <div className="flex items-center justify-center my-10 mx-3 text-center">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 lg:w-1/2 w-full">
        <div className="flex justify-center">
          <div className="bg-yellow-300 rounded-full p-5 flex items-center justify-center">
            <MdOutlineDomainVerification className="text-6xl text-yellow-900" />
          </div>
        </div>
        <h1 className="font-bold text-yellow-900 text-3xl mb-4">
          Waiting For Approval
        </h1>
        <p className="text-gray-600">
          Your account is currently pending approval. We'll notify you via email once your account has been verified.
        </p>
        {/* <p className="font-bold">09XXXXXXXXX</p> */}
        <p className="text-gray-600 my-4">
            Please be patient as we review your information.
        </p>
        <p 
          className="text-sm text-right mt-3 text-yellow-600 hover:underline hover:text-yellow-800 transition duration-200 ease-in-out cursor-pointer"
          onClick={handleLogout} // Attach the logout function here
        >
          Log Out
        </p>
      </div>
    </div>
  );
}
