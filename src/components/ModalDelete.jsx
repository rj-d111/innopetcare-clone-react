import React from "react";

const ModelDelete = ({ show, onClose, projectId, onDelete }) => {
  if (!show) return null;

  const handleDelete = () => {
    onDelete(projectId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Delete Project</h2>
        <p>Are you sure you want to delete this project?</p>
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg w-full font-semibold mt-4 transition duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ModelDelete;
