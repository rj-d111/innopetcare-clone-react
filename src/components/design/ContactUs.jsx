import React from "react";

export default function ContactUs() {
  return (
    <>
      <div className="p-6 md:max-w-md mx-auto bg-gray-100 shadow-md rounded-lg space-y-4">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-semibold">Contact Us Page</h2>
          <p className="text-sm text-gray-700">
            A “Contact Us” page is a section on a website that provides visitors
            with various ways to get in touch with the website owner or
            business. It typically includes contact information such as email
            addresses, phone numbers, physical addresses, social media accounts,
            and often a form for easy communication.
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Phone No.</label>
          <input
            type="text"
            id="phone"
            name="phone"
            placeholder="Enter your phone no. here"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email address here"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            placeholder="Enter your address here"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">
            Facebook Page Link
          </label>
          <input
            type="text"
            id="facebook"
            name="facebook"
            placeholder="Paste your Facebook link here"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">
            YouTube Channel Link
          </label>
          <input
            type="text"
            id="youtube"
            name="youtube"
            placeholder="Paste your YouTube channel link here"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Instagram Page Link</label>
          <input
            type="text"
            id="instagram"
            name="instagram"
            placeholder="Paste your Instagram link here"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
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
