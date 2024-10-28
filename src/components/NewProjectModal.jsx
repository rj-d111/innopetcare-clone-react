import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  updateDoc,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const NewProjectModal = ({ show, onClose, onProjectCreate, project }) => {
  // Assuming handleSubmit, handleChange, and handleFileChange are defined here
  const [formData, setFormData] = useState({
    legalName: "",
    businessRegNumber: "",
    city: "",
    postalCode: "",
  });
  const [file, setFile] = useState(null);

  const auth = getAuth();
  console.log(auth.currentUser.uid);
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const projectData = {
        ...formData,
        approved: false, // Set approved to false by default
        timestamp: serverTimestamp(),
      };

      // Save project data to the "projects-waiting" collection
      const docRef = await addDoc(
        collection(db, "projects-waiting"),
        projectData
      );

      // Handle file upload if needed here (not implemented)
      if (file) {
        // Implement file upload logic (e.g., to Firebase Storage)
      }

      console.log("Project submitted successfully:", docRef.id);
      onProjectCreate(); // Callback to inform parent component about the new project
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-40">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <IoClose
          className="absolute top-2 right-2 text-2xl cursor-pointer"
          onClick={onClose}
        />
        <h2 className="text-xl font-semibold mb-4">Submit New Project</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="typeOfAdmin" className="block font-medium">
              Type of Admin
            </label>
            <select
              name="typeOfAdmin" // Add name here for controlled component
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              value={formData.typeOfAdmin}
              onChange={handleChange}
            >
              {/* <option value="">Select Admin Type</option>{" "} */}
              {/* Default option */}
              <option value="Veterinary Admin">Veterinary Admin</option>
              <option value="Animal Shelter Admin">Animal Shelter Admin</option>
            </select>
          </div>
          <div>
            <label htmlFor="legalName" className="block font-medium mb-1">
              Legal Name/Company Name
            </label>
            <input
              type="text"
              name="legalName"
              value={formData.legalName}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label
              htmlFor="businessRegNumber"
              className="block font-medium mb-1"
            >
              Business Registration Number
            </label>
            <input
              type="text"
              name="businessRegNumber"
              value={formData.businessRegNumber}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label htmlFor="city" className="block font-medium mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label htmlFor="postalCode" className="block font-medium mb-1">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <h3 className="text-lg font-semibold mb-4">Document and Policy</h3>
          <div className="mb-5">
            <label htmlFor="document" className="block text-gray-500 mb-2">
              Upload Document
            </label>
            <p className="text-sm text-gray-600 mb-2">
              You should upload these documents (PDF or image formats, .jpg,
              .png are accepted):
            </p>
            <ul className="list-disc list-inside mb-2">
              <li>Business Permit</li>
              <li>Veterinary Clinic License (For Veterinary only)</li>
              <li>Animal Welfare License (For Animal Shelter only)</li>
              <li>DTI Business Name</li>
              <li>Sanitary Permit</li>
              <li>Environmental Compliance</li>
              <li>Tax Identification Number (TIN)</li>
              <li>Bureau of Animal Industry Recognition</li>
              <li>Valid Identification (Government-Issued)</li>
            </ul>
            <input
              type="file"
              name="document"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              multiple
              required
              className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
            />
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
