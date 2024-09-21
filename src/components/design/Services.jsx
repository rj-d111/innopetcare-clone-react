import React from "react";

export default function Services() {
  return (
    <>
      <div className="p-6 md:max-w-md mx-auto bg-gray-100 shadow-md rounded-lg space-y-4 min-h-screen">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-semibold">Services Page</h2>
          <p className="text-sm text-gray-700">
            The "Services page" typically outlines the various features and
            functionalities that the CMS offers to help manage a veterinary
            practice or animal care facility.
          </p>
        </div>

        <div className="bg-white h-40 text-sm text-gray-600 flex items-center justify-center">
            You don't have currenly added services here
        </div>
        <button
          type="button"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-3 rounded-full font-semibold transition duration-200 ease-in-out active:bg-yellow-800 shadow-md hover:shadow-lg active:shadow-lg"
        >
          + Add Services
        </button>   

        <button
          type="button"
          className="w-full uppercase bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-800 shadow-md hover:shadow-lg active:shadow-lg"
        >
          Save Changes
        </button>
      </div>
    </>
  );
}
