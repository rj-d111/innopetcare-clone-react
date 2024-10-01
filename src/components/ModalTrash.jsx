import React from "react";
import { FaTrashAlt } from "react-icons/fa";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase"; // Firestore instance
import { toast } from "react-toastify";

const ModalTrash = ({ show, onClose, projectId, onDelete }) => {
  const handleDelete = async () => {
    if (!projectId) {
        console.error("Project ID is null or undefined");
        return;
    }

    try {
        const projectRef = doc(db, "projects", projectId);
        await deleteDoc(projectRef);
        onDelete(projectId); // Callback to update the UI after deletion
        toast.success("Project deleted successfully");
        onClose();
    } catch (error) {
        console.error("Error deleting project: ", error);
        toast.error("Failed to delete the project. Please try again.");
    }
};

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-red-600">
          <FaTrashAlt className="inline mr-2" /> Delete Project
        </h2>
        <p>Are you sure you want to delete this project? This action cannot be undone.</p>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg mr-2">
            Cancel
          </button>
          <button onClick={handleDelete} className="bg-red-600 text-white py-2 px-4 rounded-lg">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTrash;
