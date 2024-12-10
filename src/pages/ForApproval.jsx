import React, { useState, useEffect, useRef } from "react";
import { MdOutlineDomainVerification } from "react-icons/md";
import { getAuth, signOut } from "firebase/auth"; // Firebase auth
import { doc, getDoc, getFirestore } from "firebase/firestore"; // Firestore
import { useNavigate, useParams } from "react-router-dom"; // Navigation
import { toast } from "react-toastify"; // Notifications

export default function ForApproval() {
  const [isApproved, setIsApproved] = useState(false); // Approval status
  const [isChecking, setIsChecking] = useState(false); // Checking status
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
  const { slug } = useParams();
  const toastShown = useRef(false); // Track if the toast has already been shown

  const checkApprovalStatus = async () => {
    console.warn(auth.currentUser.uid);
    if (!auth.currentUser.uid) return;

    try {
      setIsChecking(true);
      const userRef = doc(db, "clients", auth.currentUser.uid); // Reference to user's Firestore document
      const userDoc = await getDoc(userRef);
      console.log(userDoc.data());

      if (userDoc.exists() && userDoc.data().status == "approved") {
        setIsApproved(true);
        // Show the toast only if it hasn't been shown yet
        if (!toastShown.current) {
          toast.success("Your account has been approved!");
          toastShown.current = true; // Mark the toast as shown
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

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully logged out");
      navigate("/sites/");
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
            Your account has been approved. You can now proceed.
          </p>
          <button
            className="w-full uppercase bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-green-800 shadow-md hover:shadow-lg mt-6"
            onClick={() => {
              // window.location.reload(); // Refresh the page
              navigate(`/sites/${slug}`);
            }}
          >
            Proceed
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
          For approval, please visit our vet clinic or contact us. To learn
          more, visit the <span className="font-bold">Contact Us</span> page.
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
