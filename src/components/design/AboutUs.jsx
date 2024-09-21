import React from "react";

export default function AboutUs() {
  return (
    <>
      <div className="p-6 md:max-w-md mx-auto bg-gray-100 shadow-md rounded-lg space-y-4">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-semibold">About Us Page</h2>
          <p className="text-sm text-gray-700">
            The “About Us” page is designed to share the important story of who
            you are and what matters to us. It highlights the management system
            and lets customers know where you are located.
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter your title here"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            placeholder="Your description here"
            className="textarea textarea-sm w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
          ></textarea>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">About Us Picture</label>
          <input
            type="file"
            accept="image/*"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-yellow-300"
          />
        </div>

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
