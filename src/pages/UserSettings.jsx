import React from "react";
import { Link } from "react-router-dom";
import { FaCommentAlt, FaQuestionCircle, FaUserShield, FaFileContract } from "react-icons/fa";

export default function UserSettings() {
  return (
    <div className="md:h-[80vh] bg-gray-100 flex justify-center">
      <div className="container mx-auto p-5">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Settings</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-4 text-center">
          <Link to="/user-feedback" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <FaCommentAlt className="text-yellow-600 text-3xl mb-2 mx-auto" />
            <p className="text-gray-700 font-semibold">Send Feedback</p>
          </Link>
          <Link to="/help" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <FaQuestionCircle className="text-yellow-600 text-3xl mb-2 mx-auto" />
            <p className="text-gray-700 font-semibold">Help</p>
          </Link>
          <Link to="/privacy-policy" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <FaUserShield className="text-yellow-600 text-3xl mb-2 mx-auto" />
            <p className="text-gray-700 font-semibold">Privacy Policy</p>
          </Link>
          <Link to="/terms-and-conditions" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <FaFileContract className="text-yellow-600 text-3xl mb-2 mx-auto" />
            <p className="text-gray-700 font-semibold">Terms and Conditions</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
