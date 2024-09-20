import React from "react";

export default function ContentListingPage() {
  return (
    <div className="mt-10 md:m-10 space-y-5">
      <a
        class="py-2 px-10 rounded-full font-medium select-none border text-yellow-800 dark:text-white bg-white dark:bg-yellow-800 transition-colors hover:border-yellow-900 hover:bg-yellow-900 hover:text-white dark:hover:text-white"
        href="/options"
      >
        ⪻ Back
      </a>
      <h1 className="text-2xl md:text-3xl text-center font-bold">
        Visit Veterinary Clinics
      </h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <button className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-col items-center p-10">
            <img className="w-24 h-24 mb-3 shadow-lg" alt="Fort Deo"  src="/images/fort-deo.png" />
            <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                Fort Deo Animal Clinic
            </h5>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              111 Narra Road, San Pedro, Laguna
            </span>
            <div className="flex mt-4 md:mt-6">
              <a
                href="#"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Visit Now
              </a>
            </div>
          </div>
        </button>
        {/* Repeat the button component for other cards */}
      </div>

      <h1 className="text-2xl md:text-3xl text-center font-bold">
        Visit Animal Shelter
      </h1>
    </div>
  );
}
