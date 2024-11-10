import React, { useState, useEffect } from "react";
import { addDoc, updateDoc, doc, collection } from "firebase/firestore";
import { db } from "../../firebase.js";
import { getAuth } from "firebase/auth";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export default function ServicesModal({ projectId, closeModal, onServiceAdded, selectedService }) {
  const auth = getAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Pre-fill the form if editing a service
  useEffect(() => {
    if (selectedService) {
      setTitle(selectedService.title);
      setDescription(selectedService.description);
    } else {
      setTitle("");
      setDescription("");
    }
  }, [selectedService]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedService) {
        // If editing, update the existing service
        const serviceDocRef = doc(db, "services", selectedService.id);
        await updateDoc(serviceDocRef, { title, description });
        toast.success(`${title} successfully updated`); // Show success toast
      } else {
        // If adding new, create a new service
        await addDoc(collection(db, "services"), {
          title,
          description,
          projectId, // Save the projectId
          userId: auth.currentUser.uid, // Save the user's ID for reference
        });
        toast.success("Service successfully added"); // Show success toast
      }

      onServiceAdded(); // Notify parent component that a service was added/updated
      closeModal(); // Close the modal
    } catch (error) {
      console.error("Error adding/updating service:", error);
    }
  };

  return (
    <div className="bg-black bg-opacity-50 fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        {/* Close Button */}
        <IoClose
          className="text-red-600 text-2xl absolute top-4 right-4 cursor-pointer"
          onClick={closeModal}  // Use closeModal to close the modal
        />
        <h2 className="text-lg font-bold mb-4">
          {selectedService ? "Edit Service" : "Add a Service"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              {selectedService ? "Update Service" : "Save Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
