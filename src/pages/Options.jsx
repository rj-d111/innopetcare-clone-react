import React from "react";

export default function Options() {
  return (
<div className="flex flex-col justify-center m-10">
  <a
    className="py-2 px-10 rounded-full font-medium select-none border text-yellow-800 dark:text-white bg-white dark:bg-yellow-800 transition-colors hover:border-yellow-900 hover:bg-yellow-900 hover:text-white dark:hover:text-white mb-4 self-start"
    href="/"
  >
    ⪻ Back
  </a>
  <div className="flex flex-col items-center justify-center">
    <div className="md:w-1/4">
      <img
        src="images/innopetcare-black.png"
        alt="InnoPetCare Logo"
        className="mb-4"
      />
    </div>
    <h2 className="text-lg font-semibold mb-6">How do you want to Login</h2>
    <div className="md:w-1/2 grid grid-cols-1 gap-6 md:grid-cols-2">
      <a href="/content-listing-page">
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col h-full">
          <img
            src="images/visitor.png"
            alt="Vet Clinic/Shelter Visitor"
            className="rounded-t-lg w-full object-cover object-top"
          />
          <h1 className="text-center mt-4">
            I'm a Vet Clinic/Shelter Visitor
          </h1>
        </div>
      </a>
      <a href="/login">
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col h-full">
          <img
            src="images/create-website.png"
            alt="Create Website"
            className="rounded-t-lg w-full object-cover object-top"
          />
          <h1 className="text-center mt-4">
            I want to create a new vet clinic/shelter website
          </h1>
        </div>
      </a>
    </div>
  </div>
</div>

  );
}
