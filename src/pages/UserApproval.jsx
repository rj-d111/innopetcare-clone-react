import React, { useState, useEffect, useRef } from "react";
import { MdOutlineDomainVerification } from "react-icons/md";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase";

export default function UserApproval() {
  const [isApproved, setIsApproved] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();
  const toastShown = useRef(false); // Track if toast has been shown

  const checkApprovalStatus = async () => {
    if (!auth.currentUser) return;

    try {
      setIsChecking(true);
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().status === "approved") {
        setIsApproved(true);

        // Show the toast only if it hasn't been shown yet
        if (!toastShown.current) {
          toast.success("Your account has been approved!");
          toastShown.current = true;
        }
      }
    } catch (error) {
      console.error("Error checking approval status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checkApprovalStatus();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(
          userDocRef,
          { lastActivityTime: serverTimestamp() },
          { merge: true }
        );
      }

      await signOut(auth);
      toast.success("Successfully logged out");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out. Please try again.");
    }
  };

  if (isApproved) {
    return (
      <div className="flex items-center justify-center my-10 mx-3 text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 lg:w-1/2 w-full">
          <div className="flex justify-center">
            <div className="bg-green-300 rounded-full p-5 flex items-center justify-center">
              <MdOutlineDomainVerification className="text-6xl text-green-900" />
            </div>
          </div>
          <h1 className="font-bold text-green-900 text-3xl mb-4">
            Your Account is Approved!
          </h1>
          <p className="text-gray-600">
            Your account has been approved. Refresh this page to continue.
          </p>
          <button
            className="w-full uppercase bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-green-800 shadow-md hover:shadow-lg mt-6"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

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
          Your account is currently pending approval. We'll notify you via email
          once your account has been verified.
        </p>
        <p className="text-gray-600 my-4">
          Please be patient as we review your information.
        </p>
        {isChecking && (
          <p className="text-blue-600 mt-4">Checking approval status...</p>
        )}
        <p
          className="text-sm text-right mt-3 text-yellow-600 hover:underline hover:text-yellow-800 transition duration-200 ease-in-out cursor-pointer"
          onClick={handleLogout}
        >
          Log Out
        </p>
      </div>
    </div>
  );
}
