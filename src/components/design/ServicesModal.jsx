import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase.js";
import { getAuth } from "firebase/auth";

export default function ServicesModal({ projectId, closeModal, onServiceAdded }) {
    const auth = getAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        await addDoc(collection(db, "services"), {
          title,
          description,
          projectId, // Save the projectId
          userId: auth.currentUser.uid, // Save the user's ID for reference
        });
        onServiceAdded(); // Notify parent component that a service was added
        closeModal(); // Close the modal
      } catch (error) {
        console.error("Error adding service:", error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="bg-black bg-opacity-50 fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-lg font-bold mb-4">Add a Service</h2>
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
                disabled={loading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                {loading ? "Saving..." : "Save Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  