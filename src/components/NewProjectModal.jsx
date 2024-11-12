import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { db, storage } from "../firebase";
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { toast } from 'react-toastify';
import Spinner from './Spinner'; // Import your Spinner component
import { useNavigate } from 'react-router';

export default function NewProjectModal({ show, onClose, onProjectCreate }) {
  const { currentUser } = getAuth();
  const [formData, setFormData] = useState({
    typeOfAdmin: '',
    legalName: '',
    businessRegNumber: '',
    city: '',
    postalCode: '',
  });
  const navigate = useNavigate();
  const [documentFiles, setDocumentFiles] = useState([]);
  const [loading, setLoading] = useState(false); // State to manage loading

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setDocumentFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading spinner
  
    const projectData = {
      type: formData.typeOfAdmin == "Veterinary Admin" ? "Veterinary Site": "Animal Shelter Site", 
      businessRegNumber: formData.businessRegNumber,
      city: formData.city,
      postalCode: formData.postalCode,
      status: "pending",
      createdAt: serverTimestamp(),
      userId: currentUser.uid,
      name: formData.legalName,
    };
  
    try {
      const uploadedFiles = [];
      // Upload all document files to Firebase storage
      for (const file of documentFiles) {
        const fileRef = ref(storage, `project-documents/${currentUser.uid}/${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        uploadedFiles.push({ name: file.name, url });
      }
  
      projectData.documentFiles = uploadedFiles;
  
      // Upload to /projects collection
      const newProjectRef = await addDoc(collection(db, "projects-waiting"), {
        ...projectData,
      });
  
      // Create a notification for the user
      const notificationData = {
        message: `Your document, ${formData.typeOfAdmin} for ${formData.legalName}, has been submitted and is currently pending review.`,
        read: false,
        timestamp: serverTimestamp(),
        type: "project",
      };
  
      // Store notification in /notifications-users/{userId}/notifications
      const notificationRef = collection(db, `notifications-users/${currentUser.uid}/notifications`);
      await addDoc(notificationRef, notificationData);
  
      // Show success message and navigate
      toast.success("Project submitted successfully!");
      onClose(); // Close modal on successful submit
    } catch (error) {
      console.error("Error uploading project:", error);
      toast.error("Failed to submit project. Please try again.");
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };
  

  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-40 ${show ? '' : 'hidden'}`}>
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <IoClose
          className="absolute top-2 right-2 text-2xl cursor-pointer"
          onClick={onClose}
        />
        <h2 className="text-xl font-semibold mb-4">Submit New Project</h2>
        {loading ? (
          <Spinner /> // Show Spinner while loading
        ) : (
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="typeOfAdmin" className="block font-medium">
                Type of Admin
              </label>
              <select
                name="typeOfAdmin"
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                value={formData.typeOfAdmin}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Type</option>
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
              <label htmlFor="businessRegNumber" className="block font-medium mb-1">
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
        )}
      </div>
    </div>
  );
}
