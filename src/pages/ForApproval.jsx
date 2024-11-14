import React from 'react';
import { MdOutlineDomainVerification } from "react-icons/md";
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth'; // Import Firebase auth
import { toast } from 'react-toastify'; // Import toast for notifications

export default function ForApproval() {
  const navigate = useNavigate(); // For navigation after logout
  const auth = getAuth(); // Get the Firebase auth instance

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      toast.success("Successfully logged out"); // Show success toast
      navigate("/sites/"); // Redirect to guest page
    } catch (error) {
      console.error("Error logging out:", error); // Log any errors
      toast.error("Error logging out. Please try again."); // Show error toast if needed
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
           For approval, please visit our vet clinic or contact us. To learn more, visit the <span className='font-bold'>Contact Us</span> page.        </p>
        <p className="text-gray-600 my-4">
          If your account has not been registered, it may be deleted after 7 days.
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
