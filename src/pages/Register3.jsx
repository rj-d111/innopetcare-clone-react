import React, { useState } from "react";
import { FaFilePdf, FaFileWord, FaFile } from "react-icons/fa";
import { FaFileCirclePlus } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner.jsx";

function Register3({ formData, onChange, onPrevious, onSubmit }) {
  const [fileCount, setFileCount] = useState(formData.document.length);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const updatedFiles = [...formData.document, ...newFiles];

    setFileCount(updatedFiles.length);
    onChange(updatedFiles); // Pass the updated file array directly
  };

  const handleRemoveFile = (index) => {
    const fileName = formData.document[index].name; // Get the file name to display in the toast
    const updatedFiles = formData.document.filter((_, i) => i !== index);
    setFileCount(updatedFiles.length);
    onChange(updatedFiles); // Update with the remaining files directly

    // Show success message with file name
    toast.success(`${fileName} removed successfully`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (fileCount === 0) {
      toast.error("Please upload documents.");
      return;
    }

    if (!agreeTerms) {
      toast.error("Please agree to the Terms and Conditions.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onSubmit();
      setLoading(false);
    }, 1500); // Simulate loading delay for demonstration
  };

  return (
    <>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <h3 className="text-lg font-semibold mb-4">Document and Policy</h3>
        <div className="mb-5">
          <label htmlFor="document" className="block text-gray-500 mb-2">
            Upload Document
          </label>
          <p className="text-sm text-gray-600 mb-2">
            You should upload these documents (PDF or image formats, .jpg, .png
            are accepted):
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
          <div className="mt-3">
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
            >
              <FaFileCirclePlus className="mr-2 text-lg" />
              Choose Files
            </label>
            <input
              id="file-upload"
              type="file"
              name="document"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
          </div>
          <p className="text-sm text-gray-700 mt-2">
            {fileCount > 0
              ? `${fileCount} file(s) selected`
              : "No files selected"}
          </p>

          <div className="mt-3 space-y-2">
            {formData.document &&
              formData.document.map((file, index) => {
                const extension = file.name.split(".").pop().toLowerCase();

                return (
                  <div
                    key={index}
                    className="flex items-center p-2 border border-gray-300 rounded-lg shadow-sm"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                      {file.type.includes("image") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="file preview"
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : extension === "pdf" ? (
                        <FaFilePdf className="text-red-500 text-3xl" />
                      ) : extension === "docx" || extension === "doc" ? (
                        <FaFileWord className="text-blue-500 text-3xl" />
                      ) : (
                        <FaFile className="text-gray-500 text-3xl" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-700">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Back button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onPrevious}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
          >
            Back
          </button>
        </div>

        {/* Terms and Conditions checkbox */}
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
              required
              className="form-checkbox h-5 w-5 text-yellow-600"
            />
            <span className="ml-2 text-gray-700 text-sm">
              I agree to the{" "}
              <Link
                to="/terms-and-conditions"
                target="_blank"
                className="text-yellow-500 hover:underline"
              >
                Terms and Conditions
              </Link>
            </span>
          </label>
        </div>

        {/* Submit button */}
        <div className="mt-4">
          <button
            type="submit"
            className={`w-full uppercase text-white px-4 py-2 rounded-lg flex items-center justify-center ${
              loading ? "bg-gray-400" : "bg-yellow-600"
            }`}
            disabled={loading} // Correct way to conditionally disable the button
          >
            {loading ? (
              <>
                <Spinner />{" "}
                {/* Assuming Spinner is an icon or loading component */}
                <span>Uploading Files Please wait...</span>
              </>
            ) : (
              "Next"
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default Register3;
