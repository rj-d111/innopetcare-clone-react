import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { db, storage } from "../firebase"; // Import initialized Firestore and Storage from firebase.js
import { v4 as uuidv4 } from "uuid"; // For generating unique file names

export default function Register3({ adminType, setError, userId }) {
  const [formData, setFormData] = useState({
    businessPermit: null,
    veterinaryClinicLicense: null,
    dtiBusinessName: null,
    sanitaryPermit: null,
    environmentalCompliance: null,
    tin: null,
    animalIndustryRegistration: null,
    validId: null,
    welfareCertificate: null, // For Animal Shelter Admin
  });

  // Function to upload files to Firebase Storage
  const uploadFile = async (file) => {
    const storageRef = ref(storage, `users/${userId}/docs/${uuidv4()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef); // Return the URL of the uploaded file
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();

    // Validation to ensure all required files are uploaded
    if (
      !formData.businessPermit ||
      !formData.dtiBusinessName ||
      !formData.sanitaryPermit ||
      !formData.environmentalCompliance ||
      !formData.tin ||
      !formData.animalIndustryRegistration ||
      !formData.validId
    ) {
      setError("Please upload all required files.");
      return;
    }

    if (adminType === "Veterinary Admin" && !formData.veterinaryClinicLicense) {
      setError("Please upload your Veterinary Clinic License.");
      return;
    }

    if (adminType === "Animal Shelter Admin" && !formData.welfareCertificate) {
      setError("Please upload your Animal Welfare Certificate.");
      return;
    }

    try {
      // Upload all files to Firebase Storage
      const fileUploads = await Promise.all(
        Object.keys(formData).map(async (key) => {
          if (formData[key]) {
            return { [key]: await uploadFile(formData[key]) }; // Return the file URL for each field
          }
          return null;
        })
      );

      // Combine all file URLs into a single object
      const fileData = Object.assign({}, ...fileUploads);

      // Save data to Firestore
      await setDoc(doc(db, "users", userId), {
        ...fileData,
        adminType,
        userId,
      });

      console.log("Form submitted successfully with files:", fileData);
    } catch (error) {
      console.error("Error uploading files: ", error);
      setError("Failed to upload files.");
    }
  };

  // Handle file input changes
  const onFileChange = (e) => {
    const { id, files } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: files[0],
    }));
  };

  return (
    <form onSubmit={onSubmit} encType="multipart/form-data">
      <div className="mb-4">
        <label className="block text-gray-700">Business Permit</label>
        <input
          type="file"
          id="businessPermit"
          accept=".pdf, image/*"
          onChange={onFileChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {adminType === "Veterinary Admin" && (
        <div className="mb-4">
          <label className="block text-gray-700">Veterinary Clinic License</label>
          <input
            type="file"
            id="veterinaryClinicLicense"
            accept=".pdf, image/*"
            onChange={onFileChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      )}

      {adminType === "Animal Shelter Admin" && (
        <div className="mb-4">
          <label className="block text-gray-700">Animal Welfare Certificate</label>
          <input
            type="file"
            id="welfareCertificate"
            accept=".pdf, image/*"
            onChange={onFileChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700">DTI Business Name Registration</label>
        <input
          type="file"
          id="dtiBusinessName"
          accept=".pdf, image/*"
          onChange={onFileChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Sanitary Permit</label>
        <input
          type="file"
          id="sanitaryPermit"
          accept=".pdf, image/*"
          onChange={onFileChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Environmental Compliance Certificate</label>
        <input
          type="file"
          id="environmentalCompliance"
          accept=".pdf, image/*"
          onChange={onFileChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Tax Identification Number (TIN)</label>
        <input
          type="file"
          id="tin"
          accept=".pdf, image/*"
          onChange={onFileChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">
          Bureau of Animal Industry Registration
        </label>
        <input
          type="file"
          id="animalIndustryRegistration"
          accept=".pdf, image/*"
          onChange={onFileChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Valid Identification (Government-issued)</label>
        <input
          type="file"
          id="validId"
          accept=".pdf, image/*"
          onChange={onFileChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg"
      >
        Submit
      </button>
    </form>
  );
}
