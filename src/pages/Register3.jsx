import React, { useState } from "react";

export default function Register3({ adminType, setError }) {
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

  const onFileChange = (e) => {
    const { id, files } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: files[0],
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Validation: Ensure all required files are uploaded
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

    console.log("Form submitted successfully with files:", formData);
    // Handle file upload and form submission logic
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
          <label className="block text-gray-700">
            Veterinary Clinic License
          </label>
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
          <label className="block text-gray-700">
            Animal Welfare Certificate
          </label>
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
        <label className="block text-gray-700">
          DTI Business Name Registration
        </label>
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
        <label className="block text-gray-700">
          Environmental Compliance Certificate
        </label>
        <input
          type="file"
          id="environmentalCompliance"
          accept=".pdf, image/*"
          onChange={onFileChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">
          Tax Identification Number (TIN)
        </label>
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
        <label className="block text-gray-700">
          Valid Identification (Government-issued)
        </label>
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
