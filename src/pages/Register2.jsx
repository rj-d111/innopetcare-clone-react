import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register2({ setError, nextStep }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    legalName: "",
    businessRegNumber: "",
    city: "",
    postalCode: "",
  });

  const { firstName, lastName, legalName, businessRegNumber, city, postalCode } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
    setError(""); // Clear error on change
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Validation to ensure all fields are filled
    if (!firstName || !lastName || !legalName || !businessRegNumber || !city || !postalCode) {
      setError("Please fill all the required fields");
      return;
    }

    // Show success toast notification
    toast.success("Step 2 completed!");

    // Proceed with the next step
    nextStep();
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <h3 className="text-lg font-semibold mb-4">Business Information</h3>

        <div className="mb-5">
          <label htmlFor="firstName" className="block text-gray-500 mb-2">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={onChange}
            placeholder="Enter your first name"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="lastName" className="block text-gray-500 mb-2">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={onChange}
            placeholder="Enter your last name"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="legalName" className="block text-gray-500 mb-2">
            Legal Name/Company Name
          </label>
          <input
            type="text"
            id="legalName"
            value={legalName}
            onChange={onChange}
            placeholder="Enter your legal/company name"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="businessRegNumber" className="block text-gray-500 mb-2">
            Business Registration Number
          </label>
          <input
            type="text"
            id="businessRegNumber"
            value={businessRegNumber}
            onChange={onChange}
            placeholder="Enter your business registration number"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <h3 className="text-lg font-semibold mb-4">Billing Address</h3>

        <div className="mb-5">
          <label htmlFor="city" className="block text-gray-500 mb-2">
            City/Town
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={onChange}
            placeholder="Enter your city or town"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="postalCode" className="block text-gray-500 mb-2">
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            value={postalCode}
            onChange={onChange}
            placeholder="Enter your postal code"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full uppercase bg-yellow-600 text-white px-4 py-2 rounded-lg"
        >
          Next
        </button>
      </form>

      {/* Toast container to display toast notifications */}
      <ToastContainer />
    </>
  );
}
