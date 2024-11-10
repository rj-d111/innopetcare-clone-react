import React from "react";
import { Link } from "react-router-dom";
import { MdOutlineReport } from "react-icons/md";
import { FaShieldHalved } from "react-icons/fa6";
import { VscFeedback } from "react-icons/vsc";
import { FaCommentAlt } from "react-icons/fa";

export default function UserSettings() {
  return (
    <div className="md:h-[80vh] bg-gray-100 flex justify-center">
      <div className="container mx-auto p-5">
        <h1 className="text-5xl font-bold my-6 pb-6 text-gray-800">Settings</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-3 text-center">
          <Link
            to="/privacy-settings"
            className="bg-yellow-100 p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            {" "}
            <FaShieldHalved
              className="text-yellow-600 mb-2 mx-auto"
              size={40}
            />
            <p className="text-gray-700 font-semibold">Privacy Settings</p>
            <p>Change Login Information and Password</p>
          </Link>
          <Link
            to="/user-feedback"
            className="bg-yellow-100 p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <VscFeedback className="text-yellow-600 mb-2 mx-auto" size={40} />
            <p className="text-gray-700 font-semibold">Send Feedback</p>
            <p>Give feedback about your experience</p>
          </Link>
          <Link
            to="/send-report"
            className="bg-yellow-100 p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            {" "}
            <MdOutlineReport
              className="text-yellow-600 mb-2 mx-auto"
              size={40}
            />
            <p className="text-gray-700 font-semibold">Send Report</p>
            <p>Found something that doesn't seem right?</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
